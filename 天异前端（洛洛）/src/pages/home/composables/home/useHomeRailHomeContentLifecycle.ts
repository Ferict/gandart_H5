/**
 * Responsibility: coordinate home rail first-screen initialization, refresh, active
 * checks, and visible-update checks for the home page shell.
 * Out of scope: query watchers, visual reveal runtime, result-window timing, template
 * presentation, and navigation execution.
 */
import { nextTick, type ComputedRef, type Ref } from 'vue'
import type { HomeRailHomeContent } from '../../../../models/home-rail/homeRailHome.model'
import type {
  HomeRailHomeSceneModuleKey,
  HomeRailMarketCardListResult,
  ResolveHomeRailMarketCardListInput,
} from '../../../../services/home-rail/homeRailHomeContent.service'
import type {
  RailSceneResolvedContent,
  RailSceneResolvedMeta,
} from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import type { ResultLoadSource } from '../../../../services/home-rail/homeRailResultWindow.service'
import {
  hydrateHomeSceneFromPersistentCache,
  persistHomeSceneToPersistentCache,
} from '../../../../services/home-rail/homeRailPersistentCacheIntegration.service'
import {
  markHomeRailHomeSceneModulesDisplayed,
  resolveHomeRailHomeActivationUpdate,
  resolveHomeRailHomeVisibleUpdate,
  syncHomeRailHomeMarketQuerySnapshot,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'

type RailRefreshReason = 'pull-refresh'

interface ReloadMarketListOptions {
  preserveVisibleCount?: boolean
  immediate?: boolean
  forceReplay?: boolean
  motionSource?: ResultLoadSource
  force?: boolean
}

interface ApplyResolvedMarketListOptions {
  preserveVisibleCount?: boolean
  immediate?: boolean
  motionSource?: ResultLoadSource
}

interface UseHomeRailHomeContentLifecycleOptions {
  isActive: ComputedRef<boolean>
  hasResolvedInitialHomeContent: Ref<boolean>
  homeContentRefreshRunId: Ref<number>
  homeActivationCheckVersion: Ref<number>
  lastResolvedMeta: Ref<RailSceneResolvedMeta | null>
  marketListQuerySignature: ComputedRef<string>
  clearHomeMarketSearchState: () => void
  clearStagedMarketListUpdate: () => void
  hydrateHomeRailContent: (
    params?: { force?: boolean; refreshRunId?: number },
    preserveCurrentOnError?: boolean
  ) => Promise<RailSceneResolvedContent<HomeRailHomeContent> | null>
  applyHomeRailContent: (
    nextContent: HomeRailHomeContent,
    options?: { preserveMarketPresentation?: boolean; preserveMarketSort?: boolean }
  ) => void
  syncDisplayedHomeSceneSnapshot: (resolved: RailSceneResolvedContent<HomeRailHomeContent>) => void
  applyHomeSceneModules: (
    modules: HomeRailHomeSceneModuleKey[],
    nextContent: HomeRailHomeContent,
    params: { origin: 'visible' | 'activation' }
  ) => { appliedModules: HomeRailHomeSceneModuleKey[]; marketQueryChanged: boolean }
  reloadMarketList: (options?: ReloadMarketListOptions) => Promise<void>
  consumeStagedMarketListUpdate: (
    querySignature: string
  ) => { payload: HomeRailMarketCardListResult } | null
  applyResolvedMarketListResult: (
    list: HomeRailMarketCardListResult,
    options?: ApplyResolvedMarketListOptions
  ) => void
  stageMarketListUpdate: (
    payload: HomeRailMarketCardListResult,
    querySignature: string,
    origin: 'visible-update' | 'activation-apply'
  ) => void
  logHomeRefreshDebug: (message: string, detail?: unknown) => void
  hydrateRemoteMarketListFromPersistentCache: (
    query: ResolveHomeRailMarketCardListInput
  ) => Promise<HomeRailMarketCardListResult | null>
  resolveMarketListQuerySnapshot: () => ResolveHomeRailMarketCardListInput
  startHomePullRefreshPresentation: (refreshStartedAt: number) => void
}

export const useHomeRailHomeContentLifecycle = (
  options: UseHomeRailHomeContentLifecycleOptions
) => {
  const refreshContent = async (params: { force?: boolean; reason?: RailRefreshReason } = {}) => {
    const refreshStartedAt = Date.now()
    const refreshRunId = options.homeContentRefreshRunId.value + 1
    options.homeContentRefreshRunId.value = refreshRunId
    const refreshReason = params.reason ?? 'pull-refresh'
    options.clearStagedMarketListUpdate()
    if (refreshReason === 'pull-refresh') {
      options.clearHomeMarketSearchState()
    }
    const nextResolved = await options.hydrateHomeRailContent(
      {
        force: params.force ?? true,
        refreshRunId,
      },
      true
    )
    if (!nextResolved) {
      return
    }

    options.applyHomeRailContent(nextResolved.content, {
      preserveMarketPresentation: true,
      preserveMarketSort: true,
    })
    options.lastResolvedMeta.value = nextResolved.meta
    options.syncDisplayedHomeSceneSnapshot(nextResolved)
    await persistHomeSceneToPersistentCache(nextResolved)
    await nextTick()
    if (refreshReason === 'pull-refresh') {
      options.startHomePullRefreshPresentation(refreshStartedAt)
    }
  }

  const runHomeActivationCheck = async (params: { allowNetworkFallback?: boolean } = {}) => {
    if (!options.hasResolvedInitialHomeContent.value) {
      return
    }

    const activationVersion = options.homeActivationCheckVersion.value + 1
    options.homeActivationCheckVersion.value = activationVersion
    const update = await resolveHomeRailHomeActivationUpdate(params)
    if (!options.isActive.value || options.homeActivationCheckVersion.value !== activationVersion) {
      return
    }

    if (update.scene) {
      const { appliedModules, marketQueryChanged } = options.applyHomeSceneModules(
        update.sceneChangedModules,
        update.scene.content,
        { origin: 'activation' }
      )
      if (appliedModules.length > 0) {
        options.lastResolvedMeta.value = update.scene.meta
        markHomeRailHomeSceneModulesDisplayed(update.scene, appliedModules)
      }
      if (marketQueryChanged) {
        options.clearStagedMarketListUpdate()
        await options.reloadMarketList({
          immediate: true,
          motionSource: 'activation-apply',
        })
        return
      }
    }

    const stagedMarketListUpdateValue = options.consumeStagedMarketListUpdate(
      options.marketListQuerySignature.value
    )
    const marketListUpdate = stagedMarketListUpdateValue?.payload ?? update.marketList
    if (marketListUpdate) {
      options.applyResolvedMarketListResult(marketListUpdate, {
        preserveVisibleCount: true,
        immediate: true,
        motionSource: 'activation-apply',
      })
      options.logHomeRefreshDebug('applied list update', {
        origin: 'activation',
        resourceType: 'market_item',
        visualUpdate: 'stale-apply',
        count: marketListUpdate.items.length,
      })
    }
  }

  const runHomeVisibleUpdateCheck = () => {
    if (!options.isActive.value || !options.hasResolvedInitialHomeContent.value) {
      return
    }

    const update = resolveHomeRailHomeVisibleUpdate()
    if (update.scene) {
      const { appliedModules } = options.applyHomeSceneModules(
        update.sceneChangedModules,
        update.scene.content,
        {
          origin: 'visible',
        }
      )
      if (appliedModules.length > 0) {
        options.lastResolvedMeta.value = update.scene.meta
        markHomeRailHomeSceneModulesDisplayed(update.scene, appliedModules)
      }
    }

    if (update.marketList) {
      options.stageMarketListUpdate(
        update.marketList,
        options.marketListQuerySignature.value,
        'visible-update'
      )
      options.logHomeRefreshDebug('staged list update', {
        origin: 'visible',
        resourceType: 'market_item',
        visualUpdate: 'stale-only',
        count: update.marketList.items.length,
      })
    }
  }

  const initializeHomeContent = async () => {
    const cachedScene = await hydrateHomeSceneFromPersistentCache()
    if (cachedScene) {
      options.applyHomeRailContent(cachedScene.content)
      options.lastResolvedMeta.value = cachedScene.meta
      options.syncDisplayedHomeSceneSnapshot(cachedScene)
    }
    const querySnapshot = options.resolveMarketListQuerySnapshot()
    syncHomeRailHomeMarketQuerySnapshot(querySnapshot)
    const cachedList = await options.hydrateRemoteMarketListFromPersistentCache(querySnapshot)
    if (cachedList) {
      options.applyResolvedMarketListResult(cachedList, {
        immediate: true,
        motionSource: 'initial-enter',
        preserveVisibleCount: false,
      })
    }

    const initialResolved = await options.hydrateHomeRailContent()
    if (initialResolved) {
      options.applyHomeRailContent(initialResolved.content)
      options.lastResolvedMeta.value = initialResolved.meta
      options.syncDisplayedHomeSceneSnapshot(initialResolved)
      await persistHomeSceneToPersistentCache(initialResolved)
    } else if (!cachedScene) {
      return
    }

    syncHomeRailHomeMarketQuerySnapshot(options.resolveMarketListQuerySnapshot())
    await options.reloadMarketList({
      immediate: !cachedList,
      motionSource: 'initial-enter',
      force: false,
    })
  }

  return {
    refreshContent,
    runHomeActivationCheck,
    runHomeVisibleUpdateCheck,
    initializeHomeContent,
  }
}
