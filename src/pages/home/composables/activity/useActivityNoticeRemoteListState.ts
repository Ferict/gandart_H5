/**
 * Responsibility: manage activity notice remote-list loading, persistent snapshot hydrate,
 * request-version gating, and first-screen/pagination error state.
 * Out of scope: query-state authoring, result-window timing, and activity page presentation
 * assembly.
 */
import { ref } from 'vue'
import { resolveHomeRailActivityNoticeList } from '../../../../services/home-rail/homeRailActivityContent.service'
import type {
  ActivityNotice,
  ActivityNoticeListResult,
} from '../../../../models/home-rail/homeRailActivity.model'
import { logSafeError } from '../../../../utils/safeLogger.util'
import {
  isHomeRailPaginationLoadingPhase,
  useHomeRailPaginationLoadingChain,
  type HomeRailPaginationAttemptResult,
} from '../shared/useHomeRailPaginationLoadingChain'
import type { ResultLoadSource } from '../../../../services/home-rail/homeRailResultWindow.service'

export interface ActivityNoticeQuerySnapshot {
  tag?: string
  keyword?: string
  page: number
  pageSize: number
}

interface UseActivityNoticeRemoteListStateOptions {
  resolveIsActive?: () => boolean
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
  motionSource?: ResultLoadSource
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
  resolveIsActive = () => true,
  resolveQuerySnapshot,
  syncResolvedNoticeSnapshot,
  hydratePersistedNoticeListSnapshot,
  persistResolvedNoticeListSnapshot,
}: UseActivityNoticeRemoteListStateOptions) => {
  const remoteFilteredNoticeList = ref<ActivityNoticeListResult | null>(null)
  const remoteFilteredNoticeListEtag = ref<string | null>(null)
  const remoteFilteredNoticeListEtagQuerySignature = ref<string | null>(null)
  const hasResolvedRemoteNoticeList = ref(false)
  const remoteNoticeQueryCacheKey = ref<string | null>(null)
  const isRemoteNoticeListLoading = ref(false)
  const isFirstScreenRemoteNoticeListLoading = ref(false)
  const isNoticePaginationLoading = ref(false)
  const hasFirstScreenRemoteNoticeListError = ref(false)
  const hasNoticePaginationError = ref(false)
  const remoteNoticeListErrorMessage = ref('')
  const noticeListRequestVersion = ref(0)
  const noticeListResolvedPage = ref(0)
  const remoteNoticeListTotal = ref(0)

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

  const canApplyActivityNoticeRemoteResult = (requestVersion: number, querySignature: string) => {
    return (
      noticeListRequestVersion.value === requestVersion &&
      resolveIsActive() &&
      resolveCurrentPaginationQuerySignature() === querySignature
    )
  }

  const invalidateNoticePaginationRequest = () => {
    noticeListRequestVersion.value += 1
    isRemoteNoticeListLoading.value = false
    isNoticePaginationLoading.value = false
  }

  const noticePaginationLoadChain = useHomeRailPaginationLoadingChain({
    resolveIsActive,
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
    if (!resolveIsActive()) {
      return null
    }

    const requestVersion = noticeListRequestVersion.value + 1
    noticeListRequestVersion.value = requestVersion
    const expectedQuerySignature = resolveCurrentPaginationQuerySignature()
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
        ifNoneMatch:
          !options.force &&
          remoteFilteredNoticeListEtagQuerySignature.value === expectedQuerySignature
            ? (remoteFilteredNoticeListEtag.value ?? undefined)
            : undefined,
      })

      if (!canApplyActivityNoticeRemoteResult(requestVersion, expectedQuerySignature)) {
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
      remoteFilteredNoticeListEtagQuerySignature.value = nextListResult.etag
        ? expectedQuerySignature
        : null
      noticeListResolvedPage.value = nextListResult.page
      remoteNoticeListTotal.value = nextListResult.total
      hasResolvedRemoteNoticeList.value = true
      remoteNoticeQueryCacheKey.value = queryCacheKey
      clearRemoteNoticeListErrors()
      syncResolvedNoticeSnapshot(requestSnapshot, nextListResult, nextListResult.etag)
      await persistResolvedNoticeListSnapshot?.(requestSnapshot, nextListResult)
      return nextListResult
    } catch (error) {
      if (!canApplyActivityNoticeRemoteResult(requestVersion, expectedQuerySignature)) {
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
      if (canApplyActivityNoticeRemoteResult(requestVersion, expectedQuerySignature)) {
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

  const appendUniqueActivityNotices = (
    existingItems: ActivityNotice[],
    incomingItems: ActivityNotice[]
  ) => {
    const existingIdSet = new Set(existingItems.map((item) => item.id))
    return [...existingItems, ...incomingItems.filter((item) => !existingIdSet.has(item.id))]
  }

  const loadMoreRemoteActivityNoticeListPage = async (
    options: { manual?: boolean } = {}
  ): Promise<HomeRailPaginationAttemptResult> => {
    const currentList = remoteFilteredNoticeList.value
    if (!currentList || currentList.list.length >= currentList.total) {
      return {
        outcome: 'endline',
        totalReached: true,
      }
    }

    return noticePaginationLoadChain.startPaginationLoadChain(
      async (context): Promise<HomeRailPaginationAttemptResult> => {
        if (!resolveIsActive()) {
          return {
            outcome: 'stale',
          }
        }

        const requestVersion = noticeListRequestVersion.value + 1
        noticeListRequestVersion.value = requestVersion
        const nextPage = noticeListResolvedPage.value + 1
        const baseSnapshot = resolveQuerySnapshot()
        const requestSnapshot: ActivityNoticeQuerySnapshot = {
          ...baseSnapshot,
          page: nextPage,
          pageSize: Math.max(baseSnapshot.pageSize, ACTIVITY_NOTICE_REMOTE_PAGE_SIZE_FLOOR),
        }
        isRemoteNoticeListLoading.value = true
        isNoticePaginationLoading.value = true
        hasNoticePaginationError.value = false
        remoteNoticeListErrorMessage.value = ''

        try {
          const nextListResult = await resolveHomeRailActivityNoticeList({
            ...requestSnapshot,
            ifNoneMatch: undefined,
          })

          if (!canApplyActivityNoticeRemoteResult(requestVersion, context.querySignature)) {
            return {
              outcome: 'stale',
            }
          }

          if (nextListResult.notModified) {
            return {
              outcome: 'no-progress',
              pageAdvanced: false,
              totalReached:
                (remoteFilteredNoticeList.value?.list.length ?? 0) >=
                (remoteFilteredNoticeList.value?.total ?? Number.POSITIVE_INFINITY),
            }
          }

          const existingItems = remoteFilteredNoticeList.value?.list ?? []
          const mergedItems = appendUniqueActivityNotices(existingItems, nextListResult.list)
          const pageAdvanced = nextListResult.page > noticeListResolvedPage.value
          remoteFilteredNoticeList.value = {
            ...nextListResult,
            list: mergedItems.map((item) => ({ ...item })),
          }
          remoteFilteredNoticeListEtag.value =
            nextListResult.etag ?? remoteFilteredNoticeListEtag.value
          if (nextListResult.etag) {
            remoteFilteredNoticeListEtagQuerySignature.value = context.querySignature
          }
          noticeListResolvedPage.value = nextListResult.page
          remoteNoticeListTotal.value = nextListResult.total
          remoteNoticeQueryCacheKey.value = context.querySignature
          hasResolvedRemoteNoticeList.value = true
          clearRemoteNoticeListErrors()

          const mergedResult: ActivityNoticeListResult = {
            ...nextListResult,
            list: mergedItems,
          }
          const firstPageSnapshot: ActivityNoticeQuerySnapshot = {
            ...requestSnapshot,
            page: ACTIVITY_NOTICE_REMOTE_INITIAL_PAGE,
          }
          syncResolvedNoticeSnapshot(firstPageSnapshot, mergedResult, nextListResult.etag)
          await persistResolvedNoticeListSnapshot?.(firstPageSnapshot, mergedResult)

          if (mergedItems.length === existingItems.length) {
            return {
              outcome: 'no-progress',
              pageAdvanced,
              totalReached: mergedItems.length >= nextListResult.total,
            }
          }

          return {
            outcome: 'appended',
            pageAdvanced,
            totalReached: mergedItems.length >= nextListResult.total,
          }
        } catch (error) {
          if (canApplyActivityNoticeRemoteResult(requestVersion, context.querySignature)) {
            logSafeError('homeRail.activity', error, {
              message: 'failed to load more remote notice list',
            })
          }

          return {
            outcome: 'error',
          }
        } finally {
          if (canApplyActivityNoticeRemoteResult(requestVersion, context.querySignature)) {
            isRemoteNoticeListLoading.value = false
            isNoticePaginationLoading.value = noticePaginationLoadChain.isLoading.value
          }
        }
      },
      options
    )
  }

  const resetRemoteNoticeListForInactive = () => {
    noticeListRequestVersion.value += 1
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
    remoteFilteredNoticeListEtagQuerySignature.value = cachedList.etag
      ? resolveCurrentPaginationQuerySignature()
      : null
    noticeListResolvedPage.value = Math.max(cachedList.page, 1)
    remoteNoticeListTotal.value = cachedList.total
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
    remoteFilteredNoticeListEtagQuerySignature,
    hasResolvedRemoteNoticeList,
    isRemoteNoticeListLoading,
    isFirstScreenRemoteNoticeListLoading,
    isNoticePaginationLoading,
    hasFirstScreenRemoteNoticeListError,
    hasNoticePaginationError,
    remoteNoticeListErrorMessage,
    noticeListRequestVersion,
    noticeListResolvedPage,
    remoteNoticeListTotal,
    hydrateRemoteNoticeListFromPersistentCache,
    reloadRemoteActivityNoticeList,
    loadMoreRemoteActivityNoticeListPage,
    resetRemoteNoticeListForInactive,
  }
}
