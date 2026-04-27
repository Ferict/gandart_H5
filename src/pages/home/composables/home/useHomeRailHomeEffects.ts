/**
 * Responsibility: own the home rail effect wiring, including mount orchestration,
 * watcher registration, and inactive cleanup for the home page shell.
 * Out of scope: content-source parsing, navigation execution, pure presentation mapping,
 * and template structure.
 */
import { onBeforeUnmount, onMounted, watch, type ComputedRef, type Ref } from 'vue'
import type {
  HomeBannerItem,
  HomeFeaturedDropContent,
  HomeMarketCard,
  HomeMarketTag,
} from '../../../../models/home-rail/homeRailHome.model'
import type {
  HomeVisualImageDisplaySource,
  HomeVisualImageScope,
} from '../../../../composables/useHomeVisualImageState'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import { isResultMountWindowingSuspended } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import type { ResultLoadSource } from '../../../../services/home-rail/homeRailResultWindow.service'

interface UseHomeRailHomeEffectsOptions {
  marketTags: ComputedRef<HomeMarketTag[]>
  marketListQuery: ComputedRef<unknown>
  marketListQuerySignature: ComputedRef<string>
  homeBannerItems: ComputedRef<HomeBannerItem[]>
  bannerDrop: ComputedRef<HomeFeaturedDropContent>
  mountedMarketItems: Ref<HomeMarketCard[]>
  displayedCollection: Ref<HomeMarketCard[]>
  pendingCollection: Ref<HomeMarketCard[]>
  hasMoreMarketItems: ComputedRef<boolean>
  hasResolvedInitialHomeContent: Ref<boolean>
  hasSeenHomePageActivation: Ref<boolean>
  isActive: ComputedRef<boolean>
  homeForegroundSignal: Ref<unknown>
  homePollSignal: Ref<unknown>
  marketImageStateVersion: Ref<number>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  syncMarketTagSelection: (tags?: HomeMarketTag[]) => void
  syncMarketListQuerySnapshot: () => void
  clearStagedMarketListUpdate: () => void
  reloadMarketList: (options?: {
    preserveVisibleCount?: boolean
    immediate?: boolean
    forceReplay?: boolean
    motionSource?:
      | 'initial-enter'
      | 'manual-query-switch'
      | 'manual-refresh'
      | 'load-more'
      | 'activation-apply'
    force?: boolean
  }) => Promise<void>
  resolveBannerImageUrl: (item: HomeBannerItem) => string
  resolveFeaturedImageUrl: (item: HomeFeaturedDropContent) => string
  resolveMarketImageUrl: (item: HomeMarketCard) => string
  isHomeVisualImageRevealReady: (
    domain: HomeVisualImageScope,
    id: string,
    imageUrl: string
  ) => boolean
  resolveBannerImageDisplaySource: (item: HomeBannerItem) => HomeVisualImageDisplaySource
  resolveFeaturedImageDisplaySource: () => HomeVisualImageDisplaySource
  syncCurrentHomeVisualImages: () => void
  syncBannerImageRevealStates: () => void
  syncFeaturedImageRevealState: () => void
  syncMountedMarketWindow: (items?: HomeMarketCard[]) => void
  syncMarketCardRevealStates: (items?: HomeMarketCard[]) => void
  scheduleMarketMountWindowSync: () => void
  scheduleMarketLoadMoreObserver: () => Promise<void>
  resetHomeMarketResultWindowForInactive: () => void
  resetHomeVisualRevealForInactive: () => void
  resetHomeMarketQueryForInactive: () => void
  resetHomeLocalRuntimeForInactive: () => void
  startMarketResultSwitch: (
    nextCollection: HomeMarketCard[],
    options?: {
      preserveVisibleCount?: boolean
      forceReplay?: boolean
      motionSource?: ResultLoadSource
    }
  ) => Promise<void>
  runHomeActivationCheck: (options?: { allowNetworkFallback?: boolean }) => Promise<void>
  runHomeVisibleUpdateCheck: () => void
  disposeHomeMarketQueryState: () => void
  disposeHomeVisualReveal: () => void
  disposeHomeMarketResultWindow: () => void
  disposeHomeLocalRuntime: () => void
  initializeHomeContent: () => Promise<void>
}

export const useHomeRailHomeEffects = (options: UseHomeRailHomeEffectsOptions) => {
  onMounted(async () => {
    await options.initializeHomeContent()
  })

  watch(
    () => options.marketTags.value.map((tag) => tag.id).join('|'),
    () => {
      options.syncMarketTagSelection()
    },
    { immediate: true }
  )

  watch(
    options.marketListQuery,
    () => {
      options.syncMarketListQuerySnapshot()
    },
    { immediate: true, deep: true }
  )

  watch(options.marketListQuerySignature, () => {
    options.clearStagedMarketListUpdate()
    if (!options.hasResolvedInitialHomeContent.value) {
      return
    }

    void options.reloadMarketList({
      motionSource: 'manual-query-switch',
    })
  })

  watch(
    () =>
      [
        options.homeBannerItems.value
          .map((item) => `${item.id}::${options.resolveBannerImageUrl(item)}`)
          .join('|'),
        `${options.bannerDrop.value.id}::${options.resolveFeaturedImageUrl(options.bannerDrop.value)}`,
        options.mountedMarketItems.value
          .map((item) => `${item.id}::${options.resolveMarketImageUrl(item)}`)
          .join('|'),
      ].join('||'),
    () => {
      options.syncCurrentHomeVisualImages()
    },
    { immediate: true }
  )

  watch(
    () =>
      options.homeBannerItems.value
        .map((item) => {
          const imageUrl = options.resolveBannerImageUrl(item)
          if (!imageUrl) {
            return `${item.id}::`
          }

          return `${item.id}::${imageUrl}::${options.isHomeVisualImageRevealReady('banner', item.id, imageUrl) ? 1 : 0}::${options.resolveBannerImageDisplaySource(item)}`
        })
        .join('|'),
    () => {
      options.syncBannerImageRevealStates()
    },
    { immediate: true }
  )

  watch(
    () => {
      const imageUrl = options.resolveFeaturedImageUrl(options.bannerDrop.value)
      if (!imageUrl) {
        return `${options.bannerDrop.value.id}::`
      }

      return `${options.bannerDrop.value.id}::${imageUrl}::${options.isHomeVisualImageRevealReady('featured', options.bannerDrop.value.id, imageUrl) ? 1 : 0}::${options.resolveFeaturedImageDisplaySource()}`
    },
    () => {
      options.syncFeaturedImageRevealState()
    },
    { immediate: true }
  )

  watch(
    () => options.displayedCollection.value.map((item) => item.id).join('|'),
    () => {
      options.syncMountedMarketWindow(options.displayedCollection.value)
      options.syncMarketCardRevealStates(options.mountedMarketItems.value)
      if (options.isActive.value) {
        options.scheduleMarketMountWindowSync()
      }
    },
    { immediate: true }
  )

  watch(
    () => options.marketImageStateVersion.value,
    () => {
      options.syncMarketCardRevealStates(options.mountedMarketItems.value)
    }
  )

  watch(
    () =>
      [
        options.isActive.value ? 1 : 0,
        options.displayedCollection.value.length,
        options.pendingCollection.value.length,
        options.hasMoreMarketItems.value ? 1 : 0,
      ].join('|'),
    () => {
      void options.scheduleMarketLoadMoreObserver()
    },
    { immediate: true }
  )

  watch(
    () =>
      [
        options.isActive.value ? 1 : 0,
        options.displayedCollection.value.length,
        options.mountScrollMetrics.value?.isReady ? 1 : 0,
        options.mountScrollMetrics.value?.scrollTop ?? 0,
        options.mountScrollMetrics.value?.viewportHeight ?? 0,
        options.mountScrollMetrics.value?.viewportTop ?? 0,
        isResultMountWindowingSuspended(options.mountScrollMetrics.value) ? 1 : 0,
      ].join('|'),
    () => {
      if (!options.isActive.value) {
        return
      }

      options.scheduleMarketMountWindowSync()
    },
    { immediate: true }
  )

  watch(
    () => options.isActive.value,
    (isActive) => {
      if (!isActive) {
        options.resetHomeMarketResultWindowForInactive()
        options.resetHomeVisualRevealForInactive()
        options.resetHomeMarketQueryForInactive()
        options.resetHomeLocalRuntimeForInactive()
        return
      }

      const isFirstActivation = !options.hasSeenHomePageActivation.value
      options.hasSeenHomePageActivation.value = true
      options.scheduleMarketMountWindowSync()
      options.syncCurrentHomeVisualImages()
      options.syncMarketCardRevealStates(options.mountedMarketItems.value)
      void options.scheduleMarketLoadMoreObserver()
      if (
        isFirstActivation &&
        !options.displayedCollection.value.length &&
        options.pendingCollection.value.length
      ) {
        void options.startMarketResultSwitch(options.pendingCollection.value, {
          preserveVisibleCount: true,
        })
        return
      }
      if (!isFirstActivation) {
        void options.runHomeActivationCheck()
      }
    },
    { immediate: true }
  )

  watch(
    () => options.homeForegroundSignal.value,
    () => {
      if (!options.isActive.value || !options.hasSeenHomePageActivation.value) {
        return
      }

      void options.runHomeActivationCheck({ allowNetworkFallback: false })
    }
  )

  watch(
    () => options.homePollSignal.value,
    () => {
      if (!options.isActive.value || !options.hasSeenHomePageActivation.value) {
        return
      }

      options.runHomeVisibleUpdateCheck()
    }
  )

  onBeforeUnmount(() => {
    options.disposeHomeMarketQueryState()
    options.disposeHomeVisualReveal()
    options.disposeHomeMarketResultWindow()
    options.disposeHomeLocalRuntime()
  })
}
