import { computed } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useHomeMarketTagSelectionRuntime } from '@/pages/home/composables/home/useHomeMarketTagSelectionRuntime'
import type { HomeMarketTag } from '@/models/home-rail/homeRailHome.model'

const createTags = (): HomeMarketTag[] => [
  { id: 'all', label: 'All' },
  { id: 'featured', label: 'Featured' },
  { id: 'hot', label: 'Hot' },
]

const createHarness = (tags = createTags()) => {
  const emitMarketTagSelect = vi.fn()
  const dismissSortPopover = vi.fn()
  const scheduleMarketQuerySwitchApply = vi.fn()

  const state = useHomeMarketTagSelectionRuntime({
    marketTags: computed(() => tags),
    emitMarketTagSelect,
    dismissSortPopover,
    scheduleMarketQuerySwitchApply,
  })

  return {
    state,
    emitMarketTagSelect,
    dismissSortPopover,
    scheduleMarketQuerySwitchApply,
  }
}

describe('useHomeMarketTagSelectionRuntime', () => {
  it('selects a new tag and schedules the query switch', () => {
    const { state, emitMarketTagSelect, dismissSortPopover, scheduleMarketQuerySwitchApply } =
      createHarness()

    state.handleMarketTagSelect({ id: 'hot', label: 'Hot' })

    expect(state.activeMarketTagId.value).toBe('hot')
    expect(emitMarketTagSelect).toHaveBeenCalledWith('Hot', 2)
    expect(dismissSortPopover).toHaveBeenCalledTimes(1)
    expect(scheduleMarketQuerySwitchApply).toHaveBeenCalledTimes(1)
  })

  it('falls back to all when the current tag disappears', () => {
    const { state } = createHarness()

    state.activeMarketTagId.value = 'missing'
    state.appliedMarketTagId.value = 'missing'
    state.syncMarketTagSelection(createTags())

    expect(state.activeMarketTagId.value).toBe('all')
    expect(state.appliedMarketTagId.value).toBe('all')
  })
})
