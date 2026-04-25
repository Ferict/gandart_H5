import { useActivityPagePresentationRuntime } from '@/pages/home/composables/activity/useActivityPagePresentationRuntime'

describe('useActivityPagePresentationRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('waitForNoticeRefreshPresentationSettled resolves on settled', async () => {
    vi.useFakeTimers()
    let settled = false
    const runtime = useActivityPagePresentationRuntime({
      isNoticeRefreshPresentationSettled: () => settled,
    })

    const waitPromise = runtime.waitForNoticeRefreshPresentationSettled(1, 1)
    setTimeout(() => {
      settled = true
    }, 30)

    await vi.advanceTimersByTimeAsync(80)
    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('waitForNoticeRefreshPresentationSettled resolves on cancel', async () => {
    vi.useFakeTimers()
    const runtime = useActivityPagePresentationRuntime({
      isNoticeRefreshPresentationSettled: () => false,
    })

    const targetRunId = 4
    const waitPromise = runtime.waitForNoticeRefreshPresentationSettled(1, targetRunId)
    setTimeout(() => {
      runtime.markNoticeRefreshPresentationCancelled(targetRunId)
    }, 20)

    await vi.advanceTimersByTimeAsync(80)
    await expect(waitPromise).resolves.toBeUndefined()
  })

  it('waitForNoticeRefreshPresentationSettled does not resolve early when unsettled and not cancelled', async () => {
    vi.useFakeTimers()
    const runtime = useActivityPagePresentationRuntime({
      isNoticeRefreshPresentationSettled: () => false,
    })

    const targetRunId = 7
    let resolved = false
    const waitPromise = runtime.waitForNoticeRefreshPresentationSettled(1, targetRunId).then(() => {
      resolved = true
    })

    await vi.advanceTimersByTimeAsync(120)
    expect(resolved).toBe(false)

    runtime.markNoticeRefreshPresentationCancelled(targetRunId)
    await vi.advanceTimersByTimeAsync(20)
    await waitPromise
    expect(resolved).toBe(true)
  })

  it('waitForRefreshPresentation follows current pull-refresh presentation promise', async () => {
    vi.useFakeTimers()
    const runtime = useActivityPagePresentationRuntime({
      isNoticeRefreshPresentationSettled: () => true,
    })
    const runner = vi.fn(
      async () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 25)
        })
    )

    const startPromise = runtime.startNoticePullRefreshPresentation(runner)
    const waitPromise = runtime.waitForRefreshPresentation()

    await vi.advanceTimersByTimeAsync(50)
    await expect(startPromise).resolves.toBeUndefined()
    await expect(waitPromise).resolves.toBeUndefined()
    expect(runner).toHaveBeenCalledTimes(1)
  })
})
