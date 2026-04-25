// Responsibility: Manage banner and featured-surface reveal phases, fallback timers, and
// inactive resets for the home shell visual surfaces.
// Out of scope: Market card reveal state, image loading transport, or page-level refresh logic.

import { computed, ref, type ComputedRef, type Ref } from 'vue'
import {
  createHomeVisualImageStateKey,
  type HomeVisualImageDisplaySource,
  type HomeVisualImageScope,
} from '../../../../composables/useHomeVisualImageState'
import type {
  HomeBannerItem,
  HomeFeaturedDropContent,
} from '../../../../models/home-rail/homeRailHome.model'

export type HomeSurfaceRevealPhase = 'icon' | 'reveal-scan' | 'steady' | 'fallback'

interface UseHomeSurfaceVisualRevealRuntimeOptions {
  homeBannerItems: ComputedRef<HomeBannerItem[]>
  bannerDrop: ComputedRef<HomeFeaturedDropContent>
  isActive: Ref<boolean>
  marketCardImageScanDurationMs: number
  isHomeVisualImageRevealReady: (
    scope: HomeVisualImageScope,
    resourceId: string,
    imageUrl: string
  ) => boolean
  resolveHomeVisualImageDisplaySource: (
    scope: HomeVisualImageScope,
    resourceId: string,
    imageUrl: string
  ) => HomeVisualImageDisplaySource
}

export const useHomeSurfaceVisualRevealRuntime = ({
  homeBannerItems,
  bannerDrop,
  isActive,
  marketCardImageScanDurationMs,
  isHomeVisualImageRevealReady,
  resolveHomeVisualImageDisplaySource,
}: UseHomeSurfaceVisualRevealRuntimeOptions) => {
  const resolveBannerImageUrl = (item: HomeBannerItem): string => item.imageUrl.trim()
  const resolveFeaturedImageUrl = (item: HomeFeaturedDropContent): string => item.imageUrl.trim()

  const bannerImageRevealPhaseMap = ref<Record<string, HomeSurfaceRevealPhase>>({})
  const featuredImageRevealPhase = ref<HomeSurfaceRevealPhase>('icon')

  const bannerRevealScanTimeoutMap = new Map<string, ReturnType<typeof setTimeout>>()
  let featuredRevealScanTimeoutId: ReturnType<typeof setTimeout> | null = null

  const hasBannerRemoteImage = (item: HomeBannerItem): boolean =>
    resolveBannerImageUrl(item).length > 0

  const resolveBannerImageDisplaySource = (item: HomeBannerItem) => {
    return resolveHomeVisualImageDisplaySource('banner', item.id, resolveBannerImageUrl(item))
  }

  const resolveBannerImageRevealKey = (item: HomeBannerItem) => {
    return createHomeVisualImageStateKey('banner', item.id, resolveBannerImageUrl(item))
  }

  const isBannerImageLoaded = (item: HomeBannerItem): boolean => {
    const imageUrl = resolveBannerImageUrl(item)
    if (!imageUrl) {
      return false
    }

    return resolveBannerImageDisplaySource(item) !== 'fallback'
  }

  const resolveBannerImagePresentationPhase = (item: HomeBannerItem): HomeSurfaceRevealPhase => {
    if (!hasBannerRemoteImage(item)) {
      return 'fallback'
    }

    const revealKey = resolveBannerImageRevealKey(item)
    return bannerImageRevealPhaseMap.value[revealKey] ?? 'icon'
  }

  const shouldShowBannerFallbackShell = (item: HomeBannerItem) => {
    const phase = resolveBannerImagePresentationPhase(item)
    return phase !== 'reveal-scan' && phase !== 'steady'
  }

  const resolveFeaturedImageDisplaySource = () => {
    return resolveHomeVisualImageDisplaySource(
      'featured',
      bannerDrop.value.id,
      resolveFeaturedImageUrl(bannerDrop.value)
    )
  }

  const isFeaturedImageLoaded = computed(() => {
    const imageUrl = resolveFeaturedImageUrl(bannerDrop.value)
    if (!imageUrl) {
      return false
    }

    return resolveFeaturedImageDisplaySource() !== 'fallback'
  })

  const resolveFeaturedImagePresentationPhase = (): HomeSurfaceRevealPhase => {
    const imageUrl = resolveFeaturedImageUrl(bannerDrop.value)
    if (!imageUrl) {
      return 'fallback'
    }

    return featuredImageRevealPhase.value
  }

  const clearBannerRevealScanTimeout = (revealKey: string) => {
    const timeoutId = bannerRevealScanTimeoutMap.get(revealKey)
    if (!timeoutId) {
      return
    }

    clearTimeout(timeoutId)
    bannerRevealScanTimeoutMap.delete(revealKey)
  }

  const clearFeaturedRevealScanTimeout = () => {
    if (!featuredRevealScanTimeoutId) {
      return
    }

    clearTimeout(featuredRevealScanTimeoutId)
    featuredRevealScanTimeoutId = null
  }

  const setBannerImageRevealPhase = (revealKey: string, phase: HomeSurfaceRevealPhase) => {
    if (bannerImageRevealPhaseMap.value[revealKey] === phase) {
      return
    }

    bannerImageRevealPhaseMap.value = {
      ...bannerImageRevealPhaseMap.value,
      [revealKey]: phase,
    }
  }

  const setFeaturedImageRevealPhase = (phase: HomeSurfaceRevealPhase) => {
    if (featuredImageRevealPhase.value === phase) {
      return
    }

    featuredImageRevealPhase.value = phase
  }

  const startBannerRevealScan = (revealKey: string) => {
    clearBannerRevealScanTimeout(revealKey)
    setBannerImageRevealPhase(revealKey, 'reveal-scan')
    bannerRevealScanTimeoutMap.set(
      revealKey,
      setTimeout(() => {
        bannerRevealScanTimeoutMap.delete(revealKey)
        if (bannerImageRevealPhaseMap.value[revealKey] !== 'reveal-scan') {
          return
        }

        setBannerImageRevealPhase(revealKey, 'steady')
      }, marketCardImageScanDurationMs)
    )
  }

  const startFeaturedRevealScan = () => {
    clearFeaturedRevealScanTimeout()
    setFeaturedImageRevealPhase('reveal-scan')
    featuredRevealScanTimeoutId = setTimeout(() => {
      featuredRevealScanTimeoutId = null
      if (featuredImageRevealPhase.value !== 'reveal-scan') {
        return
      }

      setFeaturedImageRevealPhase('steady')
    }, marketCardImageScanDurationMs)
  }

  const syncBannerImageRevealStates = (items: HomeBannerItem[] = homeBannerItems.value) => {
    const staleRevealKeys = new Set(Object.keys(bannerImageRevealPhaseMap.value))

    items.forEach((item) => {
      const imageUrl = resolveBannerImageUrl(item)
      if (!imageUrl) {
        return
      }

      const revealKey = resolveBannerImageRevealKey(item)
      staleRevealKeys.delete(revealKey)

      const currentPhase = bannerImageRevealPhaseMap.value[revealKey] ?? 'icon'
      const revealReady = isHomeVisualImageRevealReady('banner', item.id, imageUrl)
      const displaySource = revealReady ? resolveBannerImageDisplaySource(item) : 'fallback'

      if (!revealReady) {
        clearBannerRevealScanTimeout(revealKey)
        if (currentPhase !== 'icon') {
          setBannerImageRevealPhase(revealKey, 'icon')
        }
        return
      }

      if (displaySource === 'fallback') {
        clearBannerRevealScanTimeout(revealKey)
        setBannerImageRevealPhase(revealKey, 'fallback')
        return
      }

      if (currentPhase === 'reveal-scan' || currentPhase === 'steady') {
        return
      }

      if (!isActive.value) {
        return
      }

      startBannerRevealScan(revealKey)
    })

    if (staleRevealKeys.size <= 0) {
      return
    }

    const nextPhaseMap = { ...bannerImageRevealPhaseMap.value }
    staleRevealKeys.forEach((revealKey) => {
      clearBannerRevealScanTimeout(revealKey)
      delete nextPhaseMap[revealKey]
    })
    bannerImageRevealPhaseMap.value = nextPhaseMap
  }

  const syncFeaturedImageRevealState = () => {
    const imageUrl = resolveFeaturedImageUrl(bannerDrop.value)
    if (!imageUrl) {
      clearFeaturedRevealScanTimeout()
      setFeaturedImageRevealPhase('fallback')
      return
    }

    const revealReady = isHomeVisualImageRevealReady('featured', bannerDrop.value.id, imageUrl)
    const displaySource = revealReady ? resolveFeaturedImageDisplaySource() : 'fallback'

    if (!revealReady) {
      clearFeaturedRevealScanTimeout()
      setFeaturedImageRevealPhase('icon')
      return
    }

    if (displaySource === 'fallback') {
      clearFeaturedRevealScanTimeout()
      setFeaturedImageRevealPhase('fallback')
      return
    }

    if (
      featuredImageRevealPhase.value === 'reveal-scan' ||
      featuredImageRevealPhase.value === 'steady'
    ) {
      return
    }

    if (!isActive.value) {
      return
    }

    startFeaturedRevealScan()
  }

  const resetHomeSurfaceVisualRevealForInactive = () => {
    Array.from(bannerRevealScanTimeoutMap.keys()).forEach((revealKey) => {
      clearBannerRevealScanTimeout(revealKey)
    })
    bannerImageRevealPhaseMap.value = Object.fromEntries(
      Object.entries(bannerImageRevealPhaseMap.value).map(([revealKey, phase]) => [
        revealKey,
        phase === 'reveal-scan' ? 'icon' : phase,
      ])
    )
    clearFeaturedRevealScanTimeout()
    if (featuredImageRevealPhase.value === 'reveal-scan') {
      setFeaturedImageRevealPhase('icon')
    }
  }

  const disposeHomeSurfaceVisualReveal = () => {
    Array.from(bannerRevealScanTimeoutMap.keys()).forEach((revealKey) => {
      clearBannerRevealScanTimeout(revealKey)
    })
    clearFeaturedRevealScanTimeout()
  }

  return {
    bannerImageRevealPhaseMap,
    featuredImageRevealPhase,
    clearBannerRevealScanTimeout,
    clearFeaturedRevealScanTimeout,
    disposeHomeSurfaceVisualReveal,
    hasBannerRemoteImage,
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
  }
}
