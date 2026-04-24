/**
 * Responsibility: host HomeShellDrawer entry hydration, delayed navigation, and mount/unmount
 * cleanup without changing the drawer component contract.
 * Out of scope: drawer entry source construction, shell layout state, and drawer presentation.
 */

import { onBeforeUnmount, onMounted } from 'vue'
import {
  ensureHomeShellMenuReminderHydrated,
  useResolvedHomeShellDrawerEntries,
} from '../../../../services/home-shell/homeShellMenuState.service'

interface UseHomeShellDrawerRuntimeOptions {
  emitClose: () => void
}

export const useHomeShellDrawerRuntime = ({ emitClose }: UseHomeShellDrawerRuntimeOptions) => {
  const drawerEntries = useResolvedHomeShellDrawerEntries()
  let activateTimerId: ReturnType<typeof setTimeout> | null = null
  let isComponentAlive = true

  const clearActivateTimer = () => {
    if (!activateTimerId) {
      return
    }
    clearTimeout(activateTimerId)
    activateTimerId = null
  }

  const handleEntryActivate = (routeUrl: string) => {
    clearActivateTimer()
    emitClose()
    activateTimerId = setTimeout(() => {
      if (!isComponentAlive) {
        return
      }
      activateTimerId = null
      uni.navigateTo({ url: routeUrl })
    }, 40)
  }

  onMounted(() => {
    isComponentAlive = true
    void ensureHomeShellMenuReminderHydrated()
  })

  onBeforeUnmount(() => {
    isComponentAlive = false
    clearActivateTimer()
  })

  return {
    drawerEntries,
    handleEntryActivate,
  }
}
