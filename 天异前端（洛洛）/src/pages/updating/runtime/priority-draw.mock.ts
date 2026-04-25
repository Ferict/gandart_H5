/**
 * Responsibility: satisfy the retained priority-draw page-local provider seam from in-repo mock data.
 * Out of scope: page rendering, runtime orchestration, and formal backend transport behavior.
 */
import { clonePriorityDrawEventDb } from '../../../mocks/updating-db/priority-draw'
import type { PriorityDrawArchiveDto, PriorityDrawPort } from './priority-draw.port'

export const createPriorityDrawArchiveSnapshot = (): PriorityDrawArchiveDto => ({
  events: clonePriorityDrawEventDb(),
})

export const priorityDrawMockPort: PriorityDrawPort = {
  getArchive: () => createPriorityDrawArchiveSnapshot(),
}
