import {
  createProfileAssetDetailRouteSignature,
  shouldApplyProfileAssetDetailRefreshResult,
} from '@/pages/profile-asset-detail/helpers/profileAssetDetailRefreshApplyGuard'

describe('profileAssetDetail refresh apply guard', () => {
  const requestRouteSignature = createProfileAssetDetailRouteSignature({
    itemId: 'C-10',
    category: 'collections',
  })

  it('rejects a stale request version', () => {
    expect(
      shouldApplyProfileAssetDetailRefreshResult({
        requestVersion: 1,
        latestRequestVersion: 2,
        requestRouteSignature,
        currentRouteSignature: requestRouteSignature,
        requestUserScope: '0xguard',
        currentUserScope: '0xguard',
        isPageActive: true,
      })
    ).toBe(false)
  })

  it('rejects a mismatched route signature', () => {
    expect(
      shouldApplyProfileAssetDetailRefreshResult({
        requestVersion: 3,
        latestRequestVersion: 3,
        requestRouteSignature,
        currentRouteSignature: createProfileAssetDetailRouteSignature({
          itemId: 'C-11',
          category: 'collections',
        }),
        requestUserScope: '0xguard',
        currentUserScope: '0xguard',
        isPageActive: true,
      })
    ).toBe(false)
  })

  it('rejects results when the page is inactive', () => {
    expect(
      shouldApplyProfileAssetDetailRefreshResult({
        requestVersion: 4,
        latestRequestVersion: 4,
        requestRouteSignature,
        currentRouteSignature: requestRouteSignature,
        requestUserScope: '0xguard',
        currentUserScope: '0xguard',
        isPageActive: false,
      })
    ).toBe(false)
  })

  it('rejects results when the current user scope changed', () => {
    expect(
      shouldApplyProfileAssetDetailRefreshResult({
        requestVersion: 5,
        latestRequestVersion: 5,
        requestRouteSignature,
        currentRouteSignature: requestRouteSignature,
        requestUserScope: '0xguard-old',
        currentUserScope: '0xguard-new',
        isPageActive: true,
      })
    ).toBe(false)
  })

  it('accepts only the latest active request for the current route', () => {
    expect(
      shouldApplyProfileAssetDetailRefreshResult({
        requestVersion: 6,
        latestRequestVersion: 6,
        requestRouteSignature,
        currentRouteSignature: requestRouteSignature,
        requestUserScope: '0xguard',
        currentUserScope: '0xguard',
        isPageActive: true,
      })
    ).toBe(true)
  })
})
