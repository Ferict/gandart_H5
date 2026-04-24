import { computed, ref } from 'vue'
import { useProfileAssetDetailRefreshController } from '@/pages/profile-asset-detail/runtime/useProfileAssetDetailRefreshController'
import { createProfileAssetDetailRouteSignature } from '@/pages/profile-asset-detail/helpers/profileAssetDetailRefreshApplyGuard'
import { useProfileAssetDetailPersistentState } from '@/pages/profile-asset-detail/runtime/useProfileAssetDetailPersistentState'
import type { ProfileAssetDetailContent } from '@/models/profile-asset-detail/profileAssetDetail.model'

const createDetailSnapshot = (
  overrides: Partial<ProfileAssetDetailContent> = {}
): ProfileAssetDetailContent => ({
  id: 'C-10',
  title: 'Network Detail',
  categoryId: 'collections',
  categoryLabel: '资产',
  categoryEnglishLabel: 'COLLECTION',
  subCategory: '数字藏品',
  acquiredAt: '2026-01-01',
  statusLabel: 'OWNED',
  summary: 'detail summary',
  holdingsCount: 1,
  price: 1888,
  priceUnit: '¥',
  currency: 'CNY',
  editionCode: 'LTD',
  issueCount: 100,
  imageUrl: 'https://cdn.example.com/c-10.jpg',
  visualTone: 'mist',
  ...overrides,
})

const flushMicrotasks = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useProfileAssetDetailRefreshController', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('applies the latest page-open result when the request is still valid', async () => {
    const currentUserScope = ref<string | null>('0xdetail')
    const applyResolvedDetailContent = vi.fn()
    const loadSnapshot = vi.fn(async () => createDetailSnapshot())
    const currentDetailRouteSignature = computed(() =>
      createProfileAssetDetailRouteSignature({
        itemId: 'C-10',
        category: 'collections',
      })
    )
    const controller = useProfileAssetDetailRefreshController({
      currentDetailRouteSignature,
      resolveCurrentDetailRoute: () => ({
        itemId: 'C-10',
        category: 'collections',
      }),
      resolveCurrentUserScope: () => currentUserScope.value,
      applyResolvedDetailContent,
      loadSnapshot,
    })

    await controller.refreshContent({ reason: 'page-open' })

    expect(loadSnapshot).toHaveBeenCalledWith('C-10', 'collections')
    expect(applyResolvedDetailContent).toHaveBeenCalledWith(
      expect.objectContaining({ id: 'C-10' }),
      '0xdetail'
    )
    expect(controller.refreshErrorMessage.value).toBe('')
  })

  it('drops late results after the page becomes inactive', async () => {
    let resolveLoad: ((detail: ProfileAssetDetailContent) => void) | null = null
    const applyResolvedDetailContent = vi.fn()
    const currentDetailRouteSignature = computed(() =>
      createProfileAssetDetailRouteSignature({
        itemId: 'C-10',
        category: 'collections',
      })
    )
    const controller = useProfileAssetDetailRefreshController({
      currentDetailRouteSignature,
      resolveCurrentDetailRoute: () => ({
        itemId: 'C-10',
        category: 'collections',
      }),
      resolveCurrentUserScope: () => '0xdetail',
      applyResolvedDetailContent,
      loadSnapshot: () =>
        new Promise<ProfileAssetDetailContent>((resolve) => {
          resolveLoad = resolve
        }),
    })

    const refreshPromise = controller.refreshContent({ reason: 'page-open' })
    controller.invalidateDetailPageRequests()
    resolveLoad?.(createDetailSnapshot({ title: 'Late Result' }))

    await refreshPromise

    expect(applyResolvedDetailContent).not.toHaveBeenCalled()
  })

  it('does not mutate persistent user scope when a stale result is rejected', async () => {
    let resolveLoad: ((detail: ProfileAssetDetailContent) => void) | null = null
    let currentUserScope = '0xold'
    const persistentState = useProfileAssetDetailPersistentState({
      resolveCurrentDetailRoute: () => ({
        itemId: 'C-10',
        category: 'collections',
      }),
      resolveCurrentUserScope: () => currentUserScope,
      hydrateSnapshot: vi.fn(() => null),
      persistSnapshot: vi.fn(() => true),
    })
    const applyResolvedDetailContent = vi.fn()
    const currentDetailRouteSignature = computed(() =>
      createProfileAssetDetailRouteSignature({
        itemId: 'C-10',
        category: 'collections',
      })
    )
    const controller = useProfileAssetDetailRefreshController({
      currentDetailRouteSignature,
      resolveCurrentDetailRoute: () => ({
        itemId: 'C-10',
        category: 'collections',
      }),
      resolveCurrentUserScope: persistentState.resolveDetailPersistentUserScope,
      applyResolvedDetailContent,
      loadSnapshot: () =>
        new Promise<ProfileAssetDetailContent>((resolve) => {
          resolveLoad = resolve
        }),
    })

    const refreshPromise = controller.refreshContent({ reason: 'page-open' })
    currentUserScope = '0xnew'
    controller.invalidateDetailPageRequests()
    resolveLoad?.(createDetailSnapshot({ title: 'Late Result' }))

    await refreshPromise

    expect(applyResolvedDetailContent).not.toHaveBeenCalled()
    expect(persistentState.detailPersistentUserScope.value).toBe('0xold')
  })

  it('drops results when the user scope changes after the request starts', async () => {
    let resolveLoad: ((detail: ProfileAssetDetailContent) => void) | null = null
    const currentUserScope = ref<string | null>('0xold')
    const applyResolvedDetailContent = vi.fn()
    const currentDetailRouteSignature = computed(() =>
      createProfileAssetDetailRouteSignature({
        itemId: 'C-10',
        category: 'collections',
      })
    )
    const controller = useProfileAssetDetailRefreshController({
      currentDetailRouteSignature,
      resolveCurrentDetailRoute: () => ({
        itemId: 'C-10',
        category: 'collections',
      }),
      resolveCurrentUserScope: () => currentUserScope.value,
      applyResolvedDetailContent,
      loadSnapshot: () =>
        new Promise<ProfileAssetDetailContent>((resolve) => {
          resolveLoad = resolve
        }),
    })

    const refreshPromise = controller.refreshContent({ reason: 'page-open' })
    currentUserScope.value = '0xnew'
    resolveLoad?.(createDetailSnapshot({ title: 'Scope Changed Result' }))

    await refreshPromise

    expect(applyResolvedDetailContent).not.toHaveBeenCalled()
  })

  it('keeps pull-refresh semantics aligned with the existing runtime', async () => {
    vi.useFakeTimers()
    const applyResolvedDetailContent = vi.fn()
    const currentDetailRouteSignature = computed(() =>
      createProfileAssetDetailRouteSignature({
        itemId: 'C-10',
        category: 'collections',
      })
    )
    const controller = useProfileAssetDetailRefreshController({
      currentDetailRouteSignature,
      resolveCurrentDetailRoute: () => ({
        itemId: 'C-10',
        category: 'collections',
      }),
      resolveCurrentUserScope: () => '0xdetail',
      applyResolvedDetailContent,
      loadSnapshot: vi.fn(async () => createDetailSnapshot({ title: 'Pull Refresh' })),
    })

    const refreshPromise = controller.refreshContent({ reason: 'pull-refresh' })
    expect(controller.isRefreshing.value).toBe(true)
    expect(controller.refresherTriggered.value).toBe(true)

    await vi.advanceTimersByTimeAsync(500)
    await refreshPromise
    await flushMicrotasks()

    expect(controller.isRefreshing.value).toBe(false)
    expect(controller.refresherTriggered.value).toBe(false)
    expect(controller.refresherPullDistance.value).toBe(0)
    expect(applyResolvedDetailContent).toHaveBeenCalledTimes(1)
  })
})
