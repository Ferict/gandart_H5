/**
 * Responsibility: manage market query state, search/sort/tag coordination, and query
 * application scheduling for the home rail market experience.
 * Out of scope: remote-list fetching, result-window rendering, and page-shell
 * presentation mapping.
 */
import { computed, ref, type ComputedRef } from 'vue'
import { useHorizontalScrollFade } from '../../../../composables/useHorizontalScrollFade'
import type {
  HomeMarketSortDirection as MarketSortDirection,
  HomeMarketSortField as MarketSortField,
  HomeMarketTag,
  HomeRailHomeContent,
} from '../../../../models/home-rail/homeRailHome.model'
import type { ResultLoadSource } from '../../../../services/home-rail/homeRailResultWindow.service'
import { createQueryApplyScheduler } from '../shared/queryApplyScheduler'
import { useHomeMarketSortPopoverRuntime } from './useHomeMarketSortPopoverRuntime'
import { useHomeMarketSearchRuntime } from './useHomeMarketSearchRuntime'
import { useHomeMarketTagSelectionRuntime } from './useHomeMarketTagSelectionRuntime'

export type HomeMarketResultMotionSource = ResultLoadSource

interface UseHomeMarketQueryStateOptions {
  marketContent: ComputedRef<HomeRailHomeContent['market']>
  marketTags: ComputedRef<HomeMarketTag[]>
  resolveHasBootstrappedMarketResults: () => boolean
  emitMarketSearchClick: () => void
  emitMarketSortClick: () => void
  emitMarketTagSelect: (tagLabel: string, index: number) => void
  scheduleMarketMountWindowSync: () => void
  defaultSortLabel: string
  pageSize: number
}

export const useHomeMarketQueryState = ({
  marketContent,
  marketTags,
  resolveHasBootstrappedMarketResults,
  emitMarketSearchClick,
  emitMarketSortClick,
  emitMarketTagSelect,
  scheduleMarketMountWindowSync,
  defaultSortLabel,
  pageSize,
}: UseHomeMarketQueryStateOptions) => {
  const {
    isLeftFadeVisible: isMarketTagLeftFadeVisible,
    handleHorizontalScroll: handleMarketTagScroll,
  } = useHorizontalScrollFade()

  const marketSortLayerRef = ref<HTMLElement | null>(null)
  const marketSortField = ref<MarketSortField>(marketContent.value.sortConfig.defaultField)
  const marketSortDirection = ref<MarketSortDirection>(
    marketContent.value.sortConfig.defaultDirection
  )
  const isMarketDefaultSortSelected = ref(true)
  const appliedMarketSortField = ref<MarketSortField>(marketContent.value.sortConfig.defaultField)
  const appliedMarketSortDirection = ref<MarketSortDirection>(
    marketContent.value.sortConfig.defaultDirection
  )
  const isAppliedMarketDefaultSortSelected = ref(true)
  const {
    searchDebounce,
    querySwitchThrottle,
    clearAll: clearMarketListQueryTimers,
  } = createQueryApplyScheduler()

  const activeMarketSort = computed(() => {
    if (isMarketDefaultSortSelected.value) {
      return {
        field: marketContent.value.sortConfig.defaultField,
        direction: marketContent.value.sortConfig.defaultDirection,
      }
    }

    return {
      field: marketSortField.value,
      direction: marketSortDirection.value,
    }
  })

  const appliedMarketSort = computed(() => {
    if (isAppliedMarketDefaultSortSelected.value) {
      return {
        field: marketContent.value.sortConfig.defaultField,
        direction: marketContent.value.sortConfig.defaultDirection,
      }
    }

    return {
      field: appliedMarketSortField.value,
      direction: appliedMarketSortDirection.value,
    }
  })

  const marketListQuery = computed(() => ({
    categoryId: appliedMarketTag.value.id === 'all' ? undefined : appliedMarketTag.value.id,
    keyword: normalizedAppliedMarketKeyword.value || undefined,
    sort: {
      field: appliedMarketSort.value.field,
      direction: appliedMarketSort.value.direction,
    },
  }))

  const marketListQuerySignature = computed(() => {
    const categoryId = marketListQuery.value.categoryId ?? ''
    const keyword = marketListQuery.value.keyword ?? ''
    return [
      categoryId,
      keyword,
      marketListQuery.value.sort.field,
      marketListQuery.value.sort.direction,
    ].join('::')
  })

  const clearMarketListQueryDebounce = () => {
    searchDebounce.clear()
  }

  const applyMarketQuerySwitchImmediately = () => {
    appliedMarketTagId.value = activeMarketTag.value.id
    isAppliedMarketDefaultSortSelected.value = isMarketDefaultSortSelected.value
    if (isMarketDefaultSortSelected.value) {
      appliedMarketSortField.value = marketContent.value.sortConfig.defaultField
      appliedMarketSortDirection.value = marketContent.value.sortConfig.defaultDirection
      return
    }

    appliedMarketSortField.value = marketSortField.value
    appliedMarketSortDirection.value = marketSortDirection.value
  }

  const scheduleMarketQuerySwitchApply = () => {
    querySwitchThrottle.clear()
    applyMarketQuerySwitchImmediately()
  }

  const {
    activeMarketSortOption,
    bindMarketSortPopoverViewportListeners,
    handleMarketSortDismiss,
    handleMarketSortOptionSelect,
    handleMarketSortTriggerClick,
    isMarketSortOptionActive,
    isMarketSortPopoverOpen,
    marketSortMenuOptions,
    marketSortPopoverPlacement,
    marketSortTriggerLabel,
    resolveMarketSortOptionAriaLabel,
    syncMarketSortConfig: syncMarketSortConfigBase,
    unbindMarketSortPopoverViewportListeners,
  } = useHomeMarketSortPopoverRuntime({
    marketContent,
    defaultSortLabel,
    emitMarketSortClick,
    scheduleMarketQuerySwitchApply,
    marketSortLayerRef,
    marketSortField,
    marketSortDirection,
    isMarketDefaultSortSelected,
    isAppliedMarketDefaultSortSelected,
    appliedMarketSortField,
    appliedMarketSortDirection,
  })

  const syncMarketSortConfig = (
    sortConfig = marketContent.value.sortConfig,
    options: { preserveCurrent?: boolean } = {}
  ) => {
    syncMarketSortConfigBase(sortConfig, {
      preserveCurrent: options.preserveCurrent ?? resolveHasBootstrappedMarketResults(),
    })
  }
  const {
    clearHomeMarketSearchState,
    handleMarketKeywordClear,
    handleMarketKeywordInput,
    handleMarketSearchClick,
    handleMarketSearchRevealAfterEnter,
    handleMarketSearchRevealAfterLeave,
    handleMarketSearchRevealBeforeEnter,
    handleMarketSearchRevealBeforeLeave,
    handleMarketSearchRevealEnter,
    handleMarketSearchRevealLeave,
    hasActiveMarketSearch,
    isMarketSearchApplied,
    isMarketSearchVisible,
    marketKeyword,
    marketSearchRevealHeightPx,
    normalizedAppliedMarketKeyword,
    normalizedMarketKeyword,
  } = useHomeMarketSearchRuntime({
    emitMarketSearchClick,
    dismissSortPopover: handleMarketSortDismiss,
    scheduleMarketMountWindowSync,
    searchDebounce,
  })
  const {
    activeMarketTag,
    activeMarketTagId,
    appliedMarketTag,
    appliedMarketTagId,
    handleMarketTagSelect,
    syncMarketTagSelection,
  } = useHomeMarketTagSelectionRuntime({
    marketTags,
    emitMarketTagSelect,
    dismissSortPopover: handleMarketSortDismiss,
    scheduleMarketQuerySwitchApply,
  })

  const resolveMarketListRequestBase = () => {
    return {
      categoryId: marketListQuery.value.categoryId,
      keyword: marketListQuery.value.keyword,
      sort: marketListQuery.value.sort,
    }
  }

  const resolveMarketListQuerySnapshot = () => {
    return {
      ...resolveMarketListRequestBase(),
      page: 1,
      pageSize,
    }
  }

  const resetHomeMarketQueryForInactive = () => {
    isMarketSortPopoverOpen.value = false
    clearMarketListQueryTimers()
  }

  const disposeHomeMarketQueryState = () => {
    unbindMarketSortPopoverViewportListeners()
    clearMarketListQueryTimers()
  }

  return {
    activeMarketSort,
    activeMarketSortOption,
    activeMarketTag,
    activeMarketTagId,
    handleMarketKeywordClear,
    handleMarketKeywordInput,
    handleMarketSearchClick,
    handleMarketSearchRevealAfterEnter,
    handleMarketSearchRevealAfterLeave,
    handleMarketSearchRevealBeforeEnter,
    handleMarketSearchRevealBeforeLeave,
    handleMarketSearchRevealEnter,
    handleMarketSearchRevealLeave,
    handleMarketSortDismiss,
    handleMarketSortOptionSelect,
    handleMarketSortTriggerClick,
    handleMarketTagSelect,
    hasActiveMarketSearch,
    isLeftFadeVisible: isMarketTagLeftFadeVisible,
    handleHorizontalScroll: handleMarketTagScroll,
    isMarketDefaultSortSelected,
    isMarketSearchApplied,
    isMarketSearchVisible,
    isMarketSortOptionActive,
    isMarketSortPopoverOpen,
    marketKeyword,
    marketListQuery,
    marketListQuerySignature,
    marketSearchRevealHeightPx,
    marketSortDirection,
    marketSortField,
    marketSortLayerRef,
    marketSortMenuOptions,
    marketSortPopoverPlacement,
    marketSortTriggerLabel,
    normalizedAppliedMarketKeyword,
    normalizedMarketKeyword,
    resolveMarketListQuerySnapshot,
    resolveMarketListRequestBase,
    resolveMarketSortOptionAriaLabel,
    resetHomeMarketQueryForInactive,
    clearHomeMarketSearchState,
    clearMarketListQueryDebounce,
    syncMarketSortConfig,
    syncMarketTagSelection,
    bindMarketSortPopoverViewportListeners,
    unbindMarketSortPopoverViewportListeners,
    disposeHomeMarketQueryState,
  }
}
