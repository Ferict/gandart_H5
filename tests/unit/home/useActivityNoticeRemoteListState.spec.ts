import { ref } from 'vue'
import { useActivityNoticeRemoteListState } from '@/pages/home/composables/activity/useActivityNoticeRemoteListState'
import type { ActivityNoticeListResult } from '@/models/home-rail/homeRailActivity.model'

const resolveHomeRailActivityNoticeListMock = vi.hoisted(() => vi.fn())
const logSafeErrorMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/home-rail/homeRailActivityContent.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/home-rail/homeRailActivityContent.service')>()
  return {
    ...actual,
    resolveHomeRailActivityNoticeList: resolveHomeRailActivityNoticeListMock,
  }
})

vi.mock('@/utils/safeLogger.util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/safeLogger.util')>()
  return {
    ...actual,
    logSafeError: logSafeErrorMock,
  }
})

const createNoticeListResult = (
  overrides: Partial<ActivityNoticeListResult & { etag?: string; notModified?: boolean }> = {}
) => ({
  resourceType: 'notice' as const,
  page: 1,
  pageSize: 60,
  total: 1,
  list: [
    {
      id: 'N-01',
      title: '公告测试',
      category: '寄售',
      publishedAt: '2026-04-01T00:00:00.000Z',
      time: '04-01 08:00',
      isUnread: true,
      target: {
        targetType: 'notice' as const,
        targetId: 'N-01',
      },
    },
  ],
  etag: 'etag-1',
  notModified: false,
  ...overrides,
})

const stubImmediateAnimationFrame = () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
}

describe('useActivityNoticeRemoteListState', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  beforeEach(() => {
    resolveHomeRailActivityNoticeListMock.mockReset()
    logSafeErrorMock.mockReset()
  })

  it('marks 304 without matching cache as unresolved so panel can fall back to scene notices', async () => {
    vi.useFakeTimers()
    stubImmediateAnimationFrame()
    const querySnapshot = ref({
      tag: undefined,
      keyword: undefined,
      dateRange: null,
      page: 1,
      pageSize: 60,
    })
    const syncResolvedSnapshot = vi.fn()
    const state = useActivityNoticeRemoteListState({
      resolveQuerySnapshot: () => querySnapshot.value,
      syncResolvedNoticeSnapshot: syncResolvedSnapshot,
    })

    resolveHomeRailActivityNoticeListMock.mockResolvedValueOnce(
      createNoticeListResult({
        etag: 'etag-all',
      })
    )

    const firstResult = await state.reloadRemoteActivityNoticeList()
    expect(firstResult?.notModified).toBe(false)
    expect(state.hasResolvedRemoteNoticeList.value).toBe(true)
    expect(state.remoteFilteredNoticeList.value?.list[0]?.id).toBe('N-01')

    querySnapshot.value = {
      tag: '寄售',
      keyword: undefined,
      dateRange: null,
      page: 1,
      pageSize: 60,
    }
    resolveHomeRailActivityNoticeListMock.mockResolvedValue(
      createNoticeListResult({
        total: 0,
        list: [],
        etag: 'etag-consign',
        notModified: true,
      })
    )

    const nextResultPromise = state.reloadRemoteActivityNoticeList()
    await vi.advanceTimersByTimeAsync(800 + 1600)
    const nextResult = await nextResultPromise

    expect(nextResult?.notModified).toBe(true)
    expect(state.hasResolvedRemoteNoticeList.value).toBe(false)
    expect(state.remoteFilteredNoticeList.value?.list[0]?.id).toBe('N-01')
    expect(syncResolvedSnapshot).toHaveBeenCalledTimes(1)
  })

  it('tracks first-screen loading and first-screen error for empty list', async () => {
    const state = useActivityNoticeRemoteListState({
      resolveQuerySnapshot: () => ({
        tag: undefined,
        keyword: undefined,
        dateRange: null,
        page: 1,
        pageSize: 40,
      }),
      syncResolvedNoticeSnapshot: vi.fn(),
    })

    let releaseRequest: ((value: unknown) => void) | null = null
    resolveHomeRailActivityNoticeListMock.mockImplementationOnce(
      () =>
        new Promise((resolve) => {
          releaseRequest = resolve
        })
    )

    const reloadPromise = state.reloadRemoteActivityNoticeList()
    await Promise.resolve()

    expect(state.isRemoteNoticeListLoading.value).toBe(true)
    expect(state.isFirstScreenRemoteNoticeListLoading.value).toBe(true)
    expect(state.isNoticePaginationLoading.value).toBe(false)

    releaseRequest?.(createNoticeListResult({ list: [], total: 0 }))
    await reloadPromise

    const freshState = useActivityNoticeRemoteListState({
      resolveQuerySnapshot: () => ({
        tag: undefined,
        keyword: undefined,
        dateRange: null,
        page: 1,
        pageSize: 40,
      }),
      syncResolvedNoticeSnapshot: vi.fn(),
    })

    resolveHomeRailActivityNoticeListMock.mockRejectedValueOnce(new Error('boom'))
    await freshState.reloadRemoteActivityNoticeList()

    expect(freshState.hasFirstScreenRemoteNoticeListError.value).toBe(true)
    expect(freshState.hasNoticePaginationError.value).toBe(false)
    expect(freshState.remoteNoticeListErrorMessage.value).toContain('加载失败')
  })

  it('tracks pagination error when list already has data', async () => {
    vi.useFakeTimers()
    stubImmediateAnimationFrame()
    const state = useActivityNoticeRemoteListState({
      resolveQuerySnapshot: () => ({
        tag: undefined,
        keyword: undefined,
        dateRange: null,
        page: 1,
        pageSize: 60,
      }),
      syncResolvedNoticeSnapshot: vi.fn(),
    })

    resolveHomeRailActivityNoticeListMock.mockResolvedValueOnce(
      createNoticeListResult({
        list: [createNoticeListResult().list[0]],
        total: 1,
        etag: 'etag-initial',
      })
    )
    await state.reloadRemoteActivityNoticeList()

    resolveHomeRailActivityNoticeListMock.mockRejectedValue(new Error('pagination failed'))
    const resultPromise = state.reloadRemoteActivityNoticeList()
    await vi.advanceTimersByTimeAsync(800 + 1600 + 3200)
    const result = await resultPromise

    expect(result).toBeNull()
    expect(state.hasResolvedRemoteNoticeList.value).toBe(true)
    expect(state.remoteFilteredNoticeList.value?.list).toHaveLength(1)
    expect(state.remoteFilteredNoticeList.value?.list[0]?.id).toBe('N-01')
    expect(state.hasFirstScreenRemoteNoticeListError.value).toBe(false)
    expect(state.hasNoticePaginationError.value).toBe(true)
    expect(state.isFirstScreenRemoteNoticeListLoading.value).toBe(false)
    expect(state.isNoticePaginationLoading.value).toBe(false)
    expect(logSafeErrorMock).toHaveBeenCalledTimes(4)
  })
})
