/**
 * Responsibility: encapsulate profile asset result-window enter-phase runtime,
 * including queued insertion scheduling, retained replay scheduling, and finalize cleanup.
 * Out of scope: diff calculation, switch gateway entry, and removed overlay lifecycle.
 */
import { nextTick, type Ref } from 'vue'
import {
  shouldReplayRetainedForResultSource,
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetRevealPhase } from './useProfileAssetVisualReveal'

type ProfileAssetResultMotionSource = ResultLoadSource
type ProfileAssetEntryPhase = CardQueuePhase

interface UseProfileAssetResultWindowEnterRuntimeMotionOptions {
  enterDurationMs: number
  staggerStepMs: number
}

interface UseProfileAssetResultWindowEnterRuntimeVisualOptions {
  buildNextProfileAssetRevealPhaseMap: (
    diff: ResultWindowDiff<ProfileAssetItem>,
    motionSource: ResultLoadSource
  ) => Record<string, ProfileAssetRevealPhase>
  setProfileAssetRevealPhaseMap: (phaseMap: Record<string, ProfileAssetRevealPhase>) => void
  syncProfileAssetVisualImages: (list?: ProfileAssetItem[]) => void
  syncProfileAssetRevealPhases: (list?: ProfileAssetItem[]) => void
}

interface UseProfileAssetResultWindowEnterRuntimeOptions {
  displayedAssets: Ref<ProfileAssetItem[]>
  pendingAssets: Ref<ProfileAssetItem[]>
  mountedAssets: Ref<ProfileAssetItem[]>
  mountedAssetIdSet: Ref<Set<string>>
  profileAssetPlaceholderIdSet: Ref<Set<string>>
  profileAssetTransitionPhase: Ref<'idle' | 'entering'>
  pendingProfileAssetWindowDiff: Ref<ResultWindowDiff<ProfileAssetItem> | null>
  profileAssetResultSwitchRunId: Ref<number>
  motion: UseProfileAssetResultWindowEnterRuntimeMotionOptions
  syncProfileAssetEntryPhaseMap: (
    list?: ProfileAssetItem[],
    resolvePhase?: (
      item: ProfileAssetItem,
      currentPhase: ProfileAssetEntryPhase
    ) => ProfileAssetEntryPhase
  ) => void
  visual: UseProfileAssetResultWindowEnterRuntimeVisualOptions
  releaseProfileAssetResultsStageMinHeight: () => void
  flushQueuedProfileAssetSwitch: () => void
}

export const useProfileAssetResultWindowEnterRuntime = (
  options: UseProfileAssetResultWindowEnterRuntimeOptions
) => {
  let profileAssetEnterMotionTimeout: ReturnType<typeof setTimeout> | null = null
  let profileAssetQueuedInsertTimeoutIds: ReturnType<typeof setTimeout>[] = []

  const resolveProfileAssetEnterMotionDurationMs = (
    list: ProfileAssetItem[] = options.displayedAssets.value
  ) => {
    if (!list.length) {
      return options.motion.enterDurationMs
    }

    return options.motion.enterDurationMs + (list.length - 1) * options.motion.staggerStepMs
  }

  const clearProfileAssetQueuedInsertTimeouts = () => {
    profileAssetQueuedInsertTimeoutIds.forEach((timeoutId) => {
      clearTimeout(timeoutId)
    })
    profileAssetQueuedInsertTimeoutIds = []
  }

  const clearProfileAssetEnterMotionTimeout = () => {
    if (!profileAssetEnterMotionTimeout) {
      return
    }

    clearTimeout(profileAssetEnterMotionTimeout)
    profileAssetEnterMotionTimeout = null
  }

  const finalizeProfileAssetEnter = () => {
    clearProfileAssetEnterMotionTimeout()
    clearProfileAssetQueuedInsertTimeouts()
    options.profileAssetPlaceholderIdSet.value = new Set()
    options.syncProfileAssetEntryPhaseMap(options.displayedAssets.value, (_, currentPhase) => {
      return currentPhase === 'entering' ||
        currentPhase === 'replay-prep' ||
        currentPhase === 'replay-entering'
        ? 'steady'
        : currentPhase
    })
    options.profileAssetTransitionPhase.value = 'idle'
    options.pendingProfileAssetWindowDiff.value = null
    options.releaseProfileAssetResultsStageMinHeight()
    options.flushQueuedProfileAssetSwitch()
  }

  const scheduleProfileAssetQueuedInsertions = (
    diff: ResultWindowDiff<ProfileAssetItem>,
    runId: number,
    source: ProfileAssetResultMotionSource
  ) => {
    const mountedAddedItems = diff.added.filter((item) =>
      options.mountedAssetIdSet.value.has(item.id)
    )
    if (!mountedAddedItems.length) {
      return
    }

    mountedAddedItems.forEach((queuedAsset, queueIndex) => {
      const timeoutId = setTimeout(() => {
        if (options.profileAssetResultSwitchRunId.value !== runId) {
          return
        }

        const nextPlaceholderIds = new Set(options.profileAssetPlaceholderIdSet.value)
        nextPlaceholderIds.delete(queuedAsset.id)
        options.profileAssetPlaceholderIdSet.value = nextPlaceholderIds
        options.pendingAssets.value = diff.nextWindow.slice()
        options.syncProfileAssetEntryPhaseMap(
          options.displayedAssets.value,
          (item, currentPhase) => {
            if (item.id === queuedAsset.id) {
              return 'entering'
            }

            return currentPhase
          }
        )
        options.visual.setProfileAssetRevealPhaseMap(
          options.visual.buildNextProfileAssetRevealPhaseMap(diff, source)
        )
        options.visual.syncProfileAssetVisualImages()
        options.visual.syncProfileAssetRevealPhases()
      }, queueIndex * options.motion.staggerStepMs)

      profileAssetQueuedInsertTimeoutIds.push(timeoutId)
    })
  }

  const scheduleProfileAssetRetainedReplayEnter = async (
    diff: ResultWindowDiff<ProfileAssetItem>,
    runId: number,
    source: ProfileAssetResultMotionSource
  ) => {
    if (!shouldReplayRetainedForResultSource(source)) {
      return
    }

    const retainedReplayIds = new Set(
      diff.nextWindow
        .filter(
          (item) => !diff.addedIds.has(item.id) && options.mountedAssetIdSet.value.has(item.id)
        )
        .map((item) => item.id)
    )
    if (!retainedReplayIds.size) {
      return
    }

    await nextTick()
    requestAnimationFrame(() => {
      if (options.profileAssetResultSwitchRunId.value !== runId) {
        return
      }

      options.syncProfileAssetEntryPhaseMap(options.displayedAssets.value, (item, currentPhase) => {
        if (retainedReplayIds.has(item.id)) {
          return 'replay-entering'
        }

        return currentPhase
      })
      options.visual.syncProfileAssetVisualImages()
      options.visual.syncProfileAssetRevealPhases()
    })
  }

  const scheduleProfileAssetEnterMotionTimeout = (callback: () => void, durationMs: number) => {
    profileAssetEnterMotionTimeout = setTimeout(callback, durationMs)
  }

  return {
    resolveProfileAssetEnterMotionDurationMs,
    clearProfileAssetQueuedInsertTimeouts,
    clearProfileAssetEnterMotionTimeout,
    finalizeProfileAssetEnter,
    scheduleProfileAssetQueuedInsertions,
    scheduleProfileAssetRetainedReplayEnter,
    scheduleProfileAssetEnterMotionTimeout,
  }
}
