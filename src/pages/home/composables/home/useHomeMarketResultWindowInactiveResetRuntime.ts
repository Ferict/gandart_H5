/**
 * Responsibility: own inactive reset and disposal cleanup for the home market
 * result-window runtime without touching render/replay decision logic.
 * Out of scope: switch gateway decisions, enter-phase assembly, and geometry math.
 */
import type { Ref } from 'vue'
import type {
  CardQueuePhase,
  ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'

type MarketCardEntryPhase = CardQueuePhase

interface UseHomeMarketResultWindowInactiveResetRuntimeOptions {
  displayedCollection: Ref<HomeMarketCard[]>
  queuedMarketRequest: Ref<{
    collection: HomeMarketCard[]
    options?: {
      preserveVisibleCount?: boolean
      forceReplay?: boolean
      motionSource?: string
    }
  } | null>
  marketPlaceholderCardIdSet: Ref<Set<string>>
  marketPendingWindowDiff: Ref<ResultWindowDiff<HomeMarketCard> | null>
  marketCurrentEnterAddedIdSet: Ref<Set<string>>
  marketTransitionPhase: Ref<'idle' | 'leaving' | 'entering'>
  isMarketLoadMoreRunning: Ref<boolean>
  clearMarketMountWindowRaf: () => void
  clearMountedMarketWindow: () => void
  clearMarketLeaveMotionTimeout: () => void
  clearMarketEnterMotionTimeout: () => void
  clearMarketQueuedInsertTimeouts: () => void
  clearMarketLoadMoreObserver: () => void
  clearMarketResultSwitchTimeout: () => void
  clearMarketRemovedOverlayItems: () => void
  clearMarketCardMotionTimeouts: (retainIds?: Set<string>) => void
  releaseMarketResultsStageHeightLock: () => void
  syncMarketCardEntryPhaseMap: (
    items?: HomeMarketCard[],
    resolvePhase?: (
      item: HomeMarketCard,
      currentPhase: MarketCardEntryPhase
    ) => MarketCardEntryPhase
  ) => void
}

export const useHomeMarketResultWindowInactiveResetRuntime = (
  options: UseHomeMarketResultWindowInactiveResetRuntimeOptions
) => {
  const resetHomeMarketResultWindowForInactive = () => {
    options.clearMarketMountWindowRaf()
    options.clearMountedMarketWindow()
    options.clearMarketLeaveMotionTimeout()
    options.clearMarketEnterMotionTimeout()
    options.clearMarketQueuedInsertTimeouts()
    options.clearMarketLoadMoreObserver()
    options.clearMarketResultSwitchTimeout()
    options.clearMarketRemovedOverlayItems()
    options.queuedMarketRequest.value = null
    options.clearMarketCardMotionTimeouts()
    options.marketPendingWindowDiff.value = null
    options.marketCurrentEnterAddedIdSet.value = new Set()
    options.marketPlaceholderCardIdSet.value = new Set()
    options.marketTransitionPhase.value = 'idle'
    options.isMarketLoadMoreRunning.value = false
    options.releaseMarketResultsStageHeightLock()
    options.syncMarketCardEntryPhaseMap(options.displayedCollection.value, () => 'steady')
  }

  const disposeHomeMarketResultWindow = () => {
    resetHomeMarketResultWindowForInactive()
    options.clearMarketMountWindowRaf()
  }

  return {
    resetHomeMarketResultWindowForInactive,
    disposeHomeMarketResultWindow,
  }
}
