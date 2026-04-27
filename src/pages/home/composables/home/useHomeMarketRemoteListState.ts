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
import { COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH } from '../shared/homeRailBatchStrategy'

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
  const remoteMarketListEtagQuerySignature = ref<string | null>(null)
  const remoteMarketListTotal = ref(0)
  const loadedMarketListItemCount = ref(0)
  const isBeyondFirstTransportBatch = ref(false)
  const lastRemoteMarketListNotModified = ref(false)
  const stagedMarketListUpdate = ref<StagedMarketListUpdate | null>(null)

  const transportPagesPerBatch = COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH
  const transportBatchSize = remotePageSize * transportPagesPerBatch

  const syncLoadedMarketListDepth = (loadedItemCount: number) => {
    loadedMarketListItemCount.value = loadedItemCount
    isBeyondFirstTransportBatch.value = loadedItemCount > transportBatchSize
  }

  const hasStaleMarketRequest = (requestVersion: number, expectedQuerySignature: string) => {
    return (
      marketListRequestVersion.value !== requestVersion ||
      resolveMarketListQuerySignature() !== expectedQuerySignature
    )
  }

  interface ResolvedMarketBatch {
    appendedItems: HomeMarketCard[]
    firstPageEtag: string | null
    lastConsumedRemotePage: number
    total: number
    firstPageNotModified: boolean
  }

  const resolveRemoteMarketListBatch = async (
    startPage: number,
    requestBase: MarketListRequestBase,
    expectedQuerySignature: string,
    requestVersion: number,
    existingItems: HomeMarketCard[],
    options: { ifNoneMatch?: string } = {}
  ): Promise<ResolvedMarketBatch | null> => {
    const appendedItems: HomeMarketCard[] = []
    const seenIds = new Set(existingItems.map((item) => item.id))
    let firstPageEtag: string | null = null
    let firstPageNotModified = false
    let lastConsumedRemotePage = Math.max(startPage - 1, 0)
    let total = 0

    for (let pageOffset = 0; pageOffset < transportPagesPerBatch; pageOffset += 1) {
      const page = startPage + pageOffset
      const pageResult =
        pageOffset === 0
          ? await resolveHomeRailMarketCardList(
              {
                ...requestBase,
                page,
                pageSize: remotePageSize,
              },
              {
                ifNoneMatch: options.ifNoneMatch,
              }
            )
          : await resolveHomeRailMarketCardList({
              ...requestBase,
              page,
              pageSize: remotePageSize,
            })

      if (hasStaleMarketRequest(requestVersion, expectedQuerySignature)) {
        return null
      }

      if (pageOffset === 0) {
        firstPageEtag = pageResult.etag ?? null
        firstPageNotModified = pageResult.notModified === true
        if (firstPageNotModified) {
          return {
            appendedItems: [],
            firstPageEtag,
            lastConsumedRemotePage,
            total: remoteMarketListTotal.value,
            firstPageNotModified: true,
          }
        }
      }

      if (pageResult.notModified) {
        continue
      }

      lastConsumedRemotePage = pageResult.page
      total = pageResult.total
      pageResult.items.forEach((item) => {
        if (seenIds.has(item.id)) {
          return
        }
        seenIds.add(item.id)
        appendedItems.push(item)
      })
    }

    return {
      appendedItems,
      firstPageEtag,
      lastConsumedRemotePage,
      total,
      firstPageNotModified,
    }
  }

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
      const batch = await resolveRemoteMarketListBatch(
        1,
        requestBase,
        expectedQuerySignature,
        requestVersion,
        [],
        {
          ifNoneMatch:
            !options.force && remoteMarketListEtagQuerySignature.value === expectedQuerySignature
              ? (remoteMarketListEtag.value ?? undefined)
              : undefined,
        }
      )

      if (!batch) {
        return null
      }

      lastRemoteMarketListNotModified.value = batch.firstPageNotModified
      if (batch.firstPageNotModified) {
        hasResolvedRemoteMarketList.value =
          hasResolvedRemoteMarketList.value || resolveCurrentMarketCollection().length > 0
        return {
          page: querySnapshot.page,
          pageSize: querySnapshot.pageSize,
          total: remoteMarketListTotal.value,
          items: [],
          etag: remoteMarketListEtag.value ?? undefined,
          notModified: true,
        }
      }

      const mergedList: HomeRailMarketCardListResult = {
        page: Math.max(batch.lastConsumedRemotePage, 1),
        pageSize: remotePageSize,
        total: batch.total,
        items: batch.appendedItems,
        etag: batch.firstPageEtag ?? undefined,
        notModified: false,
      }
      remoteMarketListEtag.value = batch.firstPageEtag
      remoteMarketListEtagQuerySignature.value = batch.firstPageEtag ? expectedQuerySignature : null
      remoteMarketListTotal.value = mergedList.total
      marketListResolvedPage.value = mergedList.page
      syncLoadedMarketListDepth(mergedList.items.length)
      hasResolvedRemoteMarketList.value = true
      syncResolvedMarketListSnapshot(querySnapshot, mergedList, mergedList.etag)
      await persistResolvedMarketListSnapshot?.(querySnapshot, mergedList)
      return mergedList
    } catch (error) {
      if (hasStaleMarketRequest(requestVersion, expectedQuerySignature)) {
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
    const existingItems = resolveCurrentMarketCollection()
    hasMarketPaginationError.value = false
    marketListLoadingPhase.value = 'pagination'
    isMarketListLoading.value = true

    try {
      const batch = await resolveRemoteMarketListBatch(
        nextPage,
        requestBase,
        expectedQuerySignature,
        requestVersion,
        existingItems
      )

      if (!batch) {
        return {
          outcome: 'stale',
        }
      }

      lastRemoteMarketListNotModified.value = batch.firstPageNotModified
      if (batch.firstPageNotModified) {
        return {
          outcome: 'no-progress',
          pageAdvanced: false,
          totalReached:
            resolveCurrentPendingCollectionLength() >= resolveCurrentMarketResultTotal(),
        }
      }

      const pageAdvanced = batch.lastConsumedRemotePage > marketListResolvedPage.value
      if (!batch.appendedItems.length) {
        marketListResolvedPage.value = Math.max(
          batch.lastConsumedRemotePage,
          marketListResolvedPage.value
        )
        remoteMarketListTotal.value = batch.total > 0 ? batch.total : remoteMarketListTotal.value
        syncLoadedMarketListDepth(existingItems.length)
        return {
          outcome: 'no-progress',
          pageAdvanced,
          totalReached: resolveCurrentPendingCollectionLength() >= remoteMarketListTotal.value,
        }
      }

      const nextItems = [...existingItems, ...batch.appendedItems]
      setMarketCollection(nextItems)
      const mergedList: HomeRailMarketCardListResult = {
        page: Math.max(batch.lastConsumedRemotePage, nextPage),
        pageSize: remotePageSize,
        total: batch.total,
        items: nextItems,
        etag: remoteMarketListEtag.value ?? undefined,
        notModified: false,
      }
      marketListResolvedPage.value = mergedList.page
      remoteMarketListTotal.value = mergedList.total
      syncLoadedMarketListDepth(nextItems.length)
      hasResolvedRemoteMarketList.value = true
      await persistResolvedMarketListSnapshot?.(resolveMarketListQuerySnapshot(), mergedList)
      return {
        outcome: 'appended',
        pageAdvanced,
        totalReached: nextItems.length >= mergedList.total,
      }
    } catch (error) {
      if (!hasStaleMarketRequest(requestVersion, expectedQuerySignature)) {
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
    remoteMarketListEtagQuerySignature.value = list.etag ? resolveMarketListQuerySignature() : null
    remoteMarketListTotal.value = list.total
    marketListResolvedPage.value = Math.max(list.page, 1)
    syncLoadedMarketListDepth(list.items.length)
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
    loadedMarketListItemCount,
    isBeyondFirstTransportBatch,
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
