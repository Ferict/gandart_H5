/**
 * Responsibility: encapsulate profile asset result-window geometry, mounted-window projection,
 * stage-lock styling, and mount-window sync without touching replay/switch orchestration.
 * Out of scope: refresh replay, overlay lifecycle timing, and result diff sequencing.
 */
import { computed, type CSSProperties, type ComputedRef, type Ref } from 'vue'
import {
  buildResultMountWindow,
  isResultMountWindowingSuspended,
  resolveResultMountStageVisibleIntersection,
  type ResultMountScrollMetrics,
  type ResultMountWindow,
} from '../../../../services/home-rail/homeRailResultMountWindow.service'
import {
  resolveResultWindowGeometry,
  type ResultWindowOverlayItem,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import { resolveTemplateRefElement } from '../../../../utils/resolveTemplateRefElement.util'

interface UseProfileAssetResultWindowGeometryLayoutOptions {
  columns: number
  fallbackCardWidth: number
  columnGap: number
  rowGap: number
  cardChromeHeight: number
  mountBufferTopRows: number
  mountBufferBottomRows: number
}

interface UseProfileAssetResultWindowGeometryVisualOptions {
  syncProfileAssetVisualImages: (list?: ProfileAssetItem[]) => void
  syncProfileAssetRevealPhases: (list?: ProfileAssetItem[]) => void
}

interface UseProfileAssetResultWindowGeometryRuntimeOptions {
  isPanelActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  displayedAssets: Ref<ProfileAssetItem[]>
  mountedAssets: Ref<ProfileAssetItem[]>
  mountedAssetIdSet: Ref<Set<string>>
  profileAssetPlaceholderIdSet: Ref<Set<string>>
  profileAssetResultsStageRef: Ref<HTMLElement | null>
  profileAssetResultsStageLockedMinHeight: Ref<number>
  profileAssetTopSpacerHeight: Ref<number>
  profileAssetBottomSpacerHeight: Ref<number>
  profileAssetRemovedOverlayItems: Ref<ResultWindowOverlayItem<ProfileAssetItem>[]>
  layout: UseProfileAssetResultWindowGeometryLayoutOptions
  visual: UseProfileAssetResultWindowGeometryVisualOptions
}

export const useProfileAssetResultWindowGeometryRuntime = (
  options: UseProfileAssetResultWindowGeometryRuntimeOptions
) => {
  let profileAssetMountWindowSyncRafId: number | null = null

  const resolveProfileAssetResultsStageWidth = () => {
    const stageElement = resolveTemplateRefElement(options.profileAssetResultsStageRef.value)
    if (!stageElement) {
      return 0
    }

    return Math.ceil(stageElement.getBoundingClientRect().width)
  }

  const resolveProfileAssetResultsStageTargetHeight = (slotCount: number) => {
    return resolveResultWindowGeometry({
      layout: 'grid',
      slotCount,
      columns: options.layout.columns,
      stageWidth: resolveProfileAssetResultsStageWidth(),
      fallbackCardWidth: options.layout.fallbackCardWidth,
      columnGap: options.layout.columnGap,
      rowGap: options.layout.rowGap,
      cardChromeHeight: options.layout.cardChromeHeight,
    }).height
  }

  const resolveProfileAssetMountedWindow = (
    items: ProfileAssetItem[] = options.displayedAssets.value
  ): ResultMountWindow<ProfileAssetItem> => {
    const stageElement = resolveTemplateRefElement(options.profileAssetResultsStageRef.value)
    const scrollMetrics = options.mountScrollMetrics.value
    const rowHeight = resolveResultWindowGeometry({
      layout: 'grid',
      slotCount: 1,
      columns: options.layout.columns,
      stageWidth: resolveProfileAssetResultsStageWidth(),
      fallbackCardWidth: options.layout.fallbackCardWidth,
      columnGap: options.layout.columnGap,
      rowGap: options.layout.rowGap,
      cardChromeHeight: options.layout.cardChromeHeight,
    }).rowHeight

    if (
      !stageElement ||
      !scrollMetrics?.isReady ||
      !Number.isFinite(scrollMetrics.viewportHeight) ||
      !Number.isFinite(scrollMetrics.viewportTop) ||
      scrollMetrics.viewportHeight <= 0 ||
      isResultMountWindowingSuspended(scrollMetrics)
    ) {
      return buildResultMountWindow(items, {
        itemCount: items.length,
        columns: options.layout.columns,
        rowHeight,
        rowGap: options.layout.rowGap,
        visibleTopWithinStage: 0,
        visibleHeightWithinStage: 0,
        bufferTopRows: options.layout.mountBufferTopRows,
        bufferBottomRows: options.layout.mountBufferBottomRows,
        forceFullMount: true,
      })
    }

    const intersection = resolveResultMountStageVisibleIntersection(stageElement, scrollMetrics)
    if (!intersection) {
      return buildResultMountWindow(items, {
        itemCount: items.length,
        columns: options.layout.columns,
        rowHeight,
        rowGap: options.layout.rowGap,
        visibleTopWithinStage: 0,
        visibleHeightWithinStage: 0,
        bufferTopRows: options.layout.mountBufferTopRows,
        bufferBottomRows: options.layout.mountBufferBottomRows,
        forceFullMount: true,
      })
    }

    return buildResultMountWindow(items, {
      itemCount: items.length,
      columns: options.layout.columns,
      rowHeight,
      rowGap: options.layout.rowGap,
      visibleTopWithinStage: intersection.visibleTopWithinStage,
      visibleHeightWithinStage: intersection.visibleHeightWithinStage,
      bufferTopRows: options.layout.mountBufferTopRows,
      bufferBottomRows: options.layout.mountBufferBottomRows,
    })
  }

  const syncMountedProfileAssetWindow = (
    items: ProfileAssetItem[] = options.displayedAssets.value
  ) => {
    const mountWindow = resolveProfileAssetMountedWindow(items)
    options.mountedAssets.value = mountWindow.items
    options.mountedAssetIdSet.value = mountWindow.itemIds
    options.profileAssetTopSpacerHeight.value = mountWindow.geometry.topSpacerHeight
    options.profileAssetBottomSpacerHeight.value = mountWindow.geometry.bottomSpacerHeight
    options.profileAssetPlaceholderIdSet.value = new Set(
      Array.from(options.profileAssetPlaceholderIdSet.value).filter((itemId) =>
        options.mountedAssetIdSet.value.has(itemId)
      )
    )
  }

  const clearMountedProfileAssetWindow = () => {
    options.mountedAssets.value = []
    options.mountedAssetIdSet.value = new Set()
    options.profileAssetPlaceholderIdSet.value = new Set()
    options.profileAssetTopSpacerHeight.value = 0
    options.profileAssetBottomSpacerHeight.value = 0
  }

  const clearProfileAssetMountWindowSyncRaf = () => {
    if (profileAssetMountWindowSyncRafId !== null) {
      cancelAnimationFrame(profileAssetMountWindowSyncRafId)
      profileAssetMountWindowSyncRafId = null
    }
  }

  const scheduleProfileAssetMountWindowSync = () => {
    clearProfileAssetMountWindowSyncRaf()
    profileAssetMountWindowSyncRafId = requestAnimationFrame(() => {
      profileAssetMountWindowSyncRafId = null
      if (!options.isPanelActive.value) {
        return
      }

      syncMountedProfileAssetWindow(options.displayedAssets.value)
      options.visual.syncProfileAssetVisualImages(options.mountedAssets.value)
      options.visual.syncProfileAssetRevealPhases(options.mountedAssets.value)
    })
  }

  const releaseProfileAssetResultsStageMinHeight = () => {
    options.profileAssetResultsStageLockedMinHeight.value = 0
  }

  const lockProfileAssetResultsStageMinHeight = (slotCount: number) => {
    options.profileAssetResultsStageLockedMinHeight.value = Math.max(
      resolveProfileAssetResultsStageTargetHeight(options.displayedAssets.value.length),
      resolveProfileAssetResultsStageTargetHeight(slotCount)
    )
  }

  const profileAssetResultsStageStyle = computed<CSSProperties>(() => {
    if (options.profileAssetResultsStageLockedMinHeight.value <= 0) {
      return {}
    }

    return {
      minHeight: `${options.profileAssetResultsStageLockedMinHeight.value}px`,
    }
  })

  const profileAssetRemovedOverlayLayerStyle = computed<CSSProperties>(() => {
    const geometry = resolveResultWindowGeometry({
      layout: 'grid',
      slotCount: Math.max(options.profileAssetRemovedOverlayItems.value.length, 1),
      columns: options.layout.columns,
      stageWidth: resolveProfileAssetResultsStageWidth(),
      fallbackCardWidth: options.layout.fallbackCardWidth,
      columnGap: options.layout.columnGap,
      rowGap: options.layout.rowGap,
      cardChromeHeight: options.layout.cardChromeHeight,
    })

    return {
      '--home-profile-removed-overlay-row-height': `${geometry.rowHeight}px`,
    } as CSSProperties
  })

  return {
    profileAssetResultsStageStyle,
    profileAssetRemovedOverlayLayerStyle,
    syncMountedProfileAssetWindow,
    clearMountedProfileAssetWindow,
    clearProfileAssetMountWindowSyncRaf,
    scheduleProfileAssetMountWindowSync,
    releaseProfileAssetResultsStageMinHeight,
    lockProfileAssetResultsStageMinHeight,
  }
}
