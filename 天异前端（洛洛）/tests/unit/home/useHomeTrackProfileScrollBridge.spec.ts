import { describe, expect, it, vi } from 'vitest'

const nextTickQueue: Array<() => void> = []

vi.mock('vue', async () => {
  const actual = await vi.importActual<typeof import('vue')>('vue')
  return {
    ...actual,
    nextTick: vi.fn(
      () =>
        new Promise<void>((resolve) => {
          nextTickQueue.push(resolve)
        })
    ),
  }
})

const flushQueuedNextTick = async () => {
  const resolver = nextTickQueue.shift()
  if (resolver) {
    resolver()
  }
  await Promise.resolve()
  await Promise.resolve()
}

describe('useHomeTrackProfileScrollBridge', () => {
  it('does not recreate target or timer when disposed before nextTick resolves', async () => {
    vi.useFakeTimers()

    const { useHomeTrackProfileScrollBridge } =
      await import('@/pages/home/composables/home/useHomeTrackProfileScrollBridge')
    const bridge = useHomeTrackProfileScrollBridge()

    bridge.handleProfileScrollToAssetsSection()

    bridge.disposeProfileScrollBridge()
    expect(bridge.profileScrollIntoViewTarget.value).toBe('')

    await flushQueuedNextTick()

    expect(bridge.profileScrollIntoViewTarget.value).toBe('')

    vi.advanceTimersByTime(200)
    expect(bridge.profileScrollIntoViewTarget.value).toBe('')

    vi.useRealTimers()
  })
})
