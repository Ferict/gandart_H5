/**
 * Responsibility: encapsulate home market result-window geometry, mounted-window projection,
 * observer scheduling, and stage-lock styling without touching switch/replay sequencing.
 * Out of scope: diff calculation, enter/leave timing, queued insertions, and overlay lifecycle.
 */
import { computed, nextTick, type CSSProperties, type ComputedRef, type Ref } from 'vue'
import {
  buildResultMountWindow,
  isResultMountWindowingSuspended,
  resolveResultMountGeometry,
  resolveResultMountStageVisibleIntersection,
  type ResultMountScrollMetrics,
} from '../../../../services/home-rail/homeRailResultMountWindow.service'
import { resolveResultWindowGeometry } from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import { resolveTemplateRefElement } from '../../../../utils/resolveTemplateRefElement.util'
import { shouldPrefetchGridListByRemainingRows } from './homeMarketPrefetch.util'

interface UseHomeMarketResultWindowGeometryLayoutOptions {
  columns: number
  fallbackCardWidth: number
  columnGap: number
  rowGap: number
  cardChromeHeight: number
  mountBufferTopRows: number
  mountBufferBottomRows: number
}

interface UseHomeMarketResultWindowGeometryRuntimeOptions {
  isPanelActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  isMarketListLoading: Ref<boolean>
  isMarketPaginationChainLoading: ComputedRef<boolean>
  marketCollection: Ref<HomeMarketCard[]>
  displayedCollection: Ref<HomeMarketCard[]>
  pendingCollection: Ref<HomeMarketCard[]>
  mountedMarketItems: Ref<HomeMarketCard[]>
  mountedMarketItemIdSet: Ref<Set<string>>
  marketPlaceholderCardIdSet: Ref<Set<string>>
  marketResultsStageLockedMinHeight: Ref<number>
  marketTopSpacerHeight: Ref<number>
  marketBottomSpacerHeight: Ref<number>
  marketResultsStageRef: Ref<HTMLElement | null>
  marketResultsContentRef: Ref<HTMLElement | null>
  hasMoreMarketItems: ComputedRef<boolean>
  isMarketTransitioning: ComputedRef<boolean>
  isMarketLoadMoreRunning: Ref<boolean>
  layout: UseHomeMarketResultWindowGeometryLayoutOptions
  remainingRowsThreshold?: number
  syncCurrentHomeVisualImages: () => void
  syncMarketCardRevealStates: (items?: HomeMarketCard[]) => void
  triggerMarketLoadMore: () => Promise<void> | void
}

export const useHomeMarketResultWindowGeometryRuntime = (
  options: UseHomeMarketResultWindowGeometryRuntimeOptions
) => {
  let marketMountScrollRafId: number | null = null
  let marketLoadMoreCheckRafId: number | null = null
  const remainingRowsThreshold = options.remainingRowsThreshold ?? 8

  const resolveMarketResultsStageWidth = () => {
    const stageElement = resolveTemplateRefElement(options.marketResultsStageRef.value)
    if (!stageElement) {
      return 0
    }

    return Math.ceil(stageElement.getBoundingClientRect().width)
  }

  const resolveMarketResultWindowRowHeight = () => {
    return resolveResultWindowGeometry({
      layout: 'grid',
      slotCount: 1,
      columns: options.layout.columns,
      stageWidth: resolveMarketResultsStageWidth(),
      fallbackCardWidth: options.layout.fallbackCardWidth,
      columnGap: options.layout.columnGap,
      rowGap: options.layout.rowGap,
      cardChromeHeight: options.layout.cardChromeHeight,
    }).rowHeight
  }

  const resolveDisplayedMarketVisibleEndRow = () => {
    const scrollMetrics = options.mountScrollMetrics.value
    const contentElement = resolveTemplateRefElement(options.marketResultsContentRef.value)
    if (
      !contentElement ||
      !scrollMetrics?.isReady ||
      !Number.isFinite(scrollMetrics.viewportHeight) ||
      !Number.isFinite(scrollMetrics.viewportTop) ||
      scrollMetrics.viewportHeight <= 0 ||
      isResultMountWindowingSuspended(scrollMetrics)
    ) {
      return null
    }

    const intersection = resolveResultMountStageVisibleIntersection(contentElement, scrollMetrics)
    if (!intersection || intersection.visibleHeightWithinStage <= 0) {
      return null
    }

    const geometry = resolveResultMountGeometry({
      itemCount: options.displayedCollection.value.length,
      columns: options.layout.columns,
      rowHeight: resolveMarketResultWindowRowHeight(),
      rowGap: options.layout.rowGap,
      visibleTopWithinStage: intersection.visibleTopWithinStage,
      visibleHeightWithinStage: intersection.visibleHeightWithinStage,
      bufferTopRows: 0,
      bufferBottomRows: 0,
    })

    if (geometry.rowCount <= 0 || geometry.visibleEndRow < 0) {
      return null
    }

    return geometry.visibleEndRow
  }

  const shouldPrefetchMarketListByLogicalRemainingRows = () => {
    if (!options.hasMoreMarketItems.value) {
      return false
    }

    const visibleEndRow = resolveDisplayedMarketVisibleEndRow()
    if (visibleEndRow === null) {
      return false
    }

    const loadedLogicalItemCount = Math.max(
      options.marketCollection.value.length,
      options.pendingCollection.value.length,
      options.displayedCollection.value.length
    )

    return shouldPrefetchGridListByRemainingRows({
      itemCount: options.displayedCollection.value.length,
      loadedItemCount: loadedLogicalItemCount,
      columns: options.layout.columns,
      visibleEndRow,
      remainingRowsThreshold,
    })
  }

  const resolveMarketResultsStageTargetHeight = (slotCount: number) => {
    return resolveResultWindowGeometry({
      layout: 'grid',
      slotCount,
      columns: options.layout.columns,
      stageWidth: resolveMarketResultsStageWidth(),
      fallbackCardWidth: options.layout.fallbackCardWidth,
      columnGap: options.layout.columnGap,
      rowGap: options.layout.rowGap,
      cardChromeHeight: options.layout.cardChromeHeight,
    }).height
  }

  const resolveMarketMountedWindow = (
    items: HomeMarketCard[] = options.displayedCollection.value
  ) => {
    const rowHeight = resolveMarketResultWindowRowHeight()
    const scrollMetrics = options.mountScrollMetrics.value
    const contentElement = resolveTemplateRefElement(options.marketResultsContentRef.value)

    if (
      !contentElement ||
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

    const intersection = resolveResultMountStageVisibleIntersection(contentElement, scrollMetrics)
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

  const syncMountedMarketWindow = (items: HomeMarketCard[] = options.displayedCollection.value) => {
    const mountWindow = resolveMarketMountedWindow(items)
    options.mountedMarketItems.value = mountWindow.items
    options.mountedMarketItemIdSet.value = mountWindow.itemIds
    options.marketPlaceholderCardIdSet.value = new Set(
      Array.from(options.marketPlaceholderCardIdSet.value).filter((itemId) =>
        mountWindow.itemIds.has(itemId)
      )
    )
    options.marketTopSpacerHeight.value = mountWindow.geometry.topSpacerHeight
    options.marketBottomSpacerHeight.value = mountWindow.geometry.bottomSpacerHeight
  }

  const clearMountedMarketWindow = () => {
    options.mountedMarketItems.value = []
    options.mountedMarketItemIdSet.value = new Set()
    options.marketPlaceholderCardIdSet.value = new Set()
    options.marketTopSpacerHeight.value = 0
    options.marketBottomSpacerHeight.value = 0
  }

  const clearMarketMountWindowRaf = () => {
    if (marketMountScrollRafId === null) {
      return
    }

    cancelAnimationFrame(marketMountScrollRafId)
    marketMountScrollRafId = null
  }

  const clearMarketLoadMoreObserver = () => {
    if (marketLoadMoreCheckRafId === null) {
      return
    }

    cancelAnimationFrame(marketLoadMoreCheckRafId)
    marketLoadMoreCheckRafId = null
  }

  const releaseMarketResultsStageHeightLock = () => {
    options.marketResultsStageLockedMinHeight.value = 0
  }

  const lockMarketResultsStageHeightToSlotCount = (slotCount: number) => {
    options.marketResultsStageLockedMinHeight.value = Math.max(
      resolveMarketResultsStageTargetHeight(options.displayedCollection.value.length),
      resolveMarketResultsStageTargetHeight(slotCount)
    )
  }

  const scheduleMarketLoadMoreObserver = async () => {
    if (marketLoadMoreCheckRafId !== null) {
      return
    }

    marketLoadMoreCheckRafId = requestAnimationFrame(async () => {
      marketLoadMoreCheckRafId = null
      if (
        !options.isPanelActive.value ||
        !options.hasMoreMarketItems.value ||
        options.isMarketTransitioning.value ||
        options.isMarketLoadMoreRunning.value ||
        options.isMarketListLoading.value ||
        options.isMarketPaginationChainLoading.value
      ) {
        return
      }

      await nextTick()
      const scrollMetrics = options.mountScrollMetrics.value
      if (!scrollMetrics?.isReady) {
        return
      }

      if (shouldPrefetchMarketListByLogicalRemainingRows()) {
        await options.triggerMarketLoadMore()
      }
    })
  }

  const scheduleMarketMountWindowSync = () => {
    if (!options.isPanelActive.value || marketMountScrollRafId !== null) {
      return
    }

    marketMountScrollRafId = requestAnimationFrame(() => {
      marketMountScrollRafId = null
      syncMountedMarketWindow()
      options.syncCurrentHomeVisualImages()
      options.syncMarketCardRevealStates(options.mountedMarketItems.value)
      void scheduleMarketLoadMoreObserver()
    })
  }

  const marketResultsStageStyle = computed<CSSProperties>(() => {
    if (options.marketResultsStageLockedMinHeight.value <= 0) {
      return {}
    }

    return {
      minHeight: `${options.marketResultsStageLockedMinHeight.value}px`,
    }
  })

  const marketRemovedOverlayLayerStyle = computed<CSSProperties>(() => {
    const geometry = resolveResultWindowGeometry({
      layout: 'grid',
      slotCount: 1,
      columns: options.layout.columns,
      stageWidth: resolveMarketResultsStageWidth(),
      fallbackCardWidth: options.layout.fallbackCardWidth,
      columnGap: options.layout.columnGap,
      rowGap: options.layout.rowGap,
      cardChromeHeight: options.layout.cardChromeHeight,
    })

    return {
      '--home-market-removed-overlay-row-height': `${geometry.rowHeight}px`,
    } as CSSProperties
  })

  return {
    marketResultsStageStyle,
    marketRemovedOverlayLayerStyle,
    syncMountedMarketWindow,
    clearMountedMarketWindow,
    clearMarketMountWindowRaf,
    clearMarketLoadMoreObserver,
    releaseMarketResultsStageHeightLock,
    lockMarketResultsStageHeightToSlotCount,
    scheduleMarketLoadMoreObserver,
    scheduleMarketMountWindowSync,
  }
}
