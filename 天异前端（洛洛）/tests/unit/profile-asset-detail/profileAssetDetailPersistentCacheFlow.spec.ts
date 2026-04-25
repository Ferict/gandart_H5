import { __setContentCacheRuntimeModeForTest } from '@/services/content/contentCacheRuntime.service'
import { initializeContentPersistentCache } from '@/services/content/contentPersistentCache.service'
import {
  clearCurrentContentUserScope,
  syncCurrentContentUserScope,
} from '@/services/content/contentUserScope.service'
import {
  createProfileAssetDetailRouteSignature,
  shouldApplyProfileAssetDetailRefreshResult,
} from '@/pages/profile-asset-detail/helpers/profileAssetDetailRefreshApplyGuard'
import {
  hydrateProfileAssetDetailFromPersistentCache,
  persistProfileAssetDetailToPersistentCache,
  resolveCurrentProfileAssetDetailPersistentUserScope,
} from '@/services/profile-asset-detail/profileAssetDetailPersistentCache.service'
import type { ProfileAssetDetailContent } from '@/models/profile-asset-detail/profileAssetDetail.model'

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

const createDetailSnapshot = (
  overrides: Partial<ProfileAssetDetailContent> = {}
): ProfileAssetDetailContent => ({
  id: 'C-02',
  title: 'Cached Collectible',
  categoryId: 'collections',
  categoryLabel: '资产',
  categoryEnglishLabel: 'COLLECTION',
  subCategory: '数字藏品',
  acquiredAt: '2026-01-01',
  statusLabel: 'OWNED',
  summary: 'cached summary',
  holdingsCount: 1,
  price: 1888,
  priceUnit: '¥',
  currency: 'CNY',
  editionCode: 'LTD',
  issueCount: 100,
  imageUrl: 'https://cdn.example.com/c-02.jpg',
  visualTone: 'mist',
  ...overrides,
})

const runPageOpenCacheThenNetworkUpdate = async (input: {
  activeCategory?: string
  activeResourceId?: string
  category?: string
  currentUserScope?: string | null
  requestUserScope?: string | null
  resourceId: string
  isPageActive?: boolean
  latestRequestVersion?: number
  requestVersion?: number
  fetchFromNetwork: () => Promise<ProfileAssetDetailContent>
}) => {
  const hydrated = hydrateProfileAssetDetailFromPersistentCache(input.resourceId)
  const networkResource = await input.fetchFromNetwork()
  const requestRouteSignature = createProfileAssetDetailRouteSignature({
    itemId: input.resourceId,
    category: input.category ?? 'collections',
  })
  const requestUserScope = input.requestUserScope ?? null
  if (input.currentUserScope !== undefined) {
    syncCurrentContentUserScope(input.currentUserScope)
  }
  const currentRouteSignature = createProfileAssetDetailRouteSignature({
    itemId: input.activeResourceId ?? input.resourceId,
    category: input.activeCategory ?? input.category ?? 'collections',
  })
  const canApply = shouldApplyProfileAssetDetailRefreshResult({
    requestVersion: input.requestVersion ?? 1,
    latestRequestVersion: input.latestRequestVersion ?? input.requestVersion ?? 1,
    requestRouteSignature,
    currentRouteSignature,
    requestUserScope,
    currentUserScope:
      input.currentUserScope ?? resolveCurrentProfileAssetDetailPersistentUserScope(),
    isPageActive: input.isPageActive ?? true,
  })
  if (canApply && requestUserScope) {
    persistProfileAssetDetailToPersistentCache(networkResource, requestUserScope)
  }
  return {
    canApply,
    hydrated,
    networkResource,
  }
}

describe('profileAssetDetail persistent cache flow', () => {
  const storageMap: StorageMap = {}

  beforeEach(() => {
    Object.keys(storageMap).forEach((key) => delete storageMap[key])
    ;(globalThis as { uni?: unknown }).uni = createUniStorageMock(storageMap)
    __setContentCacheRuntimeModeForTest('app')
    initializeContentPersistentCache()
    clearCurrentContentUserScope()
  })

  afterEach(() => {
    clearCurrentContentUserScope()
    __setContentCacheRuntimeModeForTest(null)
    delete (globalThis as { uni?: unknown }).uni
  })

  it('hydrates and persists detail resource snapshot under current user scope', () => {
    syncCurrentContentUserScope('0xDetailUser')
    const snapshot = createDetailSnapshot()

    expect(persistProfileAssetDetailToPersistentCache(snapshot, '0xdetailuser')).toBe(true)
    expect(hydrateProfileAssetDetailFromPersistentCache(snapshot.id)).toEqual(snapshot)
  })

  it('returns empty detail hydrate result when no user scope is available', () => {
    syncCurrentContentUserScope('0xScopedUser')
    persistProfileAssetDetailToPersistentCache(
      createDetailSnapshot({
        id: 'C-03',
        title: 'Scoped Snapshot',
        imageUrl: 'https://cdn.example.com/c-03.jpg',
        price: 99,
      }),
      '0xscopeduser'
    )

    clearCurrentContentUserScope()
    expect(hydrateProfileAssetDetailFromPersistentCache('C-03')).toBeNull()
    expect(
      persistProfileAssetDetailToPersistentCache(
        createDetailSnapshot({
          id: 'C-03',
        }),
        null
      )
    ).toBe(false)
  })

  it('uses cached detail snapshot on page-open, then persists latest network result', async () => {
    syncCurrentContentUserScope('0xCacheFlow')
    const resourceId = 'C-10'
    const cachedSnapshot = createDetailSnapshot({
      id: resourceId,
      title: 'Cached Version',
      imageUrl: 'https://cdn.example.com/c-10-old.jpg',
      price: 200,
    })
    persistProfileAssetDetailToPersistentCache(cachedSnapshot, '0xcacheflow')

    const latestSnapshot = createDetailSnapshot({
      id: resourceId,
      title: 'Network Version',
      imageUrl: 'https://cdn.example.com/c-10-new.jpg',
      price: 260,
    })
    const fetchFromNetwork = vi.fn(async () => latestSnapshot)
    const requestUserScope = resolveCurrentProfileAssetDetailPersistentUserScope()

    const result = await runPageOpenCacheThenNetworkUpdate({
      resourceId,
      requestUserScope,
      fetchFromNetwork,
    })

    expect(result.canApply).toBe(true)
    expect(result.hydrated).toEqual(cachedSnapshot)
    expect(result.networkResource).toEqual(latestSnapshot)
    expect(fetchFromNetwork).toHaveBeenCalledTimes(1)
    expect(hydrateProfileAssetDetailFromPersistentCache(resourceId)).toEqual(latestSnapshot)
  })

  it('does not persist stale network result when the request version is outdated', async () => {
    syncCurrentContentUserScope('0xCacheFlow')
    const resourceId = 'C-10'
    const cachedSnapshot = createDetailSnapshot({
      id: resourceId,
      title: 'Cached Version',
      imageUrl: 'https://cdn.example.com/c-10-old.jpg',
      price: 200,
    })
    persistProfileAssetDetailToPersistentCache(cachedSnapshot, '0xcacheflow')

    const staleSnapshot = createDetailSnapshot({
      id: resourceId,
      title: 'Stale Network Version',
      imageUrl: 'https://cdn.example.com/c-10-stale.jpg',
      price: 199,
    })
    const requestUserScope = resolveCurrentProfileAssetDetailPersistentUserScope()

    const result = await runPageOpenCacheThenNetworkUpdate({
      resourceId,
      requestVersion: 1,
      latestRequestVersion: 2,
      requestUserScope,
      fetchFromNetwork: vi.fn(async () => staleSnapshot),
    })

    expect(result.canApply).toBe(false)
    expect(hydrateProfileAssetDetailFromPersistentCache(resourceId)).toEqual(cachedSnapshot)
  })

  it('does not persist an old result into a new user scope when the scope changes mid-request', async () => {
    syncCurrentContentUserScope('0xOldScope')
    const resourceId = 'C-11'
    const oldScopeSnapshot = createDetailSnapshot({
      id: resourceId,
      title: 'Old Scope Snapshot',
    })
    persistProfileAssetDetailToPersistentCache(oldScopeSnapshot, '0xoldscope')

    const requestUserScope = resolveCurrentProfileAssetDetailPersistentUserScope()
    const lateSnapshot = createDetailSnapshot({
      id: resourceId,
      title: 'Late Network Snapshot',
      imageUrl: 'https://cdn.example.com/c-11-new.jpg',
    })

    const result = await runPageOpenCacheThenNetworkUpdate({
      resourceId,
      requestUserScope,
      currentUserScope: '0xNewScope',
      fetchFromNetwork: vi.fn(async () => lateSnapshot),
    })

    expect(result.canApply).toBe(false)

    syncCurrentContentUserScope('0xOldScope')
    expect(hydrateProfileAssetDetailFromPersistentCache(resourceId)).toEqual(oldScopeSnapshot)

    syncCurrentContentUserScope('0xNewScope')
    expect(hydrateProfileAssetDetailFromPersistentCache(resourceId)).toBeNull()
  })

  it('persists detail snapshot into request scope even if current scope changes before persist', async () => {
    syncCurrentContentUserScope('0xrequest')
    const resourceId = 'C-12'
    const requestUserScope = resolveCurrentProfileAssetDetailPersistentUserScope()
    const nextSnapshot = createDetailSnapshot({
      id: resourceId,
      title: 'Request Scoped Snapshot',
    })

    const result = await runPageOpenCacheThenNetworkUpdate({
      resourceId,
      requestUserScope,
      currentUserScope: '0xrequest',
      fetchFromNetwork: vi.fn(async () => {
        syncCurrentContentUserScope('0xchanged')
        return nextSnapshot
      }),
    })

    expect(result.canApply).toBe(true)
    syncCurrentContentUserScope('0xrequest')
    expect(hydrateProfileAssetDetailFromPersistentCache(resourceId)).toEqual(nextSnapshot)
    syncCurrentContentUserScope('0xchanged')
    expect(hydrateProfileAssetDetailFromPersistentCache(resourceId)).toBeNull()
  })
})
