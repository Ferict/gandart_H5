/**
 * Responsibility: co-locate profile rail asset result-stage view state, visual reveal, and result window wiring.
 * Out of scope: query state, refresh lifecycle, load-more coordination, and page template structure.
 */
import { useHomeRailProfileViewState } from './useHomeRailProfileViewState'
import { useProfileAssetResultWindow } from './useProfileAssetResultWindow'
import { useProfileAssetVisualReveal } from './useProfileAssetVisualReveal'

type ProfileViewStateOptions = Parameters<typeof useHomeRailProfileViewState>[0]
type ProfileResultWindowOptions = Parameters<typeof useProfileAssetResultWindow>[0]

interface UseHomeRailProfileAssetResultRuntimeOptions {
  viewState: ProfileViewStateOptions
  isPanelActive: ProfileResultWindowOptions['isPanelActive']
  hasResolvedInitialProfileContent: ProfileResultWindowOptions['hasResolvedInitialProfileContent']
  mountScrollMetrics: ProfileResultWindowOptions['mountScrollMetrics']
  isRemoteProfileAssetsLoading: ProfileResultWindowOptions['isRemoteProfileAssetsLoading']
  revealScanDurationMs: number
  layout: ProfileResultWindowOptions['layout']
  motion: ProfileResultWindowOptions['motion']
}

export const useHomeRailProfileAssetResultRuntime = (
  options: UseHomeRailProfileAssetResultRuntimeOptions
) => {
  const {
    mountedProfileAssetsRef,
    profileAssetPlaceholderIdSetRef,
    profileAssetVisibleCount,
    isProfileAssetLoadMoreRunning,
    resolvedProfileAssetSource,
    visibleAssets,
    profileCategoryTrackStyle,
    profileCategoryIndicatorStyle,
    resolvedProfileAssetTotal,
  } = useHomeRailProfileViewState(options.viewState)

  const profileVisualReveal = useProfileAssetVisualReveal({
    mountedAssets: mountedProfileAssetsRef,
    isPanelActive: options.isPanelActive,
    isProfileAssetPlaceholder: (itemId) => profileAssetPlaceholderIdSetRef.value.has(itemId),
    revealScanDurationMs: options.revealScanDurationMs,
  })

  const {
    resolveProfileAssetImageUrl,
    resolveProfileAssetPlaceholderIcon,
    resolveProfileAssetRevealPhase,
    resolveProfileAssetRemovedOverlayRevealPhase,
    handleProfileAssetVisualImageLoad,
    handleProfileAssetVisualImageError,
    handleProfileAssetVisualImageRetrying,
  } = profileVisualReveal

  const {
    displayedAssets,
    mountedAssets,
    pendingAssets,
    profileAssetRefreshReplayRequestId,
    profileAssetResultsStageRef,
    profileAssetTopSpacerHeight,
    profileAssetBottomSpacerHeight,
    profileAssetRemovedOverlayItems,
    profileAssetResultsStageStyle,
    profileAssetRemovedOverlayLayerStyle,
    visibleProfileAssetStructureSignature,
    visibleProfileAssetContentSignature,
    shouldShowProfileBottomEndline,
    isProfileAssetPlaceholder,
    resolveProfileAssetEntryClass,
    resolveProfileAssetEntryStyle,
    resolveProfileAssetRemovedOverlayItemStyle,
    syncMountedProfileAssetWindow,
    scheduleProfileAssetMountWindowSync,
    requestProfileAssetRefreshReplay,
    applyResolvedProfileAssetList,
    startProfileAssetResultSwitch,
    reconcileProfileAssetRender,
    isProfileRefreshPresentationSettled,
    resetProfileAssetProjection,
    resetProfileResultWindowForInactive,
    disposeProfileAssetResultWindow,
  } = useProfileAssetResultWindow({
    isPanelActive: options.isPanelActive,
    hasResolvedInitialProfileContent: options.hasResolvedInitialProfileContent,
    mountScrollMetrics: options.mountScrollMetrics,
    visibleAssets,
    resolvedProfileAssetTotal,
    isRemoteProfileAssetsLoading: options.isRemoteProfileAssetsLoading,
    mountedAssetsRef: mountedProfileAssetsRef,
    placeholderIdSetRef: profileAssetPlaceholderIdSetRef,
    visual: profileVisualReveal,
    layout: options.layout,
    motion: options.motion,
  })

  return {
    mountedProfileAssetsRef,
    profileAssetPlaceholderIdSetRef,
    profileAssetVisibleCount,
    isProfileAssetLoadMoreRunning,
    resolvedProfileAssetSource,
    visibleAssets,
    profileCategoryTrackStyle,
    profileCategoryIndicatorStyle,
    resolvedProfileAssetTotal,
    displayedAssets,
    mountedAssets,
    pendingAssets,
    profileAssetRefreshReplayRequestId,
    profileAssetResultsStageRef,
    profileAssetTopSpacerHeight,
    profileAssetBottomSpacerHeight,
    profileAssetRemovedOverlayItems,
    profileAssetResultsStageStyle,
    profileAssetRemovedOverlayLayerStyle,
    visibleProfileAssetStructureSignature,
    visibleProfileAssetContentSignature,
    shouldShowProfileBottomEndline,
    isProfileAssetPlaceholder,
    resolveProfileAssetEntryClass,
    resolveProfileAssetEntryStyle,
    resolveProfileAssetRemovedOverlayItemStyle,
    resolveProfileAssetImageUrl,
    resolveProfileAssetPlaceholderIcon,
    resolveProfileAssetRevealPhase,
    resolveProfileAssetRemovedOverlayRevealPhase,
    handleProfileAssetVisualImageLoad,
    handleProfileAssetVisualImageError,
    handleProfileAssetVisualImageRetrying,
    syncMountedProfileAssetWindow,
    scheduleProfileAssetMountWindowSync,
    requestProfileAssetRefreshReplay,
    applyResolvedProfileAssetList,
    startProfileAssetResultSwitch,
    reconcileProfileAssetRender,
    isProfileRefreshPresentationSettled,
    resetProfileAssetProjection,
    resetProfileResultWindowForInactive,
    disposeProfileAssetResultWindow,
    profileAssetImageStateVersion: profileVisualReveal.profileAssetImageStateVersion,
    syncProfileAssetRevealPhases: profileVisualReveal.syncProfileAssetRevealPhases,
    syncProfileAssetVisualImages: profileVisualReveal.syncProfileAssetVisualImages,
    disposeProfileAssetVisualReveal: profileVisualReveal.disposeProfileAssetVisualReveal,
  }
}
