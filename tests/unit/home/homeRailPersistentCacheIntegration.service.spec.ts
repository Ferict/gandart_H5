import { __setContentCacheRuntimeModeForTest } from '@/services/content/contentCacheRuntime.service'
import {
  clearHomeRailProfileUserCachesOnLogout,
  hydrateActivityNoticeListFromPersistentCache,
  hydrateHomeMarketListFromPersistentCache,
  hydrateHomeSceneFromPersistentCache,
  hydrateProfileAssetListFromPersistentCache,
  hydrateProfileSceneFromPersistentCache,
  initializeHomeRailPersistentCacheIntegration,
  persistActivityNoticeListToPersistentCache,
  persistHomeMarketListToPersistentCache,
  persistHomeSceneToPersistentCache,
  persistProfileAssetListToPersistentCache,
  persistProfileSceneToPersistentCache,
  resolveCurrentHomeRailProfileUserScope,
  transitionHomeRailProfileUserScope,
} from '@/services/home-rail/homeRailPersistentCacheIntegration.service'

type StorageMap = Record<string, unknown>

const createUniStorageMock = (storageMap: StorageMap) => {
  return {
    getStorageSync: vi.fn((key: string) => storageMap[key] ?? ''),
    setStorageSync: vi.fn((key: string, value: unknown) => {
      storageMap[key] = value
    }),
    removeStorageSync: vi.fn((key: string) => {
      delete storageMap[key]
    }),
    getStorageInfoSync: vi.fn(() => ({
      keys: Object.keys(storageMap),
      currentSize: 0,
      limitSize: 0,
    })),
  }
}

describe('homeRailPersistentCacheIntegration.service', () => {
  const storageMap: StorageMap = {}

  beforeEach(() => {
    Object.keys(storageMap).forEach((key) => delete storageMap[key])
    ;(globalThis as { uni?: unknown }).uni = createUniStorageMock(storageMap)
    clearHomeRailProfileUserCachesOnLogout()
  })

  afterEach(() => {
    __setContentCacheRuntimeModeForTest(null)
    delete (globalThis as { uni?: unknown }).uni
  })

  it('hydrates persisted home scene and list snapshots on app runtime', async () => {
    __setContentCacheRuntimeModeForTest('app')
    expect(initializeHomeRailPersistentCacheIntegration()).toBe(true)

    await persistHomeSceneToPersistentCache({
      content: {
        noticeBar: { label: '公告', detailLabel: '查看公告详情', items: [] },
        banners: [],
        featured: {
          id: 'featured',
          title: 'featured',
          sectionTitle: '首发藏品',
          sectionSubtitle: 'Featured Drop',
          priceLabel: '铸造价格',
          priceUnit: '¥',
          price: 0,
          minted: 0,
          supply: 0,
          imageUrl: '',
          placeholderIconKey: 'box',
          target: { targetType: 'drop', targetId: 'drop-1' },
        },
        market: {
          sectionTitle: '藏品市场',
          sectionSubtitle: 'Market Flow',
          tags: [],
          actions: [],
          sortConfig: {
            defaultField: 'listedAt',
            defaultDirection: 'desc',
            options: [],
          },
          cards: [],
        },
      },
      meta: {
        version: 3,
        updatedAt: '2026-04-03T00:00:00.000Z',
        signature: 'sig-home',
      },
    })

    const query = {
      sort: {
        field: 'listedAt' as const,
        direction: 'desc' as const,
      },
      page: 1,
      pageSize: 32,
    }
    await persistHomeMarketListToPersistentCache(query, {
      page: 1,
      pageSize: 32,
      total: 2,
      items: [
        {
          id: 'm1',
          name: 'market-1',
          priceUnit: '¥',
          price: 10,
          listedAt: '2026-04-03T00:00:00.000Z',
          tradeVolume24h: 0,
          holderCount: 1,
          editionCode: 'A-1',
          issueCount: 1,
          categories: [],
          imageUrl: '',
          placeholderIconKey: 'box',
          visualTone: 'ink',
          target: { targetType: 'market_item', targetId: 'm1' },
        },
      ],
      etag: 'etag-market',
      notModified: false,
    })

    const scene = await hydrateHomeSceneFromPersistentCache()
    const list = await hydrateHomeMarketListFromPersistentCache(query)

    expect(scene?.meta.signature).toBe('sig-home')
    expect(list?.etag).toBe('etag-market')
    expect(list?.items[0]?.id).toBe('m1')
  })

  it('hydrates persisted activity notice list with etag intact', async () => {
    __setContentCacheRuntimeModeForTest('app')
    initializeHomeRailPersistentCacheIntegration()

    const query = {
      page: 1,
      pageSize: 60,
      keyword: '公告',
    }

    await persistActivityNoticeListToPersistentCache(query, {
      resourceType: 'notice',
      page: 1,
      pageSize: 60,
      total: 1,
      list: [
        {
          id: 'n1',
          title: '公告 1',
          category: '平台',
          publishedAt: '2026-04-03T00:00:00.000Z',
          time: '04-03 00:00',
          isUnread: true,
          target: { targetType: 'notice', targetId: 'n1' },
        },
      ],
      etag: 'etag-notice',
      notModified: false,
    })

    const result = await hydrateActivityNoticeListFromPersistentCache(query)

    expect(result?.etag).toBe('etag-notice')
    expect(result?.list[0]?.id).toBe('n1')
  })

  it('stays no-op on h5 runtime', async () => {
    __setContentCacheRuntimeModeForTest('h5')
    expect(initializeHomeRailPersistentCacheIntegration()).toBe(false)

    const scene = await hydrateHomeSceneFromPersistentCache()
    expect(scene).toBeNull()
  })

  it('requires explicit user scope before hydrating profile cache', async () => {
    __setContentCacheRuntimeModeForTest('app')
    initializeHomeRailPersistentCacheIntegration()

    await persistProfileSceneToPersistentCache(
      {
        content: {
          summary: {
            displayName: 'Profile',
            summary: '',
            currency: 'CNY',
            totalValue: '0',
            holdings: '0',
            address: '0xAAA',
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
          signature: 'sig-profile',
        },
      },
      null
    )

    expect(await hydrateProfileSceneFromPersistentCache()).toBeNull()
    expect(resolveCurrentHomeRailProfileUserScope()).toBeNull()
  })

  it('hydrates profile scene and list inside current user scope only', async () => {
    __setContentCacheRuntimeModeForTest('app')
    initializeHomeRailPersistentCacheIntegration()
    transitionHomeRailProfileUserScope('0xAbC')

    await persistProfileSceneToPersistentCache(
      {
        content: {
          summary: {
            displayName: 'Profile',
            summary: '',
            currency: 'CNY',
            totalValue: '10',
            holdings: '1',
            address: '0xAbC',
          },
          categories: [],
          assets: {
            collections: [],
            blindBoxes: [],
          },
        },
        meta: {
          version: 2,
          updatedAt: '2026-04-03T00:00:00.000Z',
          signature: 'sig-profile',
        },
      },
      '0xabc'
    )

    const query = {
      categoryId: 'collections' as const,
      page: 1,
      pageSize: 32,
    }

    await persistProfileAssetListToPersistentCache(
      query,
      {
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
        etag: 'etag-profile',
        notModified: false,
      },
      '0xabc'
    )

    const scene = await hydrateProfileSceneFromPersistentCache()
    const list = await hydrateProfileAssetListFromPersistentCache(query)

    expect(resolveCurrentHomeRailProfileUserScope()).toBe('0xabc')
    expect(scene?.meta.signature).toBe('sig-profile')
    expect(list?.etag).toBe('etag-profile')
    expect(list?.items[0]?.id).toBe('asset-1')
  })

  it('clears previous profile scope cache when switching to another scope', async () => {
    __setContentCacheRuntimeModeForTest('app')
    initializeHomeRailPersistentCacheIntegration()

    const query = {
      categoryId: 'collections' as const,
      page: 1,
      pageSize: 32,
    }

    transitionHomeRailProfileUserScope('0xold')
    await persistProfileSceneToPersistentCache(
      {
        content: {
          summary: {
            displayName: 'old-profile',
            summary: '',
            currency: 'CNY',
            totalValue: '1',
            holdings: '1',
            address: '0xold',
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
          signature: 'sig-old',
        },
      },
      '0xold'
    )
    await persistProfileAssetListToPersistentCache(
      query,
      {
        page: 1,
        pageSize: 32,
        total: 1,
        items: [],
        etag: 'etag-old',
        notModified: false,
      },
      '0xold'
    )
    expect((await hydrateProfileSceneFromPersistentCache())?.meta.signature).toBe('sig-old')

    expect(transitionHomeRailProfileUserScope('0xnew')).toBe('0xnew')
    expect(resolveCurrentHomeRailProfileUserScope()).toBe('0xnew')
    expect(await hydrateProfileSceneFromPersistentCache()).toBeNull()
    expect(await hydrateProfileAssetListFromPersistentCache(query)).toBeNull()

    transitionHomeRailProfileUserScope('0xold')
    expect(await hydrateProfileSceneFromPersistentCache()).toBeNull()
    expect(await hydrateProfileAssetListFromPersistentCache(query)).toBeNull()
  })

  it('clears current profile scope cache on logout and keeps home/activity in public scope', async () => {
    __setContentCacheRuntimeModeForTest('app')
    initializeHomeRailPersistentCacheIntegration()

    await persistHomeSceneToPersistentCache({
      content: {
        noticeBar: { label: 'n', detailLabel: 'd', items: [] },
        banners: [],
        featured: {
          id: 'featured-public',
          title: 'featured',
          sectionTitle: 'section',
          sectionSubtitle: 'subtitle',
          priceLabel: 'price',
          priceUnit: 'CNY',
          price: 0,
          minted: 0,
          supply: 0,
          imageUrl: '',
          placeholderIconKey: 'box',
          target: { targetType: 'drop', targetId: 'drop-1' },
        },
        market: {
          sectionTitle: 'market',
          sectionSubtitle: 'sub',
          tags: [],
          actions: [],
          sortConfig: {
            defaultField: 'listedAt',
            defaultDirection: 'desc',
            options: [],
          },
          cards: [],
        },
      },
      meta: {
        version: 1,
        updatedAt: '2026-04-03T00:00:00.000Z',
        signature: 'sig-home-public',
      },
    })

    const noticeQuery = {
      page: 1,
      pageSize: 60,
    }
    await persistActivityNoticeListToPersistentCache(noticeQuery, {
      resourceType: 'notice',
      page: 1,
      pageSize: 60,
      total: 0,
      list: [],
      etag: 'etag-notice-public',
      notModified: false,
    })

    await persistProfileSceneToPersistentCache(
      {
        content: {
          summary: {
            displayName: 'profile-no-scope',
            summary: '',
            currency: 'CNY',
            totalValue: '1',
            holdings: '1',
            address: '0xnone',
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
          signature: 'sig-profile-no-scope',
        },
      },
      null
    )
    expect(await hydrateProfileSceneFromPersistentCache()).toBeNull()

    transitionHomeRailProfileUserScope('0xlogout')
    await persistProfileSceneToPersistentCache(
      {
        content: {
          summary: {
            displayName: 'profile-logout',
            summary: '',
            currency: 'CNY',
            totalValue: '2',
            holdings: '2',
            address: '0xlogout',
          },
          categories: [],
          assets: {
            collections: [],
            blindBoxes: [],
          },
        },
        meta: {
          version: 2,
          updatedAt: '2026-04-03T00:00:00.000Z',
          signature: 'sig-profile-logout',
        },
      },
      '0xlogout'
    )
    expect((await hydrateProfileSceneFromPersistentCache())?.meta.signature).toBe(
      'sig-profile-logout'
    )

    const previousScope = clearHomeRailProfileUserCachesOnLogout()
    expect(previousScope).toBe('0xlogout')
    expect(resolveCurrentHomeRailProfileUserScope()).toBeNull()
    expect(await hydrateProfileSceneFromPersistentCache()).toBeNull()

    expect((await hydrateHomeSceneFromPersistentCache())?.meta.signature).toBe('sig-home-public')
    expect((await hydrateActivityNoticeListFromPersistentCache(noticeQuery))?.etag).toBe(
      'etag-notice-public'
    )
  })

  it('persists profile scene and list into explicit request scope even after current scope changes', async () => {
    __setContentCacheRuntimeModeForTest('app')
    initializeHomeRailPersistentCacheIntegration()

    const query = {
      categoryId: 'collections' as const,
      page: 1,
      pageSize: 32,
    }

    transitionHomeRailProfileUserScope('0xold')
    transitionHomeRailProfileUserScope('0xnew')

    await persistProfileSceneToPersistentCache(
      {
        content: {
          summary: {
            displayName: 'profile-request-old',
            summary: '',
            currency: 'CNY',
            totalValue: '3',
            holdings: '3',
            address: '0xold',
          },
          categories: [],
          assets: {
            collections: [],
            blindBoxes: [],
          },
        },
        meta: {
          version: 3,
          updatedAt: '2026-04-03T00:00:00.000Z',
          signature: 'sig-request-old',
        },
      },
      '0xold'
    )
    await persistProfileAssetListToPersistentCache(
      query,
      {
        page: 1,
        pageSize: 32,
        total: 1,
        items: [],
        etag: 'etag-request-old',
        notModified: false,
      },
      '0xold'
    )

    expect(resolveCurrentHomeRailProfileUserScope()).toBe('0xnew')
    expect(await hydrateProfileSceneFromPersistentCache()).toBeNull()
    expect(await hydrateProfileAssetListFromPersistentCache(query)).toBeNull()

    transitionHomeRailProfileUserScope('0xold')
    expect((await hydrateProfileSceneFromPersistentCache())?.meta.signature).toBe('sig-request-old')
    expect((await hydrateProfileAssetListFromPersistentCache(query))?.etag).toBe('etag-request-old')
  })
})
