/**
 * Responsibility: host HomeShellTrackStage ref ownership, including panel refs, scroll-view
 * refs, and page-key-based resolver helpers.
 * Out of scope: refresh controller state, mount lifecycle side effects, and layout projection.
 */

import { ref } from 'vue'
import {
  HOME_ACTIVITY_PAGE_KEY,
  HOME_PRIMARY_PAGE_KEY,
  type PageKey,
} from '../../../../models/home-shell/homeShell.model'
import type { HomeTrackRefreshHandle } from './useHomeTrackRefreshController'

export const useHomeTrackStageRefs = () => {
  const homePanelRef = ref<HomeTrackRefreshHandle | null>(null)
  const activityPanelRef = ref<HomeTrackRefreshHandle | null>(null)
  const profilePanelRef = ref<HomeTrackRefreshHandle | null>(null)
  const homeScrollViewRef = ref<unknown>(null)
  const activityScrollViewRef = ref<unknown>(null)
  const profileScrollViewRef = ref<unknown>(null)

  const resolveTrackRefreshHandle = (pageKey: PageKey): HomeTrackRefreshHandle | null => {
    if (pageKey === HOME_PRIMARY_PAGE_KEY) {
      return homePanelRef.value
    }

    if (pageKey === HOME_ACTIVITY_PAGE_KEY) {
      return activityPanelRef.value
    }

    return profilePanelRef.value
  }

  const resolveTrackScrollViewRef = (pageKey: PageKey) => {
    if (pageKey === HOME_PRIMARY_PAGE_KEY) {
      return homeScrollViewRef.value
    }

    if (pageKey === HOME_ACTIVITY_PAGE_KEY) {
      return activityScrollViewRef.value
    }

    return profileScrollViewRef.value
  }

  return {
    homePanelRef,
    activityPanelRef,
    profilePanelRef,
    homeScrollViewRef,
    activityScrollViewRef,
    profileScrollViewRef,
    resolveTrackRefreshHandle,
    resolveTrackScrollViewRef,
  }
}
