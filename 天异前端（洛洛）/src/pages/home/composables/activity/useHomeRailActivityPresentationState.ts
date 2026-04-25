/**
 * Responsibility: derive presentation-facing activity notice list state, load-state fallback, and
 * footer mode selection for the parent activity panel.
 * Out of scope: copy text authorship, navigation behavior, and page-level watcher orchestration.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'
import {
  resolveActivityNoticeListLoadState,
  type ActivityNoticeListLoadState,
} from './activityNoticeLoadState.helper'

interface UseHomeRailActivityPresentationStateOptions {
  hasResolvedInitialActivityContent: Ref<boolean>
  filteredNotices: ComputedRef<ActivityNotice[]>
  displayedNotices: Ref<ActivityNotice[]>
  pendingNoticeList: Ref<ActivityNotice[]>
  isRemoteNoticeListLoading: Ref<boolean>
  isFirstScreenRemoteNoticeListLoading: Ref<boolean>
  isNoticePaginationLoading: Ref<boolean>
  hasFirstScreenRemoteNoticeListError: Ref<boolean>
  hasNoticePaginationError: Ref<boolean>
  shouldShowActivityBottomEndlineSignal: ComputedRef<boolean>
}

export const useHomeRailActivityPresentationState = (
  options: UseHomeRailActivityPresentationStateOptions
) => {
  const hasRenderableActivityNoticeList = computed(() => options.displayedNotices.value.length > 0)

  const activityNoticeListLoadState = computed<ActivityNoticeListLoadState>(() => {
    return resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: options.hasResolvedInitialActivityContent.value,
      hasRenderableNotices: hasRenderableActivityNoticeList.value,
      hasFirstScreenLoading:
        options.isFirstScreenRemoteNoticeListLoading.value ||
        options.isRemoteNoticeListLoading.value,
      hasFirstScreenError: options.hasFirstScreenRemoteNoticeListError.value,
      hasPaginationLoading: options.isNoticePaginationLoading.value,
      hasPaginationError: options.hasNoticePaginationError.value,
      hasPendingSwitch: options.pendingNoticeList.value.length > 0,
      isExhausted: options.shouldShowActivityBottomEndlineSignal.value,
    })
  })

  const shouldShowNoticeFirstScreenErrorState = computed(() => {
    return activityNoticeListLoadState.value === 'first-screen-error'
  })

  const shouldShowNoticeFirstScreenLoadingState = computed(() => {
    return activityNoticeListLoadState.value === 'first-screen-loading'
  })

  const shouldShowNoticeEmptyState = computed(() => {
    return (
      activityNoticeListLoadState.value === 'first-screen-empty' &&
      options.filteredNotices.value.length === 0
    )
  })

  const shouldShowActivityBottomLoading = computed(() => {
    return (
      options.displayedNotices.value.length > 0 &&
      activityNoticeListLoadState.value === 'pagination-loading'
    )
  })

  const shouldShowActivityBottomError = computed(() => {
    return (
      options.displayedNotices.value.length > 0 &&
      activityNoticeListLoadState.value === 'pagination-error'
    )
  })

  const shouldShowActivityBottomEndline = computed(() => {
    return (
      options.displayedNotices.value.length > 0 &&
      activityNoticeListLoadState.value === 'exhausted' &&
      !shouldShowActivityBottomLoading.value &&
      !shouldShowActivityBottomError.value
    )
  })

  const shouldRenderActivityBottomFooter = computed(() => {
    return (
      options.displayedNotices.value.length > 0 &&
      (shouldShowActivityBottomLoading.value ||
        shouldShowActivityBottomError.value ||
        shouldShowActivityBottomEndline.value)
    )
  })

  const activityBottomFooterMode = computed<'loading' | 'error' | 'endline'>(() => {
    if (shouldShowActivityBottomLoading.value) {
      return 'loading'
    }

    if (shouldShowActivityBottomError.value) {
      return 'error'
    }

    if (shouldShowActivityBottomEndline.value) {
      return 'endline'
    }

    return 'loading'
  })

  return {
    hasRenderableActivityNoticeList,
    activityNoticeListLoadState,
    shouldShowNoticeFirstScreenErrorState,
    shouldShowNoticeFirstScreenLoadingState,
    shouldShowNoticeEmptyState,
    shouldShowActivityBottomLoading,
    shouldShowActivityBottomError,
    shouldShowActivityBottomEndline,
    shouldRenderActivityBottomFooter,
    activityBottomFooterMode,
  }
}
