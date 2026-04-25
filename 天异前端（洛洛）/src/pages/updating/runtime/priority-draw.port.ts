/**
 * Responsibility: define the page-local provider seam for retained priority-draw content.
 * Out of scope: formal backend contract truth, page rendering, and transport bootstrap policy.
 */
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'

export type PriorityDrawStatusDto = 'LIVE' | 'UPCOMING' | 'ENDED'
export type PriorityDrawCoverToneDto = 'cyan' | 'amber' | 'violet' | 'slate'

export interface PriorityDrawEventDto {
  id: string
  title: string
  status: PriorityDrawStatusDto
  coverImageUrl: string
  timeRange: string
  condition: string
  quota: number
  participants: number
  isEligible: boolean
  coverTone: PriorityDrawCoverToneDto
  coverIcon: AetherIconName
}

export interface PriorityDrawArchiveDto {
  events: PriorityDrawEventDto[]
}

export interface PriorityDrawPort {
  getArchive: () => PriorityDrawArchiveDto
}
