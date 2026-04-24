/**
 * Responsibility: provide pure helper utilities used by home market prefetch and grid-window
 * calculations so row math stays outside runtime composables.
 * Out of scope: remote fetching, mounted-window ownership, and DOM measurement behavior.
 */
export const resolveGridRowCount = (itemCount: number, columns: number) => {
  const normalizedColumns = Math.max(1, Math.floor(columns))
  const normalizedItemCount = Math.max(0, itemCount)
  return Math.ceil(normalizedItemCount / normalizedColumns)
}

export const resolveRemainingRowsFromVisibleEndRow = ({
  itemCount,
  columns,
  visibleEndRow,
}: {
  itemCount: number
  columns: number
  visibleEndRow: number
}) => {
  const rowCount = resolveGridRowCount(itemCount, columns)
  if (rowCount <= 0) {
    return 0
  }

  const normalizedVisibleEndRow = Math.min(Math.max(visibleEndRow, -1), rowCount - 1)
  return Math.max(0, rowCount - normalizedVisibleEndRow - 1)
}

export const shouldPrefetchGridListByRemainingRows = ({
  itemCount,
  loadedItemCount,
  columns,
  visibleEndRow,
  remainingRowsThreshold,
}: {
  itemCount: number
  loadedItemCount?: number
  columns: number
  visibleEndRow: number
  remainingRowsThreshold: number
}) => {
  const logicalTailItemCount = Math.max(0, loadedItemCount ?? itemCount)
  return (
    resolveRemainingRowsFromVisibleEndRow({
      itemCount: logicalTailItemCount,
      columns,
      visibleEndRow,
    }) <= Math.max(0, remainingRowsThreshold)
  )
}
