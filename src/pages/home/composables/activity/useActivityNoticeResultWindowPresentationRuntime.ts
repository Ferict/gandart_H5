/**
 * Responsibility: build presentation-facing projection state for the activity notice result
 * window, including signatures, endline visibility, entry styles, and removed overlays.
 * Out of scope: result switching, remote fetching, and mounted-window timing control.
 */
import { computed, type CSSProperties, type ComputedRef, type Ref } from 'vue'
import {
  type CardQueuePhase,
  type ResultLoadSource,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'
import {
  buildResultEntryClass,
  buildResultEntryDelayStyle,
  buildResultListRemovedOverlayItemStyle,
  buildResultStructureSignatureById,
} from '../../../../utils/resultWindowPresentation.util'

type NoticeEntryPhase = CardQueuePhase
type ActivityNoticeResultMotionSource = ResultLoadSource

interface UseActivityNoticeResultWindowPresentationRuntimeOptions {
  filteredNotices: ComputedRef<ActivityNotice[]>
  displayedNotices: Ref<ActivityNotice[]>
  mountedNotices: Ref<ActivityNotice[]>
  resolvedNoticeTotal: ComputedRef<number>
  noticePlaceholderIdSet: Ref<Set<string>>
  noticeEntryPhaseMap: Ref<Record<string, NoticeEntryPhase>>
  noticeResultMotionSource: Ref<ActivityNoticeResultMotionSource>
  resolveNoticeImageUrl: (notice: ActivityNotice) => string
  staggerStepMs: number
}

export const useActivityNoticeResultWindowPresentationRuntime = (
  options: UseActivityNoticeResultWindowPresentationRuntimeOptions
) => {
  const visibleNoticeStructureSignature = computed(() =>
    buildNoticeStructureSignature(options.filteredNotices.value)
  )

  const visibleNoticeContentSignature = computed(() =>
    buildNoticeContentSignature(options.filteredNotices.value, options.resolveNoticeImageUrl)
  )

  const shouldShowActivityBottomEndline = computed(() => {
    return (
      options.resolvedNoticeTotal.value <= options.filteredNotices.value.length &&
      options.displayedNotices.value.length > 0
    )
  })

  const isNoticePlaceholder = (noticeId: string) =>
    options.noticePlaceholderIdSet.value.has(noticeId)

  const resolveNoticeEntryClass = (noticeId: string) => {
    const entryPhase = options.noticeEntryPhaseMap.value[noticeId] ?? 'steady'
    return buildResultEntryClass({
      entryPhase,
      motionSource: options.noticeResultMotionSource.value,
      isLightMotion: true,
    })
  }

  const resolveNoticeEntryStyle = (noticeId: string, index: number): CSSProperties => {
    const entryPhase = options.noticeEntryPhaseMap.value[noticeId] ?? 'steady'
    if (entryPhase !== 'entering' && entryPhase !== 'replay-entering') {
      return {}
    }

    const entryIndex =
      index >= 0
        ? index
        : options.mountedNotices.value.findIndex((notice) => notice.id === noticeId)
    return buildResultEntryDelayStyle(
      '--home-activity-notice-entry-delay',
      entryIndex < 0 ? 0 : entryIndex * options.staggerStepMs
    )
  }

  const resolveNoticeRemovedOverlayItemStyle = (sourceIndex: number): CSSProperties =>
    buildResultListRemovedOverlayItemStyle(sourceIndex)

  return {
    visibleNoticeStructureSignature,
    visibleNoticeContentSignature,
    shouldShowActivityBottomEndline,
    buildNoticeStructureSignature: (list: ActivityNotice[]) => buildNoticeStructureSignature(list),
    buildNoticeContentSignature: (list: ActivityNotice[]) =>
      buildNoticeContentSignature(list, options.resolveNoticeImageUrl),
    isNoticePlaceholder,
    resolveNoticeEntryClass,
    resolveNoticeEntryStyle,
    resolveNoticeRemovedOverlayItemStyle,
  }
}

export const buildNoticeStructureSignature = (list: ActivityNotice[]): string =>
  buildResultStructureSignatureById(list)

export const buildNoticeContentSignature = (
  list: ActivityNotice[],
  resolveNoticeImageUrl: (notice: ActivityNotice) => string
) => {
  return list
    .map(
      (notice) =>
        `${notice.id}::${notice.title}::${notice.category}::${notice.time}::${notice.isUnread ? 1 : 0}::${resolveNoticeImageUrl(notice)}`
    )
    .join('|')
}
