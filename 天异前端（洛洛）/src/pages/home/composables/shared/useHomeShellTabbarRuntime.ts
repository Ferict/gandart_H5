/**
 * Responsibility: host HomeShellTabbar preview-state runtime, touch timers, and indicator
 * positioning without changing the component emit contract.
 * Out of scope: tab activity flag source resolution, shell page state, and tabbar styling.
 */

import { computed, onBeforeUnmount, ref, type CSSProperties } from 'vue'
import {
  HOME_ACTIVITY_PAGE_KEY,
  HOME_PRIMARY_PAGE_KEY,
  HOME_PROFILE_PAGE_KEY,
  type PageKey,
} from '../../../../models/home-shell/homeShell.model'
import type { HomeShellTabActivityFlags } from '../../../../services/home-shell/homeShellState.service'

interface UseHomeShellTabbarRuntimeOptions {
  resolveTabActivityFlags: () => HomeShellTabActivityFlags
  emitChangeTab: (tab: PageKey) => void
}

const PREVIEW_TOUCH_DELAY = 180

export const useHomeShellTabbarRuntime = ({
  resolveTabActivityFlags,
  emitChangeTab,
}: UseHomeShellTabbarRuntimeOptions) => {
  const previewTab = ref<PageKey | null>(null)
  let previewTouchTimer: ReturnType<typeof setTimeout> | null = null
  let previewTouchToken = 0

  const activeTabIndex = computed(() => {
    const tabActivityFlags = resolveTabActivityFlags()
    if (tabActivityFlags.isActivityTabActive) {
      return 1
    }
    if (tabActivityFlags.isProfileTabActive) {
      return 2
    }
    return 0
  })

  const previewTabIndex = computed(() => {
    if (previewTab.value === HOME_ACTIVITY_PAGE_KEY) {
      return 1
    }
    if (previewTab.value === HOME_PROFILE_PAGE_KEY) {
      return 2
    }
    if (previewTab.value === HOME_PRIMARY_PAGE_KEY) {
      return 0
    }
    return -1
  })

  const indicatorRailStyle = computed<CSSProperties>(() => {
    return {
      transform: `translateX(${activeTabIndex.value * 100}%)`,
    } as CSSProperties
  })

  const previewRailStyle = computed<CSSProperties>(() => {
    const hasPreview = previewTabIndex.value >= 0 && previewTabIndex.value !== activeTabIndex.value
    return {
      transform: `translateX(${Math.max(previewTabIndex.value, 0) * 100}%)`,
      opacity: hasPreview ? '1' : '0',
    } as CSSProperties
  })

  const isTabActive = (tab: PageKey): boolean => {
    const tabActivityFlags = resolveTabActivityFlags()
    if (tab === HOME_PRIMARY_PAGE_KEY) {
      return tabActivityFlags.isHomeTabActive
    }
    if (tab === HOME_ACTIVITY_PAGE_KEY) {
      return tabActivityFlags.isActivityTabActive
    }
    return tabActivityFlags.isProfileTabActive
  }

  const clearPreviewTouchTimer = () => {
    if (!previewTouchTimer) {
      return
    }

    clearTimeout(previewTouchTimer)
    previewTouchTimer = null
  }

  const clearPreview = () => {
    previewTab.value = null
  }

  const handlePreviewEnter = (tab: PageKey) => {
    if (isTabActive(tab)) {
      clearPreview()
      return
    }

    previewTab.value = tab
  }

  const handlePreviewLeave = () => {
    clearPreviewTouchTimer()
    clearPreview()
  }

  const handlePreviewTouchStart = (tab: PageKey) => {
    previewTouchToken += 1
    const currentPreviewTouchToken = previewTouchToken
    clearPreviewTouchTimer()
    clearPreview()
    if (isTabActive(tab)) {
      return
    }

    previewTouchTimer = setTimeout(() => {
      if (currentPreviewTouchToken !== previewTouchToken) {
        previewTouchTimer = null
        return
      }

      previewTab.value = tab
      previewTouchTimer = null
    }, PREVIEW_TOUCH_DELAY)
  }

  const handlePreviewTouchMove = () => {
    previewTouchToken += 1
    clearPreviewTouchTimer()
    clearPreview()
  }

  const handlePreviewTouchEnd = () => {
    previewTouchToken += 1
    clearPreviewTouchTimer()
    clearPreview()
  }

  const handleChangeTab = (tab: PageKey) => {
    previewTouchToken += 1
    clearPreviewTouchTimer()
    clearPreview()
    emitChangeTab(tab)
  }

  onBeforeUnmount(() => {
    clearPreviewTouchTimer()
  })

  return {
    previewTab,
    indicatorRailStyle,
    previewRailStyle,
    handlePreviewEnter,
    handlePreviewLeave,
    handlePreviewTouchStart,
    handlePreviewTouchMove,
    handlePreviewTouchEnd,
    handleChangeTab,
  }
}
