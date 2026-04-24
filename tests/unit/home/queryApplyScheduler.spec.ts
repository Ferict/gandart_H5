import { afterEach, describe, expect, it, vi } from 'vitest'
import { createQueryApplyScheduler } from '@/pages/home/composables/shared/queryApplyScheduler'

describe('queryApplyScheduler', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resets the debounce timer on repeated schedules', async () => {
    vi.useFakeTimers()
    const { searchDebounce } = createQueryApplyScheduler()
    const apply = vi.fn()

    searchDebounce.schedule(() => apply('first'), 300)
    await vi.advanceTimersByTimeAsync(180)
    searchDebounce.schedule(() => apply('second'), 300)

    await vi.advanceTimersByTimeAsync(299)
    expect(apply).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(apply).toHaveBeenCalledTimes(1)
    expect(apply).toHaveBeenLastCalledWith('second')
  })

  it('uses a fixed trailing throttle window for query switches', async () => {
    vi.useFakeTimers()
    const { querySwitchThrottle } = createQueryApplyScheduler()
    const apply = vi.fn()

    querySwitchThrottle.schedule(() => apply('first'), 220)
    await vi.advanceTimersByTimeAsync(100)
    querySwitchThrottle.schedule(() => apply('second'), 220)
    await vi.advanceTimersByTimeAsync(100)
    querySwitchThrottle.schedule(() => apply('third'), 220)

    await vi.advanceTimersByTimeAsync(19)
    expect(apply).not.toHaveBeenCalled()

    await vi.advanceTimersByTimeAsync(1)
    expect(apply).toHaveBeenCalledTimes(1)
    expect(apply).toHaveBeenLastCalledWith('third')

    querySwitchThrottle.schedule(() => apply('fourth'), 220)
    await vi.advanceTimersByTimeAsync(220)
    expect(apply).toHaveBeenCalledTimes(2)
    expect(apply).toHaveBeenLastCalledWith('fourth')
  })

  it('clears pending debounce and throttle callbacks', async () => {
    vi.useFakeTimers()
    const { searchDebounce, querySwitchThrottle, clearAll } = createQueryApplyScheduler()
    const apply = vi.fn()

    searchDebounce.schedule(() => apply('search'), 300)
    querySwitchThrottle.schedule(() => apply('switch'), 220)
    clearAll()

    await vi.advanceTimersByTimeAsync(400)
    expect(apply).not.toHaveBeenCalled()
  })
})
