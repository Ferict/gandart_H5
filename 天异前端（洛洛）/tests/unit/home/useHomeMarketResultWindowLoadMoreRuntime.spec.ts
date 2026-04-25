import { computed, ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildResultWindowDiff } from '@/services/home-rail/homeRailResultWindow.service'
import { useHomeMarketResultWindowLoadMoreRuntime } from '@/pages/home/composables/home/useHomeMarketResultWindowLoadMoreRuntime'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string) =>
  ({
    id,
    imageUrl: `https://cdn.example.com/${id}.png`,
  }) as HomeMarketCard

describe('useHomeMarketResultWindowLoadMoreRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns early when the panel is inactive', async () => {
    const loadMoreMarketListPage = vi.fn(async () => ({ outcome: 'appended' as const }))
    const runtime = useHomeMarketResultWindowLoadMoreRuntime({
      isPanelActive: computed(() => false),
      hasMoreMarketItems: computed(() => true),
      hasMoreLoadedMarketItems: computed(() => true),
      isMarketTransitioning: computed(() => false),
      isMarketLoadMoreRunning: ref(false),
      pendingCollection: ref([createCard('a'), createCard('b')]),
      displayedCollection: ref([createCard('a')]),
      marketCollection: ref([createCard('a'), createCard('b')]),
      marketResultTotal: ref(2),
      marketResultMotionSource: ref('initial-enter'),
      marketVisibleCount: ref(1),
      marketPlaceholderCardIdSet: ref(new Set()),
      marketPendingWindowDiff: ref(null),
      marketCurrentEnterAddedIdSet: ref(new Set()),
      marketTransitionPhase: ref<'idle' | 'leaving' | 'entering'>('idle'),
      marketEnterMotionTimeoutId: ref(null),
      marketResultSwitchRunId: ref(0),
      mountedMarketItemIdSet: ref(new Set(['a'])),
      isMarketPaginationChainLoading: computed(() => false),
      layout: { loadMoreCount: 1 },
      loadMoreMarketListPage,
      runMarketPaginationLoadChain: async (attempt) =>
        attempt({
          querySignature: 'sig-test',
          requestVersion: 1,
        }),
      buildMarketWindowDiff: (nextCollection, visibleCount = nextCollection.length) =>
        buildResultWindowDiff(
          [createCard('a')],
          nextCollection.slice(0, visibleCount),
          (item) => item.imageUrl
        ),
      clearMarketQueuedInsertTimeouts: vi.fn(),
      clearMarketEnterMotionTimeout: vi.fn(),
      lockMarketResultsStageHeightToSlotCount: vi.fn(),
      releaseMarketResultsStageHeightLock: vi.fn(),
      syncMountedMarketWindow: vi.fn(),
      syncMarketCardEntryPhaseMap: vi.fn(),
      applyMarketCardRevealDiff: vi.fn(),
      syncCurrentHomeVisualImages: vi.fn(),
      syncMarketCardRevealStates: vi.fn(),
      scheduleMarketQueuedInsertions: vi.fn(),
      scheduleMarketLoadMoreObserver: vi.fn(),
      hasFullMarketResultSwitchMotion: vi.fn(() => true),
      resolveMarketEnterMotionDurationMs: vi.fn(() => 180),
    })

    await runtime.appendVisibleMarketItems()

    expect(loadMoreMarketListPage).not.toHaveBeenCalled()
  })

  it('appends visible items and clears placeholders immediately when motion is bypassed', async () => {
    vi.useFakeTimers()
    const displayedCollection = ref([createCard('a')])
    const pendingCollection = ref([createCard('a'), createCard('b')])
    const marketPlaceholderCardIdSet = ref(new Set<string>())
    const marketTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('idle')
    const isMarketLoadMoreRunning = ref(false)

    const runtime = useHomeMarketResultWindowLoadMoreRuntime({
      isPanelActive: computed(() => true),
      hasMoreMarketItems: computed(() => true),
      hasMoreLoadedMarketItems: computed(() => true),
      isMarketTransitioning: computed(() => false),
      isMarketLoadMoreRunning,
      pendingCollection,
      displayedCollection,
      marketCollection: ref(pendingCollection.value.slice()),
      marketResultTotal: ref(2),
      marketResultMotionSource: ref('initial-enter'),
      marketVisibleCount: ref(1),
      marketPlaceholderCardIdSet,
      marketPendingWindowDiff: ref({ nextWindow: [] } as never),
      marketCurrentEnterAddedIdSet: ref(new Set<string>()),
      marketTransitionPhase,
      marketEnterMotionTimeoutId: ref(null),
      marketResultSwitchRunId: ref(0),
      mountedMarketItemIdSet: ref(new Set(['a'])),
      isMarketPaginationChainLoading: computed(() => false),
      layout: { loadMoreCount: 1 },
      loadMoreMarketListPage: vi.fn(async () => ({ outcome: 'appended' as const })),
      runMarketPaginationLoadChain: async (attempt) =>
        attempt({
          querySignature: 'sig-test',
          requestVersion: 1,
        }),
      buildMarketWindowDiff: (nextCollection, visibleCount = nextCollection.length) =>
        buildResultWindowDiff(
          displayedCollection.value,
          nextCollection.slice(0, visibleCount),
          (item) => item.imageUrl
        ),
      clearMarketQueuedInsertTimeouts: vi.fn(),
      clearMarketEnterMotionTimeout: vi.fn(),
      lockMarketResultsStageHeightToSlotCount: vi.fn(),
      releaseMarketResultsStageHeightLock: vi.fn(),
      syncMountedMarketWindow: vi.fn((items) => {
        displayedCollection.value = (items ?? []).slice()
      }),
      syncMarketCardEntryPhaseMap: vi.fn(),
      applyMarketCardRevealDiff: vi.fn(),
      syncCurrentHomeVisualImages: vi.fn(),
      syncMarketCardRevealStates: vi.fn(),
      scheduleMarketQueuedInsertions: vi.fn(),
      scheduleMarketLoadMoreObserver: vi.fn(),
      hasFullMarketResultSwitchMotion: vi.fn(() => false),
      resolveMarketEnterMotionDurationMs: vi.fn(() => 180),
    })

    await runtime.appendVisibleMarketItems()

    expect(displayedCollection.value.map((item) => item.id)).toEqual(['a', 'b'])
    expect(Array.from(marketPlaceholderCardIdSet.value)).toEqual([])
    expect(marketTransitionPhase.value).toBe('idle')
    expect(isMarketLoadMoreRunning.value).toBe(false)
  })
})
