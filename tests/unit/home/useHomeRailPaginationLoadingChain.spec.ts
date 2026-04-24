import { afterEach, describe, expect, it, vi } from 'vitest'
import { useHomeRailPaginationLoadingChain } from '@/pages/home/composables/shared/useHomeRailPaginationLoadingChain'

const stubImmediateAnimationFrame = () => {
  vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
    callback(0)
    return 1
  })
}

describe('useHomeRailPaginationLoadingChain', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
    vi.useRealTimers()
  })

  it('retries request errors three times before exposing error', async () => {
    vi.useFakeTimers()
    stubImmediateAnimationFrame()
    const onError = vi.fn()
    const chain = useHomeRailPaginationLoadingChain({
      resolveIsActive: () => true,
      resolveQuerySignature: () => 'sig-error',
      onError,
    })
    const attempt = vi.fn(async () => ({ outcome: 'error' as const }))

    const resultPromise = chain.startPaginationLoadChain(attempt)
    await vi.advanceTimersByTimeAsync(800 + 1600 + 3200)
    const result = await resultPromise

    expect(attempt).toHaveBeenCalledTimes(4)
    expect(result.outcome).toBe('error')
    expect(chain.phase.value).toBe('error')
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('turns repeated no-progress into endline when the page advanced', async () => {
    vi.useFakeTimers()
    stubImmediateAnimationFrame()
    const onEndline = vi.fn()
    const chain = useHomeRailPaginationLoadingChain({
      resolveIsActive: () => true,
      resolveQuerySignature: () => 'sig-endline',
      onEndline,
    })
    const attempt = vi.fn(async () => ({
      outcome: 'no-progress' as const,
      pageAdvanced: true,
    }))

    const resultPromise = chain.startPaginationLoadChain(attempt)
    await vi.advanceTimersByTimeAsync(800 + 1600)
    const result = await resultPromise

    expect(attempt).toHaveBeenCalledTimes(3)
    expect(result.outcome).toBe('endline')
    expect(chain.phase.value).toBe('endline')
    expect(onEndline).toHaveBeenCalledTimes(1)
  })

  it('turns repeated no-progress into error without page or total progress', async () => {
    vi.useFakeTimers()
    stubImmediateAnimationFrame()
    const onError = vi.fn()
    const chain = useHomeRailPaginationLoadingChain({
      resolveIsActive: () => true,
      resolveQuerySignature: () => 'sig-no-progress',
      onError,
    })
    const attempt = vi.fn(async () => ({
      outcome: 'no-progress' as const,
      pageAdvanced: false,
      totalReached: false,
    }))

    const resultPromise = chain.startPaginationLoadChain(attempt)
    await vi.advanceTimersByTimeAsync(800 + 1600)
    const result = await resultPromise

    expect(attempt).toHaveBeenCalledTimes(3)
    expect(result.outcome).toBe('error')
    expect(chain.phase.value).toBe('error')
    expect(onError).toHaveBeenCalledTimes(1)
  })

  it('uses version and query signature to stop stale retry chains', async () => {
    vi.useFakeTimers()
    stubImmediateAnimationFrame()
    let signature = 'sig-before'
    const chain = useHomeRailPaginationLoadingChain({
      resolveIsActive: () => true,
      resolveQuerySignature: () => signature,
    })
    const attempt = vi.fn(async () => ({ outcome: 'error' as const }))

    const resultPromise = chain.startPaginationLoadChain(attempt)
    signature = 'sig-after'
    await vi.advanceTimersByTimeAsync(800)
    const result = await resultPromise

    expect(result.outcome).toBe('stale')
    expect(chain.phase.value).toBe('idle')
  })

  it('keeps cooldown for automatic triggers but lets manual retry start a new chain', async () => {
    vi.useFakeTimers()
    stubImmediateAnimationFrame()
    const chain = useHomeRailPaginationLoadingChain({
      resolveIsActive: () => true,
      resolveQuerySignature: () => 'sig-cooldown',
    })
    const attempt = vi.fn(async () => ({ outcome: 'appended' as const }))

    await chain.startPaginationLoadChain(attempt)
    const automaticRetry = await chain.startPaginationLoadChain(attempt)
    const manualRetry = await chain.startPaginationLoadChain(attempt, { manual: true })

    expect(automaticRetry.outcome).toBe('stale')
    expect(manualRetry.outcome).toBe('appended')
    expect(attempt).toHaveBeenCalledTimes(2)
  })

  it('keeps loading visible for a render frame even when the attempt resolves immediately', async () => {
    vi.useFakeTimers()
    vi.stubGlobal('requestAnimationFrame', (callback: FrameRequestCallback) => {
      setTimeout(() => callback(16), 16)
      return 1
    })

    const chain = useHomeRailPaginationLoadingChain({
      resolveIsActive: () => true,
      resolveQuerySignature: () => 'sig-fast',
    })
    const attempt = vi.fn(async () => ({ outcome: 'appended' as const }))

    const resultPromise = chain.startPaginationLoadChain(attempt)
    await Promise.resolve()

    expect(attempt).toHaveBeenCalledTimes(1)
    expect(chain.phase.value).toBe('requesting')
    expect(chain.isLoading.value).toBe(true)

    await vi.advanceTimersByTimeAsync(15)
    expect(chain.phase.value).toBe('requesting')
    expect(chain.isLoading.value).toBe(true)

    await vi.advanceTimersByTimeAsync(1)
    const result = await resultPromise

    expect(result.outcome).toBe('appended')
    expect(chain.phase.value).toBe('idle')
    expect(chain.isLoading.value).toBe(false)
  })
})
