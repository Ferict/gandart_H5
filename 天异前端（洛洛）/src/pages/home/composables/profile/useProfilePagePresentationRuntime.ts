/**
 * Responsibility: host profile-page refresh presentation runtime, including staged asset-list
 * updates and settle-aware refresh run bookkeeping.
 * Out of scope: result-window timing, remote-list fetching, and profile scene/query orchestration.
 */
import { ref } from 'vue'
import { useRefreshPresentationRuntime } from '../shared/useRefreshPresentationRuntime'
import type { HomeRailProfileAssetListResult } from '../../../../services/home-rail/homeRailProfileContent.service'

export interface StagedProfileAssetListUpdate {
  querySignature: string
  payload: HomeRailProfileAssetListResult
  origin: 'visible-update' | 'activation-apply'
}

interface UseProfilePagePresentationRuntimeOptions {
  isProfileRefreshPresentationSettled: (targetReplayRequestId: number) => boolean
  refreshSettlePollIntervalMs: number
}

export const useProfilePagePresentationRuntime = ({
  isProfileRefreshPresentationSettled,
  refreshSettlePollIntervalMs,
}: UseProfilePagePresentationRuntimeOptions) => {
  const profileRefreshRunId = ref(0)
  const refreshPresentationRuntime = useRefreshPresentationRuntime()
  const stagedAssetListUpdate = ref<StagedProfileAssetListUpdate | null>(null)

  const beginProfileRefreshRun = () => {
    const refreshRunId = profileRefreshRunId.value + 1
    profileRefreshRunId.value = refreshRunId
    return refreshRunId
  }

  const clearStagedAssetListUpdate = () => {
    stagedAssetListUpdate.value = null
  }

  const stageAssetListUpdate = (
    querySignature: string,
    payload: HomeRailProfileAssetListResult,
    origin: StagedProfileAssetListUpdate['origin']
  ) => {
    stagedAssetListUpdate.value = {
      querySignature,
      payload,
      origin,
    }
  }

  const consumeStagedAssetListUpdate = (currentQuerySignature: string) => {
    const stagedUpdate = stagedAssetListUpdate.value
    if (!stagedUpdate) {
      return null
    }

    stagedAssetListUpdate.value = null
    if (stagedUpdate.querySignature !== currentQuerySignature) {
      return null
    }

    return stagedUpdate
  }

  const markProfileRefreshPresentationCancelled =
    refreshPresentationRuntime.markRefreshPresentationCancelled

  const waitForProfileRefreshPresentationSettled = async (
    targetReplayRequestId: number,
    targetPresentationRunId: number
  ) => {
    await refreshPresentationRuntime.waitForRefreshPresentationSettled({
      targetRunId: targetPresentationRunId,
      isSettled: () => isProfileRefreshPresentationSettled(targetReplayRequestId),
      pollIntervalMs: refreshSettlePollIntervalMs,
    })
  }

  const startProfilePullRefreshPresentation = (
    runner: (presentationRunId: number) => Promise<void>
  ) => {
    void refreshPresentationRuntime.startRefreshPresentation((presentationRunId) =>
      runner(presentationRunId)
    )
  }

  const waitForRefreshPresentation = () => {
    return refreshPresentationRuntime.waitForRefreshPresentation()
  }

  const resetProfileRuntimeForInactive = () => {
    refreshPresentationRuntime.resetRefreshPresentationRuntimeForInactive()
    clearStagedAssetListUpdate()
  }

  const disposeProfileRuntime = () => {
    resetProfileRuntimeForInactive()
  }

  return {
    profileRefreshRunId,
    beginProfileRefreshRun,
    clearStagedAssetListUpdate,
    stageAssetListUpdate,
    consumeStagedAssetListUpdate,
    startProfilePullRefreshPresentation,
    markProfileRefreshPresentationCancelled,
    waitForProfileRefreshPresentationSettled,
    waitForRefreshPresentation,
    resetProfileRuntimeForInactive,
    disposeProfileRuntime,
  }
}
