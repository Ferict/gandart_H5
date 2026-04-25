import { describe, expect, it } from 'vitest'
import {
  HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_HEIGHT,
  HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_WIDTH,
  resolveHomeRailListLoadingFooterA11yState,
} from '@/pages/home/components/shared/homeRailListLoadingFooter.a11y'

describe('HomeRailListLoadingFooter a11y helper', () => {
  it('keeps root status/live in loading mode', () => {
    const a11y = resolveHomeRailListLoadingFooterA11yState('loading')
    expect(a11y.rootRole).toBe('status')
    expect(a11y.rootAriaLive).toBe('polite')
    expect(a11y.errorLiveRole).toBeUndefined()
    expect(a11y.errorLiveAriaLive).toBeUndefined()
  })

  it('keeps root status/live in endline mode', () => {
    const a11y = resolveHomeRailListLoadingFooterA11yState('endline')
    expect(a11y.rootRole).toBe('status')
    expect(a11y.rootAriaLive).toBe('polite')
    expect(a11y.errorLiveRole).toBeUndefined()
    expect(a11y.errorLiveAriaLive).toBeUndefined()
  })

  it('uses dedicated error region + retry hit target >= 44 in error mode', () => {
    const a11y = resolveHomeRailListLoadingFooterA11yState('error')

    expect(a11y.rootRole).toBeUndefined()
    expect(a11y.rootAriaLive).toBeUndefined()
    expect(a11y.errorLiveRole).toBe('status')
    expect(a11y.errorLiveAriaLive).toBe('polite')
    expect(a11y.retryHitWidth).toBe(HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_WIDTH)
    expect(a11y.retryHitHeight).toBe(HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_HEIGHT)
    expect(a11y.retryHitWidth).toBe(44)
    expect(a11y.retryHitHeight).toBe(44)
  })
})
