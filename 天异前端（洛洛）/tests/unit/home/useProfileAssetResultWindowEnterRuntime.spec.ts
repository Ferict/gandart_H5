import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildResultWindowDiff,
  type CardQueuePhase,
} from '@/services/home-rail/homeRailResultWindow.service'
import { useProfileAssetResultWindowEnterRuntime } from '@/pages/home/composables/profile/useProfileAssetResultWindowEnterRuntime'
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
    visualTone: 'sunset',
  }) as ProfileAssetItem

const createHarness = () => {
  const displayedAssets = ref<ProfileAssetItem[]>([createAsset('a')])
  const pendingAssets = ref<ProfileAssetItem[]>([createAsset('a')])
  const mountedAssets = ref<ProfileAssetItem[]>([createAsset('a')])
  const mountedAssetIdSet = ref<Set<string>>(new Set(['a']))
  const profileAssetPlaceholderIdSet = ref<Set<string>>(new Set())
  const profileAssetTransitionPhase = ref<'idle' | 'entering'>('idle')
  const pendingProfileAssetWindowDiff = ref(buildResultWindowDiff([], [], (item) => item.imageUrl))
  const profileAssetResultSwitchRunId = ref(1)
  const phaseMap = ref<Record<string, CardQueuePhase>>({})
  const revealPhaseMap = ref<Record<string, ProfileAssetRevealPhase>>({})
  const syncProfileAssetVisualImages = vi.fn()
  const syncProfileAssetRevealPhases = vi.fn()
  const releaseProfileAssetResultsStageMinHeight = vi.fn()
  const flushQueuedProfileAssetSwitch = vi.fn()

  const runtime = useProfileAssetResultWindowEnterRuntime({
    displayedAssets,
    pendingAssets,
    mountedAssets,
    mountedAssetIdSet,
    profileAssetPlaceholderIdSet,
    profileAssetTransitionPhase,
    pendingProfileAssetWindowDiff,
    profileAssetResultSwitchRunId,
    motion: {
      enterDurationMs: 180,
      staggerStepMs: 40,
    },
    syncProfileAssetEntryPhaseMap: (list = displayedAssets.value, resolvePhase) => {
      phaseMap.value = list.reduce<Record<string, CardQueuePhase>>((result, item) => {
        const currentPhase = phaseMap.value[item.id] ?? 'steady'
        result[item.id] = resolvePhase ? resolvePhase(item, currentPhase) : currentPhase
        return result
      }, {})
    },
    visual: {
      buildNextProfileAssetRevealPhaseMap: (diff, source) => {
        return diff.nextWindow.reduce<Record<string, ProfileAssetRevealPhase>>((result, item) => {
          result[item.id] = source === 'manual-refresh' ? 'scan-ready' : 'icon'
          return result
        }, {})
      },
      setProfileAssetRevealPhaseMap: (nextMap) => {
        revealPhaseMap.value = nextMap
      },
      syncProfileAssetVisualImages,
      syncProfileAssetRevealPhases,
    },
    releaseProfileAssetResultsStageMinHeight,
    flushQueuedProfileAssetSwitch,
  })

  return {
    runtime,
    refs: {
      displayedAssets,
      pendingAssets,
      mountedAssets,
      mountedAssetIdSet,
      profileAssetPlaceholderIdSet,
      profileAssetTransitionPhase,
      pendingProfileAssetWindowDiff,
      profileAssetResultSwitchRunId,
      phaseMap,
      revealPhaseMap,
    },
    spies: {
      syncProfileAssetVisualImages,
      syncProfileAssetRevealPhases,
      releaseProfileAssetResultsStageMinHeight,
      flushQueuedProfileAssetSwitch,
    },
  }
}

describe('useProfileAssetResultWindowEnterRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('reveals mounted queued assets and refreshes reveal phases on insertion', async () => {
    vi.useFakeTimers()
    const harness = createHarness()
    const nextWindow = [createAsset('a'), createAsset('b')]
    harness.refs.displayedAssets.value = nextWindow
    harness.refs.pendingAssets.value = [createAsset('a')]
    harness.refs.mountedAssets.value = nextWindow
    harness.refs.mountedAssetIdSet.value = new Set(['a', 'b'])
    harness.refs.profileAssetPlaceholderIdSet.value = new Set(['b'])
    const diff = buildResultWindowDiff([createAsset('a')], nextWindow, (item) => item.imageUrl)

    harness.runtime.scheduleProfileAssetQueuedInsertions(diff, 1, 'manual-refresh')
    await vi.runAllTimersAsync()

    expect(Array.from(harness.refs.profileAssetPlaceholderIdSet.value)).toEqual([])
    expect(harness.refs.pendingAssets.value.map((item) => item.id)).toEqual(['a', 'b'])
    expect(harness.refs.phaseMap.value.b).toBe('entering')
    expect(harness.refs.revealPhaseMap.value).toEqual({
      a: 'scan-ready',
      b: 'scan-ready',
    })
    expect(harness.spies.syncProfileAssetVisualImages).toHaveBeenCalled()
    expect(harness.spies.syncProfileAssetRevealPhases).toHaveBeenCalled()
  })

  it('marks retained mounted assets as replay-entering for manual refresh', async () => {
    const harness = createHarness()
    harness.refs.phaseMap.value = { a: 'steady' }
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    const diff = buildResultWindowDiff(
      [createAsset('a')],
      [createAsset('a')],
      (item) => item.imageUrl
    )

    await harness.runtime.scheduleProfileAssetRetainedReplayEnter(diff, 1, 'manual-refresh')

    expect(harness.refs.phaseMap.value.a).toBe('replay-entering')
    expect(harness.spies.syncProfileAssetVisualImages).toHaveBeenCalled()
    expect(harness.spies.syncProfileAssetRevealPhases).toHaveBeenCalled()
  })

  it('finalize clears transient state and flushes queued switch', () => {
    vi.useFakeTimers()
    const harness = createHarness()
    harness.refs.profileAssetPlaceholderIdSet.value = new Set(['a'])
    harness.refs.profileAssetTransitionPhase.value = 'entering'
    harness.refs.pendingProfileAssetWindowDiff.value = buildResultWindowDiff(
      [createAsset('a')],
      [createAsset('a')],
      (item) => item.imageUrl
    )
    harness.refs.phaseMap.value = { a: 'replay-entering' }
    harness.runtime.scheduleProfileAssetEnterMotionTimeout(() => {}, 999)

    harness.runtime.finalizeProfileAssetEnter()

    expect(Array.from(harness.refs.profileAssetPlaceholderIdSet.value)).toEqual([])
    expect(harness.refs.profileAssetTransitionPhase.value).toBe('idle')
    expect(harness.refs.pendingProfileAssetWindowDiff.value).toBeNull()
    expect(harness.refs.phaseMap.value.a).toBe('steady')
    expect(harness.spies.releaseProfileAssetResultsStageMinHeight).toHaveBeenCalledTimes(1)
    expect(harness.spies.flushQueuedProfileAssetSwitch).toHaveBeenCalledTimes(1)
  })
})
