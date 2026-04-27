/**
 * Responsibility: define the mock market item source records and sort presets used by the
 * content mock provider for home market lists and linked profile assets.
 * Out of scope: scene assembly, asset registry ownership, and market UI presentation logic.
 */
import type {
  ContentMarketBadgeType,
  ContentMarketKind,
  ContentMarketVisualTone,
  ContentPlaceholderIconKey,
} from '../../contracts/content-api.contract'
import { sharedHomeCollectionCatalog } from './shared-home-collection-catalog'

export interface ContentMarketItemRecord {
  itemId: string
  marketKind: ContentMarketKind
  title: string
  currency: string
  priceInCent: number
  listedAt: string
  tradeVolume24h: number
  holderCount: number
  editionCode: string
  issueCount: number
  categoryIds: string[]
  assetId?: string | null
  placeholderIconKey?: ContentPlaceholderIconKey
  visualTone: ContentMarketVisualTone
  badgeType?: ContentMarketBadgeType
  badgeLabel?: string
  status: 'online'
  updatedAt: string
  summary: string
}

export const contentMarketItemDb: ContentMarketItemRecord[] = sharedHomeCollectionCatalog.map(
  (item) => ({
    itemId: item.itemId,
    marketKind: item.profileCategoryId,
    title: item.title,
    currency: item.currency,
    priceInCent: item.priceInCent,
    listedAt: item.listedAt,
    tradeVolume24h: item.tradeVolume24h,
    holderCount: item.holderCount,
    editionCode: item.editionCode,
    issueCount: item.issueCount,
    categoryIds: [item.marketCategoryId],
    assetId: item.assetId,
    placeholderIconKey: item.placeholderIconKey,
    visualTone: item.visualTone,
    badgeType: item.badgeType,
    badgeLabel: item.badgeLabel,
    status: item.status,
    updatedAt: item.updatedAt,
    summary: item.summary,
  })
)
