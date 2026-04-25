// Responsibility: Manage market card reveal phase maps, scan timers, fallback promotion, and
// inactive resets for the home market grid.
// Out of scope: Surface reveal state, card rendering markup, or result window switching logic.

import { ref, type Ref } from 'vue'
import {
  shouldReplayRetainedForResultSource,
  type ResultLoadSource,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import type {
  HomeVisualImageDisplaySource,
  HomeVisualImageScope,
} from '../../../../composables/useHomeVisualImageState'

export type MarketCardRevealPhase = 'icon' | 'reveal-scan' | 'steady' | 'fallback'

interface UseHomeMarketCardVisualRevealRuntimeOptions {
  mountedMarketItems: Ref<HomeMarketCard[]>
  isMarketCardPlaceholder: (itemId: string) => boolean
  isActive: Ref<boolean>
  marketCardImageScanDurationMs: number
  shouldSkipMarketCardRevealSync?: () => boolean
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

export const useHomeMarketCardVisualRevealRuntime = ({
  mountedMarketItems,
  isMarketCardPlaceholder,
  isActive,
  marketCardImageScanDurationMs,
  shouldSkipMarketCardRevealSync,
  isHomeVisualImageRevealReady,
  resolveHomeVisualImageDisplaySource,
}: UseHomeMarketCardVisualRevealRuntimeOptions) => {
  const marketCardRevealPhaseMap = ref<Record<string, MarketCardRevealPhase>>({})
  const marketRevealScanTimeoutMap = new Map<string, ReturnType<typeof setTimeout>>()

  const resolveMarketImageUrl = (item: HomeMarketCard): string => item.imageUrl.trim()

  const hasMarketImage = (item: HomeMarketCard): boolean => resolveMarketImageUrl(item).length > 0

  const resolveMarketImageDisplaySource = (item: HomeMarketCard) => {
    return resolveHomeVisualImageDisplaySource('market', item.id, resolveMarketImageUrl(item))
  }

  const clearMarketRevealScanTimeout = (itemId: string) => {
    const timeoutId = marketRevealScanTimeoutMap.get(itemId)
    if (!timeoutId) {
      return
    }

    clearTimeout(timeoutId)
    marketRevealScanTimeoutMap.delete(itemId)
  }

  const clearMarketCardMotionTimeouts = (retainIds?: Set<string>) => {
    Array.from(marketRevealScanTimeoutMap.keys()).forEach((itemId) => {
      if (!retainIds || !retainIds.has(itemId)) {
        clearMarketRevealScanTimeout(itemId)
      }
    })
  }

  const resolveMarketCardPresentationPhase = (
    item: HomeMarketCard,
    forcedPhase?: MarketCardRevealPhase
  ): MarketCardRevealPhase => {
    if (forcedPhase) {
      return forcedPhase
    }

    const phase = marketCardRevealPhaseMap.value[item.id]
    if (phase) {
      return phase
    }

    if (!resolveMarketImageUrl(item)) {
      return 'fallback'
    }

    return 'icon'
  }

  const resolveRetainedMarketRevealPhase = (item: HomeMarketCard): MarketCardRevealPhase => {
    const imageUrl = resolveMarketImageUrl(item)
    if (!imageUrl) {
      return 'fallback'
    }

    const currentPhase = marketCardRevealPhaseMap.value[item.id]
    if (currentPhase) {
      return currentPhase
    }

    if (!isHomeVisualImageRevealReady('market', item.id, imageUrl)) {
      return 'icon'
    }

    return resolveMarketImageDisplaySource(item) === 'fallback' ? 'fallback' : 'steady'
  }

  const buildNextMarketRevealPhaseMap = (
    diff: ResultWindowDiff<HomeMarketCard>,
    motionSource: ResultLoadSource
  ) => {
    return diff.nextWindow.reduce<Record<string, MarketCardRevealPhase>>((result, item) => {
      const reuseMode = diff.addedIds.has(item.id)
        ? 'added'
        : diff.retainedImageChangedIds.has(item.id)
          ? 'retained-image-changed'
          : diff.retainedIds.has(item.id)
            ? 'retained'
            : null

      if (!hasMarketImage(item)) {
        result[item.id] = 'fallback'
        return result
      }

      if (reuseMode === 'retained') {
        result[item.id] = shouldReplayRetainedForResultSource(motionSource)
          ? 'icon'
          : resolveRetainedMarketRevealPhase(item)
        return result
      }

      result[item.id] = 'icon'
      return result
    }, {})
  }

  const setMarketCardRevealPhase = (itemId: string, phase: MarketCardRevealPhase) => {
    if (marketCardRevealPhaseMap.value[itemId] === phase) {
      return
    }

    marketCardRevealPhaseMap.value = {
      ...marketCardRevealPhaseMap.value,
      [itemId]: phase,
    }
  }

  const applyMarketCardFallback = (itemId: string) => {
    clearMarketRevealScanTimeout(itemId)
    setMarketCardRevealPhase(itemId, 'fallback')
  }

  const startMarketRevealScan = (itemId: string) => {
    clearMarketRevealScanTimeout(itemId)
    setMarketCardRevealPhase(itemId, 'reveal-scan')
    marketRevealScanTimeoutMap.set(
      itemId,
      setTimeout(() => {
        marketRevealScanTimeoutMap.delete(itemId)
        if (marketCardRevealPhaseMap.value[itemId] !== 'reveal-scan') {
          return
        }

        setMarketCardRevealPhase(itemId, 'steady')
      }, marketCardImageScanDurationMs)
    )
  }

  const syncMarketCardRevealStates = (items: HomeMarketCard[] = mountedMarketItems.value) => {
    if (shouldSkipMarketCardRevealSync?.()) {
      return
    }

    const activeItems = items.filter((item) => !isMarketCardPlaceholder(item.id))

    activeItems.forEach((item) => {
      const imageUrl = resolveMarketImageUrl(item)
      const itemId = item.id
      const currentPhase = marketCardRevealPhaseMap.value[itemId] ?? 'icon'
      if (!imageUrl) {
        clearMarketRevealScanTimeout(itemId)
        setMarketCardRevealPhase(itemId, 'fallback')
        return
      }

      const revealReady = isHomeVisualImageRevealReady('market', itemId, imageUrl)
      const displaySource = revealReady ? resolveMarketImageDisplaySource(item) : 'fallback'

      if (!revealReady) {
        clearMarketRevealScanTimeout(itemId)
        if (currentPhase !== 'fallback') {
          setMarketCardRevealPhase(itemId, 'icon')
        }
        return
      }

      if (displaySource === 'fallback') {
        applyMarketCardFallback(itemId)
        return
      }

      if (currentPhase === 'reveal-scan' || currentPhase === 'steady') {
        return
      }

      if (!isActive.value) {
        return
      }

      startMarketRevealScan(itemId)
    })

    const activeIds = new Set(activeItems.map((item) => item.id))
    marketCardRevealPhaseMap.value = Object.fromEntries(
      Object.entries(marketCardRevealPhaseMap.value).filter(([itemId]) => activeIds.has(itemId))
    )
  }

  const resetHomeMarketCardVisualRevealForInactive = () => {
    marketCardRevealPhaseMap.value = Object.fromEntries(
      Object.entries(marketCardRevealPhaseMap.value).map(([itemId, phase]) => [
        itemId,
        phase === 'reveal-scan' ? 'icon' : phase,
      ])
    )
  }

  const disposeHomeMarketCardVisualReveal = () => {
    clearMarketCardMotionTimeouts()
  }

  return {
    marketCardRevealPhaseMap,
    buildNextMarketRevealPhaseMap,
    clearMarketCardMotionTimeouts,
    disposeHomeMarketCardVisualReveal,
    hasMarketImage,
    resetHomeMarketCardVisualRevealForInactive,
    resolveMarketCardPresentationPhase,
    resolveMarketImageDisplaySource,
    resolveMarketImageUrl,
    syncMarketCardRevealStates,
  }
}
