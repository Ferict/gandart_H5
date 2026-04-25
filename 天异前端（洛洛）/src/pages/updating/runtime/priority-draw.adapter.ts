/**
 * Responsibility: adapt retained priority-draw provider DTOs into the stable page view model.
 * Out of scope: provider selection, page rendering, and navigation side effects.
 */
import type { PriorityDrawArchiveDto, PriorityDrawEventDto } from './priority-draw.port'
import type { PriorityDrawEventViewModel } from './priority-draw.model'

export const adaptPriorityDrawEvent = (
  input: PriorityDrawEventDto
): PriorityDrawEventViewModel => ({
  id: input.id,
  title: input.title,
  status: input.status,
  coverImageUrl: input.coverImageUrl,
  timeRange: input.timeRange,
  condition: input.condition,
  quota: input.quota,
  participants: input.participants,
  isEligible: input.isEligible,
  coverTone: input.coverTone,
  coverIcon: input.coverIcon,
})

export const adaptPriorityDrawArchive = (
  input: PriorityDrawArchiveDto
): PriorityDrawEventViewModel[] => input.events.map(adaptPriorityDrawEvent)
