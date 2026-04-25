import { computed, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildResultWindowDiff } from '@/services/home-rail/homeRailResultWindow.service'
import { useHomeMarketResultWindowSwitchGateway } from '@/pages/home/composables/home/useHomeMarketResultWindowSwitchGateway'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string) =>
  ({
    id,
    imageUrl: `https://cdn.example.com/${id}.png`,
  }) as HomeMarketCard

const createHarness = () => {
  const displayedCollection = ref<HomeMarketCard[]>([createCard('a')])
  const pendingCollection = ref<HomeMarketCard[]>(displayedCollection.value.slice())
  const mountedMarketItems = ref<HomeMarketCard[]>([])
  const marketTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('idle')
  const marketVisibleCount = ref(displayedCollection.value.length)
  const marketCollection = ref(displayedCollection.value.slice())
  const marketResultTotal = ref(displayedCollection.value.length)
  const marketListResolvedPage = ref(1)
  const hasBootstrappedMarketResults = ref(true)
  const marketPlaceholderCardIdSet = ref<Set<string>>(new Set())
  const marketPendingWindowDiff = ref(null)
  const marketResultSwitchRunId = ref(0)
  const startMarketEnterPhase = vi.fn()

  const gateway = useHomeMarketResultWindowSwitchGateway({
    isPanelActive: computed(() => true),
    isMarketTransitioning: computed(() => marketTransitionPhase.value !== 'idle'),
    resultSwitchDebounceMs: 180,
    hasBootstrappedMarketResults,
    marketCollection,
    marketResultTotal,
    marketListResolvedPage,
    marketVisibleCount,
    displayedCollection,
    pendingCollection,
    mountedMarketItems,
    marketPlaceholderCardIdSet,
    marketPendingWindowDiff,
    marketTransitionPhase,
    marketResultSwitchRunId,
    syncResolvedMarketListSnapshot: vi.fn(),
    resolveNextMarketVisibleCount: (nextCollection, options) => {
      if (options?.preserveVisibleCount) {
        return Math.min(marketVisibleCount.value, nextCollection.length)
      }

      return nextCollection.length
    },
    buildMarketWindowDiff: (nextCollection, visibleCount = nextCollection.length) =>
      buildResultWindowDiff(
        displayedCollection.value,
        nextCollection.slice(0, visibleCount),
        (item) => item.imageUrl.trim()
      ),
    startMarketEnterPhase,
    clearMarketQueuedInsertTimeouts: vi.fn(),
    clearMarketLeaveMotionTimeout: vi.fn(),
    clearMarketEnterMotionTimeout: vi.fn(),
    clearMarketLoadMoreObserver: vi.fn(),
    clearMarketCardMotionTimeouts: vi.fn(),
    clearMarketRemovedOverlayItems: vi.fn(),
    releaseMarketResultsStageHeightLock: vi.fn(),
    lockMarketResultsStageHeightToSlotCount: vi.fn(),
    syncMountedMarketWindow: vi.fn(),
    syncMarketCardEntryPhaseMap: vi.fn(),
    applyMarketCardRevealDiff: vi.fn(),
    syncCurrentHomeVisualImages: vi.fn(),
    syncMarketCardRevealStates: vi.fn(),
    scheduleMarketLoadMoreObserver: vi.fn(),
    isSameMarketCollection: (left, right) =>
      left.length === right.length && left.every((item, index) => item.id === right[index]?.id),
  })

  return {
    gateway,
    refs: {
      pendingCollection,
      marketTransitionPhase,
    },
    startMarketEnterPhase,
  }
}

describe('useHomeMarketResultWindowSwitchGateway', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('keeps only the latest queued snapshot while a transition is active', () => {
    const { gateway, refs, startMarketEnterPhase } = createHarness()
    refs.marketTransitionPhase.value = 'entering'

    gateway.queueMarketResultSwitch([createCard('b')])
    gateway.queueMarketResultSwitch([createCard('c')])

    expect(gateway.queuedMarketRequest.value?.collection.map((item) => item.id)).toEqual(['c'])
    expect(startMarketEnterPhase).not.toHaveBeenCalled()

    refs.marketTransitionPhase.value = 'idle'
    gateway.flushQueuedMarketSwitch()

    expect(gateway.queuedMarketRequest.value).toBeNull()
    expect(startMarketEnterPhase).toHaveBeenCalledTimes(1)
    expect(refs.pendingCollection.value.map((item) => item.id)).toEqual(['c'])
    expect(
      startMarketEnterPhase.mock.calls[0][0].nextWindow.map((item: HomeMarketCard) => item.id)
    ).toEqual(['c'])
  })

  it('debounces switch requests and only starts the latest queued snapshot', async () => {
    vi.useFakeTimers()
    const { gateway, refs, startMarketEnterPhase } = createHarness()

    gateway.queueMarketResultSwitch([createCard('b')], false)
    await vi.advanceTimersByTimeAsync(120)
    gateway.queueMarketResultSwitch([createCard('c')], false)

    expect(gateway.queuedMarketRequest.value?.collection.map((item) => item.id)).toEqual(['c'])
    expect(startMarketEnterPhase).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(179)
    expect(startMarketEnterPhase).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(gateway.marketResultSwitchTimeoutId.value).toBeNull()
    expect(gateway.queuedMarketRequest.value).toBeNull()
    expect(startMarketEnterPhase).toHaveBeenCalledTimes(1)
    expect(refs.pendingCollection.value.map((item) => item.id)).toEqual(['c'])
  })
})
