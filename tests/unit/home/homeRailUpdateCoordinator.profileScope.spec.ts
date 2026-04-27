import type { RailSceneResolvedContent } from '@/services/home-rail/homeRailPageReloadPolicy.service'
import type { HomeRailProfileContent } from '@/models/home-rail/homeRailProfile.model'
import type { HomeRailProfileAssetListResult } from '@/services/home-rail/homeRailProfileContent.service'

const resolveHomeRailProfileContentMock = vi.hoisted(() => vi.fn())
const resolveHomeRailProfileAssetListMock = vi.hoisted(() => vi.fn())
const persistProfileSceneToPersistentCacheMock = vi.hoisted(() => vi.fn())
const persistProfileAssetListToPersistentCacheMock = vi.hoisted(() => vi.fn())
const transitionHomeRailProfileUserScopeMock = vi.hoisted(() => vi.fn())
const resolveCurrentHomeRailProfileUserScopeMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/home-rail/homeRailProfileContent.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/home-rail/homeRailProfileContent.service')>()
  return {
    ...actual,
    resolveHomeRailProfileContent: resolveHomeRailProfileContentMock,
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
      persistProfileSceneToPersistentCache: persistProfileSceneToPersistentCacheMock,
      persistProfileAssetListToPersistentCache: persistProfileAssetListToPersistentCacheMock,
      transitionHomeRailProfileUserScope: transitionHomeRailProfileUserScopeMock,
      resolveCurrentHomeRailProfileUserScope: resolveCurrentHomeRailProfileUserScopeMock,
    }
  }
)

const createProfileSceneResolved = (
  address: string
): RailSceneResolvedContent<HomeRailProfileContent> => ({
  content: {
    summary: {
      displayName: 'Profile',
      summary: '',
      currency: 'CNY',
      totalValue: '10',
      holdings: '1',
      address,
    },
    categories: [],
    assets: {
      collections: [],
      blindBoxes: [],
    },
  },
  meta: {
    version: 1,
    updatedAt: '2026-04-03T00:00:00.000Z',
    signature: `sig-${address}`,
  },
})

const createProfileListResult = (): HomeRailProfileAssetListResult => ({
  page: 1,
  pageSize: 32,
  total: 1,
  items: [
    {
      id: 'asset-1',
      name: 'Asset 1',
      date: '2026-04-03T00:00:00.000Z',
      subCategory: 'default',
      holdingsCount: 1,
      priceUnit: '￥',
      price: 10,
      editionCode: 'A-1',
      issueCount: 1,
      imageUrl: '',
      visualTone: 'ink',
    },
  ],
  etag: 'etag-profile-list',
  notModified: false,
})

const flushMicrotasks = async () => {
  await Promise.resolve()
  await Promise.resolve()
  await Promise.resolve()
}

describe('homeRailUpdateCoordinator profile request scope persistence', () => {
  beforeEach(() => {
    vi.resetModules()
    resolveHomeRailProfileContentMock.mockReset()
    resolveHomeRailProfileAssetListMock.mockReset()
    persistProfileSceneToPersistentCacheMock.mockReset()
    persistProfileAssetListToPersistentCacheMock.mockReset()
    transitionHomeRailProfileUserScopeMock.mockReset()
    resolveCurrentHomeRailProfileUserScopeMock.mockReset()
  })

  it('persists profile scene and list using their own request scopes during coordinator prefetch', async () => {
    let currentUserScope = '0xold'
    let resolveSceneRequest:
      | ((value: RailSceneResolvedContent<HomeRailProfileContent>) => void)
      | null = null
    let resolveListRequest: ((value: HomeRailProfileAssetListResult) => void) | null = null

    resolveCurrentHomeRailProfileUserScopeMock.mockImplementation(() => currentUserScope)
    transitionHomeRailProfileUserScopeMock.mockImplementation((address: string) => {
      currentUserScope = address.trim().toLowerCase()
      return currentUserScope
    })
    resolveHomeRailProfileContentMock.mockImplementation(
      () =>
        new Promise<RailSceneResolvedContent<HomeRailProfileContent>>((resolve) => {
          resolveSceneRequest = resolve
        })
    )
    resolveHomeRailProfileAssetListMock.mockImplementation(
      () =>
        new Promise<HomeRailProfileAssetListResult>((resolve) => {
          resolveListRequest = resolve
        })
    )

    const coordinator = await import('@/services/home-rail/homeRailUpdateCoordinator.service')
    const displayedScene = createProfileSceneResolved('0xseed')
    const activeQuery = {
      categoryId: 'collections' as const,
      page: 1,
      pageSize: 32,
    }

    coordinator.syncHomeRailProfileSceneSnapshot(displayedScene)
    coordinator.syncHomeRailProfileAssetQuerySnapshot(activeQuery)
    coordinator.markHomeRailAppShown()
    await flushMicrotasks()

    resolveSceneRequest?.(createProfileSceneResolved('0xnew'))
    await flushMicrotasks()
    resolveListRequest?.(createProfileListResult())
    await flushMicrotasks()

    expect(persistProfileSceneToPersistentCacheMock).toHaveBeenCalledWith(
      expect.objectContaining({
        content: expect.objectContaining({
          summary: expect.objectContaining({ address: '0xnew' }),
        }),
      }),
      '0xnew'
    )
    expect(persistProfileAssetListToPersistentCacheMock).toHaveBeenCalledWith(
      activeQuery,
      expect.objectContaining({ etag: 'etag-profile-list' }),
      '0xold'
    )
  }, 15000)
})
