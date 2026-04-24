/**
 * Responsibility: map home-shell logical icon keys to the concrete Aether icon names consumed by
 * shared shell components.
 * Out of scope: icon rendering, icon registry loading, and shell menu assembly.
 */
import type { AetherIconName } from '../models/ui/aetherIcon.model'
import type { HomeShellIconKey } from '../models/home-shell/homeShellMenu.model'

const HOME_SHELL_ICON_NAME_MAP: Record<HomeShellIconKey, AetherIconName> = {
  history: 'history',
  'shield-check': 'shield-check',
  wallet: 'wallet',
  'user-plus': 'user-plus',
  users: 'users',
  settings: 'settings',
  house: 'house',
  sparkles: 'sparkles',
  'user-round': 'user-round',
}

export const resolveHomeShellIconName = (iconKey: HomeShellIconKey): AetherIconName => {
  return HOME_SHELL_ICON_NAME_MAP[iconKey]
}
