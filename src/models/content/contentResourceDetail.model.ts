/**
 * Responsibility: declare the normalized detail content shape and badge/stat helpers used by
 * content resource detail adapters and detail-facing presentation services.
 * Out of scope: remote request orchestration, cache persistence, and page-level state handling.
 */
import type {
  HomeMarketBadgeTone,
  HomeMarketVisualTone,
  HomePlaceholderIconKey,
} from '../home-rail/homeRailHome.model'

export interface ContentResourceDetailStat {
  id: string
  label: string
  value: string
  caption?: string
}

export interface ContentResourceDetailBadge {
  id: string
  label: string
  tone: 'slate' | 'cyan' | 'amber' | 'rose'
}

export interface ContentResourceDetailContent {
  resourceType: 'home_banner' | 'activity' | 'drop' | 'market_item'
  resourceId: string
  title: string
  subtitle: string
  statusLabel: string
  summary: string
  englishTitle: string
  imageUrl: string
  placeholderIconKey: HomePlaceholderIconKey
  priceLabel: string
  priceUnit: string
  priceValue: string
  progressRate: number
  progressLabel: string
  visualTone: HomeMarketVisualTone | 'slate'
  badges: ContentResourceDetailBadge[]
  stats: ContentResourceDetailStat[]
  relationNote: string
}

export const contentResourceBadgeToneMap: Record<
  HomeMarketBadgeTone,
  ContentResourceDetailBadge['tone']
> = {
  new: 'rose',
  hot: 'amber',
  featured: 'cyan',
}
