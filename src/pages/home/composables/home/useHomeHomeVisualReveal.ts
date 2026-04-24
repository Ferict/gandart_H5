/**
 * Responsibility: manage home-surface visual reveal phases and shared image-ready state
 * for banner and featured modules on the home rail.
 * Out of scope: market card reveal runtime, refresh presentation replay, and home page
 * query or result-window orchestration.
 */
import { type ComputedRef, type Ref } from 'vue'
import {
  createHomeVisualImageStateKey,
  useHomeVisualImageState,
  type HomeVisualImageEntry,
  type HomeVisualImageScope,
} from '../../../../composables/useHomeVisualImageState'
import type {
  HomeBannerItem,
  HomeFeaturedDropContent,
  HomeMarketCard,
} from '../../../../models/home-rail/homeRailHome.model'
import {
  useHomeSurfaceVisualRevealRuntime,
  type HomeSurfaceRevealPhase,
} from './useHomeSurfaceVisualRevealRuntime'
import {
  useHomeMarketCardVisualRevealRuntime,
  type MarketCardRevealPhase,
} from './useHomeMarketCardVisualRevealRuntime'
export type { HomeSurfaceRevealPhase }
export type { MarketCardRevealPhase }

interface UseHomeHomeVisualRevealOptions {
  homeBannerItems: ComputedRef<HomeBannerItem[]>
  bannerDrop: ComputedRef<HomeFeaturedDropContent>
  mountedMarketItems: Ref<HomeMarketCard[]>
  isMarketCardPlaceholder: (itemId: string) => boolean
  isActive: Ref<boolean>
  marketCardImageScanDurationMs: number
  shouldSkipMarketCardRevealSync?: () => boolean
}

export const useHomeHomeVisualReveal = ({
  homeBannerItems,
  bannerDrop,
  mountedMarketItems,
  isMarketCardPlaceholder,
  isActive,
  marketCardImageScanDurationMs,
  shouldSkipMarketCardRevealSync,
}: UseHomeHomeVisualRevealOptions) => {
  const resolveMarketImageUrl = (item: HomeMarketCard): string => item.imageUrl.trim()

  const {
    syncHomeVisualImageState,
    markHomeVisualImageLoaded,
    markHomeVisualImageError,
    markHomeVisualImageRetrying,
    isHomeVisualImageRevealReady,
    resolveHomeVisualImageDisplaySource,
    marketImageStateVersion,
  } = useHomeVisualImageState()

  const resolveRequestStamp = (payload?: unknown) => {
    if (!payload || typeof payload !== 'object') {
      return undefined
    }

    const requestStamp = (payload as { requestStamp?: unknown }).requestStamp
    return typeof requestStamp === 'number' && Number.isFinite(requestStamp)
      ? requestStamp
      : undefined
  }

  const handleHomeVisualImageLoad = (
    scope: HomeVisualImageScope,
    resourceId: string,
    imageUrl: string,
    payload?: unknown
  ) => {
    markHomeVisualImageLoaded(scope, resourceId, imageUrl, resolveRequestStamp(payload))
    if (scope === 'banner') {
      syncBannerImageRevealStates()
    }
    if (scope === 'featured') {
      syncFeaturedImageRevealState()
    }
    if (scope === 'market') {
      syncMarketCardRevealStates()
    }
  }

  const handleHomeVisualImageError = (
    scope: HomeVisualImageScope,
    resourceId: string,
    imageUrl: string,
    payload?: unknown
  ) => {
    markHomeVisualImageError(scope, resourceId, imageUrl, resolveRequestStamp(payload))
    if (scope === 'banner') {
      syncBannerImageRevealStates()
    }
    if (scope === 'featured') {
      syncFeaturedImageRevealState()
    }
    if (scope === 'market') {
      syncMarketCardRevealStates()
    }
  }

  const handleHomeVisualImageRetrying = (
    scope: HomeVisualImageScope,
    resourceId: string,
    imageUrl: string,
    payload?: unknown
  ) => {
    markHomeVisualImageRetrying(scope, resourceId, imageUrl, resolveRequestStamp(payload))
    if (scope === 'featured') {
      syncFeaturedImageRevealState()
    }
    if (scope === 'market') {
      syncMarketCardRevealStates()
    }
  }

  const {
    bannerImageRevealPhaseMap,
    clearBannerRevealScanTimeout,
    clearFeaturedRevealScanTimeout,
    disposeHomeSurfaceVisualReveal,
    featuredImageRevealPhase,
    isBannerImageLoaded,
    isFeaturedImageLoaded,
    resetHomeSurfaceVisualRevealForInactive,
    resolveBannerImageDisplaySource,
    resolveBannerImagePresentationPhase,
    resolveBannerImageRevealKey,
    resolveBannerImageUrl,
    resolveFeaturedImageDisplaySource,
    resolveFeaturedImagePresentationPhase,
    resolveFeaturedImageUrl,
    setFeaturedImageRevealPhase,
    shouldShowBannerFallbackShell,
    syncBannerImageRevealStates,
    syncFeaturedImageRevealState,
  } = useHomeSurfaceVisualRevealRuntime({
    homeBannerItems,
    bannerDrop,
    isActive,
    marketCardImageScanDurationMs,
    isHomeVisualImageRevealReady,
    resolveHomeVisualImageDisplaySource,
  })

  const {
    marketCardRevealPhaseMap,
    buildNextMarketRevealPhaseMap,
    clearMarketCardMotionTimeouts,
    disposeHomeMarketCardVisualReveal,
    hasMarketImage,
    resetHomeMarketCardVisualRevealForInactive,
    resolveMarketCardPresentationPhase,
    resolveMarketImageDisplaySource,
    syncMarketCardRevealStates,
  } = useHomeMarketCardVisualRevealRuntime({
    mountedMarketItems,
    isMarketCardPlaceholder,
    isActive,
    marketCardImageScanDurationMs,
    shouldSkipMarketCardRevealSync,
    isHomeVisualImageRevealReady,
    resolveHomeVisualImageDisplaySource,
  })

  const appendHomeVisualImageEntry = (
    entryMap: Map<string, HomeVisualImageEntry>,
    entry: HomeVisualImageEntry
  ) => {
    const normalizedImageUrl = entry.imageUrl.trim()
    if (!normalizedImageUrl) {
      return
    }

    entryMap.set(createHomeVisualImageStateKey(entry.scope, entry.resourceId, normalizedImageUrl), {
      ...entry,
      imageUrl: normalizedImageUrl,
    })
  }

  const buildActiveHomeVisualImageEntries = (): HomeVisualImageEntry[] => {
    const entryMap = new Map<string, HomeVisualImageEntry>()

    homeBannerItems.value.forEach((item) => {
      appendHomeVisualImageEntry(entryMap, {
        scope: 'banner',
        resourceId: item.id,
        imageUrl: resolveBannerImageUrl(item),
      })
    })

    appendHomeVisualImageEntry(entryMap, {
      scope: 'featured',
      resourceId: bannerDrop.value.id,
      imageUrl: resolveFeaturedImageUrl(bannerDrop.value),
    })

    mountedMarketItems.value.forEach((item) => {
      if (isMarketCardPlaceholder(item.id)) {
        return
      }

      appendHomeVisualImageEntry(entryMap, {
        scope: 'market',
        resourceId: item.id,
        imageUrl: resolveMarketImageUrl(item),
      })
    })

    return Array.from(entryMap.values())
  }

  const syncCurrentHomeVisualImages = () => {
    syncHomeVisualImageState(buildActiveHomeVisualImageEntries())
  }

  const resetHomeVisualRevealForInactive = () => {
    resetHomeSurfaceVisualRevealForInactive()
    resetHomeMarketCardVisualRevealForInactive()
  }

  const disposeHomeVisualReveal = () => {
    disposeHomeSurfaceVisualReveal()
    disposeHomeMarketCardVisualReveal()
  }

  return {
    bannerImageRevealPhaseMap,
    featuredImageRevealPhase,
    marketCardRevealPhaseMap,
    marketImageStateVersion,
    handleHomeVisualImageLoad,
    handleHomeVisualImageError,
    handleHomeVisualImageRetrying,
    hasMarketImage,
    isBannerImageLoaded,
    isFeaturedImageLoaded,
    resolveBannerImageDisplaySource,
    resolveBannerImagePresentationPhase,
    resolveBannerImageRevealKey,
    resolveBannerImageUrl,
    resolveFeaturedImageDisplaySource,
    resolveFeaturedImagePresentationPhase,
    resolveFeaturedImageUrl,
    resolveMarketCardPresentationPhase,
    resolveMarketImageDisplaySource,
    resolveMarketImageUrl,
    shouldShowBannerFallbackShell,
    buildNextMarketRevealPhaseMap,
    clearBannerRevealScanTimeout,
    clearFeaturedRevealScanTimeout,
    clearMarketCardMotionTimeouts,
    setFeaturedImageRevealPhase,
    syncBannerImageRevealStates,
    syncCurrentHomeVisualImages,
    syncFeaturedImageRevealState,
    syncMarketCardRevealStates,
    resetHomeVisualRevealForInactive,
    disposeHomeVisualReveal,
    isHomeVisualImageRevealReady,
  }
}
