import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useProfileAssetResultWindowSwitchGateway } from '@/pages/home/composables/profile/useProfileAssetResultWindowSwitchGateway'
import type { ProfileAssetItem } from '@/models/home-rail/homeRailProfile.model'

const createAsset = (id: string, name = id) =>
  ({
    id,
    name,
    holdingsCount: 1,
    priceUnit: 'ETH',
    price: '1.00',
    imageUrl: `https://cdn.example.com/${id}.png`,
  }) as ProfileAssetItem

const createHarness = () => {
  const visibleAssets = ref<ProfileAssetItem[]>([createAsset('a')])
  const displayedAssets = ref<ProfileAssetItem[]>([createAsset('a')])
  const pendingAssets = ref<ProfileAssetItem[]>([createAsset('a')])
  const hasBootstrappedProfileAssets = ref(true)
  const profileAssetResultMotionSource = ref<'initial-enter' | 'manual-query-switch'>(
    'initial-enter'
  )
  const profileAssetTransitionPhase = ref<'idle' | 'entering'>('idle')
  const pendingProfileAssetWindowDiff = ref(null)
  const isRemoteProfileAssetsLoading = ref(false)
  const bootstrapProfileAssetList = vi.fn()
  const replaceProfileAssetListsImmediately = vi.fn()
  const syncProfileAssetListsWithoutReplay = vi.fn()
  const startProfileAssetResultSwitch = vi.fn()
  const resetPreserveReadyProfileAssetRevealOnNextEnter = vi.fn()

  const gateway = useProfileAssetResultWindowSwitchGateway({
    hasResolvedInitialProfileContent: ref(true),
    visibleAssets: computed(() => visibleAssets.value),
    displayedAssets,
    pendingAssets,
    hasBootstrappedProfileAssets,
    profileAssetResultMotionSource,
    profileAssetTransitionPhase,
    pendingProfileAssetWindowDiff,
    isRemoteProfileAssetsLoading,
    cloneProfileAssetList: (list) => list.slice(),
    buildProfileAssetStructureSignature: (list) => list.map((item) => item.id).join('|'),
    buildProfileAssetContentSignature: (list) =>
      list
        .map(
          (item) =>
            `${item.id}::${item.name}::${item.holdingsCount}::${item.priceUnit}::${item.price}::${item.imageUrl}`
        )
        .join('|'),
    bootstrapProfileAssetList,
    replaceProfileAssetListsImmediately,
    syncProfileAssetListsWithoutReplay,
    startProfileAssetResultSwitch,
    resetPreserveReadyProfileAssetRevealOnNextEnter,
  })

  return {
    gateway,
    refs: {
      profileAssetResultMotionSource,
      profileAssetTransitionPhase,
    },
    replaceProfileAssetListsImmediately,
    startProfileAssetResultSwitch,
    resetPreserveReadyProfileAssetRevealOnNextEnter,
  }
}

describe('useProfileAssetResultWindowSwitchGateway', () => {
  it('records refresh replay requests without starting a new switch immediately', () => {
    const {
      gateway,
      startProfileAssetResultSwitch,
      resetPreserveReadyProfileAssetRevealOnNextEnter,
    } = createHarness()

    gateway.applyResolvedProfileAssetList(
      {
        items: [createAsset('b')],
        total: 1,
      },
      { replay: true }
    )

    expect(gateway.profileAssetRefreshReplayRequestId.value).toBe(1)
    expect(resetPreserveReadyProfileAssetRevealOnNextEnter).toHaveBeenCalledTimes(1)
    expect(startProfileAssetResultSwitch).not.toHaveBeenCalled()
  })

  it('bypasses manual-query-switch motion by replacing lists immediately', () => {
    const { gateway, refs, replaceProfileAssetListsImmediately, startProfileAssetResultSwitch } =
      createHarness()
    refs.profileAssetResultMotionSource.value = 'manual-query-switch'

    gateway.reconcileProfileAssetRender([createAsset('b', 'next')])

    expect(replaceProfileAssetListsImmediately).toHaveBeenCalledTimes(1)
    expect(replaceProfileAssetListsImmediately).toHaveBeenCalledWith([createAsset('b', 'next')])
    expect(startProfileAssetResultSwitch).not.toHaveBeenCalled()
  })

  it('queues a new snapshot while transition is in progress instead of restarting immediately', () => {
    const { gateway, refs, startProfileAssetResultSwitch } = createHarness()
    refs.profileAssetTransitionPhase.value = 'entering'

    gateway.reconcileProfileAssetRender([createAsset('b', 'next')])

    expect(gateway.queuedProfileAssetSwitch.value).toEqual([createAsset('b', 'next')])
    expect(startProfileAssetResultSwitch).not.toHaveBeenCalled()
    expect(gateway.isProfileRefreshPresentationSettled(0)).toBe(false)
  })
})
