/**
 * Responsibility: host the activity rail base view state and pure derivations, including empty
 * copy, fallback decisions, filtered notices, and mount placeholder refs.
 * Out of scope: notice queries, remote refresh, result windows, and reveal orchestration.
 */
import { computed, ref, type Ref } from 'vue'
import type {
  ActivityNotice,
  ActivityNoticeListResult,
} from '../../../../models/home-rail/homeRailActivity.model'
import { ACTIVITY_NOTICE_BATCH_STRATEGY } from '../shared/homeRailBatchStrategy'

interface UseHomeRailActivityViewStateOptions {
  allNoticeTag: string
  activeTag: Ref<string>
  noticeKeyword: Ref<string>
  normalizedAppliedNoticeKeyword: Ref<string>
  hasResolvedInitialActivityContent: Ref<boolean>
  hasResolvedRemoteNoticeList: Ref<boolean>
  remoteFilteredNoticeList: Ref<ActivityNoticeListResult | null>
  sceneFilteredNotices: Ref<ActivityNotice[]>
}

export const useHomeRailActivityViewState = (options: UseHomeRailActivityViewStateOptions) => {
  const noticeEmptyStateTitle = computed(() => {
    if (
      options.normalizedAppliedNoticeKeyword.value ||
      options.activeTag.value !== options.allNoticeTag
    ) {
      return '没有找到匹配公告'
    }
    return '当前暂无公告'
  })

  const noticeEmptyStateDescription = computed(() => {
    const activeConditions: string[] = []
    if (options.normalizedAppliedNoticeKeyword.value) {
      activeConditions.push(`关键词“${options.noticeKeyword.value.trim()}”`)
    }
    if (options.activeTag.value !== options.allNoticeTag) {
      activeConditions.push(`分类“${options.activeTag.value}”`)
    }
    if (activeConditions.length) {
      return `${activeConditions.join('、')}下暂时无可查看的公告`
    }
    return '稍后再来看看新的平台动态'
  })

  const isRemoteNoticeListActive = computed(() => {
    return (
      options.hasResolvedInitialActivityContent.value && options.hasResolvedRemoteNoticeList.value
    )
  })

  const shouldFallbackToSceneNotices = computed(() => {
    if (!isRemoteNoticeListActive.value) {
      return true
    }
    const remoteList = options.remoteFilteredNoticeList.value?.list ?? []
    if (remoteList.length > 0) {
      return false
    }
    return options.sceneFilteredNotices.value.length > 0
  })

  const filteredNotices = computed(() => {
    if (shouldFallbackToSceneNotices.value) {
      return options.sceneFilteredNotices.value
    }
    return options.remoteFilteredNoticeList.value?.list ?? []
  })

  const resolvedNoticeTotal = computed(() => {
    if (shouldFallbackToSceneNotices.value) {
      return options.sceneFilteredNotices.value.length
    }
    return options.remoteFilteredNoticeList.value?.total ?? filteredNotices.value.length
  })

  const noticeVisibleCount = ref(ACTIVITY_NOTICE_BATCH_STRATEGY.initialRevealCount)
  const visibleNotices = computed(() => {
    return filteredNotices.value.slice(0, noticeVisibleCount.value)
  })
  const hasMoreVisibleNotices = computed(() => {
    return noticeVisibleCount.value < filteredNotices.value.length
  })
  const isNoticeRevealExhausted = computed(() => {
    return visibleNotices.value.length > 0 && !hasMoreVisibleNotices.value
  })
  const noticePlaceholderIdSetRef = ref<Set<string>>(new Set())
  const mountedNoticesRef = ref<ActivityNotice[]>([])

  return {
    noticeEmptyStateTitle,
    noticeEmptyStateDescription,
    isRemoteNoticeListActive,
    shouldFallbackToSceneNotices,
    filteredNotices,
    resolvedNoticeTotal,
    noticeVisibleCount,
    visibleNotices,
    hasMoreVisibleNotices,
    isNoticeRevealExhausted,
    noticePlaceholderIdSetRef,
    mountedNoticesRef,
  }
}
