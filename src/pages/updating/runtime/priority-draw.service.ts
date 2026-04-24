/**
 * Responsibility: provide the unified page-local service seam for retained priority-draw content.
 * Out of scope: global provider bootstrap policy, page rendering, and formal content-domain calls.
 */
import { adaptPriorityDrawArchive } from './priority-draw.adapter'
import { priorityDrawMockPort } from './priority-draw.mock'
import type { PriorityDrawEventViewModel } from './priority-draw.model'
import type { PriorityDrawPort } from './priority-draw.port'

let activePriorityDrawPort: PriorityDrawPort = priorityDrawMockPort

export const setPriorityDrawPort = (port: PriorityDrawPort) => {
  activePriorityDrawPort = port
}

export const resetPriorityDrawPort = () => {
  activePriorityDrawPort = priorityDrawMockPort
}

export const resolvePriorityDrawEventListSnapshot = (): PriorityDrawEventViewModel[] => {
  return adaptPriorityDrawArchive(activePriorityDrawPort.getArchive())
}
