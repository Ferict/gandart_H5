/**
 * Responsibility: declare the stable view model consumed by the retained priority-draw page.
 * Out of scope: provider DTOs, transport concerns, and page rendering behavior.
 */
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'

export type PriorityDrawStatus = 'LIVE' | 'UPCOMING' | 'ENDED'
export type PriorityDrawCoverTone = 'cyan' | 'amber' | 'violet' | 'slate'
export type PriorityDrawResultStatus = 'win' | 'lose' | 'error'

export interface PriorityDrawTimelineViewModel {
  startTime: string
  endTime: string
  countdownLabel: string
}

export interface PriorityDrawPrizeItemViewModel {
  id: string
  name: string
  type: string
  quantity: number
  coverImageUrl: string
}

export interface PriorityDrawPrizePoolViewModel {
  id: string
  tierName: string
  quotaLabel: string
  items: PriorityDrawPrizeItemViewModel[]
}

export interface PriorityDrawResultViewModel {
  status: PriorityDrawResultStatus
  title: string
  subtitle: string
  description: string
  actionLabel: string
  prizeItems: PriorityDrawPrizeItemViewModel[]
  supportLabel?: string
}

export interface PriorityDrawEventViewModel {
  id: string
  lotteryId?: string | number
  title: string
  status: PriorityDrawStatus
  coverImageUrl: string
  timeRange: string
  timeline: PriorityDrawTimelineViewModel
  condition: string
  remainingDrawCount: number
  quota: number
  participants: number
  isEligible: boolean
  coverTone: PriorityDrawCoverTone
  coverIcon: AetherIconName
  prizePools: PriorityDrawPrizePoolViewModel[]
  rules: string[]
  result: PriorityDrawResultViewModel
}
