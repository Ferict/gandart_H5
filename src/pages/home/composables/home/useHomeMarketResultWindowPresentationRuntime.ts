/**
 * Responsibility: own home market result-stage presentation derivations such as first-screen
 * states, footer mode, removed overlay placement, and card entry styling.
 * Out of scope: result-window timing, load-more flow, scene lifecycle, and non-market home
 * presentation derivations like banner and featured display state.
 */
import { computed, type ComputedRef, type CSSProperties, type Ref } from 'vue'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import type {
  CardQueuePhase,
  ResultLoadSource,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import {
  buildResultEntryClass,
  buildResultEntryDelayStyle,
  buildResultGridRemovedOverlayItemStyle,
} from '../../../../utils/resultWindowPresentation.util'

interface UseHomeMarketResultWindowPresentationRuntimeOptions {
  isMarketExhausted: ComputedRef<boolean>
  displayedCollection: Ref<HomeMarketCard[]>
  isMarketListLoading: Ref<boolean>
  marketListLoadingPhase: Ref<'idle' | 'first-screen' | 'pagination'>
  isMarketPaginationChainLoading: ComputedRef<boolean>
  hasResolvedRemoteMarketList: Ref<boolean>
  hasMarketFirstScreenError: Ref<boolean>
  hasMarketPaginationError: Ref<boolean>
  hasMoreMarketItems: ComputedRef<boolean>
  marketResultTotal: Ref<number>
  marketCardEntryPhaseMap: Ref<Record<string, CardQueuePhase>>
  marketPlaceholderCardIdSet: Ref<Set<string>>
  marketResultMotionSource: Ref<ResultLoadSource>
  marketCurrentEnterAddedIdSet: Ref<Set<string>>
  mountedMarketItems: Ref<HomeMarketCard[]>
  hasMarketImage: (item: HomeMarketCard) => boolean
  gridColumns: number
  staggerStepMs: number
}

export const useHomeMarketResultWindowPresentationRuntime = (
  options: UseHomeMarketResultWindowPresentationRuntimeOptions
) => {
  const resolveMarketRemovedOverlayItemStyle = (sourceIndex: number): CSSProperties => {
    return buildResultGridRemovedOverlayItemStyle(sourceIndex, options.gridColumns)
  }

  const resolveMarketRemovedOverlayRevealPhase = (item: HomeMarketCard) => {
    return options.hasMarketImage(item) ? 'steady' : 'fallback'
  }

  const shouldShowHomeBottomEndline = computed(() => {
    return (
      options.isMarketExhausted.value &&
      options.displayedCollection.value.length > 0 &&
      !options.hasMarketPaginationError.value
    )
  })

  const shouldShowHomeMarketFirstScreenLoading = computed(() => {
    return (
      options.displayedCollection.value.length <= 0 &&
      options.isMarketListLoading.value &&
      options.marketListLoadingPhase.value === 'first-screen'
    )
  })

  const shouldShowHomeMarketFirstScreenError = computed(() => {
    return (
      options.displayedCollection.value.length <= 0 &&
      !options.isMarketListLoading.value &&
      options.hasMarketFirstScreenError.value
    )
  })

  const shouldShowHomeMarketFirstScreenEmpty = computed(() => {
    return (
      options.displayedCollection.value.length <= 0 &&
      options.hasResolvedRemoteMarketList.value &&
      !options.isMarketListLoading.value &&
      !options.hasMarketFirstScreenError.value &&
      options.marketResultTotal.value <= 0
    )
  })

  const shouldShowHomeBottomPaginationError = computed(() => {
    return (
      options.displayedCollection.value.length > 0 &&
      options.hasMarketPaginationError.value &&
      options.hasMoreMarketItems.value &&
      !options.isMarketListLoading.value &&
      !options.isMarketPaginationChainLoading.value
    )
  })

  const shouldRenderHomeBottomFooter = computed(() => {
    return (
      options.displayedCollection.value.length > 0 &&
      (options.isMarketPaginationChainLoading.value ||
        shouldShowHomeBottomPaginationError.value ||
        shouldShowHomeBottomEndline.value)
    )
  })

  const homeBottomFooterMode = computed<'loading' | 'error' | 'endline'>(() => {
    if (options.isMarketPaginationChainLoading.value) {
      return 'loading'
    }

    if (shouldShowHomeBottomPaginationError.value) {
      return 'error'
    }

    if (shouldShowHomeBottomEndline.value) {
      return 'endline'
    }

    return 'loading'
  })

  const resolveMarketCardEntryPhase = (itemId: string): CardQueuePhase => {
    return options.marketCardEntryPhaseMap.value[itemId] ?? 'steady'
  }

  const isMarketCardPlaceholder = (itemId: string) => {
    return options.marketPlaceholderCardIdSet.value.has(itemId)
  }

  const hasFullMarketResultSwitchMotion = (
    source: ResultLoadSource = options.marketResultMotionSource.value
  ) => {
    return Boolean(source)
  }

  const resolveMarketCardEntryClass = (itemId: string) => {
    const entryPhase = resolveMarketCardEntryPhase(itemId)
    return buildResultEntryClass({
      entryPhase,
      motionSource: options.marketResultMotionSource.value,
      isLightMotion: !hasFullMarketResultSwitchMotion(),
      includeLoadMoreMotion: true,
    })
  }

  const resolveMarketCardStaggerDelayMs = (itemId: string, index?: number) => {
    const entryPhase = resolveMarketCardEntryPhase(itemId)
    if (
      (entryPhase !== 'entering' && entryPhase !== 'replay-entering') ||
      !hasFullMarketResultSwitchMotion()
    ) {
      return 0
    }

    if (options.marketCurrentEnterAddedIdSet.value.has(itemId)) {
      return 0
    }

    const entryIndex =
      typeof index === 'number'
        ? index
        : options.mountedMarketItems.value.findIndex((item) => item.id === itemId)
    return entryIndex >= 0 ? entryIndex * options.staggerStepMs : 0
  }

  const resolveMarketCardEntryStyle = (itemId: string, index: number): CSSProperties => {
    const staggerDelayMs = resolveMarketCardStaggerDelayMs(itemId, index)
    return buildResultEntryDelayStyle('--home-market-card-entry-delay', staggerDelayMs)
  }

  return {
    resolveMarketRemovedOverlayItemStyle,
    resolveMarketRemovedOverlayRevealPhase,
    shouldShowHomeMarketFirstScreenLoading,
    shouldShowHomeMarketFirstScreenError,
    shouldShowHomeMarketFirstScreenEmpty,
    shouldRenderHomeBottomFooter,
    homeBottomFooterMode,
    isMarketCardPlaceholder,
    resolveMarketCardEntryClass,
    resolveMarketCardEntryStyle,
  }
}
