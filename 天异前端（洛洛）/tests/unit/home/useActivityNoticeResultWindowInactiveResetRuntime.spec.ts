import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { useActivityNoticeResultWindowInactiveResetRuntime } from '@/pages/home/composables/activity/useActivityNoticeResultWindowInactiveResetRuntime'

describe('useActivityNoticeResultWindowInactiveResetRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('clears pending state during inactive reset', () => {
    const queuedNoticeSwitch = ref([{ id: 'queued-a' }] as never[])
    const pendingNoticeWindowDiff = ref({ nextWindow: [] } as never)
    const noticeTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('entering')
    const noticeEntryPhaseMap = ref({ a: 'entering' } as Record<string, never>)
    const pendingNoticeList = ref([{ id: 'pending-a' }] as never[])
    const noticeRemovedOverlayItems = ref([{}] as never[])
    const handledNoticeRefreshReplayRequestId = ref(1)
    const noticeRefreshReplayRequestId = ref(3)

    const runtime = useActivityNoticeResultWindowInactiveResetRuntime({
      queuedNoticeSwitch,
      pendingNoticeWindowDiff,
      noticeTransitionPhase,
      noticeEntryPhaseMap,
      pendingNoticeList,
      noticeRemovedOverlayItems,
      handledNoticeRefreshReplayRequestId,
      noticeRefreshReplayRequestId,
      noticeQueuedInsertTimeoutIdsRef: ref([]),
      noticeRemovedOverlayClearTimeoutIdRef: ref(null),
      clearNoticeMountWindowSyncRaf: vi.fn(),
      clearMountedNoticeWindow: vi.fn(),
      clearNoticeRevealTimeouts: vi.fn(),
      clearNoticeSwitchRuntimeTimeouts: vi.fn(),
    })

    runtime.resetNoticeResultWindowForInactive()

    expect(queuedNoticeSwitch.value).toBeNull()
    expect(pendingNoticeWindowDiff.value).toBeNull()
    expect(noticeTransitionPhase.value).toBe('idle')
    expect(noticeEntryPhaseMap.value).toEqual({})
    expect(pendingNoticeList.value).toEqual([])
    expect(noticeRemovedOverlayItems.value).toEqual([])
    expect(handledNoticeRefreshReplayRequestId.value).toBe(3)
  })

  it('clears queued insert timers and overlay clear timeout during dispose', () => {
    vi.useFakeTimers()
    const timeoutA = setTimeout(() => undefined, 1000)
    const timeoutB = setTimeout(() => undefined, 1000)
    const overlayTimeout = setTimeout(() => undefined, 1000)
    const clearNoticeSwitchRuntimeTimeouts = vi.fn()

    const runtime = useActivityNoticeResultWindowInactiveResetRuntime({
      queuedNoticeSwitch: ref(null),
      pendingNoticeWindowDiff: ref(null),
      noticeTransitionPhase: ref<'idle' | 'leaving' | 'entering'>('idle'),
      noticeEntryPhaseMap: ref({}),
      pendingNoticeList: ref([]),
      noticeRemovedOverlayItems: ref([]),
      handledNoticeRefreshReplayRequestId: ref(0),
      noticeRefreshReplayRequestId: ref(0),
      noticeQueuedInsertTimeoutIdsRef: ref([timeoutA, timeoutB]),
      noticeRemovedOverlayClearTimeoutIdRef: ref(overlayTimeout),
      clearNoticeMountWindowSyncRaf: vi.fn(),
      clearMountedNoticeWindow: vi.fn(),
      clearNoticeRevealTimeouts: vi.fn(),
      clearNoticeSwitchRuntimeTimeouts,
    })

    runtime.disposeNoticeResultWindow()

    expect(clearNoticeSwitchRuntimeTimeouts).toHaveBeenCalledTimes(1)
    expect(runtime).toBeDefined()
  })
})
