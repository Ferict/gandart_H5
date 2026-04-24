import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useActivityNoticeResultWindowSwitchRuntime } from '@/pages/home/composables/activity/useActivityNoticeResultWindowSwitchRuntime'
import type { ActivityNotice } from '@/models/home-rail/homeRailActivity.model'

const createNotice = (id: string, imageUrl = `https://cdn.example.com/${id}.png`) =>
  ({
    id,
    title: `notice-${id}`,
    category: 'system',
    time: '2026-04-14',
    isUnread: true,
    imageUrl,
  }) as ActivityNotice

const createHarness = () => {
  const displayedNotices = ref<ActivityNotice[]>([])
  const pendingNoticeList = ref<ActivityNotice[]>([])
  const queuedNoticeSwitch = ref<ActivityNotice[] | null>(null)
  const noticeTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('idle')
  const pendingNoticeWindowDiff = ref(null)
  const noticeResultSwitchRunId = ref(0)
  const handledNoticeRefreshReplayRequestId = ref(0)
  const noticeRefreshReplayRequestId = ref(1)
  const mountedNotices = ref<ActivityNotice[]>([])
  const noticeEntryPhaseMap = ref<
    Record<string, 'steady' | 'entering' | 'leaving' | 'replay-prep' | 'replay-entering'>
  >({})

  const syncMountedNoticeWindow = vi.fn((items: ActivityNotice[] = displayedNotices.value) => {
    mountedNotices.value = items.slice()
  })
  const setNoticeEntryPhaseMap = vi.fn((phaseMap) => {
    noticeEntryPhaseMap.value = phaseMap
  })

  const runtime = useActivityNoticeResultWindowSwitchRuntime({
    displayedNotices,
    pendingNoticeList,
    queuedNoticeSwitch,
    noticeTransitionPhase,
    pendingNoticeWindowDiff,
    noticeResultSwitchRunId,
    handledNoticeRefreshReplayRequestId,
    noticeRefreshReplayRequestId,
    visual: {
      resolveNoticeImageUrl: (notice) => notice.imageUrl,
    },
    leaveDurationMs: 120,
    enterDurationMs: 80,
    syncMountedNoticeWindow,
    setNoticeEntryPhaseMap,
  })

  return {
    runtime,
    refs: {
      displayedNotices,
      pendingNoticeList,
      queuedNoticeSwitch,
      noticeTransitionPhase,
      pendingNoticeWindowDiff,
      noticeResultSwitchRunId,
      handledNoticeRefreshReplayRequestId,
      noticeRefreshReplayRequestId,
      mountedNotices,
      noticeEntryPhaseMap,
    },
    spies: {
      syncMountedNoticeWindow,
      setNoticeEntryPhaseMap,
    },
  }
}

describe('useActivityNoticeResultWindowSwitchRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('queues new window while current transition is active', async () => {
    const harness = createHarness()
    harness.refs.noticeTransitionPhase.value = 'entering'
    const nextList = [createNotice('a')]

    await harness.runtime.startNoticeResultSwitch(nextList)

    expect(harness.refs.queuedNoticeSwitch.value?.map((item) => item.id)).toEqual(['a'])
    expect(harness.refs.pendingNoticeList.value.map((item) => item.id)).toEqual(['a'])
  })

  it('finishes direct enter when current window is empty', async () => {
    vi.useFakeTimers()
    const harness = createHarness()
    const nextList = [createNotice('a')]

    const promise = harness.runtime.startNoticeResultSwitch(nextList)
    await vi.runAllTimersAsync()
    await promise

    expect(harness.refs.noticeTransitionPhase.value).toBe('idle')
    expect(harness.refs.displayedNotices.value.map((item) => item.id)).toEqual(['a'])
    expect(harness.refs.noticeEntryPhaseMap.value).toEqual({ a: 'steady' })
    expect(harness.refs.pendingNoticeWindowDiff.value).toBeNull()
    expect(harness.refs.handledNoticeRefreshReplayRequestId.value).toBe(1)
    expect(harness.spies.syncMountedNoticeWindow).toHaveBeenCalledWith(
      expect.arrayContaining([expect.objectContaining({ id: 'a' })])
    )
  })

  it('runs leaving then entering when current window is not empty', async () => {
    vi.useFakeTimers()
    const harness = createHarness()
    harness.refs.displayedNotices.value = [createNotice('a')]
    const nextList = [createNotice('b')]

    const promise = harness.runtime.startNoticeResultSwitch(nextList)
    await vi.runAllTimersAsync()
    await promise

    expect(harness.refs.noticeTransitionPhase.value).toBe('idle')
    expect(harness.refs.displayedNotices.value.map((item) => item.id)).toEqual(['b'])
    expect(harness.refs.noticeEntryPhaseMap.value).toEqual({ b: 'steady' })
    expect(harness.refs.handledNoticeRefreshReplayRequestId.value).toBe(1)
  })
})
