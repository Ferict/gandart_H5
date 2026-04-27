/**
 * Responsibility: manage profile asset remote-list requests, merged result application,
 * and request-version guarding for the profile rail query pipeline.
 * Out of scope: result-window presentation, query form state, and persistent cache
 * policy.
 */
import { ref } from 'vue'
import {
  resolveHomeRailProfileAssetList,
  type HomeRailProfileAssetListResult,
  type ResolveHomeRailProfileAssetListInput,
} from '../../../../services/home-rail/homeRailProfileContent.service'
import { logSafeError } from '../../../../utils/safeLogger.util'
import type { HomeRailPaginationAttemptResult } from '../shared/useHomeRailPaginationLoadingChain'
import { COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH } from '../shared/homeRailBatchStrategy'

interface UseProfileAssetRemoteListStateOptions {
  remotePageSize: number
  resolveProfileAssetQuerySnapshot: () => ResolveHomeRailProfileAssetListInput
  resolveProfileAssetQuerySignature: () => string
  resolveCurrentPersistUserScope: () => string | null
  syncResolvedProfileAssetListSnapshot: (
    query: ResolveHomeRailProfileAssetListInput,
    result: HomeRailProfileAssetListResult,
    etag?: string
  ) => void
  hydratePersistedProfileAssetListSnapshot?: (
    query: ResolveHomeRailProfileAssetListInput
  ) => Promise<HomeRailProfileAssetListResult | null>
  persistResolvedProfileAssetListSnapshot?: (
    query: ResolveHomeRailProfileAssetListInput,
    result: HomeRailProfileAssetListResult,
    requestUserScope?: string | null
  ) => Promise<void> | void
}

interface ReloadRemoteProfileAssetListOptions {
  force?: boolean
}

export type ProfileAssetLoadMorePageResult = HomeRailPaginationAttemptResult

export const useProfileAssetRemoteListState = ({
  remotePageSize,
  resolveProfileAssetQuerySnapshot,
  resolveProfileAssetQuerySignature,
  resolveCurrentPersistUserScope,
  syncResolvedProfileAssetListSnapshot,
  hydratePersistedProfileAssetListSnapshot,
  persistResolvedProfileAssetListSnapshot,
}: UseProfileAssetRemoteListStateOptions) => {
  const remoteProfileAssets = ref<HomeRailProfileAssetListResult['items']>([])
  const remoteProfileAssetTotal = ref(0)
  const hasResolvedRemoteProfileAssets = ref(false)
  const isRemoteProfileAssetsLoading = ref(false)
  const profileAssetLoadingPhase = ref<'idle' | 'first-screen' | 'pagination'>('idle')
  const hasProfileAssetFirstScreenError = ref(false)
  const hasProfileAssetPaginationError = ref(false)
  const remoteProfileAssetListEtag = ref<string | null>(null)
  const remoteProfileAssetListEtagScope = ref<string | null>(null)
  const profileAssetResolvedPage = ref(0)
  const loadedProfileAssetItemCount = ref(0)
  const isBeyondFirstTransportBatch = ref(false)
  const profileAssetQueryCacheKey = ref<string | null>(null)
  const profileAssetListRequestVersion = ref(0)
  const transportPagesPerBatch = COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH
  const transportBatchSize = remotePageSize * transportPagesPerBatch

  const resolveProfileAssetQueryCacheKey = (query: ResolveHomeRailProfileAssetListInput) => {
    return JSON.stringify({
      categoryId: query.categoryId ?? null,
      subCategory: query.subCategory ?? null,
      keyword: query.keyword ?? null,
    })
  }

  const resolveProfileAssetEtagScope = (querySignature: string, userScope: string | null) => {
    return `${querySignature}::${userScope ?? ''}`
  }

  const canApplyProfileAssetRemoteResult = (
    requestVersion: number,
    querySignature: string,
    userScope: string | null
  ) => {
    return (
      profileAssetListRequestVersion.value === requestVersion &&
      resolveProfileAssetQuerySignature() === querySignature &&
      resolveCurrentPersistUserScope() === userScope
    )
  }

  const syncLoadedProfileAssetDepth = (loadedItemCount: number) => {
    loadedProfileAssetItemCount.value = loadedItemCount
    isBeyondFirstTransportBatch.value = loadedItemCount > transportBatchSize
  }

  interface ResolvedProfileAssetBatch {
    appendedItems: HomeRailProfileAssetListResult['items']
    firstPageEtag: string | null
    firstPageNotModified: boolean
    lastConsumedRemotePage: number
    total: number
  }

  const resolveRemoteProfileAssetBatch = async (
    startPage: number,
    query: ResolveHomeRailProfileAssetListInput,
    expectedQuerySignature: string,
    requestUserScope: string | null,
    requestVersion: number,
    existingItems: HomeRailProfileAssetListResult['items'],
    options: { ifNoneMatch?: string } = {}
  ): Promise<ResolvedProfileAssetBatch | null> => {
    const appendedItems: HomeRailProfileAssetListResult['items'] = []
    const seenIds = new Set(existingItems.map((item) => item.id))
    let firstPageEtag: string | null = null
    let firstPageNotModified = false
    let lastConsumedRemotePage = Math.max(startPage - 1, 0)
    let total = 0

    for (let pageOffset = 0; pageOffset < transportPagesPerBatch; pageOffset += 1) {
      const page = startPage + pageOffset
      const requestSnapshot = {
        ...query,
        page,
        pageSize: remotePageSize,
      }
      const result =
        pageOffset === 0
          ? await resolveHomeRailProfileAssetList(requestSnapshot, {
              ifNoneMatch: options.ifNoneMatch,
            })
          : await resolveHomeRailProfileAssetList(requestSnapshot, {
              ifNoneMatch: undefined,
            })

      if (
        !canApplyProfileAssetRemoteResult(requestVersion, expectedQuerySignature, requestUserScope)
      ) {
        return null
      }

      if (pageOffset === 0) {
        firstPageEtag = result.etag ?? null
        firstPageNotModified = result.notModified === true
        if (firstPageNotModified) {
          return {
            appendedItems: [],
            firstPageEtag,
            firstPageNotModified: true,
            lastConsumedRemotePage,
            total: remoteProfileAssetTotal.value,
          }
        }
      }

      if (result.notModified) {
        continue
      }

      lastConsumedRemotePage = result.page
      total = result.total
      result.items.forEach((item) => {
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
      firstPageNotModified,
      lastConsumedRemotePage,
      total,
    }
  }

  const reloadRemoteProfileAssetList = async (
    query: ResolveHomeRailProfileAssetListInput = resolveProfileAssetQuerySnapshot(),
    options: ReloadRemoteProfileAssetListOptions = {}
  ): Promise<HomeRailProfileAssetListResult | null> => {
    const requestVersion = profileAssetListRequestVersion.value + 1
    profileAssetListRequestVersion.value = requestVersion
    const expectedQuerySignature = resolveProfileAssetQuerySignature()
    const hasCachedItems = remoteProfileAssets.value.length > 0
    const queryCacheKey = resolveProfileAssetQueryCacheKey(query)
    const requestUserScope = resolveCurrentPersistUserScope()
    const requestEtagScope = resolveProfileAssetEtagScope(expectedQuerySignature, requestUserScope)
    hasProfileAssetFirstScreenError.value = false
    hasProfileAssetPaginationError.value = false
    profileAssetLoadingPhase.value = hasCachedItems ? 'pagination' : 'first-screen'
    isRemoteProfileAssetsLoading.value = true
    const requestSnapshot = {
      ...query,
      page: 1,
      pageSize: remotePageSize,
    }

    try {
      const batch = await resolveRemoteProfileAssetBatch(
        1,
        query,
        expectedQuerySignature,
        requestUserScope,
        requestVersion,
        [],
        {
          ifNoneMatch:
            !options.force && remoteProfileAssetListEtagScope.value === requestEtagScope
              ? (remoteProfileAssetListEtag.value ?? undefined)
              : undefined,
        }
      )

      if (!batch) {
        return null
      }

      if (batch.firstPageNotModified) {
        hasResolvedRemoteProfileAssets.value =
          hasResolvedRemoteProfileAssets.value && profileAssetQueryCacheKey.value === queryCacheKey
        return {
          page: requestSnapshot.page ?? 1,
          pageSize: requestSnapshot.pageSize ?? remotePageSize,
          total: remoteProfileAssetTotal.value,
          items: [],
          etag: remoteProfileAssetListEtag.value ?? undefined,
          notModified: true,
        }
      }

      const mergedResult: HomeRailProfileAssetListResult = {
        page: Math.max(batch.lastConsumedRemotePage, 1),
        pageSize: remotePageSize,
        total: batch.total,
        items: batch.appendedItems,
        etag: batch.firstPageEtag ?? undefined,
        notModified: false,
      }
      remoteProfileAssets.value = mergedResult.items
      remoteProfileAssetTotal.value = mergedResult.total
      hasResolvedRemoteProfileAssets.value = true
      remoteProfileAssetListEtag.value = batch.firstPageEtag
      remoteProfileAssetListEtagScope.value = batch.firstPageEtag ? requestEtagScope : null
      profileAssetResolvedPage.value = mergedResult.page
      syncLoadedProfileAssetDepth(mergedResult.items.length)
      profileAssetQueryCacheKey.value = queryCacheKey
      syncResolvedProfileAssetListSnapshot(requestSnapshot, mergedResult, mergedResult.etag)
      await persistResolvedProfileAssetListSnapshot?.(
        requestSnapshot,
        mergedResult,
        requestUserScope
      )
      return mergedResult
    } catch (error) {
      if (
        !canApplyProfileAssetRemoteResult(requestVersion, expectedQuerySignature, requestUserScope)
      ) {
        return null
      }

      logSafeError('homeRail.profile', error, {
        message: 'failed to resolve remote asset list',
      })
      if (!hasCachedItems) {
        hasProfileAssetFirstScreenError.value = true
      }
      return null
    } finally {
      if (
        canApplyProfileAssetRemoteResult(requestVersion, expectedQuerySignature, requestUserScope)
      ) {
        isRemoteProfileAssetsLoading.value = false
        profileAssetLoadingPhase.value = 'idle'
      }
    }
  }

  const loadMoreRemoteProfileAssetListPage = async (
    query: ResolveHomeRailProfileAssetListInput = resolveProfileAssetQuerySnapshot()
  ): Promise<ProfileAssetLoadMorePageResult> => {
    if (
      isRemoteProfileAssetsLoading.value ||
      remoteProfileAssets.value.length >= remoteProfileAssetTotal.value
    ) {
      return {
        outcome: 'endline',
        totalReached: true,
      }
    }

    const requestVersion = profileAssetListRequestVersion.value + 1
    profileAssetListRequestVersion.value = requestVersion
    const expectedQuerySignature = resolveProfileAssetQuerySignature()
    const requestUserScope = resolveCurrentPersistUserScope()
    const nextPage = profileAssetResolvedPage.value + 1
    hasProfileAssetPaginationError.value = false
    profileAssetLoadingPhase.value = 'pagination'
    isRemoteProfileAssetsLoading.value = true

    try {
      const batch = await resolveRemoteProfileAssetBatch(
        nextPage,
        query,
        expectedQuerySignature,
        requestUserScope,
        requestVersion,
        remoteProfileAssets.value
      )

      if (!batch) {
        return {
          outcome: 'stale',
        }
      }

      if (batch.firstPageNotModified) {
        return {
          outcome: 'no-progress',
          pageAdvanced: false,
          totalReached: remoteProfileAssets.value.length >= remoteProfileAssetTotal.value,
        }
      }

      const pageAdvanced = batch.lastConsumedRemotePage > profileAssetResolvedPage.value
      remoteProfileAssetTotal.value = batch.total > 0 ? batch.total : remoteProfileAssetTotal.value
      profileAssetResolvedPage.value = Math.max(
        batch.lastConsumedRemotePage,
        profileAssetResolvedPage.value
      )
      if (!batch.appendedItems.length) {
        syncLoadedProfileAssetDepth(remoteProfileAssets.value.length)
        return {
          outcome: 'no-progress',
          pageAdvanced,
          totalReached: remoteProfileAssets.value.length >= remoteProfileAssetTotal.value,
        }
      }

      remoteProfileAssets.value = [...remoteProfileAssets.value, ...batch.appendedItems]
      const mergedResult: HomeRailProfileAssetListResult = {
        page: profileAssetResolvedPage.value,
        pageSize: remotePageSize,
        total: remoteProfileAssetTotal.value,
        items: [...remoteProfileAssets.value],
        etag: remoteProfileAssetListEtag.value ?? undefined,
        notModified: false,
      }
      hasResolvedRemoteProfileAssets.value = true
      syncLoadedProfileAssetDepth(remoteProfileAssets.value.length)
      await persistResolvedProfileAssetListSnapshot?.(
        {
          ...query,
          page: 1,
          pageSize: remotePageSize,
        },
        mergedResult,
        requestUserScope
      )
      return {
        outcome: 'appended',
        pageAdvanced,
        totalReached: remoteProfileAssets.value.length >= mergedResult.total,
      }
    } catch (error) {
      if (
        canApplyProfileAssetRemoteResult(requestVersion, expectedQuerySignature, requestUserScope)
      ) {
        logSafeError('homeRail.profile', error, {
          message: 'failed to load more remote asset list',
        })
      }
      return {
        outcome: 'error',
      }
    } finally {
      if (
        canApplyProfileAssetRemoteResult(requestVersion, expectedQuerySignature, requestUserScope)
      ) {
        isRemoteProfileAssetsLoading.value = false
        profileAssetLoadingPhase.value = 'idle'
      }
    }
  }

  const hydrateRemoteProfileAssetListFromPersistentCache = async (
    query: ResolveHomeRailProfileAssetListInput = resolveProfileAssetQuerySnapshot()
  ): Promise<HomeRailProfileAssetListResult | null> => {
    if (!hydratePersistedProfileAssetListSnapshot) {
      return null
    }

    const result = await hydratePersistedProfileAssetListSnapshot(query)
    if (!result) {
      return null
    }

    remoteProfileAssets.value = [...result.items]
    remoteProfileAssetTotal.value = result.total
    hasResolvedRemoteProfileAssets.value = true
    remoteProfileAssetListEtag.value = result.etag ?? null
    remoteProfileAssetListEtagScope.value = result.etag
      ? resolveProfileAssetEtagScope(
          resolveProfileAssetQuerySignature(),
          resolveCurrentPersistUserScope()
        )
      : null
    profileAssetResolvedPage.value = Math.max(result.page, 1)
    syncLoadedProfileAssetDepth(result.items.length)
    profileAssetQueryCacheKey.value = resolveProfileAssetQueryCacheKey(query)
    hasProfileAssetFirstScreenError.value = false
    hasProfileAssetPaginationError.value = false
    isRemoteProfileAssetsLoading.value = false
    profileAssetLoadingPhase.value = 'idle'
    syncResolvedProfileAssetListSnapshot(query, result, result.etag)
    return result
  }

  const clearProfileAssetPaginationFeedback = () => {
    hasProfileAssetPaginationError.value = false
  }

  const markProfileAssetPaginationError = () => {
    hasProfileAssetPaginationError.value = true
  }

  const markProfileAssetPaginationEndline = () => {
    hasProfileAssetPaginationError.value = false
    remoteProfileAssetTotal.value = remoteProfileAssets.value.length
  }

  const invalidateProfileAssetPaginationRequest = () => {
    profileAssetListRequestVersion.value += 1
    if (profileAssetLoadingPhase.value === 'pagination') {
      isRemoteProfileAssetsLoading.value = false
      profileAssetLoadingPhase.value = 'idle'
    }
  }

  return {
    remoteProfileAssets,
    remoteProfileAssetTotal,
    hasResolvedRemoteProfileAssets,
    isRemoteProfileAssetsLoading,
    profileAssetLoadingPhase,
    hasProfileAssetFirstScreenError,
    hasProfileAssetPaginationError,
    remoteProfileAssetListEtag,
    profileAssetResolvedPage,
    loadedProfileAssetItemCount,
    isBeyondFirstTransportBatch,
    profileAssetListRequestVersion,
    hydrateRemoteProfileAssetListFromPersistentCache,
    reloadRemoteProfileAssetList,
    loadMoreRemoteProfileAssetListPage,
    clearProfileAssetPaginationFeedback,
    markProfileAssetPaginationError,
    markProfileAssetPaginationEndline,
    invalidateProfileAssetPaginationRequest,
  }
}
