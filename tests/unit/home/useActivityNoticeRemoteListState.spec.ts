import { ref } from 'vue'
import { useActivityNoticeRemoteListState } from '@/pages/home/composables/activity/useActivityNoticeRemoteListState'
import type {
  ActivityNotice,
  ActivityNoticeListResult,
} from '@/models/home-rail/homeRailActivity.model'

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

  it('drops stale activity first-screen result when query changes', async () => {
    const querySnapshot = ref({
      tag: undefined as string | undefined,
      keyword: undefined as string | undefined,
      page: 1,
      pageSize: 60,
    })
    const syncResolvedSnapshot = vi.fn()
    let releaseRequest: ((value: ActivityNoticeListResult) => void) | null = null

    resolveHomeRailActivityNoticeListMock.mockImplementationOnce(
      () =>
        new Promise<ActivityNoticeListResult>((resolve) => {
          releaseRequest = resolve
        })
    )

    const state = useActivityNoticeRemoteListState({
      resolveQuerySnapshot: () => querySnapshot.value,
      syncResolvedNoticeSnapshot: syncResolvedSnapshot,
    })

    const reloadPromise = state.reloadRemoteActivityNoticeList()
    querySnapshot.value = {
      ...querySnapshot.value,
      tag: '寄售',
    }
    releaseRequest?.(
      createNoticeListResult({
        list: [createNotice('stale')],
        total: 1,
      })
    )
    await reloadPromise

    expect(state.remoteFilteredNoticeList.value).toBeNull()
    expect(syncResolvedSnapshot).not.toHaveBeenCalled()
  })

  it('drops stale activity result when panel becomes inactive', async () => {
    const isActive = ref(true)
    let releaseRequest: ((value: ActivityNoticeListResult) => void) | null = null
    const syncResolvedSnapshot = vi.fn()

    resolveHomeRailActivityNoticeListMock.mockImplementationOnce(
      () =>
        new Promise<ActivityNoticeListResult>((resolve) => {
          releaseRequest = resolve
        })
    )

    const state = useActivityNoticeRemoteListState({
      resolveIsActive: () => isActive.value,
      resolveQuerySnapshot: () => ({
        tag: undefined,
        keyword: undefined,
        page: 1,
        pageSize: 60,
      }),
      syncResolvedNoticeSnapshot: syncResolvedSnapshot,
    })

    const reloadPromise = state.reloadRemoteActivityNoticeList()
    isActive.value = false
    state.resetRemoteNoticeListForInactive()
    releaseRequest?.(
      createNoticeListResult({
        list: [createNotice('inactive')],
        total: 1,
      })
    )
    await reloadPromise

    expect(state.remoteFilteredNoticeList.value).toBeNull()
    expect(syncResolvedSnapshot).not.toHaveBeenCalled()
  })

  it('loads next activity notice page and appends unique notices', async () => {
    resolveHomeRailActivityNoticeListMock
      .mockResolvedValueOnce(
        createNoticeListResult({
          page: 1,
          total: 3,
          list: [createNotice('N-01'), createNotice('N-02')],
          etag: 'etag-page-1',
        })
      )
      .mockResolvedValueOnce(
        createNoticeListResult({
          page: 2,
          total: 3,
          list: [createNotice('N-02'), createNotice('N-03')],
          etag: 'etag-page-2',
        })
      )

    const state = useActivityNoticeRemoteListState({
      resolveQuerySnapshot: () => ({
        tag: undefined,
        keyword: undefined,
        page: 1,
        pageSize: 60,
      }),
      syncResolvedNoticeSnapshot: vi.fn(),
    })

    await state.reloadRemoteActivityNoticeList()
    const result = await state.loadMoreRemoteActivityNoticeListPage({ manual: true })

    expect(result.outcome).toBe('appended')
    expect(state.remoteFilteredNoticeList.value?.list.map((item) => item.id)).toEqual([
      'N-01',
      'N-02',
      'N-03',
    ])
    expect(resolveHomeRailActivityNoticeListMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        page: 2,
        pageSize: 60,
        ifNoneMatch: undefined,
      })
    )
  })

  it('does not reuse activity etag across query signatures', async () => {
    const querySnapshot = ref({
      tag: undefined as string | undefined,
      keyword: undefined as string | undefined,
      page: 1,
      pageSize: 60,
    })

    resolveHomeRailActivityNoticeListMock
      .mockResolvedValueOnce(
        createNoticeListResult({
          etag: 'etag-all',
        })
      )
      .mockResolvedValueOnce(
        createNoticeListResult({
          etag: 'etag-consign',
          list: [createNotice('N-02')],
        })
      )

    const state = useActivityNoticeRemoteListState({
      resolveQuerySnapshot: () => querySnapshot.value,
      syncResolvedNoticeSnapshot: vi.fn(),
    })

    await state.reloadRemoteActivityNoticeList()
    querySnapshot.value = {
      ...querySnapshot.value,
      tag: '寄售',
    }
    await state.reloadRemoteActivityNoticeList()

    expect(resolveHomeRailActivityNoticeListMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        ifNoneMatch: undefined,
      })
    )
  })
})
