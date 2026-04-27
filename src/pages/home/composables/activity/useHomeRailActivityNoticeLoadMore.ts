/**
 * Responsibility: observe activity notice scroll geometry and request real remote pagination.
 * Out of scope: query creation, first-screen reload, and notice result-window diff animation.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type {
  ActivityNotice,
  ActivityNoticeListResult,
} from '../../../../models/home-rail/homeRailActivity.model'
import { HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG } from '../shared/useHomeRailPaginationLoadingChain'
import type { HomeRailPaginationAttemptResult } from '../shared/useHomeRailPaginationLoadingChain'
import { shouldPrefetchGridListByRemainingRows } from '../home/homeMarketPrefetch.util'
import { hasRevealBufferItems, resolveNextRevealCount } from '../shared/homeRailBatchStrategy'

interface UseHomeRailActivityNoticeLoadMoreOptions {
  isActive: ComputedRef<boolean>
  displayedNotices: Ref<ActivityNotice[]>
  filteredNotices: ComputedRef<ActivityNotice[]>
  remoteFilteredNoticeList: Ref<ActivityNoticeListResult | null>
  resolvedNoticeTotal: ComputedRef<number>
  noticeVisibleCount: Ref<number>
  revealStepCount: number
  isRemoteNoticeListLoading: Ref<boolean>
  isNoticePaginationLoading: Ref<boolean>
  resolveDisplayedNoticeVisibleEndRow: () => number | null
  loadMoreRemoteActivityNoticeListPage: (options?: {
    manual?: boolean
  }) => Promise<HomeRailPaginationAttemptResult>
  applyResolvedActivityNoticeList: (
    nextListResult: Pick<ActivityNoticeListResult, 'list' | 'total'>,
    applyOptions?: { replay?: boolean; motionSource?: 'load-more' }
  ) => void
}

export const useHomeRailActivityNoticeLoadMore = (
  options: UseHomeRailActivityNoticeLoadMoreOptions
) => {
  let loadMoreObserverRafId: ReturnType<typeof requestAnimationFrame> | null = null
  const isAppendingActivityNotices = { value: false }

  const hasMoreLoadedActivityNotices = computed(() => {
    return hasRevealBufferItems(
      options.noticeVisibleCount.value,
      options.filteredNotices.value.length
    )
  })

  const hasMoreActivityNotices = computed(() => {
    return options.displayedNotices.value.length < options.resolvedNoticeTotal.value
  })

  const clearActivityNoticeLoadMoreObserver = () => {
    if (loadMoreObserverRafId === null) {
      return
    }

    if (typeof cancelAnimationFrame === 'function') {
      cancelAnimationFrame(loadMoreObserverRafId)
    }
    loadMoreObserverRafId = null
  }

  const revealLoadedActivityNoticeBatch = () => {
    const nextVisibleCount = resolveNextRevealCount(
      options.noticeVisibleCount.value,
      options.filteredNotices.value.length,
      options.revealStepCount
    )
    if (nextVisibleCount <= options.noticeVisibleCount.value) {
      return false
    }

    options.noticeVisibleCount.value = nextVisibleCount
    options.applyResolvedActivityNoticeList(
      {
        list: options.filteredNotices.value.slice(0, nextVisibleCount),
        total: options.resolvedNoticeTotal.value,
      },
      {
        motionSource: 'load-more',
      }
    )
    return true
  }

  const appendActivityNotices = async (appendOptions: { manual?: boolean } = {}) => {
    if (
      isAppendingActivityNotices.value ||
      !options.isActive.value ||
      options.isRemoteNoticeListLoading.value ||
      options.isNoticePaginationLoading.value ||
      !hasMoreActivityNotices.value
    ) {
      return {
        outcome: 'stale' as const,
      }
    }

    isAppendingActivityNotices.value = true
    try {
      if (hasMoreLoadedActivityNotices.value) {
        return {
          outcome: revealLoadedActivityNoticeBatch()
            ? ('appended' as const)
            : ('no-progress' as const),
        }
      }

      const result = await options.loadMoreRemoteActivityNoticeListPage(appendOptions)
      const remoteList = options.remoteFilteredNoticeList.value
      if (result.outcome === 'appended' && remoteList) {
        options.noticeVisibleCount.value = resolveNextRevealCount(
          options.noticeVisibleCount.value,
          remoteList.list.length,
          options.revealStepCount
        )
        options.applyResolvedActivityNoticeList(
          {
            list: remoteList.list.slice(0, options.noticeVisibleCount.value),
            total: remoteList.total,
          },
          {
            motionSource: 'load-more',
          }
        )
      }

      return result
    } finally {
      isAppendingActivityNotices.value = false
    }
  }

  const scheduleActivityNoticeLoadMoreObserver = () => {
    if (!options.isActive.value || loadMoreObserverRafId !== null) {
      return
    }

    if (typeof requestAnimationFrame !== 'function') {
      void appendActivityNotices()
      return
    }

    loadMoreObserverRafId = requestAnimationFrame(() => {
      loadMoreObserverRafId = null
      if (!options.isActive.value || !hasMoreActivityNotices.value) {
        return
      }

      const visibleEndRow = options.resolveDisplayedNoticeVisibleEndRow()
      if (visibleEndRow === null) {
        return
      }

      const shouldPrefetch = shouldPrefetchGridListByRemainingRows({
        itemCount: options.displayedNotices.value.length,
        loadedItemCount: options.filteredNotices.value.length,
        columns: 1,
        visibleEndRow,
        remainingRowsThreshold:
          HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG.triggerRemainingRowsThreshold,
      })

      if (shouldPrefetch) {
        void appendActivityNotices()
      }
    })
  }

  const handleActivityBottomRetry = () => appendActivityNotices({ manual: true })

  return {
    hasMoreActivityNotices,
    appendActivityNotices,
    scheduleActivityNoticeLoadMoreObserver,
    clearActivityNoticeLoadMoreObserver,
    handleActivityBottomRetry,
  }
}
