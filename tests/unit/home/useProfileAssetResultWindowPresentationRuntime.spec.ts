import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useProfileAssetResultWindowPresentationRuntime } from '@/pages/home/composables/profile/useProfileAssetResultWindowPresentationRuntime'
import type { ProfileAssetItem } from '@/models/home-rail/homeRailProfile.model'
import type { ResultWindowDiff } from '@/services/home-rail/homeRailResultWindow.service'

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

describe('useProfileAssetResultWindowPresentationRuntime', () => {
  it('exposes signatures, endline state, entry styles, and overlay positioning', () => {
    const displayedAssets = ref([createAsset('a')])
    const pendingDiff = ref<ResultWindowDiff<ProfileAssetItem> | null>({
      nextWindow: [createAsset('a'), createAsset('b')],
      added: [createAsset('b')],
      removed: [],
      retained: [createAsset('a')],
      addedIds: new Set(['b']),
      removedIds: new Set(),
      retainedIds: new Set(['a']),
    } as ResultWindowDiff<ProfileAssetItem>)

    const runtime = useProfileAssetResultWindowPresentationRuntime({
      visibleAssets: computed(() => [createAsset('a'), createAsset('b')]),
      resolvedProfileAssetTotal: computed(() => 2),
      displayedAssets,
      mountedAssets: ref([createAsset('a'), createAsset('b')]),
      profileAssetPlaceholderIdSet: ref(new Set(['placeholder-1'])),
      pendingProfileAssetWindowDiff: pendingDiff,
      profileAssetEntryPhaseMap: ref({
        a: 'entering',
        b: 'replay-entering',
      }),
      profileAssetResultMotionSource: ref('manual-refresh'),
      resolveProfileAssetImageUrl: (item) => item.imageUrl,
      staggerStepMs: 100,
      columns: 2,
    })

    expect(runtime.visibleProfileAssetStructureSignature.value).toBe('a|b')
    expect(runtime.visibleProfileAssetContentSignature.value).toContain('a::asset-a')
    expect(runtime.shouldShowProfileBottomEndline.value).toBe(true)
    expect(runtime.isProfileAssetPlaceholder('placeholder-1')).toBe(true)
    expect(runtime.resolveProfileAssetEntryClass('a')).toMatchObject({
      'is-entering': true,
      'is-motion-manual-refresh': true,
    })
    expect(runtime.resolveProfileAssetEntryStyle('a', 1)).toEqual({
      '--home-profile-asset-entry-delay': '100ms',
    })
    expect(runtime.resolveProfileAssetRemovedOverlayItemStyle(3)).toEqual({
      gridRowStart: '2',
      gridColumnStart: '2',
    })
  })
})
