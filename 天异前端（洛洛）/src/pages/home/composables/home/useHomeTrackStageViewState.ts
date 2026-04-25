/**
 * Responsibility: host HomeShellTrackStage layout-derived view state, active-page flags, and
 * runtime style projection for the track shell.
 * Out of scope: refresh dispatch, mount lifecycle orchestration, and profile scroll bridging.
 */

import { computed, type CSSProperties } from 'vue'
import {
  HOME_ACTIVITY_PAGE_KEY,
  HOME_LAYOUT_NAV_GAP,
  HOME_LAYOUT_NAV_RAIL_WIDTH,
  HOME_LAYOUT_PAGE_MAX_WIDTH,
  HOME_PROFILE_PAGE_KEY,
  HOME_PRIMARY_PAGE_KEY,
  type LayoutMode,
  type PageKey,
} from '../../../../models/home-shell/homeShell.model'
import {
  resolveHomeShellInsets,
  resolveHomeShellTrackLayoutState,
  type ViewportRuntimeContext,
} from '../../../../services/home-shell/homeShellLayoutMode.service'
import type { HomeShellDerivedState } from '../../../../services/home-shell/homeShellState.service'

const HOME_TRACK_TABBAR_BOTTOM_GAP_PX = 32
const HOME_TRACK_TABBAR_SURFACE_HEIGHT_PX = 64
const HOME_TRACK_CONTENT_BOTTOM_CLEARANCE_PX = 32
const HOME_TRACK_CONTENT_BOTTOM_RESERVE_PX =
  HOME_TRACK_TABBAR_BOTTOM_GAP_PX +
  HOME_TRACK_TABBAR_SURFACE_HEIGHT_PX +
  HOME_TRACK_CONTENT_BOTTOM_CLEARANCE_PX

interface UseHomeTrackStageViewStateOptions {
  resolveLayoutMode: () => LayoutMode
  resolveRuntimeContext: () => ViewportRuntimeContext
  resolveHomeShellDerivedState: () => HomeShellDerivedState
}

export const useHomeTrackStageViewState = ({
  resolveLayoutMode,
  resolveRuntimeContext,
  resolveHomeShellDerivedState,
}: UseHomeTrackStageViewStateOptions) => {
  const trackLayoutState = computed(() => resolveHomeShellTrackLayoutState(resolveLayoutMode()))
  const isNavRailVisible = computed(() => {
    return trackLayoutState.value.showNavRail
  })
  const activePageKey = computed<PageKey>(() => resolveHomeShellDerivedState().activePage)
  const isHomePage = computed(() => activePageKey.value === HOME_PRIMARY_PAGE_KEY)
  const isActivityPage = computed(() => activePageKey.value === HOME_ACTIVITY_PAGE_KEY)
  const isProfilePage = computed(() => activePageKey.value === HOME_PROFILE_PAGE_KEY)
  const runtimeInsets = computed(() => resolveHomeShellInsets(resolveRuntimeContext()))

  const runtimeStyle = computed<CSSProperties>(() => {
    const runtimeContext = resolveRuntimeContext()
    const stageHeight =
      runtimeContext.viewportHeight > 0 ? `${runtimeContext.viewportHeight}px` : undefined
    const tabbarReserve = trackLayoutState.value.showBottomTabbar
      ? HOME_TRACK_CONTENT_BOTTOM_RESERVE_PX
      : 32

    return {
      '--home-safe-top': `${runtimeInsets.value.topInset}px`,
      '--home-safe-bottom': `${runtimeInsets.value.bottomInset}px`,
      '--home-stage-height': stageHeight,
      '--home-tabbar-reserve': `${tabbarReserve}px`,
      '--home-page-max-width': `${HOME_LAYOUT_PAGE_MAX_WIDTH}px`,
      '--home-nav-rail-width': `${HOME_LAYOUT_NAV_RAIL_WIDTH}px`,
      '--home-nav-gap': `${HOME_LAYOUT_NAV_GAP}px`,
    } as CSSProperties
  })

  return {
    trackLayoutState,
    isNavRailVisible,
    activePageKey,
    isHomePage,
    isActivityPage,
    isProfilePage,
    runtimeStyle,
  }
}
