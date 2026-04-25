/**
 * Responsibility: co-locate the visual reveal and refresh presentation runtime behind home rail.
 * Out of scope: market query/result window wiring and scene/content lifecycle orchestration.
 */
import { type ComputedRef, type Ref } from 'vue'
import type {
  HomeBannerItem,
  HomeMarketCard,
  HomeFeaturedDropContent,
} from '../../../../models/home-rail/homeRailHome.model'
import {
  HOME_MARKET_CARD_IMAGE_SCAN_DURATION_MS,
  HOME_MARKET_REFRESH_MIN_VISIBLE_DURATION_MS,
  HOME_MARKET_REFRESH_SETTLE_POLL_INTERVAL_MS,
  HOME_TOP_REFRESH_REPLAY_MIN_VISIBLE_DURATION_MS,
  IS_HOME_RAIL_HOME_DEV,
} from './homeRailHomePanel.constants'
import { useHomeHomeVisualReveal } from './useHomeHomeVisualReveal'
import { useHomePagePresentationRuntime } from './useHomePagePresentationRuntime'
import type { useHomeRailHomeContentState } from './useHomeRailHomeContentState'
import type { useHomeRailHomeRuntimeState } from './useHomeRailHomeRuntimeState'

type HomeRailHomeContentState = ReturnType<typeof useHomeRailHomeContentState>
type HomeRailHomeRuntimeState = ReturnType<typeof useHomeRailHomeRuntimeState>

interface UseHomeRailHomeVisualPresentationRuntimeOptions {
  contentState: HomeRailHomeContentState
  runtimeState: HomeRailHomeRuntimeState
  isHomePanelActive: ComputedRef<boolean>
  mountedMarketItems: Ref<HomeMarketCard[]>
  marketPlaceholderCardIdSet: Ref<Set<string>>
  isMarketListLoading: Ref<boolean>
  marketTransitionPhase: Ref<string>
  queuedMarketRequest: Ref<unknown>
  clearStagedMarketListUpdate: () => void
  reloadMarketResultPresentationForRefresh: (reason: 'pull-refresh') => Promise<void>
}

export const useHomeRailHomeVisualPresentationRuntime = (
  options: UseHomeRailHomeVisualPresentationRuntimeOptions
) => {
  const { homeBannerItems, bannerDrop, activeAnnouncementIndex } = options.contentState
  const { noticeRefreshRenderKey, bannerRefreshRenderKey, featuredRefreshRenderKey } =
    options.runtimeState

  const homeVisualReveal = useHomeHomeVisualReveal({
    homeBannerItems,
    bannerDrop,
    mountedMarketItems: options.mountedMarketItems,
    isMarketCardPlaceholder: (itemId) => options.marketPlaceholderCardIdSet.value.has(itemId),
    isActive: options.isHomePanelActive,
    marketCardImageScanDurationMs: HOME_MARKET_CARD_IMAGE_SCAN_DURATION_MS,
    shouldSkipMarketCardRevealSync: () => options.marketTransitionPhase.value === 'leaving',
  })

  const {
    bannerImageRevealPhaseMap,
    marketCardRevealPhaseMap,
    marketImageStateVersion,
    resolveBannerImageUrl,
    resolveFeaturedImageUrl,
    resolveMarketImageUrl,
    hasMarketImage,
    resolveBannerImageRevealKey,
    isBannerImageLoaded,
    isFeaturedImageLoaded,
    resolveFeaturedImagePresentationPhase,
    resolveBannerImageDisplaySource,
    resolveFeaturedImageDisplaySource,
    isHomeVisualImageRevealReady,
    handleHomeVisualImageLoad,
    handleHomeVisualImageError,
    handleHomeVisualImageRetrying,
    clearBannerRevealScanTimeout,
    clearFeaturedRevealScanTimeout,
    clearMarketCardMotionTimeouts,
    setFeaturedImageRevealPhase,
    syncBannerImageRevealStates,
    syncCurrentHomeVisualImages,
    syncFeaturedImageRevealState,
    syncMarketCardRevealStates,
    buildNextMarketRevealPhaseMap,
    resetHomeVisualRevealForInactive,
    disposeHomeVisualReveal,
    resolveMarketCardPresentationPhase,
  } = homeVisualReveal

  const hasBannerRemoteImage = (item: HomeBannerItem) => resolveBannerImageUrl(item).length > 0

  const homePagePresentationRuntime = useHomePagePresentationRuntime({
    homeBannerItems,
    bannerDrop,
    activeAnnouncementIndex,
    noticeRefreshRenderKey,
    bannerRefreshRenderKey,
    featuredRefreshRenderKey,
    bannerImageRevealPhaseMap,
    clearBannerRevealScanTimeout,
    resolveBannerImageUrl: (item: HomeBannerItem) => resolveBannerImageUrl(item),
    resolveBannerImageRevealKey: (item: HomeBannerItem) => resolveBannerImageRevealKey(item),
    isHomeVisualImageRevealReady,
    resolveBannerImageDisplaySource: (item: HomeBannerItem) =>
      resolveBannerImageDisplaySource(item),
    clearFeaturedRevealScanTimeout,
    resolveFeaturedImageUrl: (item: HomeFeaturedDropContent) => resolveFeaturedImageUrl(item),
    setFeaturedImageRevealPhase,
    resolveFeaturedImageDisplaySource,
    syncBannerImageRevealStates,
    syncFeaturedImageRevealState,
    reloadMarketResultPresentationForRefresh: options.reloadMarketResultPresentationForRefresh,
    isMarketRefreshPresentationSettled: () =>
      !options.isMarketListLoading.value &&
      options.marketTransitionPhase.value === 'idle' &&
      !options.queuedMarketRequest.value,
    clearStagedMarketListUpdate: options.clearStagedMarketListUpdate,
    isDev: IS_HOME_RAIL_HOME_DEV,
    noticeLiveReorderDurationMs: HOME_MARKET_CARD_IMAGE_SCAN_DURATION_MS,
    scenePatchMotionReductionDurationMs: 360,
    topRefreshReplayMinVisibleDurationMs: HOME_TOP_REFRESH_REPLAY_MIN_VISIBLE_DURATION_MS,
    refreshSettlePollIntervalMs: HOME_MARKET_REFRESH_SETTLE_POLL_INTERVAL_MS,
    refreshMinVisibleDurationMs: HOME_MARKET_REFRESH_MIN_VISIBLE_DURATION_MS,
  })

  const {
    isHomeNoticeLiveReordering,
    isHomeScenePatchMotionReduced,
    logHomeRefreshDebug,
    triggerHomeScenePatchMotionReduction,
    startHomeNoticeLiveReorder,
    startHomePullRefreshPresentation,
    waitForRefreshPresentation,
    resetHomeLocalRuntimeForInactive,
    disposeHomeLocalRuntime,
  } = homePagePresentationRuntime

  return {
    marketCardRevealPhaseMap,
    marketImageStateVersion,
    resolveBannerImageUrl,
    resolveFeaturedImageUrl,
    resolveMarketImageUrl,
    hasMarketImage,
    hasBannerRemoteImage,
    resolveBannerImageRevealKey,
    isBannerImageLoaded,
    isFeaturedImageLoaded,
    resolveFeaturedImagePresentationPhase,
    resolveBannerImageDisplaySource,
    resolveFeaturedImageDisplaySource,
    isHomeVisualImageRevealReady,
    handleHomeVisualImageLoad,
    handleHomeVisualImageError,
    handleHomeVisualImageRetrying,
    clearMarketCardMotionTimeouts,
    syncCurrentHomeVisualImages,
    syncBannerImageRevealStates,
    syncFeaturedImageRevealState,
    syncMarketCardRevealStates,
    buildNextMarketRevealPhaseMap,
    isHomeNoticeLiveReordering,
    isHomeScenePatchMotionReduced,
    logHomeRefreshDebug,
    triggerHomeScenePatchMotionReduction,
    startHomeNoticeLiveReorder,
    startHomePullRefreshPresentation,
    waitForRefreshPresentation,
    resetHomeVisualRevealForInactive,
    resetHomeLocalRuntimeForInactive,
    disposeHomeVisualReveal,
    disposeHomeLocalRuntime,
    resolveMarketCardPresentationPhase,
  }
}
