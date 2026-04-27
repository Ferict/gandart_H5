/**
 * Responsibility: assemble the activity notice result-window runtime from switch, render, geometry, presentation, and reset sub-runtimes.
 * Out of scope: panel-level refresh orchestration and template-only footer structure.
 */
import { ref, type ComputedRef, type Ref } from 'vue'
import {
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
  type ResultWindowOverlayItem,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'
import type { NoticeRevealPhase } from './useActivityNoticeVisualReveal'
import { useActivityNoticeResultWindowGeometryRuntime } from './useActivityNoticeResultWindowGeometryRuntime'
import { useActivityNoticeResultWindowInactiveResetRuntime } from './useActivityNoticeResultWindowInactiveResetRuntime'
import { useActivityNoticeResultWindowPresentationRuntime } from './useActivityNoticeResultWindowPresentationRuntime'
import { useActivityNoticeResultWindowRenderRuntime } from './useActivityNoticeResultWindowRenderRuntime'
import { useActivityNoticeResultWindowSwitchRuntime } from './useActivityNoticeResultWindowSwitchRuntime'

export type ActivityNoticeResultMotionSource = ResultLoadSource
type NoticeEntryPhase = CardQueuePhase

interface UseActivityNoticeResultWindowOptions {
  isPanelActive: ComputedRef<boolean>
  hasResolvedInitialActivityContent: Ref<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  visibleNotices: ComputedRef<ActivityNotice[]>
  resolvedNoticeTotal: ComputedRef<number>
  resolveNoticeVisibleCount: () => number
  isRemoteNoticeListLoading: Ref<boolean>
  mountedNoticesRef?: Ref<ActivityNotice[]>
  placeholderIdSetRef?: Ref<Set<string>>
  visual: {
    noticeRevealPhaseMap: Ref<Record<string, NoticeRevealPhase>>
    resolveNoticeImageUrl: (notice: ActivityNotice) => string
    syncNoticeVisualImages: (list?: ActivityNotice[]) => void
    syncNoticeRevealPhases: (list?: ActivityNotice[]) => void
    clearNoticeRevealTimeouts: (retainIds?: Set<string>) => void
  }
}

const NOTICE_RESULT_LEAVE_DURATION_MS = 300
const NOTICE_RESULT_ENTER_DURATION_MS = 300
const NOTICE_CARD_STAGGER_STEP_MS = 100

export const useActivityNoticeResultWindow = ({
  isPanelActive,
  hasResolvedInitialActivityContent,
  mountScrollMetrics,
  visibleNotices,
  resolvedNoticeTotal,
  resolveNoticeVisibleCount,
  isRemoteNoticeListLoading,
  mountedNoticesRef,
  placeholderIdSetRef,
  visual,
}: UseActivityNoticeResultWindowOptions) => {
  const displayedNotices = ref<ActivityNotice[]>([])
  const mountedNotices = mountedNoticesRef ?? ref<ActivityNotice[]>([])
  const mountedNoticeIdSet = ref<Set<string>>(new Set())
  const noticePlaceholderIdSet = placeholderIdSetRef ?? ref<Set<string>>(new Set())
  const pendingNoticeList = ref<ActivityNotice[]>([])
  const queuedNoticeSwitch = ref<ActivityNotice[] | null>(null)
  const noticeResultMotionSource = ref<ActivityNoticeResultMotionSource>('initial-enter')
  const noticeTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('idle')
  const noticeEntryPhaseMap = ref<Record<string, NoticeEntryPhase>>({})
  const pendingNoticeWindowDiff = ref<ResultWindowDiff<ActivityNotice> | null>(null)
  const noticeResultsStageRef = ref<HTMLElement | null>(null)
  const noticeResultsStageLockedMinHeight = ref(0)
  const noticeTopSpacerHeight = ref(0)
  const noticeBottomSpacerHeight = ref(0)
  const noticeRemovedOverlayItems = ref<ResultWindowOverlayItem<ActivityNotice>[]>([])
  const hasBootstrappedNoticeList = ref(false)
  const noticeRefreshReplayRequestId = ref(0)
  const handledNoticeRefreshReplayRequestId = ref(0)
  const noticeResultSwitchRunId = ref(0)
  const noticeQueuedInsertTimeoutIdsRef = ref<Array<ReturnType<typeof setTimeout>>>([])
  const noticeRemovedOverlayClearTimeoutIdRef = ref<ReturnType<typeof setTimeout> | null>(null)

  const {
    visibleNoticeStructureSignature,
    visibleNoticeContentSignature,
    shouldShowActivityBottomEndline,
    buildNoticeStructureSignature,
    buildNoticeContentSignature,
    isNoticePlaceholder,
    resolveNoticeEntryClass,
    resolveNoticeEntryStyle,
    resolveNoticeRemovedOverlayItemStyle,
  } = useActivityNoticeResultWindowPresentationRuntime({
    visibleNotices,
    displayedNotices,
    mountedNotices,
    resolvedNoticeTotal,
    noticePlaceholderIdSet,
    noticeEntryPhaseMap,
    noticeResultMotionSource,
    resolveNoticeImageUrl: visual.resolveNoticeImageUrl,
    staggerStepMs: NOTICE_CARD_STAGGER_STEP_MS,
  })

  const {
    noticeResultsStageStyle,
    syncMountedNoticeWindow,
    clearMountedNoticeWindow,
    clearNoticeMountWindowSyncRaf,
    scheduleNoticeMountWindowSync,
    resolveDisplayedNoticeVisibleEndRow,
  } = useActivityNoticeResultWindowGeometryRuntime({
    isPanelActive,
    mountScrollMetrics,
    displayedNotices,
    mountedNotices,
    mountedNoticeIdSet,
    noticePlaceholderIdSet,
    noticeResultsStageRef,
    noticeResultsStageLockedMinHeight,
    noticeTopSpacerHeight,
    noticeBottomSpacerHeight,
    syncNoticeVisualImages: visual.syncNoticeVisualImages,
    syncNoticeRevealPhases: visual.syncNoticeRevealPhases,
  })

  const { startNoticeResultSwitch, clearNoticeSwitchRuntimeTimeouts } =
    useActivityNoticeResultWindowSwitchRuntime({
      displayedNotices,
      pendingNoticeList,
      queuedNoticeSwitch,
      noticeTransitionPhase,
      pendingNoticeWindowDiff,
      noticeResultSwitchRunId,
      handledNoticeRefreshReplayRequestId,
      noticeRefreshReplayRequestId,
      visual: {
        resolveNoticeImageUrl: visual.resolveNoticeImageUrl,
      },
      leaveDurationMs: NOTICE_RESULT_LEAVE_DURATION_MS,
      enterDurationMs: NOTICE_RESULT_ENTER_DURATION_MS,
      syncMountedNoticeWindow,
      setNoticeEntryPhaseMap: (phaseMap) => {
        noticeEntryPhaseMap.value = phaseMap
      },
    })

  const {
    requestActivityNoticeRefreshReplay,
    applyResolvedActivityNoticeList,
    reconcileNoticeRender,
    isNoticeRefreshPresentationSettled,
  } = useActivityNoticeResultWindowRenderRuntime({
    hasResolvedInitialActivityContent,
    visibleNotices,
    displayedNotices,
    pendingNoticeList,
    hasBootstrappedNoticeList,
    noticeResultMotionSource,
    noticeTransitionPhase,
    noticeRefreshReplayRequestId,
    handledNoticeRefreshReplayRequestId,
    queuedNoticeSwitch,
    pendingNoticeWindowDiff,
    isRemoteNoticeListLoading,
    resolveNoticeVisibleCount,
    buildNoticeStructureSignature,
    buildNoticeContentSignature,
    syncMountedNoticeWindow,
    startNoticeResultSwitch,
  })

  const { resetNoticeResultWindowForInactive, disposeNoticeResultWindow } =
    useActivityNoticeResultWindowInactiveResetRuntime({
      queuedNoticeSwitch,
      pendingNoticeWindowDiff,
      noticeTransitionPhase,
      noticeEntryPhaseMap,
      pendingNoticeList,
      noticeRemovedOverlayItems,
      handledNoticeRefreshReplayRequestId,
      noticeRefreshReplayRequestId,
      noticeQueuedInsertTimeoutIdsRef,
      noticeRemovedOverlayClearTimeoutIdRef,
      clearNoticeMountWindowSyncRaf,
      clearMountedNoticeWindow,
      clearNoticeRevealTimeouts: visual.clearNoticeRevealTimeouts,
      clearNoticeSwitchRuntimeTimeouts,
    })

  return {
    displayedNotices,
    mountedNotices,
    pendingNoticeList,
    noticeTransitionPhase,
    noticeRefreshReplayRequestId,
    noticeResultsStageRef,
    noticeTopSpacerHeight,
    noticeBottomSpacerHeight,
    noticeRemovedOverlayItems,
    noticeResultsStageStyle,
    visibleNoticeStructureSignature,
    visibleNoticeContentSignature,
    shouldShowActivityBottomEndline,
    isNoticePlaceholder,
    resolveNoticeEntryClass,
    resolveNoticeEntryStyle,
    resolveNoticeRemovedOverlayItemStyle,
    syncMountedNoticeWindow,
    resolveDisplayedNoticeVisibleEndRow,
    scheduleNoticeMountWindowSync,
    requestActivityNoticeRefreshReplay,
    applyResolvedActivityNoticeList,
    startNoticeResultSwitch,
    reconcileNoticeRender,
    isNoticeRefreshPresentationSettled,
    resetNoticeResultWindowForInactive,
    disposeNoticeResultWindow,
  }
}
