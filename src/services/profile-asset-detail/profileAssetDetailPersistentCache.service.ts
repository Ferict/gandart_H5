/**
 * Responsibility: bridge profile-asset detail content to the shared persistent cache using the
 * current or explicit profile user scope.
 * Out of scope: detail fetching, page-open orchestration, and detail presentation mapping.
 */
import type { ProfileAssetDetailContent } from '../../models/profile-asset-detail/profileAssetDetail.model'
import {
  readContentResourceSnapshot,
  writeContentResourceSnapshot,
} from '../content/contentPersistentCache.service'
import { normalizeContentUserScope } from '../content/contentUserScope.service'
import { resolveCurrentHomeRailProfileUserScope } from '../home-rail/homeRailPersistentCacheIntegration.service'

const PROFILE_ASSET_DETAIL_RESOURCE_TYPE = 'profile_asset'

const resolveResourceId = (resourceId: string) => resourceId.trim()

export const resolveCurrentProfileAssetDetailPersistentUserScope = () => {
  return resolveCurrentHomeRailProfileUserScope()
}

export const hydrateProfileAssetDetailFromPersistentCache = (
  resourceId: string
): ProfileAssetDetailContent | null => {
  const normalizedResourceId = resolveResourceId(resourceId)
  const userScope = resolveCurrentProfileAssetDetailPersistentUserScope()
  if (!normalizedResourceId || !userScope) {
    return null
  }

  return (
    readContentResourceSnapshot<ProfileAssetDetailContent>({
      resourceType: PROFILE_ASSET_DETAIL_RESOURCE_TYPE,
      resourceId: normalizedResourceId,
      userScope,
    })?.resource ?? null
  )
}

export const persistProfileAssetDetailToPersistentCache = (
  detail: ProfileAssetDetailContent,
  userScope?: string | null
): boolean => {
  const resourceId = resolveResourceId(detail.id)
  const resolvedUserScope = normalizeContentUserScope(userScope)
  if (!resourceId || !resolvedUserScope) {
    return false
  }

  return writeContentResourceSnapshot({
    resourceType: PROFILE_ASSET_DETAIL_RESOURCE_TYPE,
    resourceId,
    resource: detail,
    userScope: resolvedUserScope,
  })
}
