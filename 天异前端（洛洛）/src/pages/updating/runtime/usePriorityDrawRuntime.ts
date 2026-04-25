/**
 * Responsibility: expose the retained priority-draw page-local runtime state through a stable view-model seam.
 * Out of scope: visual rendering, navigation dispatch, and transport/provider bootstrap policy.
 */
import { ref } from 'vue'
import { resolvePriorityDrawEventListSnapshot } from './priority-draw.service'

export const usePriorityDrawRuntime = () => {
  const priorityDrawEventList = ref(resolvePriorityDrawEventListSnapshot())

  return {
    priorityDrawEventList,
  }
}
