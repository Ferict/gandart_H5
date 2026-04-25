/**
 * Responsibility: provide the accessibility state and retry hit-area defaults for the shared rail
 * loading footer across loading, error, and endline modes.
 * Out of scope: footer rendering, pagination control, and motion styling.
 */
export type HomeRailListLoadingFooterMode = 'loading' | 'error' | 'endline'

type LiveRole = 'status'
type LivePoliteness = 'polite'

export interface HomeRailListLoadingFooterA11yState {
  rootRole?: LiveRole
  rootAriaLive?: LivePoliteness
  errorLiveRole?: LiveRole
  errorLiveAriaLive?: LivePoliteness
  retryHitWidth: number
  retryHitHeight: number
}

export const HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_WIDTH = 44
export const HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_HEIGHT = 44

export const resolveHomeRailListLoadingFooterA11yState = (
  mode: HomeRailListLoadingFooterMode
): HomeRailListLoadingFooterA11yState => {
  if (mode === 'error') {
    return {
      retryHitWidth: HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_WIDTH,
      retryHitHeight: HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_HEIGHT,
      errorLiveRole: 'status',
      errorLiveAriaLive: 'polite',
    }
  }

  return {
    rootRole: 'status',
    rootAriaLive: 'polite',
    retryHitWidth: HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_WIDTH,
    retryHitHeight: HOME_RAIL_LIST_LOADING_FOOTER_RETRY_HIT_HEIGHT,
  }
}
