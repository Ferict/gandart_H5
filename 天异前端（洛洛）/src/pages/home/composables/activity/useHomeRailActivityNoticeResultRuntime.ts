/**
 * Responsibility: co-locate activity rail notice result-stage view state, visual reveal, result window, and presentation-state wiring.
 * Out of scope: query state, refresh lifecycle, navigation, and page template structure.
 */
import { useActivityNoticeResultWindow } from './useActivityNoticeResultWindow'
import { useActivityNoticeVisualReveal } from './useActivityNoticeVisualReveal'
import { useHomeRailActivityPresentationState } from './useHomeRailActivityPresentationState'
import { useHomeRailActivityViewState } from './useHomeRailActivityViewState'

type ActivityViewStateOptions = Parameters<typeof useHomeRailActivityViewState>[0]
type ActivityResultWindowOptions = Parameters<typeof useActivityNoticeResultWindow>[0]
type ActivityPresentationStateOptions = Parameters<typeof useHomeRailActivityPresentationState>[0]

interface UseHomeRailActivityNoticeResultRuntimeOptions {
  viewState: ActivityViewStateOptions
  isPanelActive: ActivityResultWindowOptions['isPanelActive']
  mountScrollMetrics: ActivityResultWindowOptions['mountScrollMetrics']
  hasResolvedInitialActivityContent: ActivityResultWindowOptions['hasResolvedInitialActivityContent']
  isRemoteNoticeListLoading: ActivityResultWindowOptions['isRemoteNoticeListLoading']
  isFirstScreenRemoteNoticeListLoading: ActivityPresentationStateOptions['isFirstScreenRemoteNoticeListLoading']
  isNoticePaginationLoading: ActivityPresentationStateOptions['isNoticePaginationLoading']
  hasFirstScreenRemoteNoticeListError: ActivityPresentationStateOptions['hasFirstScreenRemoteNoticeListError']
  hasNoticePaginationError: ActivityPresentationStateOptions['hasNoticePaginationError']
}

export const useHomeRailActivityNoticeResultRuntime = (
  options: UseHomeRailActivityNoticeResultRuntimeOptions
) => {
  const {
    noticeEmptyStateTitle,
    noticeEmptyStateDescription,
    filteredNotices,
    resolvedNoticeTotal,
    noticePlaceholderIdSetRef,
    mountedNoticesRef,
  } = useHomeRailActivityViewState(options.viewState)

  const activityNoticeVisual = useActivityNoticeVisualReveal({
    mountedNotices: mountedNoticesRef,
    isNoticePlaceholder: (noticeId: string) => noticePlaceholderIdSetRef.value.has(noticeId),
  })

  const {
    resolveNoticeIcon,
    resolveNoticeTone,
    resolveNoticeImageUrl,
    resolveNoticeRevealPhase,
    resolveNoticeRemovedOverlayRevealPhase,
    handleNoticeVisualImageLoad,
    handleNoticeVisualImageError,
    handleNoticeVisualImageRetrying,
    syncNoticeVisualImages,
    syncNoticeRevealPhases,
    activityNoticeImageStateVersionRef,
    resetNoticeVisualRevealForInactive,
    disposeNoticeVisualReveal,
  } = activityNoticeVisual

  const {
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
    shouldShowActivityBottomEndline: shouldShowActivityBottomEndlineSignal,
    isNoticePlaceholder,
    resolveNoticeEntryClass,
    resolveNoticeEntryStyle,
    resolveNoticeRemovedOverlayItemStyle,
    syncMountedNoticeWindow,
    requestActivityNoticeRefreshReplay,
    applyResolvedActivityNoticeList,
    startNoticeResultSwitch,
    reconcileNoticeRender,
    isNoticeRefreshPresentationSettled,
    resetNoticeResultWindowForInactive,
    disposeNoticeResultWindow,
  } = useActivityNoticeResultWindow({
    isPanelActive: options.isPanelActive,
    hasResolvedInitialActivityContent: options.hasResolvedInitialActivityContent,
    mountScrollMetrics: options.mountScrollMetrics,
    filteredNotices,
    resolvedNoticeTotal,
    isRemoteNoticeListLoading: options.isRemoteNoticeListLoading,
    mountedNoticesRef,
    placeholderIdSetRef: noticePlaceholderIdSetRef,
    visual: {
      noticeRevealPhaseMap: activityNoticeVisual.noticeRevealPhaseMap,
      resolveNoticeImageUrl,
      syncNoticeVisualImages,
      syncNoticeRevealPhases,
      clearNoticeRevealTimeouts: activityNoticeVisual.clearNoticeRevealTimeouts,
    },
  })

  const {
    shouldShowNoticeFirstScreenErrorState,
    shouldShowNoticeFirstScreenLoadingState,
    shouldShowNoticeEmptyState,
    shouldRenderActivityBottomFooter,
    activityBottomFooterMode,
  } = useHomeRailActivityPresentationState({
    hasResolvedInitialActivityContent: options.hasResolvedInitialActivityContent,
    filteredNotices,
    displayedNotices,
    pendingNoticeList,
    isRemoteNoticeListLoading: options.isRemoteNoticeListLoading,
    isFirstScreenRemoteNoticeListLoading: options.isFirstScreenRemoteNoticeListLoading,
    isNoticePaginationLoading: options.isNoticePaginationLoading,
    hasFirstScreenRemoteNoticeListError: options.hasFirstScreenRemoteNoticeListError,
    hasNoticePaginationError: options.hasNoticePaginationError,
    shouldShowActivityBottomEndlineSignal,
  })

  return {
    noticeEmptyStateTitle,
    noticeEmptyStateDescription,
    filteredNotices,
    resolvedNoticeTotal,
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
    shouldShowActivityBottomEndlineSignal,
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
  }
}
