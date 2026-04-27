import { describe, expect, it, vi } from 'vitest'
import { useProfileAssetHoldingsSheet } from '@/pages/home/composables/profile/useProfileAssetHoldingsSheet'
import type { ProfileAssetItem } from '@/models/home-rail/homeRailProfile.model'

const createProfileAsset = (overrides: Partial<ProfileAssetItem> = {}): ProfileAssetItem => ({
  id: 'asset-genesis-zero',
  name: '「神启」创世机甲 - 零号机',
  date: '2026-04-03T00:00:00.000Z',
  subCategory: 'Genesis Series',
  holdingsCount: 3,
  priceUnit: 'CNY',
  price: 1299,
  editionCode: 'LTD',
  issueCount: 120,
  imageUrl: 'https://cdn.example.com/assets/genesis-zero.png',
  visualTone: 'ink',
  target: {
    targetType: 'profile_asset',
    targetId: 'asset-genesis-zero',
    params: {
      category: 'collections',
      subCategory: 'Genesis Series',
    },
  },
  ...overrides,
})

describe('useProfileAssetHoldingsSheet', () => {
  it('builds a stable holdings sheet view model from the summary asset payload', () => {
    const state = useProfileAssetHoldingsSheet({
      navigateToAssetDetail: vi.fn(),
    })
    const asset = createProfileAsset()

    state.openProfileAssetHoldingsSheet(asset)

    const firstSheetViewModel = state.activeProfileAssetHoldingsSheetViewModel.value
    expect(firstSheetViewModel).not.toBeNull()
    expect(firstSheetViewModel?.name).toBe(asset.name)
    expect(firstSheetViewModel?.collectionLabel).toBe('GENESIS SERIES')
    expect(firstSheetViewModel?.instances).toHaveLength(3)
    expect(firstSheetViewModel?.instances.map((instance) => instance.id)).toEqual([
      'asset-genesis-zero::holding::0',
      'asset-genesis-zero::holding::1',
      'asset-genesis-zero::holding::2',
    ])
    expect(firstSheetViewModel?.instances.map((instance) => instance.serial)).toHaveLength(3)
    expect(new Set(firstSheetViewModel?.instances.map((instance) => instance.serial)).size).toBe(3)
    expect(firstSheetViewModel?.instances[0]).toMatchObject({
      status: 'available',
      statusLabel: '可用',
      statusIconName: 'check-circle-2',
      statusTone: 'accent',
    })
    expect(firstSheetViewModel?.instances[1]?.acquiredAtLabel).toMatch(
      /^\d{4}\.\d{2}\.\d{2} \d{2}:\d{2}:\d{2}$/
    )

    state.closeProfileAssetHoldingsSheet()
    state.openProfileAssetHoldingsSheet(asset)

    expect(state.activeProfileAssetHoldingsSheetViewModel.value).toEqual(firstSheetViewModel)
  })

  it('keeps asset-card tap as sheet open only, then navigates on the secondary detail action', () => {
    const navigateToAssetDetail = vi.fn()
    const state = useProfileAssetHoldingsSheet({
      navigateToAssetDetail,
    })
    const asset = createProfileAsset({
      holdingsCount: 2,
    })

    state.openProfileAssetHoldingsSheet(asset)

    expect(state.isProfileAssetHoldingsSheetOpen.value).toBe(true)
    expect(navigateToAssetDetail).not.toHaveBeenCalled()

    const selectedInstance = state.activeProfileAssetHoldingsSheetViewModel.value?.instances[0]
    expect(selectedInstance).toBeTruthy()

    state.handleProfileAssetHoldingInstanceActivate('asset-genesis-zero::holding::0')

    expect(navigateToAssetDetail).toHaveBeenCalledTimes(1)
    expect(navigateToAssetDetail).toHaveBeenCalledWith(asset, selectedInstance)
    expect(state.isProfileAssetHoldingsSheetOpen.value).toBe(false)
    expect(state.activeProfileAssetHoldingsSheetViewModel.value).toBeNull()
  })

  it('ignores unknown holding instance ids so the flow stays row-driven only', () => {
    const navigateToAssetDetail = vi.fn()
    const state = useProfileAssetHoldingsSheet({
      navigateToAssetDetail,
    })
    const asset = createProfileAsset({
      holdingsCount: 1,
      subCategory: '数字雕塑',
    })

    state.openProfileAssetHoldingsSheet(asset)

    expect(state.activeProfileAssetHoldingsSheetViewModel.value?.collectionLabel).toBe('数字雕塑')
    expect(state.activeProfileAssetHoldingsSheetViewModel.value?.instances).toHaveLength(1)

    state.handleProfileAssetHoldingInstanceActivate('missing-instance')

    expect(navigateToAssetDetail).not.toHaveBeenCalled()
    expect(state.isProfileAssetHoldingsSheetOpen.value).toBe(true)
  })
})
