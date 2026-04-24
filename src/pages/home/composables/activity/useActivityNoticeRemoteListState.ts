/**
 * Responsibility: manage activity notice remote-list loading, persistent snapshot hydrate,
 * request-version gating, and first-screen/pagination error state.
 * Out of scope: query-state authoring, result-window timing, and activity page presentation
 * assembly.
 */
import { ref } from 'vue'
import { resolveHomeRailActivityNoticeList } from '../../../../services/home-rail/homeRailActivityContent.service'
import type {
  ActivityDateFilterRange,
  ActivityNoticeListResult,
} from '../../../../models/home-rail/homeRailActivity.model'
import { logSafeError } from '../../../../utils/safeLogger.util'
import {
  isHomeRailPaginationLoadingPhase,
  useHomeRailPaginationLoadingChain,
  type HomeRailPaginationAttemptResult,
} from '../shared/useHomeRailPaginationLoadingChain'

export interface ActivityNoticeQuerySnapshot {
  tag?: string
  keyword?: string
  dateRange?: ActivityDateFilterRange
  page: number
  pageSize: number
}

interface UseActivityNoticeRemoteListStateOptions {
  resolveQuerySnapshot: () => ActivityNoticeQuerySnapshot
  syncResolvedNoticeSnapshot: (
    query: ActivityNoticeQuerySnapshot,
    list: ActivityNoticeListResult,
    etag?: string
  ) => void
  hydratePersistedNoticeListSnapshot?: (
    query: ActivityNoticeQuerySnapshot
  ) => Promise<ActivityNoticeListResult | null>
  persistResolvedNoticeListSnapshot?: (
    query: ActivityNoticeQuerySnapshot,
    list: ActivityNoticeListResult
  ) => Promise<void> | void
}

interface ReloadActivityNoticeListOptions {
  force?: boolean
  replay?: boolean
  motionSource?: 'initial-enter' | 'manual-query-switch' | 'manual-refresh'
}

export type ActivityNoticeRemoteListResult = ActivityNoticeListResult & {
  etag?: string
  notModified?: boolean
}

type ActivityNoticeRemoteLoadPhase = 'first-screen' | 'pagination'

const ACTIVITY_NOTICE_REMOTE_INITIAL_PAGE = 1
const ACTIVITY_NOTICE_REMOTE_PAGE_SIZE_FLOOR = 60
const ACTIVITY_NOTICE_REMOTE_LIST_ERROR_MESSAGE = '公告加载失败，请稍后重试'

export const useActivityNoticeRemoteListState = ({
  resolveQuerySnapshot,
  syncResolvedNoticeSnapshot,
  hydratePersistedNoticeListSnapshot,
  persistResolvedNoticeListSnapshot,
}: UseActivityNoticeRemoteListStateOptions) => {
  const remoteFilteredNoticeList = ref<ActivityNoticeListResult | null>(null)
  const remoteFilteredNoticeListEtag = ref<string | null>(null)
  const hasResolvedRemoteNoticeList = ref(false)
  const remoteNoticeQueryCacheKey = ref<string | null>(null)
  const isRemoteNoticeListLoading = ref(false)
  const isFirstScreenRemoteNoticeListLoading = ref(false)
  const isNoticePaginationLoading = ref(false)
  const hasFirstScreenRemoteNoticeListError = ref(false)
  const hasNoticePaginationError = ref(false)
  const remoteNoticeListErrorMessage = ref('')
  const noticeListRequestVersion = ref(0)

  const resolveRemoteLoadPhase = (): ActivityNoticeRemoteLoadPhase => {
    if (!hasResolvedRemoteNoticeList.value && !remoteFilteredNoticeList.value) {
      return 'first-screen'
    }
    return 'pagination'
  }

  const clearRemoteNoticeListErrors = () => {
    hasFirstScreenRemoteNoticeListError.value = false
    hasNoticePaginationError.value = false
    remoteNoticeListErrorMessage.value = ''
  }

  const resolveQueryCacheKey = (querySnapshot: ActivityNoticeQuerySnapshot) => {
    return JSON.stringify({
      tag: querySnapshot.tag ?? null,
      keyword: querySnapshot.keyword ?? null,
      dateRange: querySnapshot.dateRange ?? null,
      page: querySnapshot.page,
      pageSize: querySnapshot.pageSize,
    })
  }

  const resolveCurrentPaginationQuerySignature = () => {
    const querySnapshot = resolveQuerySnapshot()
    return resolveQueryCacheKey({
      ...querySnapshot,
      page: ACTIVITY_NOTICE_REMOTE_INITIAL_PAGE,
      pageSize: Math.max(querySnapshot.pageSize, ACTIVITY_NOTICE_REMOTE_PAGE_SIZE_FLOOR),
    })
  }

  const invalidateNoticePaginationRequest = () => {
    noticeListRequestVersion.value += 1
    isRemoteNoticeListLoading.value = false
    isNoticePaginationLoading.value = false
  }

  const noticePaginationLoadChain = useHomeRailPaginationLoadingChain({
    resolveIsActive: () => true,
    resolveQuerySignature: resolveCurrentPaginationQuerySignature,
    onError: () => {
      hasNoticePaginationError.value = true
      remoteNoticeListErrorMessage.value = ACTIVITY_NOTICE_REMOTE_LIST_ERROR_MESSAGE
    },
    onEndline: () => {
      hasNoticePaginationError.value = false
    },
    onReset: clearRemoteNoticeListErrors,
    onAttemptTimeout: invalidateNoticePaginationRequest,
    onPhaseChange: (phase) => {
      isNoticePaginationLoading.value = isHomeRailPaginationLoadingPhase(phase)
    },
  })

  const requestRemoteActivityNoticeListOnce = async (
    options: ReloadActivityNoticeListOptions,
    loadPhase: ActivityNoticeRemoteLoadPhase
  ): Promise<ActivityNoticeRemoteListResult | null> => {
    const requestVersion = noticeListRequestVersion.value + 1
    noticeListRequestVersion.value = requestVersion
    isRemoteNoticeListLoading.value = true
    isFirstScreenRemoteNoticeListLoading.value = loadPhase === 'first-screen'
    isNoticePaginationLoading.value = loadPhase === 'pagination'
    if (loadPhase === 'first-screen') {
      hasFirstScreenRemoteNoticeListError.value = false
    } else {
      hasNoticePaginationError.value = false
    }
    remoteNoticeListErrorMessage.value = ''

    const querySnapshot = resolveQuerySnapshot()
    const requestSnapshot: ActivityNoticeQuerySnapshot = {
      ...querySnapshot,
      page: ACTIVITY_NOTICE_REMOTE_INITIAL_PAGE,
      pageSize: Math.max(querySnapshot.pageSize, ACTIVITY_NOTICE_REMOTE_PAGE_SIZE_FLOOR),
    }
    const queryCacheKey = resolveQueryCacheKey(requestSnapshot)

    try {
      const nextListResult = await resolveHomeRailActivityNoticeList({
        ...requestSnapshot,
        ifNoneMatch: options.force ? undefined : (remoteFilteredNoticeListEtag.value ?? undefined),
      })

      if (noticeListRequestVersion.value !== requestVersion) {
        return null
      }

      if (nextListResult.notModified) {
        hasResolvedRemoteNoticeList.value =
          Boolean(remoteFilteredNoticeList.value) &&
          remoteNoticeQueryCacheKey.value === queryCacheKey
        return nextListResult
      }

      remoteFilteredNoticeList.value = {
        ...nextListResult,
        list: nextListResult.list.map((item) => ({ ...item })),
      }
      remoteFilteredNoticeListEtag.value = nextListResult.etag ?? null
      hasResolvedRemoteNoticeList.value = true
      remoteNoticeQueryCacheKey.value = queryCacheKey
      clearRemoteNoticeListErrors()
      syncResolvedNoticeSnapshot(requestSnapshot, nextListResult, nextListResult.etag)
      await persistResolvedNoticeListSnapshot?.(requestSnapshot, nextListResult)
      return nextListResult
    } catch (error) {
      if (noticeListRequestVersion.value !== requestVersion) {
        return null
      }
      logSafeError('homeRail.activity', error, {
        message: 'failed to resolve remote notice list',
      })
      if (loadPhase === 'first-screen') {
        hasFirstScreenRemoteNoticeListError.value = true
      } else {
        hasNoticePaginationError.value = true
      }
      remoteNoticeListErrorMessage.value = ACTIVITY_NOTICE_REMOTE_LIST_ERROR_MESSAGE
      return null
    } finally {
      if (noticeListRequestVersion.value === requestVersion) {
        isRemoteNoticeListLoading.value = false
        isFirstScreenRemoteNoticeListLoading.value = false
        isNoticePaginationLoading.value =
          loadPhase === 'pagination' && noticePaginationLoadChain.isLoading.value
      }
    }
  }

  const reloadRemoteActivityNoticeList = async (
    options: ReloadActivityNoticeListOptions = {}
  ): Promise<ActivityNoticeRemoteListResult | null> => {
    const loadPhase = resolveRemoteLoadPhase()
    if (loadPhase === 'first-screen') {
      return requestRemoteActivityNoticeListOnce(options, loadPhase)
    }

    let latestResult: ActivityNoticeRemoteListResult | null = null
    await noticePaginationLoadChain.startPaginationLoadChain(
      async (): Promise<HomeRailPaginationAttemptResult> => {
        latestResult = await requestRemoteActivityNoticeListOnce(options, loadPhase)
        if (!latestResult) {
          return {
            outcome: 'error',
          }
        }

        if (latestResult.notModified) {
          return {
            outcome: 'no-progress',
            pageAdvanced: false,
            totalReached:
              (remoteFilteredNoticeList.value?.list.length ?? 0) >=
              (remoteFilteredNoticeList.value?.total ?? Number.POSITIVE_INFINITY),
          }
        }

        return {
          outcome: 'appended',
          totalReached: latestResult.list.length >= latestResult.total,
        }
      },
      {
        manual: options.force,
      }
    )

    return latestResult
  }

  const resetRemoteNoticeListForInactive = () => {
    noticePaginationLoadChain.cancelPaginationLoadChain()
    isRemoteNoticeListLoading.value = false
    isFirstScreenRemoteNoticeListLoading.value = false
    isNoticePaginationLoading.value = false
    clearRemoteNoticeListErrors()
  }

  const hydrateRemoteNoticeListFromPersistentCache = async (
    querySnapshot: ActivityNoticeQuerySnapshot = resolveQuerySnapshot()
  ): Promise<ActivityNoticeListResult | null> => {
    if (!hydratePersistedNoticeListSnapshot) {
      return null
    }

    const cachedList = await hydratePersistedNoticeListSnapshot(querySnapshot)
    if (!cachedList) {
      return null
    }

    const requestSnapshot: ActivityNoticeQuerySnapshot = {
      ...querySnapshot,
      page: ACTIVITY_NOTICE_REMOTE_INITIAL_PAGE,
      pageSize: Math.max(querySnapshot.pageSize, ACTIVITY_NOTICE_REMOTE_PAGE_SIZE_FLOOR),
    }
    remoteFilteredNoticeList.value = {
      ...cachedList,
      list: cachedList.list.map((item) => ({ ...item })),
    }
    remoteFilteredNoticeListEtag.value = cachedList.etag ?? null
    hasResolvedRemoteNoticeList.value = true
    remoteNoticeQueryCacheKey.value = resolveQueryCacheKey(requestSnapshot)
    clearRemoteNoticeListErrors()
    isRemoteNoticeListLoading.value = false
    isFirstScreenRemoteNoticeListLoading.value = false
    isNoticePaginationLoading.value = false
    syncResolvedNoticeSnapshot(requestSnapshot, cachedList)
    return cachedList
  }

  return {
    remoteFilteredNoticeList,
    remoteFilteredNoticeListEtag,
    hasResolvedRemoteNoticeList,
    isRemoteNoticeListLoading,
    isFirstScreenRemoteNoticeListLoading,
    isNoticePaginationLoading,
    hasFirstScreenRemoteNoticeListError,
    hasNoticePaginationError,
    remoteNoticeListErrorMessage,
    noticeListRequestVersion,
    hydrateRemoteNoticeListFromPersistentCache,
    reloadRemoteActivityNoticeList,
    resetRemoteNoticeListForInactive,
  }
}
