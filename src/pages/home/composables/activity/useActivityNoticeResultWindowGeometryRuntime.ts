/**
 * Responsibility: encapsulate activity notice result-window stage styling, mounted-window
 * projection, and mount sync without touching result diff or refresh replay sequencing.
 * Out of scope: overlay timing, enter/leave orchestration, and result-switch decision logic.
 */
import { computed, type CSSProperties, type ComputedRef, type Ref } from 'vue'
import {
  buildResultMountWindow,
  isResultMountWindowingSuspended,
  resolveResultMountStageVisibleIntersection,
  type ResultMountScrollMetrics,
  type ResultMountWindow,
} from '../../../../services/home-rail/homeRailResultMountWindow.service'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'
import { resolveTemplateRefElement } from '../../../../utils/resolveTemplateRefElement.util'

interface UseActivityNoticeResultWindowGeometryRuntimeOptions {
  isPanelActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null | undefined>
  displayedNotices: Ref<ActivityNotice[]>
  mountedNotices: Ref<ActivityNotice[]>
  mountedNoticeIdSet: Ref<Set<string>>
  noticePlaceholderIdSet: Ref<Set<string>>
  noticeResultsStageRef: Ref<HTMLElement | null>
  noticeResultsStageLockedMinHeight: Ref<number>
  noticeTopSpacerHeight: Ref<number>
  noticeBottomSpacerHeight: Ref<number>
  syncNoticeVisualImages: (list?: ActivityNotice[]) => void
  syncNoticeRevealPhases: (list?: ActivityNotice[]) => void
}

const NOTICE_STAGE_ROW_HEIGHT_PX = 84
const NOTICE_STAGE_ROW_GAP_PX = 12
const NOTICE_MOUNT_BUFFER_TOP_ROWS = 2
const NOTICE_MOUNT_BUFFER_BOTTOM_ROWS = 3

export const useActivityNoticeResultWindowGeometryRuntime = (
  options: UseActivityNoticeResultWindowGeometryRuntimeOptions
) => {
  let noticeMountWindowSyncRafId: ReturnType<typeof requestAnimationFrame> | null = null

  const noticeResultsStageStyle = computed<CSSProperties>(() => {
    if (options.noticeResultsStageLockedMinHeight.value <= 0) {
      return {}
    }

    return { minHeight: `${options.noticeResultsStageLockedMinHeight.value}px` }
  })

  const resolveNoticeMountedWindow = (
    items: ActivityNotice[] = options.displayedNotices.value
  ): ResultMountWindow<ActivityNotice> => {
    const stageElement = resolveTemplateRefElement(options.noticeResultsStageRef.value)
    const scrollMetrics = options.mountScrollMetrics.value
    if (
      !stageElement ||
      !scrollMetrics?.isReady ||
      isResultMountWindowingSuspended(scrollMetrics) ||
      !Number.isFinite(scrollMetrics.viewportHeight) ||
      !Number.isFinite(scrollMetrics.viewportTop) ||
      scrollMetrics.viewportHeight <= 0
    ) {
      return buildResultMountWindow(items, {
        itemCount: items.length,
        columns: 1,
        rowHeight: NOTICE_STAGE_ROW_HEIGHT_PX,
        rowGap: NOTICE_STAGE_ROW_GAP_PX,
        visibleTopWithinStage: 0,
        visibleHeightWithinStage: 0,
        bufferTopRows: NOTICE_MOUNT_BUFFER_TOP_ROWS,
        bufferBottomRows: NOTICE_MOUNT_BUFFER_BOTTOM_ROWS,
        forceFullMount: true,
      })
    }

    const intersection = resolveResultMountStageVisibleIntersection(stageElement, scrollMetrics)
    if (!intersection) {
      return buildResultMountWindow(items, {
        itemCount: items.length,
        columns: 1,
        rowHeight: NOTICE_STAGE_ROW_HEIGHT_PX,
        rowGap: NOTICE_STAGE_ROW_GAP_PX,
        visibleTopWithinStage: 0,
        visibleHeightWithinStage: 0,
        bufferTopRows: NOTICE_MOUNT_BUFFER_TOP_ROWS,
        bufferBottomRows: NOTICE_MOUNT_BUFFER_BOTTOM_ROWS,
        forceFullMount: true,
      })
    }

    return buildResultMountWindow(items, {
      itemCount: items.length,
      columns: 1,
      rowHeight: NOTICE_STAGE_ROW_HEIGHT_PX,
      rowGap: NOTICE_STAGE_ROW_GAP_PX,
      visibleTopWithinStage: intersection.visibleTopWithinStage,
      visibleHeightWithinStage: intersection.visibleHeightWithinStage,
      bufferTopRows: NOTICE_MOUNT_BUFFER_TOP_ROWS,
      bufferBottomRows: NOTICE_MOUNT_BUFFER_BOTTOM_ROWS,
    })
  }

  const syncMountedNoticeWindow = (items: ActivityNotice[] = options.displayedNotices.value) => {
    const mountWindow = resolveNoticeMountedWindow(items)
    options.mountedNotices.value = mountWindow.items
    options.mountedNoticeIdSet.value = mountWindow.itemIds
    options.noticePlaceholderIdSet.value = new Set(
      Array.from(options.noticePlaceholderIdSet.value).filter((noticeId) =>
        mountWindow.itemIds.has(noticeId)
      )
    )
    options.noticeTopSpacerHeight.value = mountWindow.geometry.topSpacerHeight
    options.noticeBottomSpacerHeight.value = mountWindow.geometry.bottomSpacerHeight
  }

  const clearMountedNoticeWindow = () => {
    options.mountedNotices.value = []
    options.mountedNoticeIdSet.value = new Set()
    options.noticePlaceholderIdSet.value = new Set()
    options.noticeTopSpacerHeight.value = 0
    options.noticeBottomSpacerHeight.value = 0
  }

  const resolveDisplayedNoticeVisibleEndRow = () => {
    const mountWindow = resolveNoticeMountedWindow()
    return mountWindow.geometry.visibleEndRow >= 0 ? mountWindow.geometry.visibleEndRow : null
  }

  const clearNoticeMountWindowSyncRaf = () => {
    if (noticeMountWindowSyncRafId === null) {
      return
    }

    cancelAnimationFrame(noticeMountWindowSyncRafId)
    noticeMountWindowSyncRafId = null
  }

  const scheduleNoticeMountWindowSync = () => {
    if (!options.isPanelActive.value || noticeMountWindowSyncRafId !== null) {
      return
    }

    noticeMountWindowSyncRafId = requestAnimationFrame(() => {
      noticeMountWindowSyncRafId = null
      if (!options.isPanelActive.value) {
        return
      }

      syncMountedNoticeWindow()
      options.syncNoticeVisualImages(options.mountedNotices.value)
      options.syncNoticeRevealPhases(options.mountedNotices.value)
    })
  }

  return {
    noticeResultsStageStyle,
    syncMountedNoticeWindow,
    resolveDisplayedNoticeVisibleEndRow,
    clearMountedNoticeWindow,
    clearNoticeMountWindowSyncRaf,
    scheduleNoticeMountWindowSync,
  }
}
