/**
 * Responsibility: assemble the profile asset result-window runtime from projection, enter, overlay, geometry, and switch sub-runtimes.
 * Out of scope: parent panel query ownership, scene patch wiring, and template-only result rendering.
 */
import { ref, type ComputedRef, type Ref } from 'vue'
import {
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
  type ResultWindowOverlayItem,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetRevealPhase } from './useProfileAssetVisualReveal'
import { useProfileAssetResultWindowEnterPhaseAssembly } from './useProfileAssetResultWindowEnterPhaseAssembly'
import { useProfileAssetResultWindowGeometryRuntime } from './useProfileAssetResultWindowGeometryRuntime'
import { useProfileAssetResultWindowEnterRuntime } from './useProfileAssetResultWindowEnterRuntime'
import { useProfileAssetResultWindowInactiveResetRuntime } from './useProfileAssetResultWindowInactiveResetRuntime'
import { useProfileAssetResultWindowOverlayRuntime } from './useProfileAssetResultWindowOverlayRuntime'
import { useProfileAssetResultWindowPresentationRuntime } from './useProfileAssetResultWindowPresentationRuntime'
import { useProfileAssetResultWindowProjectionRuntime } from './useProfileAssetResultWindowProjectionRuntime'
import { useProfileAssetResultWindowSwitchGateway } from './useProfileAssetResultWindowSwitchGateway'
import { syncResultEntryPhaseMap } from '../../../../utils/syncResultEntryPhaseMap.util'

export type { ProfileAssetResultWindowListPayload } from './useProfileAssetResultWindowSwitchGateway'

export type ProfileAssetResultMotionSource = ResultLoadSource
type ProfileAssetEntryPhase = CardQueuePhase

interface UseProfileAssetResultWindowLayoutOptions {
  columns: number
  fallbackCardWidth: number
  columnGap: number
  rowGap: number
  cardChromeHeight: number
  mountBufferTopRows: number
  mountBufferBottomRows: number
}

interface UseProfileAssetResultWindowMotionOptions {
  enterDurationMs: number
  leaveDurationMs: number
  staggerStepMs: number
}

interface UseProfileAssetResultWindowVisualOptions {
  profileAssetRevealPhaseMap: Ref<Record<string, ProfileAssetRevealPhase>>
  resolveProfileAssetImageUrl: (item: ProfileAssetItem) => string
  resolveProfileAssetInitialRevealPhase: (
    item: ProfileAssetItem,
    preserveReadyRevealPhase: boolean
  ) => ProfileAssetRevealPhase
  buildNextProfileAssetRevealPhaseMap: (
    diff: ResultWindowDiff<ProfileAssetItem>,
    motionSource: ResultLoadSource
  ) => Record<string, ProfileAssetRevealPhase>
  syncProfileAssetVisualImages: (list?: ProfileAssetItem[]) => void
  syncProfileAssetRevealPhases: (list?: ProfileAssetItem[]) => void
  clearProfileAssetRevealTimeouts: (retainIds?: Set<string>) => void
  setProfileAssetRevealPhaseMap: (phaseMap: Record<string, ProfileAssetRevealPhase>) => void
}

interface UseProfileAssetResultWindowOptions {
  isPanelActive: ComputedRef<boolean>
  hasResolvedInitialProfileContent: Ref<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  visibleAssets: ComputedRef<ProfileAssetItem[]>
  resolvedProfileAssetTotal: ComputedRef<number>
  isRemoteProfileAssetsLoading: Ref<boolean>
  mountedAssetsRef: Ref<ProfileAssetItem[]>
  placeholderIdSetRef: Ref<Set<string>>
  visual: UseProfileAssetResultWindowVisualOptions
  layout: UseProfileAssetResultWindowLayoutOptions
  motion: UseProfileAssetResultWindowMotionOptions
}

export const useProfileAssetResultWindow = ({
  isPanelActive,
  hasResolvedInitialProfileContent,
  mountScrollMetrics,
  visibleAssets,
  resolvedProfileAssetTotal,
  isRemoteProfileAssetsLoading,
  mountedAssetsRef,
  placeholderIdSetRef,
  visual,
  layout,
  motion,
}: UseProfileAssetResultWindowOptions) => {
  const displayedAssets = ref<ProfileAssetItem[]>([])
  const mountedAssets = mountedAssetsRef
  const mountedAssetIdSet = ref<Set<string>>(new Set())
  const profileAssetPlaceholderIdSet = placeholderIdSetRef
  const pendingAssets = ref<ProfileAssetItem[]>([])
  const profileAssetResultMotionSource = ref<ProfileAssetResultMotionSource>('initial-enter')
  const profileAssetTransitionPhase = ref<'idle' | 'entering'>('idle')
  const profileAssetEntryPhaseMap = ref<Record<string, ProfileAssetEntryPhase>>({})
  const pendingProfileAssetWindowDiff = ref<ResultWindowDiff<ProfileAssetItem> | null>(null)
  const profileAssetResultsStageRef = ref<HTMLElement | null>(null)
  const profileAssetResultsStageLockedMinHeight = ref(0)
  const profileAssetTopSpacerHeight = ref(0)
  const profileAssetBottomSpacerHeight = ref(0)
  const profileAssetRemovedOverlayItems = ref<ResultWindowOverlayItem<ProfileAssetItem>[]>([])
  const hasBootstrappedProfileAssets = ref(false)
  const profileAssetResultSwitchRunId = ref(0)

  let shouldPreserveReadyProfileAssetRevealOnNextEnter = false
  const shouldReleaseProfileAssetResultsStageHeightOnOverlayClear = ref(false)

  const syncProfileAssetEntryPhaseMap = (
    list: ProfileAssetItem[] = displayedAssets.value,
    resolvePhase?: (
      item: ProfileAssetItem,
      currentPhase: ProfileAssetEntryPhase
    ) => ProfileAssetEntryPhase
  ) => {
    profileAssetEntryPhaseMap.value = syncResultEntryPhaseMap(
      list,
      profileAssetEntryPhaseMap.value,
      resolvePhase
    )
  }

  const flushQueuedProfileAssetSwitch = () => {
    clearProfileAssetQueuedInsertTimeouts()
    const queuedAssets = queuedProfileAssetSwitch.value
    queuedProfileAssetSwitch.value = null
    if (queuedAssets) {
      void startProfileAssetResultSwitch(queuedAssets)
    }
  }

  const {
    visibleProfileAssetStructureSignature,
    visibleProfileAssetContentSignature,
    shouldShowProfileBottomEndline,
    cloneProfileAssetList,
    buildProfileAssetStructureSignature,
    buildProfileAssetContentSignature,
    buildProfileAssetWindowDiff,
    isProfileAssetPlaceholder,
    resolveProfileAssetEntryClass,
    resolveProfileAssetEntryStyle,
    resolveProfileAssetRemovedOverlayItemStyle,
  } = useProfileAssetResultWindowPresentationRuntime({
    visibleAssets,
    resolvedProfileAssetTotal,
    displayedAssets,
    mountedAssets,
    profileAssetPlaceholderIdSet,
    pendingProfileAssetWindowDiff,
    profileAssetEntryPhaseMap,
    profileAssetResultMotionSource,
    resolveProfileAssetImageUrl: visual.resolveProfileAssetImageUrl,
    staggerStepMs: motion.staggerStepMs,
    columns: layout.columns,
  })

  const {
    profileAssetResultsStageStyle,
    profileAssetRemovedOverlayLayerStyle,
    syncMountedProfileAssetWindow,
    clearMountedProfileAssetWindow,
    clearProfileAssetMountWindowSyncRaf,
    scheduleProfileAssetMountWindowSync,
    releaseProfileAssetResultsStageMinHeight,
    lockProfileAssetResultsStageMinHeight,
  } = useProfileAssetResultWindowGeometryRuntime({
    isPanelActive,
    mountScrollMetrics,
    displayedAssets,
    mountedAssets,
    mountedAssetIdSet,
    profileAssetPlaceholderIdSet,
    profileAssetResultsStageRef,
    profileAssetResultsStageLockedMinHeight,
    profileAssetTopSpacerHeight,
    profileAssetBottomSpacerHeight,
    profileAssetRemovedOverlayItems,
    layout,
    visual: {
      syncProfileAssetVisualImages: visual.syncProfileAssetVisualImages,
      syncProfileAssetRevealPhases: visual.syncProfileAssetRevealPhases,
    },
  })

  const { clearProfileAssetRemovedOverlayItems, syncProfileAssetRemovedOverlayItems } =
    useProfileAssetResultWindowOverlayRuntime({
      mountedAssetIdSet,
      profileAssetRemovedOverlayItems,
      shouldReleaseProfileAssetResultsStageHeightOnOverlayClear,
      leaveDurationMs: motion.leaveDurationMs,
      releaseProfileAssetResultsStageMinHeight,
    })

  let flushQueuedProfileAssetSwitchDelegate = () => {}

  const {
    resolveProfileAssetEnterMotionDurationMs,
    clearProfileAssetQueuedInsertTimeouts,
    clearProfileAssetEnterMotionTimeout,
    finalizeProfileAssetEnter,
    scheduleProfileAssetQueuedInsertions,
    scheduleProfileAssetRetainedReplayEnter,
    scheduleProfileAssetEnterMotionTimeout,
  } = useProfileAssetResultWindowEnterRuntime({
    displayedAssets,
    pendingAssets,
    mountedAssets,
    mountedAssetIdSet,
    profileAssetPlaceholderIdSet,
    profileAssetTransitionPhase,
    pendingProfileAssetWindowDiff,
    profileAssetResultSwitchRunId,
    motion: {
      enterDurationMs: motion.enterDurationMs,
      staggerStepMs: motion.staggerStepMs,
    },
    syncProfileAssetEntryPhaseMap,
    visual: {
      buildNextProfileAssetRevealPhaseMap: visual.buildNextProfileAssetRevealPhaseMap,
      setProfileAssetRevealPhaseMap: visual.setProfileAssetRevealPhaseMap,
      syncProfileAssetVisualImages: visual.syncProfileAssetVisualImages,
      syncProfileAssetRevealPhases: visual.syncProfileAssetRevealPhases,
    },
    releaseProfileAssetResultsStageMinHeight,
    flushQueuedProfileAssetSwitch: () => {
      flushQueuedProfileAssetSwitchDelegate()
    },
  })

  const { startProfileAssetEnterPhase } = useProfileAssetResultWindowEnterPhaseAssembly({
    pendingAssets,
    displayedAssets,
    mountedAssetIdSet,
    profileAssetPlaceholderIdSet,
    pendingProfileAssetWindowDiff,
    profileAssetResultSwitchRunId,
    profileAssetResultMotionSource,
    profileAssetTransitionPhase,
    buildProfileAssetWindowDiff,
    clearProfileAssetEnterMotionTimeout,
    clearProfileAssetQueuedInsertTimeouts,
    syncProfileAssetRemovedOverlayItems,
    syncMountedProfileAssetWindow,
    syncProfileAssetEntryPhaseMap,
    consumePreserveReadyRevealPhase: () => {
      const preserveReadyRevealPhase = shouldPreserveReadyProfileAssetRevealOnNextEnter
      shouldPreserveReadyProfileAssetRevealOnNextEnter = false
      return preserveReadyRevealPhase
    },
    visual: {
      resolveProfileAssetImageUrl: visual.resolveProfileAssetImageUrl,
      resolveProfileAssetInitialRevealPhase: visual.resolveProfileAssetInitialRevealPhase,
      buildNextProfileAssetRevealPhaseMap: visual.buildNextProfileAssetRevealPhaseMap,
      setProfileAssetRevealPhaseMap: visual.setProfileAssetRevealPhaseMap,
      syncProfileAssetVisualImages: visual.syncProfileAssetVisualImages,
      syncProfileAssetRevealPhases: visual.syncProfileAssetRevealPhases,
    },
    scheduleProfileAssetQueuedInsertions,
    flushQueuedProfileAssetSwitch,
    scheduleProfileAssetRetainedReplayEnter,
    finalizeProfileAssetEnter,
    scheduleProfileAssetEnterMotionTimeout,
    resolveProfileAssetEnterMotionDurationMs,
  })

  const startProfileAssetResultSwitch = async (nextAssets: ProfileAssetItem[]) => {
    profileAssetResultSwitchRunId.value += 1
    clearProfileAssetEnterMotionTimeout()
    clearProfileAssetQueuedInsertTimeouts()
    queuedProfileAssetSwitch.value = null
    pendingAssets.value = cloneProfileAssetList(nextAssets)
    const diff = buildProfileAssetWindowDiff(nextAssets)
    pendingProfileAssetWindowDiff.value = diff

    if (!isPanelActive.value) {
      profileAssetTransitionPhase.value = 'idle'
      return
    }

    if (!displayedAssets.value.length) {
      startProfileAssetEnterPhase(diff)
      return
    }

    if (diff.removed.length || diff.added.length) {
      lockProfileAssetResultsStageMinHeight(
        Math.max(displayedAssets.value.length, diff.nextWindow.length)
      )
    }

    startProfileAssetEnterPhase(diff)
  }

  let bootstrapProfileAssetListDelegate = (list: ProfileAssetItem[] = visibleAssets.value) => {
    void list
  }
  let syncProfileAssetListsWithoutReplayDelegate = (nextAssets: ProfileAssetItem[]) => {
    void nextAssets
  }
  let replaceProfileAssetListsImmediatelyDelegate = (nextAssets: ProfileAssetItem[]) => {
    void nextAssets
  }

  const {
    queuedProfileAssetSwitch,
    profileAssetRefreshReplayRequestId,
    handledProfileAssetRefreshReplayRequestId,
    requestProfileAssetRefreshReplay,
    reconcileProfileAssetRender,
    applyResolvedProfileAssetList,
    isProfileRefreshPresentationSettled,
  } = useProfileAssetResultWindowSwitchGateway({
    hasResolvedInitialProfileContent,
    visibleAssets,
    displayedAssets,
    pendingAssets,
    hasBootstrappedProfileAssets,
    profileAssetResultMotionSource,
    profileAssetTransitionPhase,
    pendingProfileAssetWindowDiff,
    isRemoteProfileAssetsLoading,
    cloneProfileAssetList,
    buildProfileAssetStructureSignature,
    buildProfileAssetContentSignature,
    bootstrapProfileAssetList: (list) => {
      bootstrapProfileAssetListDelegate(list)
    },
    replaceProfileAssetListsImmediately: (nextAssets) => {
      replaceProfileAssetListsImmediatelyDelegate(nextAssets)
    },
    syncProfileAssetListsWithoutReplay: (nextAssets) => {
      syncProfileAssetListsWithoutReplayDelegate(nextAssets)
    },
    startProfileAssetResultSwitch,
    resetPreserveReadyProfileAssetRevealOnNextEnter: () => {
      shouldPreserveReadyProfileAssetRevealOnNextEnter = false
    },
  })

  const {
    bootstrapProfileAssetList,
    syncProfileAssetListsWithoutReplay,
    replaceProfileAssetListsImmediately,
    resetProfileAssetProjection,
  } = useProfileAssetResultWindowProjectionRuntime({
    visibleAssets,
    displayedAssets,
    pendingAssets,
    hasBootstrappedProfileAssets,
    profileAssetResultMotionSource,
    profileAssetTransitionPhase,
    queuedProfileAssetSwitch,
    pendingProfileAssetWindowDiff,
    profileAssetPlaceholderIdSet,
    profileAssetEntryPhaseMap,
    handledProfileAssetRefreshReplayRequestId,
    profileAssetRefreshReplayRequestId,
    cloneProfileAssetList,
    buildProfileAssetStructureSignature,
    buildProfileAssetWindowDiff,
    startProfileAssetResultSwitch,
    syncMountedProfileAssetWindow,
    clearMountedProfileAssetWindow,
    clearProfileAssetEnterMotionTimeout,
    clearProfileAssetQueuedInsertTimeouts,
    clearProfileAssetRemovedOverlayItems,
    releaseProfileAssetResultsStageMinHeight,
    syncProfileAssetEntryPhaseMap,
    visual: {
      buildNextProfileAssetRevealPhaseMap: visual.buildNextProfileAssetRevealPhaseMap,
      setProfileAssetRevealPhaseMap: visual.setProfileAssetRevealPhaseMap,
      syncProfileAssetVisualImages: visual.syncProfileAssetVisualImages,
      syncProfileAssetRevealPhases: visual.syncProfileAssetRevealPhases,
      clearProfileAssetRevealTimeouts: visual.clearProfileAssetRevealTimeouts,
    },
  })

  bootstrapProfileAssetListDelegate = bootstrapProfileAssetList
  syncProfileAssetListsWithoutReplayDelegate = syncProfileAssetListsWithoutReplay
  replaceProfileAssetListsImmediatelyDelegate = replaceProfileAssetListsImmediately

  flushQueuedProfileAssetSwitchDelegate = () => {
    flushQueuedProfileAssetSwitch()
  }

  const { resetProfileResultWindowForInactive, disposeProfileAssetResultWindow } =
    useProfileAssetResultWindowInactiveResetRuntime({
      queuedProfileAssetSwitch,
      pendingProfileAssetWindowDiff,
      profileAssetPlaceholderIdSet,
      profileAssetTransitionPhase,
      handledProfileAssetRefreshReplayRequestId,
      profileAssetRefreshReplayRequestId,
      profileAssetRevealPhaseMap: visual.profileAssetRevealPhaseMap,
      clearProfileAssetMountWindowSyncRaf,
      releaseProfileAssetResultsStageMinHeight,
      clearProfileAssetEnterMotionTimeout,
      clearProfileAssetQueuedInsertTimeouts,
      clearProfileAssetRemovedOverlayItems,
      clearMountedProfileAssetWindow,
      clearProfileAssetRevealTimeouts: visual.clearProfileAssetRevealTimeouts,
      setProfileAssetRevealPhaseMap: visual.setProfileAssetRevealPhaseMap,
    })

  return {
    displayedAssets,
    mountedAssets,
    pendingAssets,
    profileAssetResultMotionSource,
    profileAssetTransitionPhase,
    profileAssetRefreshReplayRequestId,
    profileAssetResultsStageRef,
    profileAssetTopSpacerHeight,
    profileAssetBottomSpacerHeight,
    profileAssetRemovedOverlayItems,
    profileAssetResultsStageStyle,
    profileAssetRemovedOverlayLayerStyle,
    visibleAssets,
    resolvedProfileAssetTotal,
    visibleProfileAssetStructureSignature,
    visibleProfileAssetContentSignature,
    shouldShowProfileBottomEndline,
    isProfileAssetPlaceholder,
    resolveProfileAssetEntryClass,
    resolveProfileAssetEntryStyle,
    resolveProfileAssetRemovedOverlayItemStyle,
    syncMountedProfileAssetWindow,
    clearProfileAssetMountWindowSyncRaf,
    scheduleProfileAssetMountWindowSync,
    requestProfileAssetRefreshReplay,
    applyResolvedProfileAssetList,
    startProfileAssetResultSwitch,
    reconcileProfileAssetRender,
    isProfileRefreshPresentationSettled,
    resetProfileAssetProjection,
    resetProfileResultWindowForInactive,
    disposeProfileAssetResultWindow,
  }
}
