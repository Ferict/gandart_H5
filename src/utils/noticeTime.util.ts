/**
 * Responsibility: format notice publish timestamps into the compact display string used by the
 * home notice bar and related notice cards.
 * Out of scope: timezone conversion, locale translation, and notice sorting policy.
 */
export const formatNoticeDisplayTime = (publishedAt: string): string => {
  const normalizedPublishedAt = publishedAt.trim()
  const matched = normalizedPublishedAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)

  if (matched) {
    return `${matched[2]}-${matched[3]} ${matched[4]}:${matched[5]}`
  }

  return normalizedPublishedAt
}
