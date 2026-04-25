/**
 * Responsibility: synchronize shared result entry-phase maps so keyed card phases stay aligned
 * with the currently displayed list.
 * Out of scope: result-window switch timing, overlay presentation, and list fetching.
 */
import type { CardQueuePhase } from '../services/home-rail/homeRailResultWindow.service'

export const syncResultEntryPhaseMap = <T extends { id: string }>(
  items: T[],
  currentPhaseMap: Record<string, CardQueuePhase>,
  resolvePhase?: (item: T, currentPhase: CardQueuePhase) => CardQueuePhase
) => {
  return items.reduce<Record<string, CardQueuePhase>>((result, item) => {
    const currentPhase = currentPhaseMap[item.id] ?? 'steady'
    result[item.id] = resolvePhase ? resolvePhase(item, currentPhase) : currentPhase
    return result
  }, {})
}
