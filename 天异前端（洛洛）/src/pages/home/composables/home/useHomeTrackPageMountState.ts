/**
 * Responsibility: host the home track page mount-state shell, including active-page mount flags,
 * refresh visual resets, and viewport snapshot sync sequencing.
 * Out of scope: panel content runtime, result-window behavior, and layout-derived presentation.
 */
import { computed, ref, watch, type ComputedRef } from 'vue'
import type { PageKey } from '../../../../models/home-shell/homeShell.model'

interface UseHomeTrackPageMountStateOptions {
  activePageKey: ComputedRef<PageKey>
  pageKeys: readonly PageKey[]
  homePageKey: PageKey
  activityPageKey: PageKey
  profilePageKey: PageKey
  resetTrackRefresherVisualState: (pageKey: PageKey) => void
  clearHomeTrackScrolled: () => void
  syncTrackViewportSnapshot: (pageKey: PageKey) => void
  reconcileHomeTrackScrolled: () => void
  nextTickFn: () => Promise<void>
}

export const useHomeTrackPageMountState = ({
  activePageKey,
  pageKeys,
  homePageKey,
  activityPageKey,
  profilePageKey,
  resetTrackRefresherVisualState,
  clearHomeTrackScrolled,
  syncTrackViewportSnapshot,
  reconcileHomeTrackScrolled,
  nextTickFn,
}: UseHomeTrackPageMountStateOptions) => {
  const hasMountedHomePage = ref(activePageKey.value === homePageKey)
  const hasMountedActivityPage = ref(activePageKey.value === activityPageKey)
  const hasMountedProfilePage = ref(activePageKey.value === profilePageKey)
  let mountSyncRunId = 0

  const shouldMountHomePage = computed(() => {
    return hasMountedHomePage.value || activePageKey.value === homePageKey
  })
  const shouldMountActivityPage = computed(() => {
    return hasMountedActivityPage.value || activePageKey.value === activityPageKey
  })
  const shouldMountProfilePage = computed(() => {
    return hasMountedProfilePage.value || activePageKey.value === profilePageKey
  })

  watch(
    activePageKey,
    (nextActivePageKey, previousActivePageKey) => {
      mountSyncRunId += 1
      const currentRunId = mountSyncRunId
      const queueMountSync = (pageKey: PageKey, syncTask: () => void) => {
        void nextTickFn().then(() => {
          if (currentRunId !== mountSyncRunId) {
            return
          }
          if (activePageKey.value !== pageKey) {
            return
          }
          syncTask()
        })
      }

      pageKeys.forEach((pageKey) => {
        resetTrackRefresherVisualState(pageKey)
      })
      if (nextActivePageKey !== homePageKey) {
        clearHomeTrackScrolled()
      }
      if (nextActivePageKey === homePageKey) {
        hasMountedHomePage.value = true
        const shouldReconcileHomeScrolled =
          previousActivePageKey !== undefined && previousActivePageKey !== homePageKey
        queueMountSync(homePageKey, () => {
          syncTrackViewportSnapshot(homePageKey)
          if (shouldReconcileHomeScrolled) {
            reconcileHomeTrackScrolled()
          }
        })
        return
      }

      if (nextActivePageKey === activityPageKey) {
        hasMountedActivityPage.value = true
        queueMountSync(activityPageKey, () => {
          syncTrackViewportSnapshot(activityPageKey)
        })
        return
      }

      if (nextActivePageKey === profilePageKey) {
        hasMountedProfilePage.value = true
        queueMountSync(profilePageKey, () => {
          syncTrackViewportSnapshot(profilePageKey)
        })
      }
    },
    { immediate: true }
  )

  return {
    shouldMountHomePage,
    shouldMountActivityPage,
    shouldMountProfilePage,
  }
}
