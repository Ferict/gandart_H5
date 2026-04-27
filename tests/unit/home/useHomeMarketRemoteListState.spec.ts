import { ref } from 'vue'
import { useHomeMarketRemoteListState } from '@/pages/home/composables/home/useHomeMarketRemoteListState'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'
import type { HomeRailMarketCardListResult } from '@/services/home-rail/homeRailHomeContent.service'

const resolveHomeRailMarketCardListMock = vi.hoisted(() => vi.fn())
const logSafeErrorMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/home-rail/homeRailHomeContent.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/home-rail/homeRailHomeContent.service')>()
  return {
    ...actual,
    resolveHomeRailMarketCardList: resolveHomeRailMarketCardListMock,
  }
})

vi.mock('@/utils/safeLogger.util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/safeLogger.util')>()
  return {
    ...actual,
    logSafeError: logSafeErrorMock,
  }
})

const createMarketCard = (id: string, overrides: Partial<HomeMarketCard> = {}): HomeMarketCard => ({
  id,
  name: `card-${id}`,
  priceUnit: '￥',
  price: 100,
  listedAt: '2026-04-01T00:00:00.000Z',
  tradeVolume24h: 1,
  holderCount: 1,
  editionCode: 'E-001',
  issueCount: 1,
  categories: ['all'],
  imageUrl: '',
  visualTone: 'ink',
  target: {
    targetType: 'market_item',
    targetId: id,
  },
  ...overrides,
})

const createListResult = (
  overrides: Partial<HomeRailMarketCardListResult> = {}
): HomeRailMarketCardListResult => ({
  page: 1,
  pageSize: 15,
  total: 2,
  items: [createMarketCard('a1')],
  etag: 'etag-1',
  notModified: false,
  ...overrides,
})

describe('useHomeMarketRemoteListState', () => {
  beforeEach(() => {
    resolveHomeRailMarketCardListMock.mockReset()
    logSafeErrorMock.mockReset()
  })

  it('supports staged update consume by matching query signature', () => {
    const collection = ref<HomeMarketCard[]>([])
    const state = useHomeMarketRemoteListState({
      remotePageSize: 15,
      resolveMarketListRequestBase: () => ({
        categoryId: 'all',
      }),
      resolveMarketListQuerySnapshot: () => ({
        page: 1,
        pageSize: 15,
      }),
      resolveMarketListQuerySignature: () => 'sig-1',
      syncMarketListQuerySnapshot: vi.fn(),
      syncResolvedMarketListSnapshot: vi.fn(),
      resolveCurrentMarketCollection: () => collection.value,
      resolveCurrentPendingCollectionLength: () => collection.value.length,
      resolveCurrentMarketResultTotal: () => collection.value.length,
      setMarketCollection: (items) => {
        collection.value = items
      },
    })
    const payload = createListResult({ items: [createMarketCard('m1')] })

    state.stageMarketListUpdate(payload, 'sig-1', 'visible-update')
    expect(state.consumeStagedMarketListUpdate('sig-2')).toBeNull()

    state.stageMarketListUpdate(payload, 'sig-1', 'activation-apply')
    const consumed = state.consumeStagedMarketListUpdate('sig-1')
    expect(consumed?.payload.items[0]?.id).toBe('m1')
    expect(state.stagedMarketListUpdate.value).toBeNull()
  })

  it('reload handles notModified branch and keeps snapshot sync behavior', async () => {
    const syncQuerySnapshot = vi.fn()
    const syncResolvedSnapshot = vi.fn()
    resolveHomeRailMarketCardListMock.mockResolvedValue(
      createListResult({
        notModified: true,
        etag: 'etag-304',
        total: 0,
        items: [],
      })
    )

    const state = useHomeMarketRemoteListState({
      remotePageSize: 15,
      resolveMarketListRequestBase: () => ({
        categoryId: 'all',
      }),
      resolveMarketListQuerySnapshot: () => ({
        page: 1,
        pageSize: 15,
      }),
      resolveMarketListQuerySignature: () => 'sig-304',
      syncMarketListQuerySnapshot: syncQuerySnapshot,
      syncResolvedMarketListSnapshot: syncResolvedSnapshot,
      resolveCurrentMarketCollection: () => [],
      resolveCurrentPendingCollectionLength: () => 0,
      resolveCurrentMarketResultTotal: () => 0,
      setMarketCollection: vi.fn(),
    })

    const result = await state.reloadRemoteMarketList()

    expect(result?.notModified).toBe(true)
    expect(state.lastRemoteMarketListNotModified.value).toBe(true)
    expect(syncQuerySnapshot).toHaveBeenCalledTimes(1)
    expect(syncResolvedSnapshot).not.toHaveBeenCalled()
    expect(state.isMarketListLoading.value).toBe(false)
  })

  it('reload resolves fresh list and loadMore appends non-duplicate items', async () => {
    const collection = ref<HomeMarketCard[]>([createMarketCard('a1')])
    const setCollection = vi.fn((items: HomeMarketCard[]) => {
      collection.value = items
    })
    const syncResolvedSnapshot = vi.fn()

    resolveHomeRailMarketCardListMock
      .mockResolvedValueOnce(
        createListResult({
          page: 1,
          total: 5,
          items: [createMarketCard('a1'), createMarketCard('a2')],
          etag: 'etag-first-batch',
          notModified: false,
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 2,
          total: 5,
          items: [createMarketCard('a2'), createMarketCard('a3')],
          etag: 'etag-2',
          notModified: false,
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 3,
          total: 5,
          items: [createMarketCard('a3'), createMarketCard('a4')],
          etag: 'etag-3',
          notModified: false,
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 4,
          total: 5,
          items: [createMarketCard('a5')],
          etag: 'etag-4',
          notModified: false,
        })
      )

    const state = useHomeMarketRemoteListState({
      remotePageSize: 15,
      resolveMarketListRequestBase: () => ({
        categoryId: 'all',
      }),
      resolveMarketListQuerySnapshot: () => ({
        page: 1,
        pageSize: 15,
      }),
      resolveMarketListQuerySignature: () => 'sig-load',
      syncMarketListQuerySnapshot: vi.fn(),
      syncResolvedMarketListSnapshot: syncResolvedSnapshot,
      resolveCurrentMarketCollection: () => collection.value,
      resolveCurrentPendingCollectionLength: () => collection.value.length,
      resolveCurrentMarketResultTotal: () => 5,
      setMarketCollection: setCollection,
    })

    const reloadResult = await state.reloadRemoteMarketList()
    expect(reloadResult?.notModified).toBe(false)
    expect(reloadResult?.items.map((item) => item.id)).toEqual(['a1', 'a2', 'a3'])
    expect(state.remoteMarketListTotal.value).toBe(5)
    expect(state.marketListResolvedPage.value).toBe(2)
    expect(state.loadedMarketListItemCount.value).toBe(3)
    expect(syncResolvedSnapshot).toHaveBeenCalledTimes(1)
    collection.value = reloadResult?.items.slice() ?? []

    const appended = await state.loadMoreRemoteMarketListPage()
    expect(appended.outcome).toBe('appended')
    expect(setCollection).toHaveBeenCalled()
    expect(collection.value.map((item) => item.id)).toEqual(['a1', 'a2', 'a3', 'a4', 'a5'])
    expect(state.marketListResolvedPage.value).toBe(4)
    expect(state.loadedMarketListItemCount.value).toBe(5)
    expect(state.remoteMarketListEtag.value).toBe('etag-first-batch')
    expect(resolveHomeRailMarketCardListMock.mock.calls.map(([input]) => input.page)).toEqual([
      1, 2, 3, 4,
    ])
    expect(resolveHomeRailMarketCardListMock.mock.calls.map(([input]) => input.pageSize)).toEqual([
      15, 15, 15, 15,
    ])
  })

  it('returns false for loadMore when pending collection already reaches total', async () => {
    const state = useHomeMarketRemoteListState({
      remotePageSize: 15,
      resolveMarketListRequestBase: () => ({
        categoryId: 'all',
      }),
      resolveMarketListQuerySnapshot: () => ({
        page: 1,
        pageSize: 15,
      }),
      resolveMarketListQuerySignature: () => 'sig-limit',
      syncMarketListQuerySnapshot: vi.fn(),
      syncResolvedMarketListSnapshot: vi.fn(),
      resolveCurrentMarketCollection: () => [createMarketCard('a1')],
      resolveCurrentPendingCollectionLength: () => 1,
      resolveCurrentMarketResultTotal: () => 1,
      setMarketCollection: vi.fn(),
    })

    const canLoadMore = await state.loadMoreRemoteMarketListPage()
    expect(canLoadMore).toEqual({
      outcome: 'endline',
      totalReached: true,
    })
    expect(resolveHomeRailMarketCardListMock).not.toHaveBeenCalled()
  })

  it('does not reuse etag across market query signatures', async () => {
    const querySignature = ref('collections::all')
    const collection = ref<HomeMarketCard[]>([])

    resolveHomeRailMarketCardListMock
      .mockResolvedValueOnce(createListResult({ etag: 'etag-collections' }))
      .mockResolvedValueOnce(createListResult({ etag: 'etag-collections-page-2' }))
      .mockResolvedValueOnce(createListResult({ etag: 'etag-blind-boxes' }))
      .mockResolvedValueOnce(createListResult({ etag: 'etag-blind-boxes-page-2' }))

    const state = useHomeMarketRemoteListState({
      remotePageSize: 15,
      resolveMarketListRequestBase: () => ({
        marketKind: querySignature.value.startsWith('blindBoxes') ? 'blindBoxes' : 'collections',
        categoryId: 'all',
      }),
      resolveMarketListQuerySnapshot: () => ({
        marketKind: querySignature.value.startsWith('blindBoxes') ? 'blindBoxes' : 'collections',
        page: 1,
        pageSize: 15,
      }),
      resolveMarketListQuerySignature: () => querySignature.value,
      syncMarketListQuerySnapshot: vi.fn(),
      syncResolvedMarketListSnapshot: vi.fn(),
      resolveCurrentMarketCollection: () => collection.value,
      resolveCurrentPendingCollectionLength: () => collection.value.length,
      resolveCurrentMarketResultTotal: () => 2,
      setMarketCollection: (items) => {
        collection.value = items
      },
    })

    await state.reloadRemoteMarketList()
    querySignature.value = 'blindBoxes::all'
    await state.reloadRemoteMarketList()

    expect(resolveHomeRailMarketCardListMock).toHaveBeenNthCalledWith(
      1,
      expect.any(Object),
      expect.objectContaining({ ifNoneMatch: undefined })
    )
    expect(resolveHomeRailMarketCardListMock).toHaveBeenNthCalledWith(3, expect.any(Object), {
      ifNoneMatch: undefined,
    })
  })

  it('keeps collection backend order after load more', async () => {
    const collection = ref<HomeMarketCard[]>([])

    resolveHomeRailMarketCardListMock
      .mockResolvedValueOnce(
        createListResult({
          page: 1,
          total: 4,
          items: [createMarketCard('low', { holderCount: 1 })],
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 2,
          total: 4,
          items: [createMarketCard('mid', { holderCount: 5 })],
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 3,
          total: 4,
          items: [createMarketCard('high', { holderCount: 10 })],
        })
      )
      .mockResolvedValueOnce(createListResult({ page: 4, total: 4, items: [] }))

    const state = useHomeMarketRemoteListState({
      remotePageSize: 15,
      resolveMarketListRequestBase: () => ({
        marketKind: 'collections',
        categoryId: 'all',
      }),
      resolveMarketListQuerySnapshot: () => ({
        marketKind: 'collections',
        page: 1,
        pageSize: 15,
      }),
      resolveMarketListQuerySignature: () => 'collections::all',
      syncMarketListQuerySnapshot: vi.fn(),
      syncResolvedMarketListSnapshot: vi.fn(),
      resolveCurrentMarketCollection: () => collection.value,
      resolveCurrentPendingCollectionLength: () => collection.value.length,
      resolveCurrentMarketResultTotal: () => 3,
      setMarketCollection: (items) => {
        collection.value = items
      },
    })

    await state.reloadRemoteMarketList()
    collection.value = [
      createMarketCard('low', { holderCount: 1 }),
      createMarketCard('mid', { holderCount: 5 }),
    ]

    await state.loadMoreRemoteMarketListPage()

    expect(collection.value.map((item) => item.id)).toEqual(['low', 'mid', 'high'])
  })

  it('keeps blind box backend order after load more', async () => {
    const collection = ref<HomeMarketCard[]>([])

    resolveHomeRailMarketCardListMock
      .mockResolvedValueOnce(
        createListResult({
          page: 1,
          total: 4,
          items: [createMarketCard('low', { holderCount: 1 })],
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 2,
          total: 4,
          items: [createMarketCard('mid', { holderCount: 5 })],
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 3,
          total: 4,
          items: [createMarketCard('high', { holderCount: 10 })],
        })
      )
      .mockResolvedValueOnce(createListResult({ page: 4, total: 4, items: [] }))

    const state = useHomeMarketRemoteListState({
      remotePageSize: 15,
      resolveMarketListRequestBase: () => ({
        marketKind: 'blindBoxes',
        categoryId: 'all',
      }),
      resolveMarketListQuerySnapshot: () => ({
        marketKind: 'blindBoxes',
        page: 1,
        pageSize: 15,
      }),
      resolveMarketListQuerySignature: () => 'blindBoxes::all',
      syncMarketListQuerySnapshot: vi.fn(),
      syncResolvedMarketListSnapshot: vi.fn(),
      resolveCurrentMarketCollection: () => collection.value,
      resolveCurrentPendingCollectionLength: () => collection.value.length,
      resolveCurrentMarketResultTotal: () => 3,
      setMarketCollection: (items) => {
        collection.value = items
      },
    })

    await state.reloadRemoteMarketList()
    collection.value = [
      createMarketCard('low', { holderCount: 1 }),
      createMarketCard('mid', { holderCount: 5 }),
    ]

    await state.loadMoreRemoteMarketListPage()

    expect(collection.value.map((item) => item.id)).toEqual(['low', 'mid', 'high'])
  })

  it('does not top off a duplicate batch after fixed two-page fetch', async () => {
    const collection = ref<HomeMarketCard[]>([])

    resolveHomeRailMarketCardListMock
      .mockResolvedValueOnce(
        createListResult({
          page: 1,
          total: 5,
          items: [createMarketCard('a1')],
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 2,
          total: 5,
          items: [createMarketCard('a2')],
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 3,
          total: 5,
          items: [createMarketCard('a2')],
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 4,
          total: 5,
          items: [createMarketCard('a1')],
        })
      )

    const state = useHomeMarketRemoteListState({
      remotePageSize: 15,
      resolveMarketListRequestBase: () => ({
        marketKind: 'collections',
        categoryId: 'all',
      }),
      resolveMarketListQuerySnapshot: () => ({
        marketKind: 'collections',
        page: 1,
        pageSize: 15,
      }),
      resolveMarketListQuerySignature: () => 'collections::all',
      syncMarketListQuerySnapshot: vi.fn(),
      syncResolvedMarketListSnapshot: vi.fn(),
      resolveCurrentMarketCollection: () => collection.value,
      resolveCurrentPendingCollectionLength: () => collection.value.length,
      resolveCurrentMarketResultTotal: () => 5,
      setMarketCollection: (items) => {
        collection.value = items
      },
    })

    await state.reloadRemoteMarketList()
    collection.value = [createMarketCard('a1'), createMarketCard('a2')]

    const result = await state.loadMoreRemoteMarketListPage()

    expect(result).toEqual({
      outcome: 'no-progress',
      pageAdvanced: true,
      totalReached: false,
    })
    expect(collection.value.map((item) => item.id)).toEqual(['a1', 'a2'])
    expect(state.marketListResolvedPage.value).toBe(4)
    expect(resolveHomeRailMarketCardListMock.mock.calls.map(([input]) => input.page)).toEqual([
      1, 2, 3, 4,
    ])
  })
})
