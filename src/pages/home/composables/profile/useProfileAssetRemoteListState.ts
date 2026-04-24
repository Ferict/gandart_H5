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
  const profileAssetResolvedPage = ref(0)
  const profileAssetQueryCacheKey = ref<string | null>(null)
  const profileAssetListRequestVersion = ref(0)

  const resolveProfileAssetQueryCacheKey = (query: ResolveHomeRailProfileAssetListInput) => {
    return JSON.stringify({
      categoryId: query.categoryId ?? null,
      subCategory: query.subCategory ?? null,
      keyword: query.keyword ?? null,
    })
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
      const result = await resolveHomeRailProfileAssetList(requestSnapshot, {
        ifNoneMatch: options.force ? undefined : (remoteProfileAssetListEtag.value ?? undefined),
      })

      if (
        profileAssetListRequestVersion.value !== requestVersion ||
        resolveProfileAssetQuerySignature() !== expectedQuerySignature
      ) {
        return null
      }

      if (result.notModified) {
        hasResolvedRemoteProfileAssets.value =
          hasResolvedRemoteProfileAssets.value && profileAssetQueryCacheKey.value === queryCacheKey
        return result
      }

      remoteProfileAssets.value = result.items
      remoteProfileAssetTotal.value = result.total
      hasResolvedRemoteProfileAssets.value = true
      remoteProfileAssetListEtag.value = result.etag ?? null
      profileAssetResolvedPage.value = result.page
      profileAssetQueryCacheKey.value = queryCacheKey
      syncResolvedProfileAssetListSnapshot(requestSnapshot, result, result.etag)
      await persistResolvedProfileAssetListSnapshot?.(requestSnapshot, result, requestUserScope)
      return result
    } catch (error) {
      if (
        profileAssetListRequestVersion.value !== requestVersion ||
        resolveProfileAssetQuerySignature() !== expectedQuerySignature
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
      if (profileAssetListRequestVersion.value === requestVersion) {
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
      const result = await resolveHomeRailProfileAssetList(
        {
          ...query,
          page: nextPage,
          pageSize: remotePageSize,
        },
        {
          ifNoneMatch: undefined,
        }
      )

      if (
        profileAssetListRequestVersion.value !== requestVersion ||
        resolveProfileAssetQuerySignature() !== expectedQuerySignature
      ) {
        return {
          outcome: 'stale',
        }
      }

      if (result.notModified) {
        return {
          outcome: 'no-progress',
          pageAdvanced: false,
          totalReached: remoteProfileAssets.value.length >= remoteProfileAssetTotal.value,
        }
      }

      const existingIdSet = new Set(remoteProfileAssets.value.map((item) => item.id))
      const appendedItems = result.items.filter((item) => !existingIdSet.has(item.id))
      const pageAdvanced = result.page > profileAssetResolvedPage.value
      remoteProfileAssetTotal.value = result.total
      remoteProfileAssetListEtag.value = result.etag ?? remoteProfileAssetListEtag.value
      profileAssetResolvedPage.value = result.page
      if (!appendedItems.length) {
        return {
          outcome: 'no-progress',
          pageAdvanced,
          totalReached: remoteProfileAssets.value.length >= result.total,
        }
      }

      remoteProfileAssets.value = [...remoteProfileAssets.value, ...appendedItems]
      const mergedResult: HomeRailProfileAssetListResult = {
        ...result,
        items: [...remoteProfileAssets.value],
      }
      hasResolvedRemoteProfileAssets.value = true
      await persistResolvedProfileAssetListSnapshot?.(
        resolveProfileAssetQuerySnapshot(),
        mergedResult,
        requestUserScope
      )
      return {
        outcome: 'appended',
        pageAdvanced,
        totalReached: remoteProfileAssets.value.length >= result.total,
      }
    } catch (error) {
      if (
        profileAssetListRequestVersion.value === requestVersion &&
        resolveProfileAssetQuerySignature() === expectedQuerySignature
      ) {
        logSafeError('homeRail.profile', error, {
          message: 'failed to load more remote asset list',
        })
      }
      return {
        outcome: 'error',
      }
    } finally {
      if (profileAssetListRequestVersion.value === requestVersion) {
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
    profileAssetResolvedPage.value = Math.max(result.page, 1)
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
