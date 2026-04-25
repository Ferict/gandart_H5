/**
 * Responsibility: own detail-page shell priming, persistent snapshot hydrate/persist gating,
 * and local persistent-user-scope tracking for the profile asset detail page.
 * Out of scope: route parsing, refresh request orchestration, and hero media presentation.
 */
import { ref } from 'vue'
import type { Ref } from 'vue'
import type { ProfileAssetDetailContent } from '../../../models/profile-asset-detail/profileAssetDetail.model'
import type { ProfileAssetDetailResolvedRoute } from './useProfileAssetDetailRouteState'
import { DEFAULT_PROFILE_ASSET_ITEM_ID } from './useProfileAssetDetailRouteState'
import { createProfileAssetDetailShell } from '../../../services/profile-asset-detail/profileAssetDetailContent.service'
import {
  hydrateProfileAssetDetailFromPersistentCache,
  persistProfileAssetDetailToPersistentCache,
  resolveCurrentProfileAssetDetailPersistentUserScope,
} from '../../../services/profile-asset-detail/profileAssetDetailPersistentCache.service'

interface UseProfileAssetDetailPersistentStateOptions {
  resolveCurrentDetailRoute: () => ProfileAssetDetailResolvedRoute
  createShell?: typeof createProfileAssetDetailShell
  hydrateSnapshot?: typeof hydrateProfileAssetDetailFromPersistentCache
  persistSnapshot?: typeof persistProfileAssetDetailToPersistentCache
  resolveCurrentUserScope?: typeof resolveCurrentProfileAssetDetailPersistentUserScope
}

export interface UseProfileAssetDetailPersistentStateResult {
  detailContent: Ref<ProfileAssetDetailContent>
  detailPersistentUserScope: Ref<string | null>
  resolveDetailPersistentUserScope: () => string | null
  syncDetailPersistentUserScope: () => string | null
  primeDetailPageShell: () => ProfileAssetDetailContent
  hydrateDetailSnapshotFromPersistentCache: () => ProfileAssetDetailContent | null
  persistDetailSnapshotIfAllowed: (
    detail: ProfileAssetDetailContent,
    requestUserScope?: string | null
  ) => boolean
  applyResolvedDetailContent: (
    detail: ProfileAssetDetailContent,
    requestUserScope?: string | null
  ) => void
  preparePersistentStateForPageOpen: () => void
}

export const useProfileAssetDetailPersistentState = ({
  resolveCurrentDetailRoute,
  createShell = createProfileAssetDetailShell,
  hydrateSnapshot = hydrateProfileAssetDetailFromPersistentCache,
  persistSnapshot = persistProfileAssetDetailToPersistentCache,
  resolveCurrentUserScope = resolveCurrentProfileAssetDetailPersistentUserScope,
}: UseProfileAssetDetailPersistentStateOptions): UseProfileAssetDetailPersistentStateResult => {
  const detailContent = ref<ProfileAssetDetailContent>(createShell(DEFAULT_PROFILE_ASSET_ITEM_ID))
  const detailPersistentUserScope = ref<string | null>(resolveCurrentUserScope())

  const resolveDetailPersistentUserScope = () => detailPersistentUserScope.value

  const syncDetailPersistentUserScope = () => {
    detailPersistentUserScope.value = resolveCurrentUserScope()
    return detailPersistentUserScope.value
  }

  const primeDetailPageShell = () => {
    const { itemId, category } = resolveCurrentDetailRoute()
    const shell = createShell(itemId, category)
    detailContent.value = shell
    return shell
  }

  const hydrateDetailSnapshotFromPersistentCache = () => {
    if (!detailPersistentUserScope.value) {
      return null
    }

    const { itemId } = resolveCurrentDetailRoute()
    const cached = hydrateSnapshot(itemId)
    if (cached) {
      detailContent.value = cached
    }
    return cached
  }

  const persistDetailSnapshotIfAllowed = (
    detail: ProfileAssetDetailContent,
    requestUserScope?: string | null
  ) => {
    if (!requestUserScope) {
      return false
    }

    return persistSnapshot(detail, requestUserScope)
  }

  const applyResolvedDetailContent = (
    detail: ProfileAssetDetailContent,
    requestUserScope?: string | null
  ) => {
    detailContent.value = detail
    syncDetailPersistentUserScope()
    persistDetailSnapshotIfAllowed(detail, requestUserScope)
  }

  const preparePersistentStateForPageOpen = () => {
    syncDetailPersistentUserScope()
    primeDetailPageShell()
    if (detailPersistentUserScope.value) {
      hydrateDetailSnapshotFromPersistentCache()
    }
  }

  return {
    detailContent,
    detailPersistentUserScope,
    resolveDetailPersistentUserScope,
    syncDetailPersistentUserScope,
    primeDetailPageShell,
    hydrateDetailSnapshotFromPersistentCache,
    persistDetailSnapshotIfAllowed,
    applyResolvedDetailContent,
    preparePersistentStateForPageOpen,
  }
}
