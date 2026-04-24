import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useHomeMarketResultWindowInactiveResetRuntime } from '@/pages/home/composables/home/useHomeMarketResultWindowInactiveResetRuntime'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string) =>
  ({
    id,
    imageUrl: `https://cdn.example.com/${id}.png`,
  }) as HomeMarketCard

describe('useHomeMarketResultWindowInactiveResetRuntime', () => {
  it('clears queued state and motion state on inactive reset', () => {
    const displayedCollection = ref<HomeMarketCard[]>([createCard('a')])
    const queuedMarketRequest = ref({
      collection: [createCard('b')],
      options: { preserveVisibleCount: true, motionSource: 'manual-refresh' },
    })
    const marketPlaceholderCardIdSet = ref(new Set(['placeholder-a']))
    const marketPendingWindowDiff = ref({ nextWindow: [] } as never)
    const marketCurrentEnterAddedIdSet = ref(new Set(['b']))
    const marketTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('entering')
    const isMarketLoadMoreRunning = ref(true)

    const clearMarketMountWindowRaf = vi.fn()
    const clearMountedMarketWindow = vi.fn()
    const clearMarketLeaveMotionTimeout = vi.fn()
    const clearMarketEnterMotionTimeout = vi.fn()
    const clearMarketQueuedInsertTimeouts = vi.fn()
    const clearMarketLoadMoreObserver = vi.fn()
    const clearMarketResultSwitchTimeout = vi.fn()
    const clearMarketRemovedOverlayItems = vi.fn()
    const clearMarketCardMotionTimeouts = vi.fn()
    const releaseMarketResultsStageHeightLock = vi.fn()
    const syncMarketCardEntryPhaseMap = vi.fn()

    const runtime = useHomeMarketResultWindowInactiveResetRuntime({
      displayedCollection,
      queuedMarketRequest,
      marketPlaceholderCardIdSet,
      marketPendingWindowDiff,
      marketCurrentEnterAddedIdSet,
      marketTransitionPhase,
      isMarketLoadMoreRunning,
      clearMarketMountWindowRaf,
      clearMountedMarketWindow,
      clearMarketLeaveMotionTimeout,
      clearMarketEnterMotionTimeout,
      clearMarketQueuedInsertTimeouts,
      clearMarketLoadMoreObserver,
      clearMarketResultSwitchTimeout,
      clearMarketRemovedOverlayItems,
      clearMarketCardMotionTimeouts,
      releaseMarketResultsStageHeightLock,
      syncMarketCardEntryPhaseMap,
    })

    runtime.resetHomeMarketResultWindowForInactive()

    expect(queuedMarketRequest.value).toBeNull()
    expect(marketPendingWindowDiff.value).toBeNull()
    expect(Array.from(marketPlaceholderCardIdSet.value)).toEqual([])
    expect(Array.from(marketCurrentEnterAddedIdSet.value)).toEqual([])
    expect(marketTransitionPhase.value).toBe('idle')
    expect(isMarketLoadMoreRunning.value).toBe(false)
    expect(clearMarketMountWindowRaf).toHaveBeenCalledTimes(1)
    expect(clearMountedMarketWindow).toHaveBeenCalledTimes(1)
    expect(clearMarketCardMotionTimeouts).toHaveBeenCalledTimes(1)
    expect(syncMarketCardEntryPhaseMap).toHaveBeenCalledWith(
      displayedCollection.value,
      expect.any(Function)
    )
  })

  it('runs the extra mount-window cleanup during dispose', () => {
    const clearMarketMountWindowRaf = vi.fn()

    const runtime = useHomeMarketResultWindowInactiveResetRuntime({
      displayedCollection: ref<HomeMarketCard[]>([]),
      queuedMarketRequest: ref(null),
      marketPlaceholderCardIdSet: ref(new Set()),
      marketPendingWindowDiff: ref(null),
      marketCurrentEnterAddedIdSet: ref(new Set()),
      marketTransitionPhase: ref<'idle' | 'leaving' | 'entering'>('idle'),
      isMarketLoadMoreRunning: ref(false),
      clearMarketMountWindowRaf,
      clearMountedMarketWindow: vi.fn(),
      clearMarketLeaveMotionTimeout: vi.fn(),
      clearMarketEnterMotionTimeout: vi.fn(),
      clearMarketQueuedInsertTimeouts: vi.fn(),
      clearMarketLoadMoreObserver: vi.fn(),
      clearMarketResultSwitchTimeout: vi.fn(),
      clearMarketRemovedOverlayItems: vi.fn(),
      clearMarketCardMotionTimeouts: vi.fn(),
      releaseMarketResultsStageHeightLock: vi.fn(),
      syncMarketCardEntryPhaseMap: vi.fn(),
    })

    runtime.disposeHomeMarketResultWindow()

    expect(clearMarketMountWindowRaf).toHaveBeenCalledTimes(2)
  })
})
