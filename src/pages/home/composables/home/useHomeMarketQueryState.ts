/**
 * Responsibility: manage market query state, search/tag coordination, and query
 * application scheduling for the home rail market experience.
 * Out of scope: remote-list fetching, result-window rendering, and page-shell
 * presentation mapping.
 */
import { computed, ref, type ComputedRef } from 'vue'
import type {
  HomeMarketKind as MarketKind,
  HomeMarketKindOption,
  HomeMarketTag,
} from '../../../../models/home-rail/homeRailHome.model'
import type { ResultLoadSource } from '../../../../services/home-rail/homeRailResultWindow.service'
import { createQueryApplyScheduler } from '../shared/queryApplyScheduler'
import { useHomeMarketSearchRuntime } from './useHomeMarketSearchRuntime'
import { useHomeMarketTagSelectionRuntime } from './useHomeMarketTagSelectionRuntime'

export type HomeMarketResultMotionSource = ResultLoadSource

const homeMarketKindOptions: HomeMarketKindOption[] = [
  { id: 'collections', label: '藏品' },
  { id: 'blindBoxes', label: '盲盒' },
]

const isHomeMarketTagVisibleForKind = (tag: HomeMarketTag, marketKind: MarketKind) => {
  return tag.id === 'all' || !tag.marketKinds?.length || tag.marketKinds.includes(marketKind)
}

const resolveHomeMarketTagsForKind = (tags: HomeMarketTag[], marketKind: MarketKind) => {
  return tags.filter((tag) => isHomeMarketTagVisibleForKind(tag, marketKind))
}

interface UseHomeMarketQueryStateOptions {
  marketTags: ComputedRef<HomeMarketTag[]>
  emitMarketSearchClick: () => void
  emitMarketTagSelect: (tagLabel: string, index: number) => void
  scheduleMarketMountWindowSync: () => void
  pageSize: number
}

export const useHomeMarketQueryState = ({
  marketTags: sourceMarketTags,
  emitMarketSearchClick,
  emitMarketTagSelect,
  scheduleMarketMountWindowSync,
  pageSize,
}: UseHomeMarketQueryStateOptions) => {
  const activeMarketKind = ref<MarketKind>('collections')
  const appliedMarketKind = ref<MarketKind>('collections')
  const marketKindOptions = computed(() => homeMarketKindOptions)
  const marketTags = computed(() =>
    resolveHomeMarketTagsForKind(sourceMarketTags.value, activeMarketKind.value)
  )
  const {
    searchDebounce,
    querySwitchThrottle,
    clearAll: clearMarketListQueryTimers,
  } = createQueryApplyScheduler()

  const marketListQuery = computed(() => ({
    marketKind: appliedMarketKind.value,
    categoryId: appliedMarketTag.value.id === 'all' ? undefined : appliedMarketTag.value.id,
    keyword: normalizedAppliedMarketKeyword.value || undefined,
  }))

  const marketListQuerySignature = computed(() => {
    const categoryId = marketListQuery.value.categoryId ?? ''
    const keyword = marketListQuery.value.keyword ?? ''
    return [marketListQuery.value.marketKind, categoryId, keyword].join('::')
  })

  const clearMarketListQueryDebounce = () => {
    searchDebounce.clear()
  }

  const applyMarketQuerySwitchImmediately = () => {
    appliedMarketKind.value = activeMarketKind.value
    appliedMarketTagId.value = activeMarketTag.value.id
  }

  const scheduleMarketQuerySwitchApply = () => {
    querySwitchThrottle.clear()
    applyMarketQuerySwitchImmediately()
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
    scheduleMarketMountWindowSync,
    searchDebounce,
  })
  const {
    activeMarketTag,
    activeMarketTagId,
    appliedMarketTag,
    appliedMarketTagId,
    handleMarketTagSelect,
    syncMarketTagSelection: syncVisibleMarketTagSelection,
  } = useHomeMarketTagSelectionRuntime({
    marketTags,
    emitMarketTagSelect,
    scheduleMarketQuerySwitchApply,
  })

  const syncMarketTagSelection = (tags = sourceMarketTags.value) => {
    syncVisibleMarketTagSelection(resolveHomeMarketTagsForKind(tags, activeMarketKind.value))
  }

  const handleMarketKindSelect = (marketKind: MarketKind) => {
    if (activeMarketKind.value === marketKind) {
      return
    }

    activeMarketKind.value = marketKind
    appliedMarketKind.value = marketKind
    activeMarketTagId.value = 'all'
    appliedMarketTagId.value = 'all'
    scheduleMarketQuerySwitchApply()
  }

  const resolveMarketListRequestBase = () => {
    return {
      marketKind: marketListQuery.value.marketKind,
      categoryId: marketListQuery.value.categoryId,
      keyword: marketListQuery.value.keyword,
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
    clearMarketListQueryTimers()
  }

  const disposeHomeMarketQueryState = () => {
    clearMarketListQueryTimers()
  }

  return {
    activeMarketKind,
    activeMarketTag,
    activeMarketTagId,
    appliedMarketKind,
    handleMarketKeywordClear,
    handleMarketKeywordInput,
    handleMarketKindSelect,
    handleMarketSearchClick,
    handleMarketSearchRevealAfterEnter,
    handleMarketSearchRevealAfterLeave,
    handleMarketSearchRevealBeforeEnter,
    handleMarketSearchRevealBeforeLeave,
    handleMarketSearchRevealEnter,
    handleMarketSearchRevealLeave,
    handleMarketTagSelect,
    hasActiveMarketSearch,
    isMarketSearchApplied,
    isMarketSearchVisible,
    marketKeyword,
    marketKindOptions,
    marketTags,
    marketListQuery,
    marketListQuerySignature,
    marketSearchRevealHeightPx,
    normalizedAppliedMarketKeyword,
    normalizedMarketKeyword,
    resolveMarketListQuerySnapshot,
    resolveMarketListRequestBase,
    resetHomeMarketQueryForInactive,
    clearHomeMarketSearchState,
    clearMarketListQueryDebounce,
    syncMarketTagSelection,
    disposeHomeMarketQueryState,
  }
}
