/**
 * Responsibility: coordinate activity scene shell hydration, partial scene-module patching,
 * and displayed scene snapshot sync for the activity rail.
 * Out of scope: notice query scheduling, result-window timing, visual reveal runtime, and
 * page-level refresh presentation orchestration.
 */
import { computed, ref } from 'vue'
import {
  createHomeRailActivityContentShell,
  resolveHomeRailActivityContent,
  type HomeRailActivitySceneModuleKey,
} from '../../../../services/home-rail/homeRailActivityContent.service'
import type { HomeRailActivityContent } from '../../../../models/home-rail/homeRailActivity.model'
import {
  syncHomeRailActivitySceneSnapshot,
  markHomeRailActivitySceneModulesDisplayed,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'
import type {
  RailSceneResolvedContent,
  RailSceneResolvedMeta,
} from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import { logSafeError } from '../../../../utils/safeLogger.util'

interface UseActivityScenePatchControllerOptions {
  syncActiveTag: () => void
  triggerScenePatchMotionReduction: (modules: HomeRailActivitySceneModuleKey[]) => void
  logActivityRefreshDebug: (message: string, detail?: unknown) => void
}

export const useActivityScenePatchController = ({
  syncActiveTag,
  triggerScenePatchMotionReduction,
  logActivityRefreshDebug,
}: UseActivityScenePatchControllerOptions) => {
  const activityContent = ref<HomeRailActivityContent>(createHomeRailActivityContentShell())
  const lastResolvedMeta = ref<RailSceneResolvedMeta | null>(null)
  const hasResolvedInitialActivityContent = ref(false)
  const activityContentRequestVersion = ref(0)

  const assetMergeEntry = computed(() =>
    activityContent.value.entries.find(
      (entry: HomeRailActivityContent['entries'][number]) => entry.id === 'asset-merge'
    )
  )
  const priorityDrawEntry = computed(() =>
    activityContent.value.entries.find(
      (entry: HomeRailActivityContent['entries'][number]) => entry.id === 'priority-draw'
    )
  )
  const networkInviteEntry = computed(() =>
    activityContent.value.entries.find(
      (entry: HomeRailActivityContent['entries'][number]) => entry.id === 'network-invite'
    )
  )

  const syncDisplayedActivitySceneSnapshot = (
    resolved: RailSceneResolvedContent<HomeRailActivityContent>
  ) => {
    syncHomeRailActivitySceneSnapshot(resolved)
  }

  const applyActivityContent = (nextContent: HomeRailActivityContent) => {
    activityContent.value = nextContent
    hasResolvedInitialActivityContent.value = true
    syncActiveTag()
  }

  const applyActivitySceneModules = (
    modules: HomeRailActivitySceneModuleKey[],
    nextContent: HomeRailActivityContent,
    options: { origin: 'visible' | 'activation' }
  ) => {
    if (!modules.length) {
      return { appliedModules: [] as HomeRailActivitySceneModuleKey[] }
    }

    let nextPatchedContent = activityContent.value
    const appliedModules: HomeRailActivitySceneModuleKey[] = []

    modules.forEach((moduleKey) => {
      if (moduleKey === 'leadEntry') {
        nextPatchedContent = { ...nextPatchedContent, entries: nextContent.entries }
        appliedModules.push(moduleKey)
        return
      }
      if (moduleKey === 'drawEntry') {
        nextPatchedContent = { ...nextPatchedContent, entries: nextContent.entries }
        appliedModules.push(moduleKey)
        return
      }
      if (moduleKey === 'inlineEntry') {
        nextPatchedContent = { ...nextPatchedContent, entries: nextContent.entries }
        appliedModules.push(moduleKey)
        return
      }
      if (moduleKey === 'entryShell') {
        nextPatchedContent = { ...nextPatchedContent, entries: nextContent.entries }
        appliedModules.push(moduleKey)
        return
      }
      if (moduleKey === 'noticeTags') {
        nextPatchedContent = {
          ...nextPatchedContent,
          notices: {
            ...nextPatchedContent.notices,
            tags: nextContent.notices.tags,
          },
        }
        appliedModules.push(moduleKey)
        return
      }
    })

    if (!appliedModules.length) {
      return { appliedModules }
    }

    activityContent.value = nextPatchedContent
    hasResolvedInitialActivityContent.value = true
    syncActiveTag()
    triggerScenePatchMotionReduction(appliedModules)
    logActivityRefreshDebug('applied scene modules', {
      origin: options.origin,
      modules: appliedModules,
    })
    return { appliedModules }
  }

  const hydrateActivityContent = async (
    options: {
      force?: boolean
      preserveCurrentContentOnError?: boolean
      applyResolvedContent?: boolean
    } = {}
  ): Promise<RailSceneResolvedContent<HomeRailActivityContent> | null> => {
    const requestVersion = activityContentRequestVersion.value + 1
    activityContentRequestVersion.value = requestVersion
    try {
      const nextResolved = await resolveHomeRailActivityContent({ force: options.force })
      if (activityContentRequestVersion.value !== requestVersion) {
        return null
      }
      if (options.applyResolvedContent !== false) {
        applyActivityContent(nextResolved.content)
        lastResolvedMeta.value = nextResolved.meta
      }
      return nextResolved
    } catch (error) {
      if (activityContentRequestVersion.value !== requestVersion) {
        return null
      }
      logSafeError('homeRail.activity', error, {
        message: 'failed to resolve activity scene content',
      })
      if (!options.preserveCurrentContentOnError) {
        applyActivityContent(createHomeRailActivityContentShell())
        lastResolvedMeta.value = null
      }
      hasResolvedInitialActivityContent.value = true
      return null
    }
  }

  const markAppliedModulesDisplayed = (
    resolved: RailSceneResolvedContent<HomeRailActivityContent>,
    modules: HomeRailActivitySceneModuleKey[]
  ) => {
    if (!modules.length) {
      return
    }
    markHomeRailActivitySceneModulesDisplayed(resolved, modules)
  }

  return {
    activityContent,
    hasResolvedInitialActivityContent,
    lastResolvedMeta,
    assetMergeEntry,
    priorityDrawEntry,
    networkInviteEntry,
    applyActivityContent,
    applyActivitySceneModules,
    hydrateActivityContent,
    syncDisplayedActivitySceneSnapshot,
    markAppliedModulesDisplayed,
  }
}
