/**
 * Responsibility: resolve profile-asset detail content from content resources and build the
 * fallback detail payload used when the upstream resource omits profile-specific fields.
 * Out of scope: detail page refresh orchestration, persistent cache writes, and UI presentation.
 */
import type {
  ContentAssetDto,
  ContentProfileAssetPayloadDto,
} from '../../contracts/content-api.contract'
import type { ProfileAssetDetailContent } from '../../models/profile-asset-detail/profileAssetDetail.model'
import type { ProfileCategoryKey } from '../../models/home-rail/homeRailProfile.model'
import { resolveContentResource } from '../content/content.service'

const PROFILE_CATEGORY_META: Record<ProfileCategoryKey, { label: string; englishLabel: string }> = {
  collections: { label: '资产', englishLabel: 'COLLECTION' },
  blindBoxes: { label: '盲盒', englishLabel: 'BLIND BOX' },
  certificates: { label: '资格证', englishLabel: 'CREDENTIAL' },
}

const createFallbackPayload = (categoryId: ProfileCategoryKey): ContentProfileAssetPayloadDto => ({
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

const resolveCurrencyUnit = (currency: string): string => {
  return currency === 'CNY' ? '楼' : currency
}

const resolveAssetUrl = (asset: ContentAssetDto | null | undefined): string => {
  if (!asset) {
    return ''
  }

  return asset.variants?.detail ?? asset.variants?.card ?? asset.originalUrl
}

/**
 * Current profile_asset resources already expose image, price, badge, edition and visual tone.
 * On-chain provenance fields are not in the contract yet, so the page keeps them as UI presets
 * until the backend extends ContentProfileAssetPayloadDto.
 */
const adaptProfileAssetDetail = (
  resource: {
    resourceId: string
    title: string
    status: string
    summary?: string
    asset?: ContentAssetDto | null
    payload: ContentProfileAssetPayloadDto
  },
  fallbackCategoryId: ProfileCategoryKey
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
    priceUnit: resolveCurrencyUnit(resource.payload.currency),
    currency: resource.payload.currency,
    editionCode: resource.payload.editionCode,
    issueCount: resource.payload.issueCount,
    imageUrl: resolveAssetUrl(resource.asset),
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

export const createProfileAssetDetailShell = (
  itemId: string,
  fallbackCategoryId: ProfileCategoryKey = 'collections'
): ProfileAssetDetailContent => {
  // Shell only provides the minimum local fallback and must not read provider-specific mock snapshots.
  return adaptProfileAssetDetail(
    {
      resourceId: itemId,
      title: itemId,
      status: 'OWNED',
      payload: createFallbackPayload(fallbackCategoryId),
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

  return adaptProfileAssetDetail(
    {
      resourceId: resource.resourceId,
      title: resource.title,
      status: resource.status,
      summary: resource.summary,
      asset: resource.asset,
      payload: resource.payload as ContentProfileAssetPayloadDto,
    },
    fallbackCategoryId
  )
}
