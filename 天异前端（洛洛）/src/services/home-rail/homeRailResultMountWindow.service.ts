/**
 * Responsibility: provide shared geometry and mount-window helpers for rail result lists,
 * including visible-stage intersection, row windowing, and mounted slice calculation.
 * Out of scope: result-window timing, query execution, and panel-level presentation state.
 */
interface ResultMountGeometryConfig {
  itemCount: number
  columns: number
  rowHeight: number
  rowGap: number
  visibleTopWithinStage: number
  visibleHeightWithinStage: number
  bufferTopRows: number
  bufferBottomRows: number
  forceFullMount?: boolean
}

export interface ResultMountScrollMetrics {
  scrollTop: number
  viewportHeight: number
  viewportTop: number
  isReady: boolean
  windowingSuspended?: boolean
}

export interface ResultMountRange {
  startRow: number
  endRow: number
  startIndex: number
  endIndexExclusive: number
}

export interface ResultMountGeometry {
  itemCount: number
  rowCount: number
  columns: number
  rowHeight: number
  rowGap: number
  viewportHeight: number
  visibleStartRow: number
  visibleEndRow: number
  mountStartRow: number
  mountEndRow: number
  topSpacerHeight: number
  bottomSpacerHeight: number
  totalHeight: number
  range: ResultMountRange
}

export interface ResultMountWindow<T> {
  items: T[]
  itemIds: Set<string>
  geometry: ResultMountGeometry
}

interface ResultMountItemLike {
  id: string
}

const clampNumber = (value: number, minValue: number, maxValue: number) => {
  return Math.min(maxValue, Math.max(minValue, value))
}

export const isResultMountWindowingSuspended = (
  scrollMetrics?: ResultMountScrollMetrics | null
) => {
  return scrollMetrics?.windowingSuspended === true
}

export const resolveResultMountStageVisibleIntersection = (
  stageElement: HTMLElement,
  scrollMetrics: ResultMountScrollMetrics
): { visibleTopWithinStage: number; visibleHeightWithinStage: number } | null => {
  const stageRect = stageElement.getBoundingClientRect()
  if (
    !Number.isFinite(stageRect.top) ||
    !Number.isFinite(stageRect.height) ||
    stageRect.height <= 0
  ) {
    return null
  }

  const stageTopInViewport = stageRect.top - scrollMetrics.viewportTop
  const stageBottomInViewport = stageTopInViewport + stageRect.height
  const intersectionTop = clampNumber(stageTopInViewport, 0, scrollMetrics.viewportHeight)
  const intersectionBottom = clampNumber(stageBottomInViewport, 0, scrollMetrics.viewportHeight)

  return {
    visibleTopWithinStage: Math.max(0, -stageTopInViewport),
    visibleHeightWithinStage: Math.max(0, intersectionBottom - intersectionTop),
  }
}

const createEmptyResultMountGeometry = (config: ResultMountGeometryConfig): ResultMountGeometry => {
  return {
    itemCount: 0,
    rowCount: 0,
    columns: Math.max(1, config.columns),
    rowHeight: Math.max(0, config.rowHeight),
    rowGap: Math.max(0, config.rowGap),
    viewportHeight: Math.max(0, config.visibleHeightWithinStage),
    visibleStartRow: 0,
    visibleEndRow: -1,
    mountStartRow: 0,
    mountEndRow: -1,
    topSpacerHeight: 0,
    bottomSpacerHeight: 0,
    totalHeight: 0,
    range: {
      startRow: 0,
      endRow: -1,
      startIndex: 0,
      endIndexExclusive: 0,
    },
  }
}

const createFullResultMountGeometry = (
  itemCount: number,
  columns: number,
  rowHeight: number,
  rowGap: number
): ResultMountGeometry => {
  const rowCount = Math.ceil(itemCount / columns)
  const totalHeight = rowCount * rowHeight + Math.max(0, rowCount - 1) * rowGap
  return {
    itemCount,
    rowCount,
    columns,
    rowHeight,
    rowGap,
    viewportHeight: 0,
    visibleStartRow: 0,
    visibleEndRow: rowCount - 1,
    mountStartRow: 0,
    mountEndRow: rowCount - 1,
    topSpacerHeight: 0,
    bottomSpacerHeight: 0,
    totalHeight,
    range: {
      startRow: 0,
      endRow: rowCount - 1,
      startIndex: 0,
      endIndexExclusive: itemCount,
    },
  }
}

const createOffscreenResultMountGeometry = (
  itemCount: number,
  columns: number,
  rowHeight: number,
  rowGap: number,
  visibleTopWithinStage: number
): ResultMountGeometry => {
  const rowCount = Math.ceil(itemCount / columns)
  const totalHeight = rowCount * rowHeight + Math.max(0, rowCount - 1) * rowGap
  const isStageAboveViewport = visibleTopWithinStage >= totalHeight
  return {
    itemCount,
    rowCount,
    columns,
    rowHeight,
    rowGap,
    viewportHeight: 0,
    visibleStartRow: isStageAboveViewport ? rowCount : 0,
    visibleEndRow: isStageAboveViewport ? rowCount - 1 : -1,
    mountStartRow: isStageAboveViewport ? rowCount : 0,
    mountEndRow: isStageAboveViewport ? rowCount - 1 : -1,
    topSpacerHeight: isStageAboveViewport ? totalHeight : 0,
    bottomSpacerHeight: isStageAboveViewport ? 0 : totalHeight,
    totalHeight,
    range: {
      startRow: isStageAboveViewport ? rowCount : 0,
      endRow: isStageAboveViewport ? rowCount - 1 : -1,
      startIndex: isStageAboveViewport ? itemCount : 0,
      endIndexExclusive: isStageAboveViewport ? itemCount : 0,
    },
  }
}

export const resolveResultMountGeometry = (
  config: ResultMountGeometryConfig
): ResultMountGeometry => {
  const itemCount = Math.max(0, config.itemCount)
  if (itemCount <= 0) {
    return createEmptyResultMountGeometry(config)
  }

  const columns = Math.max(1, config.columns)
  const rowHeight = Math.max(0, config.rowHeight)
  const rowGap = Math.max(0, config.rowGap)
  const rowStride = rowHeight + rowGap

  if (config.forceFullMount || rowStride <= 0) {
    return createFullResultMountGeometry(itemCount, columns, rowHeight, rowGap)
  }

  const rowCount = Math.ceil(itemCount / columns)
  const totalHeight = rowCount * rowHeight + Math.max(0, rowCount - 1) * rowGap
  const visibleTopWithinStage = Math.max(0, config.visibleTopWithinStage)
  const visibleHeightWithinStage = Math.max(0, config.visibleHeightWithinStage)

  if (visibleHeightWithinStage <= 0) {
    return createOffscreenResultMountGeometry(
      itemCount,
      columns,
      rowHeight,
      rowGap,
      visibleTopWithinStage
    )
  }

  const visibleStartRow = clampNumber(
    Math.floor(visibleTopWithinStage / rowStride),
    0,
    rowCount - 1
  )
  const visibleBottom = Math.max(
    visibleTopWithinStage,
    visibleTopWithinStage + visibleHeightWithinStage - 1
  )
  const visibleEndRow = clampNumber(Math.floor(visibleBottom / rowStride), 0, rowCount - 1)
  const mountStartRow = Math.max(0, visibleStartRow - Math.max(0, config.bufferTopRows))
  const mountEndRow = Math.min(rowCount - 1, visibleEndRow + Math.max(0, config.bufferBottomRows))
  const startIndex = mountStartRow * columns
  const endIndexExclusive = Math.min(itemCount, (mountEndRow + 1) * columns)
  const mountedRowCount = mountEndRow - mountStartRow + 1
  const mountedHeight = mountedRowCount * rowHeight + Math.max(0, mountedRowCount - 1) * rowGap
  const topSpacerHeight = mountStartRow * rowStride
  const bottomSpacerHeight = Math.max(0, totalHeight - topSpacerHeight - mountedHeight)

  return {
    itemCount,
    rowCount,
    columns,
    rowHeight,
    rowGap,
    viewportHeight: visibleHeightWithinStage,
    visibleStartRow,
    visibleEndRow,
    mountStartRow,
    mountEndRow,
    topSpacerHeight,
    bottomSpacerHeight,
    totalHeight,
    range: {
      startRow: mountStartRow,
      endRow: mountEndRow,
      startIndex,
      endIndexExclusive,
    },
  }
}

export const buildResultMountWindow = <T extends ResultMountItemLike>(
  items: T[],
  config: ResultMountGeometryConfig
): ResultMountWindow<T> => {
  const geometry = resolveResultMountGeometry({
    ...config,
    itemCount: items.length,
  })

  if (!items.length || geometry.range.endIndexExclusive <= geometry.range.startIndex) {
    return {
      items: [],
      itemIds: new Set(),
      geometry,
    }
  }

  const mountedItems = items.slice(geometry.range.startIndex, geometry.range.endIndexExclusive)
  return {
    items: mountedItems,
    itemIds: new Set(mountedItems.map((item) => item.id)),
    geometry,
  }
}
