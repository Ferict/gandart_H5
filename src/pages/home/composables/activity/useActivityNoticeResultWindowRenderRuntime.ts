/**
 * Responsibility: own activity notice result-window render/replay coordination,
 * including refresh replay bookkeeping, resolved list application, render reconcile,
 * and settled-state checks.
 * Out of scope: switch sequencing, geometry, and inactive reset cleanup.
 */
import type { ComputedRef, Ref } from 'vue'
import type {
  ResultLoadSource,
  ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type {
  ActivityNotice,
  ActivityNoticeListResult,
} from '../../../../models/home-rail/homeRailActivity.model'

type ActivityNoticeResultMotionSource = ResultLoadSource

interface UseActivityNoticeResultWindowRenderRuntimeOptions {
  hasResolvedInitialActivityContent: Ref<boolean>
  visibleNotices: ComputedRef<ActivityNotice[]>
  displayedNotices: Ref<ActivityNotice[]>
  pendingNoticeList: Ref<ActivityNotice[]>
  hasBootstrappedNoticeList: Ref<boolean>
  noticeResultMotionSource: Ref<ActivityNoticeResultMotionSource>
  noticeTransitionPhase: Ref<'idle' | 'leaving' | 'entering'>
  noticeRefreshReplayRequestId: Ref<number>
  handledNoticeRefreshReplayRequestId: Ref<number>
  queuedNoticeSwitch: Ref<ActivityNotice[] | null>
  pendingNoticeWindowDiff: Ref<ResultWindowDiff<ActivityNotice> | null>
  isRemoteNoticeListLoading: Ref<boolean>
  resolveNoticeVisibleCount: () => number
  buildNoticeStructureSignature: (list: ActivityNotice[]) => string
  buildNoticeContentSignature: (list: ActivityNotice[]) => string
  syncMountedNoticeWindow: (items?: ActivityNotice[]) => void
  startNoticeResultSwitch: (nextList: ActivityNotice[]) => Promise<void> | void
}

export const useActivityNoticeResultWindowRenderRuntime = (
  options: UseActivityNoticeResultWindowRenderRuntimeOptions
) => {
  const resolveAppliedNoticeList = (list: ActivityNotice[]) => {
    return list.slice(0, options.resolveNoticeVisibleCount())
  }

  const requestActivityNoticeRefreshReplay = () => {
    options.noticeRefreshReplayRequestId.value += 1
  }

  const applyResolvedActivityNoticeList = (
    nextListResult: Pick<ActivityNoticeListResult, 'list' | 'total'>,
    applyOptions: { replay?: boolean; motionSource?: ActivityNoticeResultMotionSource } = {}
  ) => {
    options.pendingNoticeList.value = resolveAppliedNoticeList(nextListResult.list)
    options.noticeResultMotionSource.value =
      applyOptions.motionSource ??
      (options.hasBootstrappedNoticeList.value ? 'manual-query-switch' : 'initial-enter')

    if (applyOptions.replay) {
      requestActivityNoticeRefreshReplay()
      return
    }

    options.hasBootstrappedNoticeList.value = true
    void options.startNoticeResultSwitch(options.pendingNoticeList.value)
  }

  const reconcileNoticeRender = () => {
    if (!options.hasResolvedInitialActivityContent.value) {
      return
    }

    const nextList = options.visibleNotices.value.slice()
    if (
      options.noticeRefreshReplayRequestId.value !==
      options.handledNoticeRefreshReplayRequestId.value
    ) {
      options.handledNoticeRefreshReplayRequestId.value = options.noticeRefreshReplayRequestId.value
      void options.startNoticeResultSwitch(nextList)
      return
    }

    const nextStructure = options.buildNoticeStructureSignature(nextList)
    const displayedStructure = options.buildNoticeStructureSignature(options.displayedNotices.value)
    const nextContent = options.buildNoticeContentSignature(nextList)
    const displayedContent = options.buildNoticeContentSignature(options.displayedNotices.value)

    if (nextStructure !== displayedStructure || nextContent !== displayedContent) {
      void options.startNoticeResultSwitch(nextList)
      return
    }

    options.syncMountedNoticeWindow(nextList)
  }

  const isNoticeRefreshPresentationSettled = (targetReplayRequestId: number) => {
    return (
      !options.isRemoteNoticeListLoading.value &&
      options.noticeTransitionPhase.value === 'idle' &&
      options.handledNoticeRefreshReplayRequestId.value === targetReplayRequestId &&
      options.queuedNoticeSwitch.value === null &&
      options.pendingNoticeWindowDiff.value === null
    )
  }

  return {
    requestActivityNoticeRefreshReplay,
    applyResolvedActivityNoticeList,
    reconcileNoticeRender,
    isNoticeRefreshPresentationSettled,
  }
}
