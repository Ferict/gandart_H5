import { describe, expect, it } from 'vitest'
import { buildHomeServiceEntryUrl } from '../../../src/services/home-rail/homeRailNavigation.service'

describe('home order navigation', () => {
  it('routes the order service entry to the real order page', () => {
    expect(buildHomeServiceEntryUrl('orders', 'profile-quick-action')).toBe(
      '/pages/order/index?source=profile-quick-action'
    )
  })

  it('keeps non-order service entries on the unified updating page', () => {
    expect(buildHomeServiceEntryUrl('wallet', 'profile-quick-action')).toContain(
      '/pages/updating/index?moduleId=UPD-SERVICE-WALLET'
    )
  })
})
