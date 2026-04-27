import { describe, expect, it } from 'vitest'
import { isRightFadeVisible } from '@/pages/home/components/home/homeMarketTagFade'

describe('home market tag right fade', () => {
  it('hides when there is no horizontal overflow', () => {
    expect(isRightFadeVisible({ scrollLeft: 0, clientWidth: 320, scrollWidth: 320 })).toBe(false)
    expect(isRightFadeVisible({ scrollLeft: 0, clientWidth: 320, scrollWidth: 321 })).toBe(false)
  })

  it('shows when content still exists to the right', () => {
    expect(isRightFadeVisible({ scrollLeft: 0, clientWidth: 320, scrollWidth: 520 })).toBe(true)
    expect(isRightFadeVisible({ scrollLeft: 80, clientWidth: 320, scrollWidth: 520 })).toBe(true)
  })

  it('hides at or near the right edge', () => {
    expect(isRightFadeVisible({ scrollLeft: 198, clientWidth: 320, scrollWidth: 520 })).toBe(false)
    expect(isRightFadeVisible({ scrollLeft: 200, clientWidth: 320, scrollWidth: 520 })).toBe(false)
  })

  it('hides when metrics are missing or invalid', () => {
    expect(isRightFadeVisible({})).toBe(false)
    expect(isRightFadeVisible({ scrollLeft: -1, clientWidth: 320, scrollWidth: 520 })).toBe(false)
    expect(isRightFadeVisible({ scrollLeft: Number.NaN, clientWidth: 320, scrollWidth: 520 })).toBe(
      false
    )
    expect(
      isRightFadeVisible({
        scrollLeft: Number.POSITIVE_INFINITY,
        clientWidth: 320,
        scrollWidth: 520,
      })
    ).toBe(false)
    expect(isRightFadeVisible({ scrollLeft: 0, clientWidth: 0, scrollWidth: 520 })).toBe(false)
    expect(isRightFadeVisible({ scrollLeft: 0, clientWidth: 320, scrollWidth: 0 })).toBe(false)
  })
})
