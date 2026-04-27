import type {
  HomeRailMarketCardListResult,
  ResolveHomeRailMarketCardListInput,
} from '@/services/home-rail/homeRailHomeContent.service'
import type {
  HomeRailProfileAssetListResult,
  ResolveHomeRailProfileAssetListInput,
} from '@/services/home-rail/homeRailProfileContent.service'

const resolveHomeRailMarketCardListMock = vi.hoisted(() => vi.fn())
const resolveHomeRailProfileAssetListMock = vi.hoisted(() => vi.fn())
const persistHomeMarketListToPersistentCacheMock = vi.hoisted(() => vi.fn())
const persistProfileAssetListToPersistentCacheMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/home-rail/homeRailHomeContent.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/home-rail/homeRailHomeContent.service')>()
  return {
    ...actual,
    resolveHomeRailMarketCardList: resolveHomeRailMarketCardListMock,
  }
})

vi.mock('@/services/home-rail/homeRailProfileContent.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/home-rail/homeRailProfileContent.service')>()
  return {
    ...actual,
    resolveHomeRailProfileAssetList: resolveHomeRailProfileAssetListMock,
  }
})

vi.mock(
  '@/services/home-rail/homeRailPersistentCacheIntegration.service',
  async (importOriginal) => {
    const actual =
      await importOriginal<
        typeof import('@/services/home-rail/homeRailPersistentCacheIntegration.service')
      >()
    return {
      ...actual,
      persistHomeMarketListToPersistentCache: persistHomeMarketListToPersistentCacheMock,
      persistProfileAssetListToPersistentCache: persistProfileAssetListToPersistentCacheMock,
    }
  }
)

const createMarketListResult = (
  count: number,
  overrides: Partial<HomeRailMarketCardListResult> = {}
): HomeRailMarketCardListResult => ({
  page: 1,
  pageSize: 15,
  total: 60,
  items: Array.from({ length: count }, (_, index) => ({
    id: `market-${index + 1}`,
    name: `market-${index + 1}`,
    priceUnit: 'CNY',
    price: 10,
    listedAt: '2026-04-01T00:00:00.000Z',
    tradeVolume24h: 1,
    holderCount: 1,
    editionCode: 'A-1',
    issueCount: 1,
    categories: ['all'],
    imageUrl: '',
    visualTone: 'ink',
    target: {
      targetType: 'market_item' as const,
      targetId: `market-${index + 1}`,
    },
  })),
  etag: 'etag-next',
  notModified: false,
  ...overrides,
})

const createProfileListResult = (
  count: number,
  overrides: Partial<HomeRailProfileAssetListResult> = {}
): HomeRailProfileAssetListResult => ({
  page: 1,
  pageSize: 15,
  total: 60,
  items: Array.from({ length: count }, (_, index) => ({
    id: `asset-${index + 1}`,
    name: `asset-${index + 1}`,
    date: '2026-04-01T00:00:00.000Z',
    subCategory: 'default',
    holdingsCount: 1,
    priceUnit: 'CNY',
    price: 10,
    editionCode: 'A-1',
    issueCount: 1,
    imageUrl: '',
    visualTone: 'ink',
  })),
  etag: 'etag-next',
  notModified: false,
  ...overrides,
})

describe('homeRailUpdateCoordinator deep pagination stale-only', () => {
  beforeEach(() => {
    vi.resetModules()
    resolveHomeRailMarketCardListMock.mockReset()
    resolveHomeRailProfileAssetListMock.mockReset()
    persistHomeMarketListToPersistentCacheMock.mockReset()
    persistProfileAssetListToPersistentCacheMock.mockReset()
  })

  it('keeps home market stale-only after loaded items exceed the first transport batch', async () => {
    const coordinator = await import('@/services/home-rail/homeRailUpdateCoordinator.service')
    const query: ResolveHomeRailMarketCardListInput = {
      marketKind: 'collections',
      page: 1,
      pageSize: 15,
    }

    coordinator.syncHomeRailHomeMarketQuerySnapshot(query)
    coordinator.syncHomeRailHomeMarketListSnapshot(
      query,
      createMarketListResult(31, {
        page: 4,
        etag: 'etag-current',
      }),
      'etag-current',
      {
        isBeyondFirstTransportBatch: true,
      }
    )
    resolveHomeRailMarketCardListMock.mockResolvedValueOnce(
      createMarketListResult(30, {
        page: 2,
        etag: 'etag-latest',
      })
    )

    await coordinator.triggerHomeRailBackgroundUpdateCheck()

    expect(coordinator.resolveHomeRailHomeVisibleUpdate().marketList).toBeNull()
    const activation = await coordinator.resolveHomeRailHomeActivationUpdate({
      allowNetworkFallback: false,
    })
    expect(activation.marketList).toBeNull()
  })

  it('keeps profile asset stale-only after loaded items exceed the first transport batch', async () => {
    const coordinator = await import('@/services/home-rail/homeRailUpdateCoordinator.service')
    const query: ResolveHomeRailProfileAssetListInput = {
      categoryId: 'collections',
      page: 1,
      pageSize: 15,
    }

    coordinator.syncHomeRailProfileAssetQuerySnapshot(query)
    coordinator.syncHomeRailProfileAssetListSnapshot(
      query,
      createProfileListResult(31, {
        page: 4,
        etag: 'etag-current',
      }),
      'etag-current',
      {
        isBeyondFirstTransportBatch: true,
      }
    )
    resolveHomeRailProfileAssetListMock.mockResolvedValueOnce(
      createProfileListResult(30, {
        page: 2,
        etag: 'etag-latest',
      })
    )

    await coordinator.triggerHomeRailBackgroundUpdateCheck()

    expect(coordinator.resolveHomeRailProfileVisibleUpdate().assetList).toBeNull()
    const activation = await coordinator.resolveHomeRailProfileActivationUpdate({
      allowNetworkFallback: false,
    })
    expect(activation.assetList).toBeNull()
  })
})
