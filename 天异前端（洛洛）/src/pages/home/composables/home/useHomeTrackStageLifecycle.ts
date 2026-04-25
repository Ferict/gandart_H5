/**
 * Responsibility: host HomeShellTrackStage mount and unmount side effects, including update
 * coordinator lifecycle and viewport snapshot sync bootstrap.
 * Out of scope: track refresh state, page mount-state bookkeeping, and layout-derived view state.
 */

import { onBeforeUnmount, onMounted } from 'vue'
import {
  startHomeRailUpdateCoordinator,
  stopHomeRailUpdateCoordinator,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'

interface UseHomeTrackStageLifecycleOptions {
  nextTickFn: () => Promise<void>
  syncTrackViewportSnapshotForAllPages: () => void
  disposeProfileScrollBridge: () => void
}

export const useHomeTrackStageLifecycle = ({
  nextTickFn,
  syncTrackViewportSnapshotForAllPages,
  disposeProfileScrollBridge,
}: UseHomeTrackStageLifecycleOptions) => {
  const handleTrackViewportResize = () => {
    syncTrackViewportSnapshotForAllPages()
  }

  onMounted(() => {
    startHomeRailUpdateCoordinator()
    void nextTickFn().then(() => {
      syncTrackViewportSnapshotForAllPages()
    })
    window.addEventListener('resize', handleTrackViewportResize, { passive: true })
  })

  onBeforeUnmount(() => {
    stopHomeRailUpdateCoordinator()
    disposeProfileScrollBridge()
    window.removeEventListener('resize', handleTrackViewportResize)
  })
}
