/**
 * Responsibility: expose the retained priority-draw page-local runtime state through a stable view-model seam.
 * Out of scope: visual rendering, navigation dispatch, and transport/provider bootstrap policy.
 */
import { ref } from 'vue'
import {
  loadPriorityDrawEventListSnapshot,
  resolvePriorityDrawEventListSnapshot,
} from './priority-draw.service'

export const usePriorityDrawRuntime = () => {
  const priorityDrawEventList = ref(resolvePriorityDrawEventListSnapshot())
  const isPriorityDrawLoading = ref(false)

  const refreshPriorityDrawEventList = async () => {
    isPriorityDrawLoading.value = true

    try {
      priorityDrawEventList.value = await loadPriorityDrawEventListSnapshot()
    } finally {
      isPriorityDrawLoading.value = false
    }
  }

  void refreshPriorityDrawEventList()

  return {
    priorityDrawEventList,
    isPriorityDrawLoading,
    refreshPriorityDrawEventList,
  }
}
