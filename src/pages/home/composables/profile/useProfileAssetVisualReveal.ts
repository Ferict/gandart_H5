/**
 * Responsibility: manage visual reveal state for profile asset result items, including
 * image readiness, fallback state, and retained replay decisions.
 * Out of scope: profile result-window switching, query execution, and asset data
 * normalization.
 */
import { ref, type ComputedRef, type Ref } from 'vue'
import { useHomeVisualImageState } from '../../../../composables/useHomeVisualImageState'
import type { HomePlaceholderIconKey } from '../../../../models/home-rail/homeRailHome.model'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import {
  shouldReplayRetainedForResultSource,
  type ResultLoadSource,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'

export type ProfileAssetRevealPhase = 'icon' | 'reveal-scan' | 'steady' | 'fallback'

interface UseProfileAssetVisualRevealOptions {
  mountedAssets: Ref<ProfileAssetItem[]>
  isPanelActive: ComputedRef<boolean>
  isProfileAssetPlaceholder: (itemId: string) => boolean
  revealScanDurationMs: number
}

const profilePlaceholderIconRegistry: Record<HomePlaceholderIconKey, AetherIconName> = {
  box: 'box',
  cpu: 'cpu',
  aperture: 'aperture',
  hexagon: 'hexagon',
  triangle: 'triangle',
  disc3: 'disc-3',
}

export const useProfileAssetVisualReveal = ({
  mountedAssets,
  isPanelActive,
  isProfileAssetPlaceholder,
  revealScanDurationMs,
}: UseProfileAssetVisualRevealOptions) => {
  const {
    syncHomeVisualImageState,
    markHomeVisualImageLoaded,
    markHomeVisualImageError,
    markHomeVisualImageRetrying,
    isHomeVisualImageRevealReady,
    resolveHomeVisualImageDisplaySource,
    profileAssetImageStateVersion,
  } = useHomeVisualImageState()

  const profileAssetRevealPhaseMap = ref<Record<string, ProfileAssetRevealPhase>>({})
  const profileAssetRevealTimeoutMap = new Map<string, ReturnType<typeof setTimeout>>()

  const resolveProfileAssetImageUrl = (item: ProfileAssetItem): string => item.imageUrl.trim()

  const resolveProfileAssetPlaceholderIcon = (item: ProfileAssetItem): AetherIconName => {
    return profilePlaceholderIconRegistry[item.placeholderIconKey ?? 'box']
  }

  const clearProfileAssetRevealTimeout = (itemId: string) => {
    const timeoutId = profileAssetRevealTimeoutMap.get(itemId)
    if (!timeoutId) {
      return
    }

    clearTimeout(timeoutId)
    profileAssetRevealTimeoutMap.delete(itemId)
  }

  const clearProfileAssetRevealTimeouts = (retainIds?: Set<string>) => {
    Array.from(profileAssetRevealTimeoutMap.keys()).forEach((itemId) => {
      if (!retainIds || !retainIds.has(itemId)) {
        clearProfileAssetRevealTimeout(itemId)
      }
    })
  }

  const setProfileAssetRevealPhase = (itemId: string, phase: ProfileAssetRevealPhase) => {
    if (profileAssetRevealPhaseMap.value[itemId] === phase) {
      return
    }

    profileAssetRevealPhaseMap.value = {
      ...profileAssetRevealPhaseMap.value,
      [itemId]: phase,
    }
  }

  const setProfileAssetRevealPhaseMap = (phaseMap: Record<string, ProfileAssetRevealPhase>) => {
    profileAssetRevealPhaseMap.value = phaseMap
  }

  const syncProfileAssetVisualImages = (list: ProfileAssetItem[] = mountedAssets.value) => {
    syncHomeVisualImageState(
      list
        .filter((item) => !isProfileAssetPlaceholder(item.id))
        .map((item) => ({
          scope: 'profileAsset' as const,
          resourceId: item.id,
          imageUrl: resolveProfileAssetImageUrl(item),
        }))
    )
  }

  const resolveProfileAssetDisplaySource = (item: ProfileAssetItem) => {
    return resolveHomeVisualImageDisplaySource(
      'profileAsset',
      item.id,
      resolveProfileAssetImageUrl(item)
    )
  }

  const resolveProfileAssetRevealPhase = (item: ProfileAssetItem): ProfileAssetRevealPhase => {
    return profileAssetRevealPhaseMap.value[item.id] ?? 'icon'
  }

  const resolveProfileAssetRemovedOverlayRevealPhase = (
    item: ProfileAssetItem
  ): ProfileAssetRevealPhase => {
    return resolveProfileAssetImageUrl(item) ? 'steady' : 'fallback'
  }

  const resolveRetainedProfileAssetRevealPhase = (
    item: ProfileAssetItem
  ): ProfileAssetRevealPhase => {
    const imageUrl = resolveProfileAssetImageUrl(item)
    if (!imageUrl) {
      return 'fallback'
    }

    const currentPhase = profileAssetRevealPhaseMap.value[item.id]
    if (currentPhase) {
      return currentPhase
    }

    if (!isHomeVisualImageRevealReady('profileAsset', item.id, imageUrl)) {
      return 'icon'
    }

    return resolveProfileAssetDisplaySource(item) === 'fallback' ? 'fallback' : 'steady'
  }

  const resolveProfileAssetInitialRevealPhase = (
    item: ProfileAssetItem,
    preserveReadyRevealPhase: boolean
  ): ProfileAssetRevealPhase => {
    const imageUrl = resolveProfileAssetImageUrl(item)
    if (!imageUrl) {
      return 'fallback'
    }

    if (!preserveReadyRevealPhase) {
      return 'icon'
    }

    if (!isHomeVisualImageRevealReady('profileAsset', item.id, imageUrl)) {
      return 'icon'
    }

    return resolveProfileAssetDisplaySource(item) === 'fallback' ? 'fallback' : 'steady'
  }

  const buildNextProfileAssetRevealPhaseMap = (
    diff: ResultWindowDiff<ProfileAssetItem>,
    motionSource: ResultLoadSource
  ) => {
    return diff.nextWindow.reduce<Record<string, ProfileAssetRevealPhase>>((result, item) => {
      const reuseMode = diff.addedIds.has(item.id)
        ? 'added'
        : diff.retainedImageChangedIds.has(item.id)
          ? 'retained-image-changed'
          : diff.retainedIds.has(item.id)
            ? 'retained'
            : null
      const imageUrl = resolveProfileAssetImageUrl(item)
      if (!imageUrl) {
        result[item.id] = 'fallback'
        return result
      }

      if (reuseMode === 'retained') {
        result[item.id] = shouldReplayRetainedForResultSource(motionSource)
          ? 'icon'
          : resolveRetainedProfileAssetRevealPhase(item)
        return result
      }

      result[item.id] = 'icon'
      return result
    }, {})
  }

  const startProfileAssetRevealScan = (itemId: string) => {
    clearProfileAssetRevealTimeout(itemId)
    setProfileAssetRevealPhase(itemId, 'reveal-scan')
    profileAssetRevealTimeoutMap.set(
      itemId,
      setTimeout(() => {
        profileAssetRevealTimeoutMap.delete(itemId)
        if (profileAssetRevealPhaseMap.value[itemId] !== 'reveal-scan') {
          return
        }

        setProfileAssetRevealPhase(itemId, 'steady')
      }, revealScanDurationMs)
    )
  }

  const syncProfileAssetRevealPhases = (list: ProfileAssetItem[] = mountedAssets.value) => {
    const activeItems = list.filter((item) => !isProfileAssetPlaceholder(item.id))
    const activeIds = new Set(activeItems.map((item) => item.id))

    activeItems.forEach((item) => {
      const imageUrl = resolveProfileAssetImageUrl(item)
      if (!imageUrl) {
        clearProfileAssetRevealTimeout(item.id)
        setProfileAssetRevealPhase(item.id, 'icon')
        return
      }

      if (!isHomeVisualImageRevealReady('profileAsset', item.id, imageUrl)) {
        clearProfileAssetRevealTimeout(item.id)
        setProfileAssetRevealPhase(item.id, 'icon')
        return
      }

      if (resolveProfileAssetDisplaySource(item) === 'fallback') {
        clearProfileAssetRevealTimeout(item.id)
        setProfileAssetRevealPhase(item.id, 'fallback')
        return
      }

      const currentPhase = profileAssetRevealPhaseMap.value[item.id]
      if (currentPhase === 'steady' || currentPhase === 'reveal-scan') {
        return
      }

      if (!isPanelActive.value) {
        return
      }

      startProfileAssetRevealScan(item.id)
    })

    Array.from(profileAssetRevealTimeoutMap.keys()).forEach((itemId) => {
      if (!activeIds.has(itemId)) {
        clearProfileAssetRevealTimeout(itemId)
      }
    })

    profileAssetRevealPhaseMap.value = Object.fromEntries(
      Object.entries(profileAssetRevealPhaseMap.value).filter(([itemId]) => activeIds.has(itemId))
    )
  }

  const resolveRequestStamp = (payload?: unknown) => {
    if (!payload || typeof payload !== 'object') {
      return undefined
    }

    const requestStamp = (payload as { requestStamp?: unknown }).requestStamp
    return typeof requestStamp === 'number' && Number.isFinite(requestStamp)
      ? requestStamp
      : undefined
  }

  const handleProfileAssetVisualImageLoad = (item: ProfileAssetItem, payload?: unknown) => {
    markHomeVisualImageLoaded(
      'profileAsset',
      item.id,
      resolveProfileAssetImageUrl(item),
      resolveRequestStamp(payload)
    )
    syncProfileAssetRevealPhases()
  }

  const handleProfileAssetVisualImageError = (item: ProfileAssetItem, payload?: unknown) => {
    markHomeVisualImageError(
      'profileAsset',
      item.id,
      resolveProfileAssetImageUrl(item),
      resolveRequestStamp(payload)
    )
    syncProfileAssetRevealPhases()
  }

  const handleProfileAssetVisualImageRetrying = (item: ProfileAssetItem, payload?: unknown) => {
    markHomeVisualImageRetrying(
      'profileAsset',
      item.id,
      resolveProfileAssetImageUrl(item),
      resolveRequestStamp(payload)
    )
    syncProfileAssetRevealPhases()
  }

  const disposeProfileAssetVisualReveal = () => {
    clearProfileAssetRevealTimeouts()
    profileAssetRevealPhaseMap.value = {}
  }

  return {
    profileAssetImageStateVersion,
    profileAssetRevealPhaseMap,
    resolveProfileAssetImageUrl,
    resolveProfileAssetPlaceholderIcon,
    resolveProfileAssetRevealPhase,
    resolveProfileAssetRemovedOverlayRevealPhase,
    resolveProfileAssetInitialRevealPhase,
    buildNextProfileAssetRevealPhaseMap,
    syncProfileAssetVisualImages,
    syncProfileAssetRevealPhases,
    handleProfileAssetVisualImageLoad,
    handleProfileAssetVisualImageError,
    handleProfileAssetVisualImageRetrying,
    clearProfileAssetRevealTimeout,
    clearProfileAssetRevealTimeouts,
    setProfileAssetRevealPhaseMap,
    disposeProfileAssetVisualReveal,
  }
}
