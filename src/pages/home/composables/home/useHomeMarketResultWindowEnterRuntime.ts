/**
 * Responsibility: encapsulate home market result-window enter-phase runtime, including
 * queued insertion scheduling, retained replay enter scheduling, and finalize cleanup.
 * Out of scope: diff calculation, switch gateway entry, overlay lifecycle, and load-more fetch.
 */
import { nextTick, ref, type Ref } from 'vue'
import {
  shouldReplayRetainedForResultSource,
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'

type HomeMarketResultMotionSource = ResultLoadSource
type MarketCardEntryPhase = CardQueuePhase

interface UseHomeMarketResultWindowEnterRuntimeMotionOptions {
  enterDurationMs: number
  staggerStepMs: number
}

interface UseHomeMarketResultWindowEnterRuntimeOptions {
  displayedCollection: Ref<HomeMarketCard[]>
  mountedMarketItems: Ref<HomeMarketCard[]>
  mountedMarketItemIdSet: Ref<Set<string>>
  marketPlaceholderCardIdSet: Ref<Set<string>>
  marketCurrentEnterAddedIdSet: Ref<Set<string>>
  marketTransitionPhase: Ref<'idle' | 'leaving' | 'entering'>
  marketPendingWindowDiff: Ref<ResultWindowDiff<HomeMarketCard> | null>
  marketResultSwitchRunId: Ref<number>
  motion: UseHomeMarketResultWindowEnterRuntimeMotionOptions
  syncMarketCardEntryPhaseMap: (
    items?: HomeMarketCard[],
    resolvePhase?: (
      item: HomeMarketCard,
      currentPhase: MarketCardEntryPhase
    ) => MarketCardEntryPhase
  ) => void
  syncCurrentHomeVisualImages: () => void
  syncMarketCardRevealStates: (items?: HomeMarketCard[]) => void
  scheduleMarketLoadMoreObserver: () => Promise<void> | void
  releaseMarketResultsStageHeightLock: () => void
  flushQueuedMarketSwitch: () => void
}

export const useHomeMarketResultWindowEnterRuntime = (
  options: UseHomeMarketResultWindowEnterRuntimeOptions
) => {
  const marketEnterMotionTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)
  let marketQueuedInsertTimeoutIds: ReturnType<typeof setTimeout>[] = []

  const clearMarketQueuedInsertTimeouts = () => {
    marketQueuedInsertTimeoutIds.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    marketQueuedInsertTimeoutIds = []
  }

  const clearMarketEnterMotionTimeout = () => {
    if (!marketEnterMotionTimeoutId.value) {
      return
    }

    clearTimeout(marketEnterMotionTimeoutId.value)
    marketEnterMotionTimeoutId.value = null
  }

  const resolveMarketEnterMotionDurationMs = (
    items: HomeMarketCard[] = options.displayedCollection.value
  ) => {
    if (!items.length) {
      return options.motion.enterDurationMs
    }

    return options.motion.enterDurationMs + (items.length - 1) * options.motion.staggerStepMs
  }

  const scheduleMarketRetainedReplayEnter = async (
    diff: ResultWindowDiff<HomeMarketCard>,
    runId: number,
    source: HomeMarketResultMotionSource
  ) => {
    if (!shouldReplayRetainedForResultSource(source)) {
      return
    }

    const retainedReplayIds = new Set(
      diff.nextWindow
        .filter(
          (item) => !diff.addedIds.has(item.id) && options.mountedMarketItemIdSet.value.has(item.id)
        )
        .map((item) => item.id)
    )
    if (!retainedReplayIds.size) {
      return
    }

    await nextTick()
    requestAnimationFrame(() => {
      if (options.marketResultSwitchRunId.value !== runId) {
        return
      }

      options.syncMarketCardEntryPhaseMap(
        options.displayedCollection.value,
        (item, currentPhase) => {
          if (retainedReplayIds.has(item.id)) {
            return 'replay-entering'
          }

          return currentPhase
        }
      )
      options.syncCurrentHomeVisualImages()
      options.syncMarketCardRevealStates(options.mountedMarketItems.value)
    })
  }

  const finalizeMarketEnter = () => {
    clearMarketEnterMotionTimeout()
    clearMarketQueuedInsertTimeouts()
    options.marketPlaceholderCardIdSet.value = new Set()
    options.marketCurrentEnterAddedIdSet.value = new Set()
    options.syncMarketCardEntryPhaseMap(options.displayedCollection.value, (_, currentPhase) => {
      return currentPhase === 'entering' ||
        currentPhase === 'replay-entering' ||
        currentPhase === 'replay-prep'
        ? 'steady'
        : currentPhase
    })
    options.marketTransitionPhase.value = 'idle'
    options.marketPendingWindowDiff.value = null
    options.releaseMarketResultsStageHeightLock()
    options.flushQueuedMarketSwitch()
  }

  const scheduleMarketQueuedInsertions = (
    diff: ResultWindowDiff<HomeMarketCard>,
    runId: number
  ) => {
    if (!diff.added.length) {
      return
    }

    diff.added.forEach((queuedItem, queueIndex) => {
      if (!options.mountedMarketItemIdSet.value.has(queuedItem.id)) {
        return
      }

      const timeoutId = setTimeout(() => {
        if (options.marketResultSwitchRunId.value !== runId) {
          return
        }

        const nextPlaceholderIds = new Set(options.marketPlaceholderCardIdSet.value)
        nextPlaceholderIds.delete(queuedItem.id)
        options.marketPlaceholderCardIdSet.value = nextPlaceholderIds
        options.syncMarketCardEntryPhaseMap(
          options.displayedCollection.value,
          (item, currentPhase) => {
            if (item.id === queuedItem.id) {
              return 'entering'
            }

            return currentPhase
          }
        )
        options.syncCurrentHomeVisualImages()
        options.syncMarketCardRevealStates(options.mountedMarketItems.value)
        void options.scheduleMarketLoadMoreObserver()
      }, queueIndex * options.motion.staggerStepMs)

      marketQueuedInsertTimeoutIds.push(timeoutId)
    })
  }

  return {
    marketEnterMotionTimeoutId,
    clearMarketQueuedInsertTimeouts,
    clearMarketEnterMotionTimeout,
    resolveMarketEnterMotionDurationMs,
    scheduleMarketRetainedReplayEnter,
    finalizeMarketEnter,
    scheduleMarketQueuedInsertions,
  }
}
