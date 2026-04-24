import { useProfileAssetSearchRevealTransition } from '@/pages/home/composables/profile/useProfileAssetSearchRevealTransition'

type TransitionEndHandler = (event: { target: unknown; propertyName: string }) => void

const createMockStage = (cardHeight?: number) => {
  const listeners = new Map<string, TransitionEndHandler>()
  const stage = {
    style: {
      height: '',
      overflow: '',
      transition: '',
      willChange: '',
    },
    dataset: {} as Record<string, string>,
    querySelector: vi.fn(() => {
      if (typeof cardHeight !== 'number') {
        return null
      }
      return {
        offsetHeight: cardHeight,
      }
    }),
    addEventListener: vi.fn((eventName: string, handler: TransitionEndHandler) => {
      listeners.set(eventName, handler)
    }),
    removeEventListener: vi.fn((eventName: string, handler: TransitionEndHandler) => {
      const current = listeners.get(eventName)
      if (current === handler) {
        listeners.delete(eventName)
      }
    }),
    dispatchTransitionEnd: () => {
      const handler = listeners.get('transitionend')
      handler?.({ target: stage, propertyName: 'height' })
    },
    get offsetHeight() {
      return 72
    },
  }

  return stage
}

describe('useProfileAssetSearchRevealTransition', () => {
  it('handles reveal enter/leave transition and fallback height', () => {
    const scheduleSync = vi.fn()
    const originalRequestAnimationFrame = globalThis.requestAnimationFrame
    const requestAnimationFrameMock = vi.fn((callback: FrameRequestCallback) => {
      callback(0)
      return 1
    })
    globalThis.requestAnimationFrame = requestAnimationFrameMock

    const transition = useProfileAssetSearchRevealTransition({
      scheduleProfileAssetMountWindowSync: scheduleSync,
      fallbackHeightPx: 88,
    })

    const stage = createMockStage(72)

    transition.handleProfileSearchRevealBeforeEnter(stage as unknown as Element)
    expect(stage.style.height).toBe('0px')
    expect(stage.dataset.revealHeight).toBe('72')

    const enterDone = vi.fn()
    transition.handleProfileSearchRevealEnter(stage as unknown as Element, enterDone)
    expect(stage.style.height).toBe('72px')
    stage.dispatchTransitionEnd()
    expect(enterDone).toHaveBeenCalledTimes(1)

    transition.handleProfileSearchRevealAfterEnter(stage as unknown as Element)
    expect(stage.style.height).toBe('')
    expect(stage.dataset.revealHeight).toBeUndefined()
    expect(scheduleSync).toHaveBeenCalledTimes(1)

    transition.handleProfileSearchRevealBeforeLeave(stage as unknown as Element)
    expect(stage.style.height).toBe('72px')

    const leaveDone = vi.fn()
    transition.handleProfileSearchRevealLeave(stage as unknown as Element, leaveDone)
    expect(stage.style.height).toBe('0px')
    stage.dispatchTransitionEnd()
    expect(leaveDone).toHaveBeenCalledTimes(1)

    transition.handleProfileSearchRevealAfterLeave(stage as unknown as Element)
    expect(stage.style.height).toBe('')
    expect(scheduleSync).toHaveBeenCalledTimes(2)

    const fallbackTransition = useProfileAssetSearchRevealTransition({
      scheduleProfileAssetMountWindowSync: scheduleSync,
      fallbackHeightPx: 88,
    })
    const stageWithoutCard = createMockStage()
    fallbackTransition.handleProfileSearchRevealBeforeEnter(stageWithoutCard as unknown as Element)
    expect(stageWithoutCard.dataset.revealHeight).toBe('88')

    globalThis.requestAnimationFrame = originalRequestAnimationFrame
  })
})
