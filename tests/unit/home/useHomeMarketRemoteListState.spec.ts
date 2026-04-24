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

const createMarketCard = (id: string): HomeMarketCard => ({
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
})

const createListResult = (
  overrides: Partial<HomeRailMarketCardListResult> = {}
): HomeRailMarketCardListResult => ({
  page: 1,
  pageSize: 60,
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
      remotePageSize: 32,
      resolveMarketListRequestBase: () => ({
        categoryId: 'all',
        sort: { field: 'listedAt', direction: 'desc' },
      }),
      resolveMarketListQuerySnapshot: () => ({
        sort: { field: 'listedAt', direction: 'desc' },
        page: 1,
        pageSize: 60,
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
      remotePageSize: 32,
      resolveMarketListRequestBase: () => ({
        categoryId: 'all',
        sort: { field: 'listedAt', direction: 'desc' },
      }),
      resolveMarketListQuerySnapshot: () => ({
        sort: { field: 'listedAt', direction: 'desc' },
        page: 1,
        pageSize: 60,
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
          total: 3,
          items: [createMarketCard('a1'), createMarketCard('a2')],
          etag: 'etag-1',
          notModified: false,
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 2,
          total: 3,
          items: [createMarketCard('a2'), createMarketCard('a3')],
          etag: 'etag-2',
          notModified: false,
        })
      )

    const state = useHomeMarketRemoteListState({
      remotePageSize: 32,
      resolveMarketListRequestBase: () => ({
        categoryId: 'all',
        sort: { field: 'listedAt', direction: 'desc' },
      }),
      resolveMarketListQuerySnapshot: () => ({
        sort: { field: 'listedAt', direction: 'desc' },
        page: 1,
        pageSize: 60,
      }),
      resolveMarketListQuerySignature: () => 'sig-load',
      syncMarketListQuerySnapshot: vi.fn(),
      syncResolvedMarketListSnapshot: syncResolvedSnapshot,
      resolveCurrentMarketCollection: () => collection.value,
      resolveCurrentPendingCollectionLength: () => collection.value.length,
      resolveCurrentMarketResultTotal: () => 3,
      setMarketCollection: setCollection,
    })

    const reloadResult = await state.reloadRemoteMarketList()
    expect(reloadResult?.notModified).toBe(false)
    expect(state.remoteMarketListTotal.value).toBe(3)
    expect(state.marketListResolvedPage.value).toBe(1)
    expect(syncResolvedSnapshot).toHaveBeenCalledTimes(1)

    const appended = await state.loadMoreRemoteMarketListPage()
    expect(appended.outcome).toBe('appended')
    expect(setCollection).toHaveBeenCalled()
    expect(collection.value.map((item) => item.id)).toEqual(['a1', 'a2', 'a3'])
    expect(state.marketListResolvedPage.value).toBe(2)
    expect(state.remoteMarketListEtag.value).toBe('etag-2')
    expect(resolveHomeRailMarketCardListMock).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        page: 1,
        pageSize: 32,
      }),
      expect.any(Object)
    )
    expect(resolveHomeRailMarketCardListMock).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        page: 2,
        pageSize: 32,
      })
    )
  })

  it('returns false for loadMore when pending collection already reaches total', async () => {
    const state = useHomeMarketRemoteListState({
      remotePageSize: 32,
      resolveMarketListRequestBase: () => ({
        categoryId: 'all',
        sort: { field: 'listedAt', direction: 'desc' },
      }),
      resolveMarketListQuerySnapshot: () => ({
        sort: { field: 'listedAt', direction: 'desc' },
        page: 1,
        pageSize: 60,
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
})
