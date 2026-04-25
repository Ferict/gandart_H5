/**
 * Responsibility: host shared refresh-presentation run state, including cancellable run ids and
 * settle-aware promise orchestration for page-level refresh visuals.
 * Out of scope: page-specific settled predicates, remote data loading, and result-window timing.
 */
import { ref } from 'vue'
import { waitForRefreshPresentationSettledOrCancelled } from './useRefreshPresentationWaiter'

interface StartRefreshPresentationOptions {
  awaitCompletion?: boolean
}

interface WaitForRefreshPresentationSettledOptions {
  targetRunId: number
  isSettled: () => boolean
  pollIntervalMs?: number
}

export const useRefreshPresentationRuntime = () => {
  const currentRefreshPresentationPromise = ref<Promise<void> | null>(null)
  const refreshPresentationRunId = ref(0)
  const cancelledRefreshPresentationRunId = ref(0)

  const markRefreshPresentationCancelled = (runId: number = refreshPresentationRunId.value) => {
    if (runId > cancelledRefreshPresentationRunId.value) {
      cancelledRefreshPresentationRunId.value = runId
    }
  }

  const isRefreshPresentationCancelled = (targetRunId: number) => {
    return cancelledRefreshPresentationRunId.value >= targetRunId
  }

  const startRefreshPresentation = (
    runner: (presentationRunId: number) => Promise<void>,
    options: StartRefreshPresentationOptions = {}
  ) => {
    const presentationRunId = refreshPresentationRunId.value + 1
    refreshPresentationRunId.value = presentationRunId
    cancelledRefreshPresentationRunId.value = Math.min(
      cancelledRefreshPresentationRunId.value,
      presentationRunId - 1
    )

    const presentationPromise = runner(presentationRunId)
    currentRefreshPresentationPromise.value = presentationPromise
    const finalize = presentationPromise.finally(() => {
      if (refreshPresentationRunId.value !== presentationRunId) {
        return
      }
      if (currentRefreshPresentationPromise.value !== presentationPromise) {
        return
      }
      currentRefreshPresentationPromise.value = null
    })

    if (options.awaitCompletion) {
      return finalize
    }

    void finalize
    return Promise.resolve()
  }

  const waitForRefreshPresentationSettled = async ({
    targetRunId,
    isSettled,
    pollIntervalMs,
  }: WaitForRefreshPresentationSettledOptions) => {
    await waitForRefreshPresentationSettledOrCancelled({
      isSettled,
      isCancelled: () => isRefreshPresentationCancelled(targetRunId),
      pollIntervalMs,
    })
  }

  const waitForRefreshPresentation = () =>
    currentRefreshPresentationPromise.value ?? Promise.resolve()

  const resetRefreshPresentationRuntimeForInactive = () => {
    markRefreshPresentationCancelled()
    currentRefreshPresentationPromise.value = null
  }

  return {
    refreshPresentationRunId,
    markRefreshPresentationCancelled,
    isRefreshPresentationCancelled,
    startRefreshPresentation,
    waitForRefreshPresentationSettled,
    waitForRefreshPresentation,
    resetRefreshPresentationRuntimeForInactive,
  }
}
