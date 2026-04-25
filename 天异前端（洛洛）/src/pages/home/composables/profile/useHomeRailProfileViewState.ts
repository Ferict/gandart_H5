/**
 * Responsibility: host the profile rail base view-state shell, including category selection,
 * visible-asset slicing, and category indicator style projection.
 * Out of scope: query behavior, refresh orchestration, result-window timing, and page effects.
 */
import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type {
  ProfileCategory,
  ProfileAssetItem,
} from '../../../../models/home-rail/homeRailProfile.model'

interface UseHomeRailProfileViewStateOptions {
  initialVisibleCount: number
  activeCategory: Ref<string>
  resolvedProfileCategories: ComputedRef<ProfileCategory[]>
  filteredProfileAssets: ComputedRef<ProfileAssetItem[]>
  hasResolvedRemoteProfileAssets: Ref<boolean>
  remoteProfileAssets: Ref<ProfileAssetItem[]>
  remoteProfileAssetTotal: Ref<number>
}

export const useHomeRailProfileViewState = (options: UseHomeRailProfileViewStateOptions) => {
  const mountedProfileAssetsRef = ref<ProfileAssetItem[]>([])
  const profileAssetPlaceholderIdSetRef = ref<Set<string>>(new Set())
  const profileAssetVisibleCount = ref(options.initialVisibleCount)
  const isProfileAssetLoadMoreRunning = ref(false)

  const resolvedProfileAssetSource = computed(() => {
    if (!options.hasResolvedRemoteProfileAssets.value) {
      return options.filteredProfileAssets.value
    }

    return options.remoteProfileAssets.value
  })

  const visibleAssets = computed(() => {
    return resolvedProfileAssetSource.value.slice(0, profileAssetVisibleCount.value)
  })

  const profileCategoryIndicatorIndex = computed(() => {
    const resolvedIndex = options.resolvedProfileCategories.value.findIndex(
      (category) => category.id === options.activeCategory.value
    )

    return resolvedIndex >= 0 ? resolvedIndex : 0
  })

  const profileCategoryCount = computed(() =>
    Math.max(options.resolvedProfileCategories.value.length, 1)
  )

  const profileCategoryTrackStyle = computed(() => ({
    '--profile-category-count': String(profileCategoryCount.value),
  }))

  const profileCategoryIndicatorStyle = computed(() => ({
    width: `${100 / profileCategoryCount.value}%`,
    transform: `translateX(${profileCategoryIndicatorIndex.value * 100}%)`,
  }))

  const resolvedProfileAssetTotal = computed(() => {
    if (!options.hasResolvedRemoteProfileAssets.value) {
      return options.filteredProfileAssets.value.length
    }

    return options.remoteProfileAssetTotal.value
  })

  return {
    mountedProfileAssetsRef,
    profileAssetPlaceholderIdSetRef,
    profileAssetVisibleCount,
    isProfileAssetLoadMoreRunning,
    resolvedProfileAssetSource,
    visibleAssets,
    profileCategoryIndicatorIndex,
    profileCategoryCount,
    profileCategoryTrackStyle,
    profileCategoryIndicatorStyle,
    resolvedProfileAssetTotal,
  }
}
