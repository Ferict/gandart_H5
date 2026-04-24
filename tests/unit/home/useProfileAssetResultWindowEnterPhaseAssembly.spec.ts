import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import {
  buildResultWindowDiff,
  type CardQueuePhase,
} from '@/services/home-rail/homeRailResultWindow.service'
import { useProfileAssetResultWindowEnterPhaseAssembly } from '@/pages/home/composables/profile/useProfileAssetResultWindowEnterPhaseAssembly'
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

const createHarness = (options?: {
  source?: 'initial-enter' | 'manual-refresh'
  preserve?: boolean
}) => {
  const pendingAssets = ref<ProfileAssetItem[]>([createAsset('a')])
  const displayedAssets = ref<ProfileAssetItem[]>([createAsset('a')])
  const mountedAssetIdSet = ref<Set<string>>(new Set(['a']))
  const profileAssetPlaceholderIdSet = ref<Set<string>>(new Set())
  const pendingProfileAssetWindowDiff = ref(buildResultWindowDiff([], [], (item) => item.imageUrl))
  const profileAssetResultSwitchRunId = ref(0)
  const profileAssetResultMotionSource = ref<'initial-enter' | 'manual-refresh'>(
    options?.source ?? 'initial-enter'
  )
  const profileAssetTransitionPhase = ref<'idle' | 'entering'>('idle')
  const phaseMap = ref<Record<string, CardQueuePhase>>({})
  const revealPhaseMap = ref<Record<string, ProfileAssetRevealPhase>>({})

  const clearProfileAssetEnterMotionTimeout = vi.fn()
  const clearProfileAssetQueuedInsertTimeouts = vi.fn()
  const syncProfileAssetRemovedOverlayItems = vi.fn()
  const syncMountedProfileAssetWindow = vi.fn(
    (items: ProfileAssetItem[] = displayedAssets.value) => {
      mountedAssetIdSet.value = new Set(items.map((item) => item.id))
    }
  )
  const syncProfileAssetEntryPhaseMap = vi.fn(
    (
      list: ProfileAssetItem[] = displayedAssets.value,
      resolvePhase?: (item: ProfileAssetItem, currentPhase: CardQueuePhase) => CardQueuePhase
    ) => {
      phaseMap.value = list.reduce<Record<string, CardQueuePhase>>((result, item) => {
        const currentPhase = phaseMap.value[item.id] ?? 'steady'
        result[item.id] = resolvePhase ? resolvePhase(item, currentPhase) : currentPhase
        return result
      }, {})
    }
  )
  const consumePreserveReadyRevealPhase = vi.fn(() => options?.preserve ?? false)
  const setProfileAssetRevealPhaseMap = vi.fn(
    (nextMap: Record<string, ProfileAssetRevealPhase>) => {
      revealPhaseMap.value = nextMap
    }
  )
  const syncProfileAssetVisualImages = vi.fn()
  const syncProfileAssetRevealPhases = vi.fn()
  const scheduleProfileAssetQueuedInsertions = vi.fn()
  const flushQueuedProfileAssetSwitch = vi.fn()
  const scheduleProfileAssetRetainedReplayEnter = vi.fn()
  const finalizeProfileAssetEnter = vi.fn()
  const scheduleProfileAssetEnterMotionTimeout = vi.fn()
  const resolveProfileAssetEnterMotionDurationMs = vi.fn(() => 180)

  const runtime = useProfileAssetResultWindowEnterPhaseAssembly({
    pendingAssets,
    displayedAssets,
    mountedAssetIdSet,
    profileAssetPlaceholderIdSet,
    pendingProfileAssetWindowDiff,
    profileAssetResultSwitchRunId,
    profileAssetResultMotionSource,
    profileAssetTransitionPhase,
    buildProfileAssetWindowDiff: (nextAssets) =>
      buildResultWindowDiff(displayedAssets.value, nextAssets, (item) => item.imageUrl),
    clearProfileAssetEnterMotionTimeout,
    clearProfileAssetQueuedInsertTimeouts,
    syncProfileAssetRemovedOverlayItems,
    syncMountedProfileAssetWindow,
    syncProfileAssetEntryPhaseMap,
    consumePreserveReadyRevealPhase,
    visual: {
      resolveProfileAssetImageUrl: (item) => item.imageUrl,
      resolveProfileAssetInitialRevealPhase: (item) => (item.id === 'a' ? 'steady' : 'icon'),
      buildNextProfileAssetRevealPhaseMap: (diff) =>
        diff.nextWindow.reduce<Record<string, ProfileAssetRevealPhase>>((result, item) => {
          result[item.id] = 'icon'
          return result
        }, {}),
      setProfileAssetRevealPhaseMap,
      syncProfileAssetVisualImages,
      syncProfileAssetRevealPhases,
    },
    scheduleProfileAssetQueuedInsertions,
    flushQueuedProfileAssetSwitch,
    scheduleProfileAssetRetainedReplayEnter,
    finalizeProfileAssetEnter,
    scheduleProfileAssetEnterMotionTimeout,
    resolveProfileAssetEnterMotionDurationMs,
  })

  return {
    runtime,
    refs: {
      pendingAssets,
      displayedAssets,
      mountedAssetIdSet,
      profileAssetPlaceholderIdSet,
      pendingProfileAssetWindowDiff,
      profileAssetResultSwitchRunId,
      profileAssetResultMotionSource,
      profileAssetTransitionPhase,
      phaseMap,
      revealPhaseMap,
    },
    spies: {
      clearProfileAssetEnterMotionTimeout,
      clearProfileAssetQueuedInsertTimeouts,
      syncProfileAssetRemovedOverlayItems,
      syncMountedProfileAssetWindow,
      syncProfileAssetEntryPhaseMap,
      consumePreserveReadyRevealPhase,
      setProfileAssetRevealPhaseMap,
      syncProfileAssetVisualImages,
      syncProfileAssetRevealPhases,
      scheduleProfileAssetQueuedInsertions,
      flushQueuedProfileAssetSwitch,
      scheduleProfileAssetRetainedReplayEnter,
      finalizeProfileAssetEnter,
      scheduleProfileAssetEnterMotionTimeout,
      resolveProfileAssetEnterMotionDurationMs,
    },
  }
}

describe('useProfileAssetResultWindowEnterPhaseAssembly', () => {
  it('flushes immediately for empty next window and preserves previous mounted ids for overlay handoff', () => {
    const harness = createHarness()
    const diff = buildResultWindowDiff([createAsset('a')], [], (item) => item.imageUrl)

    harness.runtime.startProfileAssetEnterPhase(diff)

    expect(harness.refs.profileAssetTransitionPhase.value).toBe('idle')
    expect(harness.refs.pendingProfileAssetWindowDiff.value).toBeNull()
    expect(Array.from(harness.refs.profileAssetPlaceholderIdSet.value)).toEqual([])
    expect(harness.spies.syncProfileAssetRemovedOverlayItems).toHaveBeenNthCalledWith(1, diff, {
      mountedIds: new Set(['a']),
    })
    expect(harness.spies.syncProfileAssetRemovedOverlayItems).toHaveBeenNthCalledWith(2, diff, {
      releaseStageHeightAfterClear: true,
      mountedIds: new Set(['a']),
    })
    expect(harness.spies.flushQueuedProfileAssetSwitch).toHaveBeenCalledTimes(1)
  })

  it('builds preserved reveal map and enters motion branch', () => {
    const harness = createHarness({ source: 'manual-refresh', preserve: true })
    const diff = buildResultWindowDiff(
      [createAsset('a')],
      [createAsset('a'), createAsset('b')],
      (item) => item.imageUrl
    )

    harness.runtime.startProfileAssetEnterPhase(diff)

    expect(harness.refs.profileAssetTransitionPhase.value).toBe('entering')
    expect(harness.refs.revealPhaseMap.value).toEqual({
      a: 'steady',
      b: 'icon',
    })
    expect(harness.spies.consumePreserveReadyRevealPhase).toHaveBeenCalledTimes(1)
    expect(harness.spies.scheduleProfileAssetQueuedInsertions).toHaveBeenCalledWith(
      diff,
      1,
      'manual-refresh'
    )
    expect(harness.spies.scheduleProfileAssetRetainedReplayEnter).toHaveBeenCalledWith(
      diff,
      1,
      'manual-refresh'
    )
    expect(harness.spies.scheduleProfileAssetEnterMotionTimeout).toHaveBeenCalledWith(
      harness.spies.finalizeProfileAssetEnter,
      180
    )
  })

  it('finalizes immediately when enter queue is empty', () => {
    const harness = createHarness({ source: 'initial-enter' })
    const diff = buildResultWindowDiff(
      [createAsset('a')],
      [createAsset('a')],
      (item) => item.imageUrl
    )

    harness.runtime.startProfileAssetEnterPhase(diff)

    expect(harness.refs.profileAssetTransitionPhase.value).toBe('entering')
    expect(harness.spies.finalizeProfileAssetEnter).toHaveBeenCalledTimes(1)
    expect(harness.spies.scheduleProfileAssetEnterMotionTimeout).not.toHaveBeenCalled()
  })
})
