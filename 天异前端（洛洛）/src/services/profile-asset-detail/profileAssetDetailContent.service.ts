/**
 * Responsibility: resolve profile-asset detail content from content resources and build the
 * fallback detail payload used when the upstream resource omits profile-specific fields.
 * Out of scope: detail page refresh orchestration, persistent cache writes, and UI presentation.
 */
import type { ProfileAssetDetailContent } from '../../models/profile-asset-detail/profileAssetDetail.model'
import type { ProfileCategoryKey } from '../../models/home-rail/homeRailProfile.model'
import type { ContentProfileAssetPayloadDto } from '../../contracts/content-api.contract'
import {
  adaptProfileAssetDetailContent,
  createProfileAssetDetailFallbackPayload,
  type ProfileAssetDetailAdapterResource,
} from '../../adapters/content/profileAssetDetailContent.adapter'
import { resolveContentResource } from '../content/content.service'

export const createProfileAssetDetailShell = (
  itemId: string,
  fallbackCategoryId: ProfileCategoryKey = 'collections'
): ProfileAssetDetailContent => {
  // Shell only provides the minimum local fallback and must not read provider-specific mock snapshots.
  return adaptProfileAssetDetailContent(
    {
      resourceId: itemId,
      title: itemId,
      status: 'OWNED',
      payload: createProfileAssetDetailFallbackPayload(fallbackCategoryId),
    },
    fallbackCategoryId
  )
}

export const resolveProfileAssetDetailContent = async (
  itemId: string,
  fallbackCategoryId: ProfileCategoryKey = 'collections'
): Promise<ProfileAssetDetailContent> => {
  const resource = await resolveContentResource({
    resourceType: 'profile_asset',
    resourceId: itemId,
  })
  if (resource.resourceType !== 'profile_asset') {
    throw new Error(
      `profile asset detail returned unexpected resourceType: ${resource.resourceType}`
    )
  }

  const normalizedResource: ProfileAssetDetailAdapterResource = {
    resourceId: resource.resourceId,
    title: resource.title,
    status: resource.status,
    summary: resource.summary,
    asset: resource.asset,
    payload: resource.payload as ContentProfileAssetPayloadDto,
  }

  return adaptProfileAssetDetailContent(normalizedResource, fallbackCategoryId)
}
