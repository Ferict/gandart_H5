/**
 * Responsibility: provide a compatibility bridge for legacy imports while the retained
 * priority-draw page migrates to the page-local runtime seam.
 * Out of scope: authoritative mock data storage, provider selection, and page rendering.
 */
export type {
  PriorityDrawCoverTone,
  PriorityDrawEventViewModel,
  PriorityDrawResultViewModel,
  PriorityDrawStatus,
} from './runtime/priority-draw.model'
import { resolvePriorityDrawEventListSnapshot } from './runtime/priority-draw.service'

export const priorityDrawEventList = resolvePriorityDrawEventListSnapshot()
