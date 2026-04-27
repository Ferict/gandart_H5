import { ref } from 'vue'
import { useProfileAssetRemoteListState } from '@/pages/home/composables/profile/useProfileAssetRemoteListState'
import type {
  HomeRailProfileAssetListResult,
  ResolveHomeRailProfileAssetListInput,
} from '@/services/home-rail/homeRailProfileContent.service'
import type { ProfileAssetItem } from '@/models/home-rail/homeRailProfile.model'

const resolveHomeRailProfileAssetListMock = vi.hoisted(() => vi.fn())
const logSafeErrorMock = vi.hoisted(() => vi.fn())

vi.mock('@/services/home-rail/homeRailProfileContent.service', async (importOriginal) => {
  const actual =
    await importOriginal<typeof import('@/services/home-rail/homeRailProfileContent.service')>()
  return {
    ...actual,
    resolveHomeRailProfileAssetList: resolveHomeRailProfileAssetListMock,
  }
})

vi.mock('@/utils/safeLogger.util', async (importOriginal) => {
  const actual = await importOriginal<typeof import('@/utils/safeLogger.util')>()
  return {
    ...actual,
    logSafeError: logSafeErrorMock,
  }
})

const createProfileAsset = (id: string): ProfileAssetItem => ({
  id,
  name: `asset-${id}`,
  date: '2026-04-03T00:00:00.000Z',
  subCategory: 'default',
  holdingsCount: 1,
  priceUnit: '￥',
  price: 10,
  editionCode: 'A-1',
  issueCount: 1,
  imageUrl: '',
  visualTone: 'ink',
})

const createListResult = (
  overrides: Partial<HomeRailProfileAssetListResult> = {}
): HomeRailProfileAssetListResult => ({
  page: 1,
  pageSize: 15,
  total: 2,
  items: [createProfileAsset('asset-1')],
  etag: 'etag-1',
  notModified: false,
  ...overrides,
})

describe('useProfileAssetRemoteListState', () => {
  beforeEach(() => {
    resolveHomeRailProfileAssetListMock.mockReset()
    logSafeErrorMock.mockReset()
  })

  it('drops stale profile first-screen result when user scope changes', async () => {
    const currentUserScope = ref<string | null>('0xold')
    const persistResolvedProfileAssetListSnapshot = vi.fn()
    let releaseRequest: ((value: HomeRailProfileAssetListResult) => void) | null = null

    resolveHomeRailProfileAssetListMock.mockImplementationOnce(
      () =>
        new Promise<HomeRailProfileAssetListResult>((resolve) => {
          releaseRequest = resolve
        })
    )

    const querySnapshot: ResolveHomeRailProfileAssetListInput = {
      categoryId: 'collections',
      page: 1,
      pageSize: 15,
    }

    const state = useProfileAssetRemoteListState({
      remotePageSize: 15,
      resolveProfileAssetQuerySnapshot: () => querySnapshot,
      resolveProfileAssetQuerySignature: () => 'sig-profile-list',
      resolveCurrentPersistUserScope: () => currentUserScope.value,
      syncResolvedProfileAssetListSnapshot: vi.fn(),
      persistResolvedProfileAssetListSnapshot,
    })

    const reloadPromise = state.reloadRemoteProfileAssetList(querySnapshot)
    currentUserScope.value = '0xnew'
    releaseRequest?.(
      createListResult({
        items: [createProfileAsset('asset-1')],
        etag: 'etag-first-screen',
      })
    )
    await reloadPromise

    expect(state.remoteProfileAssets.value).toEqual([])
    expect(persistResolvedProfileAssetListSnapshot).not.toHaveBeenCalled()
  })

  it('drops stale profile load-more result when user scope changes', async () => {
    const currentUserScope = ref<string | null>('0xold')
    const persistResolvedProfileAssetListSnapshot = vi.fn()
    const querySnapshot: ResolveHomeRailProfileAssetListInput = {
      categoryId: 'collections',
      page: 1,
      pageSize: 15,
    }

    resolveHomeRailProfileAssetListMock
      .mockResolvedValueOnce(
        createListResult({
          page: 1,
          total: 2,
          items: [createProfileAsset('asset-1')],
          etag: 'etag-page-1',
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 2,
          total: 2,
          items: [createProfileAsset('asset-1')],
          etag: 'etag-page-2',
        })
      )

    let releaseRequest: ((value: HomeRailProfileAssetListResult) => void) | null = null
    resolveHomeRailProfileAssetListMock.mockImplementationOnce(
      () =>
        new Promise<HomeRailProfileAssetListResult>((resolve) => {
          releaseRequest = resolve
        })
    )

    const state = useProfileAssetRemoteListState({
      remotePageSize: 15,
      resolveProfileAssetQuerySnapshot: () => querySnapshot,
      resolveProfileAssetQuerySignature: () => 'sig-profile-list',
      resolveCurrentPersistUserScope: () => currentUserScope.value,
      syncResolvedProfileAssetListSnapshot: vi.fn(),
      persistResolvedProfileAssetListSnapshot,
    })

    await state.reloadRemoteProfileAssetList(querySnapshot)
    persistResolvedProfileAssetListSnapshot.mockClear()

    const loadMorePromise = state.loadMoreRemoteProfileAssetListPage(querySnapshot)
    currentUserScope.value = '0xnew'
    releaseRequest?.(
      createListResult({
        page: 3,
        total: 2,
        items: [createProfileAsset('asset-2')],
        etag: 'etag-page-3',
      })
    )
    await loadMorePromise

    expect(state.remoteProfileAssets.value.map((item) => item.id)).toEqual(['asset-1'])
    expect(persistResolvedProfileAssetListSnapshot).not.toHaveBeenCalled()
  })

  it('does not reuse profile etag across user scopes', async () => {
    const currentUserScope = ref<string | null>('0xold')
    const querySnapshot: ResolveHomeRailProfileAssetListInput = {
      categoryId: 'collections',
      page: 1,
      pageSize: 15,
    }

    resolveHomeRailProfileAssetListMock
      .mockResolvedValueOnce(
        createListResult({
          page: 1,
          total: 1,
          items: [createProfileAsset('asset-1')],
          etag: 'etag-old-user',
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 1,
          total: 1,
          items: [createProfileAsset('asset-2')],
          etag: 'etag-new-user',
        })
      )

    const state = useProfileAssetRemoteListState({
      remotePageSize: 15,
      resolveProfileAssetQuerySnapshot: () => querySnapshot,
      resolveProfileAssetQuerySignature: () => 'sig-profile-list',
      resolveCurrentPersistUserScope: () => currentUserScope.value,
      syncResolvedProfileAssetListSnapshot: vi.fn(),
    })

    await state.reloadRemoteProfileAssetList(querySnapshot)
    currentUserScope.value = '0xnew'
    await state.reloadRemoteProfileAssetList(querySnapshot)

    expect(resolveHomeRailProfileAssetListMock).toHaveBeenNthCalledWith(
      2,
      expect.any(Object),
      expect.objectContaining({ ifNoneMatch: undefined })
    )
  })

  it('reloads the first fixed two-page batch and appends the next fixed batch on load more', async () => {
    const persistResolvedProfileAssetListSnapshot = vi.fn()
    const syncResolvedProfileAssetListSnapshot = vi.fn()
    const querySnapshot: ResolveHomeRailProfileAssetListInput = {
      categoryId: 'collections',
      page: 1,
      pageSize: 15,
    }

    resolveHomeRailProfileAssetListMock
      .mockResolvedValueOnce(
        createListResult({
          page: 1,
          total: 5,
          items: [createProfileAsset('asset-1'), createProfileAsset('asset-2')],
          etag: 'etag-first-batch',
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 2,
          total: 5,
          items: [createProfileAsset('asset-2'), createProfileAsset('asset-3')],
          etag: 'etag-page-2',
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 3,
          total: 5,
          items: [createProfileAsset('asset-3'), createProfileAsset('asset-4')],
          etag: 'etag-page-3',
        })
      )
      .mockResolvedValueOnce(
        createListResult({
          page: 4,
          total: 5,
          items: [createProfileAsset('asset-5')],
          etag: 'etag-page-4',
        })
      )

    const state = useProfileAssetRemoteListState({
      remotePageSize: 15,
      resolveProfileAssetQuerySnapshot: () => querySnapshot,
      resolveProfileAssetQuerySignature: () => 'sig-profile-list',
      resolveCurrentPersistUserScope: () => '0xabc',
      syncResolvedProfileAssetListSnapshot,
      persistResolvedProfileAssetListSnapshot,
    })

    const reloadResult = await state.reloadRemoteProfileAssetList(querySnapshot)

    expect(reloadResult?.items.map((item) => item.id)).toEqual(['asset-1', 'asset-2', 'asset-3'])
    expect(state.remoteProfileAssets.value.map((item) => item.id)).toEqual([
      'asset-1',
      'asset-2',
      'asset-3',
    ])
    expect(state.profileAssetResolvedPage.value).toBe(2)
    expect(state.loadedProfileAssetItemCount.value).toBe(3)
    expect(state.remoteProfileAssetListEtag.value).toBe('etag-first-batch')
    expect(syncResolvedProfileAssetListSnapshot).toHaveBeenCalledTimes(1)

    const loadMoreResult = await state.loadMoreRemoteProfileAssetListPage(querySnapshot)

    expect(loadMoreResult).toEqual({
      outcome: 'appended',
      pageAdvanced: true,
      totalReached: true,
    })
    expect(state.remoteProfileAssets.value.map((item) => item.id)).toEqual([
      'asset-1',
      'asset-2',
      'asset-3',
      'asset-4',
      'asset-5',
    ])
    expect(state.profileAssetResolvedPage.value).toBe(4)
    expect(state.loadedProfileAssetItemCount.value).toBe(5)
    expect(state.remoteProfileAssetListEtag.value).toBe('etag-first-batch')
    expect(resolveHomeRailProfileAssetListMock.mock.calls.map(([input]) => input.page)).toEqual([
      1, 2, 3, 4,
    ])
    expect(persistResolvedProfileAssetListSnapshot).toHaveBeenLastCalledWith(
      expect.objectContaining({
        page: 1,
        pageSize: 15,
      }),
      expect.objectContaining({
        page: 4,
        items: expect.arrayContaining([expect.objectContaining({ id: 'asset-5' })]),
      }),
      '0xabc'
    )
  })

  it('hydrates merged list state with last consumed page and deep-pagination flag intact', async () => {
    const querySnapshot: ResolveHomeRailProfileAssetListInput = {
      categoryId: 'collections',
      page: 1,
      pageSize: 15,
    }
    const hydratePersistedProfileAssetListSnapshot = vi.fn(async () =>
      createListResult({
        page: 4,
        total: 40,
        items: Array.from({ length: 31 }, (_, index) => createProfileAsset(`asset-${index + 1}`)),
        etag: 'etag-hydrated',
      })
    )

    const state = useProfileAssetRemoteListState({
      remotePageSize: 15,
      resolveProfileAssetQuerySnapshot: () => querySnapshot,
      resolveProfileAssetQuerySignature: () => 'sig-profile-list',
      resolveCurrentPersistUserScope: () => '0xabc',
      syncResolvedProfileAssetListSnapshot: vi.fn(),
      hydratePersistedProfileAssetListSnapshot,
    })

    await state.hydrateRemoteProfileAssetListFromPersistentCache(querySnapshot)

    expect(state.profileAssetResolvedPage.value).toBe(4)
    expect(state.loadedProfileAssetItemCount.value).toBe(31)
    expect(state.isBeyondFirstTransportBatch.value).toBe(true)
  })
})
