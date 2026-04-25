/**
 * Responsibility: own home market result-window load-more expansion, including
 * remote page append gating, visible-count growth, and load-more enter motion handoff.
 * Out of scope: switch gateway decisions, enter-phase assembly, and inactive reset cleanup.
 */
import { nextTick, type ComputedRef, type Ref } from 'vue'
import {
  buildResultWindowQueueIdSet,
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import type {
  HomeRailPaginationAttemptContext,
  HomeRailPaginationAttemptResult,
} from '../shared/useHomeRailPaginationLoadingChain'

type MarketCardEntryPhase = CardQueuePhase

interface UseHomeMarketResultWindowLoadMoreRuntimeOptions {
  isPanelActive: ComputedRef<boolean>
  hasMoreMarketItems: ComputedRef<boolean>
  hasMoreLoadedMarketItems: ComputedRef<boolean>
  isMarketTransitioning: ComputedRef<boolean>
  isMarketLoadMoreRunning: Ref<boolean>
  pendingCollection: Ref<HomeMarketCard[]>
  displayedCollection: Ref<HomeMarketCard[]>
  marketCollection: Ref<HomeMarketCard[]>
  marketResultTotal: Ref<number>
  marketResultMotionSource: Ref<ResultLoadSource>
  marketVisibleCount: Ref<number>
  marketPlaceholderCardIdSet: Ref<Set<string>>
  marketPendingWindowDiff: Ref<ResultWindowDiff<HomeMarketCard> | null>
  marketCurrentEnterAddedIdSet: Ref<Set<string>>
  marketTransitionPhase: Ref<'idle' | 'leaving' | 'entering'>
  marketEnterMotionTimeoutId: Ref<ReturnType<typeof setTimeout> | null>
  marketResultSwitchRunId: Ref<number>
  mountedMarketItemIdSet: Ref<Set<string>>
  isMarketPaginationChainLoading: ComputedRef<boolean>
  layout: {
    loadMoreCount: number
  }
  loadMoreMarketListPage: () => Promise<HomeRailPaginationAttemptResult>
  runMarketPaginationLoadChain: (
    attempt: (
      context: HomeRailPaginationAttemptContext
    ) => Promise<HomeRailPaginationAttemptResult>,
    options?: { manual?: boolean }
  ) => Promise<HomeRailPaginationAttemptResult>
  buildMarketWindowDiff: (
    nextCollection: HomeMarketCard[],
    visibleCount?: number
  ) => ResultWindowDiff<HomeMarketCard>
  clearMarketQueuedInsertTimeouts: () => void
  clearMarketEnterMotionTimeout: () => void
  lockMarketResultsStageHeightToSlotCount: (slotCount: number) => void
  releaseMarketResultsStageHeightLock: () => void
  syncMountedMarketWindow: (items?: HomeMarketCard[]) => void
  syncMarketCardEntryPhaseMap: (
    items?: HomeMarketCard[],
    resolvePhase?: (
      item: HomeMarketCard,
      currentPhase: MarketCardEntryPhase
    ) => MarketCardEntryPhase
  ) => void
  applyMarketCardRevealDiff: (diff: ResultWindowDiff<HomeMarketCard>) => void
  syncCurrentHomeVisualImages: () => void
  syncMarketCardRevealStates: (items?: HomeMarketCard[]) => void
  scheduleMarketQueuedInsertions: (diff: ResultWindowDiff<HomeMarketCard>, runId: number) => void
  scheduleMarketLoadMoreObserver: () => Promise<void> | void
  hasFullMarketResultSwitchMotion: () => boolean
  resolveMarketEnterMotionDurationMs: (items?: HomeMarketCard[]) => number
}

export const useHomeMarketResultWindowLoadMoreRuntime = (
  options: UseHomeMarketResultWindowLoadMoreRuntimeOptions
) => {
  const appendVisibleMarketItemsOnce = async (): Promise<HomeRailPaginationAttemptResult> => {
    options.isMarketLoadMoreRunning.value = true
    try {
      if (
        !options.hasMoreLoadedMarketItems.value &&
        options.pendingCollection.value.length < options.marketResultTotal.value
      ) {
        const loadMoreResult = await options.loadMoreMarketListPage()
        options.pendingCollection.value = options.marketCollection.value
        if (loadMoreResult.outcome !== 'appended' && !options.hasMoreLoadedMarketItems.value) {
          return loadMoreResult
        }
      }

      const nextVisibleCount = Math.min(
        options.pendingCollection.value.length,
        options.displayedCollection.value.length + options.layout.loadMoreCount
      )
      if (nextVisibleCount <= options.displayedCollection.value.length) {
        return {
          outcome: 'no-progress',
          totalReached: options.displayedCollection.value.length >= options.marketResultTotal.value,
        }
      }

      options.marketResultMotionSource.value = 'load-more'
      options.marketVisibleCount.value = nextVisibleCount
      const diff = options.buildMarketWindowDiff(options.pendingCollection.value, nextVisibleCount)
      if (!diff.added.length) {
        return {
          outcome: 'no-progress',
          totalReached: nextVisibleCount >= options.marketResultTotal.value,
        }
      }

      const runId = options.marketResultSwitchRunId.value + 1
      options.marketResultSwitchRunId.value = runId
      options.clearMarketQueuedInsertTimeouts()
      options.lockMarketResultsStageHeightToSlotCount(diff.nextWindow.length)
      options.displayedCollection.value = diff.nextWindow.slice()
      options.syncMountedMarketWindow(diff.nextWindow)
      const mountedQueueIds = buildResultWindowQueueIdSet(
        diff,
        'load-more',
        options.mountedMarketItemIdSet.value
      )
      options.marketPlaceholderCardIdSet.value = mountedQueueIds
      options.marketTransitionPhase.value = 'entering'
      options.marketPendingWindowDiff.value = null
      options.marketCurrentEnterAddedIdSet.value = mountedQueueIds
      options.syncMarketCardEntryPhaseMap(
        options.displayedCollection.value,
        (item, currentPhase) => {
          if (!mountedQueueIds.has(item.id)) {
            return currentPhase
          }

          return 'steady'
        }
      )
      options.applyMarketCardRevealDiff(diff)
      options.syncCurrentHomeVisualImages()
      options.syncMarketCardRevealStates()
      options.scheduleMarketQueuedInsertions(
        {
          ...diff,
          added: diff.added.filter((item) => mountedQueueIds.has(item.id)),
        },
        runId
      )
      void options.scheduleMarketLoadMoreObserver()
      if (!options.hasFullMarketResultSwitchMotion() || mountedQueueIds.size <= 0) {
        options.marketPlaceholderCardIdSet.value = new Set()
        options.syncMarketCardEntryPhaseMap(
          options.displayedCollection.value,
          (_, currentPhase) => {
            return currentPhase === 'entering' ? 'steady' : currentPhase
          }
        )
        options.marketTransitionPhase.value = 'idle'
        options.releaseMarketResultsStageHeightLock()
        return {
          outcome: 'appended',
          totalReached: nextVisibleCount >= options.marketResultTotal.value,
        }
      }

      options.clearMarketEnterMotionTimeout()
      options.marketEnterMotionTimeoutId.value = setTimeout(() => {
        options.clearMarketEnterMotionTimeout()
        options.syncMarketCardEntryPhaseMap(
          options.displayedCollection.value,
          (_, currentPhase) => {
            return currentPhase === 'entering' ? 'steady' : currentPhase
          }
        )
        options.marketTransitionPhase.value = 'idle'
      }, options.resolveMarketEnterMotionDurationMs(diff.added))
      await nextTick()
      return {
        outcome: 'appended',
        totalReached: nextVisibleCount >= options.marketResultTotal.value,
      }
    } finally {
      options.isMarketLoadMoreRunning.value = false
    }
  }

  const appendVisibleMarketItems = async (params: { manual?: boolean } = {}) => {
    if (
      !options.isPanelActive.value ||
      !options.hasMoreMarketItems.value ||
      options.isMarketTransitioning.value ||
      options.isMarketLoadMoreRunning.value ||
      options.isMarketPaginationChainLoading.value
    ) {
      return
    }

    await options.runMarketPaginationLoadChain(() => appendVisibleMarketItemsOnce(), params)
  }

  return {
    appendVisibleMarketItems,
  }
}
