/**
 * Responsibility: decide whether the home market tag rail should show its right fade affordance.
 * Out of scope: DOM binding, scroll listener ownership, and visual styling.
 */

export interface HomeMarketTagFadeMetrics {
  scrollLeft?: number
  clientWidth?: number
  scrollWidth?: number
}

const RIGHT_FADE_OVERFLOW_THRESHOLD_PX = 2

const isFiniteNonNegativeNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value) && value >= 0

export const isRightFadeVisible = (metrics: HomeMarketTagFadeMetrics): boolean => {
  const { scrollLeft, clientWidth, scrollWidth } = metrics

  if (
    !isFiniteNonNegativeNumber(scrollLeft) ||
    !isFiniteNonNegativeNumber(clientWidth) ||
    !isFiniteNonNegativeNumber(scrollWidth) ||
    clientWidth <= 0 ||
    scrollWidth <= 0
  ) {
    return false
  }

  const maxScroll = scrollWidth - clientWidth
  return (
    maxScroll > RIGHT_FADE_OVERFLOW_THRESHOLD_PX &&
    scrollLeft < maxScroll - RIGHT_FADE_OVERFLOW_THRESHOLD_PX
  )
}
