import { describe, expect, it, vi } from 'vitest'
import { useHomeMarketSearchRuntime } from '@/pages/home/composables/home/useHomeMarketSearchRuntime'

const createHarness = () => {
  const emitMarketSearchClick = vi.fn()
  const dismissSortPopover = vi.fn()
  const scheduleMarketMountWindowSync = vi.fn()
  let pendingTask: (() => void) | null = null

  const state = useHomeMarketSearchRuntime({
    emitMarketSearchClick,
    dismissSortPopover,
    scheduleMarketMountWindowSync,
    searchDebounce: {
      schedule(task) {
        pendingTask = task
      },
      clear() {
        pendingTask = null
      },
    },
  })

  const flushDebounce = () => {
    pendingTask?.()
    pendingTask = null
  }

  return {
    state,
    emitMarketSearchClick,
    dismissSortPopover,
    flushDebounce,
  }
}

describe('useHomeMarketSearchRuntime', () => {
  it('debounces the applied keyword and keeps the normalized value', () => {
    const { state, flushDebounce } = createHarness()

    state.handleMarketKeywordInput({
      detail: {
        value: '  first',
      },
    } as unknown as Event)
    expect(state.normalizedAppliedMarketKeyword.value).toBe('')

    state.handleMarketKeywordInput({
      target: {
        value: '  Second  ',
      },
    } as unknown as Event)

    flushDebounce()

    expect(state.marketKeyword.value).toBe('Second  ')
    expect(state.normalizedMarketKeyword.value).toBe('second')
    expect(state.normalizedAppliedMarketKeyword.value).toBe('second')
    expect(state.isMarketSearchApplied.value).toBe(true)
  })

  it('toggles search visibility and clears the current keyword on second click', () => {
    const { state, emitMarketSearchClick, dismissSortPopover, flushDebounce } = createHarness()

    state.handleMarketSearchClick()
    expect(state.isMarketSearchVisible.value).toBe(true)
    expect(emitMarketSearchClick).toHaveBeenCalledTimes(1)
    expect(dismissSortPopover).toHaveBeenCalledTimes(1)

    state.handleMarketKeywordInput({
      detail: {
        value: 'Collectible',
      },
    } as unknown as Event)
    flushDebounce()
    expect(state.isMarketSearchApplied.value).toBe(true)

    state.handleMarketSearchClick()

    expect(state.isMarketSearchVisible.value).toBe(false)
    expect(state.marketKeyword.value).toBe('')
    expect(state.normalizedAppliedMarketKeyword.value).toBe('')
    expect(emitMarketSearchClick).toHaveBeenCalledTimes(2)
    expect(dismissSortPopover).toHaveBeenCalledTimes(2)
  })
})
