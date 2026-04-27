/**
 * Responsibility: coordinate activity rail first-screen initialization, refresh, active
 * checks, and visible-update checks for the activity page shell.
 * Out of scope: query watchers, presentation derivation, navigation links, result-window
 * timing, and visual reveal runtime.
 */
import type { ComputedRef, Ref } from 'vue'
import type {
  ActivityNoticeListResult,
  HomeRailActivityContent,
} from '../../../../models/home-rail/homeRailActivity.model'
import {
  hydrateActivitySceneFromPersistentCache,
  persistActivitySceneToPersistentCache,
} from '../../../../services/home-rail/homeRailPersistentCacheIntegration.service'
import {
  resolveHomeRailActivityActivationUpdate,
  resolveHomeRailActivityVisibleUpdate,
  syncHomeRailActivityNoticeQuerySnapshot,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'
import type { HomeRailActivitySceneModuleKey } from '../../../../services/home-rail/homeRailActivityContent.service'
import type { RailSceneResolvedContent } from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import type { ResultLoadSource } from '../../../../services/home-rail/homeRailResultWindow.service'
import type {
  ActivityNoticeQuerySnapshot,
  ActivityNoticeRemoteListResult,
} from './useActivityNoticeRemoteListState'

type RailRefreshReason = 'pull-refresh'
type ActivityNoticeMotionSource = ResultLoadSource

interface UseHomeRailActivityContentLifecycleOptions {
  isActive: ComputedRef<boolean>
  hasResolvedInitialActivityContent: Ref<boolean>
  activityActivationCheckVersion: Ref<number>
  noticeListQuerySignature: ComputedRef<string>
  noticeRefreshReplayRequestId: Ref<number>
  clearNoticeSearchState: (options: { collapse: boolean }) => void
  clearStagedNoticeListUpdate: () => void
  beginActivityRefreshRun: () => number
  hydrateActivityContent: (options?: {
    force?: boolean
    preserveCurrentContentOnError?: boolean
    applyResolvedContent?: boolean
  }) => Promise<RailSceneResolvedContent<HomeRailActivityContent> | null>
  applyActivityContent: (nextContent: HomeRailActivityContent) => void
  syncDisplayedActivitySceneSnapshot: (
    resolved: RailSceneResolvedContent<HomeRailActivityContent>
  ) => void
  reloadActivityNoticeListAndApply: (options?: {
    force?: boolean
    replay?: boolean
    motionSource?: ActivityNoticeMotionSource
  }) => Promise<ActivityNoticeRemoteListResult | null>
  startNoticePullRefreshPresentation: (
    runPresentation: (presentationRunId: number) => Promise<void>
  ) => Promise<void>
  waitForNoticeRefreshPresentationSettled: (
    targetReplayRequestId: number,
    targetPresentationRunId: number
  ) => Promise<void>
  applyActivitySceneModules: (
    modules: HomeRailActivitySceneModuleKey[],
    nextContent: HomeRailActivityContent,
    options: { origin: 'visible' | 'activation' }
  ) => { appliedModules: HomeRailActivitySceneModuleKey[] }
  markAppliedModulesDisplayed: (
    resolved: RailSceneResolvedContent<HomeRailActivityContent>,
    modules: HomeRailActivitySceneModuleKey[]
  ) => void
  consumeStagedNoticeListUpdate: (
    querySignature: string
  ) => { payload: unknown; etag?: string } | null
  applyResolvedActivityNoticeList: (
    result: Pick<ActivityNoticeListResult, 'list' | 'total'>,
    options?: { replay?: boolean; motionSource?: ActivityNoticeMotionSource }
  ) => void
  stageNoticeListUpdate: (
    querySignature: string,
    payload: ActivityNoticeListResult,
    etag: string | undefined,
    origin: 'visible-update' | 'activation-apply'
  ) => void
  hydrateRemoteNoticeListFromPersistentCache: (
    querySnapshot: ActivityNoticeQuerySnapshot
  ) => Promise<ActivityNoticeListResult | null>
  resolveActivityNoticeQuerySnapshot: () => ActivityNoticeQuerySnapshot
  scheduleNoticeTagIndicatorSync: () => void
}

export const useHomeRailActivityContentLifecycle = (
  options: UseHomeRailActivityContentLifecycleOptions
) => {
  const refreshContent = async (params: { force?: boolean; reason?: RailRefreshReason } = {}) => {
    const refreshRunId = options.beginActivityRefreshRun()
    const refreshReason = params.reason ?? 'pull-refresh'
    options.clearStagedNoticeListUpdate()
    if (refreshReason === 'pull-refresh') {
      options.clearNoticeSearchState({ collapse: true })
    }

    const nextResolved = await options.hydrateActivityContent({
      force: params.force ?? true,
      preserveCurrentContentOnError: true,
      applyResolvedContent: false,
    })
    if (!nextResolved) {
      return
    }

    options.applyActivityContent(nextResolved.content)
    options.syncDisplayedActivitySceneSnapshot(nextResolved)
    await persistActivitySceneToPersistentCache(nextResolved)
    if (refreshReason === 'pull-refresh') {
      await options.startNoticePullRefreshPresentation(async (presentationRunId) => {
        await options.reloadActivityNoticeListAndApply({
          force: true,
          replay: true,
          motionSource: 'manual-refresh',
        })
        await options.waitForNoticeRefreshPresentationSettled(
          options.noticeRefreshReplayRequestId.value,
          presentationRunId
        )
      })
    }

    void refreshRunId
  }

  const runActivityActivationCheck = async (params: { allowNetworkFallback?: boolean } = {}) => {
    if (!options.hasResolvedInitialActivityContent.value) {
      return
    }

    const activationVersion = options.activityActivationCheckVersion.value + 1
    options.activityActivationCheckVersion.value = activationVersion
    const update = await resolveHomeRailActivityActivationUpdate(params)
    if (
      !options.isActive.value ||
      options.activityActivationCheckVersion.value !== activationVersion
    ) {
      return
    }

    if (update.scene) {
      const { appliedModules } = options.applyActivitySceneModules(
        update.sceneChangedModules,
        update.scene.content,
        { origin: 'activation' }
      )
      if (appliedModules.length > 0) {
        options.markAppliedModulesDisplayed(update.scene, appliedModules)
      }
    }

    const stagedNoticeList = options.consumeStagedNoticeListUpdate(
      options.noticeListQuerySignature.value
    ) as {
      payload: ActivityNoticeListResult
      etag?: string
    } | null
    const noticeListUpdate = stagedNoticeList?.payload ?? update.noticeList
    if (noticeListUpdate) {
      options.applyResolvedActivityNoticeList(
        {
          list: noticeListUpdate.list,
          total: noticeListUpdate.total,
        },
        { motionSource: 'activation-apply' }
      )
    }
  }

  const runActivityVisibleUpdateCheck = () => {
    if (!options.isActive.value || !options.hasResolvedInitialActivityContent.value) {
      return
    }

    const update = resolveHomeRailActivityVisibleUpdate()
    if (update.scene) {
      const { appliedModules } = options.applyActivitySceneModules(
        update.sceneChangedModules,
        update.scene.content,
        { origin: 'visible' }
      )
      if (appliedModules.length > 0) {
        options.markAppliedModulesDisplayed(update.scene, appliedModules)
      }
    }

    if (update.noticeList) {
      options.stageNoticeListUpdate(
        options.noticeListQuerySignature.value,
        update.noticeList,
        update.noticeListEtag,
        'visible-update'
      )
    }
  }

  const initializeActivityContent = async () => {
    const cachedScene = await hydrateActivitySceneFromPersistentCache()
    if (cachedScene) {
      options.applyActivityContent(cachedScene.content)
      options.syncDisplayedActivitySceneSnapshot(cachedScene)
    }

    const querySnapshot = options.resolveActivityNoticeQuerySnapshot()
    syncHomeRailActivityNoticeQuerySnapshot(querySnapshot)
    const cachedList = await options.hydrateRemoteNoticeListFromPersistentCache(querySnapshot)
    if (cachedList) {
      options.applyResolvedActivityNoticeList(
        {
          list: cachedList.list,
          total: cachedList.total,
        },
        { motionSource: 'initial-enter' }
      )
    }

    const initialResolved = await options.hydrateActivityContent()
    if (initialResolved) {
      options.syncDisplayedActivitySceneSnapshot(initialResolved)
      await persistActivitySceneToPersistentCache(initialResolved)
    } else if (!cachedScene) {
      return
    }

    syncHomeRailActivityNoticeQuerySnapshot(options.resolveActivityNoticeQuerySnapshot())
    await options.reloadActivityNoticeListAndApply({
      motionSource: 'initial-enter',
      force: false,
    })
    options.scheduleNoticeTagIndicatorSync()
  }

  return {
    refreshContent,
    runActivityActivationCheck,
    runActivityVisibleUpdateCheck,
    initializeActivityContent,
  }
}
