/**
 * Responsibility: resolve the unified updating page back-navigation fallback without
 * leaking routing decisions into child retained-module pages.
 * Out of scope: route-query parsing, feature-specific page rendering, and transport logic.
 */

export interface UpdatingBackNavigator {
  navigateBack: () => void
  reLaunch: (options: { url: string }) => void
}

export type UpdatingBackNavigationResult = 'navigate-back' | 'relaunch-home'

export const runUpdatingBackNavigation = (
  pageStackLength: number,
  navigator: UpdatingBackNavigator
): UpdatingBackNavigationResult => {
  if (pageStackLength > 1) {
    navigator.navigateBack()
    return 'navigate-back'
  }

  navigator.reLaunch({
    url: '/pages/home/index',
  })
  return 'relaunch-home'
}
