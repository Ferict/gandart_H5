/**
 * Responsibility: coordinate activity rail mount-time effects, watcher wiring, and
 * inactive cleanup for the activity page shell.
 * Out of scope: query-state authoring, content lifecycle execution, presentation derivation,
 * navigation clicks, and template rendering.
 */
import { onBeforeUnmount, onMounted, watch, type ComputedRef, type Ref } from 'vue'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'

interface UseHomeRailActivityEffectsOptions {
  noticeListQuerySignature: ComputedRef<string>
  hasResolvedInitialActivityContent: Ref<boolean>
  visibleNoticeStructureSignature: ComputedRef<string>
  visibleNoticeContentSignature: ComputedRef<string>
  noticeRefreshReplayRequestId: Ref<number>
  activityNoticeImageStateVersionRef: Ref<number>
  displayedNotices: Ref<ActivityNotice[]>
  mountedNotices: Ref<ActivityNotice[]>
  pendingNoticeList: Ref<ActivityNotice[]>
  noticeTags: ComputedRef<string[]>
  activeTag: Ref<string>
  isActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  hasSeenActivityPageActivation: Ref<boolean>
  activityForegroundSignal: Ref<unknown>
  activityPollSignal: Ref<unknown>
  initializeActivityContent: () => Promise<void>
  clearStagedNoticeListUpdate: () => void
  reloadActivityNoticeListAndApply: (options?: {
    force?: boolean
    replay?: boolean
    motionSource?: 'initial-enter' | 'manual-query-switch' | 'manual-refresh'
  }) => Promise<unknown>
  reconcileNoticeRender: () => void
  syncMountedNoticeWindow: (items?: ActivityNotice[]) => void
  syncNoticeVisualImages: (items?: ActivityNotice[]) => void
  syncNoticeRevealPhases: (items?: ActivityNotice[]) => void
  scheduleNoticeTagIndicatorSync: () => void
  syncActivityNoticeQuerySnapshot: () => void
  markNoticeRefreshPresentationCancelled: () => void
  resetActivityRuntimeForInactive: () => void
  resetActivityQueryForInactive: () => void
  resetRemoteNoticeListForInactive: () => void
  resetNoticeResultWindowForInactive: () => void
  resetNoticeVisualRevealForInactive: () => void
  startNoticeResultSwitch: (nextList: ActivityNotice[]) => Promise<void>
  runActivityActivationCheck: (options?: { allowNetworkFallback?: boolean }) => Promise<void>
  runActivityVisibleUpdateCheck: () => void
  disposeActivityRuntime: () => void
  disposeActivityQueryState: () => void
  disposeNoticeResultWindow: () => void
  disposeNoticeVisualReveal: () => void
}

export const useHomeRailActivityEffects = (options: UseHomeRailActivityEffectsOptions) => {
  onMounted(() => {
    void (async () => {
      await options.initializeActivityContent()
    })()
  })

  watch(options.noticeListQuerySignature, () => {
    options.clearStagedNoticeListUpdate()
    options.syncActivityNoticeQuerySnapshot()
    if (!options.hasResolvedInitialActivityContent.value) {
      return
    }

    void options.reloadActivityNoticeListAndApply({
      motionSource: 'manual-query-switch',
    })
  })

  watch(
    [
      () => options.hasResolvedInitialActivityContent.value,
      () => options.visibleNoticeStructureSignature.value,
      () => options.visibleNoticeContentSignature.value,
      () => options.noticeRefreshReplayRequestId.value,
    ],
    ([hasResolved]) => {
      if (!hasResolved) {
        return
      }

      options.reconcileNoticeRender()
    },
    { immediate: true }
  )

  watch(options.activityNoticeImageStateVersionRef, () => {
    options.syncNoticeRevealPhases(options.mountedNotices.value)
  })

  watch(
    () =>
      [
        options.isActive.value ? 1 : 0,
        options.displayedNotices.value.length,
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

      options.syncMountedNoticeWindow(options.displayedNotices.value)
      options.syncNoticeVisualImages(options.mountedNotices.value)
      options.syncNoticeRevealPhases(options.mountedNotices.value)
    },
    { immediate: true }
  )

  watch([() => options.noticeTags.value.join('::'), () => options.activeTag.value], () => {
    options.scheduleNoticeTagIndicatorSync()
  })

  watch(
    () => options.isActive.value,
    (isActive) => {
      if (!isActive) {
        options.markNoticeRefreshPresentationCancelled()
        options.resetActivityRuntimeForInactive()
        options.resetActivityQueryForInactive()
        options.resetRemoteNoticeListForInactive()
        options.resetNoticeResultWindowForInactive()
        options.resetNoticeVisualRevealForInactive()
        return
      }

      options.syncMountedNoticeWindow(options.displayedNotices.value)
      const isFirstActivation = !options.hasSeenActivityPageActivation.value
      options.hasSeenActivityPageActivation.value = true
      options.syncNoticeVisualImages(options.mountedNotices.value)
      options.syncNoticeRevealPhases(options.mountedNotices.value)
      options.scheduleNoticeTagIndicatorSync()
      if (
        isFirstActivation &&
        !options.displayedNotices.value.length &&
        options.pendingNoticeList.value.length
      ) {
        void options.startNoticeResultSwitch(options.pendingNoticeList.value)
        return
      }
      if (!isFirstActivation) {
        void options.runActivityActivationCheck()
      }
    },
    { immediate: true }
  )

  watch(
    () => options.activityForegroundSignal.value,
    () => {
      if (!options.isActive.value || !options.hasSeenActivityPageActivation.value) {
        return
      }

      void options.runActivityActivationCheck({ allowNetworkFallback: false })
    }
  )

  watch(
    () => options.activityPollSignal.value,
    () => {
      if (!options.isActive.value || !options.hasSeenActivityPageActivation.value) {
        return
      }

      options.runActivityVisibleUpdateCheck()
    }
  )

  onBeforeUnmount(() => {
    options.markNoticeRefreshPresentationCancelled()
    options.disposeActivityRuntime()
    options.disposeActivityQueryState()
    options.disposeNoticeResultWindow()
    options.disposeNoticeVisualReveal()
  })
}
