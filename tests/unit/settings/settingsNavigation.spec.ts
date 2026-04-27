import { describe, expect, it } from 'vitest'
import {
  buildHomeServiceEntryUrl,
  buildProfileSettingsUrl,
  buildSettingsUrl,
} from '../../../src/services/home-rail/homeRailNavigation.service'

describe('settings navigation', () => {
  it('routes the profile settings entry to the real settings page', () => {
    expect(buildProfileSettingsUrl()).toBe(
      '/pages/settings/index?source=profile-panel&section=account-security'
    )
  })

  it('routes drawer settings entries to the real settings page', () => {
    expect(buildHomeServiceEntryUrl('settings', 'drawer-menu')).toBe(
      '/pages/settings/index?source=drawer-menu&section=account-security'
    )
  })

  it('keeps explicit settings source and section params in the route', () => {
    expect(buildSettingsUrl('summary-card', 'display-notify')).toBe(
      '/pages/settings/index?source=summary-card&section=display-notify'
    )
  })
})
