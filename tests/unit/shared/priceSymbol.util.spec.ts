import { resolvePriceSymbol } from '@/utils/priceSymbol.util'

describe('priceSymbol util', () => {
  it('normalizes CNY aliases to the visible RMB price prefix', () => {
    expect(resolvePriceSymbol('CNY')).toBe('￥')
    expect(resolvePriceSymbol('RMB')).toBe('￥')
    expect(resolvePriceSymbol('元')).toBe('￥')
    expect(resolvePriceSymbol('¥')).toBe('￥')
    expect(resolvePriceSymbol('￥')).toBe('￥')
  })

  it('maps common foreign currency codes and preserves unknown values', () => {
    expect(resolvePriceSymbol('USD')).toBe('$')
    expect(resolvePriceSymbol('EUR')).toBe('€')
    expect(resolvePriceSymbol('ETH')).toBe('ETH')
  })
})
