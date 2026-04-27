/**
 * Responsibility: adapt retained priority-draw provider DTOs into the stable page view model.
 * Out of scope: provider selection, page rendering, and navigation side effects.
 */
import type { PriorityDrawArchiveDto, PriorityDrawEventDto } from './priority-draw.port'
import type {
  PriorityDrawEventViewModel,
  PriorityDrawPrizeItemViewModel,
  PriorityDrawPrizePoolViewModel,
} from './priority-draw.model'

const adaptPriorityDrawPrizeItem = (
  input: PriorityDrawPrizeItemViewModel
): PriorityDrawPrizeItemViewModel => ({
  id: input.id,
  name: input.name,
  type: input.type,
  quantity: input.quantity,
  coverImageUrl: input.coverImageUrl,
})

const adaptPriorityDrawPrizePool = (
  input: PriorityDrawPrizePoolViewModel
): PriorityDrawPrizePoolViewModel => ({
  id: input.id,
  tierName: input.tierName,
  quotaLabel: input.quotaLabel,
  items: input.items.map(adaptPriorityDrawPrizeItem),
})

const normalizeRemainingDrawCount = (value: number | undefined, isEligible: boolean) => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return Math.max(0, Math.trunc(value))
  }

  return isEligible ? 1 : 0
}

export const adaptPriorityDrawEvent = (input: PriorityDrawEventDto): PriorityDrawEventViewModel => {
  const remainingDrawCount = normalizeRemainingDrawCount(input.remainingDrawCount, input.isEligible)

  return {
    id: input.id,
    lotteryId: input.lotteryId,
    title: input.title,
    status: input.status,
    coverImageUrl: input.coverImageUrl,
    timeRange: input.timeRange,
    timeline: {
      startTime: input.timeline.startTime,
      endTime: input.timeline.endTime,
      countdownLabel: input.timeline.countdownLabel,
    },
    condition: input.condition,
    remainingDrawCount,
    quota: input.quota,
    participants: input.participants,
    isEligible: input.isEligible,
    coverTone: input.coverTone,
    coverIcon: input.coverIcon,
    prizePools: input.prizePools.map(adaptPriorityDrawPrizePool),
    rules: [...input.rules],
    result: {
      status: input.result.status,
      title: input.result.title,
      subtitle: input.result.subtitle,
      description: input.result.description,
      actionLabel: input.result.actionLabel,
      prizeItems: input.result.prizeItems.map(adaptPriorityDrawPrizeItem),
      supportLabel: input.result.supportLabel,
    },
  }
}

export const adaptPriorityDrawArchive = (
  input: PriorityDrawArchiveDto
): PriorityDrawEventViewModel[] => input.events.map(adaptPriorityDrawEvent)
