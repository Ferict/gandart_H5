/**
 * Responsibility: manage home market remote-list requests, result application, and
 * request-version guarding for the market rail query pipeline.
 * Out of scope: result-window presentation, query form state, and persistent cache
 * policy.
 */
import { ref } from 'vue'
import {
  resolveHomeRailMarketCardList,
  type HomeRailMarketCardListResult,
  type ResolveHomeRailMarketCardListInput,
} from '../../../../services/home-rail/homeRailHomeContent.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import { logSafeError } from '../../../../utils/safeLogger.util'
import type { HomeRailPaginationAttemptResult } from '../shared/useHomeRailPaginationLoadingChain'

type MarketListRequestBase = Omit<ResolveHomeRailMarketCardListInput, 'page' | 'pageSize'>

type StagedMarketListUpdateOrigin = 'visible-update' | 'activation-apply'

interface StagedMarketListUpdate {
  querySignature: string
  payload: HomeRailMarketCardListResult
  origin: StagedMarketListUpdateOrigin
}

interface UseHomeMarketRemoteListStateOptions {
  remotePageSize: number
  resolveMarketListRequestBase: () => MarketListRequestBase
  resolveMarketListQuerySnapshot: () => ResolveHomeRailMarketCardListInput
  resolveMarketListQuerySignature: () => string
  syncMarketListQuerySnapshot: (query: ResolveHomeRailMarketCardListInput) => void
  syncResolvedMarketListSnapshot: (
    query: ResolveHomeRailMarketCardListInput,
    result: HomeRailMarketCardListResult,
    etag?: string
  ) => void
  resolveCurrentMarketCollection: () => HomeMarketCard[]
  resolveCurrentPendingCollectionLength: () => number
  resolveCurrentMarketResultTotal: () => number
  setMarketCollection: (items: HomeMarketCard[]) => void
  hydratePersistedMarketListSnapshot?: (
    query: ResolveHomeRailMarketCardListInput
  ) => Promise<HomeRailMarketCardListResult | null>
  persistResolvedMarketListSnapshot?: (
    query: ResolveHomeRailMarketCardListInput,
    list: HomeRailMarketCardListResult
  ) => Promise<void> | void
}

interface ReloadRemoteMarketListOptions {
  force?: boolean
}

export type HomeMarketLoadMorePageResult = HomeRailPaginationAttemptResult

export const useHomeMarketRemoteListState = ({
  remotePageSize,
  resolveMarketListRequestBase,
  resolveMarketListQuerySnapshot,
  resolveMarketListQuerySignature,
  syncMarketListQuerySnapshot,
  syncResolvedMarketListSnapshot,
  resolveCurrentMarketCollection,
  resolveCurrentPendingCollectionLength,
  resolveCurrentMarketResultTotal,
  setMarketCollection,
  hydratePersistedMarketListSnapshot,
  persistResolvedMarketListSnapshot,
}: UseHomeMarketRemoteListStateOptions) => {
  const isMarketListLoading = ref(false)
  const marketListLoadingPhase = ref<'idle' | 'first-screen' | 'pagination'>('idle')
  const hasResolvedRemoteMarketList = ref(false)
  const hasMarketFirstScreenError = ref(false)
  const hasMarketPaginationError = ref(false)
  const marketListRequestVersion = ref(0)
  const marketListResolvedPage = ref(0)
  const remoteMarketListEtag = ref<string | null>(null)
  const remoteMarketListTotal = ref(0)
  const lastRemoteMarketListNotModified = ref(false)
  const stagedMarketListUpdate = ref<StagedMarketListUpdate | null>(null)

  const clearStagedMarketListUpdate = () => {
    stagedMarketListUpdate.value = null
  }

  const stageMarketListUpdate = (
    payload: HomeRailMarketCardListResult,
    querySignature: string,
    origin: StagedMarketListUpdateOrigin
  ) => {
    stagedMarketListUpdate.value = {
      querySignature,
      payload,
      origin,
    }
  }

  const consumeStagedMarketListUpdate = (querySignature: string) => {
    const stagedUpdate = stagedMarketListUpdate.value
    if (!stagedUpdate) {
      return null
    }

    stagedMarketListUpdate.value = null
    if (stagedUpdate.querySignature !== querySignature) {
      return null
    }

    return stagedUpdate
  }

  const reloadRemoteMarketList = async (
    options: ReloadRemoteMarketListOptions = {}
  ): Promise<HomeRailMarketCardListResult | null> => {
    clearStagedMarketListUpdate()
    const requestVersion = marketListRequestVersion.value + 1
    marketListRequestVersion.value = requestVersion
    const expectedQuerySignature = resolveMarketListQuerySignature()
    const requestBase = resolveMarketListRequestBase()
    const querySnapshot = resolveMarketListQuerySnapshot()
    const hasCachedItems = resolveCurrentMarketCollection().length > 0
    hasMarketFirstScreenError.value = false
    hasMarketPaginationError.value = false
    marketListLoadingPhase.value = hasCachedItems ? 'pagination' : 'first-screen'
    syncMarketListQuerySnapshot(querySnapshot)
    isMarketListLoading.value = true

    try {
      const list = await resolveHomeRailMarketCardList(
        {
          ...requestBase,
          page: 1,
          pageSize: remotePageSize,
        },
        {
          ifNoneMatch: options.force ? undefined : (remoteMarketListEtag.value ?? undefined),
        }
      )

      if (
        marketListRequestVersion.value !== requestVersion ||
        resolveMarketListQuerySignature() !== expectedQuerySignature
      ) {
        return null
      }

      lastRemoteMarketListNotModified.value = list.notModified === true
      if (list.notModified) {
        hasResolvedRemoteMarketList.value =
          hasResolvedRemoteMarketList.value || resolveCurrentMarketCollection().length > 0
        return list
      }

      remoteMarketListEtag.value = list.etag ?? null
      remoteMarketListTotal.value = list.total
      marketListResolvedPage.value = list.page
      hasResolvedRemoteMarketList.value = true
      syncResolvedMarketListSnapshot(querySnapshot, list, list.etag)
      await persistResolvedMarketListSnapshot?.(querySnapshot, list)
      return list
    } catch (error) {
      if (
        marketListRequestVersion.value !== requestVersion ||
        resolveMarketListQuerySignature() !== expectedQuerySignature
      ) {
        return null
      }

      logSafeError('homeRail.home', error, {
        message: 'failed to resolve market list',
      })
      if (!hasCachedItems) {
        hasMarketFirstScreenError.value = true
      }
      return null
    } finally {
      if (marketListRequestVersion.value === requestVersion) {
        isMarketListLoading.value = false
        marketListLoadingPhase.value = 'idle'
      }
    }
  }

  const loadMoreRemoteMarketListPage = async (): Promise<HomeMarketLoadMorePageResult> => {
    if (
      isMarketListLoading.value ||
      resolveCurrentPendingCollectionLength() >= resolveCurrentMarketResultTotal()
    ) {
      return {
        outcome: 'endline',
        totalReached: true,
      }
    }

    clearStagedMarketListUpdate()
    const requestVersion = marketListRequestVersion.value + 1
    marketListRequestVersion.value = requestVersion
    const expectedQuerySignature = resolveMarketListQuerySignature()
    const requestBase = resolveMarketListRequestBase()
    const nextPage = marketListResolvedPage.value + 1
    hasMarketPaginationError.value = false
    marketListLoadingPhase.value = 'pagination'
    isMarketListLoading.value = true

    try {
      const list = await resolveHomeRailMarketCardList({
        ...requestBase,
        page: nextPage,
        pageSize: remotePageSize,
      })

      if (
        marketListRequestVersion.value !== requestVersion ||
        resolveMarketListQuerySignature() !== expectedQuerySignature
      ) {
        return {
          outcome: 'stale',
        }
      }

      lastRemoteMarketListNotModified.value = list.notModified === true
      if (list.notModified) {
        return {
          outcome: 'no-progress',
          pageAdvanced: false,
          totalReached:
            resolveCurrentPendingCollectionLength() >= resolveCurrentMarketResultTotal(),
        }
      }

      const existingItems = resolveCurrentMarketCollection()
      const existingIdSet = new Set(existingItems.map((item) => item.id))
      const appendedItems = list.items.filter((item) => !existingIdSet.has(item.id))
      const pageAdvanced = list.page > marketListResolvedPage.value
      if (!appendedItems.length) {
        marketListResolvedPage.value = list.page
        remoteMarketListTotal.value = list.total
        remoteMarketListEtag.value = list.etag ?? remoteMarketListEtag.value
        return {
          outcome: 'no-progress',
          pageAdvanced,
          totalReached: resolveCurrentPendingCollectionLength() >= list.total,
        }
      }

      const nextItems = [...existingItems, ...appendedItems]
      setMarketCollection(nextItems)
      const mergedList: HomeRailMarketCardListResult = {
        ...list,
        items: nextItems,
      }
      marketListResolvedPage.value = list.page
      remoteMarketListTotal.value = list.total
      remoteMarketListEtag.value = list.etag ?? remoteMarketListEtag.value
      hasResolvedRemoteMarketList.value = true
      await persistResolvedMarketListSnapshot?.(resolveMarketListQuerySnapshot(), mergedList)
      return {
        outcome: 'appended',
        pageAdvanced,
        totalReached: nextItems.length >= list.total,
      }
    } catch (error) {
      if (
        marketListRequestVersion.value === requestVersion &&
        resolveMarketListQuerySignature() === expectedQuerySignature
      ) {
        logSafeError('homeRail.home', error, {
          message: 'failed to load more market list',
        })
      }

      return {
        outcome: 'error',
      }
    } finally {
      if (marketListRequestVersion.value === requestVersion) {
        isMarketListLoading.value = false
        marketListLoadingPhase.value = 'idle'
      }
    }
  }

  const hydrateRemoteMarketListFromPersistentCache = async (
    querySnapshot: ResolveHomeRailMarketCardListInput = resolveMarketListQuerySnapshot()
  ): Promise<HomeRailMarketCardListResult | null> => {
    if (!hydratePersistedMarketListSnapshot) {
      return null
    }

    const list = await hydratePersistedMarketListSnapshot(querySnapshot)
    if (!list) {
      return null
    }

    setMarketCollection([...list.items])
    remoteMarketListEtag.value = list.etag ?? null
    remoteMarketListTotal.value = list.total
    marketListResolvedPage.value = Math.max(list.page, 1)
    hasResolvedRemoteMarketList.value = true
    hasMarketFirstScreenError.value = false
    hasMarketPaginationError.value = false
    isMarketListLoading.value = false
    marketListLoadingPhase.value = 'idle'
    syncResolvedMarketListSnapshot(querySnapshot, list, list.etag)
    return list
  }

  const clearMarketPaginationFeedback = () => {
    hasMarketPaginationError.value = false
  }

  const markMarketPaginationError = () => {
    hasMarketPaginationError.value = true
  }

  const markMarketPaginationEndline = () => {
    hasMarketPaginationError.value = false
    remoteMarketListTotal.value = Math.max(
      resolveCurrentMarketCollection().length,
      resolveCurrentPendingCollectionLength()
    )
  }

  const invalidateMarketPaginationRequest = () => {
    marketListRequestVersion.value += 1
    if (marketListLoadingPhase.value === 'pagination') {
      isMarketListLoading.value = false
      marketListLoadingPhase.value = 'idle'
    }
  }

  return {
    isMarketListLoading,
    marketListLoadingPhase,
    hasResolvedRemoteMarketList,
    hasMarketFirstScreenError,
    hasMarketPaginationError,
    marketListRequestVersion,
    marketListResolvedPage,
    remoteMarketListEtag,
    remoteMarketListTotal,
    lastRemoteMarketListNotModified,
    stagedMarketListUpdate,
    clearStagedMarketListUpdate,
    stageMarketListUpdate,
    consumeStagedMarketListUpdate,
    hydrateRemoteMarketListFromPersistentCache,
    reloadRemoteMarketList,
    loadMoreRemoteMarketListPage,
    clearMarketPaginationFeedback,
    markMarketPaginationError,
    markMarketPaginationEndline,
    invalidateMarketPaginationRequest,
  }
}
