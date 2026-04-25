/**
 * Responsibility: coordinate profile rail mount-time effects, watcher wiring, and
 * inactive cleanup for the profile page shell.
 * Out of scope: remote-list loading, quick-action navigation, pure presentation
 * derivation, and template rendering.
 */
import { onBeforeUnmount, onMounted, watch, type ComputedRef, type Ref } from 'vue'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import type { ProfileAssetResultMotionSource } from './useProfileAssetResultWindow'

interface UseHomeRailProfileEffectsOptions {
  profileAssetQuerySignature: ComputedRef<string>
  hasResolvedInitialProfileContent: Ref<boolean>
  visibleProfileAssetStructureSignature: ComputedRef<string>
  visibleProfileAssetContentSignature: ComputedRef<string>
  profileAssetRefreshReplayRequestId: Ref<number>
  mountedAssets: Ref<ProfileAssetItem[]>
  displayedAssets: Ref<ProfileAssetItem[]>
  pendingAssets: Ref<ProfileAssetItem[]>
  resolvedProfileAssetSource: ComputedRef<ProfileAssetItem[]>
  profileAssetVisibleCount: Ref<number>
  currentProfileAssetQuery: ComputedRef<unknown>
  isActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  hasSeenProfilePageActivation: Ref<boolean>
  profileForegroundSignal: Ref<unknown>
  profilePollSignal: Ref<unknown>
  isProfileAssetLoadMoreRunning: Ref<boolean>
  initialVisibleCount: number
  initializeProfileContent: () => Promise<void>
  clearStagedAssetListUpdate: () => void
  resetProfileAssetVisibleCount: () => void
  reloadProfileAssetListAndApply: (options?: {
    force?: boolean
    replay?: boolean
    motionSource?: ProfileAssetResultMotionSource
  }) => Promise<unknown>
  reconcileProfileAssetRender: () => void
  profileAssetImageStateVersion: Ref<number>
  syncProfileAssetRevealPhases: (items?: ProfileAssetItem[]) => void
  syncMountedProfileAssetWindow: (items?: ProfileAssetItem[]) => void
  syncProfileAssetVisualImages: (items?: ProfileAssetItem[]) => void
  scheduleProfileLoadMoreObserver: () => void
  syncProfileAssetQuerySnapshot: () => void
  markProfileRefreshPresentationCancelled: () => void
  clearProfileLoadMoreObserver: () => void
  resetProfileRuntimeForInactive: () => void
  resetProfileQueryForInactive: () => void
  resetProfileResultWindowForInactive: () => void
  startProfileAssetResultSwitch: (nextCollection: ProfileAssetItem[]) => Promise<void>
  runProfileActivationCheck: (options?: { allowNetworkFallback?: boolean }) => Promise<void>
  runProfileVisibleUpdateCheck: () => void
  disposeProfileRuntime: () => void
  disposeProfileQueryState: () => void
  disposeProfileAssetResultWindow: () => void
  disposeProfileAssetVisualReveal: () => void
}

export const useHomeRailProfileEffects = (options: UseHomeRailProfileEffectsOptions) => {
  onMounted(() => {
    void (async () => {
      await options.initializeProfileContent()
    })()
  })

  watch(options.profileAssetQuerySignature, () => {
    options.clearStagedAssetListUpdate()
    options.resetProfileAssetVisibleCount()
    if (!options.hasResolvedInitialProfileContent.value) {
      return
    }

    void options.reloadProfileAssetListAndApply({
      motionSource: 'manual-query-switch',
    })
  })

  watch(
    [
      () => options.hasResolvedInitialProfileContent.value,
      () => options.visibleProfileAssetStructureSignature.value,
      () => options.visibleProfileAssetContentSignature.value,
      () => options.profileAssetRefreshReplayRequestId.value,
    ],
    ([hasResolved]) => {
      if (!hasResolved) {
        return
      }

      options.reconcileProfileAssetRender()
    },
    { immediate: true }
  )

  watch(
    () => options.profileAssetImageStateVersion.value,
    () => {
      options.syncProfileAssetRevealPhases(options.mountedAssets.value)
    }
  )

  watch(
    () =>
      [
        options.isActive.value ? 1 : 0,
        options.displayedAssets.value.length,
        options.mountScrollMetrics.value?.isReady ? 1 : 0,
        options.mountScrollMetrics.value?.scrollTop ?? 0,
        options.mountScrollMetrics.value?.viewportHeight ?? 0,
        options.mountScrollMetrics.value?.viewportTop ?? 0,
        options.mountScrollMetrics.value?.windowingSuspended ? 1 : 0,
      ].join('::'),
    () => {
      if (!options.isActive.value) {
        return
      }

      options.syncMountedProfileAssetWindow(options.displayedAssets.value)
      options.syncProfileAssetVisualImages(options.mountedAssets.value)
      options.syncProfileAssetRevealPhases(options.mountedAssets.value)
      options.scheduleProfileLoadMoreObserver()
    },
    { immediate: true }
  )

  watch(
    () => options.resolvedProfileAssetSource.value.length,
    (nextLength) => {
      if (nextLength <= 0) {
        options.profileAssetVisibleCount.value = options.initialVisibleCount
        return
      }

      if (options.profileAssetVisibleCount.value > nextLength) {
        options.profileAssetVisibleCount.value = nextLength
        return
      }

      if (options.profileAssetVisibleCount.value === options.initialVisibleCount) {
        options.profileAssetVisibleCount.value = Math.min(options.initialVisibleCount, nextLength)
      }
    },
    { immediate: true }
  )

  watch(
    options.currentProfileAssetQuery,
    () => {
      options.syncProfileAssetQuerySnapshot()
    },
    { immediate: true, deep: true }
  )

  watch(
    () => options.isActive.value,
    (isActive) => {
      if (!isActive) {
        options.markProfileRefreshPresentationCancelled()
        options.clearProfileLoadMoreObserver()
        options.isProfileAssetLoadMoreRunning.value = false
        options.resetProfileAssetVisibleCount()
        options.resetProfileRuntimeForInactive()
        options.resetProfileQueryForInactive()
        options.resetProfileResultWindowForInactive()
        return
      }

      options.syncMountedProfileAssetWindow(options.displayedAssets.value)
      const isFirstActivation = !options.hasSeenProfilePageActivation.value
      options.hasSeenProfilePageActivation.value = true
      options.syncProfileAssetVisualImages(options.mountedAssets.value)
      options.syncProfileAssetRevealPhases(options.mountedAssets.value)
      options.scheduleProfileLoadMoreObserver()
      if (
        isFirstActivation &&
        !options.displayedAssets.value.length &&
        options.pendingAssets.value.length
      ) {
        void options.startProfileAssetResultSwitch(options.pendingAssets.value)
        return
      }
      if (!isFirstActivation) {
        void options.runProfileActivationCheck()
      }
    },
    { immediate: true }
  )

  watch(
    () => options.profileForegroundSignal.value,
    () => {
      if (!options.isActive.value || !options.hasSeenProfilePageActivation.value) {
        return
      }

      void options.runProfileActivationCheck({ allowNetworkFallback: false })
    }
  )

  watch(
    () => options.profilePollSignal.value,
    () => {
      if (!options.isActive.value || !options.hasSeenProfilePageActivation.value) {
        return
      }

      options.runProfileVisibleUpdateCheck()
    }
  )

  onBeforeUnmount(() => {
    options.markProfileRefreshPresentationCancelled()
    options.clearProfileLoadMoreObserver()
    options.disposeProfileRuntime()
    options.disposeProfileQueryState()
    options.disposeProfileAssetResultWindow()
    options.disposeProfileAssetVisualReveal()
  })
}
