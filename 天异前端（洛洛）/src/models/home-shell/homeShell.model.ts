/**
 * Responsibility: declare the home shell page keys, layout constants, and mode enums shared by
 * shell scaffolds, responsive layout composables, and shell-level presentation runtime.
 * Out of scope: nav state mutation, drawer behavior, and page-specific content orchestration.
 */

export const HOME_SHELL_PAGE_KEYS = ['home', 'activity', 'profile'] as const
export type PageKey = (typeof HOME_SHELL_PAGE_KEYS)[number]
export const HOME_PRIMARY_PAGE_KEY: PageKey = 'home'
export const HOME_ACTIVITY_PAGE_KEY: PageKey = 'activity'
export const HOME_PROFILE_PAGE_KEY: PageKey = 'profile'

export const HOME_LAYOUT_MODE_SINGLE_PAGE = 'single-page'
export const HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV = 'single-page-with-nav'
export const HOME_LAYOUT_BASE_WIDTH = 375
export const HOME_LAYOUT_PAGE_MAX_WIDTH = 430
export const HOME_LAYOUT_NAV_RAIL_WIDTH = 76
export const HOME_LAYOUT_NAV_GAP = 16
export const HOME_LAYOUT_MIN_NAV_WIDTH =
  HOME_LAYOUT_PAGE_MAX_WIDTH + HOME_LAYOUT_NAV_GAP + HOME_LAYOUT_NAV_RAIL_WIDTH
// 网页版布局后续单开实现；当前仅登记 768 触发阈值，不参与现行壳层模式判定。
export const HOME_LAYOUT_MIN_WEB_STAGE_WIDTH = 768

export const HOME_SHELL_LAYOUT_MODES = [
  HOME_LAYOUT_MODE_SINGLE_PAGE,
  HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV,
] as const
export type LayoutMode = (typeof HOME_SHELL_LAYOUT_MODES)[number]
