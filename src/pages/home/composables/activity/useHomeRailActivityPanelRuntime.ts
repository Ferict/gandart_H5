/**
 * Responsibility: co-locate the high-coupling runtime chain behind HomeRailActivityPanel.
 * Out of scope: template-ref adapter wiring and template-only label formatting.
 */
import { type ComputedRef } from 'vue'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import { consumeActivityNoticeUnread } from '../../../../services/home-rail/homeRailActivityContent.service'
import {
  hydrateActivityNoticeListFromPersistentCache,
  persistActivityNoticeListToPersistentCache,
} from '../../../../services/home-rail/homeRailPersistentCacheIntegration.service'
import {
  syncHomeRailActivityNoticeListSnapshot,
  syncHomeRailActivityNoticeQuerySnapshot,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'
import { useHorizontalScrollFade } from '../../../../composables/useHorizontalScrollFade'
import { useTrackIndicator } from '../../../../composables/useTrackIndicator'
import { IS_HOME_RAIL_ACTIVITY_DEV } from './homeRailActivityPanel.constants'
import { ALL_ACTIVITY_NOTICE_TAG } from './useActivityNoticeQueryState'
import { useActivityNoticeReadBridge } from './useActivityNoticeReadBridge'
import { useActivityNoticeSearchRevealTransition } from './useActivityNoticeSearchRevealTransition'
import { useHomeRailActivityNoticeEffectsRuntime } from './useHomeRailActivityNoticeEffectsRuntime'
import { useHomeRailActivityNoticeLoadMore } from './useHomeRailActivityNoticeLoadMore'
import { useHomeRailActivityNoticeResultRuntime } from './useHomeRailActivityNoticeResultRuntime'
import { useActivityScenePatchController } from './useActivityScenePatchController'
import { useHomeRailActivityNavigation } from './useHomeRailActivityNavigation'
import { useHomeRailActivityNoticeDataPipeline } from './useHomeRailActivityNoticeDataPipeline'
import { useHomeRailActivityRefreshRuntime } from './useHomeRailActivityRefreshRuntime'
import { useHomeRailActivityRuntimeState } from './useHomeRailActivityRuntimeState'
import { ACTIVITY_NOTICE_BATCH_STRATEGY } from '../shared/homeRailBatchStrategy'

interface UseHomeRailActivityPanelRuntimeOptions {
  isActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
}

export const useHomeRailActivityPanelRuntime = (
  options: UseHomeRailActivityPanelRuntimeOptions
) => {
  const {
    activityForegroundSignal,
    activityPollSignal,
    activityActivationCheckVersion,
    hasSeenActivityPageActivation,
    logActivityRefreshDebug,
  } = useHomeRailActivityRuntimeState({
    isDev: IS_HOME_RAIL_ACTIVITY_DEV,
  })

  const {
    isLeftFadeVisible: isNoticeTagLeftFadeVisible,
    handleHorizontalScroll: handleNoticeTagScroll,
  } = useHorizontalScrollFade()

  const {
    indicatorStyle: noticeTagIndicatorStyle,
    isIndicatorReady: isNoticeTagIndicatorReady,
    scheduleIndicatorSync: scheduleNoticeTagIndicatorSync,
  } = useTrackIndicator({
    trackSelector: '.home-activity-tag-track',
    activeSelector: '.home-activity-tag-entry.is-active .home-activity-tag-text',
    minWidth: 16,
  })

  const {
    activityContent,
    hasResolvedInitialActivityContent,
    assetMergeEntry,
    priorityDrawEntry,
    networkInviteEntry,
    applyActivityContent,
    applyActivitySceneModules,
    hydrateActivityContent,
    syncDisplayedActivitySceneSnapshot,
    markAppliedModulesDisplayed,
  } = useActivityScenePatchController({
    syncActiveTag: () => syncActiveTag(),
    triggerScenePatchMotionReduction: (modules) =>
      triggerActivityScenePatchMotionReduction(modules),
    logActivityRefreshDebug,
  })

  const { activityNoticeQueryState, activityNoticeRemoteListState } =
    useHomeRailActivityNoticeDataPipeline({
      content: activityContent,
      isActive: options.isActive,
      syncResolvedNoticeSnapshot: syncHomeRailActivityNoticeListSnapshot,
      hydratePersistedNoticeListSnapshot: (query) =>
        hydrateActivityNoticeListFromPersistentCache(query),
      persistResolvedNoticeListSnapshot: (query, list) =>
        persistActivityNoticeListToPersistentCache(query, list),
    })

  const {
    activeTag,
    noticeKeyword,
    isNoticeSearchVisible,
    noticeTags,
    normalizedAppliedNoticeKeyword,
    hasActiveNoticeSearch,
    sceneFilteredNotices,
    noticeListQuerySignature,
    syncActiveTag,
    resolveActivityNoticeQuerySnapshot,
    clearNoticeSearchState,
    handleNoticeSearchToggle,
    handleNoticeKeywordInput,
    handleNoticeKeywordClear,
    handleTagSelect,
    resetActivityQueryForInactive,
    disposeActivityQueryState,
  } = activityNoticeQueryState

  const {
    remoteFilteredNoticeList,
    hasResolvedRemoteNoticeList,
    isRemoteNoticeListLoading,
    isFirstScreenRemoteNoticeListLoading,
    isNoticePaginationLoading,
    hasFirstScreenRemoteNoticeListError,
    hasNoticePaginationError,
    remoteNoticeListErrorMessage,
    hydrateRemoteNoticeListFromPersistentCache,
    reloadRemoteActivityNoticeList,
    loadMoreRemoteActivityNoticeListPage,
    resetRemoteNoticeListForInactive,
  } = activityNoticeRemoteListState

  const { markNoticeReadLocal } = useActivityNoticeReadBridge({
    activityContent,
    remoteFilteredNoticeList,
  })

  const {
    handleNoticeSearchRevealBeforeEnter,
    handleNoticeSearchRevealEnter,
    handleNoticeSearchRevealAfterEnter,
    handleNoticeSearchRevealBeforeLeave,
    handleNoticeSearchRevealLeave,
    handleNoticeSearchRevealAfterLeave,
  } = useActivityNoticeSearchRevealTransition()

  const {
    noticeEmptyStateTitle,
    noticeEmptyStateDescription,
    filteredNotices,
    resolvedNoticeTotal,
    noticeVisibleCount,
    displayedNotices,
    mountedNotices,
    pendingNoticeList,
    noticeRefreshReplayRequestId,
    noticeResultsStageRef,
    noticeTopSpacerHeight,
    noticeBottomSpacerHeight,
    noticeRemovedOverlayItems,
    noticeResultsStageStyle,
    visibleNoticeStructureSignature,
    visibleNoticeContentSignature,
    shouldShowNoticeFirstScreenErrorState,
    shouldShowNoticeFirstScreenLoadingState,
    shouldShowNoticeEmptyState,
    shouldRenderActivityBottomFooter,
    activityBottomFooterMode,
    resolveNoticeIcon,
    resolveNoticeTone,
    resolveNoticeImageUrl,
    resolveNoticeRevealPhase,
    resolveNoticeRemovedOverlayRevealPhase,
    handleNoticeVisualImageLoad,
    handleNoticeVisualImageError,
    handleNoticeVisualImageRetrying,
    activityNoticeImageStateVersionRef,
    isNoticePlaceholder,
    resolveNoticeEntryClass,
    resolveNoticeEntryStyle,
    resolveNoticeRemovedOverlayItemStyle,
    syncMountedNoticeWindow,
    resolveDisplayedNoticeVisibleEndRow,
    syncNoticeVisualImages,
    syncNoticeRevealPhases,
    requestActivityNoticeRefreshReplay,
    applyResolvedActivityNoticeList,
    startNoticeResultSwitch,
    reconcileNoticeRender,
    isNoticeRefreshPresentationSettled,
    resetNoticeResultWindowForInactive,
    resetNoticeVisualRevealForInactive,
    disposeNoticeResultWindow,
    disposeNoticeVisualReveal,
  } = useHomeRailActivityNoticeResultRuntime({
    viewState: {
      allNoticeTag: ALL_ACTIVITY_NOTICE_TAG,
      activeTag,
      noticeKeyword,
      normalizedAppliedNoticeKeyword,
      hasResolvedInitialActivityContent,
      hasResolvedRemoteNoticeList,
      remoteFilteredNoticeList,
      sceneFilteredNotices,
    },
    isPanelActive: options.isActive,
    mountScrollMetrics: options.mountScrollMetrics,
    hasResolvedInitialActivityContent,
    isRemoteNoticeListLoading,
    isFirstScreenRemoteNoticeListLoading,
    isNoticePaginationLoading,
    hasFirstScreenRemoteNoticeListError,
    hasNoticePaginationError,
  })

  const resolveNoticeTypeLabel = (notice: ActivityNotice): string => `${notice.category}公告`
  const resolveNoticeDisplayTime = (notice: ActivityNotice): string => notice.time

  const {
    isActivityScenePatchMotionReduced,
    clearStagedNoticeListUpdate,
    markNoticeRefreshPresentationCancelled,
    triggerActivityScenePatchMotionReduction,
    resetActivityRuntimeForInactive,
    disposeActivityRuntime,
    handleNoticeFirstScreenRetry,
    refreshContent,
    runActivityActivationCheck,
    runActivityVisibleUpdateCheck,
    initializeActivityContent,
    waitForRefreshPresentation,
    reloadActivityNoticeListAndApply,
  } = useHomeRailActivityRefreshRuntime({
    hasResolvedRemoteNoticeList,
    remoteFilteredNoticeList,
    reloadRemoteActivityNoticeList,
    requestActivityNoticeRefreshReplay,
    applyResolvedActivityNoticeList,
    isNoticeRefreshPresentationSettled,
    isActive: options.isActive,
    hasResolvedInitialActivityContent,
    activityActivationCheckVersion,
    noticeListQuerySignature,
    noticeRefreshReplayRequestId,
    clearNoticeSearchState,
    hydrateActivityContent,
    applyActivityContent,
    syncDisplayedActivitySceneSnapshot,
    applyActivitySceneModules,
    markAppliedModulesDisplayed,
    hydrateRemoteNoticeListFromPersistentCache,
    resolveActivityNoticeQuerySnapshot,
    scheduleNoticeTagIndicatorSync,
  })

  const {
    scheduleActivityNoticeLoadMoreObserver,
    clearActivityNoticeLoadMoreObserver,
    handleActivityBottomRetry,
  } = useHomeRailActivityNoticeLoadMore({
    isActive: options.isActive,
    displayedNotices,
    filteredNotices,
    remoteFilteredNoticeList,
    resolvedNoticeTotal,
    noticeVisibleCount,
    revealStepCount: ACTIVITY_NOTICE_BATCH_STRATEGY.revealStepCount,
    isRemoteNoticeListLoading,
    isNoticePaginationLoading,
    resolveDisplayedNoticeVisibleEndRow,
    loadMoreRemoteActivityNoticeListPage,
    applyResolvedActivityNoticeList,
  })

  const { handleEntryClick, handleNoticeClick } = useHomeRailActivityNavigation({
    markNoticeReadLocal,
    consumeActivityNoticeUnread,
  })

  useHomeRailActivityNoticeEffectsRuntime({
    noticeListQuerySignature,
    hasResolvedInitialActivityContent,
    visibleNoticeStructureSignature,
    visibleNoticeContentSignature,
    noticeRefreshReplayRequestId,
    activityNoticeImageStateVersionRef,
    noticeVisibleCount,
    displayedNotices,
    mountedNotices,
    pendingNoticeList,
    noticeTags,
    activeTag,
    isActive: options.isActive,
    mountScrollMetrics: options.mountScrollMetrics,
    hasSeenActivityPageActivation,
    activityForegroundSignal,
    activityPollSignal,
    initialVisibleCount: ACTIVITY_NOTICE_BATCH_STRATEGY.initialRevealCount,
    initializeActivityContent,
    clearStagedNoticeListUpdate,
    reloadActivityNoticeListAndApply,
    reconcileNoticeRender,
    syncMountedNoticeWindow,
    syncNoticeVisualImages,
    syncNoticeRevealPhases,
    scheduleActivityNoticeLoadMoreObserver,
    clearActivityNoticeLoadMoreObserver,
    scheduleNoticeTagIndicatorSync,
    syncActivityNoticeQuerySnapshot: () => {
      syncHomeRailActivityNoticeQuerySnapshot(resolveActivityNoticeQuerySnapshot())
    },
    markNoticeRefreshPresentationCancelled,
    resetActivityRuntimeForInactive,
    resetActivityQueryForInactive,
    resetRemoteNoticeListForInactive,
    resetNoticeResultWindowForInactive,
    resetNoticeVisualRevealForInactive,
    startNoticeResultSwitch,
    runActivityActivationCheck,
    runActivityVisibleUpdateCheck,
    disposeActivityRuntime,
    disposeActivityQueryState,
    disposeNoticeResultWindow,
    disposeNoticeVisualReveal,
  })

  return {
    assetMergeEntry,
    priorityDrawEntry,
    networkInviteEntry,
    isActivityScenePatchMotionReduced,
    isNoticeSearchVisible,
    hasActiveNoticeSearch,
    noticeTags,
    activeTag,
    isNoticeTagLeftFadeVisible,
    isNoticeTagIndicatorReady,
    noticeTagIndicatorStyle,
    noticeKeyword,
    noticeResultsStageRef,
    noticeResultsStageStyle,
    noticeRemovedOverlayItems,
    displayedNotices,
    mountedNotices,
    noticeTopSpacerHeight,
    noticeBottomSpacerHeight,
    shouldRenderActivityBottomFooter,
    activityBottomFooterMode,
    remoteNoticeListErrorMessage,
    shouldShowNoticeFirstScreenErrorState,
    shouldShowNoticeFirstScreenLoadingState,
    shouldShowNoticeEmptyState,
    noticeEmptyStateTitle,
    noticeEmptyStateDescription,
    resolveNoticeRemovedOverlayItemStyle,
    resolveNoticeTone,
    resolveNoticeTypeLabel,
    resolveNoticeDisplayTime,
    resolveNoticeImageUrl,
    resolveNoticeRemovedOverlayRevealPhase,
    resolveNoticeRevealPhase,
    resolveNoticeIcon,
    isNoticePlaceholder,
    resolveNoticeEntryClass,
    resolveNoticeEntryStyle,
    handleNoticeTagScroll,
    handleTagSelect,
    handleNoticeKeywordInput,
    handleNoticeKeywordClear,
    handleNoticeSearchRevealBeforeEnter,
    handleNoticeSearchRevealEnter,
    handleNoticeSearchRevealAfterEnter,
    handleNoticeSearchRevealBeforeLeave,
    handleNoticeSearchRevealLeave,
    handleNoticeSearchRevealAfterLeave,
    handleNoticeVisualImageLoad,
    handleNoticeVisualImageError,
    handleNoticeVisualImageRetrying,
    handleActivityBottomRetry,
    handleNoticeFirstScreenRetry,
    handleNoticeSearchToggle,
    handleEntryClick,
    handleNoticeClick,
    refreshContent,
    waitForRefreshPresentation,
  }
}
