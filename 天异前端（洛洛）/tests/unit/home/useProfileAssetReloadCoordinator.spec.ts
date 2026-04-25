import { ref } from 'vue'
import { useProfileAssetReloadCoordinator } from '@/pages/home/composables/profile/useProfileAssetReloadCoordinator'
import type { HomeRailProfileAssetListResult } from '@/services/home-rail/homeRailProfileContent.service'

const createProfileAssetResult = (
  overrides: Partial<HomeRailProfileAssetListResult> = {}
): HomeRailProfileAssetListResult => ({
  page: 1,
  pageSize: 60,
  total: 1,
  items: [],
  notModified: false,
  ...overrides,
})

describe('useProfileAssetReloadCoordinator', () => {
  it('triggers replay request on notModified + replay when remote has resolved data', async () => {
    const requestReplay = vi.fn()
    const applyResolved = vi.fn()
    const reloadRemote = vi.fn(async () =>
      createProfileAssetResult({
        notModified: true,
      })
    )
    const coordinator = useProfileAssetReloadCoordinator({
      resolveProfileAssetQuerySnapshot: () => ({
        categoryId: 'all',
        page: 1,
        pageSize: 60,
      }),
      reloadRemoteProfileAssetList: reloadRemote,
      hasResolvedRemoteProfileAssets: ref(true),
      requestProfileAssetRefreshReplay: requestReplay,
      applyResolvedProfileAssetList: applyResolved,
    })

    const result = await coordinator.reloadProfileAssetListAndApply({
      replay: true,
      motionSource: 'manual-refresh',
    })

    expect(result?.notModified).toBe(true)
    expect(requestReplay).toHaveBeenCalledTimes(1)
    expect(applyResolved).not.toHaveBeenCalled()
  })

  it('applies resolved list to result-window when response is modified', async () => {
    const requestReplay = vi.fn()
    const applyResolved = vi.fn()
    const modifiedResult = createProfileAssetResult({
      notModified: false,
      total: 2,
      items: [
        {
          id: 'p1',
          name: 'Asset P1',
          date: '2026-04-01',
          subCategory: 'A',
          holdingsCount: 1,
          priceUnit: '￥',
          price: 100,
          editionCode: 'E-1',
          issueCount: 1,
          imageUrl: '',
          visualTone: 'ink',
        },
      ],
    })
    const reloadRemote = vi.fn(async () => modifiedResult)

    const coordinator = useProfileAssetReloadCoordinator({
      resolveProfileAssetQuerySnapshot: () => ({
        categoryId: 'all',
        page: 1,
        pageSize: 60,
      }),
      reloadRemoteProfileAssetList: reloadRemote,
      hasResolvedRemoteProfileAssets: ref(true),
      requestProfileAssetRefreshReplay: requestReplay,
      applyResolvedProfileAssetList: applyResolved,
    })

    const result = await coordinator.reloadProfileAssetListAndApply({
      replay: true,
      motionSource: 'manual-query-switch',
      force: true,
    })

    expect(result).toEqual(modifiedResult)
    expect(applyResolved).toHaveBeenCalledWith(modifiedResult, {
      replay: true,
      motionSource: 'manual-query-switch',
    })
    expect(requestReplay).not.toHaveBeenCalled()
  })

  it('returns null and skips replay/apply when remote list fails to resolve', async () => {
    const requestReplay = vi.fn()
    const applyResolved = vi.fn()
    const reloadRemote = vi.fn(async () => null)
    const coordinator = useProfileAssetReloadCoordinator({
      resolveProfileAssetQuerySnapshot: () => ({
        categoryId: 'all',
        page: 1,
        pageSize: 60,
      }),
      reloadRemoteProfileAssetList: reloadRemote,
      hasResolvedRemoteProfileAssets: ref(false),
      requestProfileAssetRefreshReplay: requestReplay,
      applyResolvedProfileAssetList: applyResolved,
    })

    const result = await coordinator.reloadProfileAssetListAndApply({
      replay: true,
    })

    expect(result).toBeNull()
    expect(requestReplay).not.toHaveBeenCalled()
    expect(applyResolved).not.toHaveBeenCalled()
  })
})
