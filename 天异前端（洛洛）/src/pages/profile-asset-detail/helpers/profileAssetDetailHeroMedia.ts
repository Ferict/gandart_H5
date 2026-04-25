/**
 * Responsibility: provide pure helpers for profile asset detail hero media, including normalized
 * image-url resolution and load-event ratio extraction.
 * Out of scope: hero media state ownership, image cache policy, and detail-page presentation.
 */
export const resolveProfileAssetDetailHeroImageUrl = (value: string): string => {
  return value.trim()
}

export const resolveProfileAssetDetailHeroImageRatio = (event: unknown): number | null => {
  const wrappedEvent = (event as { event?: unknown } | null)?.event
  const sourceEvent = wrappedEvent ?? event
  const detail = (sourceEvent as { detail?: { width?: number; height?: number } } | null)?.detail
  const width = typeof detail?.width === 'number' ? detail.width : 0
  const height = typeof detail?.height === 'number' ? detail.height : 0

  if (width <= 0 || height <= 0) {
    return null
  }

  return width / height
}
