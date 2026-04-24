import { describe, expect, it, vi } from 'vitest'
import { buildResultWindowDiff } from '@/services/home-rail/homeRailResultWindow.service'
import { buildProfileAssetEnterRevealPhaseMap } from '@/pages/home/composables/profile/buildProfileAssetEnterRevealPhaseMap'
import type { ProfileAssetItem } from '@/models/home-rail/homeRailProfile.model'
import type { ProfileAssetRevealPhase } from '@/pages/home/composables/profile/useProfileAssetVisualReveal'

const createAsset = (id: string, imageUrl = `https://cdn.example.com/${id}.png`) =>
  ({
    id,
    name: `asset-${id}`,
    date: '2026-04-14',
    subCategory: 'collections',
    holdingsCount: 1,
    priceUnit: 'CNY',
    price: 100,
    editionCode: `ED-${id}`,
    issueCount: 1000,
    imageUrl,
    visualTone: 'sand',
  }) as ProfileAssetItem

describe('buildProfileAssetEnterRevealPhaseMap', () => {
  it('delegates to next-phase builder when preserve flag is off', () => {
    const diff = buildResultWindowDiff(
      [createAsset('a')],
      [createAsset('a')],
      (item) => item.imageUrl
    )
    const buildNextProfileAssetRevealPhaseMap = vi.fn(() => ({
      a: 'steady' as ProfileAssetRevealPhase,
    }))

    const result = buildProfileAssetEnterRevealPhaseMap({
      displayedAssets: [createAsset('a')],
      diff,
      source: 'manual-refresh',
      preserveReadyRevealPhase: false,
      resolveProfileAssetImageUrl: (item) => item.imageUrl,
      resolveProfileAssetInitialRevealPhase: () => 'steady',
      buildNextProfileAssetRevealPhaseMap,
    })

    expect(result).toEqual({ a: 'steady' })
    expect(buildNextProfileAssetRevealPhaseMap).toHaveBeenCalledWith(diff, 'manual-refresh')
  })

  it('preserves retained ready reveal phases and resets others to icon/fallback', () => {
    const displayedAssets = [
      createAsset('retained'),
      createAsset('changed'),
      createAsset('added'),
      createAsset('fallback', ''),
    ]
    const diff = buildResultWindowDiff(
      [createAsset('retained'), createAsset('changed', 'https://cdn.example.com/old.png')],
      displayedAssets,
      (item) => item.imageUrl
    )

    const result = buildProfileAssetEnterRevealPhaseMap({
      displayedAssets,
      diff,
      source: 'manual-refresh',
      preserveReadyRevealPhase: true,
      resolveProfileAssetImageUrl: (item) => item.imageUrl,
      resolveProfileAssetInitialRevealPhase: (item) => (item.id === 'retained' ? 'steady' : 'icon'),
      buildNextProfileAssetRevealPhaseMap: () => {
        throw new Error('should not use default builder when preserve is enabled')
      },
    })

    expect(result).toEqual({
      retained: 'steady',
      changed: 'icon',
      added: 'icon',
      fallback: 'fallback',
    })
  })
})
