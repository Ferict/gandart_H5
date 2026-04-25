/**
 * Responsibility: coordinate profile rail load-more, mount-window prefetch, pagination
 * observer, and retry flow for the asset list.
 * Out of scope: query-state authoring, remote-list fetching, result-window switching,
 * page-level watcher orchestration, and template rendering.
 */
import { computed, nextTick, watch, type ComputedRef, type Ref } from 'vue'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ResolveHomeRailProfileAssetListInput } from '../../../../services/home-rail/homeRailProfileContent.service'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import {
  isResultMountWindowingSuspended,
  resolveResultMountGeometry,
  resolveResultMountStageVisibleIntersection,
} from '../../../../services/home-rail/homeRailResultMountWindow.service'
import { resolveResultWindowGeometry } from '../../../../services/home-rail/homeRailResultWindow.service'
import { shouldPrefetchGridListByRemainingRows } from '../home/homeMarketPrefetch.util'
import {
  useHomeRailPaginationLoadingChain,
  type HomeRailPaginationAttemptContext,
  type HomeRailPaginationAttemptResult,
} from '../shared/useHomeRailPaginationLoadingChain'
import type { ProfileAssetResultMotionSource } from './useProfileAssetResultWindow'

interface UseHomeRailProfileLoadMoreOptions {
  isActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  profileAssetResultsStageRef: Ref<HTMLElement | null>
  displayedAssets: Ref<ProfileAssetItem[]>
  visibleAssets: ComputedRef<ProfileAssetItem[]>
  resolvedProfileAssetSource: ComputedRef<ProfileAssetItem[]>
  resolvedProfileAssetTotal: ComputedRef<number>
  isRemoteProfileAssetsLoading: Ref<boolean>
  isProfileAssetLoadMoreRunning: Ref<boolean>
  profileAssetVisibleCount: Ref<number>
  initialVisibleCount: number
  loadMoreCount: number
  gridColumns: number
  fallbackCardWidth: number
  gridColumnGapPx: number
  gridRowGapPx: number
  cardCopyHeightPx: number
  loadMoreRemainingRowsThreshold: number
  profileAssetQuerySignature: ComputedRef<string>
  resolveProfileAssetQuerySnapshot: () => ResolveHomeRailProfileAssetListInput
  loadMoreRemoteProfileAssetListPage: (
    query: ResolveHomeRailProfileAssetListInput
  ) => Promise<HomeRailPaginationAttemptResult>
  clearProfileAssetPaginationFeedback: () => void
  markProfileAssetPaginationError: () => void
  markProfileAssetPaginationEndline: () => void
  invalidateProfileAssetPaginationRequest: () => void
  reloadProfileAssetListAndApply: (options?: {
    force?: boolean
    replay?: boolean
    motionSource?: ProfileAssetResultMotionSource
  }) => Promise<unknown>
}

export const useHomeRailProfileLoadMore = (options: UseHomeRailProfileLoadMoreOptions) => {
  let profileAssetLoadMoreCheckRafId: number | null = null
  const profileAssetPaginationLoadChain = useHomeRailPaginationLoadingChain({
    resolveIsActive: () => options.isActive.value,
    resolveQuerySignature: () => options.profileAssetQuerySignature.value,
    onError: options.markProfileAssetPaginationError,
    onEndline: options.markProfileAssetPaginationEndline,
    onReset: options.clearProfileAssetPaginationFeedback,
    onAttemptTimeout: options.invalidateProfileAssetPaginationRequest,
  })

  watch(
    () => options.isActive.value,
    (isActive) => {
      if (!isActive) {
        profileAssetPaginationLoadChain.cancelPaginationLoadChain()
      }
    }
  )

  watch(
    () => options.profileAssetQuerySignature.value,
    () => {
      profileAssetPaginationLoadChain.resetPaginationLoadChain()
    }
  )

  const hasMoreLoadedProfileAssets = computed(() => {
    return options.visibleAssets.value.length < options.resolvedProfileAssetSource.value.length
  })

  const hasMoreProfileAssets = computed(() => {
    return options.visibleAssets.value.length < options.resolvedProfileAssetTotal.value
  })

  const resolveProfileAssetVisibleEndRow = () => {
    const stageElement = options.profileAssetResultsStageRef.value
    const scrollMetrics = options.mountScrollMetrics.value
    if (
      !stageElement ||
      !scrollMetrics?.isReady ||
      !Number.isFinite(scrollMetrics.viewportHeight) ||
      !Number.isFinite(scrollMetrics.viewportTop) ||
      scrollMetrics.viewportHeight <= 0 ||
      isResultMountWindowingSuspended(scrollMetrics)
    ) {
      return null
    }

    const intersection = resolveResultMountStageVisibleIntersection(stageElement, scrollMetrics)
    if (!intersection || intersection.visibleHeightWithinStage <= 0) {
      return null
    }

    const geometry = resolveResultMountGeometry({
      itemCount: options.displayedAssets.value.length,
      columns: options.gridColumns,
      rowHeight: resolveResultWindowGeometry({
        layout: 'grid',
        slotCount: 1,
        columns: options.gridColumns,
        stageWidth: Math.ceil(stageElement.getBoundingClientRect().width),
        fallbackCardWidth: options.fallbackCardWidth,
        columnGap: options.gridColumnGapPx,
        rowGap: options.gridRowGapPx,
        cardChromeHeight: options.cardCopyHeightPx,
      }).rowHeight,
      rowGap: options.gridRowGapPx,
      visibleTopWithinStage: intersection.visibleTopWithinStage,
      visibleHeightWithinStage: intersection.visibleHeightWithinStage,
      bufferTopRows: 0,
      bufferBottomRows: 0,
    })

    if (geometry.rowCount <= 0 || geometry.visibleEndRow < 0) {
      return null
    }

    return geometry.visibleEndRow
  }

  const shouldPrefetchProfileAssetsByLogicalRemainingRows = () => {
    if (!hasMoreProfileAssets.value) {
      return false
    }

    const visibleEndRow = resolveProfileAssetVisibleEndRow()
    if (visibleEndRow === null) {
      return false
    }

    return shouldPrefetchGridListByRemainingRows({
      itemCount: options.visibleAssets.value.length,
      loadedItemCount: options.resolvedProfileAssetSource.value.length,
      columns: options.gridColumns,
      visibleEndRow,
      remainingRowsThreshold: options.loadMoreRemainingRowsThreshold,
    })
  }

  const appendVisibleProfileAssetsOnce = async (): Promise<HomeRailPaginationAttemptResult> => {
    options.isProfileAssetLoadMoreRunning.value = true
    try {
      if (!hasMoreLoadedProfileAssets.value && hasMoreProfileAssets.value) {
        const loadMoreResult = await options.loadMoreRemoteProfileAssetListPage(
          options.resolveProfileAssetQuerySnapshot()
        )
        if (!hasMoreLoadedProfileAssets.value && loadMoreResult.outcome !== 'appended') {
          return loadMoreResult
        }
      }

      const nextVisibleCount = Math.min(
        options.resolvedProfileAssetSource.value.length,
        options.visibleAssets.value.length + options.loadMoreCount
      )
      if (nextVisibleCount <= options.profileAssetVisibleCount.value) {
        return {
          outcome: 'no-progress',
          totalReached:
            options.visibleAssets.value.length >= options.resolvedProfileAssetTotal.value,
        }
      }

      options.profileAssetVisibleCount.value = nextVisibleCount
      await nextTick()
      return {
        outcome: 'appended',
        totalReached: nextVisibleCount >= options.resolvedProfileAssetTotal.value,
      }
    } finally {
      options.isProfileAssetLoadMoreRunning.value = false
    }
  }

  const appendVisibleProfileAssets = async (params: { manual?: boolean } = {}) => {
    if (
      !options.isActive.value ||
      options.isProfileAssetLoadMoreRunning.value ||
      options.isRemoteProfileAssetsLoading.value ||
      profileAssetPaginationLoadChain.isLoading.value ||
      !hasMoreProfileAssets.value
    ) {
      return
    }

    await profileAssetPaginationLoadChain.startPaginationLoadChain(
      (_context: HomeRailPaginationAttemptContext) => appendVisibleProfileAssetsOnce(),
      params
    )
  }

  const clearProfileLoadMoreObserver = () => {
    if (profileAssetLoadMoreCheckRafId === null) {
      return
    }

    cancelAnimationFrame(profileAssetLoadMoreCheckRafId)
    profileAssetLoadMoreCheckRafId = null
  }

  const scheduleProfileLoadMoreObserver = () => {
    if (profileAssetLoadMoreCheckRafId !== null) {
      return
    }

    profileAssetLoadMoreCheckRafId = requestAnimationFrame(() => {
      profileAssetLoadMoreCheckRafId = null
      if (
        !options.isActive.value ||
        !hasMoreProfileAssets.value ||
        options.isRemoteProfileAssetsLoading.value ||
        profileAssetPaginationLoadChain.isLoading.value ||
        options.isProfileAssetLoadMoreRunning.value ||
        options.displayedAssets.value.length <= 0
      ) {
        return
      }

      if (!shouldPrefetchProfileAssetsByLogicalRemainingRows()) {
        return
      }

      void appendVisibleProfileAssets()
    })
  }

  const resetProfileAssetVisibleCount = () => {
    options.profileAssetVisibleCount.value = options.initialVisibleCount
  }

  const handleProfileAssetFirstScreenRetry = () => {
    resetProfileAssetVisibleCount()
    void options.reloadProfileAssetListAndApply({
      force: true,
      motionSource: 'manual-refresh',
    })
  }

  const handleProfileAssetLoadMoreRetry = () => {
    void appendVisibleProfileAssets({ manual: true })
  }

  return {
    hasMoreLoadedProfileAssets,
    hasMoreProfileAssets,
    clearProfileLoadMoreObserver,
    scheduleProfileLoadMoreObserver,
    resetProfileAssetVisibleCount,
    handleProfileAssetFirstScreenRetry,
    handleProfileAssetLoadMoreRetry,
    profileAssetPaginationLoadPhase: profileAssetPaginationLoadChain.phase,
    isProfileAssetPaginationChainLoading: profileAssetPaginationLoadChain.isLoading,
    hasProfileAssetPaginationChainError: profileAssetPaginationLoadChain.hasError,
    isProfileAssetPaginationChainEndline: profileAssetPaginationLoadChain.isEndline,
  }
}
