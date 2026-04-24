/**
 * Responsibility: define the normalized profile asset detail content shape consumed by detail
 * services, page-local presentation state, and cached detail snapshot flows.
 * Out of scope: detail fetch orchestration, route resolution, and hero media runtime behavior.
 */
import type {
  HomeMarketBadge,
  HomeMarketVisualTone,
  HomePlaceholderIconKey,
} from '../home-rail/homeRailHome.model'
import type { ProfileCategoryKey } from '../home-rail/homeRailProfile.model'

export interface ProfileAssetDetailContent {
  id: string
  title: string
  categoryId: ProfileCategoryKey
  categoryLabel: string
  categoryEnglishLabel: string
  subCategory: string
  acquiredAt: string
  statusLabel: string
  summary: string
  holdingsCount: number
  price: number
  priceUnit: string
  currency: string
  editionCode: string
  issueCount: number
  imageUrl: string
  placeholderIconKey?: HomePlaceholderIconKey
  visualTone: HomeMarketVisualTone
  badge?: HomeMarketBadge
  assetId?: string
  linkedMarketItemId?: string
}
