/**
 * Responsibility: provide the static placeholder item sets used by the home-shell drawer and nav
 * loading states.
 * Out of scope: real menu assembly, shell state derivation, and placeholder rendering styles.
 */

import type { HomeShellPlaceholderItem } from '../../models/home-shell/homeShellPlaceholder.model'

const HOME_SHELL_DRAWER_ITEMS: ReadonlyArray<HomeShellPlaceholderItem> = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
]

const HOME_SHELL_NAV_ITEMS: ReadonlyArray<HomeShellPlaceholderItem> = [
  { id: 1 },
  { id: 2 },
  { id: 3 },
  { id: 4 },
  { id: 5 },
  { id: 6 },
  { id: 7 },
]

const cloneItems = (items: ReadonlyArray<HomeShellPlaceholderItem>): HomeShellPlaceholderItem[] => {
  return items.map((item) => ({ ...item }))
}

export const getHomeShellDrawerItems = (): HomeShellPlaceholderItem[] => {
  return cloneItems(HOME_SHELL_DRAWER_ITEMS)
}

export const getHomeShellNavItems = (): HomeShellPlaceholderItem[] => {
  return cloneItems(HOME_SHELL_NAV_ITEMS)
}
