import { useProfileAssetDetailPersistentState } from '@/pages/profile-asset-detail/runtime/useProfileAssetDetailPersistentState'
import type { ProfileAssetDetailContent } from '@/models/profile-asset-detail/profileAssetDetail.model'

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

describe('useProfileAssetDetailPersistentState', () => {
  it('primes shell then hydrates cached snapshot when a user scope is available', () => {
    let currentUserScope = '0xdetail'
    const createShell = vi.fn((itemId: string) =>
      createDetailSnapshot({
        id: itemId,
        title: `Shell ${itemId}`,
      })
    )
    const hydrateSnapshot = vi.fn((itemId: string) =>
      createDetailSnapshot({
        id: itemId,
        title: `Cached ${itemId}`,
      })
    )
    const persistSnapshot = vi.fn(() => true)
    const persistentState = useProfileAssetDetailPersistentState({
      resolveCurrentDetailRoute: () => ({
        itemId: 'C-10',
        category: 'collections',
      }),
      createShell,
      hydrateSnapshot,
      persistSnapshot,
      resolveCurrentUserScope: () => currentUserScope,
    })

    persistentState.preparePersistentStateForPageOpen()

    expect(createShell).toHaveBeenCalledWith('C-10', 'collections')
    expect(hydrateSnapshot).toHaveBeenCalledWith('C-10')
    expect(persistentState.detailPersistentUserScope.value).toBe('0xdetail')
    expect(persistentState.detailContent.value.title).toBe('Cached C-10')

    currentUserScope = '0xdetail-next'
    expect(persistentState.resolveDetailPersistentUserScope()).toBe('0xdetail')
    expect(persistentState.detailPersistentUserScope.value).toBe('0xdetail')
    expect(persistentState.syncDetailPersistentUserScope()).toBe('0xdetail-next')
    expect(persistentState.detailPersistentUserScope.value).toBe('0xdetail-next')

    const resolvedDetail = createDetailSnapshot({
      id: 'C-10',
      title: 'Resolved C-10',
    })
    persistentState.applyResolvedDetailContent(resolvedDetail, '0xdetail-next')

    expect(persistSnapshot).toHaveBeenCalledWith(resolvedDetail, '0xdetail-next')
    expect(persistentState.detailContent.value.title).toBe('Resolved C-10')
  })

  it('skips hydrate and persist when no user scope is available', () => {
    const createShell = vi.fn((itemId: string) =>
      createDetailSnapshot({
        id: itemId,
        title: `Shell ${itemId}`,
      })
    )
    const hydrateSnapshot = vi.fn(() => createDetailSnapshot({ title: 'Should Not Hydrate' }))
    const persistSnapshot = vi.fn(() => true)
    const persistentState = useProfileAssetDetailPersistentState({
      resolveCurrentDetailRoute: () => ({
        itemId: 'C-11',
        category: 'collections',
      }),
      createShell,
      hydrateSnapshot,
      persistSnapshot,
      resolveCurrentUserScope: () => null,
    })

    persistentState.preparePersistentStateForPageOpen()

    expect(persistentState.detailPersistentUserScope.value).toBeNull()
    expect(createShell).toHaveBeenCalledWith('C-11', 'collections')
    expect(hydrateSnapshot).not.toHaveBeenCalled()
    expect(persistentState.hydrateDetailSnapshotFromPersistentCache()).toBeNull()
    expect(
      persistentState.persistDetailSnapshotIfAllowed(
        createDetailSnapshot({
          id: 'C-11',
        }),
        null
      )
    ).toBe(false)
    expect(persistSnapshot).not.toHaveBeenCalled()
  })
})
