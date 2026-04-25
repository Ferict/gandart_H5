/**
 * Responsibility: own the activity notice result-window switch runtime,
 * including queued handoff, leave/enter transition sequencing, and settled replay bookkeeping.
 * Out of scope: render reconciliation, geometry, and visual reveal internals.
 */
import { nextTick } from 'vue'
import {
  buildResultWindowDiff,
  type CardQueuePhase,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'

type NoticeEntryPhase = CardQueuePhase

interface UseActivityNoticeResultWindowSwitchRuntimeOptions {
  displayedNotices: { value: ActivityNotice[] }
  pendingNoticeList: { value: ActivityNotice[] }
  queuedNoticeSwitch: { value: ActivityNotice[] | null }
  noticeTransitionPhase: { value: 'idle' | 'leaving' | 'entering' }
  pendingNoticeWindowDiff: {
    value: ReturnType<typeof buildResultWindowDiff<ActivityNotice>> | null
  }
  noticeResultSwitchRunId: { value: number }
  handledNoticeRefreshReplayRequestId: { value: number }
  noticeRefreshReplayRequestId: { value: number }
  visual: {
    resolveNoticeImageUrl: (notice: ActivityNotice) => string
  }
  leaveDurationMs: number
  enterDurationMs: number
  syncMountedNoticeWindow: (items?: ActivityNotice[]) => void
  setNoticeEntryPhaseMap: (phaseMap: Record<string, NoticeEntryPhase>) => void
}

export const useActivityNoticeResultWindowSwitchRuntime = (
  options: UseActivityNoticeResultWindowSwitchRuntimeOptions
) => {
  let noticeLeaveMotionTimeout: ReturnType<typeof setTimeout> | null = null
  let noticeEnterMotionTimeout: ReturnType<typeof setTimeout> | null = null

  const clearNoticeLeaveMotionTimeout = () => {
    if (!noticeLeaveMotionTimeout) {
      return
    }

    clearTimeout(noticeLeaveMotionTimeout)
    noticeLeaveMotionTimeout = null
  }

  const clearNoticeEnterMotionTimeout = () => {
    if (!noticeEnterMotionTimeout) {
      return
    }

    clearTimeout(noticeEnterMotionTimeout)
    noticeEnterMotionTimeout = null
  }

  const startNoticeResultSwitch = async (nextList: ActivityNotice[]) => {
    options.noticeResultSwitchRunId.value += 1
    const runId = options.noticeResultSwitchRunId.value
    const nextWindow = nextList.slice()
    const diff = buildResultWindowDiff(
      options.displayedNotices.value,
      nextWindow,
      options.visual.resolveNoticeImageUrl
    )
    options.pendingNoticeWindowDiff.value = diff
    options.pendingNoticeList.value = nextWindow
    if (options.noticeTransitionPhase.value !== 'idle') {
      options.queuedNoticeSwitch.value = nextWindow
      return
    }

    if (diff.currentWindow.length === 0) {
      options.noticeTransitionPhase.value = 'entering'
      options.displayedNotices.value = diff.nextWindow.slice()
      options.setNoticeEntryPhaseMap(
        Object.fromEntries(diff.nextWindow.map((notice) => [notice.id, 'entering']))
      )
      options.syncMountedNoticeWindow(diff.nextWindow)
      await nextTick()
      if (runId !== options.noticeResultSwitchRunId.value) {
        return
      }
      await new Promise<void>((resolve) => {
        noticeEnterMotionTimeout = setTimeout(resolve, options.enterDurationMs)
      })
      if (runId !== options.noticeResultSwitchRunId.value) {
        return
      }
      options.noticeTransitionPhase.value = 'idle'
      options.setNoticeEntryPhaseMap(
        Object.fromEntries(diff.nextWindow.map((notice) => [notice.id, 'steady']))
      )
      options.pendingNoticeWindowDiff.value = null
      options.handledNoticeRefreshReplayRequestId.value = options.noticeRefreshReplayRequestId.value
      if (options.queuedNoticeSwitch.value) {
        const queuedList = options.queuedNoticeSwitch.value.slice()
        options.queuedNoticeSwitch.value = null
        void startNoticeResultSwitch(queuedList)
      }
      return
    }

    options.noticeTransitionPhase.value = 'leaving'
    options.displayedNotices.value = diff.currentWindow.slice()
    options.setNoticeEntryPhaseMap(
      Object.fromEntries(diff.currentWindow.map((notice) => [notice.id, 'leaving']))
    )
    await nextTick()
    if (runId !== options.noticeResultSwitchRunId.value) {
      return
    }
    await new Promise<void>((resolve) => {
      noticeLeaveMotionTimeout = setTimeout(resolve, options.leaveDurationMs)
    })
    if (runId !== options.noticeResultSwitchRunId.value) {
      return
    }
    options.noticeTransitionPhase.value = 'entering'
    options.displayedNotices.value = diff.nextWindow.slice()
    options.setNoticeEntryPhaseMap(
      Object.fromEntries(diff.nextWindow.map((notice) => [notice.id, 'entering']))
    )
    options.syncMountedNoticeWindow(diff.nextWindow)
    await new Promise<void>((resolve) => {
      noticeEnterMotionTimeout = setTimeout(resolve, options.enterDurationMs)
    })
    if (runId !== options.noticeResultSwitchRunId.value) {
      return
    }
    options.noticeTransitionPhase.value = 'idle'
    options.setNoticeEntryPhaseMap(
      Object.fromEntries(diff.nextWindow.map((notice) => [notice.id, 'steady']))
    )
    options.pendingNoticeWindowDiff.value = null
    options.handledNoticeRefreshReplayRequestId.value = options.noticeRefreshReplayRequestId.value
    if (options.queuedNoticeSwitch.value) {
      const queuedList = options.queuedNoticeSwitch.value.slice()
      options.queuedNoticeSwitch.value = null
      void startNoticeResultSwitch(queuedList)
    }
  }

  const clearNoticeSwitchRuntimeTimeouts = () => {
    clearNoticeLeaveMotionTimeout()
    clearNoticeEnterMotionTimeout()
  }

  return {
    startNoticeResultSwitch,
    clearNoticeSwitchRuntimeTimeouts,
  }
}
