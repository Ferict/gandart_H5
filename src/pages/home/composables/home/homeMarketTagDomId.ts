// Responsibility: provide stable page-local DOM ids for the home market tag scroll rail.
// Out of scope: tag selection state, query scheduling, or cross-page DOM id policy.

const HOME_MARKET_TAG_ENTRY_ID_PREFIX = 'home-market-tag-entry-'

export const resolveHomeMarketTagEntryId = (tagId: string) => {
  const safeId = Array.from(tagId.trim())
    .map((char) => {
      if (/^[A-Za-z0-9_-]$/.test(char)) {
        return char
      }

      const codePoint = char.codePointAt(0)?.toString(16)
      return codePoint ? `u${codePoint}` : '-'
    })
    .join('')

  return `${HOME_MARKET_TAG_ENTRY_ID_PREFIX}${safeId || 'unknown'}`
}
