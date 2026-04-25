import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildResultWindowDiff,
  type CardQueuePhase,
} from '@/services/home-rail/homeRailResultWindow.service'
import { useHomeMarketResultWindowEnterRuntime } from '@/pages/home/composables/home/useHomeMarketResultWindowEnterRuntime'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string, imageUrl = `https://cdn.example.com/${id}.png`) =>
  ({
    id,
    imageUrl,
  }) as HomeMarketCard

const createHarness = () => {
  const displayedCollection = ref<HomeMarketCard[]>([createCard('a')])
  const mountedMarketItems = ref<HomeMarketCard[]>([createCard('a')])
  const mountedMarketItemIdSet = ref<Set<string>>(new Set(['a']))
  const marketPlaceholderCardIdSet = ref<Set<string>>(new Set())
  const marketCurrentEnterAddedIdSet = ref<Set<string>>(new Set())
  const marketTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('idle')
  const marketPendingWindowDiff = ref(buildResultWindowDiff([], [], (item) => item.imageUrl))
  const marketResultSwitchRunId = ref(1)
  const marketResultMotionSource = ref<'initial-enter' | 'manual-refresh'>('initial-enter')
  const phaseMap = ref<Record<string, CardQueuePhase>>({})
  const syncCurrentHomeVisualImages = vi.fn()
  const syncMarketCardRevealStates = vi.fn()
  const scheduleMarketLoadMoreObserver = vi.fn()
  const releaseMarketResultsStageHeightLock = vi.fn()
  const flushQueuedMarketSwitch = vi.fn()

  const runtime = useHomeMarketResultWindowEnterRuntime({
    displayedCollection,
    mountedMarketItems,
    mountedMarketItemIdSet,
    marketPlaceholderCardIdSet,
    marketCurrentEnterAddedIdSet,
    marketTransitionPhase,
    marketPendingWindowDiff,
    marketResultSwitchRunId,
    marketResultMotionSource,
    motion: {
      enterDurationMs: 180,
      staggerStepMs: 40,
    },
    syncMarketCardEntryPhaseMap: (items = displayedCollection.value, resolvePhase) => {
      phaseMap.value = items.reduce<Record<string, CardQueuePhase>>((result, item) => {
        const currentPhase = phaseMap.value[item.id] ?? 'steady'
        result[item.id] = resolvePhase ? resolvePhase(item, currentPhase) : currentPhase
        return result
      }, {})
    },
    syncCurrentHomeVisualImages,
    syncMarketCardRevealStates,
    scheduleMarketLoadMoreObserver,
    releaseMarketResultsStageHeightLock,
    flushQueuedMarketSwitch,
  })

  return {
    runtime,
    refs: {
      displayedCollection,
      mountedMarketItems,
      mountedMarketItemIdSet,
      marketPlaceholderCardIdSet,
      marketCurrentEnterAddedIdSet,
      marketTransitionPhase,
      marketPendingWindowDiff,
      marketResultSwitchRunId,
      marketResultMotionSource,
      phaseMap,
    },
    spies: {
      syncCurrentHomeVisualImages,
      syncMarketCardRevealStates,
      scheduleMarketLoadMoreObserver,
      releaseMarketResultsStageHeightLock,
      flushQueuedMarketSwitch,
    },
  }
}

describe('useHomeMarketResultWindowEnterRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it('reveals mounted queued items and reschedules observer on insertion', async () => {
    vi.useFakeTimers()
    const harness = createHarness()
    const nextWindow = [createCard('a'), createCard('b')]
    harness.refs.displayedCollection.value = nextWindow
    harness.refs.mountedMarketItems.value = nextWindow
    harness.refs.mountedMarketItemIdSet.value = new Set(['a', 'b'])
    harness.refs.marketPlaceholderCardIdSet.value = new Set(['b'])
    const diff = buildResultWindowDiff([createCard('a')], nextWindow, (item) => item.imageUrl)

    harness.runtime.scheduleMarketQueuedInsertions(diff, 1)
    await vi.runAllTimersAsync()

    expect(Array.from(harness.refs.marketPlaceholderCardIdSet.value)).toEqual([])
    expect(harness.refs.phaseMap.value.b).toBe('entering')
    expect(harness.spies.syncCurrentHomeVisualImages).toHaveBeenCalled()
    expect(harness.spies.syncMarketCardRevealStates).toHaveBeenCalledWith(nextWindow)
    expect(harness.spies.scheduleMarketLoadMoreObserver).toHaveBeenCalled()
  })

  it('marks retained mounted items as replay-entering for manual refresh', async () => {
    const harness = createHarness()
    harness.refs.marketResultMotionSource.value = 'manual-refresh'
    harness.refs.phaseMap.value = { a: 'steady' }
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    vi.stubGlobal('cancelAnimationFrame', () => {})
    const diff = buildResultWindowDiff(
      [createCard('a')],
      [createCard('a')],
      (item) => item.imageUrl
    )

    await harness.runtime.scheduleMarketRetainedReplayEnter(diff, 1, 'manual-refresh')

    expect(harness.refs.phaseMap.value.a).toBe('replay-entering')
    expect(harness.spies.syncCurrentHomeVisualImages).toHaveBeenCalled()
    expect(harness.spies.syncMarketCardRevealStates).toHaveBeenCalledWith(
      harness.refs.mountedMarketItems.value
    )
  })

  it('finalize clears transient state and flushes queued switch', () => {
    vi.useFakeTimers()
    const harness = createHarness()
    harness.refs.marketPlaceholderCardIdSet.value = new Set(['a'])
    harness.refs.marketCurrentEnterAddedIdSet.value = new Set(['a'])
    harness.refs.marketTransitionPhase.value = 'entering'
    harness.refs.marketPendingWindowDiff.value = buildResultWindowDiff(
      [createCard('a')],
      [createCard('a')],
      (item) => item.imageUrl
    )
    harness.refs.phaseMap.value = { a: 'replay-entering' }
    harness.runtime.marketEnterMotionTimeoutId.value = setTimeout(() => {}, 999)

    harness.runtime.finalizeMarketEnter()

    expect(Array.from(harness.refs.marketPlaceholderCardIdSet.value)).toEqual([])
    expect(Array.from(harness.refs.marketCurrentEnterAddedIdSet.value)).toEqual([])
    expect(harness.refs.marketTransitionPhase.value).toBe('idle')
    expect(harness.refs.marketPendingWindowDiff.value).toBeNull()
    expect(harness.refs.phaseMap.value.a).toBe('steady')
    expect(harness.spies.releaseMarketResultsStageHeightLock).toHaveBeenCalledTimes(1)
    expect(harness.spies.flushQueuedMarketSwitch).toHaveBeenCalledTimes(1)
    expect(harness.runtime.marketEnterMotionTimeoutId.value).toBeNull()
  })
})
