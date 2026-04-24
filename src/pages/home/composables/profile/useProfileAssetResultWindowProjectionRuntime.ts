/**
 * Responsibility: own profile asset result-window projection synchronization,
 * including bootstrap handoff, no-replay sync, immediate replacement, and
 * full projection reset.
 * Out of scope: switch gateway decisions, enter sequencing, and inactive reset cleanup.
 */
import type { ComputedRef, Ref } from 'vue'
import type {
  CardQueuePhase,
  ResultLoadSource,
  ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetRevealPhase } from './useProfileAssetVisualReveal'

type ProfileAssetResultMotionSource = ResultLoadSource

interface UseProfileAssetResultWindowProjectionRuntimeOptions {
  visibleAssets: ComputedRef<ProfileAssetItem[]>
  displayedAssets: Ref<ProfileAssetItem[]>
  pendingAssets: Ref<ProfileAssetItem[]>
  hasBootstrappedProfileAssets: Ref<boolean>
  profileAssetResultMotionSource: Ref<ProfileAssetResultMotionSource>
  profileAssetTransitionPhase: Ref<'idle' | 'entering'>
  queuedProfileAssetSwitch: Ref<ProfileAssetItem[] | null>
  pendingProfileAssetWindowDiff: Ref<ResultWindowDiff<ProfileAssetItem> | null>
  profileAssetPlaceholderIdSet: Ref<Set<string>>
  profileAssetEntryPhaseMap: Ref<Record<string, CardQueuePhase>>
  handledProfileAssetRefreshReplayRequestId: Ref<number>
  profileAssetRefreshReplayRequestId: Ref<number>
  cloneProfileAssetList: (list: ProfileAssetItem[]) => ProfileAssetItem[]
  buildProfileAssetStructureSignature: (list: ProfileAssetItem[]) => string
  buildProfileAssetWindowDiff: (
    nextAssets: ProfileAssetItem[]
  ) => ResultWindowDiff<ProfileAssetItem>
  startProfileAssetResultSwitch: (nextAssets: ProfileAssetItem[]) => Promise<void> | void
  syncMountedProfileAssetWindow: (items?: ProfileAssetItem[]) => void
  clearMountedProfileAssetWindow: () => void
  clearProfileAssetEnterMotionTimeout: () => void
  clearProfileAssetQueuedInsertTimeouts: () => void
  clearProfileAssetRemovedOverlayItems: () => void
  releaseProfileAssetResultsStageMinHeight: () => void
  syncProfileAssetEntryPhaseMap: (
    list?: ProfileAssetItem[],
    resolvePhase?: (item: ProfileAssetItem, currentPhase: CardQueuePhase) => CardQueuePhase
  ) => void
  visual: {
    buildNextProfileAssetRevealPhaseMap: (
      diff: ResultWindowDiff<ProfileAssetItem>,
      motionSource: ResultLoadSource
    ) => Record<string, ProfileAssetRevealPhase>
    setProfileAssetRevealPhaseMap: (phaseMap: Record<string, ProfileAssetRevealPhase>) => void
    syncProfileAssetVisualImages: (list?: ProfileAssetItem[]) => void
    syncProfileAssetRevealPhases: (list?: ProfileAssetItem[]) => void
    clearProfileAssetRevealTimeouts: (retainIds?: Set<string>) => void
  }
}

export const useProfileAssetResultWindowProjectionRuntime = (
  options: UseProfileAssetResultWindowProjectionRuntimeOptions
) => {
  const bootstrapProfileAssetList = (list: ProfileAssetItem[] = options.visibleAssets.value) => {
    options.hasBootstrappedProfileAssets.value = true
    options.handledProfileAssetRefreshReplayRequestId.value =
      options.profileAssetRefreshReplayRequestId.value
    void options.startProfileAssetResultSwitch(list)
  }

  const syncProfileAssetListsWithoutReplay = (nextAssets: ProfileAssetItem[]) => {
    const nextSnapshot = options.cloneProfileAssetList(nextAssets)
    const nextStructureSignature = options.buildProfileAssetStructureSignature(nextSnapshot)
    const displayedStructureSignature = options.buildProfileAssetStructureSignature(
      options.displayedAssets.value
    )
    const pendingStructureSignature = options.buildProfileAssetStructureSignature(
      options.pendingAssets.value
    )

    if (nextStructureSignature === displayedStructureSignature) {
      options.displayedAssets.value = nextSnapshot
      options.syncMountedProfileAssetWindow(options.displayedAssets.value)
      options.syncProfileAssetEntryPhaseMap(
        options.displayedAssets.value,
        (_, currentPhase) => currentPhase
      )
      options.visual.syncProfileAssetVisualImages()
      options.visual.syncProfileAssetRevealPhases()
    }

    if (nextStructureSignature === pendingStructureSignature) {
      options.pendingAssets.value = nextSnapshot
    }
  }

  const replaceProfileAssetListsImmediately = (nextAssets: ProfileAssetItem[]) => {
    const diff = options.buildProfileAssetWindowDiff(nextAssets)
    options.clearProfileAssetEnterMotionTimeout()
    options.clearProfileAssetQueuedInsertTimeouts()
    options.clearProfileAssetRemovedOverlayItems()
    options.queuedProfileAssetSwitch.value = null
    options.pendingProfileAssetWindowDiff.value = null
    options.profileAssetTransitionPhase.value = 'idle'
    options.displayedAssets.value = diff.nextWindow.slice()
    options.syncMountedProfileAssetWindow(diff.nextWindow)
    options.profileAssetPlaceholderIdSet.value = new Set()
    options.pendingAssets.value = diff.nextWindow.slice()
    options.syncProfileAssetEntryPhaseMap(options.displayedAssets.value, () => 'steady')
    options.visual.setProfileAssetRevealPhaseMap(
      options.visual.buildNextProfileAssetRevealPhaseMap(
        diff,
        options.profileAssetResultMotionSource.value
      )
    )
    options.visual.syncProfileAssetVisualImages()
    options.visual.syncProfileAssetRevealPhases()
    options.hasBootstrappedProfileAssets.value = true
    options.releaseProfileAssetResultsStageMinHeight()
  }

  const resetProfileAssetProjection = () => {
    options.clearProfileAssetEnterMotionTimeout()
    options.clearProfileAssetQueuedInsertTimeouts()
    options.clearProfileAssetRemovedOverlayItems()
    options.visual.clearProfileAssetRevealTimeouts()
    options.displayedAssets.value = []
    options.pendingAssets.value = []
    options.queuedProfileAssetSwitch.value = null
    options.pendingProfileAssetWindowDiff.value = null
    options.clearMountedProfileAssetWindow()
    options.profileAssetPlaceholderIdSet.value = new Set()
    options.profileAssetTransitionPhase.value = 'idle'
    options.profileAssetEntryPhaseMap.value = {}
    options.visual.setProfileAssetRevealPhaseMap({})
    options.hasBootstrappedProfileAssets.value = false
  }

  return {
    bootstrapProfileAssetList,
    syncProfileAssetListsWithoutReplay,
    replaceProfileAssetListsImmediately,
    resetProfileAssetProjection,
  }
}
