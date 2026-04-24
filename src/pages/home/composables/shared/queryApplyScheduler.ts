/**
 * Responsibility: provide the shared delayed-apply scheduler used by query pipelines to debounce
 * apply operations without owning query state itself.
 * Out of scope: query snapshot construction, remote-list loading, and result-window transitions.
 */
export interface QueryApplyScheduler {
  schedule: (apply: () => void, delayMs: number) => void
  clear: () => void
}

const createDebounceApplyScheduler = (): QueryApplyScheduler => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null

  const clear = () => {
    if (!timeoutId) {
      return
    }

    clearTimeout(timeoutId)
    timeoutId = null
  }

  const schedule = (apply: () => void, delayMs: number) => {
    clear()
    timeoutId = setTimeout(() => {
      timeoutId = null
      apply()
    }, delayMs)
  }

  return {
    schedule,
    clear,
  }
}

const createTrailingThrottleApplyScheduler = (): QueryApplyScheduler => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  let pendingApply: (() => void) | null = null

  const clear = () => {
    if (timeoutId) {
      clearTimeout(timeoutId)
      timeoutId = null
    }

    pendingApply = null
  }

  const flush = () => {
    const apply = pendingApply
    timeoutId = null
    pendingApply = null
    apply?.()
  }

  const schedule = (apply: () => void, delayMs: number) => {
    pendingApply = apply
    if (timeoutId) {
      return
    }

    timeoutId = setTimeout(flush, delayMs)
  }

  return {
    schedule,
    clear,
  }
}

export const createQueryApplyScheduler = () => {
  const searchDebounce = createDebounceApplyScheduler()
  const querySwitchThrottle = createTrailingThrottleApplyScheduler()

  return {
    searchDebounce,
    querySwitchThrottle,
    clearAll: () => {
      searchDebounce.clear()
      querySwitchThrottle.clear()
    },
  }
}
