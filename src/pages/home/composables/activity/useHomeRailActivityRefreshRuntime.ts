/**
 * Responsibility: co-locate activity rail notice reload, refresh presentation runtime, and content lifecycle wiring.
 * Out of scope: result window, visual reveal, query state, and page template structure.
 */
import { useActivityPagePresentationRuntime } from './useActivityPagePresentationRuntime'
import { useHomeRailActivityContentLifecycle } from './useHomeRailActivityContentLifecycle'
import { useHomeRailActivityNoticeReload } from './useHomeRailActivityNoticeReload'

type ActivityNoticeReloadOptions = Parameters<typeof useHomeRailActivityNoticeReload>[0]
type ActivityPagePresentationRuntimeOptions = Parameters<
  typeof useActivityPagePresentationRuntime
>[0]
type ActivityContentLifecycleOptions = Parameters<typeof useHomeRailActivityContentLifecycle>[0]

interface UseHomeRailActivityRefreshRuntimeOptions {
  hasResolvedRemoteNoticeList: ActivityNoticeReloadOptions['hasResolvedRemoteNoticeList']
  remoteFilteredNoticeList: ActivityNoticeReloadOptions['remoteFilteredNoticeList']
  reloadRemoteActivityNoticeList: ActivityNoticeReloadOptions['reloadRemoteActivityNoticeList']
  requestActivityNoticeRefreshReplay: ActivityNoticeReloadOptions['requestActivityNoticeRefreshReplay']
  applyResolvedActivityNoticeList: ActivityContentLifecycleOptions['applyResolvedActivityNoticeList']
  isNoticeRefreshPresentationSettled: ActivityPagePresentationRuntimeOptions['isNoticeRefreshPresentationSettled']
  isActive: ActivityContentLifecycleOptions['isActive']
  hasResolvedInitialActivityContent: ActivityContentLifecycleOptions['hasResolvedInitialActivityContent']
  activityActivationCheckVersion: ActivityContentLifecycleOptions['activityActivationCheckVersion']
  noticeListQuerySignature: ActivityContentLifecycleOptions['noticeListQuerySignature']
  noticeRefreshReplayRequestId: ActivityContentLifecycleOptions['noticeRefreshReplayRequestId']
  clearNoticeSearchState: ActivityContentLifecycleOptions['clearNoticeSearchState']
  hydrateActivityContent: ActivityContentLifecycleOptions['hydrateActivityContent']
  applyActivityContent: ActivityContentLifecycleOptions['applyActivityContent']
  syncDisplayedActivitySceneSnapshot: ActivityContentLifecycleOptions['syncDisplayedActivitySceneSnapshot']
  applyActivitySceneModules: ActivityContentLifecycleOptions['applyActivitySceneModules']
  markAppliedModulesDisplayed: ActivityContentLifecycleOptions['markAppliedModulesDisplayed']
  hydrateRemoteNoticeListFromPersistentCache: ActivityContentLifecycleOptions['hydrateRemoteNoticeListFromPersistentCache']
  resolveActivityNoticeQuerySnapshot: ActivityContentLifecycleOptions['resolveActivityNoticeQuerySnapshot']
  scheduleNoticeTagIndicatorSync: ActivityContentLifecycleOptions['scheduleNoticeTagIndicatorSync']
}

export const useHomeRailActivityRefreshRuntime = (
  options: UseHomeRailActivityRefreshRuntimeOptions
) => {
  const {
    isActivityScenePatchMotionReduced,
    beginActivityRefreshRun,
    clearStagedNoticeListUpdate,
    stageNoticeListUpdate,
    consumeStagedNoticeListUpdate,
    startNoticePullRefreshPresentation,
    waitForNoticeRefreshPresentationSettled,
    waitForRefreshPresentation,
    markNoticeRefreshPresentationCancelled,
    triggerActivityScenePatchMotionReduction,
    resetActivityRuntimeForInactive,
    disposeActivityRuntime,
  } = useActivityPagePresentationRuntime({
    isNoticeRefreshPresentationSettled: options.isNoticeRefreshPresentationSettled,
  })

  const {
    reloadActivityNoticeListAndApply,
    handleNoticeFirstScreenRetry,
    handleActivityBottomRetry,
  } = useHomeRailActivityNoticeReload({
    hasResolvedRemoteNoticeList: options.hasResolvedRemoteNoticeList,
    remoteFilteredNoticeList: options.remoteFilteredNoticeList,
    reloadRemoteActivityNoticeList: options.reloadRemoteActivityNoticeList,
    requestActivityNoticeRefreshReplay: options.requestActivityNoticeRefreshReplay,
    applyResolvedActivityNoticeList: (result, reloadOptions) =>
      options.applyResolvedActivityNoticeList(result, reloadOptions),
  })

  const {
    refreshContent,
    runActivityActivationCheck,
    runActivityVisibleUpdateCheck,
    initializeActivityContent,
  } = useHomeRailActivityContentLifecycle({
    isActive: options.isActive,
    hasResolvedInitialActivityContent: options.hasResolvedInitialActivityContent,
    activityActivationCheckVersion: options.activityActivationCheckVersion,
    noticeListQuerySignature: options.noticeListQuerySignature,
    noticeRefreshReplayRequestId: options.noticeRefreshReplayRequestId,
    clearNoticeSearchState: options.clearNoticeSearchState,
    clearStagedNoticeListUpdate,
    beginActivityRefreshRun,
    hydrateActivityContent: options.hydrateActivityContent,
    applyActivityContent: options.applyActivityContent,
    syncDisplayedActivitySceneSnapshot: options.syncDisplayedActivitySceneSnapshot,
    reloadActivityNoticeListAndApply,
    startNoticePullRefreshPresentation,
    waitForNoticeRefreshPresentationSettled,
    applyActivitySceneModules: options.applyActivitySceneModules,
    markAppliedModulesDisplayed: options.markAppliedModulesDisplayed,
    consumeStagedNoticeListUpdate,
    applyResolvedActivityNoticeList: options.applyResolvedActivityNoticeList,
    stageNoticeListUpdate,
    hydrateRemoteNoticeListFromPersistentCache: options.hydrateRemoteNoticeListFromPersistentCache,
    resolveActivityNoticeQuerySnapshot: options.resolveActivityNoticeQuerySnapshot,
    scheduleNoticeTagIndicatorSync: options.scheduleNoticeTagIndicatorSync,
  })

  return {
    isActivityScenePatchMotionReduced,
    clearStagedNoticeListUpdate,
    markNoticeRefreshPresentationCancelled,
    triggerActivityScenePatchMotionReduction,
    resetActivityRuntimeForInactive,
    disposeActivityRuntime,
    handleNoticeFirstScreenRetry,
    handleActivityBottomRetry,
    refreshContent,
    runActivityActivationCheck,
    runActivityVisibleUpdateCheck,
    initializeActivityContent,
    waitForRefreshPresentation,
    reloadActivityNoticeListAndApply,
  }
}
