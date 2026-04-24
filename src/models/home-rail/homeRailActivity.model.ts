/**
 * Responsibility: define the activity rail content, notice list, and date-filter data shapes
 * consumed by home activity services, runtimes, and page-local presentation layers.
 * Out of scope: query execution, result-window timing, and notice read-state side effects.
 */
import type { ContentTargetDto } from '../../contracts/content-api.contract'

export type ActivityEntryTone = 'dark' | 'light' | 'soft'
export type ActivityNoticeType = string
export type ActivityNoticeVisualPreset =
  | 'consignment'
  | 'limit_price'
  | 'release'
  | 'airdrop'
  | 'synthesis'
  | 'platform'
  | 'swap'
export type ActivityDateFilterRange = {
  startDate: string
  endDate: string
} | null

export interface ActivityNoticeVisual {
  preset: ActivityNoticeVisualPreset
  imageUrl?: string
}

export interface ActivityEntry {
  id: string
  title: string
  eyebrow: string
  description: string
  tone: ActivityEntryTone
  badgeText?: string
  target: ContentTargetDto
}

export interface ActivityNotice {
  id: string
  title: string
  category: ActivityNoticeType
  publishedAt: string
  time: string
  isUnread: boolean
  visual?: ActivityNoticeVisual
  target: ContentTargetDto
}

export interface ActivityNoticeListResult {
  resourceType: 'notice'
  page: number
  pageSize: number
  total: number
  list: ActivityNotice[]
  etag?: string | null
  notModified?: boolean
}

export interface HomeRailActivityContent {
  entries: ActivityEntry[]
  notices: {
    tags: string[]
    list: ActivityNotice[]
  }
}
