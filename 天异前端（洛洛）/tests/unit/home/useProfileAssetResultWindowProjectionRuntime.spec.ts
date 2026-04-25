import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { buildResultWindowDiff } from '@/services/home-rail/homeRailResultWindow.service'
import { useProfileAssetResultWindowProjectionRuntime } from '@/pages/home/composables/profile/useProfileAssetResultWindowProjectionRuntime'
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
    visualTone: 'mist',
  }) as ProfileAssetItem

const buildStructureSignature = (list: ProfileAssetItem[]) => list.map((item) => item.id).join('|')

describe('useProfileAssetResultWindowProjectionRuntime', () => {
  it('bootstraps by syncing handled replay id and delegating to result switch', () => {
    const startProfileAssetResultSwitch = vi.fn()
    const handledProfileAssetRefreshReplayRequestId = ref(1)
    const profileAssetRefreshReplayRequestId = ref(3)
    const visibleAssets = ref([createAsset('a')])
    const hasBootstrappedProfileAssets = ref(false)

    const runtime = useProfileAssetResultWindowProjectionRuntime({
      visibleAssets: computed(() => visibleAssets.value),
      displayedAssets: ref([]),
      pendingAssets: ref([]),
      hasBootstrappedProfileAssets,
      profileAssetResultMotionSource: ref<'initial-enter' | 'manual-refresh'>('initial-enter'),
      profileAssetTransitionPhase: ref<'idle' | 'entering'>('idle'),
      queuedProfileAssetSwitch: ref(null),
      pendingProfileAssetWindowDiff: ref(null),
      profileAssetPlaceholderIdSet: ref(new Set()),
      profileAssetEntryPhaseMap: ref({}),
      handledProfileAssetRefreshReplayRequestId,
      profileAssetRefreshReplayRequestId,
      cloneProfileAssetList: (list) => list.slice(),
      buildProfileAssetStructureSignature: buildStructureSignature,
      buildProfileAssetWindowDiff: (nextAssets) =>
        buildResultWindowDiff([], nextAssets, (item) => item.imageUrl),
      startProfileAssetResultSwitch,
      syncMountedProfileAssetWindow: vi.fn(),
      clearMountedProfileAssetWindow: vi.fn(),
      clearProfileAssetEnterMotionTimeout: vi.fn(),
      clearProfileAssetQueuedInsertTimeouts: vi.fn(),
      clearProfileAssetRemovedOverlayItems: vi.fn(),
      releaseProfileAssetResultsStageMinHeight: vi.fn(),
      syncProfileAssetEntryPhaseMap: vi.fn(),
      visual: {
        buildNextProfileAssetRevealPhaseMap: vi.fn(() => ({})),
        setProfileAssetRevealPhaseMap: vi.fn(),
        syncProfileAssetVisualImages: vi.fn(),
        syncProfileAssetRevealPhases: vi.fn(),
        clearProfileAssetRevealTimeouts: vi.fn(),
      },
    })

    runtime.bootstrapProfileAssetList()

    expect(hasBootstrappedProfileAssets.value).toBe(true)
    expect(handledProfileAssetRefreshReplayRequestId.value).toBe(3)
    expect(startProfileAssetResultSwitch).toHaveBeenCalledWith(visibleAssets.value)
  })

  it('replaces lists immediately and refreshes reveal map', () => {
    const displayedAssets = ref([createAsset('a')])
    const pendingAssets = ref([createAsset('a')])
    const queuedProfileAssetSwitch = ref([createAsset('queued')])
    const pendingProfileAssetWindowDiff = ref({ nextWindow: [] } as never)
    const profileAssetPlaceholderIdSet = ref(new Set(['placeholder-a']))
    const phaseMap = ref<Record<string, string>>({ a: 'entering' })
    const revealPhaseMap = ref<Record<string, ProfileAssetRevealPhase>>({})
    const setProfileAssetRevealPhaseMap = vi.fn(
      (nextMap: Record<string, ProfileAssetRevealPhase>) => {
        revealPhaseMap.value = nextMap
      }
    )
    const syncMountedProfileAssetWindow = vi.fn()

    const runtime = useProfileAssetResultWindowProjectionRuntime({
      visibleAssets: computed(() => []),
      displayedAssets,
      pendingAssets,
      hasBootstrappedProfileAssets: ref(false),
      profileAssetResultMotionSource: ref<'initial-enter' | 'manual-refresh'>('manual-refresh'),
      profileAssetTransitionPhase: ref<'idle' | 'entering'>('entering'),
      queuedProfileAssetSwitch,
      pendingProfileAssetWindowDiff,
      profileAssetPlaceholderIdSet,
      profileAssetEntryPhaseMap: phaseMap,
      handledProfileAssetRefreshReplayRequestId: ref(0),
      profileAssetRefreshReplayRequestId: ref(0),
      cloneProfileAssetList: (list) => list.slice(),
      buildProfileAssetStructureSignature: buildStructureSignature,
      buildProfileAssetWindowDiff: (nextAssets) =>
        buildResultWindowDiff(displayedAssets.value, nextAssets, (item) => item.imageUrl),
      startProfileAssetResultSwitch: vi.fn(),
      syncMountedProfileAssetWindow,
      clearMountedProfileAssetWindow: vi.fn(),
      clearProfileAssetEnterMotionTimeout: vi.fn(),
      clearProfileAssetQueuedInsertTimeouts: vi.fn(),
      clearProfileAssetRemovedOverlayItems: vi.fn(),
      releaseProfileAssetResultsStageMinHeight: vi.fn(),
      syncProfileAssetEntryPhaseMap: vi.fn((list, resolvePhase) => {
        phaseMap.value = (list ?? []).reduce<Record<string, string>>((result, item) => {
          const currentPhase = phaseMap.value[item.id] ?? 'steady'
          result[item.id] = resolvePhase ? resolvePhase(item, currentPhase) : currentPhase
          return result
        }, {})
      }),
      visual: {
        buildNextProfileAssetRevealPhaseMap: vi.fn((diff) =>
          diff.nextWindow.reduce<Record<string, ProfileAssetRevealPhase>>((result, item) => {
            result[item.id] = 'icon'
            return result
          }, {})
        ),
        setProfileAssetRevealPhaseMap,
        syncProfileAssetVisualImages: vi.fn(),
        syncProfileAssetRevealPhases: vi.fn(),
        clearProfileAssetRevealTimeouts: vi.fn(),
      },
    })

    runtime.replaceProfileAssetListsImmediately([createAsset('b')])

    expect(queuedProfileAssetSwitch.value).toBeNull()
    expect(pendingProfileAssetWindowDiff.value).toBeNull()
    expect(Array.from(profileAssetPlaceholderIdSet.value)).toEqual([])
    expect(displayedAssets.value.map((item) => item.id)).toEqual(['b'])
    expect(pendingAssets.value.map((item) => item.id)).toEqual(['b'])
    expect(syncMountedProfileAssetWindow).toHaveBeenCalledWith(displayedAssets.value)
    expect(setProfileAssetRevealPhaseMap).toHaveBeenCalledWith({ b: 'icon' })
  })

  it('resets projection state to empty baseline', () => {
    const displayedAssets = ref([createAsset('a')])
    const pendingAssets = ref([createAsset('b')])
    const queuedProfileAssetSwitch = ref([createAsset('queued')])
    const pendingProfileAssetWindowDiff = ref({ nextWindow: [] } as never)
    const profileAssetPlaceholderIdSet = ref(new Set(['placeholder-a']))
    const profileAssetEntryPhaseMap = ref<Record<string, string>>({ a: 'steady' })
    const setProfileAssetRevealPhaseMap = vi.fn()
    const hasBootstrappedProfileAssets = ref(true)
    const clearMountedProfileAssetWindow = vi.fn()

    const runtime = useProfileAssetResultWindowProjectionRuntime({
      visibleAssets: computed(() => []),
      displayedAssets,
      pendingAssets,
      hasBootstrappedProfileAssets,
      profileAssetResultMotionSource: ref<'initial-enter' | 'manual-refresh'>('initial-enter'),
      profileAssetTransitionPhase: ref<'idle' | 'entering'>('entering'),
      queuedProfileAssetSwitch,
      pendingProfileAssetWindowDiff,
      profileAssetPlaceholderIdSet,
      profileAssetEntryPhaseMap,
      handledProfileAssetRefreshReplayRequestId: ref(0),
      profileAssetRefreshReplayRequestId: ref(0),
      cloneProfileAssetList: (list) => list.slice(),
      buildProfileAssetStructureSignature: buildStructureSignature,
      buildProfileAssetWindowDiff: (nextAssets) =>
        buildResultWindowDiff(displayedAssets.value, nextAssets, (item) => item.imageUrl),
      startProfileAssetResultSwitch: vi.fn(),
      syncMountedProfileAssetWindow: vi.fn(),
      clearMountedProfileAssetWindow,
      clearProfileAssetEnterMotionTimeout: vi.fn(),
      clearProfileAssetQueuedInsertTimeouts: vi.fn(),
      clearProfileAssetRemovedOverlayItems: vi.fn(),
      releaseProfileAssetResultsStageMinHeight: vi.fn(),
      syncProfileAssetEntryPhaseMap: vi.fn(),
      visual: {
        buildNextProfileAssetRevealPhaseMap: vi.fn(() => ({})),
        setProfileAssetRevealPhaseMap,
        syncProfileAssetVisualImages: vi.fn(),
        syncProfileAssetRevealPhases: vi.fn(),
        clearProfileAssetRevealTimeouts: vi.fn(),
      },
    })

    runtime.resetProfileAssetProjection()

    expect(displayedAssets.value).toEqual([])
    expect(pendingAssets.value).toEqual([])
    expect(queuedProfileAssetSwitch.value).toBeNull()
    expect(pendingProfileAssetWindowDiff.value).toBeNull()
    expect(Array.from(profileAssetPlaceholderIdSet.value)).toEqual([])
    expect(profileAssetEntryPhaseMap.value).toEqual({})
    expect(setProfileAssetRevealPhaseMap).toHaveBeenCalledWith({})
    expect(hasBootstrappedProfileAssets.value).toBe(false)
    expect(clearMountedProfileAssetWindow).toHaveBeenCalledTimes(1)
  })
})
