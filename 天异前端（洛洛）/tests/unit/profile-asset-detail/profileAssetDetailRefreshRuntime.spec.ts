import { useRefreshPresentationRuntime } from '@/pages/home/composables/shared/useRefreshPresentationRuntime'

describe('profileAssetDetail refresh presentation runtime wiring', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('waitForRefreshPresentationSettled resolves on settled', async () => {
    vi.useFakeTimers()
    const runtime = useRefreshPresentationRuntime()
    let settled = false

    const waitPromise = runtime.waitForRefreshPresentationSettled({
      targetRunId: 1,
      isSettled: () => settled,
      pollIntervalMs: 10,
    })

    setTimeout(() => {
      settled = true
    }, 30)

    await vi.advanceTimersByTimeAsync(80)
    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('waitForRefreshPresentationSettled resolves on cancel', async () => {
    vi.useFakeTimers()
    const runtime = useRefreshPresentationRuntime()
    const targetRunId = 3
    const waitPromise = runtime.waitForRefreshPresentationSettled({
      targetRunId,
      isSettled: () => false,
      pollIntervalMs: 10,
    })

    setTimeout(() => {
      runtime.markRefreshPresentationCancelled(targetRunId)
    }, 20)

    await vi.advanceTimersByTimeAsync(80)
    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('waitForRefreshPresentationSettled does not resolve early when unsettled and not cancelled', async () => {
    vi.useFakeTimers()
    const runtime = useRefreshPresentationRuntime()
    const targetRunId = 7
    let resolved = false
    const waitPromise = runtime
      .waitForRefreshPresentationSettled({
        targetRunId,
        isSettled: () => false,
        pollIntervalMs: 10,
      })
      .then(() => {
        resolved = true
      })

    await vi.advanceTimersByTimeAsync(120)
    expect(resolved).toBe(false)

    runtime.markRefreshPresentationCancelled(targetRunId)
    await vi.advanceTimersByTimeAsync(20)
    await waitPromise
    expect(resolved).toBe(true)
  })

  it('pull-refresh path keeps waitForRefreshPresentation aligned with the active presentation promise', async () => {
    vi.useFakeTimers()
    const runtime = useRefreshPresentationRuntime()
    const runner = vi.fn(
      async () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 40)
        })
    )

    const startPromise = runtime.startRefreshPresentation(runner, {
      awaitCompletion: true,
    })
    const waitPromise = runtime.waitForRefreshPresentation()

    await vi.advanceTimersByTimeAsync(80)
    await expect(startPromise).resolves.toBeUndefined()
    await expect(waitPromise).resolves.toBeUndefined()
    expect(runner).toHaveBeenCalledTimes(1)
  })
})
