import { describe, expect, it } from 'vitest'
import {
  resolveGridRowCount,
  resolveRemainingRowsFromVisibleEndRow,
  shouldPrefetchGridListByRemainingRows,
} from '@/pages/home/composables/home/homeMarketPrefetch.util'

describe('homeMarketPrefetch.util', () => {
  it('resolves grid row count for a two-column market list', () => {
    expect(resolveGridRowCount(0, 2)).toBe(0)
    expect(resolveGridRowCount(1, 2)).toBe(1)
    expect(resolveGridRowCount(32, 2)).toBe(16)
    expect(resolveGridRowCount(33, 2)).toBe(17)
  })

  it('computes remaining rows from the logical visible end row', () => {
    expect(
      resolveRemainingRowsFromVisibleEndRow({
        itemCount: 32,
        columns: 2,
        visibleEndRow: 7,
      })
    ).toBe(8)

    expect(
      resolveRemainingRowsFromVisibleEndRow({
        itemCount: 32,
        columns: 2,
        visibleEndRow: 15,
      })
    ).toBe(0)
  })

  it('prefetches only when the logical remaining row threshold is reached', () => {
    expect(
      shouldPrefetchGridListByRemainingRows({
        itemCount: 32,
        columns: 2,
        visibleEndRow: 6,
        remainingRowsThreshold: 8,
      })
    ).toBe(false)

    expect(
      shouldPrefetchGridListByRemainingRows({
        itemCount: 32,
        columns: 2,
        visibleEndRow: 7,
        remainingRowsThreshold: 8,
      })
    ).toBe(true)
  })

  it('uses the loaded logical tail instead of the currently displayed subset', () => {
    expect(
      shouldPrefetchGridListByRemainingRows({
        itemCount: 16,
        loadedItemCount: 32,
        columns: 2,
        visibleEndRow: 5,
        remainingRowsThreshold: 8,
      })
    ).toBe(false)

    expect(
      shouldPrefetchGridListByRemainingRows({
        itemCount: 16,
        loadedItemCount: 32,
        columns: 2,
        visibleEndRow: 7,
        remainingRowsThreshold: 8,
      })
    ).toBe(true)
  })

  it('prefers the loaded logical tail over the displayed subset when provided', () => {
    expect(
      shouldPrefetchGridListByRemainingRows({
        itemCount: 12,
        loadedItemCount: 32,
        columns: 2,
        visibleEndRow: 5,
        remainingRowsThreshold: 8,
      })
    ).toBe(false)

    expect(
      shouldPrefetchGridListByRemainingRows({
        itemCount: 12,
        columns: 2,
        visibleEndRow: 5,
        remainingRowsThreshold: 8,
      })
    ).toBe(true)
  })
})
