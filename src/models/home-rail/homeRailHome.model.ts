/**
 * Responsibility: define the normalized home rail content shapes for banners, featured drops,
 * market cards, and shared target references used across home services, page runtimes, and UI shells.
 * Out of scope: market query execution, result-window choreography, and image reveal state tracking.
 */

import type { ContentTargetRef, ContentTargetType } from '../content/contentTarget.model'

export type HomeBannerTone = 'dawn' | 'azure' | 'ember'
export type HomeMarketBadgeTone = 'new' | 'hot' | 'featured'
export type HomeMarketVisualTone = 'ink' | 'mist' | 'aqua' | 'sand'
export type HomePlaceholderIconKey = 'box' | 'cpu' | 'aperture' | 'hexagon' | 'triangle' | 'disc3'
export type HomeContentTargetType = ContentTargetType
export type HomeMarketSortField = 'listedAt' | 'price' | 'tradeVolume24h' | 'holderCount'
export type HomeMarketSortDirection = 'asc' | 'desc'

export type HomeContentTargetRef = ContentTargetRef

export interface HomeNoticeBarConfig {
  label: string
  detailLabel: string
  items: HomeAnnouncementItem[]
}

export interface HomeFocalPoint {
  x: number
  y: number
}

export interface HomeAnnouncementItem {
  noticeId: string
  title: string
  type: string
  time: string
  isUnread: boolean
  target: HomeContentTargetRef
}

export interface HomeBannerItem {
  id: string
  title: string
  liveLabel: string
  tone: HomeBannerTone
  imageUrl: string
  focalPoint?: HomeFocalPoint
  target: HomeContentTargetRef
}

export interface HomeFeaturedDropContent {
  id: string
  title: string
  sectionTitle: string
  sectionSubtitle: string
  priceLabel: string
  priceUnit: string
  price: number
  minted: number
  supply: number
  imageUrl: string
  placeholderIconKey?: HomePlaceholderIconKey
  target: HomeContentTargetRef
}

export interface HomeMarketAction {
  id: 'search' | 'history'
  label: string
  target: HomeContentTargetRef
}

export interface HomeMarketTag {
  id: string
  label: string
}

export interface HomeMarketBadge {
  tone: HomeMarketBadgeTone
  label: string
}

export interface HomeMarketCard {
  id: string
  name: string
  priceUnit: string
  price: number
  listedAt: string
  tradeVolume24h: number
  holderCount: number
  editionCode: string
  issueCount: number
  categories: string[]
  imageUrl: string
  placeholderIconKey?: HomePlaceholderIconKey
  visualTone: HomeMarketVisualTone
  badge?: HomeMarketBadge
  target: HomeContentTargetRef
}

export interface HomeMarketSortOption {
  field: HomeMarketSortField
  label: string
}

export interface HomeMarketSortConfig {
  defaultField: HomeMarketSortField
  defaultDirection: HomeMarketSortDirection
  options: HomeMarketSortOption[]
}

export interface HomeRailHomeContent {
  noticeBar: HomeNoticeBarConfig
  banners: HomeBannerItem[]
  featured: HomeFeaturedDropContent
  market: {
    sectionTitle: string
    sectionSubtitle: string
    tags: HomeMarketTag[]
    actions: HomeMarketAction[]
    sortConfig: HomeMarketSortConfig
    cards: HomeMarketCard[]
  }
}
