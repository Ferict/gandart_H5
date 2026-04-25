/**
 * Responsibility: host profile asset detail route state, including query parsing, category
 * normalization, and current route-signature projection.
 * Out of scope: page-open refresh flow, detail content state, and hero media presentation.
 */
import { computed, ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import type { ProfileCategoryKey } from '../../../models/home-rail/homeRailProfile.model'
import { createProfileAssetDetailRouteSignature } from '../helpers/profileAssetDetailRefreshApplyGuard'
import {
  parseProfileAssetDetailRouteQuery,
  type ProfileAssetDetailRouteQuery,
} from './profileAssetDetailRouteQuery'

export const DEFAULT_PROFILE_ASSET_ITEM_ID = 'C-02'

export interface ProfileAssetDetailResolvedRoute {
  itemId: string
  category: ProfileCategoryKey
}

export interface UseProfileAssetDetailRouteStateResult {
  routeQuery: Ref<ProfileAssetDetailRouteQuery>
  routeSource: ComputedRef<string>
  resolveCategory: (value: string) => ProfileCategoryKey
  resolveCurrentDetailRoute: () => ProfileAssetDetailResolvedRoute
  currentDetailRouteSignature: ComputedRef<string>
  updateRouteQuery: (query: Record<string, unknown>) => void
}

export const useProfileAssetDetailRouteState = (): UseProfileAssetDetailRouteStateResult => {
  const routeQuery = ref(parseProfileAssetDetailRouteQuery({}))

  const routeSource = computed(() => routeQuery.value.source.trim() || 'profile-asset-detail')

  const resolveCategory = (value: string): ProfileCategoryKey => {
    if (value === 'blindBoxes' || value === 'certificates') {
      return value
    }

    return 'collections'
  }

  const resolveCurrentDetailRoute = (): ProfileAssetDetailResolvedRoute => {
    const itemId =
      routeQuery.value.itemId || routeQuery.value.assetId || DEFAULT_PROFILE_ASSET_ITEM_ID

    return {
      itemId,
      category: resolveCategory(routeQuery.value.category),
    }
  }

  const currentDetailRouteSignature = computed(() => {
    const { itemId, category } = resolveCurrentDetailRoute()
    return createProfileAssetDetailRouteSignature({ itemId, category })
  })

  const updateRouteQuery = (query: Record<string, unknown>) => {
    routeQuery.value = parseProfileAssetDetailRouteQuery(query)
  }

  return {
    routeQuery,
    routeSource,
    resolveCategory,
    resolveCurrentDetailRoute,
    currentDetailRouteSignature,
    updateRouteQuery,
  }
}
