/**
 * Responsibility: build the profile asset reveal-phase map for enter transitions,
 * including the special preserve-ready branch used during refresh replay.
 * Out of scope: scheduling, motion timing, and visual side effects.
 */
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type {
  ResultLoadSource,
  ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetRevealPhase } from './useProfileAssetVisualReveal'

interface BuildProfileAssetEnterRevealPhaseMapOptions {
  displayedAssets: ProfileAssetItem[]
  diff: ResultWindowDiff<ProfileAssetItem>
  source: ResultLoadSource
  preserveReadyRevealPhase: boolean
  resolveProfileAssetImageUrl: (item: ProfileAssetItem) => string
  resolveProfileAssetInitialRevealPhase: (
    item: ProfileAssetItem,
    preserveReadyRevealPhase: boolean
  ) => ProfileAssetRevealPhase
  buildNextProfileAssetRevealPhaseMap: (
    diff: ResultWindowDiff<ProfileAssetItem>,
    motionSource: ResultLoadSource
  ) => Record<string, ProfileAssetRevealPhase>
}

export const buildProfileAssetEnterRevealPhaseMap = ({
  displayedAssets,
  diff,
  source,
  preserveReadyRevealPhase,
  resolveProfileAssetImageUrl,
  resolveProfileAssetInitialRevealPhase,
  buildNextProfileAssetRevealPhaseMap,
}: BuildProfileAssetEnterRevealPhaseMapOptions) => {
  if (!preserveReadyRevealPhase) {
    return buildNextProfileAssetRevealPhaseMap(diff, source)
  }

  return displayedAssets.reduce<Record<string, ProfileAssetRevealPhase>>((result, item) => {
    const reuseMode = diff.addedIds.has(item.id)
      ? 'added'
      : diff.retainedImageChangedIds.has(item.id)
        ? 'retained-image-changed'
        : diff.retainedIds.has(item.id)
          ? 'retained'
          : null

    if (!resolveProfileAssetImageUrl(item)) {
      result[item.id] = 'fallback'
      return result
    }

    if (reuseMode === 'retained') {
      result[item.id] = resolveProfileAssetInitialRevealPhase(item, true)
      return result
    }

    result[item.id] = 'icon'
    return result
  }, {})
}
