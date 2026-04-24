/**
 * Responsibility: own the activity date-filter sheet draft range, month cursor, and
 * open/submitted-range synchronization runtime.
 * Out of scope: activity query execution, notice result loading, and sheet visual styling.
 */

import { computed, ref, watch } from 'vue'
import type { ActivityDateFilterRange } from '../../../../models/home-rail/homeRailActivity.model'
import {
  ACTIVITY_DATE_FILTER_WEEK_LABELS,
  buildActivityDateFilterCalendarCells,
  formatActivityDateFilterMonthLabel,
  normalizeActivityDateFilterRange,
  resolveInitialActivityDateFilterMonth,
  resolveNextActivityDateFilterRange,
  shiftActivityDateFilterMonth,
} from '../../../../utils/activityDateFilter.util'

interface UseHomeActivityDateFilterSheetRuntimeOptions {
  resolveIsOpen: () => boolean
  resolveSubmittedRange: () => ActivityDateFilterRange
  emitClose: () => void
  emitReset: () => void
  emitApply: (range: ActivityDateFilterRange) => void
}

export const useHomeActivityDateFilterSheetRuntime = ({
  resolveIsOpen,
  resolveSubmittedRange,
  emitClose,
  emitReset,
  emitApply,
}: UseHomeActivityDateFilterSheetRuntimeOptions) => {
  const weekLabels = ACTIVITY_DATE_FILTER_WEEK_LABELS
  const draftRange = ref<ActivityDateFilterRange>(
    normalizeActivityDateFilterRange(resolveSubmittedRange())
  )
  const monthCursor = ref(resolveInitialActivityDateFilterMonth(resolveSubmittedRange()))

  const syncDraftState = () => {
    draftRange.value = normalizeActivityDateFilterRange(resolveSubmittedRange())
    monthCursor.value = resolveInitialActivityDateFilterMonth(resolveSubmittedRange())
  }

  const monthLabel = computed(() => formatActivityDateFilterMonthLabel(monthCursor.value))
  const calendarCells = computed(() =>
    buildActivityDateFilterCalendarCells(monthCursor.value, draftRange.value)
  )

  watch(
    () => resolveIsOpen(),
    (isOpen) => {
      if (isOpen) {
        syncDraftState()
      }
    }
  )

  watch(
    () => resolveSubmittedRange(),
    () => {
      if (resolveIsOpen()) {
        syncDraftState()
      }
    },
    { deep: true }
  )

  const handleClose = () => {
    emitClose()
  }

  const handleReset = () => {
    emitReset()
  }

  const handleApply = () => {
    emitApply(normalizeActivityDateFilterRange(draftRange.value))
  }

  const handlePreviousMonth = () => {
    monthCursor.value = shiftActivityDateFilterMonth(monthCursor.value, -1)
  }

  const handleNextMonth = () => {
    monthCursor.value = shiftActivityDateFilterMonth(monthCursor.value, 1)
  }

  const handleDateSelect = (dateKey: string) => {
    draftRange.value = resolveNextActivityDateFilterRange(draftRange.value, dateKey)
  }

  return {
    weekLabels,
    monthLabel,
    calendarCells,
    handleClose,
    handleReset,
    handleApply,
    handlePreviousMonth,
    handleNextMonth,
    handleDateSelect,
  }
}
