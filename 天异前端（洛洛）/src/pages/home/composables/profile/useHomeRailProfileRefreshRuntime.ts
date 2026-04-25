/**
 * Responsibility: co-locate profile rail reload coordinator and refresh presentation runtime wiring.
 * Out of scope: content lifecycle, result window, visual reveal, query state, and page template structure.
 */
import { useProfileAssetReloadCoordinator } from './useProfileAssetReloadCoordinator'
import { useProfilePagePresentationRuntime } from './useProfilePagePresentationRuntime'

type ProfileReloadCoordinatorOptions = Parameters<typeof useProfileAssetReloadCoordinator>[0]
type ProfilePagePresentationRuntimeOptions = Parameters<typeof useProfilePagePresentationRuntime>[0]

interface UseHomeRailProfileRefreshRuntimeOptions {
  resolveProfileAssetQuerySnapshot: ProfileReloadCoordinatorOptions['resolveProfileAssetQuerySnapshot']
  reloadRemoteProfileAssetList: ProfileReloadCoordinatorOptions['reloadRemoteProfileAssetList']
  hasResolvedRemoteProfileAssets: ProfileReloadCoordinatorOptions['hasResolvedRemoteProfileAssets']
  requestProfileAssetRefreshReplay: ProfileReloadCoordinatorOptions['requestProfileAssetRefreshReplay']
  applyResolvedProfileAssetList: ProfileReloadCoordinatorOptions['applyResolvedProfileAssetList']
  isProfileRefreshPresentationSettled: ProfilePagePresentationRuntimeOptions['isProfileRefreshPresentationSettled']
  refreshSettlePollIntervalMs: ProfilePagePresentationRuntimeOptions['refreshSettlePollIntervalMs']
}

export const useHomeRailProfileRefreshRuntime = (
  options: UseHomeRailProfileRefreshRuntimeOptions
) => {
  const { reloadProfileAssetListAndApply } = useProfileAssetReloadCoordinator({
    resolveProfileAssetQuerySnapshot: options.resolveProfileAssetQuerySnapshot,
    reloadRemoteProfileAssetList: options.reloadRemoteProfileAssetList,
    hasResolvedRemoteProfileAssets: options.hasResolvedRemoteProfileAssets,
    requestProfileAssetRefreshReplay: options.requestProfileAssetRefreshReplay,
    applyResolvedProfileAssetList: options.applyResolvedProfileAssetList,
  })

  const {
    profileRefreshRunId,
    beginProfileRefreshRun,
    clearStagedAssetListUpdate,
    stageAssetListUpdate,
    consumeStagedAssetListUpdate,
    startProfilePullRefreshPresentation,
    waitForProfileRefreshPresentationSettled,
    markProfileRefreshPresentationCancelled,
    waitForRefreshPresentation,
    resetProfileRuntimeForInactive,
    disposeProfileRuntime,
  } = useProfilePagePresentationRuntime({
    isProfileRefreshPresentationSettled: options.isProfileRefreshPresentationSettled,
    refreshSettlePollIntervalMs: options.refreshSettlePollIntervalMs,
  })

  return {
    profileRefreshRunId,
    beginProfileRefreshRun,
    clearStagedAssetListUpdate,
    stageAssetListUpdate,
    consumeStagedAssetListUpdate,
    startProfilePullRefreshPresentation,
    waitForProfileRefreshPresentationSettled,
    reloadProfileAssetListAndApply,
    markProfileRefreshPresentationCancelled,
    waitForRefreshPresentation,
    resetProfileRuntimeForInactive,
    disposeProfileRuntime,
  }
}
