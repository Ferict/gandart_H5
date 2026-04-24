/**
 * Responsibility: provide the page-local pagination loading chain used by the
 * three home rails so footer loading is tied to real load or retry work.
 * Out of scope: remote data fetching, list projection, and visual component
 * rendering.
 */
import { computed, nextTick, ref } from 'vue'

export const HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG = {
  autoRetryDelaysMs: [800, 1600, 3200],
  autoRetryMaxAttempts: 3,
  loadMoreCooldownMs: 300,
  loadingRenderFrameMs: 16,
  noProgressRetryDelaysMs: [800, 1600],
  noProgressMaxAttempts: 2,
  requestTimeoutMs: 10000,
  triggerRemainingRowsThreshold: 8,
} as const

export type HomeRailPaginationLoadPhase =
  | 'idle'
  | 'requesting'
  | 'retry-waiting'
  | 'retry-requesting'
  | 'no-progress-retry-waiting'
  | 'no-progress-retry-requesting'
  | 'committing'
  | 'error'
  | 'endline'

export type HomeRailPaginationAttemptOutcome =
  | 'appended'
  | 'no-progress'
  | 'endline'
  | 'error'
  | 'stale'

export interface HomeRailPaginationAttemptContext {
  querySignature: string
  requestVersion: number
}

export interface HomeRailPaginationAttemptResult {
  outcome: HomeRailPaginationAttemptOutcome
  pageAdvanced?: boolean
  totalReached?: boolean
}

interface UseHomeRailPaginationLoadingChainOptions {
  resolveIsActive: () => boolean
  resolveQuerySignature: () => string
  onError?: () => void
  onEndline?: () => void
  onReset?: () => void
  onAttemptTimeout?: () => void
  onPhaseChange?: (phase: HomeRailPaginationLoadPhase) => void
}

interface StartHomeRailPaginationLoadChainOptions {
  manual?: boolean
}

type HomeRailPaginationAttemptRunner = (
  context: HomeRailPaginationAttemptContext
) => Promise<HomeRailPaginationAttemptResult>

const HOME_RAIL_PAGINATION_LOADING_PHASES = new Set<HomeRailPaginationLoadPhase>([
  'requesting',
  'retry-waiting',
  'retry-requesting',
  'no-progress-retry-waiting',
  'no-progress-retry-requesting',
  'committing',
])

const createStalePaginationResult = (): HomeRailPaginationAttemptResult => ({
  outcome: 'stale',
})

const createErrorPaginationResult = (): HomeRailPaginationAttemptResult => ({
  outcome: 'error',
})

const waitForPaginationLoadingRender = async () => {
  await nextTick()

  if (typeof requestAnimationFrame !== 'function') {
    await new Promise<void>((resolve) => {
      setTimeout(resolve, HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG.loadingRenderFrameMs)
    })
    return
  }

  await new Promise<void>((resolve) => {
    requestAnimationFrame(() => {
      resolve()
    })
  })
}

export const isHomeRailPaginationLoadingPhase = (phase: HomeRailPaginationLoadPhase) =>
  HOME_RAIL_PAGINATION_LOADING_PHASES.has(phase)

export const useHomeRailPaginationLoadingChain = (
  options: UseHomeRailPaginationLoadingChainOptions
) => {
  const phase = ref<HomeRailPaginationLoadPhase>('idle')
  const requestVersion = ref(0)
  let retryTimerId: ReturnType<typeof setTimeout> | null = null
  let lastTriggerAt = 0

  const isLoading = computed(() => isHomeRailPaginationLoadingPhase(phase.value))
  const hasError = computed(() => phase.value === 'error')
  const isEndline = computed(() => phase.value === 'endline')

  const clearRetryTimer = () => {
    if (retryTimerId === null) {
      return
    }

    clearTimeout(retryTimerId)
    retryTimerId = null
  }

  const setPhase = (nextPhase: HomeRailPaginationLoadPhase) => {
    phase.value = nextPhase
    options.onPhaseChange?.(nextPhase)
  }

  const isCurrentChainValid = (version: number, querySignature: string) => {
    return (
      requestVersion.value === version &&
      options.resolveIsActive() &&
      options.resolveQuerySignature() === querySignature
    )
  }

  const cancelPaginationLoadChain = () => {
    requestVersion.value += 1
    clearRetryTimer()
    setPhase('idle')
    options.onReset?.()
  }

  const resetPaginationLoadChain = () => {
    requestVersion.value += 1
    clearRetryTimer()
    setPhase('idle')
    options.onReset?.()
  }

  const waitForRetryDelay = async (delayMs: number, version: number, querySignature: string) => {
    await new Promise<void>((resolve) => {
      retryTimerId = setTimeout(() => {
        retryTimerId = null
        resolve()
      }, delayMs)
    })

    return isCurrentChainValid(version, querySignature)
  }

  const runAttemptWithTimeout = async (
    attempt: HomeRailPaginationAttemptRunner,
    context: HomeRailPaginationAttemptContext
  ): Promise<HomeRailPaginationAttemptResult> => {
    let timeoutId: ReturnType<typeof setTimeout> | null = null
    const timeoutPromise = new Promise<HomeRailPaginationAttemptResult>((resolve) => {
      timeoutId = setTimeout(() => {
        timeoutId = null
        options.onAttemptTimeout?.()
        resolve(createErrorPaginationResult())
      }, HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG.requestTimeoutMs)
    })

    const attemptPromise = attempt(context).catch(() => createErrorPaginationResult())
    const result = await Promise.race([attemptPromise, timeoutPromise])

    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }

    return result
  }

  const runVisibleAttemptWithTimeout = async (
    attempt: HomeRailPaginationAttemptRunner,
    context: HomeRailPaginationAttemptContext
  ): Promise<HomeRailPaginationAttemptResult> => {
    const attemptPromise = runAttemptWithTimeout(attempt, context)
    await waitForPaginationLoadingRender()
    return attemptPromise
  }

  const resolveFinalNoProgressResult = (
    result: HomeRailPaginationAttemptResult
  ): HomeRailPaginationAttemptResult => {
    if (result.pageAdvanced || result.totalReached) {
      options.onEndline?.()
      setPhase('endline')
      return {
        ...result,
        outcome: 'endline',
      }
    }

    options.onError?.()
    setPhase('error')
    return {
      ...result,
      outcome: 'error',
    }
  }

  const resolveErrorResult = (): HomeRailPaginationAttemptResult => {
    options.onError?.()
    setPhase('error')
    return createErrorPaginationResult()
  }

  const startPaginationLoadChain = async (
    attempt: HomeRailPaginationAttemptRunner,
    chainOptions: StartHomeRailPaginationLoadChainOptions = {}
  ): Promise<HomeRailPaginationAttemptResult> => {
    if (!options.resolveIsActive() || isLoading.value) {
      return createStalePaginationResult()
    }

    const now = Date.now()
    if (
      !chainOptions.manual &&
      now - lastTriggerAt < HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG.loadMoreCooldownMs
    ) {
      return createStalePaginationResult()
    }

    lastTriggerAt = now
    clearRetryTimer()
    const querySignature = options.resolveQuerySignature()
    const version = requestVersion.value + 1
    requestVersion.value = version
    setPhase('requesting')

    let errorRetryCount = 0
    let result = await runVisibleAttemptWithTimeout(attempt, {
      querySignature,
      requestVersion: version,
    })

    while (isCurrentChainValid(version, querySignature)) {
      if (result.outcome === 'stale') {
        setPhase('idle')
        return result
      }

      if (result.outcome === 'appended') {
        setPhase('committing')
        await nextTick()
        if (isCurrentChainValid(version, querySignature)) {
          setPhase('idle')
        }
        return result
      }

      if (result.outcome === 'endline') {
        options.onEndline?.()
        setPhase('endline')
        return result
      }

      if (result.outcome === 'no-progress') {
        let finalNoProgressResult = result
        let nextResult = result

        for (
          let retryIndex = 0;
          retryIndex < HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG.noProgressMaxAttempts;
          retryIndex += 1
        ) {
          setPhase('no-progress-retry-waiting')
          const canRetry = await waitForRetryDelay(
            HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG.noProgressRetryDelaysMs[retryIndex] ?? 0,
            version,
            querySignature
          )
          if (!canRetry) {
            setPhase('idle')
            return createStalePaginationResult()
          }

          setPhase('no-progress-retry-requesting')
          nextResult = await runVisibleAttemptWithTimeout(attempt, {
            querySignature,
            requestVersion: version,
          })
          if (nextResult.outcome !== 'no-progress') {
            break
          }
          finalNoProgressResult = nextResult
        }

        if (nextResult.outcome === 'no-progress') {
          return resolveFinalNoProgressResult(finalNoProgressResult)
        }

        result = nextResult
        continue
      }

      if (errorRetryCount >= HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG.autoRetryMaxAttempts) {
        return resolveErrorResult()
      }

      setPhase('retry-waiting')
      const canRetry = await waitForRetryDelay(
        HOME_RAIL_PAGINATION_LOADING_CHAIN_CONFIG.autoRetryDelaysMs[errorRetryCount] ?? 0,
        version,
        querySignature
      )
      if (!canRetry) {
        setPhase('idle')
        return createStalePaginationResult()
      }

      errorRetryCount += 1
      setPhase('retry-requesting')
      result = await runVisibleAttemptWithTimeout(attempt, {
        querySignature,
        requestVersion: version,
      })
    }

    if (requestVersion.value === version) {
      setPhase('idle')
    }
    return createStalePaginationResult()
  }

  return {
    phase,
    isLoading,
    hasError,
    isEndline,
    requestVersion,
    startPaginationLoadChain,
    cancelPaginationLoadChain,
    resetPaginationLoadChain,
  }
}
