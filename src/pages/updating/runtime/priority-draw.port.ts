/**
 * Responsibility: define the page-local provider seam for retained priority-draw content.
 * Out of scope: formal backend contract truth, page rendering, and transport bootstrap policy.
 */
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'

export type PriorityDrawStatusDto = 'LIVE' | 'UPCOMING' | 'ENDED'
export type PriorityDrawCoverToneDto = 'cyan' | 'amber' | 'violet' | 'slate'
export type PriorityDrawResultStatusDto = 'win' | 'lose' | 'error'

export interface PriorityDrawTimelineDto {
  startTime: string
  endTime: string
  countdownLabel: string
}

export interface PriorityDrawPrizeItemDto {
  id: string
  name: string
  type: string
  quantity: number
  coverImageUrl: string
}

export interface PriorityDrawPrizePoolDto {
  id: string
  tierName: string
  quotaLabel: string
  items: PriorityDrawPrizeItemDto[]
}

export interface PriorityDrawResultDto {
  status: PriorityDrawResultStatusDto
  title: string
  subtitle: string
  description: string
  actionLabel: string
  prizeItems: PriorityDrawPrizeItemDto[]
  supportLabel?: string
}

export interface PriorityDrawEventDto {
  id: string
  lotteryId?: string | number
  title: string
  status: PriorityDrawStatusDto
  coverImageUrl: string
  timeRange: string
  timeline: PriorityDrawTimelineDto
  condition: string
  remainingDrawCount?: number
  quota: number
  participants: number
  isEligible: boolean
  coverTone: PriorityDrawCoverToneDto
  coverIcon: AetherIconName
  prizePools: PriorityDrawPrizePoolDto[]
  rules: string[]
  result: PriorityDrawResultDto
}

export interface PriorityDrawArchiveDto {
  events: PriorityDrawEventDto[]
}

export interface PriorityDrawPort {
  getArchive: () => PriorityDrawArchiveDto
  hydrateArchive?: (archive: PriorityDrawArchiveDto) => Promise<PriorityDrawArchiveDto>
}
