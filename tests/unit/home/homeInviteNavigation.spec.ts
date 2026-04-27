import { describe, expect, it } from 'vitest'
import {
  buildContentResourceUrl,
  buildHomeServiceEntryUrl,
} from '../../../src/services/home-rail/homeRailNavigation.service'

describe('home invite navigation', () => {
  it('routes the invite service entry to the real invite page', () => {
    expect(buildHomeServiceEntryUrl('invite', 'profile-quick-action')).toBe(
      '/pages/invite/index?source=profile-quick-action&section=invite-overview'
    )
  })

  it('routes the activity invite entry to the real invite page', () => {
    expect(
      buildContentResourceUrl(
        {
          targetType: 'activity',
          targetId: 'network-invite',
          provider: 'content',
        },
        'activity-entry'
      )
    ).toBe('/pages/invite/index?source=activity-entry&section=invite-overview')
  })
})
