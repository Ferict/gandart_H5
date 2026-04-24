/**
 * Responsibility: normalize currency codes and aliases into visible price prefixes.
 * Out of scope: formatting numeric prices, exchange rates, and sentence-level currency wording.
 */
const RMB_PRICE_CODES = new Set(['CNY', 'RMB'])
const RMB_PRICE_SYMBOL_ALIASES = new Set(['元', '¥', '￥'])

export const resolvePriceSymbol = (currency: string | null | undefined): string => {
  const raw = (currency ?? '').trim()
  const normalized = raw.toUpperCase()

  if (RMB_PRICE_CODES.has(normalized) || RMB_PRICE_SYMBOL_ALIASES.has(raw)) {
    return '￥'
  }

  if (normalized === 'USD') {
    return '$'
  }

  if (normalized === 'EUR') {
    return '€'
  }

  return raw
}
