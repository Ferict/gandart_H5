import { computed, ref } from 'vue'
import { useHomeRailActivityNoticeLoadMore } from '@/pages/home/composables/activity/useHomeRailActivityNoticeLoadMore'
import type {
  ActivityNotice,
  ActivityNoticeListResult,
} from '@/models/home-rail/homeRailActivity.model'

const createNotice = (id: string): ActivityNotice => ({
  id,
  title: `notice-${id}`,
  category: '寄售',
  publishedAt: '2026-04-01T00:00:00.000Z',
  time: '04-01 08:00',
  isUnread: true,
  target: {
    targetType: 'notice',
    targetId: id,
  },
})

const createNoticeList = (
  list: ActivityNotice[],
  total = list.length
): ActivityNoticeListResult => ({
  resourceType: 'notice',
  page: 2,
  pageSize: 60,
  total,
  list,
})

describe('useHomeRailActivityNoticeLoadMore', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reveals the next local notice batch before requesting another remote page', async () => {
    const loadedNotices = Array.from({ length: 24 }, (_, index) =>
      createNotice(`N-${String(index + 1).padStart(2, '0')}`)
    )
    const displayedNotices = ref(loadedNotices.slice(0, 12))
    const remoteFilteredNoticeList = ref<ActivityNoticeListResult | null>(
      createNoticeList(loadedNotices, 40)
    )
    const filteredNotices = computed(() => remoteFilteredNoticeList.value?.list ?? [])
    const noticeVisibleCount = ref(12)
    const applyResolvedActivityNoticeList = vi.fn()
    const loadMoreRemoteActivityNoticeListPage = vi.fn(async () => ({
      outcome: 'appended' as const,
    }))

    const runtime = useHomeRailActivityNoticeLoadMore({
      isActive: computed(() => true),
      displayedNotices,
      filteredNotices,
      remoteFilteredNoticeList,
      resolvedNoticeTotal: computed(() => 40),
      noticeVisibleCount,
      revealStepCount: 12,
      isRemoteNoticeListLoading: ref(false),
      isNoticePaginationLoading: ref(false),
      resolveDisplayedNoticeVisibleEndRow: () => 11,
      loadMoreRemoteActivityNoticeListPage,
      applyResolvedActivityNoticeList,
    })

    await runtime.appendActivityNotices()

    expect(loadMoreRemoteActivityNoticeListPage).not.toHaveBeenCalled()
    expect(noticeVisibleCount.value).toBe(24)
    expect(applyResolvedActivityNoticeList).toHaveBeenCalledWith(
      {
        list: loadedNotices,
        total: 40,
      },
      {
        motionSource: 'load-more',
      }
    )
  })

  it('loads next activity notice page near footer after local reveal is exhausted', async () => {
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', vi.fn())

    const loadedNotices = Array.from({ length: 24 }, (_, index) =>
      createNotice(`N-${String(index + 1).padStart(2, '0')}`)
    )
    const displayedNotices = ref(loadedNotices.slice())
    const remoteFilteredNoticeList = ref<ActivityNoticeListResult | null>(null)
    const filteredNotices = computed(() => remoteFilteredNoticeList.value?.list ?? [])
    const noticeVisibleCount = ref(24)
    const applyResolvedActivityNoticeList = vi.fn()
    const loadMoreRemoteActivityNoticeListPage = vi.fn(async () => {
      remoteFilteredNoticeList.value = createNoticeList(
        [
          ...loadedNotices,
          createNotice('N-25'),
          createNotice('N-26'),
          createNotice('N-27'),
          createNotice('N-28'),
          createNotice('N-29'),
          createNotice('N-30'),
        ],
        30
      )
      return {
        outcome: 'appended' as const,
      }
    })

    const runtime = useHomeRailActivityNoticeLoadMore({
      isActive: computed(() => true),
      displayedNotices,
      filteredNotices,
      remoteFilteredNoticeList,
      resolvedNoticeTotal: computed(() => 30),
      noticeVisibleCount,
      revealStepCount: 12,
      isRemoteNoticeListLoading: ref(false),
      isNoticePaginationLoading: ref(false),
      resolveDisplayedNoticeVisibleEndRow: () => 23,
      loadMoreRemoteActivityNoticeListPage,
      applyResolvedActivityNoticeList,
    })

    runtime.scheduleActivityNoticeLoadMoreObserver()
    await Promise.resolve()

    expect(loadMoreRemoteActivityNoticeListPage).toHaveBeenCalledWith({})
    expect(noticeVisibleCount.value).toBe(30)
    expect(applyResolvedActivityNoticeList).toHaveBeenCalledWith(
      {
        list: remoteFilteredNoticeList.value?.list,
        total: 30,
      },
      {
        motionSource: 'load-more',
      }
    )
  })

  it('bottom retry calls load more instead of page 1 reload', async () => {
    const remoteFilteredNoticeList = ref<ActivityNoticeListResult | null>(
      createNoticeList([createNotice('N-01')], 2)
    )
    const filteredNotices = computed(() => remoteFilteredNoticeList.value?.list ?? [])
    const loadMoreRemoteActivityNoticeListPage = vi.fn(async () => ({
      outcome: 'no-progress' as const,
      pageAdvanced: false,
    }))

    const runtime = useHomeRailActivityNoticeLoadMore({
      isActive: computed(() => true),
      displayedNotices: ref([createNotice('N-01')]),
      filteredNotices,
      remoteFilteredNoticeList,
      resolvedNoticeTotal: computed(() => 2),
      noticeVisibleCount: ref(1),
      revealStepCount: 12,
      isRemoteNoticeListLoading: ref(false),
      isNoticePaginationLoading: ref(false),
      resolveDisplayedNoticeVisibleEndRow: () => 0,
      loadMoreRemoteActivityNoticeListPage,
      applyResolvedActivityNoticeList: vi.fn(),
    })

    await runtime.handleActivityBottomRetry()

    expect(loadMoreRemoteActivityNoticeListPage).toHaveBeenCalledWith({ manual: true })
  })
})
