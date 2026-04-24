/**
 * Responsibility: co-locate home rail scene patch, market reload, and content lifecycle wiring.
 * Out of scope: market query/result window implementation and visual reveal/presentation runtime internals.
 */
import { type ComputedRef } from 'vue'
import type { HomeRailHomeContent } from '../../../../models/home-rail/homeRailHome.model'
import type { useHomeRailHomeContentState } from './useHomeRailHomeContentState'
import type { useHomeRailHomeRuntimeState } from './useHomeRailHomeRuntimeState'
import { useHomeRailHomeContentLifecycle } from './useHomeRailHomeContentLifecycle'
import { useHomeRailHomeMarketReload } from './useHomeRailHomeMarketReload'
import { useHomeScenePatchController } from './useHomeScenePatchController'

type HomeRailHomeContentState = ReturnType<typeof useHomeRailHomeContentState>
type HomeRailHomeRuntimeState = ReturnType<typeof useHomeRailHomeRuntimeState>
type HomeScenePatchControllerOptions = Parameters<typeof useHomeScenePatchController>[0]
type HomeMarketReloadOptions = Parameters<typeof useHomeRailHomeMarketReload>[0]
type HomeContentLifecycleOptions = Parameters<typeof useHomeRailHomeContentLifecycle>[0]

interface UseHomeRailHomeSceneLifecycleRuntimeOptions {
  contentState: HomeRailHomeContentState
  runtimeState: HomeRailHomeRuntimeState
  isHomePanelActive: ComputedRef<boolean>
  marketListQuerySignature: HomeScenePatchControllerOptions['marketListQuerySignature']
  activeMarketTagId: HomeScenePatchControllerOptions['activeMarketTagId']
  isMarketDefaultSortSelected: HomeScenePatchControllerOptions['isMarketDefaultSortSelected']
  marketSortField: HomeScenePatchControllerOptions['marketSortField']
  hasBootstrappedMarketResults: HomeScenePatchControllerOptions['hasBootstrappedMarketResults']
  marketCollection: HomeMarketReloadOptions['marketCollection']
  marketResultTotal: HomeMarketReloadOptions['marketResultTotal']
  clearHomeMarketSearchState: HomeContentLifecycleOptions['clearHomeMarketSearchState']
  clearMarketListQueryDebounce: HomeMarketReloadOptions['clearMarketListQueryDebounce']
  clearStagedMarketListUpdate: HomeMarketReloadOptions['clearStagedMarketListUpdate']
  hydrateRemoteMarketListFromPersistentCache: HomeContentLifecycleOptions['hydrateRemoteMarketListFromPersistentCache']
  reloadRemoteMarketList: HomeMarketReloadOptions['reloadRemoteMarketList']
  resolveMarketListQuerySnapshot: HomeContentLifecycleOptions['resolveMarketListQuerySnapshot']
  syncMarketTagSelection: HomeScenePatchControllerOptions['syncMarketTagSelection']
  syncMarketSortConfig: (
    sortConfig?: HomeRailHomeContent['market']['sortConfig'],
    options?: { preserveCurrent?: boolean }
  ) => void
  consumeStagedMarketListUpdate: HomeContentLifecycleOptions['consumeStagedMarketListUpdate']
  stageMarketListUpdate: HomeContentLifecycleOptions['stageMarketListUpdate']
  applyResolvedMarketListResult: HomeMarketReloadOptions['applyResolvedMarketListResult']
  replaceMarketCollectionImmediately: HomeMarketReloadOptions['replaceMarketCollectionImmediately']
  scheduleMarketLoadMoreObserver: HomeMarketReloadOptions['scheduleMarketLoadMoreObserver']
  appendVisibleMarketItems: HomeMarketReloadOptions['appendVisibleMarketItems']
  syncCurrentHomeVisualImages: HomeScenePatchControllerOptions['syncCurrentHomeVisualImages']
  syncBannerImageRevealStates: HomeScenePatchControllerOptions['syncBannerImageRevealStates']
  syncFeaturedImageRevealState: HomeScenePatchControllerOptions['syncFeaturedImageRevealState']
  logHomeRefreshDebug: HomeScenePatchControllerOptions['logHomeRefreshDebug']
  triggerHomeScenePatchMotionReduction: HomeScenePatchControllerOptions['triggerHomeScenePatchMotionReduction']
  startHomeNoticeLiveReorder: HomeScenePatchControllerOptions['startHomeNoticeLiveReorder']
  startHomePullRefreshPresentation: HomeContentLifecycleOptions['startHomePullRefreshPresentation']
}

export const useHomeRailHomeSceneLifecycleRuntime = (
  options: UseHomeRailHomeSceneLifecycleRuntimeOptions
) => {
  const { homeContent, lastResolvedMeta, homeBannerItems, bannerDrop, collection } =
    options.contentState
  const {
    homeContentRequestVersion,
    homeContentRefreshRunId,
    hasResolvedInitialHomeContent,
    noticeRefreshRenderKey,
    homeActivationCheckVersion,
  } = options.runtimeState

  const {
    applyHomeSceneModules,
    applyHomeRailContent,
    hydrateHomeRailContent,
    syncDisplayedHomeSceneSnapshot,
  } = useHomeScenePatchController({
    homeContent,
    homeBannerItems,
    bannerDrop,
    collection,
    marketListQuerySignature: options.marketListQuerySignature,
    activeMarketTagId: options.activeMarketTagId,
    isMarketDefaultSortSelected: options.isMarketDefaultSortSelected,
    marketSortField: options.marketSortField,
    hasResolvedInitialHomeContent,
    hasBootstrappedMarketResults: options.hasBootstrappedMarketResults,
    homeContentRequestVersion,
    homeContentRefreshRunId,
    lastResolvedMeta,
    syncMarketTagSelection: (tags) => options.syncMarketTagSelection(tags),
    syncMarketSortConfig: (sortConfig, preserveCurrent) =>
      options.syncMarketSortConfig(sortConfig, { preserveCurrent }),
    triggerHomeScenePatchMotionReduction: (modules) =>
      options.triggerHomeScenePatchMotionReduction(modules),
    startHomeNoticeLiveReorder: () => options.startHomeNoticeLiveReorder(),
    setActiveAnnouncementIndex: (index) => {
      options.contentState.activeAnnouncementIndex.value = index
    },
    bumpNoticeRefreshRenderKey: () => {
      noticeRefreshRenderKey.value += 1
    },
    syncCurrentHomeVisualImages: () => options.syncCurrentHomeVisualImages(),
    syncBannerImageRevealStates: () => options.syncBannerImageRevealStates(),
    syncFeaturedImageRevealState: () => options.syncFeaturedImageRevealState(),
    replaceMarketCollectionImmediately: (nextCollection, applyOptions) =>
      options.replaceMarketCollectionImmediately(nextCollection, applyOptions),
    logHomeRefreshDebug: (message, detail) => options.logHomeRefreshDebug(message, detail),
  })

  const { reloadMarketList, handleHomeMarketFirstScreenRetry, handleHomeMarketLoadMoreRetry } =
    useHomeRailHomeMarketReload({
      clearMarketListQueryDebounce: options.clearMarketListQueryDebounce,
      clearStagedMarketListUpdate: options.clearStagedMarketListUpdate,
      reloadRemoteMarketList: options.reloadRemoteMarketList,
      hasBootstrappedMarketResults: options.hasBootstrappedMarketResults,
      marketCollection: options.marketCollection,
      marketResultTotal: options.marketResultTotal,
      replaceMarketCollectionImmediately: options.replaceMarketCollectionImmediately,
      applyResolvedMarketListResult: options.applyResolvedMarketListResult,
      scheduleMarketLoadMoreObserver: options.scheduleMarketLoadMoreObserver,
      appendVisibleMarketItems: options.appendVisibleMarketItems,
    })

  const {
    refreshContent,
    runHomeActivationCheck,
    runHomeVisibleUpdateCheck,
    initializeHomeContent,
  } = useHomeRailHomeContentLifecycle({
    isActive: options.isHomePanelActive,
    hasResolvedInitialHomeContent,
    homeContentRefreshRunId,
    homeActivationCheckVersion,
    lastResolvedMeta,
    marketListQuerySignature: options.marketListQuerySignature,
    clearHomeMarketSearchState: options.clearHomeMarketSearchState,
    clearStagedMarketListUpdate: options.clearStagedMarketListUpdate,
    hydrateHomeRailContent,
    applyHomeRailContent,
    syncDisplayedHomeSceneSnapshot,
    applyHomeSceneModules,
    reloadMarketList,
    consumeStagedMarketListUpdate: options.consumeStagedMarketListUpdate,
    applyResolvedMarketListResult: options.applyResolvedMarketListResult,
    stageMarketListUpdate: options.stageMarketListUpdate,
    logHomeRefreshDebug: options.logHomeRefreshDebug,
    hydrateRemoteMarketListFromPersistentCache: options.hydrateRemoteMarketListFromPersistentCache,
    resolveMarketListQuerySnapshot: options.resolveMarketListQuerySnapshot,
    startHomePullRefreshPresentation: options.startHomePullRefreshPresentation,
  })

  return {
    refreshContent,
    reloadMarketList,
    handleHomeMarketFirstScreenRetry,
    handleHomeMarketLoadMoreRetry,
    runHomeActivationCheck,
    runHomeVisibleUpdateCheck,
    initializeHomeContent,
  }
}
