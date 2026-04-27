/**
 * Responsibility: manage profile asset query state, category/subcategory switching, search
 * debounce, and query-signature production for the profile rail.
 * Out of scope: remote-list loading, scene patch application, result-window timing, and
 * card visual reveal runtime.
 */
import { computed, ref, type ComputedRef } from 'vue'
import { useHorizontalScrollFade } from '../../../../composables/useHorizontalScrollFade'
import type {
  HomeRailProfileContent,
  ProfileAssetItem,
  ProfileCategoryKey,
} from '../../../../models/home-rail/homeRailProfile.model'
import { buildRailContentSignature } from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import type { Ref } from 'vue'
import { createQueryApplyScheduler } from '../shared/queryApplyScheduler'
import { PROFILE_ASSET_BATCH_STRATEGY } from '../shared/homeRailBatchStrategy'

interface UseProfileAssetQueryStateOptions {
  resolvedProfileCategories: ComputedRef<HomeRailProfileContent['categories']>
  currentCategoryAssets: ComputedRef<ProfileAssetItem[]>
  emitScrollToAssetsSection: () => void
  activeCategoryRef?: Ref<ProfileCategoryKey>
  activeSubCategoryRef?: Ref<string>
}

interface ClearProfileSearchStateOptions {
  collapse: boolean
}

const PROFILE_SEARCH_QUERY_DEBOUNCE_MS = 300

export const useProfileAssetQueryState = ({
  resolvedProfileCategories,
  currentCategoryAssets,
  emitScrollToAssetsSection,
  activeCategoryRef,
  activeSubCategoryRef,
}: UseProfileAssetQueryStateOptions) => {
  const activeCategory =
    activeCategoryRef ??
    ref<ProfileCategoryKey>(resolvedProfileCategories.value[0]?.id ?? 'collections')
  const activeSubCategory = activeSubCategoryRef ?? ref('')
  const profileKeyword = ref('')
  const appliedProfileKeyword = ref('')
  const isProfileSearchVisible = ref(false)
  const isProfileSearchApplied = computed(() => appliedProfileKeyword.value.length > 0)
  const appliedCategory = ref<ProfileCategoryKey>(activeCategory.value)
  const appliedSubCategory = ref(activeSubCategory.value.trim())
  const {
    isLeftFadeVisible: isProfileSubCategoryLeftFadeVisible,
    handleHorizontalScroll: handleProfileSubCategoryScroll,
  } = useHorizontalScrollFade()

  const { searchDebounce, querySwitchThrottle } = createQueryApplyScheduler()

  const normalizedProfileKeyword = computed(() => {
    return profileKeyword.value.trim().toLowerCase()
  })

  const normalizedAppliedProfileKeyword = computed(() => appliedProfileKeyword.value)

  const visibleProfileSubCategories = computed(() => {
    const activeCategoryConfig = resolvedProfileCategories.value.find(
      (item) => item.id === activeCategory.value
    )
    return activeCategoryConfig?.subCategories.map((item) => item.trim()).filter(Boolean) ?? []
  })

  const activeSubCategoryQueryValue = computed(() => {
    const normalizedValue = appliedSubCategory.value.trim()
    if (!normalizedValue || normalizedValue === '全部') {
      return undefined
    }

    return normalizedValue
  })

  const subCategoryFilteredAssets = computed(() => {
    if (!activeSubCategoryQueryValue.value) {
      return currentCategoryAssets.value
    }

    return currentCategoryAssets.value.filter(
      (item) => item.subCategory === activeSubCategoryQueryValue.value
    )
  })

  const hasActiveProfileSearch = computed(() => {
    return normalizedProfileKeyword.value.length > 0
  })

  const currentProfileAssetQuery = computed(() => {
    return {
      categoryId: appliedCategory.value,
      subCategory: activeSubCategoryQueryValue.value,
      keyword: normalizedAppliedProfileKeyword.value || undefined,
      page: 1,
      pageSize: PROFILE_ASSET_BATCH_STRATEGY.backendPageSize,
    }
  })

  const resolveProfileAssetQuerySnapshot = () => ({
    ...currentProfileAssetQuery.value,
  })

  const profileAssetQuerySignature = computed(() => {
    return buildRailContentSignature(resolveProfileAssetQuerySnapshot())
  })

  const clearProfileAssetReloadDebounce = () => {
    searchDebounce.clear()
  }

  const clearProfileQuerySwitchThrottle = () => {
    querySwitchThrottle.clear()
  }

  const applyProfileQuerySwitchImmediately = () => {
    appliedCategory.value = activeCategory.value
    appliedSubCategory.value = activeSubCategory.value.trim()
  }

  const scheduleProfileQuerySwitchApply = () => {
    querySwitchThrottle.clear()
    applyProfileQuerySwitchImmediately()
  }

  const syncProfileFilters = () => {
    const categories = resolvedProfileCategories.value

    if (!categories.some((item) => item.id === activeCategory.value)) {
      activeCategory.value = categories[0]?.id ?? 'collections'
    }

    const subCategories = visibleProfileSubCategories.value
    if (!subCategories.includes(activeSubCategory.value)) {
      activeSubCategory.value = subCategories[0] ?? ''
    }

    applyProfileQuerySwitchImmediately()
  }

  const canApplyProfileCategoryConfigLive = (nextContent: HomeRailProfileContent) => {
    const nextActiveCategory = nextContent.categories.find(
      (item) => item.id === activeCategory.value
    )
    if (!nextActiveCategory) {
      return false
    }

    const normalizedSubCategory = activeSubCategory.value.trim()
    if (!normalizedSubCategory) {
      return true
    }

    return nextActiveCategory.subCategories.includes(normalizedSubCategory)
  }

  const clearProfileSearchState = ({ collapse }: ClearProfileSearchStateOptions) => {
    clearProfileAssetReloadDebounce()

    profileKeyword.value = ''
    if (appliedProfileKeyword.value) {
      appliedProfileKeyword.value = ''
    }
    if (collapse) {
      isProfileSearchVisible.value = false
    }
  }

  const handleSearchAssets = () => {
    if (isProfileSearchVisible.value) {
      clearProfileSearchState({ collapse: true })
      return
    }

    isProfileSearchVisible.value = true
  }

  const handleProfileKeywordInput = (event: Event) => {
    const inputTarget = event.target as HTMLInputElement | null
    const detailValue = (event as Event & { detail?: { value?: string } }).detail?.value
    profileKeyword.value = (inputTarget?.value ?? detailValue ?? '').trimStart()
    searchDebounce.schedule(() => {
      appliedProfileKeyword.value = profileKeyword.value.trim().toLowerCase()
    }, PROFILE_SEARCH_QUERY_DEBOUNCE_MS)
  }

  const handleProfileKeywordClear = () => {
    clearProfileSearchState({ collapse: false })
  }

  const handleCategoryChange = (categoryId: ProfileCategoryKey) => {
    activeCategory.value = categoryId
    const nextSubCategoryOptions = visibleProfileSubCategories.value
    activeSubCategory.value = nextSubCategoryOptions[0] ?? ''
    scheduleProfileQuerySwitchApply()
  }

  const handleSubCategoryChange = (subCategory: string) => {
    activeSubCategory.value = subCategory.trim()
    scheduleProfileQuerySwitchApply()
  }

  const handleSummaryFocus = () => {
    activeCategory.value = 'collections'
    const collectionsCategory = resolvedProfileCategories.value.find(
      (item) => item.id === 'collections'
    )
    activeSubCategory.value = collectionsCategory?.subCategories[0] ?? ''
    scheduleProfileQuerySwitchApply()
    emitScrollToAssetsSection()
  }

  const resetProfileQueryForInactive = () => {
    clearProfileAssetReloadDebounce()
    clearProfileQuerySwitchThrottle()
  }

  const disposeProfileQueryState = () => {
    clearProfileAssetReloadDebounce()
    clearProfileQuerySwitchThrottle()
  }

  return {
    activeCategory,
    activeSubCategory,
    profileKeyword,
    isProfileSearchVisible,
    isProfileSearchApplied,
    isProfileSubCategoryLeftFadeVisible,
    visibleProfileSubCategories,
    activeSubCategoryQueryValue,
    subCategoryFilteredAssets,
    currentProfileAssetQuery,
    profileAssetQuerySignature,
    hasActiveProfileSearch,
    handleProfileSubCategoryScroll,
    resolveProfileAssetQuerySnapshot,
    syncProfileFilters,
    canApplyProfileCategoryConfigLive,
    clearProfileSearchState,
    handleSearchAssets,
    handleProfileKeywordInput,
    handleProfileKeywordClear,
    handleCategoryChange,
    handleSubCategoryChange,
    handleSummaryFocus,
    resetProfileQueryForInactive,
    disposeProfileQueryState,
  }
}
