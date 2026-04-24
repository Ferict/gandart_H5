/**
 * Responsibility: assemble the home market result-window runtime from geometry, enter, overlay, load-more, and switch sub-runtimes.
 * Out of scope: parent panel orchestration, query-state ownership, and template-only presentation markup.
 */
import { computed, ref, watch, type ComputedRef, type Ref } from 'vue'
import type { HomeRailMarketCardListResult } from '../../../../services/home-rail/homeRailHomeContent.service'
import {
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
  type ResultWindowOverlayItem,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import { syncResultEntryPhaseMap } from '../../../../utils/syncResultEntryPhaseMap.util'
import {
  useHomeRailPaginationLoadingChain,
  type HomeRailPaginationAttemptResult,
} from '../shared/useHomeRailPaginationLoadingChain'
import {
  buildHomeMarketWindowDiff,
  isSameHomeMarketCollection,
  resolveNextHomeMarketVisibleCount,
} from './homeMarketResultWindowProjection'
import { useHomeMarketResultWindowEnterPhaseAssembly } from './useHomeMarketResultWindowEnterPhaseAssembly'
import { useHomeMarketResultWindowGeometryRuntime } from './useHomeMarketResultWindowGeometryRuntime'
import { useHomeMarketResultWindowInactiveResetRuntime } from './useHomeMarketResultWindowInactiveResetRuntime'
import { useHomeMarketResultWindowEnterRuntime } from './useHomeMarketResultWindowEnterRuntime'
import { useHomeMarketResultWindowLoadMoreRuntime } from './useHomeMarketResultWindowLoadMoreRuntime'
import { useHomeMarketResultWindowOverlayRuntime } from './useHomeMarketResultWindowOverlayRuntime'
import {
  useHomeMarketResultWindowSwitchGateway,
  type MarketResultSwitchOptions,
} from './useHomeMarketResultWindowSwitchGateway'

type HomeMarketResultMotionSource = ResultLoadSource
type MarketCardEntryPhase = CardQueuePhase

interface UseHomeMarketResultWindowLayoutOptions {
  columns: number
  fallbackCardWidth: number
  columnGap: number
  rowGap: number
  cardChromeHeight: number
  mountBufferTopRows: number
  mountBufferBottomRows: number
  initialVisibleCount: number
  loadMoreCount: number
}

interface UseHomeMarketResultWindowMotionOptions {
  resultSwitchDebounceMs: number
  enterDurationMs: number
  leaveDurationMs: number
  staggerStepMs: number
}

interface UseHomeMarketResultWindowOptions {
  isPanelActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  marketCollection: Ref<HomeMarketCard[]>
  marketListResolvedPage: Ref<number>
  isMarketListLoading: Ref<boolean>
  paginationQuerySignature: ComputedRef<string>
  loadMoreMarketListPage: () => Promise<HomeRailPaginationAttemptResult>
  clearMarketPaginationFeedback: () => void
  markMarketPaginationError: () => void
  markMarketPaginationEndline: () => void
  invalidateMarketPaginationRequest: () => void
  syncResolvedMarketListSnapshot: (list: HomeRailMarketCardListResult) => void
  syncCurrentHomeVisualImages: () => void
  syncMarketCardRevealStates: (items?: HomeMarketCard[]) => void
  applyMarketCardRevealDiff: (diff: ResultWindowDiff<HomeMarketCard>) => void
  clearMarketCardMotionTimeouts: (retainIds?: Set<string>) => void
  layout: UseHomeMarketResultWindowLayoutOptions
  motion: UseHomeMarketResultWindowMotionOptions
}

export const useHomeMarketResultWindow = ({
  isPanelActive,
  mountScrollMetrics,
  marketCollection,
  marketListResolvedPage,
  isMarketListLoading,
  paginationQuerySignature,
  loadMoreMarketListPage,
  clearMarketPaginationFeedback,
  markMarketPaginationError,
  markMarketPaginationEndline,
  invalidateMarketPaginationRequest,
  syncResolvedMarketListSnapshot,
  syncCurrentHomeVisualImages,
  syncMarketCardRevealStates,
  applyMarketCardRevealDiff,
  clearMarketCardMotionTimeouts,
  layout,
  motion,
}: UseHomeMarketResultWindowOptions) => {
  const displayedCollection = ref<HomeMarketCard[]>([])
  const mountedMarketItems = ref<HomeMarketCard[]>([])
  const mountedMarketItemIdSet = ref<Set<string>>(new Set())
  const marketPlaceholderCardIdSet = ref<Set<string>>(new Set())
  const marketRemovedOverlayItems = ref<ResultWindowOverlayItem<HomeMarketCard>[]>([])
  const marketCardEntryPhaseMap = ref<Record<string, MarketCardEntryPhase>>({})
  const marketResultsStageRef = ref<HTMLElement | null>(null)
  const marketResultsContentRef = ref<HTMLElement | null>(null)
  const marketLoadMoreSentinelRef = ref<HTMLElement | null>(null)
  const marketResultsStageLockedMinHeight = ref(0)
  const marketTopSpacerHeight = ref(0)
  const marketBottomSpacerHeight = ref(0)
  const marketVisibleCount = ref(layout.initialVisibleCount)
  const pendingCollection = ref<HomeMarketCard[]>([])
  const marketResultTotal = ref(0)
  const hasBootstrappedMarketResults = ref(false)
  const marketLeaveMotionTimeoutId = ref<ReturnType<typeof setTimeout> | null>(null)
  const marketTransitionPhase = ref<'idle' | 'leaving' | 'entering'>('idle')
  const isMarketLoadMoreRunning = ref(false)
  const marketPendingWindowDiff = ref<ResultWindowDiff<HomeMarketCard> | null>(null)
  const marketCurrentEnterAddedIdSet = ref<Set<string>>(new Set())
  const marketResultSwitchRunId = ref(0)
  const shouldReleaseMarketResultsStageHeightOnOverlayClear = ref(false)

  const isMarketTransitioning = computed(() => marketTransitionPhase.value !== 'idle')
  const hasMoreMarketItems = computed(
    () => displayedCollection.value.length < marketResultTotal.value
  )
  const hasMoreLoadedMarketItems = computed(() => {
    return displayedCollection.value.length < pendingCollection.value.length
  })
  const isMarketExhausted = computed(() => {
    return displayedCollection.value.length > 0 && !hasMoreMarketItems.value
  })
  const marketPaginationLoadChain = useHomeRailPaginationLoadingChain({
    resolveIsActive: () => isPanelActive.value,
    resolveQuerySignature: () => paginationQuerySignature.value,
    onError: markMarketPaginationError,
    onEndline: markMarketPaginationEndline,
    onReset: clearMarketPaginationFeedback,
    onAttemptTimeout: invalidateMarketPaginationRequest,
  })

  watch(
    () => isPanelActive.value,
    (isActive) => {
      if (!isActive) {
        marketPaginationLoadChain.cancelPaginationLoadChain()
      }
    }
  )

  watch(
    () => paginationQuerySignature.value,
    () => {
      marketPaginationLoadChain.resetPaginationLoadChain()
    }
  )

  const {
    marketResultsStageStyle,
    marketRemovedOverlayLayerStyle,
    syncMountedMarketWindow,
    clearMountedMarketWindow,
    clearMarketMountWindowRaf,
    clearMarketLoadMoreObserver,
    releaseMarketResultsStageHeightLock,
    lockMarketResultsStageHeightToSlotCount,
    scheduleMarketLoadMoreObserver,
    scheduleMarketMountWindowSync,
  } = useHomeMarketResultWindowGeometryRuntime({
    isPanelActive,
    mountScrollMetrics,
    isMarketListLoading,
    isMarketPaginationChainLoading: marketPaginationLoadChain.isLoading,
    marketCollection,
    displayedCollection,
    pendingCollection,
    mountedMarketItems,
    mountedMarketItemIdSet,
    marketPlaceholderCardIdSet,
    marketResultsStageLockedMinHeight,
    marketTopSpacerHeight,
    marketBottomSpacerHeight,
    marketResultsStageRef,
    marketResultsContentRef,
    hasMoreMarketItems,
    isMarketTransitioning,
    isMarketLoadMoreRunning,
    layout,
    syncCurrentHomeVisualImages,
    syncMarketCardRevealStates,
    triggerMarketLoadMore: () => appendVisibleMarketItems(),
  })

  const { clearMarketRemovedOverlayItems, syncMarketRemovedOverlayItems } =
    useHomeMarketResultWindowOverlayRuntime({
      marketRemovedOverlayItems,
      shouldReleaseMarketResultsStageHeightOnOverlayClear,
      leaveDurationMs: motion.leaveDurationMs,
      releaseMarketResultsStageHeightLock,
    })

  const clearMarketLeaveMotionTimeout = () => {
    if (!marketLeaveMotionTimeoutId.value) {
      return
    }

    clearTimeout(marketLeaveMotionTimeoutId.value)
    marketLeaveMotionTimeoutId.value = null
  }

  const hasFullMarketResultSwitchMotion = (
    source: HomeMarketResultMotionSource = marketResultMotionSource.value
  ) => {
    return Boolean(source)
  }

  const syncMarketCardEntryPhaseMap = (
    items: HomeMarketCard[] = displayedCollection.value,
    resolvePhase?: (
      item: HomeMarketCard,
      currentPhase: MarketCardEntryPhase
    ) => MarketCardEntryPhase
  ) => {
    marketCardEntryPhaseMap.value = syncResultEntryPhaseMap(
      items,
      marketCardEntryPhaseMap.value,
      resolvePhase
    )
  }

  let flushQueuedMarketSwitchDelegate = () => {}
  let startMarketEnterPhaseDelegate: (diff?: ResultWindowDiff<HomeMarketCard>) => void = (
    diff: ResultWindowDiff<HomeMarketCard> = marketPendingWindowDiff.value ??
      buildMarketWindowDiff(pendingCollection.value)
  ) => {
    void diff
  }

  const {
    marketEnterMotionTimeoutId,
    clearMarketQueuedInsertTimeouts,
    clearMarketEnterMotionTimeout,
    resolveMarketEnterMotionDurationMs,
    scheduleMarketRetainedReplayEnter,
    finalizeMarketEnter,
    scheduleMarketQueuedInsertions,
  } = useHomeMarketResultWindowEnterRuntime({
    displayedCollection,
    mountedMarketItems,
    mountedMarketItemIdSet,
    marketPlaceholderCardIdSet,
    marketCurrentEnterAddedIdSet,
    marketTransitionPhase,
    marketPendingWindowDiff,
    marketResultSwitchRunId,
    motion: {
      enterDurationMs: motion.enterDurationMs,
      staggerStepMs: motion.staggerStepMs,
    },
    syncMarketCardEntryPhaseMap,
    syncCurrentHomeVisualImages,
    syncMarketCardRevealStates,
    scheduleMarketLoadMoreObserver,
    releaseMarketResultsStageHeightLock,
    flushQueuedMarketSwitch: () => {
      flushQueuedMarketSwitchDelegate()
    },
  })

  const buildMarketWindowDiff = (
    nextCollection: HomeMarketCard[],
    visibleCount = marketVisibleCount.value
  ) => {
    return buildHomeMarketWindowDiff({
      displayedCollection: displayedCollection.value,
      nextCollection,
      visibleCount,
    })
  }

  const resolveNextMarketVisibleCount = (
    nextCollection: HomeMarketCard[],
    options?: MarketResultSwitchOptions
  ) => {
    return resolveNextHomeMarketVisibleCount({
      currentVisibleCount: marketVisibleCount.value,
      nextCollectionLength: nextCollection.length,
      initialVisibleCount: layout.initialVisibleCount,
      preserveVisibleCount: options?.preserveVisibleCount,
    })
  }

  const {
    marketResultMotionSource,
    marketResultSwitchTimeoutId,
    queuedMarketRequest,
    clearMarketResultSwitchTimeout,
    applyResolvedMarketListResult,
    replaceMarketCollectionImmediately,
    flushQueuedMarketSwitch,
    startMarketResultSwitch,
    queueMarketResultSwitch,
  } = useHomeMarketResultWindowSwitchGateway({
    isPanelActive,
    isMarketTransitioning,
    resultSwitchDebounceMs: motion.resultSwitchDebounceMs,
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
    syncResolvedMarketListSnapshot,
    resolveNextMarketVisibleCount,
    buildMarketWindowDiff,
    startMarketEnterPhase: (diff) => {
      startMarketEnterPhaseDelegate(diff)
    },
    clearMarketQueuedInsertTimeouts,
    clearMarketLeaveMotionTimeout,
    clearMarketEnterMotionTimeout,
    clearMarketLoadMoreObserver,
    clearMarketCardMotionTimeouts,
    clearMarketRemovedOverlayItems,
    releaseMarketResultsStageHeightLock,
    lockMarketResultsStageHeightToSlotCount,
    syncMountedMarketWindow,
    syncMarketCardEntryPhaseMap,
    applyMarketCardRevealDiff,
    syncCurrentHomeVisualImages,
    syncMarketCardRevealStates,
    scheduleMarketLoadMoreObserver,
    isSameMarketCollection: isSameHomeMarketCollection,
  })

  flushQueuedMarketSwitchDelegate = () => {
    flushQueuedMarketSwitch()
  }

  const { appendVisibleMarketItems } = useHomeMarketResultWindowLoadMoreRuntime({
    isPanelActive,
    hasMoreMarketItems,
    hasMoreLoadedMarketItems,
    isMarketTransitioning,
    isMarketLoadMoreRunning,
    pendingCollection,
    displayedCollection,
    marketCollection,
    marketResultTotal,
    marketResultMotionSource,
    marketVisibleCount,
    marketPlaceholderCardIdSet,
    marketPendingWindowDiff,
    marketCurrentEnterAddedIdSet,
    marketTransitionPhase,
    marketEnterMotionTimeoutId,
    marketResultSwitchRunId,
    mountedMarketItemIdSet,
    layout: {
      loadMoreCount: layout.loadMoreCount,
    },
    loadMoreMarketListPage,
    runMarketPaginationLoadChain: marketPaginationLoadChain.startPaginationLoadChain,
    isMarketPaginationChainLoading: marketPaginationLoadChain.isLoading,
    buildMarketWindowDiff,
    clearMarketQueuedInsertTimeouts,
    clearMarketEnterMotionTimeout,
    lockMarketResultsStageHeightToSlotCount,
    releaseMarketResultsStageHeightLock,
    syncMountedMarketWindow,
    syncMarketCardEntryPhaseMap,
    applyMarketCardRevealDiff,
    syncCurrentHomeVisualImages,
    syncMarketCardRevealStates: () => {
      syncMarketCardRevealStates(mountedMarketItems.value)
    },
    scheduleMarketQueuedInsertions,
    scheduleMarketLoadMoreObserver,
    hasFullMarketResultSwitchMotion: () => hasFullMarketResultSwitchMotion(),
    resolveMarketEnterMotionDurationMs,
  })

  const { startMarketEnterPhase } = useHomeMarketResultWindowEnterPhaseAssembly({
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
    buildMarketWindowDiff,
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
    hasFullMarketResultSwitchMotion,
    flushQueuedMarketSwitch,
    scheduleMarketRetainedReplayEnter,
    resolveMarketEnterMotionDurationMs,
    finalizeMarketEnter,
  })

  startMarketEnterPhaseDelegate = startMarketEnterPhase

  const { resetHomeMarketResultWindowForInactive, disposeHomeMarketResultWindow } =
    useHomeMarketResultWindowInactiveResetRuntime({
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

  return {
    displayedCollection,
    mountedMarketItems,
    mountedMarketItemIdSet,
    marketPlaceholderCardIdSet,
    marketRemovedOverlayItems,
    marketCardEntryPhaseMap,
    marketResultsStageRef,
    marketResultsContentRef,
    marketLoadMoreSentinelRef,
    marketResultsStageLockedMinHeight,
    marketTopSpacerHeight,
    marketBottomSpacerHeight,
    marketVisibleCount,
    pendingCollection,
    marketResultTotal,
    hasBootstrappedMarketResults,
    marketResultMotionSource,
    marketResultSwitchTimeoutId,
    marketLeaveMotionTimeoutId,
    marketEnterMotionTimeoutId,
    marketTransitionPhase,
    queuedMarketRequest,
    isMarketLoadMoreRunning,
    marketPendingWindowDiff,
    marketCurrentEnterAddedIdSet,
    marketResultSwitchRunId,
    isMarketTransitioning,
    hasMoreMarketItems,
    hasMoreLoadedMarketItems,
    isMarketExhausted,
    marketResultsStageStyle,
    marketRemovedOverlayLayerStyle,
    syncMountedMarketWindow,
    scheduleMarketMountWindowSync,
    scheduleMarketLoadMoreObserver,
    applyResolvedMarketListResult,
    appendVisibleMarketItems,
    replaceMarketCollectionImmediately,
    startMarketResultSwitch,
    queueMarketResultSwitch,
    resetHomeMarketResultWindowForInactive,
    disposeHomeMarketResultWindow,
    marketPaginationLoadPhase: marketPaginationLoadChain.phase,
    isMarketPaginationChainLoading: marketPaginationLoadChain.isLoading,
    hasMarketPaginationChainError: marketPaginationLoadChain.hasError,
    isMarketPaginationChainEndline: marketPaginationLoadChain.isEndline,
  }
}
