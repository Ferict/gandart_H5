import { useProfileAssetDetailRouteState } from '@/pages/profile-asset-detail/runtime/useProfileAssetDetailRouteState'

describe('useProfileAssetDetailRouteState', () => {
  it('starts from the default detail route and source', () => {
    const routeState = useProfileAssetDetailRouteState()

    expect(routeState.routeSource.value).toBe('profile-asset-detail')
    expect(routeState.resolveCurrentDetailRoute()).toEqual({
      itemId: 'C-02',
      category: 'collections',
    })
    expect(routeState.currentDetailRouteSignature.value).toBe('C-02::collections')
  })

  it('normalizes route query into item id, category, and signature', () => {
    const routeState = useProfileAssetDetailRouteState()

    routeState.updateRouteQuery({
      assetId: 'C-10',
      category: 'certificates',
      source: 'profile',
      holdingInstanceId: 'asset-genesis-zero::holding::1',
      holdingSerial: '#10291',
      holdingAcquiredAt: '2026.04.03 08:41:00',
    })

    expect(routeState.routeSource.value).toBe('profile')
    expect(routeState.resolveCurrentDetailRoute()).toEqual({
      itemId: 'C-10',
      category: 'collections',
    })
    expect(routeState.routeQuery.value.holdingInstanceId).toBe('asset-genesis-zero::holding::1')
    expect(routeState.routeQuery.value.holdingSerial).toBe('#10291')
    expect(routeState.routeQuery.value.holdingAcquiredAt).toBe('2026.04.03 08:41:00')
    expect(routeState.currentDetailRouteSignature.value).toBe('C-10::collections')
  })

  it('falls back to collections when the route category is unsupported', () => {
    const routeState = useProfileAssetDetailRouteState()

    routeState.updateRouteQuery({
      itemId: 'C-11',
      category: 'unknown-category',
    })

    expect(routeState.resolveCurrentDetailRoute()).toEqual({
      itemId: 'C-11',
      category: 'collections',
    })
  })
})
