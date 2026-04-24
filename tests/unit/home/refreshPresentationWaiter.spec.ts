import { waitForRefreshPresentationSettledOrCancelled } from '@/pages/home/composables/shared/useRefreshPresentationWaiter'

describe('refreshPresentationWaiter', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('resolves when settled', async () => {
    vi.useFakeTimers()
    let settled = false
    const cancelled = false

    setTimeout(() => {
      settled = true
    }, 30)

    const waitPromise = waitForRefreshPresentationSettledOrCancelled({
      isSettled: () => settled,
      isCancelled: () => cancelled,
      pollIntervalMs: 10,
    })

    await vi.advanceTimersByTimeAsync(60)
    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('resolves when cancelled', async () => {
    vi.useFakeTimers()
    const settled = false
    let cancelled = false

    setTimeout(() => {
      cancelled = true
    }, 20)

    const waitPromise = waitForRefreshPresentationSettledOrCancelled({
      isSettled: () => settled,
      isCancelled: () => cancelled,
      pollIntervalMs: 10,
    })

    await vi.advanceTimersByTimeAsync(60)
    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('does not resolve early when neither settled nor cancelled', async () => {
    vi.useFakeTimers()
    const settled = false
    let cancelled = false
    let resolved = false

    const waitPromise = waitForRefreshPresentationSettledOrCancelled({
      isSettled: () => settled,
      isCancelled: () => cancelled,
      pollIntervalMs: 10,
    }).then(() => {
      resolved = true
    })

    await vi.advanceTimersByTimeAsync(120)
    expect(resolved).toBe(false)

    cancelled = true
    await vi.advanceTimersByTimeAsync(20)
    await waitPromise
    expect(resolved).toBe(true)
  })

  it('resolves immediately when already settled before waiting starts', async () => {
    vi.useFakeTimers()
    let pollCount = 0

    const waitPromise = waitForRefreshPresentationSettledOrCancelled({
      isSettled: () => {
        pollCount += 1
        return true
      },
      isCancelled: () => false,
      pollIntervalMs: 10,
    })

    await expect(waitPromise).resolves.toBeUndefined()
    expect(pollCount).toBe(1)
  })
})
