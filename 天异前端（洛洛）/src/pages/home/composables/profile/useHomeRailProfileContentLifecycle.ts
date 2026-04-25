/**
 * Responsibility: coordinate profile rail first-screen initialization, refresh, active
 * checks, and visible-update checks for the profile page shell.
 * Out of scope: query watchers, visual reveal runtime, result-window timing, quick
 * actions, and template presentation.
 */
import type { ComputedRef, Ref } from 'vue'
import type { HomeRailProfileContent } from '../../../../models/home-rail/homeRailProfile.model'
import type {
  HomeRailProfileSceneModuleKey,
  HomeRailProfileAssetListResult,
  ResolveHomeRailProfileAssetListInput,
} from '../../../../services/home-rail/homeRailProfileContent.service'
import type {
  RailSceneResolvedContent,
  RailSceneResolvedMeta,
} from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import {
  hydrateProfileSceneFromPersistentCache,
  persistProfileSceneToPersistentCache,
  transitionHomeRailProfileUserScope,
} from '../../../../services/home-rail/homeRailPersistentCacheIntegration.service'
import {
  markHomeRailProfileSceneModulesDisplayed,
  resolveHomeRailProfileActivationUpdate,
  resolveHomeRailProfileVisibleUpdate,
  syncHomeRailProfileAssetQuerySnapshot,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'
import type { ProfileAssetResultMotionSource } from './useProfileAssetResultWindow'

type RailRefreshReason = 'pull-refresh'

interface UseHomeRailProfileContentLifecycleOptions {
  isActive: ComputedRef<boolean>
  hasResolvedInitialProfileContent: Ref<boolean>
  profileActivationCheckVersion: Ref<number>
  profileAssetQuerySignature: ComputedRef<string>
  profileAssetRefreshReplayRequestId: Ref<number>
  profileAssetVisibleCount: Ref<number>
  resolvedProfileAssetSource: ComputedRef<unknown[]>
  initialVisibleCount: number
  lastResolvedMeta: Ref<RailSceneResolvedMeta | null>
  clearProfileSearchState: (options: { collapse: boolean }) => void
  clearStagedAssetListUpdate: () => void
  beginProfileRefreshRun: () => number
  hydrateProfileContent: (options?: {
    force?: boolean
    preserveCurrentContentOnError?: boolean
    refreshRunId?: number
    resetAssetProjection?: boolean
    applyResolvedContent?: boolean
  }) => Promise<RailSceneResolvedContent<HomeRailProfileContent> | null>
  applyProfileContent: (
    nextContent: HomeRailProfileContent,
    options?: { resetAssetProjection?: boolean; replayAssetsAsRefresh?: boolean }
  ) => void
  syncDisplayedProfileSceneSnapshot: (
    resolved: RailSceneResolvedContent<HomeRailProfileContent>
  ) => void
  reloadProfileAssetListAndApply: (options?: {
    force?: boolean
    replay?: boolean
    motionSource?: ProfileAssetResultMotionSource
  }) => Promise<HomeRailProfileAssetListResult | null>
  startProfilePullRefreshPresentation: (
    runner: (presentationRunId: number) => Promise<void>
  ) => void
  waitForProfileRefreshPresentationSettled: (
    targetReplayRequestId: number,
    targetPresentationRunId: number
  ) => Promise<void>
  applyProfileSceneModules: (
    modules: HomeRailProfileSceneModuleKey[],
    nextContent: HomeRailProfileContent,
    options: { origin: 'visible' | 'activation' }
  ) => { appliedModules: HomeRailProfileSceneModuleKey[] }
  consumeStagedAssetListUpdate: (
    currentQuerySignature: string
  ) => { payload: HomeRailProfileAssetListResult } | null
  applyResolvedProfileAssetList: (
    result: HomeRailProfileAssetListResult,
    options?: { replay?: boolean; motionSource?: ProfileAssetResultMotionSource }
  ) => void
  stageAssetListUpdate: (
    querySignature: string,
    payload: HomeRailProfileAssetListResult,
    origin: 'visible-update' | 'activation-apply'
  ) => void
  logProfileRefreshDebug: (message: string, detail?: unknown) => void
  hydrateRemoteProfileAssetListFromPersistentCache: (
    query: ResolveHomeRailProfileAssetListInput
  ) => Promise<HomeRailProfileAssetListResult | null>
  resolveProfileAssetQuerySnapshot: () => ResolveHomeRailProfileAssetListInput
  resetProfileAssetVisibleCount: () => void
  scheduleProfileLoadMoreObserver: () => void
}

export const useHomeRailProfileContentLifecycle = (
  options: UseHomeRailProfileContentLifecycleOptions
) => {
  const refreshContent = async (params: { force?: boolean; reason?: RailRefreshReason } = {}) => {
    const refreshRunId = options.beginProfileRefreshRun()
    const refreshReason = params.reason ?? 'pull-refresh'
    options.clearStagedAssetListUpdate()

    if (refreshReason === 'pull-refresh') {
      options.clearProfileSearchState({ collapse: true })
    }

    const nextResolved = await options.hydrateProfileContent({
      force: params.force ?? true,
      preserveCurrentContentOnError: true,
      refreshRunId,
      applyResolvedContent: false,
    })
    if (!nextResolved) {
      return
    }

    const requestUserScope = transitionHomeRailProfileUserScope(
      nextResolved.content.summary.address
    )
    options.applyProfileContent(nextResolved.content)
    options.syncDisplayedProfileSceneSnapshot(nextResolved)
    await persistProfileSceneToPersistentCache(nextResolved, requestUserScope)
    if (refreshReason === 'pull-refresh') {
      options.startProfilePullRefreshPresentation(async (presentationRunId) => {
        await options.reloadProfileAssetListAndApply({
          force: true,
          replay: true,
          motionSource: 'manual-refresh',
        })
        await options.waitForProfileRefreshPresentationSettled(
          options.profileAssetRefreshReplayRequestId.value,
          presentationRunId
        )
      })
    }
  }

  const runProfileActivationCheck = async (params: { allowNetworkFallback?: boolean } = {}) => {
    if (!options.hasResolvedInitialProfileContent.value) {
      return
    }

    const activationVersion = options.profileActivationCheckVersion.value + 1
    options.profileActivationCheckVersion.value = activationVersion
    const update = await resolveHomeRailProfileActivationUpdate(params)
    if (
      !options.isActive.value ||
      options.profileActivationCheckVersion.value !== activationVersion
    ) {
      return
    }

    if (update.scene) {
      transitionHomeRailProfileUserScope(update.scene.content.summary.address)
      const { appliedModules } = options.applyProfileSceneModules(
        update.sceneChangedModules,
        update.scene.content,
        {
          origin: 'activation',
        }
      )
      if (appliedModules.length > 0) {
        markHomeRailProfileSceneModulesDisplayed(update.scene, appliedModules)
      }
    }

    const stagedAssetList = options.consumeStagedAssetListUpdate(
      options.profileAssetQuerySignature.value
    )
    const assetListUpdate = stagedAssetList?.payload ?? update.assetList
    if (assetListUpdate) {
      options.applyResolvedProfileAssetList(assetListUpdate, {
        motionSource: 'activation-apply',
      })
      options.logProfileRefreshDebug('applied asset list update', {
        origin: 'activation',
        visualUpdate: 'stale-apply',
        count: assetListUpdate.items.length,
      })
    }
  }

  const runProfileVisibleUpdateCheck = () => {
    if (!options.isActive.value || !options.hasResolvedInitialProfileContent.value) {
      return
    }

    const update = resolveHomeRailProfileVisibleUpdate()
    if (update.scene) {
      transitionHomeRailProfileUserScope(update.scene.content.summary.address)
      const { appliedModules } = options.applyProfileSceneModules(
        update.sceneChangedModules,
        update.scene.content,
        {
          origin: 'visible',
        }
      )
      if (appliedModules.length > 0) {
        markHomeRailProfileSceneModulesDisplayed(update.scene, appliedModules)
      }
    }

    if (update.assetList) {
      options.stageAssetListUpdate(
        options.profileAssetQuerySignature.value,
        update.assetList,
        'visible-update'
      )
      options.logProfileRefreshDebug('staged asset list update', {
        origin: 'visible',
        visualUpdate: 'stale-only',
        count: update.assetList.items.length,
      })
    }
  }

  const initializeProfileContent = async () => {
    const cachedScene = await hydrateProfileSceneFromPersistentCache()
    if (cachedScene) {
      options.applyProfileContent(cachedScene.content, { resetAssetProjection: true })
      options.syncDisplayedProfileSceneSnapshot(cachedScene)
    }
    const querySnapshot = options.resolveProfileAssetQuerySnapshot()
    syncHomeRailProfileAssetQuerySnapshot(querySnapshot)
    const cachedList = await options.hydrateRemoteProfileAssetListFromPersistentCache(querySnapshot)
    if (cachedList) {
      options.applyResolvedProfileAssetList(cachedList, {
        motionSource: 'initial-enter',
      })
    }

    const initialResolved = await options.hydrateProfileContent()
    if (initialResolved) {
      const requestUserScope = transitionHomeRailProfileUserScope(
        initialResolved.content.summary.address
      )
      options.syncDisplayedProfileSceneSnapshot(initialResolved)
      await persistProfileSceneToPersistentCache(initialResolved, requestUserScope)
    } else if (!cachedScene) {
      return
    }

    syncHomeRailProfileAssetQuerySnapshot(options.resolveProfileAssetQuerySnapshot())
    options.resetProfileAssetVisibleCount()
    await options.reloadProfileAssetListAndApply({ motionSource: 'initial-enter', force: false })
    options.profileAssetVisibleCount.value = Math.min(
      options.initialVisibleCount,
      Math.max(options.resolvedProfileAssetSource.value.length, 0)
    )
    options.scheduleProfileLoadMoreObserver()
  }

  return {
    refreshContent,
    runProfileActivationCheck,
    runProfileVisibleUpdateCheck,
    initializeProfileContent,
  }
}
