/**
 * Responsibility: provide presentation-facing projection helpers for the profile asset
 * result window, including signatures, endline state, entry styles, and overlay positioning.
 * Out of scope: result-window timing transitions, remote-list loading, and profile page
 * query or scene orchestration.
 */
import { computed, type CSSProperties, type ComputedRef, type Ref } from 'vue'
import {
  buildResultWindowDiff,
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import {
  buildResultEntryClass,
  buildResultEntryDelayStyle,
  buildResultGridRemovedOverlayItemStyle,
  buildResultStructureSignatureById,
} from '../../../../utils/resultWindowPresentation.util'

type ProfileAssetEntryPhase = CardQueuePhase
type ProfileAssetResultMotionSource = ResultLoadSource

interface UseProfileAssetResultWindowPresentationRuntimeOptions {
  visibleAssets: ComputedRef<ProfileAssetItem[]>
  resolvedProfileAssetTotal: ComputedRef<number>
  displayedAssets: Ref<ProfileAssetItem[]>
  mountedAssets: Ref<ProfileAssetItem[]>
  profileAssetPlaceholderIdSet: Ref<Set<string>>
  pendingProfileAssetWindowDiff: Ref<ResultWindowDiff<ProfileAssetItem> | null>
  profileAssetEntryPhaseMap: Ref<Record<string, ProfileAssetEntryPhase>>
  profileAssetResultMotionSource: Ref<ProfileAssetResultMotionSource>
  resolveProfileAssetImageUrl: (item: ProfileAssetItem) => string
  staggerStepMs: number
  columns: number
}

export const useProfileAssetResultWindowPresentationRuntime = (
  options: UseProfileAssetResultWindowPresentationRuntimeOptions
) => {
  const visibleProfileAssetStructureSignature = computed(() => {
    return buildProfileAssetStructureSignature(options.visibleAssets.value)
  })

  const visibleProfileAssetContentSignature = computed(() => {
    return buildProfileAssetContentSignature(
      options.visibleAssets.value,
      options.resolveProfileAssetImageUrl
    )
  })

  const shouldShowProfileBottomEndline = computed(() => {
    return (
      options.resolvedProfileAssetTotal.value <= options.visibleAssets.value.length &&
      options.displayedAssets.value.length > 0
    )
  })

  const buildProfileAssetWindowDiff = (nextAssets: ProfileAssetItem[]) => {
    return buildResultWindowDiff(
      options.displayedAssets.value,
      cloneProfileAssetList(nextAssets),
      options.resolveProfileAssetImageUrl
    )
  }

  const isProfileAssetPlaceholder = (itemId: string) => {
    return options.profileAssetPlaceholderIdSet.value.has(itemId)
  }

  const resolveProfileAssetEntryPhase = (itemId: string): ProfileAssetEntryPhase => {
    return options.profileAssetEntryPhaseMap.value[itemId] ?? 'steady'
  }

  const resolveProfileAssetEntryClass = (itemId: string) => {
    const entryPhase = resolveProfileAssetEntryPhase(itemId)
    return buildResultEntryClass({
      entryPhase,
      motionSource: options.profileAssetResultMotionSource.value,
      isLightMotion: true,
    })
  }

  const resolveProfileAssetEntryStyle = (itemId: string, index: number): CSSProperties => {
    const staggerDelayMs = resolveProfileAssetStaggerDelayMs({
      itemId,
      index,
      mountedAssets: options.mountedAssets.value,
      pendingProfileAssetWindowDiff: options.pendingProfileAssetWindowDiff.value,
      resolveProfileAssetEntryPhase,
      staggerStepMs: options.staggerStepMs,
    })

    return buildResultEntryDelayStyle('--home-profile-asset-entry-delay', staggerDelayMs)
  }

  const resolveProfileAssetRemovedOverlayItemStyle = (sourceIndex: number): CSSProperties => {
    return buildResultGridRemovedOverlayItemStyle(sourceIndex, options.columns)
  }

  return {
    visibleProfileAssetStructureSignature,
    visibleProfileAssetContentSignature,
    shouldShowProfileBottomEndline,
    cloneProfileAssetList,
    buildProfileAssetStructureSignature: (list: ProfileAssetItem[]) =>
      buildProfileAssetStructureSignature(list),
    buildProfileAssetContentSignature: (list: ProfileAssetItem[]) =>
      buildProfileAssetContentSignature(list, options.resolveProfileAssetImageUrl),
    buildProfileAssetWindowDiff,
    isProfileAssetPlaceholder,
    resolveProfileAssetEntryClass,
    resolveProfileAssetEntryStyle,
    resolveProfileAssetRemovedOverlayItemStyle,
  }
}

export const cloneProfileAssetList = (list: ProfileAssetItem[]) => list.slice()

export const buildProfileAssetStructureSignature = (list: ProfileAssetItem[]) => {
  return buildResultStructureSignatureById(list)
}

export const buildProfileAssetContentSignature = (
  list: ProfileAssetItem[],
  resolveProfileAssetImageUrl: (item: ProfileAssetItem) => string
) => {
  return list
    .map(
      (item) =>
        `${item.id}::${item.name}::${item.holdingsCount}::${item.priceUnit}::${item.price}::${resolveProfileAssetImageUrl(item)}`
    )
    .join('|')
}

const resolveProfileAssetStaggerDelayMs = ({
  itemId,
  index,
  mountedAssets,
  pendingProfileAssetWindowDiff,
  resolveProfileAssetEntryPhase,
  staggerStepMs,
}: {
  itemId: string
  index: number
  mountedAssets: ProfileAssetItem[]
  pendingProfileAssetWindowDiff: ResultWindowDiff<ProfileAssetItem> | null
  resolveProfileAssetEntryPhase: (itemId: string) => ProfileAssetEntryPhase
  staggerStepMs: number
}) => {
  const entryPhase = resolveProfileAssetEntryPhase(itemId)
  if (entryPhase !== 'entering' && entryPhase !== 'replay-entering') {
    return 0
  }

  if (pendingProfileAssetWindowDiff?.addedIds.has(itemId)) {
    return 0
  }

  const entryIndex = index >= 0 ? index : mountedAssets.findIndex((item) => item.id === itemId)
  return entryIndex >= 0 ? entryIndex * staggerStepMs : 0
}
