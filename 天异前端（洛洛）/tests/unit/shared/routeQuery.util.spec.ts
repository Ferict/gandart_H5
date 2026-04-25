import {
  buildRouteUrl,
  decodeRouteQueryValue,
  pickRouteQuery,
  stringifyRouteQuery,
} from '@/utils/routeQuery.util'

describe('routeQuery.util', () => {
  it('stringifyRouteQuery 会跳过空值并保留可用参数', () => {
    expect(
      stringifyRouteQuery({
        tab: 'profile',
        page: 2,
        keyword: '',
        draft: undefined,
        enabled: true,
      })
    ).toBe('tab=profile&page=2&enabled=true')
  })

  it('buildRouteUrl 会在有查询参数时追加问号', () => {
    expect(buildRouteUrl('/pages/home/index', { rail: 'activity', keyword: '合成 黎明' })).toBe(
      '/pages/home/index?rail=activity&keyword=%E5%90%88%E6%88%90%20%E9%BB%8E%E6%98%8E'
    )
  })

  it('decodeRouteQueryValue 会在解码失败时保留原值', () => {
    expect(decodeRouteQueryValue('%E5%90%88%E6%88%90')).toBe('合成')
    expect(decodeRouteQueryValue('%E0%A4%A', 'fallback')).toBe('%E0%A4%A')
    expect(decodeRouteQueryValue(undefined, 'fallback')).toBe('fallback')
  })

  it('pickRouteQuery 只提取白名单字段', () => {
    expect(
      pickRouteQuery(
        {
          rail: 'activity',
          tab: 'market',
          ignored: 'nope',
        },
        ['rail', 'tab'] as const
      )
    ).toEqual({
      rail: 'activity',
      tab: 'market',
    })
  })
})
