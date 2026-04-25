/**
 * Responsibility: own inactive reset and disposal cleanup for the activity notice
 * result-window runtime without touching render reconciliation or switch decisions.
 * Out of scope: geometry syncing, replay request issuance, and list diffing.
 */
import type { Ref } from 'vue'
import type {
  CardQueuePhase,
  ResultWindowDiff,
  ResultWindowOverlayItem,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'

type NoticeEntryPhase = CardQueuePhase

interface UseActivityNoticeResultWindowInactiveResetRuntimeOptions {
  queuedNoticeSwitch: Ref<ActivityNotice[] | null>
  pendingNoticeWindowDiff: Ref<ResultWindowDiff<ActivityNotice> | null>
  noticeTransitionPhase: Ref<'idle' | 'leaving' | 'entering'>
  noticeEntryPhaseMap: Ref<Record<string, NoticeEntryPhase>>
  pendingNoticeList: Ref<ActivityNotice[]>
  noticeRemovedOverlayItems: Ref<ResultWindowOverlayItem<ActivityNotice>[]>
  handledNoticeRefreshReplayRequestId: Ref<number>
  noticeRefreshReplayRequestId: Ref<number>
  noticeQueuedInsertTimeoutIdsRef: Ref<Array<ReturnType<typeof setTimeout>>>
  noticeRemovedOverlayClearTimeoutIdRef: Ref<ReturnType<typeof setTimeout> | null>
  clearNoticeMountWindowSyncRaf: () => void
  clearMountedNoticeWindow: () => void
  clearNoticeRevealTimeouts: () => void
  clearNoticeSwitchRuntimeTimeouts: () => void
}

export const useActivityNoticeResultWindowInactiveResetRuntime = (
  options: UseActivityNoticeResultWindowInactiveResetRuntimeOptions
) => {
  const resetNoticeResultWindowForInactive = () => {
    options.clearNoticeMountWindowSyncRaf()
    options.queuedNoticeSwitch.value = null
    options.pendingNoticeWindowDiff.value = null
    options.noticeTransitionPhase.value = 'idle'
    options.noticeEntryPhaseMap.value = {}
    options.pendingNoticeList.value = []
    options.clearMountedNoticeWindow()
    options.noticeRemovedOverlayItems.value = []
    options.handledNoticeRefreshReplayRequestId.value = options.noticeRefreshReplayRequestId.value
    options.clearNoticeRevealTimeouts()
  }

  const disposeNoticeResultWindow = () => {
    resetNoticeResultWindowForInactive()
    options.clearNoticeSwitchRuntimeTimeouts()
    options.noticeQueuedInsertTimeoutIdsRef.value.forEach((timeoutId) => clearTimeout(timeoutId))
    options.noticeQueuedInsertTimeoutIdsRef.value = []
    if (options.noticeRemovedOverlayClearTimeoutIdRef.value) {
      clearTimeout(options.noticeRemovedOverlayClearTimeoutIdRef.value)
      options.noticeRemovedOverlayClearTimeoutIdRef.value = null
    }
  }

  return {
    resetNoticeResultWindowForInactive,
    disposeNoticeResultWindow,
  }
}
