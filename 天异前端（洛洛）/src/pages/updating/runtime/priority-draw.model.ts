/**
 * Responsibility: declare the stable view model consumed by the retained priority-draw page.
 * Out of scope: provider DTOs, transport concerns, and page rendering behavior.
 */
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'

export type PriorityDrawStatus = 'LIVE' | 'UPCOMING' | 'ENDED'
export type PriorityDrawCoverTone = 'cyan' | 'amber' | 'violet' | 'slate'

export interface PriorityDrawEventViewModel {
  id: string
  title: string
  status: PriorityDrawStatus
  coverImageUrl: string
  timeRange: string
  condition: string
  quota: number
  participants: number
  isEligible: boolean
  coverTone: PriorityDrawCoverTone
  coverIcon: AetherIconName
}
