/**
 * Responsibility: declare the profile rail summary, category, and asset item shapes shared by
 * profile content services, result-window runtimes, and detail-entry adapters.
 * Out of scope: remote list fetching, scene patch orchestration, and persistent cache writes.
 */
import type { ContentTargetDto } from '../../contracts/content-api.contract'
import type {
  HomeMarketBadge,
  HomeMarketVisualTone,
  HomePlaceholderIconKey,
} from './homeRailHome.model'

export type ProfileCategoryKey = 'collections' | 'blindBoxes' | 'certificates'

export interface ProfileCategory {
  id: ProfileCategoryKey
  label: string
  subCategories: string[]
}

export interface ProfileAssetItem {
  id: string
  name: string
  date: string
  subCategory: string
  holdingsCount: number
  priceUnit: string
  price: number
  editionCode: string
  issueCount: number
  imageUrl: string
  placeholderIconKey?: HomePlaceholderIconKey
  visualTone: HomeMarketVisualTone
  badge?: HomeMarketBadge
  assetId?: string
  linkedMarketItemId?: string
  target?: ContentTargetDto
}

export interface ProfileSummary {
  displayName: string
  summary: string
  currency: string
  totalValue: string
  holdings: string
  address: string
  networkLabel?: string
  statusLabel?: string
  qrPayload?: string
  shareTarget?: ContentTargetDto
}

export interface HomeRailProfileContent {
  summary: ProfileSummary
  categories: ProfileCategory[]
  assets: Record<ProfileCategoryKey, ProfileAssetItem[]>
}
