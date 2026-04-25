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
  pageSize: 32,
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

  it('persists first-screen result into request scope captured at request start', async () => {
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
      pageSize: 32,
    }

    const state = useProfileAssetRemoteListState({
      remotePageSize: 32,
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

    expect(persistResolvedProfileAssetListSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({ page: 1, pageSize: 32 }),
      expect.objectContaining({ etag: 'etag-first-screen' }),
      '0xold'
    )
  })

  it('persists load-more result into request scope captured before pagination request', async () => {
    const currentUserScope = ref<string | null>('0xold')
    const persistResolvedProfileAssetListSnapshot = vi.fn()
    const querySnapshot: ResolveHomeRailProfileAssetListInput = {
      categoryId: 'collections',
      page: 1,
      pageSize: 32,
    }

    resolveHomeRailProfileAssetListMock.mockResolvedValueOnce(
      createListResult({
        page: 1,
        total: 2,
        items: [createProfileAsset('asset-1')],
        etag: 'etag-page-1',
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
      remotePageSize: 32,
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
        page: 2,
        total: 2,
        items: [createProfileAsset('asset-2')],
        etag: 'etag-page-2',
      })
    )
    await loadMorePromise

    expect(persistResolvedProfileAssetListSnapshot).toHaveBeenCalledWith(
      querySnapshot,
      expect.objectContaining({
        etag: 'etag-page-2',
        items: [createProfileAsset('asset-1'), createProfileAsset('asset-2')],
      }),
      '0xold'
    )
  })
})
