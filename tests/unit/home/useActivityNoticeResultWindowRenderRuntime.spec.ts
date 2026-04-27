import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useActivityNoticeResultWindowRenderRuntime } from '@/pages/home/composables/activity/useActivityNoticeResultWindowRenderRuntime'
import type { ActivityNotice } from '@/models/home-rail/homeRailActivity.model'

const createNotice = (id: string, overrides: Partial<ActivityNotice> = {}) =>
  ({
    id,
    title: `notice-${id}`,
    category: 'activity',
    time: '2026-04-14',
    isUnread: false,
    imageUrl: `https://cdn.example.com/${id}.png`,
    ...overrides,
  }) as ActivityNotice

const buildStructureSignature = (list: ActivityNotice[]) =>
  list.map((notice) => notice.id).join('|')

const buildContentSignature = (list: ActivityNotice[]) =>
  list
    .map(
      (notice) =>
        `${notice.id}::${notice.title}::${notice.category}::${notice.time}::${notice.isUnread ? 1 : 0}::${notice.imageUrl}`
    )
    .join('|')

describe('useActivityNoticeResultWindowRenderRuntime', () => {
  it('requests refresh replay instead of switching immediately when replay is requested', () => {
    const pendingNoticeList = ref<ActivityNotice[]>([])
    const noticeRefreshReplayRequestId = ref(0)
    const startNoticeResultSwitch = vi.fn()

    const runtime = useActivityNoticeResultWindowRenderRuntime({
      hasResolvedInitialActivityContent: ref(true),
      visibleNotices: computed(() => []),
      displayedNotices: ref<ActivityNotice[]>([]),
      pendingNoticeList,
      hasBootstrappedNoticeList: ref(true),
      noticeResultMotionSource: ref<'initial-enter' | 'manual-query-switch'>('initial-enter'),
      noticeTransitionPhase: ref<'idle' | 'leaving' | 'entering'>('idle'),
      noticeRefreshReplayRequestId,
      handledNoticeRefreshReplayRequestId: ref(0),
      queuedNoticeSwitch: ref(null),
      pendingNoticeWindowDiff: ref(null),
      isRemoteNoticeListLoading: ref(false),
      resolveNoticeVisibleCount: () => 1,
      buildNoticeStructureSignature: buildStructureSignature,
      buildNoticeContentSignature: buildContentSignature,
      syncMountedNoticeWindow: vi.fn(),
      startNoticeResultSwitch,
    })

    runtime.applyResolvedActivityNoticeList(
      { list: [createNotice('a')], total: 1 },
      { replay: true, motionSource: 'manual-refresh' }
    )

    expect(pendingNoticeList.value.map((notice) => notice.id)).toEqual(['a'])
    expect(noticeRefreshReplayRequestId.value).toBe(1)
    expect(startNoticeResultSwitch).not.toHaveBeenCalled()
  })

  it('starts a switch when replay bookkeeping is pending', () => {
    const filteredNotices = ref<ActivityNotice[]>([createNotice('b')])
    const handledNoticeRefreshReplayRequestId = ref(0)
    const noticeRefreshReplayRequestId = ref(1)
    const startNoticeResultSwitch = vi.fn()

    const runtime = useActivityNoticeResultWindowRenderRuntime({
      hasResolvedInitialActivityContent: ref(true),
      visibleNotices: computed(() => filteredNotices.value),
      displayedNotices: ref<ActivityNotice[]>([createNotice('a')]),
      pendingNoticeList: ref<ActivityNotice[]>([]),
      hasBootstrappedNoticeList: ref(true),
      noticeResultMotionSource: ref<'initial-enter' | 'manual-query-switch'>('manual-query-switch'),
      noticeTransitionPhase: ref<'idle' | 'leaving' | 'entering'>('idle'),
      noticeRefreshReplayRequestId,
      handledNoticeRefreshReplayRequestId,
      queuedNoticeSwitch: ref(null),
      pendingNoticeWindowDiff: ref(null),
      isRemoteNoticeListLoading: ref(false),
      resolveNoticeVisibleCount: () => filteredNotices.value.length,
      buildNoticeStructureSignature: buildStructureSignature,
      buildNoticeContentSignature: buildContentSignature,
      syncMountedNoticeWindow: vi.fn(),
      startNoticeResultSwitch,
    })

    runtime.reconcileNoticeRender()

    expect(handledNoticeRefreshReplayRequestId.value).toBe(1)
    expect(startNoticeResultSwitch).toHaveBeenCalledWith(filteredNotices.value)
  })

  it('reports settled only when replay bookkeeping and transition state are both complete', () => {
    const runtime = useActivityNoticeResultWindowRenderRuntime({
      hasResolvedInitialActivityContent: ref(true),
      visibleNotices: computed(() => []),
      displayedNotices: ref<ActivityNotice[]>([]),
      pendingNoticeList: ref<ActivityNotice[]>([]),
      hasBootstrappedNoticeList: ref(true),
      noticeResultMotionSource: ref<'initial-enter' | 'manual-query-switch'>('initial-enter'),
      noticeTransitionPhase: ref<'idle' | 'leaving' | 'entering'>('idle'),
      noticeRefreshReplayRequestId: ref(3),
      handledNoticeRefreshReplayRequestId: ref(3),
      queuedNoticeSwitch: ref(null),
      pendingNoticeWindowDiff: ref(null),
      isRemoteNoticeListLoading: ref(false),
      resolveNoticeVisibleCount: () => 0,
      buildNoticeStructureSignature: buildStructureSignature,
      buildNoticeContentSignature: buildContentSignature,
      syncMountedNoticeWindow: vi.fn(),
      startNoticeResultSwitch: vi.fn(),
    })

    expect(runtime.isNoticeRefreshPresentationSettled(3)).toBe(true)
    expect(runtime.isNoticeRefreshPresentationSettled(4)).toBe(false)
  })
})
