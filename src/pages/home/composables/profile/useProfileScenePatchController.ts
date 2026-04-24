/**
 * Responsibility: coordinate profile scene shell hydration, partial scene-module patching,
 * and scene snapshot sync for the profile rail.
 * Out of scope: asset query scheduling, result-window timing, visual reveal runtime, and
 * panel-level refresh presentation orchestration.
 */
import { computed, ref, type Ref } from 'vue'
import {
  createHomeRailProfileContentShell,
  resolveHomeRailProfileContent,
  type HomeRailProfileSceneModuleKey,
} from '../../../../services/home-rail/homeRailProfileContent.service'
import {
  type RailSceneResolvedContent,
  type RailSceneResolvedMeta,
} from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import { syncHomeRailProfileSceneSnapshot } from '../../../../services/home-rail/homeRailUpdateCoordinator.service'
import type {
  HomeRailProfileContent,
  ProfileCategoryKey,
} from '../../../../models/home-rail/homeRailProfile.model'
import { logSafeError } from '../../../../utils/safeLogger.util'

interface UseProfileScenePatchControllerOptions {
  activeCategory: Ref<ProfileCategoryKey>
  activeSubCategory: Ref<string>
  syncProfileFilters: () => void
  canApplyProfileCategoryConfigLive: (nextContent: HomeRailProfileContent) => boolean
  resetProfileAssetProjection: () => void
  reconcileProfileAssetRender: () => void
  logProfileRefreshDebug: (message: string, detail?: unknown) => void
}

export const useProfileScenePatchController = ({
  activeCategory,
  activeSubCategory,
  syncProfileFilters,
  canApplyProfileCategoryConfigLive,
  resetProfileAssetProjection,
  reconcileProfileAssetRender,
  logProfileRefreshDebug,
}: UseProfileScenePatchControllerOptions) => {
  const content = ref<HomeRailProfileContent>(createHomeRailProfileContentShell())
  const hasResolvedInitialProfileContent = ref(false)
  const lastResolvedMeta = ref<RailSceneResolvedMeta | null>(null)
  const profileContentRequestVersion = ref(0)

  const resolvedProfileCategories = computed(() => content.value.categories)
  const currentCategoryAssets = computed(() => {
    return content.value.assets[activeCategory.value] ?? []
  })

  const syncDisplayedProfileSceneSnapshot = (
    resolved: RailSceneResolvedContent<HomeRailProfileContent>
  ) => {
    syncHomeRailProfileSceneSnapshot(resolved)
  }

  const applyProfileContent = (
    nextContent: HomeRailProfileContent,
    options: { resetAssetProjection?: boolean; replayAssetsAsRefresh?: boolean } = {}
  ) => {
    if (options.resetAssetProjection) {
      resetProfileAssetProjection()
    }

    content.value = nextContent
    hasResolvedInitialProfileContent.value = true

    if (options.resetAssetProjection) {
      syncProfileFilters()
      reconcileProfileAssetRender()
    }
  }

  const applyProfileSceneModules = (
    modules: HomeRailProfileSceneModuleKey[],
    nextContent: HomeRailProfileContent,
    options: { origin: 'visible' | 'activation' }
  ) => {
    const appliedModules: HomeRailProfileSceneModuleKey[] = []
    const skippedModules: HomeRailProfileSceneModuleKey[] = []
    let nextProfileContent = content.value
    let shouldPatchSummary = false
    let shouldPatchCategories = false
    let shouldPatchSubCategories = false

    const mergeProfileCategories = () => {
      const nextCategoriesById = new Map(nextContent.categories.map((item) => [item.id, item]))
      return nextContent.categories.map((nextCategory) => {
        const currentCategory = content.value.categories.find((item) => item.id === nextCategory.id)
        if (!currentCategory) {
          return {
            ...nextCategory,
            subCategories: [...nextCategory.subCategories],
          }
        }

        return {
          ...currentCategory,
          id: nextCategory.id,
          label: shouldPatchCategories ? nextCategory.label : currentCategory.label,
          subCategories: shouldPatchSubCategories
            ? [...nextCategoriesById.get(nextCategory.id)!.subCategories]
            : [...currentCategory.subCategories],
        }
      })
    }

    modules.forEach((moduleKey) => {
      if (moduleKey === 'summary') {
        nextProfileContent = { ...nextProfileContent, summary: nextContent.summary }
        shouldPatchSummary = true
        appliedModules.push(moduleKey)
        return
      }

      if (moduleKey === 'categories') {
        if (options.origin === 'visible' && !canApplyProfileCategoryConfigLive(nextContent)) {
          skippedModules.push(moduleKey)
          return
        }
        shouldPatchCategories = true
        appliedModules.push(moduleKey)
        return
      }

      if (moduleKey === 'subCategories') {
        if (options.origin === 'visible' && !canApplyProfileCategoryConfigLive(nextContent)) {
          skippedModules.push(moduleKey)
          return
        }
        shouldPatchSubCategories = true
        appliedModules.push(moduleKey)
      }
    })

    if (!appliedModules.length) {
      if (skippedModules.length > 0) {
        logProfileRefreshDebug('deferred profile scene modules', {
          origin: options.origin,
          modules: skippedModules,
        })
      }
      return { appliedModules, skippedModules }
    }

    if (shouldPatchSummary) {
      nextProfileContent = { ...nextProfileContent, summary: nextContent.summary }
    }

    if (shouldPatchCategories || shouldPatchSubCategories) {
      nextProfileContent = {
        ...nextProfileContent,
        categories: mergeProfileCategories(),
      }
    }

    content.value = nextProfileContent
    hasResolvedInitialProfileContent.value = true
    syncProfileFilters()

    if (appliedModules.includes('summary')) {
      logProfileRefreshDebug('applied profile scene module', {
        module: 'summary',
        origin: options.origin,
        visualUpdate: 'patch',
      })
    }

    if (appliedModules.includes('categories')) {
      logProfileRefreshDebug('applied profile scene module', {
        module: 'categories',
        origin: options.origin,
        visualUpdate: 'patch',
        activeCategory: activeCategory.value,
      })
    }

    if (appliedModules.includes('subCategories')) {
      logProfileRefreshDebug('applied profile scene module', {
        module: 'subCategories',
        origin: options.origin,
        visualUpdate: 'patch',
        activeSubCategory: activeSubCategory.value,
      })
    }

    if (skippedModules.length > 0) {
      logProfileRefreshDebug('deferred profile scene modules', {
        origin: options.origin,
        modules: skippedModules,
      })
    }

    return { appliedModules, skippedModules }
  }

  const hydrateProfileContent = async (
    options: {
      force?: boolean
      preserveCurrentContentOnError?: boolean
      refreshRunId?: number
      resetAssetProjection?: boolean
      applyResolvedContent?: boolean
      currentRefreshRunId?: number
    } = {}
  ): Promise<RailSceneResolvedContent<HomeRailProfileContent> | null> => {
    const requestVersion = profileContentRequestVersion.value + 1
    profileContentRequestVersion.value = requestVersion
    const expectedRefreshRunId =
      options.refreshRunId ?? (options.force ? (options.currentRefreshRunId ?? 0) : 0)

    try {
      const nextResolved = await resolveHomeRailProfileContent({ force: options.force })
      if (
        profileContentRequestVersion.value !== requestVersion ||
        (options.force &&
          typeof options.currentRefreshRunId === 'number' &&
          options.currentRefreshRunId !== expectedRefreshRunId)
      ) {
        return null
      }

      if (options.applyResolvedContent !== false) {
        applyProfileContent(nextResolved.content, {
          resetAssetProjection: options.resetAssetProjection,
        })
        lastResolvedMeta.value = nextResolved.meta
      }

      return nextResolved
    } catch (error) {
      logSafeError('homeRail.profile', error, {
        message: 'failed to resolve profile scene content',
      })
      if (
        profileContentRequestVersion.value !== requestVersion ||
        (options.force &&
          typeof options.currentRefreshRunId === 'number' &&
          options.currentRefreshRunId !== expectedRefreshRunId)
      ) {
        return null
      }

      hasResolvedInitialProfileContent.value = true
      if (!options.preserveCurrentContentOnError) {
        applyProfileContent(createHomeRailProfileContentShell())
        lastResolvedMeta.value = null
      }
      return null
    } finally {
      syncProfileFilters()
    }
  }

  return {
    content,
    hasResolvedInitialProfileContent,
    lastResolvedMeta,
    resolvedProfileCategories,
    currentCategoryAssets,
    applyProfileContent,
    applyProfileSceneModules,
    hydrateProfileContent,
    syncDisplayedProfileSceneSnapshot,
  }
}
