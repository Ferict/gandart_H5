/**
 * Responsibility: provide the shared polling waiter used by refresh-presentation runtimes to wait
 * until a run settles or is cancelled.
 * Out of scope: run-id ownership, page-specific settled logic, and refresh trigger dispatch.
 */
export interface RefreshPresentationWaitOptions {
  isSettled: () => boolean
  isCancelled: () => boolean
  pollIntervalMs?: number
}

const DEFAULT_POLL_INTERVAL_MS = 16

const waitForMs = (durationMs: number) =>
  new Promise<void>((resolve) => {
    setTimeout(resolve, durationMs)
  })

export const waitForRefreshPresentationSettledOrCancelled = async (
  options: RefreshPresentationWaitOptions
) => {
  const pollIntervalMs =
    options.pollIntervalMs && options.pollIntervalMs > 0
      ? options.pollIntervalMs
      : DEFAULT_POLL_INTERVAL_MS

  let shouldWait = true
  while (shouldWait) {
    if (options.isCancelled() || options.isSettled()) {
      shouldWait = false
      continue
    }

    await waitForMs(pollIntervalMs)
  }
}
