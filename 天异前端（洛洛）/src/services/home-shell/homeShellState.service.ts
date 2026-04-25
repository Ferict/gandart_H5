/**
 * Responsibility: derive the home-shell tab activity flags and shared shell state from the active
 * page and layout mode.
 * Out of scope: DOM side effects, route navigation, and page-content persistence.
 */

import {
  HOME_ACTIVITY_PAGE_KEY,
  HOME_PRIMARY_PAGE_KEY,
  HOME_PROFILE_PAGE_KEY,
  type LayoutMode,
  type PageKey,
} from '../../models/home-shell/homeShell.model'
import { canUseDrawerInLayoutMode } from './homeShellLayoutMode.service'

export const isHomePrimaryPageKey = (pageKey: PageKey): boolean => {
  return pageKey === HOME_PRIMARY_PAGE_KEY
}

export interface HomeShellTabActivityFlags {
  isHomeTabActive: boolean
  isActivityTabActive: boolean
  isProfileTabActive: boolean
}

export const resolveHomeShellTabActivityFlags = (
  activePage: PageKey
): HomeShellTabActivityFlags => {
  return {
    isHomeTabActive: isHomePrimaryPageKey(activePage),
    isActivityTabActive: activePage === HOME_ACTIVITY_PAGE_KEY,
    isProfileTabActive: activePage === HOME_PROFILE_PAGE_KEY,
  }
}

export interface HomeShellDerivedState {
  activePage: PageKey
  canUseDrawer: boolean
  tabActivityFlags: HomeShellTabActivityFlags
}

export const resolveHomeShellDerivedState = (
  layoutMode: LayoutMode,
  activePage: PageKey
): HomeShellDerivedState => {
  return {
    activePage,
    canUseDrawer: canUseDrawerInLayoutMode(layoutMode),
    tabActivityFlags: resolveHomeShellTabActivityFlags(activePage),
  }
}

interface HomeShellLayoutTransitionInput {
  nextLayoutMode: LayoutMode
}

interface HomeShellLayoutTransitionResult {
  shouldCloseDrawer: boolean
}

export const resolveHomeShellStateOnLayoutChange = (
  input: HomeShellLayoutTransitionInput
): HomeShellLayoutTransitionResult => {
  return {
    shouldCloseDrawer: !canUseDrawerInLayoutMode(input.nextLayoutMode),
  }
}

interface HomeShellTabChangeInput {
  nextTab: PageKey
}

interface HomeShellTabChangeResult {
  nextActivePage: PageKey
}

export const resolveHomeShellStateOnTabChange = (
  input: HomeShellTabChangeInput
): HomeShellTabChangeResult => {
  return {
    nextActivePage: input.nextTab,
  }
}
