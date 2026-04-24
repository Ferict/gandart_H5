/**
 * Responsibility: co-locate the high-coupling runtime chain behind HomeRailProfilePanel.
 * Out of scope: header actions, asset detail navigation, and template-ref adapter wiring.
 */
import { ref, type ComputedRef } from 'vue'
import type { ProfileCategoryKey } from '../../../../models/home-rail/homeRailProfile.model'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import {
  hydrateProfileAssetListFromPersistentCache,
  persistProfileAssetListToPersistentCache,
  resolveCurrentHomeRailProfileUserScope,
} from '../../../../services/home-rail/homeRailPersistentCacheIntegration.service'
import { ensureHomeShellMenuReminderHydrated } from '../../../../services/home-shell/homeShellMenuState.service'
import {
  syncHomeRailProfileAssetListSnapshot,
  syncHomeRailProfileAssetQuerySnapshot,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'
import { logSafeError } from '../../../../utils/safeLogger.util'
import {
  IS_HOME_RAIL_PROFILE_DEV,
  PROFILE_ADDRESS_SUFFIX_LENGTH,
  PROFILE_ASSET_CARD_COPY_HEIGHT_PX,
  PROFILE_ASSET_CARD_FALLBACK_WIDTH_PX,
  PROFILE_ASSET_ENTER_DURATION_MS,
  PROFILE_ASSET_GRID_COLUMNS,
  PROFILE_ASSET_GRID_COLUMN_GAP_PX,
  PROFILE_ASSET_GRID_ROW_GAP_PX,
  PROFILE_ASSET_INITIAL_VISIBLE_COUNT,
  PROFILE_ASSET_LEAVE_DURATION_MS,
  PROFILE_ASSET_LOAD_MORE_COUNT,
  PROFILE_ASSET_LOAD_MORE_REMAINING_ROWS_THRESHOLD,
  PROFILE_ASSET_MOUNT_BUFFER_BOTTOM_ROWS,
  PROFILE_ASSET_MOUNT_BUFFER_TOP_ROWS,
  PROFILE_ASSET_REFRESH_SETTLE_POLL_INTERVAL_MS,
  PROFILE_ASSET_REMOTE_PAGE_SIZE,
  PROFILE_ASSET_REVEAL_SCAN_DURATION_MS,
  PROFILE_ASSET_STAGGER_STEP_MS,
  PROFILE_SEARCH_REVEAL_FALLBACK_HEIGHT_PX,
} from './homeRailProfilePanel.constants'
import { useHomeRailProfileAssetDataPipeline } from './useHomeRailProfileAssetDataPipeline'
import { useHomeRailProfileAssetEffectsRuntime } from './useHomeRailProfileAssetEffectsRuntime'
import { useHomeRailProfileContentLifecycle } from './useHomeRailProfileContentLifecycle'
import { useHomeRailProfileAssetResultRuntime } from './useHomeRailProfileAssetResultRuntime'
import { useHomeRailProfileLoadMore } from './useHomeRailProfileLoadMore'
import { useHomeRailProfileRefreshRuntime } from './useHomeRailProfileRefreshRuntime'
import { useHomeRailProfileRuntimeState } from './useHomeRailProfileRuntimeState'
import { useHomeRailProfileTopPresentation } from './useHomeRailProfileTopPresentation'
import { useProfileAssetSearchRevealTransition } from './useProfileAssetSearchRevealTransition'
import { useProfileScenePatchController } from './useProfileScenePatchController'

interface UseHomeRailProfilePanelRuntimeOptions {
  isActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null>
  emitScrollToAssetsSection: () => void
}

export const useHomeRailProfilePanelRuntime = (options: UseHomeRailProfilePanelRuntimeOptions) => {
  const activeCategory = ref<ProfileCategoryKey>('collections')
  const activeSubCategory = ref('')

  const {
    isProfilePanelActive,
    profileMountScrollMetrics,
    profileForegroundSignal,
    profilePollSignal,
    hasSeenProfilePageActivation,
    profileActivationCheckVersion,
    profileSceneQueryAdapter,
    profileSceneResultAdapter,
    logProfileRefreshDebug,
  } = useHomeRailProfileRuntimeState({
    isActive: options.isActive,
    mountScrollMetrics: options.mountScrollMetrics,
    isDev: IS_HOME_RAIL_PROFILE_DEV,
  })

  const {
    content,
    hasResolvedInitialProfileContent,
    lastResolvedMeta,
    resolvedProfileCategories,
    currentCategoryAssets,
    applyProfileContent,
    applyProfileSceneModules,
    hydrateProfileContent: hydrateProfileSceneContent,
    syncDisplayedProfileSceneSnapshot,
  } = useProfileScenePatchController({
    activeCategory,
    activeSubCategory,
    syncProfileFilters: () => profileSceneQueryAdapter.value?.syncProfileFilters(),
    canApplyProfileCategoryConfigLive: (nextContent) =>
      profileSceneQueryAdapter.value?.canApplyProfileCategoryConfigLive(nextContent) ?? false,
    resetProfileAssetProjection: () =>
      profileSceneResultAdapter.value?.resetProfileAssetProjection(),
    reconcileProfileAssetRender: () =>
      profileSceneResultAdapter.value?.reconcileProfileAssetRender(),
    logProfileRefreshDebug,
  })

  const { profileAssetQueryState, profileAssetRemoteListState } =
    useHomeRailProfileAssetDataPipeline({
      resolvedProfileCategories,
      currentCategoryAssets,
      emitScrollToAssetsSection: options.emitScrollToAssetsSection,
      activeCategoryRef: activeCategory,
      activeSubCategoryRef: activeSubCategory,
      remotePageSize: PROFILE_ASSET_REMOTE_PAGE_SIZE,
      resolveCurrentPersistUserScope: resolveCurrentHomeRailProfileUserScope,
      syncResolvedProfileAssetListSnapshot: syncHomeRailProfileAssetListSnapshot,
      hydratePersistedProfileAssetListSnapshot: (query) =>
        hydrateProfileAssetListFromPersistentCache(query),
      persistResolvedProfileAssetListSnapshot: (query, result, requestUserScope) =>
        persistProfileAssetListToPersistentCache(query, result, requestUserScope),
    })

  const {
    profileKeyword,
    isProfileSearchVisible,
    isProfileSubCategoryLeftFadeVisible,
    visibleProfileSubCategories,
    currentProfileAssetQuery,
    profileAssetQuerySignature,
    hasActiveProfileSearch,
    handleProfileSubCategoryScroll,
    resolveProfileAssetQuerySnapshot,
    syncProfileFilters,
    canApplyProfileCategoryConfigLive,
    clearProfileSearchState,
    handleSearchAssets,
    handleProfileKeywordInput,
    handleProfileKeywordClear,
    handleCategoryChange,
    handleSubCategoryChange,
    handleSummaryFocus,
    resetProfileQueryForInactive,
    disposeProfileQueryState,
    subCategoryFilteredAssets,
  } = profileAssetQueryState

  profileSceneQueryAdapter.value = {
    syncProfileFilters,
    canApplyProfileCategoryConfigLive,
  }

  const {
    remoteProfileAssets,
    remoteProfileAssetTotal,
    hasResolvedRemoteProfileAssets,
    isRemoteProfileAssetsLoading,
    profileAssetLoadingPhase,
    hasProfileAssetFirstScreenError,
    hasProfileAssetPaginationError,
    hydrateRemoteProfileAssetListFromPersistentCache,
    reloadRemoteProfileAssetList,
    loadMoreRemoteProfileAssetListPage,
    clearProfileAssetPaginationFeedback,
    markProfileAssetPaginationError,
    markProfileAssetPaginationEndline,
    invalidateProfileAssetPaginationRequest,
  } = profileAssetRemoteListState

  const {
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
    profileAssetImageStateVersion,
    syncProfileAssetRevealPhases,
    syncProfileAssetVisualImages,
    disposeProfileAssetVisualReveal,
  } = useHomeRailProfileAssetResultRuntime({
    viewState: {
      initialVisibleCount: PROFILE_ASSET_INITIAL_VISIBLE_COUNT,
      activeCategory,
      resolvedProfileCategories,
      filteredProfileAssets: subCategoryFilteredAssets,
      hasResolvedRemoteProfileAssets,
      remoteProfileAssets,
      remoteProfileAssetTotal,
    },
    isPanelActive: isProfilePanelActive,
    hasResolvedInitialProfileContent,
    mountScrollMetrics: profileMountScrollMetrics,
    isRemoteProfileAssetsLoading,
    revealScanDurationMs: PROFILE_ASSET_REVEAL_SCAN_DURATION_MS,
    layout: {
      columns: PROFILE_ASSET_GRID_COLUMNS,
      fallbackCardWidth: PROFILE_ASSET_CARD_FALLBACK_WIDTH_PX,
      columnGap: PROFILE_ASSET_GRID_COLUMN_GAP_PX,
      rowGap: PROFILE_ASSET_GRID_ROW_GAP_PX,
      cardChromeHeight: PROFILE_ASSET_CARD_COPY_HEIGHT_PX,
      mountBufferTopRows: PROFILE_ASSET_MOUNT_BUFFER_TOP_ROWS,
      mountBufferBottomRows: PROFILE_ASSET_MOUNT_BUFFER_BOTTOM_ROWS,
    },
    motion: {
      enterDurationMs: PROFILE_ASSET_ENTER_DURATION_MS,
      leaveDurationMs: PROFILE_ASSET_LEAVE_DURATION_MS,
      staggerStepMs: PROFILE_ASSET_STAGGER_STEP_MS,
    },
  })

  profileSceneResultAdapter.value = {
    resetProfileAssetProjection,
    reconcileProfileAssetRender,
  }

  const {
    handleProfileSearchRevealBeforeEnter,
    handleProfileSearchRevealEnter,
    handleProfileSearchRevealAfterEnter,
    handleProfileSearchRevealBeforeLeave,
    handleProfileSearchRevealLeave,
    handleProfileSearchRevealAfterLeave,
  } = useProfileAssetSearchRevealTransition({
    scheduleProfileAssetMountWindowSync,
    fallbackHeightPx: PROFILE_SEARCH_REVEAL_FALLBACK_HEIGHT_PX,
  })

  const {
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
  } = useHomeRailProfileRefreshRuntime({
    resolveProfileAssetQuerySnapshot,
    reloadRemoteProfileAssetList,
    hasResolvedRemoteProfileAssets,
    requestProfileAssetRefreshReplay,
    applyResolvedProfileAssetList,
    isProfileRefreshPresentationSettled,
    refreshSettlePollIntervalMs: PROFILE_ASSET_REFRESH_SETTLE_POLL_INTERVAL_MS,
  })

  const {
    hasMoreProfileAssets,
    clearProfileLoadMoreObserver,
    scheduleProfileLoadMoreObserver,
    resetProfileAssetVisibleCount,
    handleProfileAssetFirstScreenRetry,
    handleProfileAssetLoadMoreRetry,
    isProfileAssetPaginationChainLoading,
  } = useHomeRailProfileLoadMore({
    isActive: isProfilePanelActive,
    mountScrollMetrics: profileMountScrollMetrics,
    profileAssetResultsStageRef,
    displayedAssets,
    visibleAssets,
    resolvedProfileAssetSource,
    resolvedProfileAssetTotal,
    isRemoteProfileAssetsLoading,
    isProfileAssetLoadMoreRunning,
    profileAssetVisibleCount,
    initialVisibleCount: PROFILE_ASSET_INITIAL_VISIBLE_COUNT,
    loadMoreCount: PROFILE_ASSET_LOAD_MORE_COUNT,
    gridColumns: PROFILE_ASSET_GRID_COLUMNS,
    fallbackCardWidth: PROFILE_ASSET_CARD_FALLBACK_WIDTH_PX,
    gridColumnGapPx: PROFILE_ASSET_GRID_COLUMN_GAP_PX,
    gridRowGapPx: PROFILE_ASSET_GRID_ROW_GAP_PX,
    cardCopyHeightPx: PROFILE_ASSET_CARD_COPY_HEIGHT_PX,
    loadMoreRemainingRowsThreshold: PROFILE_ASSET_LOAD_MORE_REMAINING_ROWS_THRESHOLD,
    profileAssetQuerySignature,
    resolveProfileAssetQuerySnapshot,
    loadMoreRemoteProfileAssetListPage,
    clearProfileAssetPaginationFeedback,
    markProfileAssetPaginationError,
    markProfileAssetPaginationEndline,
    invalidateProfileAssetPaginationRequest,
    reloadProfileAssetListAndApply,
  })

  const {
    profileSummaryAddress,
    shouldShowProfileFirstScreenLoading,
    shouldShowProfileFirstScreenError,
    shouldShowProfileFirstScreenEmpty,
    shouldRenderProfileBottomFooter,
    profileBottomFooterMode,
    resolvedSummaryCurrencySymbol,
    profileAddressPreview,
    profileImageCacheUserScope,
    profileQuickActions,
  } = useHomeRailProfileTopPresentation({
    displayedAssets,
    isRemoteProfileAssetsLoading,
    profileAssetLoadingPhase,
    isProfileAssetPaginationChainLoading,
    hasResolvedRemoteProfileAssets,
    hasProfileAssetFirstScreenError,
    hasProfileAssetPaginationError,
    hasMoreProfileAssets,
    shouldShowProfileBottomEndline,
    resolvedProfileAssetTotal,
    resolveSummaryCurrency: () => content.value.summary.currency,
    resolveProfileAddress: () => content.value.summary.address,
    resolveCurrentPersistUserScope: () => resolveCurrentHomeRailProfileUserScope(),
    addressSuffixLength: PROFILE_ADDRESS_SUFFIX_LENGTH,
  })

  const hydrateProfileContent = async (
    runtimeOptions: {
      force?: boolean
      preserveCurrentContentOnError?: boolean
      refreshRunId?: number
      resetAssetProjection?: boolean
      applyResolvedContent?: boolean
    } = {}
  ) => {
    void ensureHomeShellMenuReminderHydrated().catch((error) => {
      logSafeError('homeRail.profile', error, {
        message: 'failed to hydrate service reminders',
      })
    })

    return hydrateProfileSceneContent({
      ...runtimeOptions,
      currentRefreshRunId: profileRefreshRunId.value,
    })
  }

  const {
    refreshContent,
    runProfileActivationCheck,
    runProfileVisibleUpdateCheck,
    initializeProfileContent,
  } = useHomeRailProfileContentLifecycle({
    isActive: isProfilePanelActive,
    hasResolvedInitialProfileContent,
    profileActivationCheckVersion,
    profileAssetQuerySignature,
    profileAssetRefreshReplayRequestId,
    profileAssetVisibleCount,
    resolvedProfileAssetSource,
    initialVisibleCount: PROFILE_ASSET_INITIAL_VISIBLE_COUNT,
    lastResolvedMeta,
    clearProfileSearchState,
    clearStagedAssetListUpdate,
    beginProfileRefreshRun,
    hydrateProfileContent,
    applyProfileContent,
    syncDisplayedProfileSceneSnapshot,
    reloadProfileAssetListAndApply,
    startProfilePullRefreshPresentation,
    waitForProfileRefreshPresentationSettled,
    applyProfileSceneModules,
    consumeStagedAssetListUpdate,
    applyResolvedProfileAssetList,
    stageAssetListUpdate,
    logProfileRefreshDebug,
    hydrateRemoteProfileAssetListFromPersistentCache,
    resolveProfileAssetQuerySnapshot,
    resetProfileAssetVisibleCount,
    scheduleProfileLoadMoreObserver,
  })

  useHomeRailProfileAssetEffectsRuntime({
    profileAssetQuerySignature,
    hasResolvedInitialProfileContent,
    visibleProfileAssetStructureSignature,
    visibleProfileAssetContentSignature,
    profileAssetRefreshReplayRequestId,
    mountedAssets,
    displayedAssets,
    pendingAssets,
    resolvedProfileAssetSource,
    profileAssetVisibleCount,
    currentProfileAssetQuery,
    isActive: isProfilePanelActive,
    mountScrollMetrics: profileMountScrollMetrics,
    hasSeenProfilePageActivation,
    profileForegroundSignal,
    profilePollSignal,
    isProfileAssetLoadMoreRunning,
    initialVisibleCount: PROFILE_ASSET_INITIAL_VISIBLE_COUNT,
    initializeProfileContent,
    clearStagedAssetListUpdate,
    resetProfileAssetVisibleCount,
    reloadProfileAssetListAndApply,
    reconcileProfileAssetRender,
    profileAssetImageStateVersion,
    syncProfileAssetRevealPhases,
    syncMountedProfileAssetWindow,
    syncProfileAssetVisualImages,
    scheduleProfileLoadMoreObserver,
    syncProfileAssetQuerySnapshot: () => {
      syncHomeRailProfileAssetQuerySnapshot(resolveProfileAssetQuerySnapshot())
    },
    markProfileRefreshPresentationCancelled,
    clearProfileLoadMoreObserver,
    resetProfileRuntimeForInactive,
    resetProfileQueryForInactive,
    resetProfileResultWindowForInactive,
    startProfileAssetResultSwitch,
    runProfileActivationCheck,
    runProfileVisibleUpdateCheck,
    disposeProfileRuntime,
    disposeProfileQueryState,
    disposeProfileAssetResultWindow,
    disposeProfileAssetVisualReveal,
  })

  return {
    content,
    activeCategory,
    activeSubCategory,
    resolvedProfileCategories,
    visibleProfileSubCategories,
    profileKeyword,
    isProfileSearchVisible,
    isProfileSubCategoryLeftFadeVisible,
    hasActiveProfileSearch,
    profileCategoryTrackStyle,
    profileCategoryIndicatorStyle,
    displayedAssets,
    mountedAssets,
    profileAssetResultsStageRef,
    profileAssetTopSpacerHeight,
    profileAssetBottomSpacerHeight,
    profileAssetRemovedOverlayItems,
    profileAssetResultsStageStyle,
    profileAssetRemovedOverlayLayerStyle,
    shouldRenderProfileBottomFooter,
    profileBottomFooterMode,
    profileImageCacheUserScope,
    shouldShowProfileFirstScreenLoading,
    shouldShowProfileFirstScreenError,
    shouldShowProfileFirstScreenEmpty,
    resolvedSummaryCurrencySymbol,
    profileAddressPreview,
    profileQuickActions,
    profileSummaryAddress,
    handleProfileSubCategoryScroll,
    handleSearchAssets,
    handleProfileKeywordInput,
    handleProfileKeywordClear,
    handleCategoryChange,
    handleSubCategoryChange,
    handleSummaryFocus,
    handleProfileSearchRevealBeforeEnter,
    handleProfileSearchRevealEnter,
    handleProfileSearchRevealAfterEnter,
    handleProfileSearchRevealBeforeLeave,
    handleProfileSearchRevealLeave,
    handleProfileSearchRevealAfterLeave,
    resolveProfileAssetRemovedOverlayItemStyle,
    resolveProfileAssetImageUrl,
    resolveProfileAssetRemovedOverlayRevealPhase,
    resolveProfileAssetPlaceholderIcon,
    isProfileAssetPlaceholder,
    resolveProfileAssetEntryClass,
    resolveProfileAssetEntryStyle,
    resolveProfileAssetRevealPhase,
    handleProfileAssetVisualImageLoad,
    handleProfileAssetVisualImageError,
    handleProfileAssetVisualImageRetrying,
    handleProfileAssetFirstScreenRetry,
    handleProfileAssetLoadMoreRetry,
    refreshContent,
    waitForRefreshPresentation,
  }
}
