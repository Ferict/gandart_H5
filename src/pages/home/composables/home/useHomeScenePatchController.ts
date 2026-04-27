/**
 * Responsibility: coordinate scene-patch application and patch lifecycle decisions for
 * the home rail scene shell.
 * Out of scope: remote list fetching, result-window timing, and pure presentation
 * mapping.
 */
import type { ComputedRef, Ref } from 'vue'
import {
  createHomeRailHomeContentShell,
  resolveHomeRailHomeContent,
  type HomeRailHomeSceneModuleKey,
} from '../../../../services/home-rail/homeRailHomeContent.service'
import {
  type RailSceneResolvedContent,
  type RailSceneResolvedMeta,
} from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import { syncHomeRailHomeSceneSnapshot } from '../../../../services/home-rail/homeRailUpdateCoordinator.service'
import type {
  HomeBannerItem,
  HomeFeaturedDropContent,
  HomeMarketCard,
  HomeRailHomeContent,
} from '../../../../models/home-rail/homeRailHome.model'
import { logSafeError } from '../../../../utils/safeLogger.util'

interface UseHomeScenePatchControllerOptions {
  homeContent: Ref<HomeRailHomeContent>
  homeBannerItems: ComputedRef<HomeBannerItem[]>
  bannerDrop: ComputedRef<HomeFeaturedDropContent>
  collection: ComputedRef<HomeMarketCard[]>
  marketListQuerySignature: ComputedRef<string>
  activeMarketTagId: Ref<string>
  hasResolvedInitialHomeContent: Ref<boolean>
  hasBootstrappedMarketResults: Ref<boolean>
  homeContentRequestVersion: Ref<number>
  homeContentRefreshRunId: Ref<number>
  lastResolvedMeta: Ref<RailSceneResolvedMeta | null>
  syncMarketTagSelection: (tags?: HomeRailHomeContent['market']['tags']) => void
  triggerHomeScenePatchMotionReduction: (modules: HomeRailHomeSceneModuleKey[]) => void
  startHomeNoticeLiveReorder: () => void
  setActiveAnnouncementIndex: (index: number) => void
  bumpNoticeRefreshRenderKey: () => void
  syncCurrentHomeVisualImages: () => void
  syncBannerImageRevealStates: () => void
  syncFeaturedImageRevealState: () => void
  replaceMarketCollectionImmediately: (
    nextCollection: HomeMarketCard[],
    options?: { preserveVisibleCount?: boolean }
  ) => void
  logHomeRefreshDebug: (message: string, detail?: unknown) => void
}

export const useHomeScenePatchController = (options: UseHomeScenePatchControllerOptions) => {
  const canApplyHomeMarketShellLive = (nextContent: HomeRailHomeContent) => {
    const nextTagId =
      nextContent.market.tags.find((tag) => tag.id === options.activeMarketTagId.value)?.id ??
      nextContent.market.tags.find((tag) => tag.id === 'all')?.id ??
      nextContent.market.tags[0]?.id ??
      'all'

    if (nextTagId !== options.activeMarketTagId.value) {
      return false
    }

    return true
  }

  const applyHomeSceneModules = (
    modules: HomeRailHomeSceneModuleKey[],
    nextContent: HomeRailHomeContent,
    params: { origin: 'visible' | 'activation' }
  ) => {
    const appliedModules: HomeRailHomeSceneModuleKey[] = []
    const skippedModules: HomeRailHomeSceneModuleKey[] = []
    let nextHomeContent = options.homeContent.value
    let shouldSyncVisuals = false
    let shouldSyncMarketShell = false
    let shouldReplayNoticeBar = false
    const previousFeaturedImageUrl = options.bannerDrop.value.imageUrl.trim()
    const previousBannerSignature = options.homeBannerItems.value
      .map((item) => `${item.id}::${item.imageUrl.trim()}`)
      .join('|')

    modules.forEach((moduleKey) => {
      if (moduleKey === 'noticeBar') {
        nextHomeContent = { ...nextHomeContent, noticeBar: nextContent.noticeBar }
        appliedModules.push(moduleKey)
        shouldReplayNoticeBar = true
        return
      }

      if (moduleKey === 'banner') {
        nextHomeContent = { ...nextHomeContent, banners: nextContent.banners }
        appliedModules.push(moduleKey)
        shouldSyncVisuals = true
        return
      }

      if (moduleKey === 'featured') {
        nextHomeContent = { ...nextHomeContent, featured: nextContent.featured }
        appliedModules.push(moduleKey)
        shouldSyncVisuals = true
        return
      }

      if (moduleKey === 'marketShell') {
        if (params.origin === 'visible' && !canApplyHomeMarketShellLive(nextContent)) {
          skippedModules.push(moduleKey)
          return
        }

        nextHomeContent = {
          ...nextHomeContent,
          market: {
            ...nextContent.market,
            cards: nextHomeContent.market.cards,
          },
        }
        appliedModules.push(moduleKey)
        shouldSyncMarketShell = true
      }
    })

    if (!appliedModules.length) {
      if (skippedModules.length > 0) {
        options.logHomeRefreshDebug('deferred visible scene modules', { modules: skippedModules })
      }
      return { appliedModules, skippedModules, marketQueryChanged: false }
    }

    const previousMarketQuerySignature = options.marketListQuerySignature.value
    options.homeContent.value = nextHomeContent
    options.hasResolvedInitialHomeContent.value = true
    options.triggerHomeScenePatchMotionReduction(appliedModules)

    if (shouldSyncMarketShell) {
      options.syncMarketTagSelection(nextContent.market.tags)
    }

    if (shouldReplayNoticeBar) {
      options.setActiveAnnouncementIndex(0)
      options.bumpNoticeRefreshRenderKey()
      options.startHomeNoticeLiveReorder()
    }

    if (shouldSyncVisuals) {
      options.syncCurrentHomeVisualImages()
      options.syncBannerImageRevealStates()
      options.syncFeaturedImageRevealState()
    }

    const marketQueryChanged =
      previousMarketQuerySignature !== options.marketListQuerySignature.value
    if (appliedModules.includes('banner')) {
      const nextBannerSignature = nextContent.banners
        .map((item) => `${item.id}::${item.imageUrl.trim()}`)
        .join('|')
      options.logHomeRefreshDebug('applied scene module', {
        module: 'banner',
        origin: params.origin,
        visualUpdate: nextBannerSignature === previousBannerSignature ? 'patch' : 'image-scan',
      })
    }
    if (appliedModules.includes('featured')) {
      options.logHomeRefreshDebug('applied scene module', {
        module: 'featured',
        origin: params.origin,
        visualUpdate:
          nextContent.featured.imageUrl.trim() === previousFeaturedImageUrl
            ? 'patch'
            : 'image-scan',
      })
    }
    if (appliedModules.includes('noticeBar')) {
      options.logHomeRefreshDebug('applied scene module', {
        module: 'noticeBar',
        origin: params.origin,
        visualUpdate: 'notice-reorder',
      })
    }
    if (appliedModules.includes('marketShell')) {
      options.logHomeRefreshDebug('applied scene module', {
        module: 'marketShell',
        origin: params.origin,
        visualUpdate: 'patch',
        marketQueryChanged,
      })
    }

    if (skippedModules.length > 0) {
      options.logHomeRefreshDebug('deferred scene modules', {
        origin: params.origin,
        modules: skippedModules,
      })
    }

    return { appliedModules, skippedModules, marketQueryChanged }
  }

  const applyHomeRailContent = (
    nextContent: HomeRailHomeContent,
    optionsForApply: { preserveMarketPresentation?: boolean } = {}
  ) => {
    options.homeContent.value = nextContent
    options.hasResolvedInitialHomeContent.value = true
    options.syncMarketTagSelection(nextContent.market.tags)

    if (
      !optionsForApply.preserveMarketPresentation ||
      !options.hasBootstrappedMarketResults.value
    ) {
      options.replaceMarketCollectionImmediately(options.collection.value)
    }
    options.syncCurrentHomeVisualImages()
    options.syncBannerImageRevealStates()
    options.syncFeaturedImageRevealState()
  }

  const hydrateHomeRailContent = async (
    params: { force?: boolean; refreshRunId?: number } = {},
    preserveCurrentOnError = false
  ): Promise<RailSceneResolvedContent<HomeRailHomeContent> | null> => {
    const requestVersion = options.homeContentRequestVersion.value + 1
    options.homeContentRequestVersion.value = requestVersion
    const expectedRefreshRunId = params.refreshRunId ?? options.homeContentRefreshRunId.value
    try {
      const nextResolved = await resolveHomeRailHomeContent({ force: params.force })
      if (
        options.homeContentRequestVersion.value !== requestVersion ||
        options.homeContentRefreshRunId.value !== expectedRefreshRunId
      ) {
        return null
      }
      return nextResolved
    } catch (error) {
      logSafeError('homeRail.home', error, {
        message: 'failed to resolve home scene content',
      })
      if (
        options.homeContentRequestVersion.value !== requestVersion ||
        options.homeContentRefreshRunId.value !== expectedRefreshRunId
      ) {
        return null
      }
      if (!preserveCurrentOnError) {
        applyHomeRailContent(createHomeRailHomeContentShell())
        options.lastResolvedMeta.value = null
      }
      return null
    }
  }

  const syncDisplayedHomeSceneSnapshot = (
    resolved: RailSceneResolvedContent<HomeRailHomeContent>
  ) => {
    syncHomeRailHomeSceneSnapshot(resolved)
  }

  const setLastResolvedMeta = (
    target: Ref<RailSceneResolvedMeta | null>,
    meta: RailSceneResolvedMeta | null
  ) => {
    target.value = meta
  }

  return {
    applyHomeSceneModules,
    applyHomeRailContent,
    hydrateHomeRailContent,
    syncDisplayedHomeSceneSnapshot,
    setLastResolvedMeta,
  }
}
