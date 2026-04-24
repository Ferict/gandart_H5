/**
 * Responsibility: normalize profile-asset detail DTOs into the internal detail model without
 * introducing any service, page, or cache side effects.
 * Out of scope: network fetch orchestration, persistent cache writes, and UI presentation.
 */
import type {
  ContentAssetDto,
  ContentProfileAssetPayloadDto,
} from '../../contracts/content-api.contract'
import type { ProfileAssetDetailContent } from '../../models/profile-asset-detail/profileAssetDetail.model'
import type { ProfileCategoryKey } from '../../models/home-rail/homeRailProfile.model'
import { resolvePriceSymbol } from '../../utils/priceSymbol.util'

const PROFILE_CATEGORY_META: Record<ProfileCategoryKey, { label: string; englishLabel: string }> = {
  collections: { label: '资产', englishLabel: 'COLLECTION' },
  blindBoxes: { label: '盲盒', englishLabel: 'BLIND BOX' },
  certificates: { label: '资格证', englishLabel: 'CREDENTIAL' },
}

export interface ProfileAssetDetailAdapterResource {
  resourceId: string
  title: string
  status: string
  summary?: string
  asset?: ContentAssetDto | null
  payload: ContentProfileAssetPayloadDto
}

export const createProfileAssetDetailFallbackPayload = (
  categoryId: ProfileCategoryKey
): ContentProfileAssetPayloadDto => ({
  categoryId,
  subCategory: '',
  acquiredAt: '',
  holdingsCount: 1,
  currency: 'CNY',
  priceInCent: 0,
  editionCode: 'LTD',
  issueCount: 0,
  placeholderIconKey: 'box',
  visualTone: 'mist',
})

export const resolveProfileAssetDetailCurrencyUnit = (currency: string): string => {
  return resolvePriceSymbol(currency)
}

export const resolveProfileAssetDetailAssetUrl = (
  asset: ContentAssetDto | null | undefined
): string => {
  if (!asset) {
    return ''
  }

  return asset.variants?.detail ?? asset.variants?.card ?? asset.originalUrl
}

export const adaptProfileAssetDetailContent = (
  resource: ProfileAssetDetailAdapterResource,
  fallbackCategoryId: ProfileCategoryKey = 'collections'
): ProfileAssetDetailContent => {
  const categoryId = (resource.payload.categoryId || fallbackCategoryId) as ProfileCategoryKey
  const categoryMeta = PROFILE_CATEGORY_META[categoryId]

  return {
    id: resource.resourceId,
    title: resource.title,
    categoryId,
    categoryLabel: categoryMeta.label,
    categoryEnglishLabel: categoryMeta.englishLabel,
    subCategory: resource.payload.subCategory,
    acquiredAt: resource.payload.acquiredAt,
    statusLabel: resource.status,
    summary:
      resource.summary ?? '当前资产已归档到个人中心资产链路，后续可在这里承接更多权益与管理动作。',
    holdingsCount: Math.max(resource.payload.holdingsCount || 0, 1),
    price: Math.round(resource.payload.priceInCent / 100),
    priceUnit: resolveProfileAssetDetailCurrencyUnit(resource.payload.currency),
    currency: resource.payload.currency,
    editionCode: resource.payload.editionCode,
    issueCount: resource.payload.issueCount,
    imageUrl: resolveProfileAssetDetailAssetUrl(resource.asset),
    placeholderIconKey: resource.payload.placeholderIconKey,
    visualTone: resource.payload.visualTone,
    badge:
      resource.payload.badgeType && resource.payload.badgeLabel
        ? {
            tone: resource.payload.badgeType,
            label: resource.payload.badgeLabel,
          }
        : undefined,
    assetId: resource.payload.assetId,
    linkedMarketItemId: resource.payload.linkedMarketItemId,
  }
}
