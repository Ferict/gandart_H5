/**
 * Responsibility: resolve and track the responsive home rail layout mode from viewport runtime
 * context so shell components can react to size-class changes.
 * Out of scope: viewport event binding internals, shell rendering, and rail content logic.
 */

import { onMounted, onUnmounted, ref } from 'vue'
import { HOME_LAYOUT_MODE_SINGLE_PAGE, type LayoutMode } from '../models/home-shell/homeShell.model'
import {
  bindHomeShellViewportListeners,
  type ViewportRuntimeContext,
  resolveHomeShellLayoutMode,
  resolveHomeShellViewportSnapshot,
} from '../services/home-shell/homeShellLayoutMode.service'

const hasRuntimeContextChanged = (
  current: ViewportRuntimeContext,
  next: ViewportRuntimeContext
): boolean => {
  if (current.viewportWidth !== next.viewportWidth) {
    return true
  }

  if (current.viewportHeight !== next.viewportHeight) {
    return true
  }

  if (current.safeAreaTop !== next.safeAreaTop) {
    return true
  }

  if (current.safeAreaBottom !== next.safeAreaBottom) {
    return true
  }

  if (current.hasVisualViewport !== next.hasVisualViewport) {
    return true
  }

  return false
}

export const useResponsiveRailLayout = () => {
  const layoutMode = ref<LayoutMode>(HOME_LAYOUT_MODE_SINGLE_PAGE)
  const runtimeContext = ref<ViewportRuntimeContext>({
    viewportWidth: 0,
    viewportHeight: 0,
    safeAreaTop: 0,
    safeAreaBottom: 0,
    hasVisualViewport: false,
  })
  let disposeViewportListeners: (() => void) | null = null

  const syncViewport = () => {
    if (typeof window === 'undefined') {
      return
    }

    const viewportSnapshot = resolveHomeShellViewportSnapshot(window)
    if (hasRuntimeContextChanged(runtimeContext.value, viewportSnapshot.runtimeContext)) {
      runtimeContext.value = viewportSnapshot.runtimeContext
    }

    const nextLayoutMode = resolveHomeShellLayoutMode(
      viewportSnapshot.runtimeContext.viewportWidth,
      layoutMode.value
    )

    if (layoutMode.value !== nextLayoutMode) {
      layoutMode.value = nextLayoutMode
    }
  }

  onMounted(() => {
    syncViewport()
    if (typeof window !== 'undefined') {
      disposeViewportListeners = bindHomeShellViewportListeners(window, syncViewport, {
        minIntervalMs: 80,
      })
    }
  })

  onUnmounted(() => {
    disposeViewportListeners?.()
    disposeViewportListeners = null
  })

  return {
    layoutMode,
    runtimeContext,
  }
}
