import { describe, expect, it } from 'vitest'
import { useHomeTrackMountMetrics } from '@/pages/home/composables/home/useHomeTrackMountMetrics'
import type { PageKey } from '@/models/home-shell/homeShell.model'

const pageKeys: readonly PageKey[] = ['home', 'activity', 'profile']

const createElementStub = (clientHeight: number, top = 0): HTMLElement =>
  ({
    clientHeight,
    getBoundingClientRect: () =>
      ({
        top,
        bottom: top + clientHeight,
        height: clientHeight,
        left: 0,
        right: 375,
        width: 375,
        x: 0,
        y: top,
        toJSON: () => '',
      }) as DOMRect,
  }) as HTMLElement

describe('useHomeTrackMountMetrics', () => {
  it('preserves viewport height when uni-app scroll events only provide detail metrics', () => {
    const element = createElementStub(640, 12)
    const runtime = useHomeTrackMountMetrics({
      pageKeys,
      homePageKey: 'home',
      resolveTrackScrollViewRef: () => null,
      resolveTrackWindowingSuspended: () => false,
    })

    runtime.handleTrackScroll('home', {
      detail: {
        scrollTop: 0,
        scrollHeight: 1800,
      },
      currentTarget: element,
    })
    expect(runtime.resolveTrackMountScrollMetrics('home')).toMatchObject({
      viewportHeight: 640,
      viewportTop: 12,
      isReady: true,
    })

    runtime.handleTrackScroll('home', {
      detail: {
        scrollTop: 280,
        scrollHeight: 1800,
      },
    })

    expect(runtime.resolveTrackMountScrollMetrics('home')).toMatchObject({
      scrollTop: 280,
      viewportHeight: 640,
      viewportTop: 12,
      isReady: true,
    })
    expect(runtime.homeTrackScrolled.value).toBe(true)
  })
})
