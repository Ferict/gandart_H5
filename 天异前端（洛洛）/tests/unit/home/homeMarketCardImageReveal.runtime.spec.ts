import { describe, expect, it } from 'vitest'
import {
  resolveHomeMarketCardImageEventRequestStamp,
  resolveHomeMarketCardRemoteImageSrc,
} from '@/components/homeMarketCardImageReveal.runtime'

describe('homeMarketCardImageReveal runtime helpers', () => {
  it('appends retry nonce before hash and after an existing query string', () => {
    expect(
      resolveHomeMarketCardRemoteImageSrc('https://cdn.example.com/card.png?size=sm#hero', 2)
    ).toBe('https://cdn.example.com/card.png?size=sm&aether_retry=2#hero')
  })

  it('keeps original url when retry nonce is not positive', () => {
    expect(resolveHomeMarketCardRemoteImageSrc('https://cdn.example.com/card.png', 0)).toBe(
      'https://cdn.example.com/card.png'
    )
  })

  it('reads request stamp from currentTarget dataset first', () => {
    expect(
      resolveHomeMarketCardImageEventRequestStamp({
        currentTarget: {
          dataset: {
            requestStamp: '42',
          },
        },
        target: {
          dataset: {
            requestStamp: '12',
          },
        },
      })
    ).toBe(42)
  })

  it('returns null when event has no finite request stamp', () => {
    expect(resolveHomeMarketCardImageEventRequestStamp({})).toBeNull()
    expect(
      resolveHomeMarketCardImageEventRequestStamp({
        target: {
          dataset: {
            requestStamp: 'nope',
          },
        },
      })
    ).toBeNull()
  })
})
