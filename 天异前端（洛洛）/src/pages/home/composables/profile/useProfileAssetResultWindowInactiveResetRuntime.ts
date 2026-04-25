/**
 * Responsibility: own inactive reset and disposal cleanup for the profile asset
 * result-window runtime without touching switch/render decisions.
 * Out of scope: replay bookkeeping, enter sequencing, and geometry syncing.
 */
import type { Ref } from 'vue'
import type { ResultWindowDiff } from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetRevealPhase } from './useProfileAssetVisualReveal'

interface UseProfileAssetResultWindowInactiveResetRuntimeOptions {
  queuedProfileAssetSwitch: Ref<ProfileAssetItem[] | null>
  pendingProfileAssetWindowDiff: Ref<ResultWindowDiff<ProfileAssetItem> | null>
  profileAssetPlaceholderIdSet: Ref<Set<string>>
  profileAssetTransitionPhase: Ref<'idle' | 'entering'>
  handledProfileAssetRefreshReplayRequestId: Ref<number>
  profileAssetRefreshReplayRequestId: Ref<number>
  profileAssetRevealPhaseMap: Ref<Record<string, ProfileAssetRevealPhase>>
  clearProfileAssetMountWindowSyncRaf: () => void
  releaseProfileAssetResultsStageMinHeight: () => void
  clearProfileAssetEnterMotionTimeout: () => void
  clearProfileAssetQueuedInsertTimeouts: () => void
  clearProfileAssetRemovedOverlayItems: () => void
  clearMountedProfileAssetWindow: () => void
  clearProfileAssetRevealTimeouts: () => void
  setProfileAssetRevealPhaseMap: (phaseMap: Record<string, ProfileAssetRevealPhase>) => void
}

export const useProfileAssetResultWindowInactiveResetRuntime = (
  options: UseProfileAssetResultWindowInactiveResetRuntimeOptions
) => {
  const normalizeRevealPhaseMapForInactive = () => {
    return Object.fromEntries(
      Object.entries(options.profileAssetRevealPhaseMap.value).map(([itemId, phase]) => [
        itemId,
        phase === 'reveal-scan' ? 'icon' : phase,
      ])
    )
  }

  const resetProfileResultWindowForInactive = () => {
    options.clearProfileAssetMountWindowSyncRaf()
    options.releaseProfileAssetResultsStageMinHeight()
    options.clearProfileAssetEnterMotionTimeout()
    options.clearProfileAssetQueuedInsertTimeouts()
    options.clearProfileAssetRemovedOverlayItems()
    options.profileAssetPlaceholderIdSet.value = new Set()
    options.clearMountedProfileAssetWindow()
    options.queuedProfileAssetSwitch.value = null
    options.pendingProfileAssetWindowDiff.value = null
    options.handledProfileAssetRefreshReplayRequestId.value =
      options.profileAssetRefreshReplayRequestId.value
    options.clearProfileAssetRevealTimeouts()
    options.setProfileAssetRevealPhaseMap(normalizeRevealPhaseMapForInactive())
  }

  const disposeProfileAssetResultWindow = () => {
    resetProfileResultWindowForInactive()
  }

  return {
    resetProfileResultWindowForInactive,
    disposeProfileAssetResultWindow,
  }
}
