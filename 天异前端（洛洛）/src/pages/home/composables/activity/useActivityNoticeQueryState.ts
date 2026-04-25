/**
 * Responsibility: manage activity notice query state, keyword/date/tag switching, debounce,
 * and query-signature production for the activity rail.
 * Out of scope: remote-list loading, result-window timing, notice visual reveal, and page-
 * level presentation orchestration.
 */
import { computed, ref } from 'vue'
import { buildRailContentSignature } from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import type {
  ActivityDateFilterRange,
  ActivityNotice,
  HomeRailActivityContent,
} from '../../../../models/home-rail/homeRailActivity.model'
import {
  formatActivityDateFilterLabel,
  isActivityDateKeyInRange,
  resolveActivityDateKeyFromPublishedAt,
} from '../../../../utils/activityDateFilter.util'
import type { ActivityNoticeQuerySnapshot } from './useActivityNoticeRemoteListState'
import { createQueryApplyScheduler } from '../shared/queryApplyScheduler'

interface UseActivityNoticeQueryStateOptions {
  content: { value: HomeRailActivityContent }
  activeDateFilterRange: { value: ActivityDateFilterRange }
}

interface ClearNoticeSearchStateOptions {
  collapse: boolean
}

const NOTICE_DEFAULT_PAGE_SIZE_FLOOR = 60
const NOTICE_SEARCH_QUERY_DEBOUNCE_MS = 300
export const ALL_ACTIVITY_NOTICE_TAG = '全部'

export const useActivityNoticeQueryState = ({
  content,
  activeDateFilterRange,
}: UseActivityNoticeQueryStateOptions) => {
  const activeTag = ref(ALL_ACTIVITY_NOTICE_TAG)
  const appliedTag = ref(ALL_ACTIVITY_NOTICE_TAG)
  const noticeKeyword = ref('')
  const appliedNoticeKeyword = ref('')
  const isNoticeSearchVisible = ref(false)
  const isNoticeSearchApplied = computed(() => appliedNoticeKeyword.value.length > 0)
  const { searchDebounce, querySwitchThrottle } = createQueryApplyScheduler()

  const noticeTags = computed(() => {
    const sourceTags = content.value.notices.tags
    if (sourceTags.includes(ALL_ACTIVITY_NOTICE_TAG)) {
      return sourceTags
    }
    return [ALL_ACTIVITY_NOTICE_TAG, ...sourceTags]
  })

  const activeDateFilterLabel = computed(() => {
    return formatActivityDateFilterLabel(activeDateFilterRange.value)
  })

  const normalizedNoticeKeyword = computed(() => noticeKeyword.value.trim().toLowerCase())

  const normalizedAppliedNoticeKeyword = computed(() => appliedNoticeKeyword.value)

  const hasActiveNoticeSearch = computed(() => normalizedNoticeKeyword.value.length > 0)

  const sceneFilteredNotices = computed<ActivityNotice[]>(() => {
    const sourceList = content.value.notices.list
    const currentTag = appliedTag.value
    let filteredList =
      !currentTag || currentTag === ALL_ACTIVITY_NOTICE_TAG
        ? sourceList
        : sourceList.filter((notice) => notice.category === currentTag)

    if (activeDateFilterRange.value) {
      filteredList = filteredList.filter((notice) => {
        const noticeDateKey = resolveActivityDateKeyFromPublishedAt(notice.publishedAt)
        if (!noticeDateKey) {
          return false
        }

        return isActivityDateKeyInRange(noticeDateKey, activeDateFilterRange.value)
      })
    }

    if (normalizedAppliedNoticeKeyword.value) {
      filteredList = filteredList.filter((notice) => {
        const searchableText = `${notice.title} ${notice.category}`.toLowerCase()
        return searchableText.includes(normalizedAppliedNoticeKeyword.value)
      })
    }

    return filteredList
  })

  const syncActiveTag = () => {
    const tags = noticeTags.value
    if (!tags.length) {
      activeTag.value = ALL_ACTIVITY_NOTICE_TAG
      appliedTag.value = ALL_ACTIVITY_NOTICE_TAG
      return
    }

    if (activeTag.value === ALL_ACTIVITY_NOTICE_TAG) {
      appliedTag.value = ALL_ACTIVITY_NOTICE_TAG
      return
    }

    if (!tags.includes(activeTag.value)) {
      activeTag.value = tags[0]
    }
    if (!tags.includes(appliedTag.value)) {
      appliedTag.value = activeTag.value
    }
  }

  const resolveActivityNoticeRemotePageSize = () => {
    return Math.max(content.value.notices.list.length, NOTICE_DEFAULT_PAGE_SIZE_FLOOR)
  }

  const resolveActivityNoticeQuerySnapshot = (): ActivityNoticeQuerySnapshot => ({
    tag: appliedTag.value === ALL_ACTIVITY_NOTICE_TAG ? undefined : appliedTag.value,
    keyword: normalizedAppliedNoticeKeyword.value || undefined,
    dateRange: activeDateFilterRange.value,
    page: 1,
    pageSize: resolveActivityNoticeRemotePageSize(),
  })

  const noticeListQuerySignature = computed(() => {
    return buildRailContentSignature(resolveActivityNoticeQuerySnapshot())
  })

  const clearNoticeSearchDebounce = () => {
    searchDebounce.clear()
  }

  const clearNoticeQuerySwitchThrottle = () => {
    querySwitchThrottle.clear()
  }

  const scheduleApplyNoticeTag = () => {
    querySwitchThrottle.clear()
    appliedTag.value = activeTag.value || ALL_ACTIVITY_NOTICE_TAG
  }

  const clearNoticeSearchState = ({ collapse }: ClearNoticeSearchStateOptions) => {
    clearNoticeSearchDebounce()

    noticeKeyword.value = ''
    if (appliedNoticeKeyword.value) {
      appliedNoticeKeyword.value = ''
    }
    if (collapse) {
      isNoticeSearchVisible.value = false
    }
  }

  const handleNoticeSearchToggle = () => {
    const nextVisible = !isNoticeSearchVisible.value
    if (!nextVisible) {
      clearNoticeSearchState({ collapse: true })
      return
    }
    isNoticeSearchVisible.value = true
  }

  const handleNoticeKeywordInput = (event: Event) => {
    const detailValue = (event as Event & { detail?: { value?: string } }).detail?.value
    const targetValue = (event.target as HTMLInputElement | null)?.value
    const value = detailValue ?? targetValue ?? ''
    noticeKeyword.value = value
    searchDebounce.schedule(() => {
      appliedNoticeKeyword.value = value.trim().toLowerCase()
    }, NOTICE_SEARCH_QUERY_DEBOUNCE_MS)
  }

  const handleNoticeKeywordClear = () => {
    clearNoticeSearchState({ collapse: false })
  }

  const handleTagSelect = (tag: string) => {
    if (activeTag.value === tag) {
      return
    }
    activeTag.value = tag
    scheduleApplyNoticeTag()
  }

  const resetActivityQueryForInactive = () => {
    clearNoticeSearchDebounce()
    clearNoticeQuerySwitchThrottle()
  }

  const disposeActivityQueryState = () => {
    resetActivityQueryForInactive()
  }

  return {
    activeTag,
    noticeKeyword,
    isNoticeSearchVisible,
    isNoticeSearchApplied,
    noticeTags,
    activeDateFilterLabel,
    normalizedAppliedNoticeKeyword,
    hasActiveNoticeSearch,
    sceneFilteredNotices,
    noticeListQuerySignature,
    syncActiveTag,
    resolveActivityNoticeQuerySnapshot,
    clearNoticeSearchState,
    handleNoticeSearchToggle,
    handleNoticeKeywordInput,
    handleNoticeKeywordClear,
    handleTagSelect,
    resetActivityQueryForInactive,
    disposeActivityQueryState,
  }
}
