import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildResultWindowDiff } from '@/services/home-rail/homeRailResultWindow.service'
import { useProfileAssetResultWindowOverlayRuntime } from '@/pages/home/composables/profile/useProfileAssetResultWindowOverlayRuntime'
import type { ProfileAssetItem } from '@/models/home-rail/homeRailProfile.model'

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
    visualTone: 'mist',
  }) as ProfileAssetItem

describe('useProfileAssetResultWindowOverlayRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('filters overlay items by mounted ids', () => {
    const profileAssetRemovedOverlayItems = ref([] as Array<unknown>)
    const runtime = useProfileAssetResultWindowOverlayRuntime({
      mountedAssetIdSet: ref(new Set(['a'])),
      profileAssetRemovedOverlayItems: profileAssetRemovedOverlayItems as never,
      shouldReleaseProfileAssetResultsStageHeightOnOverlayClear: ref(false),
      leaveDurationMs: 300,
      releaseProfileAssetResultsStageMinHeight: vi.fn(),
    })

    runtime.syncProfileAssetRemovedOverlayItems(
      buildResultWindowDiff(
        [createAsset('a'), createAsset('b')],
        [createAsset('c')],
        (item) => item.imageUrl
      )
    )

    expect(profileAssetRemovedOverlayItems.value).toHaveLength(1)
  })

  it('clears overlay items and releases stage height after leave duration', async () => {
    vi.useFakeTimers()
    const releaseProfileAssetResultsStageMinHeight = vi.fn()
    const profileAssetRemovedOverlayItems = ref([] as Array<unknown>)
    const runtime = useProfileAssetResultWindowOverlayRuntime({
      mountedAssetIdSet: ref(new Set(['a'])),
      profileAssetRemovedOverlayItems: profileAssetRemovedOverlayItems as never,
      shouldReleaseProfileAssetResultsStageHeightOnOverlayClear: ref(false),
      leaveDurationMs: 300,
      releaseProfileAssetResultsStageMinHeight,
    })

    runtime.syncProfileAssetRemovedOverlayItems(
      buildResultWindowDiff([createAsset('a')], [], (item) => item.imageUrl),
      { releaseStageHeightAfterClear: true }
    )
    expect(profileAssetRemovedOverlayItems.value).toHaveLength(1)

    await vi.advanceTimersByTimeAsync(300)
    expect(profileAssetRemovedOverlayItems.value).toEqual([])
    expect(releaseProfileAssetResultsStageMinHeight).toHaveBeenCalledTimes(1)
  })
})
