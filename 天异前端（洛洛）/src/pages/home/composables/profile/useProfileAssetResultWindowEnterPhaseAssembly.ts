/**
 * Responsibility: own the profile asset result-window enter-phase assembly,
 * including mounted-window sync, placeholder projection, overlay handoff,
 * reveal-phase projection, and enter scheduling.
 * Out of scope: diff construction, switch gateway bookkeeping, and enter-runtime internals.
 */
import {
  buildResultWindowQueueIdSet,
  buildResultWindowStableSlotIdSet,
  resolveResultWindowEnterQueueItems,
  shouldReplayRetainedForResultSource,
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetRevealPhase } from './useProfileAssetVisualReveal'
import { buildProfileAssetEnterRevealPhaseMap } from './buildProfileAssetEnterRevealPhaseMap'

type ProfileAssetResultMotionSource = ResultLoadSource
type ProfileAssetEntryPhase = CardQueuePhase

interface UseProfileAssetResultWindowEnterPhaseAssemblyVisualOptions {
  resolveProfileAssetImageUrl: (item: ProfileAssetItem) => string
  resolveProfileAssetInitialRevealPhase: (
    item: ProfileAssetItem,
    preserveReadyRevealPhase: boolean
  ) => ProfileAssetRevealPhase
  buildNextProfileAssetRevealPhaseMap: (
    diff: ResultWindowDiff<ProfileAssetItem>,
    motionSource: ResultLoadSource
  ) => Record<string, ProfileAssetRevealPhase>
  setProfileAssetRevealPhaseMap: (phaseMap: Record<string, ProfileAssetRevealPhase>) => void
  syncProfileAssetVisualImages: (list?: ProfileAssetItem[]) => void
  syncProfileAssetRevealPhases: (list?: ProfileAssetItem[]) => void
}

interface UseProfileAssetResultWindowEnterPhaseAssemblyOptions {
  pendingAssets: { value: ProfileAssetItem[] }
  displayedAssets: { value: ProfileAssetItem[] }
  mountedAssetIdSet: { value: Set<string> }
  profileAssetPlaceholderIdSet: { value: Set<string> }
  pendingProfileAssetWindowDiff: { value: ResultWindowDiff<ProfileAssetItem> | null }
  profileAssetResultSwitchRunId: { value: number }
  profileAssetResultMotionSource: { value: ProfileAssetResultMotionSource }
  profileAssetTransitionPhase: { value: 'idle' | 'entering' }
  buildProfileAssetWindowDiff: (
    nextAssets: ProfileAssetItem[]
  ) => ResultWindowDiff<ProfileAssetItem>
  clearProfileAssetEnterMotionTimeout: () => void
  clearProfileAssetQueuedInsertTimeouts: () => void
  syncProfileAssetRemovedOverlayItems: (
    diff: ResultWindowDiff<ProfileAssetItem>,
    options?: { releaseStageHeightAfterClear?: boolean; mountedIds?: Set<string> }
  ) => void
  syncMountedProfileAssetWindow: (items?: ProfileAssetItem[]) => void
  syncProfileAssetEntryPhaseMap: (
    list?: ProfileAssetItem[],
    resolvePhase?: (
      item: ProfileAssetItem,
      currentPhase: ProfileAssetEntryPhase
    ) => ProfileAssetEntryPhase
  ) => void
  consumePreserveReadyRevealPhase: () => boolean
  visual: UseProfileAssetResultWindowEnterPhaseAssemblyVisualOptions
  scheduleProfileAssetQueuedInsertions: (
    diff: ResultWindowDiff<ProfileAssetItem>,
    runId: number,
    source: ProfileAssetResultMotionSource
  ) => void
  flushQueuedProfileAssetSwitch: () => void
  scheduleProfileAssetRetainedReplayEnter: (
    diff: ResultWindowDiff<ProfileAssetItem>,
    runId: number,
    source: ProfileAssetResultMotionSource
  ) => Promise<void> | void
  finalizeProfileAssetEnter: () => void
  scheduleProfileAssetEnterMotionTimeout: (callback: () => void, durationMs: number) => void
  resolveProfileAssetEnterMotionDurationMs: (list?: ProfileAssetItem[]) => number
}

export const useProfileAssetResultWindowEnterPhaseAssembly = (
  options: UseProfileAssetResultWindowEnterPhaseAssemblyOptions
) => {
  const startProfileAssetEnterPhase = (
    diff: ResultWindowDiff<ProfileAssetItem> = options.pendingProfileAssetWindowDiff.value ??
      options.buildProfileAssetWindowDiff(options.pendingAssets.value)
  ) => {
    const runId = options.profileAssetResultSwitchRunId.value + 1
    options.profileAssetResultSwitchRunId.value = runId
    const previousMountedIds = new Set(options.mountedAssetIdSet.value)
    options.clearProfileAssetEnterMotionTimeout()
    options.clearProfileAssetQueuedInsertTimeouts()
    options.syncProfileAssetRemovedOverlayItems(diff, {
      mountedIds: previousMountedIds,
    })
    options.displayedAssets.value = diff.nextWindow.slice()
    options.syncMountedProfileAssetWindow(diff.nextWindow)
    options.profileAssetPlaceholderIdSet.value = new Set(
      Array.from(buildResultWindowStableSlotIdSet(diff)).filter((itemId) =>
        options.mountedAssetIdSet.value.has(itemId)
      )
    )
    options.pendingAssets.value = diff.nextWindow.slice()
    const source = options.profileAssetResultMotionSource.value
    const queueIds = buildResultWindowQueueIdSet(diff, source, options.mountedAssetIdSet.value)
    options.syncProfileAssetEntryPhaseMap(options.displayedAssets.value, (item) => {
      if (diff.addedIds.has(item.id)) {
        return 'steady'
      }

      if (queueIds.has(item.id)) {
        return shouldReplayRetainedForResultSource(source) ? 'replay-prep' : 'entering'
      }

      return 'steady'
    })
    options.visual.setProfileAssetRevealPhaseMap(
      buildProfileAssetEnterRevealPhaseMap({
        displayedAssets: options.displayedAssets.value,
        diff,
        source,
        preserveReadyRevealPhase: options.consumePreserveReadyRevealPhase(),
        resolveProfileAssetImageUrl: options.visual.resolveProfileAssetImageUrl,
        resolveProfileAssetInitialRevealPhase: options.visual.resolveProfileAssetInitialRevealPhase,
        buildNextProfileAssetRevealPhaseMap: options.visual.buildNextProfileAssetRevealPhaseMap,
      })
    )
    options.visual.syncProfileAssetVisualImages()
    options.visual.syncProfileAssetRevealPhases()
    options.scheduleProfileAssetQueuedInsertions(diff, runId, source)

    if (!diff.nextWindow.length) {
      options.profileAssetTransitionPhase.value = 'idle'
      options.pendingProfileAssetWindowDiff.value = null
      options.profileAssetPlaceholderIdSet.value = new Set()
      options.syncProfileAssetRemovedOverlayItems(diff, {
        releaseStageHeightAfterClear: true,
        mountedIds: previousMountedIds,
      })
      options.flushQueuedProfileAssetSwitch()
      return
    }

    options.profileAssetTransitionPhase.value = 'entering'
    void options.scheduleProfileAssetRetainedReplayEnter(diff, runId, source)
    const enterQueueItems = resolveResultWindowEnterQueueItems(
      diff,
      source,
      options.mountedAssetIdSet.value
    )
    if (!enterQueueItems.length) {
      options.finalizeProfileAssetEnter()
      return
    }

    options.scheduleProfileAssetEnterMotionTimeout(
      options.finalizeProfileAssetEnter,
      options.resolveProfileAssetEnterMotionDurationMs(enterQueueItems)
    )
  }

  return {
    startProfileAssetEnterPhase,
  }
}
