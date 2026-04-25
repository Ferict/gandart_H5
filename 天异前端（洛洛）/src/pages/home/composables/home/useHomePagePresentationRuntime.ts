/**
 * Responsibility: coordinate the home rail upper-surface refresh presentation, including
 * banner/featured replay, notice reorder motion, and market refresh presentation waiting.
 * Out of scope: market query execution, result-window timing internals, and visual image
 * cache ownership.
 */
import { nextTick, ref, type ComputedRef, type Ref } from 'vue'
import type { HomeRailHomeSceneModuleKey } from '../../../../services/home-rail/homeRailHomeContent.service'
import type {
  HomeBannerItem,
  HomeFeaturedDropContent,
} from '../../../../models/home-rail/homeRailHome.model'
import type { HomeSurfaceRevealPhase } from './useHomeHomeVisualReveal'
import { useRefreshPresentationRuntime } from '../shared/useRefreshPresentationRuntime'
import { logSafeError } from '../../../../utils/safeLogger.util'

type RailRefreshReason = 'pull-refresh'

interface UseHomePagePresentationRuntimeOptions {
  homeBannerItems: ComputedRef<HomeBannerItem[]>
  bannerDrop: ComputedRef<HomeFeaturedDropContent>
  activeAnnouncementIndex: Ref<number>
  noticeRefreshRenderKey: Ref<number>
  bannerRefreshRenderKey: Ref<number>
  featuredRefreshRenderKey: Ref<number>
  bannerImageRevealPhaseMap: Ref<Record<string, HomeSurfaceRevealPhase>>
  clearBannerRevealScanTimeout: (revealKey: string) => void
  resolveBannerImageUrl: (item: HomeBannerItem) => string
  resolveBannerImageRevealKey: (item: HomeBannerItem) => string
  isHomeVisualImageRevealReady: (
    scope: 'banner' | 'featured' | 'market',
    resourceId: string,
    imageUrl: string
  ) => boolean
  resolveBannerImageDisplaySource: (item: HomeBannerItem) => string
  clearFeaturedRevealScanTimeout: () => void
  resolveFeaturedImageUrl: (item: HomeFeaturedDropContent) => string
  setFeaturedImageRevealPhase: (phase: HomeSurfaceRevealPhase) => void
  resolveFeaturedImageDisplaySource: () => string
  syncBannerImageRevealStates: () => void
  syncFeaturedImageRevealState: () => void
  reloadMarketResultPresentationForRefresh: (reason: RailRefreshReason) => Promise<void>
  isMarketRefreshPresentationSettled: () => boolean
  clearStagedMarketListUpdate: () => void
  isDev: boolean
  noticeLiveReorderDurationMs: number
  scenePatchMotionReductionDurationMs: number
  topRefreshReplayMinVisibleDurationMs: number
  refreshSettlePollIntervalMs: number
  refreshMinVisibleDurationMs: number
}

export const useHomePagePresentationRuntime = (options: UseHomePagePresentationRuntimeOptions) => {
  const isHomeNoticeLiveReordering = ref(false)
  const isHomeScenePatchMotionReduced = ref(false)
  const refreshPresentationRuntime = useRefreshPresentationRuntime()

  let homeNoticeLiveReorderTimeoutId: ReturnType<typeof setTimeout> | null = null
  let homeScenePatchMotionTimeoutId: ReturnType<typeof setTimeout> | null = null

  const logHomeRefreshDebug = (message: string, detail?: unknown) => {
    if (!options.isDev) {
      return
    }

    if (detail === undefined) {
      console.debug(`[homeRail][home] ${message}`)
      return
    }

    console.debug(`[homeRail][home] ${message}`, detail)
  }

  const waitForMs = (durationMs: number) =>
    new Promise<void>((resolve) => {
      setTimeout(resolve, durationMs)
    })

  const clearHomeScenePatchMotionTimeout = () => {
    if (!homeScenePatchMotionTimeoutId) {
      return
    }

    clearTimeout(homeScenePatchMotionTimeoutId)
    homeScenePatchMotionTimeoutId = null
  }

  const triggerHomeScenePatchMotionReduction = (modules: HomeRailHomeSceneModuleKey[]) => {
    if (!modules.some((moduleKey) => moduleKey === 'banner' || moduleKey === 'featured')) {
      return
    }

    clearHomeScenePatchMotionTimeout()
    isHomeScenePatchMotionReduced.value = true
    homeScenePatchMotionTimeoutId = setTimeout(() => {
      homeScenePatchMotionTimeoutId = null
      isHomeScenePatchMotionReduced.value = false
    }, options.scenePatchMotionReductionDurationMs)
  }

  const startHomeNoticeLiveReorder = () => {
    if (homeNoticeLiveReorderTimeoutId) {
      clearTimeout(homeNoticeLiveReorderTimeoutId)
    }

    isHomeNoticeLiveReordering.value = true
    homeNoticeLiveReorderTimeoutId = setTimeout(() => {
      homeNoticeLiveReorderTimeoutId = null
      isHomeNoticeLiveReordering.value = false
    }, options.noticeLiveReorderDurationMs)
  }

  const waitForMarketRefreshPresentationSettled = async (targetPresentationRunId: number) => {
    await refreshPresentationRuntime.waitForRefreshPresentationSettled({
      targetRunId: targetPresentationRunId,
      isSettled: () => options.isMarketRefreshPresentationSettled(),
      pollIntervalMs: options.refreshSettlePollIntervalMs,
    })
  }

  const replayHomeUpperPresentationForRefresh = async () => {
    const nextBannerPhaseMap: Record<string, HomeSurfaceRevealPhase> = {}
    Object.keys(options.bannerImageRevealPhaseMap.value).forEach((revealKey) => {
      options.clearBannerRevealScanTimeout(revealKey)
    })

    options.homeBannerItems.value.forEach((item) => {
      const imageUrl = options.resolveBannerImageUrl(item)
      if (!imageUrl) {
        return
      }

      const revealKey = options.resolveBannerImageRevealKey(item)
      const revealReady = options.isHomeVisualImageRevealReady('banner', item.id, imageUrl)
      nextBannerPhaseMap[revealKey] =
        revealReady && options.resolveBannerImageDisplaySource(item) !== 'fallback'
          ? 'icon'
          : 'fallback'
    })
    options.bannerImageRevealPhaseMap.value = nextBannerPhaseMap

    options.clearFeaturedRevealScanTimeout()
    const featuredImageUrl = options.resolveFeaturedImageUrl(options.bannerDrop.value)
    if (!featuredImageUrl) {
      options.setFeaturedImageRevealPhase('fallback')
    } else {
      const featuredRevealReady = options.isHomeVisualImageRevealReady(
        'featured',
        options.bannerDrop.value.id,
        featuredImageUrl
      )
      options.setFeaturedImageRevealPhase(
        featuredRevealReady && options.resolveFeaturedImageDisplaySource() !== 'fallback'
          ? 'icon'
          : 'fallback'
      )
    }

    options.activeAnnouncementIndex.value = 0
    options.noticeRefreshRenderKey.value += 1
    options.bannerRefreshRenderKey.value += 1
    options.featuredRefreshRenderKey.value += 1

    await nextTick()
    options.syncBannerImageRevealStates()
    options.syncFeaturedImageRevealState()
    await waitForMs(options.topRefreshReplayMinVisibleDurationMs)
  }

  const rebuildMarketResultPresentationForRefresh = async (
    reason: RailRefreshReason,
    targetPresentationRunId: number
  ) => {
    await options.reloadMarketResultPresentationForRefresh(reason)
    await waitForMarketRefreshPresentationSettled(targetPresentationRunId)
  }

  const triggerHomePullRefreshPresentation = async (
    refreshStartedAt: number,
    targetPresentationRunId: number
  ) => {
    try {
      await Promise.all([
        replayHomeUpperPresentationForRefresh(),
        rebuildMarketResultPresentationForRefresh('pull-refresh', targetPresentationRunId),
      ])
      const elapsedMs = Date.now() - refreshStartedAt
      if (elapsedMs < options.refreshMinVisibleDurationMs) {
        await waitForMs(options.refreshMinVisibleDurationMs - elapsedMs)
      }
    } catch (error) {
      logSafeError('homeRail.home', error, {
        message: 'failed to replay home pull-refresh presentation',
      })
    }
  }

  const startHomePullRefreshPresentation = (refreshStartedAt: number) => {
    void refreshPresentationRuntime.startRefreshPresentation((presentationRunId) =>
      triggerHomePullRefreshPresentation(refreshStartedAt, presentationRunId)
    )
  }

  const waitForRefreshPresentation = () => {
    return refreshPresentationRuntime.waitForRefreshPresentation()
  }

  const resetHomeLocalRuntimeForInactive = () => {
    clearHomeScenePatchMotionTimeout()
    isHomeScenePatchMotionReduced.value = false
    refreshPresentationRuntime.resetRefreshPresentationRuntimeForInactive()
    options.clearStagedMarketListUpdate()
  }

  const disposeHomeLocalRuntime = () => {
    if (homeNoticeLiveReorderTimeoutId) {
      clearTimeout(homeNoticeLiveReorderTimeoutId)
      homeNoticeLiveReorderTimeoutId = null
    }

    resetHomeLocalRuntimeForInactive()
  }

  return {
    isHomeNoticeLiveReordering,
    isHomeScenePatchMotionReduced,
    logHomeRefreshDebug,
    triggerHomeScenePatchMotionReduction,
    startHomeNoticeLiveReorder,
    startHomePullRefreshPresentation,
    waitForRefreshPresentation,
    resetHomeLocalRuntimeForInactive,
    disposeHomeLocalRuntime,
  }
}
