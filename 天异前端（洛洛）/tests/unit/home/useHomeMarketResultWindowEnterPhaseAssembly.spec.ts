import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import {
  buildResultWindowDiff,
  type CardQueuePhase,
} from '@/services/home-rail/homeRailResultWindow.service'
import { useHomeMarketResultWindowEnterPhaseAssembly } from '@/pages/home/composables/home/useHomeMarketResultWindowEnterPhaseAssembly'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string, imageUrl = `https://cdn.example.com/${id}.png`) =>
  ({
    id,
    imageUrl,
  }) as HomeMarketCard

const createHarness = (options?: {
  hasFullMotion?: boolean
  source?: 'initial-enter' | 'manual-refresh'
}) => {
  const displayedCollection = ref<HomeMarketCard[]>([createCard('a')])
  const pendingCollection = ref<HomeMarketCard[]>([createCard('a')])
  const mountedMarketItems = ref<HomeMarketCard[]>([createCard('a')])
  const mountedMarketItemIdSet = ref<Set<string>>(new Set(['a']))
  const marketPlaceholderCardIdSet = ref<Set<string>>(new Set())
  const marketCurrentEnterAddedIdSet = ref<Set<string>>(new Set())
  const marketPendingWindowDiff = ref(buildResultWindowDiff([], [], (item) => item.imageUrl))
  const marketResultSwitchRunId = ref(0)
  const marketResultMotionSource = ref<'initial-enter' | 'manual-refresh'>(
    options?.source ?? 'initial-enter'
  )
  const marketTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('idle')
  const hasBootstrappedMarketResults = ref(false)
  const marketEnterMotionTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)
  const phaseMap = ref<Record<string, CardQueuePhase>>({})

  const clearMarketLeaveMotionTimeout = vi.fn()
  const clearMarketQueuedInsertTimeouts = vi.fn()
  const clearMarketCardMotionTimeouts = vi.fn()
  const syncMarketRemovedOverlayItems = vi.fn()
  const syncMountedMarketWindow = vi.fn((items: HomeMarketCard[] = displayedCollection.value) => {
    mountedMarketItems.value = items.slice()
    mountedMarketItemIdSet.value = new Set(items.map((item) => item.id))
  })
  const syncMarketCardEntryPhaseMap = vi.fn(
    (
      items: HomeMarketCard[] = displayedCollection.value,
      resolvePhase?: (item: HomeMarketCard, currentPhase: CardQueuePhase) => CardQueuePhase
    ) => {
      phaseMap.value = items.reduce<Record<string, CardQueuePhase>>((result, item) => {
        const currentPhase = phaseMap.value[item.id] ?? 'steady'
        result[item.id] = resolvePhase ? resolvePhase(item, currentPhase) : currentPhase
        return result
      }, {})
    }
  )
  const applyMarketCardRevealDiff = vi.fn()
  const syncCurrentHomeVisualImages = vi.fn()
  const syncMarketCardRevealStates = vi.fn()
  const scheduleMarketQueuedInsertions = vi.fn()
  const flushQueuedMarketSwitch = vi.fn()
  const scheduleMarketRetainedReplayEnter = vi.fn()
  const finalizeMarketEnter = vi.fn()
  const resolveMarketEnterMotionDurationMs = vi.fn(() => 180)

  const runtime = useHomeMarketResultWindowEnterPhaseAssembly({
    pendingCollection,
    displayedCollection,
    mountedMarketItems,
    mountedMarketItemIdSet,
    marketPlaceholderCardIdSet,
    marketCurrentEnterAddedIdSet,
    marketPendingWindowDiff,
    marketResultSwitchRunId,
    marketResultMotionSource,
    marketTransitionPhase,
    hasBootstrappedMarketResults,
    marketEnterMotionTimeoutId,
    buildMarketWindowDiff: (nextCollection) =>
      buildResultWindowDiff(displayedCollection.value, nextCollection, (item) => item.imageUrl),
    clearMarketLeaveMotionTimeout,
    clearMarketQueuedInsertTimeouts,
    clearMarketCardMotionTimeouts,
    syncMarketRemovedOverlayItems,
    syncMountedMarketWindow,
    syncMarketCardEntryPhaseMap,
    applyMarketCardRevealDiff,
    syncCurrentHomeVisualImages,
    syncMarketCardRevealStates,
    scheduleMarketQueuedInsertions,
    hasFullMarketResultSwitchMotion: () => options?.hasFullMotion ?? true,
    flushQueuedMarketSwitch,
    scheduleMarketRetainedReplayEnter,
    resolveMarketEnterMotionDurationMs,
    finalizeMarketEnter,
  })

  return {
    runtime,
    refs: {
      displayedCollection,
      mountedMarketItems,
      mountedMarketItemIdSet,
      marketPlaceholderCardIdSet,
      marketCurrentEnterAddedIdSet,
      marketPendingWindowDiff,
      marketResultSwitchRunId,
      marketResultMotionSource,
      marketTransitionPhase,
      hasBootstrappedMarketResults,
      marketEnterMotionTimeoutId,
      phaseMap,
    },
    spies: {
      clearMarketLeaveMotionTimeout,
      clearMarketQueuedInsertTimeouts,
      clearMarketCardMotionTimeouts,
      syncMarketRemovedOverlayItems,
      syncMountedMarketWindow,
      syncMarketCardEntryPhaseMap,
      applyMarketCardRevealDiff,
      syncCurrentHomeVisualImages,
      syncMarketCardRevealStates,
      scheduleMarketQueuedInsertions,
      flushQueuedMarketSwitch,
      scheduleMarketRetainedReplayEnter,
      resolveMarketEnterMotionDurationMs,
      finalizeMarketEnter,
    },
  }
}

describe('useHomeMarketResultWindowEnterPhaseAssembly', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('flushes immediately for empty next window', () => {
    const harness = createHarness()
    const diff = buildResultWindowDiff([createCard('a')], [], (item) => item.imageUrl)

    harness.runtime.startMarketEnterPhase(diff)

    expect(harness.refs.marketTransitionPhase.value).toBe('idle')
    expect(harness.refs.marketPendingWindowDiff.value).toBeNull()
    expect(Array.from(harness.refs.marketCurrentEnterAddedIdSet.value)).toEqual([])
    expect(harness.spies.syncMarketRemovedOverlayItems).toHaveBeenNthCalledWith(1, diff)
    expect(harness.spies.syncMarketRemovedOverlayItems).toHaveBeenNthCalledWith(2, diff, {
      releaseStageHeightAfterClear: true,
    })
    expect(harness.spies.flushQueuedMarketSwitch).toHaveBeenCalledTimes(1)
    expect(harness.spies.scheduleMarketRetainedReplayEnter).not.toHaveBeenCalled()
  })

  it('bypasses enter motion when full switch motion is disabled', () => {
    const harness = createHarness({ hasFullMotion: false })
    const diff = buildResultWindowDiff(
      [createCard('a')],
      [createCard('a'), createCard('b')],
      (item) => item.imageUrl
    )

    harness.runtime.startMarketEnterPhase(diff)

    expect(harness.refs.marketTransitionPhase.value).toBe('idle')
    expect(harness.refs.marketPendingWindowDiff.value).toBeNull()
    expect(Array.from(harness.refs.marketCurrentEnterAddedIdSet.value)).toEqual([])
    expect(harness.refs.phaseMap.value).toEqual({
      a: 'steady',
      b: 'steady',
    })
    expect(harness.spies.syncMarketCardRevealStates).toHaveBeenCalledWith(
      harness.refs.mountedMarketItems.value
    )
    expect(harness.spies.flushQueuedMarketSwitch).toHaveBeenCalledTimes(1)
    expect(harness.spies.scheduleMarketRetainedReplayEnter).not.toHaveBeenCalled()
  })

  it('enters motion branch and schedules finalize timeout', async () => {
    vi.useFakeTimers()
    const harness = createHarness({ hasFullMotion: true, source: 'manual-refresh' })
    const diff = buildResultWindowDiff(
      [createCard('a')],
      [createCard('a'), createCard('b')],
      (item) => item.imageUrl
    )

    harness.runtime.startMarketEnterPhase(diff)

    expect(harness.refs.marketTransitionPhase.value).toBe('entering')
    expect(harness.refs.hasBootstrappedMarketResults.value).toBe(true)
    expect(harness.spies.scheduleMarketRetainedReplayEnter).toHaveBeenCalledWith(
      diff,
      1,
      'manual-refresh'
    )
    expect(harness.refs.marketEnterMotionTimeoutId.value).not.toBeNull()

    await vi.runAllTimersAsync()

    expect(harness.spies.finalizeMarketEnter).toHaveBeenCalledTimes(1)
  })
})
