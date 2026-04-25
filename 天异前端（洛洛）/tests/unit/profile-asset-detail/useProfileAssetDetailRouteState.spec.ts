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
    })

    expect(routeState.routeSource.value).toBe('profile')
    expect(routeState.resolveCurrentDetailRoute()).toEqual({
      itemId: 'C-10',
      category: 'certificates',
    })
    expect(routeState.currentDetailRouteSignature.value).toBe('C-10::certificates')
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
