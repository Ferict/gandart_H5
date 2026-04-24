/**
 * Responsibility: own pure projection helpers for the home market result window, including
 * visible-window construction, diff building, and next visible-count resolution.
 * Out of scope: result switching, mounted-window timing, and DOM side effects.
 */
import {
  buildResultWindow,
  buildResultWindowDiff,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'

export interface ResolveNextHomeMarketVisibleCountOptions {
  currentVisibleCount: number
  nextCollectionLength: number
  initialVisibleCount: number
  preserveVisibleCount?: boolean
}

export const isSameHomeMarketCollection = (left: HomeMarketCard[], right: HomeMarketCard[]) => {
  if (left.length !== right.length) {
    return false
  }

  return left.every((item, index) => item.id === right[index]?.id)
}

export const buildVisibleHomeMarketCollection = (
  sourceCollection: HomeMarketCard[],
  visibleCount: number
): HomeMarketCard[] => {
  return buildResultWindow(sourceCollection, visibleCount)
}

export const buildHomeMarketWindowDiff = ({
  displayedCollection,
  nextCollection,
  visibleCount,
}: {
  displayedCollection: HomeMarketCard[]
  nextCollection: HomeMarketCard[]
  visibleCount: number
}): ResultWindowDiff<HomeMarketCard> => {
  return buildResultWindowDiff(
    displayedCollection,
    buildVisibleHomeMarketCollection(nextCollection, visibleCount),
    (item) => item.imageUrl.trim()
  )
}

export const resolveNextHomeMarketVisibleCount = ({
  currentVisibleCount,
  nextCollectionLength,
  initialVisibleCount,
  preserveVisibleCount,
}: ResolveNextHomeMarketVisibleCountOptions) => {
  if (preserveVisibleCount) {
    return Math.min(currentVisibleCount, nextCollectionLength)
  }

  return Math.min(initialVisibleCount, nextCollectionLength)
}
