import { describe, expect, it } from 'vitest'
import { parseUpdatingRouteQuery } from '../../../src/pages/updating/updatingRouteQuery'

describe('parseUpdatingRouteQuery', () => {
  it('preserves encoded plus signs while decoding route text', () => {
    const result = parseUpdatingRouteQuery({
      title: 'C%2B%2B',
      targetParams: 'language=C%2B%2B',
    })

    expect(result.title).toBe('C++')
    expect(result.targetParams).toBe('language=C++')
  })

  it('decodes double-encoded route text for h5 preview links', () => {
    const result = parseUpdatingRouteQuery({
      title: '%25E4%25BC%2598%25E5%2585%2588%25E6%258A%25BD%25E7%25AD%25BE',
    })

    expect(result.title).toBe('优先抽签')
  })
})
