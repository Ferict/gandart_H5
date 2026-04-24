/**
 * Responsibility: own the shared home-shell tab, drawer, and layout state transitions used by
 * the top-level home page and standalone secondary-page scaffold.
 * Out of scope: rail data fetching, page presentation runtime, and drawer content projection.
 */

import { computed, onUnmounted, ref, watch, type Ref } from 'vue'
import {
  HOME_ACTIVITY_PAGE_KEY,
  HOME_PRIMARY_PAGE_KEY,
  type LayoutMode,
  type PageKey,
} from '../models/home-shell/homeShell.model'
import type { ActivityDateFilterRange } from '../models/home-rail/homeRailActivity.model'
import {
  clearHomeShellDocumentScrollLock,
  syncHomeShellDocumentScrollLock,
} from '../services/home-shell/homeShellDom.service'
import {
  resolveHomeShellDerivedState,
  resolveHomeShellStateOnTabChange,
  resolveHomeShellStateOnLayoutChange,
} from '../services/home-shell/homeShellState.service'
import {
  formatActivityDateFilterLabel,
  normalizeActivityDateFilterRange,
} from '../utils/activityDateFilter.util'

interface UseHomeShellStateInput {
  layoutMode: Ref<LayoutMode>
}

export const useHomeShellState = (input: UseHomeShellStateInput) => {
  const activePage = ref<PageKey>(HOME_PRIMARY_PAGE_KEY)
  const isDrawerOpen = ref(false)
  const isActivityDateFilterOpen = ref(false)
  const activityDateFilterRange = ref<ActivityDateFilterRange>(null)
  const homeShellDerivedState = computed(() => {
    return resolveHomeShellDerivedState(input.layoutMode.value, activePage.value)
  })

  const isDrawerLayerOpen = computed(() => {
    return homeShellDerivedState.value.canUseDrawer && isDrawerOpen.value
  })

  const activityDateFilterLabel = computed(() => {
    return formatActivityDateFilterLabel(activityDateFilterRange.value)
  })

  const isActivityDateFilterLayerOpen = computed(() => {
    return activePage.value === HOME_ACTIVITY_PAGE_KEY && isActivityDateFilterOpen.value
  })

  const isShellOverlayOpen = computed(() => {
    return isDrawerLayerOpen.value || isActivityDateFilterLayerOpen.value
  })

  const handleDrawerOpen = () => {
    if (!homeShellDerivedState.value.canUseDrawer) {
      return
    }

    isActivityDateFilterOpen.value = false
    isDrawerOpen.value = true
  }

  const handleDrawerClose = () => {
    isDrawerOpen.value = false
  }

  const handleActivityDateFilterOpen = () => {
    if (activePage.value !== HOME_ACTIVITY_PAGE_KEY) {
      return
    }
    isDrawerOpen.value = false
    isActivityDateFilterOpen.value = true
  }

  const handleActivityDateFilterClose = () => {
    isActivityDateFilterOpen.value = false
  }

  const handleActivityDateFilterApply = (range: ActivityDateFilterRange) => {
    activityDateFilterRange.value = normalizeActivityDateFilterRange(range)
    isActivityDateFilterOpen.value = false
  }

  const handleActivityDateFilterReset = () => {
    activityDateFilterRange.value = null
    isActivityDateFilterOpen.value = false
  }

  const handleTabChange = (tab: PageKey) => {
    const tabTransition = resolveHomeShellStateOnTabChange({
      nextTab: tab,
    })

    if (activePage.value !== tabTransition.nextActivePage) {
      activePage.value = tabTransition.nextActivePage
    }

    if (tabTransition.nextActivePage !== HOME_ACTIVITY_PAGE_KEY) {
      isActivityDateFilterOpen.value = false
    }
  }

  watch(input.layoutMode, (nextMode) => {
    const layoutTransition = resolveHomeShellStateOnLayoutChange({
      nextLayoutMode: nextMode,
    })

    if (layoutTransition.shouldCloseDrawer) {
      isDrawerOpen.value = false
    }
  })

  watch(
    isShellOverlayOpen,
    () => {
      syncHomeShellDocumentScrollLock(isShellOverlayOpen.value)
    },
    { immediate: true }
  )

  onUnmounted(() => {
    clearHomeShellDocumentScrollLock()
  })

  return {
    isDrawerLayerOpen,
    isActivityDateFilterLayerOpen,
    activityDateFilterRange,
    activityDateFilterLabel,
    homeShellDerivedState,
    handleDrawerOpen,
    handleDrawerClose,
    handleActivityDateFilterOpen,
    handleActivityDateFilterClose,
    handleActivityDateFilterApply,
    handleActivityDateFilterReset,
    handleTabChange,
  }
}
