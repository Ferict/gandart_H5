/**
 * Responsibility: encapsulate home market result-window switch entry, queued snapshot storage,
 * debounce gating, and immediate bypass rules without touching enter/replay internals.
 * Out of scope: overlay lifecycle, retained replay, queued insertions, and enter timing.
 */
import { ref, type ComputedRef, type Ref } from 'vue'
import type { HomeRailMarketCardListResult } from '../../../../services/home-rail/homeRailHomeContent.service'
import type {
  CardQueuePhase,
  ResultLoadSource,
  ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'

type HomeMarketResultMotionSource = ResultLoadSource

export interface MarketResultSwitchOptions {
  immediate?: boolean
  preserveVisibleCount?: boolean
  forceReplay?: boolean
  motionSource?: HomeMarketResultMotionSource
}

interface UseHomeMarketResultWindowSwitchGatewayOptions {
  isPanelActive: ComputedRef<boolean>
  isMarketTransitioning: ComputedRef<boolean>
  resultSwitchDebounceMs: number
  hasBootstrappedMarketResults: Ref<boolean>
  marketCollection: Ref<HomeMarketCard[]>
  marketResultTotal: Ref<number>
  marketListResolvedPage: Ref<number>
  marketVisibleCount: Ref<number>
  displayedCollection: Ref<HomeMarketCard[]>
  pendingCollection: Ref<HomeMarketCard[]>
  mountedMarketItems: Ref<HomeMarketCard[]>
  marketPlaceholderCardIdSet: Ref<Set<string>>
  marketPendingWindowDiff: Ref<ResultWindowDiff<HomeMarketCard> | null>
  marketTransitionPhase: Ref<'idle' | 'leaving' | 'entering'>
  marketResultSwitchRunId: Ref<number>
  syncResolvedMarketListSnapshot: (list: HomeRailMarketCardListResult) => void
  resolveNextMarketVisibleCount: (
    nextCollection: HomeMarketCard[],
    options?: { preserveVisibleCount?: boolean }
  ) => number
  buildMarketWindowDiff: (
    nextCollection: HomeMarketCard[],
    visibleCount?: number
  ) => ResultWindowDiff<HomeMarketCard>
  startMarketEnterPhase: (diff: ResultWindowDiff<HomeMarketCard>) => void
  clearMarketQueuedInsertTimeouts: () => void
  clearMarketLeaveMotionTimeout: () => void
  clearMarketEnterMotionTimeout: () => void
  clearMarketLoadMoreObserver: () => void
  clearMarketCardMotionTimeouts: (retainIds?: Set<string>) => void
  clearMarketRemovedOverlayItems: () => void
  releaseMarketResultsStageHeightLock: () => void
  lockMarketResultsStageHeightToSlotCount: (slotCount: number) => void
  syncMountedMarketWindow: (items?: HomeMarketCard[]) => void
  syncMarketCardEntryPhaseMap: (
    items?: HomeMarketCard[],
    resolvePhase?: (item: HomeMarketCard, currentPhase: CardQueuePhase) => CardQueuePhase
  ) => void
  applyMarketCardRevealDiff: (diff: ResultWindowDiff<HomeMarketCard>) => void
  syncCurrentHomeVisualImages: () => void
  syncMarketCardRevealStates: (items?: HomeMarketCard[]) => void
  scheduleMarketLoadMoreObserver: () => Promise<void> | void
  isSameMarketCollection: (left: HomeMarketCard[], right: HomeMarketCard[]) => boolean
}

export const useHomeMarketResultWindowSwitchGateway = (
  options: UseHomeMarketResultWindowSwitchGatewayOptions
) => {
  const marketResultMotionSource = ref<ResultLoadSource>('initial-enter')
  const marketResultSwitchTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)
  const queuedMarketRequest = ref<{
    collection: HomeMarketCard[]
    options?: {
      preserveVisibleCount?: boolean
      forceReplay?: boolean
      motionSource?: ResultLoadSource
    }
  } | null>(null)

  const clearMarketResultSwitchTimeout = () => {
    if (!marketResultSwitchTimeoutId.value) {
      return
    }

    clearTimeout(marketResultSwitchTimeoutId.value)
    marketResultSwitchTimeoutId.value = null
  }

  const replaceMarketCollectionImmediately = (
    nextCollection: HomeMarketCard[],
    replaceOptions: { preserveVisibleCount?: boolean } = {}
  ) => {
    options.marketResultSwitchRunId.value += 1
    const nextVisibleCount = options.resolveNextMarketVisibleCount(nextCollection, replaceOptions)
    const diff = options.buildMarketWindowDiff(nextCollection, nextVisibleCount)
    options.marketVisibleCount.value = nextVisibleCount
    options.pendingCollection.value = nextCollection
    options.marketPendingWindowDiff.value = null
    queuedMarketRequest.value = null
    options.clearMarketQueuedInsertTimeouts()
    clearMarketResultSwitchTimeout()
    options.clearMarketLeaveMotionTimeout()
    options.clearMarketEnterMotionTimeout()
    options.clearMarketCardMotionTimeouts(new Set(diff.nextWindow.map((item) => item.id)))
    options.marketTransitionPhase.value = 'idle'
    options.clearMarketRemovedOverlayItems()
    options.releaseMarketResultsStageHeightLock()
    options.displayedCollection.value = diff.nextWindow.slice()
    options.syncMountedMarketWindow(diff.nextWindow)
    options.marketPlaceholderCardIdSet.value = new Set()
    options.syncMarketCardEntryPhaseMap(options.displayedCollection.value, () => 'steady')
    options.applyMarketCardRevealDiff(diff)
    options.hasBootstrappedMarketResults.value = true
    options.syncCurrentHomeVisualImages()
    options.syncMarketCardRevealStates(options.mountedMarketItems.value)
    void options.scheduleMarketLoadMoreObserver()
  }

  const startMarketResultSwitch = async (
    nextCollection: HomeMarketCard[],
    switchOptions?: MarketResultSwitchOptions
  ) => {
    options.marketResultSwitchRunId.value += 1
    queuedMarketRequest.value = null
    options.clearMarketQueuedInsertTimeouts()
    options.clearMarketLeaveMotionTimeout()
    options.clearMarketEnterMotionTimeout()
    options.clearMarketLoadMoreObserver()

    const nextVisibleCount = options.resolveNextMarketVisibleCount(nextCollection, switchOptions)
    const diff = options.buildMarketWindowDiff(nextCollection, nextVisibleCount)

    options.marketVisibleCount.value = nextVisibleCount
    options.pendingCollection.value = nextCollection
    options.marketPendingWindowDiff.value = diff

    if (!options.isPanelActive.value) {
      options.marketTransitionPhase.value = 'idle'
      return
    }

    if (!options.displayedCollection.value.length) {
      options.startMarketEnterPhase(diff)
      return
    }

    if (diff.removed.length || diff.added.length) {
      options.lockMarketResultsStageHeightToSlotCount(
        Math.max(options.displayedCollection.value.length, diff.nextWindow.length)
      )
    }

    options.startMarketEnterPhase(diff)
  }

  const flushQueuedMarketSwitch = () => {
    void options.scheduleMarketLoadMoreObserver()
    options.clearMarketQueuedInsertTimeouts()
    const queuedRequest = queuedMarketRequest.value
    queuedMarketRequest.value = null
    if (
      queuedRequest &&
      (queuedRequest.options?.forceReplay ||
        !options.isSameMarketCollection(queuedRequest.collection, options.pendingCollection.value))
    ) {
      void startMarketResultSwitch(queuedRequest.collection, queuedRequest.options)
    }
  }

  const queueMarketResultSwitch = (
    nextCollection: HomeMarketCard[],
    immediate = false,
    queueOptions?: MarketResultSwitchOptions
  ) => {
    const nextSnapshot = nextCollection.slice()
    const normalizedOptions = queueOptions
      ? {
          preserveVisibleCount: queueOptions.preserveVisibleCount,
          forceReplay: queueOptions.forceReplay,
          motionSource: queueOptions.motionSource,
        }
      : undefined

    if (
      !queueOptions?.forceReplay &&
      options.isSameMarketCollection(nextSnapshot, options.pendingCollection.value) &&
      !queuedMarketRequest.value
    ) {
      return
    }

    if (!queueOptions?.forceReplay && marketResultMotionSource.value === 'manual-query-switch') {
      queuedMarketRequest.value = null
      replaceMarketCollectionImmediately(nextSnapshot, {
        preserveVisibleCount: queueOptions?.preserveVisibleCount ?? false,
      })
      return
    }

    if (options.isMarketTransitioning.value) {
      clearMarketResultSwitchTimeout()
      queuedMarketRequest.value = {
        collection: nextSnapshot,
        options: normalizedOptions,
      }
      return
    }

    clearMarketResultSwitchTimeout()
    if (immediate) {
      queuedMarketRequest.value = null
      void startMarketResultSwitch(nextSnapshot, queueOptions)
      return
    }

    queuedMarketRequest.value = {
      collection: nextSnapshot,
      options: normalizedOptions,
    }
    marketResultSwitchTimeoutId.value = setTimeout(() => {
      const queuedRequest = queuedMarketRequest.value
      queuedMarketRequest.value = null
      marketResultSwitchTimeoutId.value = null
      if (!queuedRequest) {
        return
      }

      void startMarketResultSwitch(queuedRequest.collection, queuedRequest.options)
    }, options.resultSwitchDebounceMs)
  }

  const applyResolvedMarketListResult = (
    list: HomeRailMarketCardListResult,
    applyOptions: MarketResultSwitchOptions = {}
  ) => {
    const resolvedMotionSource =
      applyOptions.motionSource ??
      (options.hasBootstrappedMarketResults.value ? 'manual-query-switch' : 'initial-enter')
    marketResultMotionSource.value = resolvedMotionSource
    options.marketCollection.value = list.items
    options.marketResultTotal.value = list.total
    options.marketListResolvedPage.value = list.page
    options.syncResolvedMarketListSnapshot(list)
    if (!options.hasBootstrappedMarketResults.value) {
      options.hasBootstrappedMarketResults.value = true
    }

    queueMarketResultSwitch(list.items, applyOptions.immediate ?? true, {
      preserveVisibleCount: applyOptions.preserveVisibleCount ?? false,
      forceReplay: applyOptions.forceReplay ?? resolvedMotionSource === 'manual-refresh',
      motionSource: resolvedMotionSource,
    })
  }

  return {
    marketResultMotionSource,
    marketResultSwitchTimeoutId,
    queuedMarketRequest,
    clearMarketResultSwitchTimeout,
    applyResolvedMarketListResult,
    replaceMarketCollectionImmediately,
    flushQueuedMarketSwitch,
    startMarketResultSwitch,
    queueMarketResultSwitch,
  }
}
