/**
 * Responsibility: provide shared result-window diff, queue, slot, overlay, and lightweight
 * geometry helpers used by rail result-window runtimes.
 * Out of scope: mount-window geometry, panel-specific timing state, and query or refresh
 * orchestration.
 */
export type ResultLoadSource =
  | 'initial-enter'
  | 'manual-query-switch'
  | 'manual-refresh'
  | 'activation-apply'
  | 'load-more'

export type CardQueuePhase = 'steady' | 'entering' | 'leaving' | 'replay-prep' | 'replay-entering'

export type CardReuseMode = 'retained' | 'retained-image-changed' | 'added'

export type ResultWindowSlotKind = 'retained-card' | 'stable-slot'

export interface ResultWindowSlot<T> {
  id: string
  item: T
  kind: ResultWindowSlotKind
  reuseMode: CardReuseMode
  slotIndex: number
}

export interface ResultWindowOverlayItem<T> {
  id: string
  item: T
  sourceIndex: number
}

export interface ResultWindowDiff<T> {
  currentWindow: T[]
  nextWindow: T[]
  retainedIds: Set<string>
  retainedImageChangedIds: Set<string>
  addedIds: Set<string>
  removedIds: Set<string>
  retained: T[]
  retainedImageChanged: T[]
  added: T[]
  removed: T[]
  hasStructuralChange: boolean
  hasAnyChange: boolean
}

export interface ResultWindowGeometry {
  slotCount: number
  rowCount: number
  rowHeight: number
  height: number
}

interface ResultWindowListGeometryConfig {
  layout: 'list'
  slotCount: number
  rowHeight: number
  rowGap: number
}

interface ResultWindowGridGeometryConfig {
  layout: 'grid'
  slotCount: number
  columns: number
  stageWidth: number
  fallbackCardWidth: number
  columnGap: number
  rowGap: number
  cardChromeHeight: number
}

export type ResultWindowGeometryConfig =
  | ResultWindowListGeometryConfig
  | ResultWindowGridGeometryConfig

interface ResultWindowItemLike {
  id: string
}

export const shouldReplayRetainedForResultSource = (source: ResultLoadSource) => {
  return source === 'manual-refresh'
}

export const buildResultWindow = <T>(items: T[], visibleCount: number): T[] => {
  if (!items.length || visibleCount <= 0) {
    return []
  }

  return items.slice(0, visibleCount)
}

export const buildResultWindowDiff = <T extends ResultWindowItemLike>(
  currentWindow: T[],
  nextWindow: T[],
  resolveImageKey: (item: T) => string
): ResultWindowDiff<T> => {
  const currentById = new Map(currentWindow.map((item) => [item.id, item]))
  const nextIds = new Set(nextWindow.map((item) => item.id))
  const retainedIds = new Set<string>()
  const retainedImageChangedIds = new Set<string>()
  const addedIds = new Set<string>()
  const removedIds = new Set<string>()
  const retained: T[] = []
  const retainedImageChanged: T[] = []
  const added: T[] = []
  const removed: T[] = []

  nextWindow.forEach((item) => {
    const currentItem = currentById.get(item.id)
    if (!currentItem) {
      addedIds.add(item.id)
      added.push(item)
      return
    }

    const currentImageKey = resolveImageKey(currentItem)
    const nextImageKey = resolveImageKey(item)
    if (currentImageKey !== nextImageKey) {
      retainedImageChangedIds.add(item.id)
      retainedImageChanged.push(item)
      return
    }

    retainedIds.add(item.id)
    retained.push(item)
  })

  currentWindow.forEach((item) => {
    if (nextIds.has(item.id)) {
      return
    }

    removedIds.add(item.id)
    removed.push(item)
  })

  const hasStructuralChange =
    currentWindow.length !== nextWindow.length ||
    currentWindow.some((item, index) => item.id !== nextWindow[index]?.id)
  const hasAnyChange =
    hasStructuralChange ||
    retainedImageChangedIds.size > 0 ||
    addedIds.size > 0 ||
    removedIds.size > 0

  return {
    currentWindow,
    nextWindow,
    retainedIds,
    retainedImageChangedIds,
    addedIds,
    removedIds,
    retained,
    retainedImageChanged,
    added,
    removed,
    hasStructuralChange,
    hasAnyChange,
  }
}

export const buildResultWindowQueueIdSet = <T extends ResultWindowItemLike>(
  diff: ResultWindowDiff<T>,
  source: ResultLoadSource,
  mountedIds: Set<string>
): Set<string> => {
  if (shouldReplayRetainedForResultSource(source)) {
    return new Set(diff.nextWindow.filter((item) => mountedIds.has(item.id)).map((item) => item.id))
  }

  return new Set(diff.added.filter((item) => mountedIds.has(item.id)).map((item) => item.id))
}

export const resolveResultWindowEnterQueueItems = <T extends ResultWindowItemLike>(
  diff: ResultWindowDiff<T>,
  source: ResultLoadSource,
  mountedIds: Set<string>
): T[] => {
  const queueIds = buildResultWindowQueueIdSet(diff, source, mountedIds)
  return diff.nextWindow.filter((item) => queueIds.has(item.id))
}

export const buildResultWindowSlots = <T extends ResultWindowItemLike>(
  diff: ResultWindowDiff<T>
): ResultWindowSlot<T>[] => {
  return diff.nextWindow.map((item, slotIndex) => ({
    id: item.id,
    item,
    kind: diff.addedIds.has(item.id) ? 'stable-slot' : 'retained-card',
    reuseMode: diff.addedIds.has(item.id)
      ? 'added'
      : diff.retainedImageChangedIds.has(item.id)
        ? 'retained-image-changed'
        : 'retained',
    slotIndex,
  }))
}

export const buildResultWindowStableSlotIdSet = <T extends ResultWindowItemLike>(
  diff: ResultWindowDiff<T>
): Set<string> => {
  return new Set(
    buildResultWindowSlots(diff)
      .filter((slot) => slot.kind === 'stable-slot')
      .map((slot) => slot.id)
  )
}

export const buildResultWindowOverlayItems = <T extends ResultWindowItemLike>(
  diff: ResultWindowDiff<T>
): ResultWindowOverlayItem<T>[] => {
  return diff.currentWindow.flatMap((item, sourceIndex) => {
    if (!diff.removedIds.has(item.id)) {
      return []
    }

    return [
      {
        id: item.id,
        item,
        sourceIndex,
      },
    ]
  })
}

export const resolveResultWindowGeometry = (
  config: ResultWindowGeometryConfig
): ResultWindowGeometry => {
  if (config.slotCount <= 0) {
    return {
      slotCount: 0,
      rowCount: 0,
      rowHeight: 0,
      height: 0,
    }
  }

  if (config.layout === 'list') {
    const rowCount = config.slotCount
    return {
      slotCount: config.slotCount,
      rowCount,
      rowHeight: config.rowHeight,
      height: rowCount * config.rowHeight + Math.max(0, rowCount - 1) * config.rowGap,
    }
  }

  const columns = Math.max(1, config.columns)
  const rowCount = Math.ceil(config.slotCount / columns)
  const usableStageWidth = config.stageWidth > 0 ? config.stageWidth : 0
  const cardWidth =
    usableStageWidth > 0
      ? Math.max(0, (usableStageWidth - Math.max(0, columns - 1) * config.columnGap) / columns)
      : config.fallbackCardWidth
  const rowHeight = cardWidth + config.cardChromeHeight

  return {
    slotCount: config.slotCount,
    rowCount,
    rowHeight,
    height: rowCount * rowHeight + Math.max(0, rowCount - 1) * config.rowGap,
  }
}
