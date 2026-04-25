/**
 * Responsibility: provide shared activity date-filter parsing, normalization, label, and
 * calendar-cell helpers for the activity page filter sheet.
 * Out of scope: filter-sheet component state, notice query execution, and page-level
 * result-window orchestration.
 */
import type { ActivityDateFilterRange } from '../models/home-rail/homeRailActivity.model'

export interface ActivityDateFilterCalendarCell {
  id: string
  dateKey: string
  dayNumber: number
  isPlaceholder: boolean
  isToday: boolean
  isRangeStart: boolean
  isRangeEnd: boolean
  isInRange: boolean
  isSingleDay: boolean
}

export const ACTIVITY_DATE_FILTER_WEEK_LABELS = ['日', '一', '二', '三', '四', '五', '六'] as const

const DATE_KEY_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/
const DATE_PREFIX_PATTERN = /^(\d{4})-(\d{2})-(\d{2})/

const padTwoDigits = (value: number): string => String(value).padStart(2, '0')

export const resolveActivityDateKey = (date: Date): string => {
  return `${date.getFullYear()}-${padTwoDigits(date.getMonth() + 1)}-${padTwoDigits(date.getDate())}`
}

export const parseActivityDateKey = (value: string): Date | null => {
  const normalizedValue = value.trim()
  const matched = normalizedValue.match(DATE_KEY_PATTERN)
  if (!matched) {
    return null
  }

  const year = Number(matched[1])
  const month = Number(matched[2]) - 1
  const day = Number(matched[3])
  const parsedDate = new Date(year, month, day)
  if (
    parsedDate.getFullYear() !== year ||
    parsedDate.getMonth() !== month ||
    parsedDate.getDate() !== day
  ) {
    return null
  }

  return parsedDate
}

const normalizeActivityDateKey = (value: string): string | null => {
  const parsedDate = parseActivityDateKey(value)
  return parsedDate ? resolveActivityDateKey(parsedDate) : null
}

export const normalizeActivityDateFilterRange = (
  range: ActivityDateFilterRange
): ActivityDateFilterRange => {
  if (!range) {
    return null
  }

  const startDate = normalizeActivityDateKey(range.startDate)
  const endDate = normalizeActivityDateKey(range.endDate)
  if (!startDate || !endDate) {
    return null
  }

  if (startDate <= endDate) {
    return {
      startDate,
      endDate,
    }
  }

  return {
    startDate: endDate,
    endDate: startDate,
  }
}

export const formatActivityDateFilterLabel = (range: ActivityDateFilterRange): string => {
  const normalizedRange = normalizeActivityDateFilterRange(range)
  if (!normalizedRange) {
    return '全部时间'
  }

  if (normalizedRange.startDate === normalizedRange.endDate) {
    return normalizedRange.startDate
  }

  return `${normalizedRange.startDate} 至 ${normalizedRange.endDate}`
}

export const resolveActivityDateKeyFromPublishedAt = (publishedAt: string): string | null => {
  const normalizedValue = publishedAt.trim()
  const matched = normalizedValue.match(DATE_PREFIX_PATTERN)
  if (!matched) {
    return null
  }

  return normalizeActivityDateKey(`${matched[1]}-${matched[2]}-${matched[3]}`)
}

export const isActivityDateKeyInRange = (
  dateKey: string,
  range: ActivityDateFilterRange
): boolean => {
  const normalizedDateKey = normalizeActivityDateKey(dateKey)
  const normalizedRange = normalizeActivityDateFilterRange(range)
  if (!normalizedDateKey || !normalizedRange) {
    return false
  }

  return (
    normalizedDateKey >= normalizedRange.startDate && normalizedDateKey <= normalizedRange.endDate
  )
}

export const resolveNextActivityDateFilterRange = (
  currentRange: ActivityDateFilterRange,
  nextDateKey: string
): ActivityDateFilterRange => {
  const normalizedNextDateKey = normalizeActivityDateKey(nextDateKey)
  if (!normalizedNextDateKey) {
    return normalizeActivityDateFilterRange(currentRange)
  }

  const normalizedRange = normalizeActivityDateFilterRange(currentRange)
  if (!normalizedRange) {
    return {
      startDate: normalizedNextDateKey,
      endDate: normalizedNextDateKey,
    }
  }

  const isSingleDay = normalizedRange.startDate === normalizedRange.endDate
  if (!isSingleDay) {
    return {
      startDate: normalizedNextDateKey,
      endDate: normalizedNextDateKey,
    }
  }

  if (normalizedNextDateKey < normalizedRange.startDate) {
    return {
      startDate: normalizedNextDateKey,
      endDate: normalizedNextDateKey,
    }
  }

  return {
    startDate: normalizedRange.startDate,
    endDate: normalizedNextDateKey,
  }
}

const resolveMonthStartDate = (date: Date): Date => {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export const resolveInitialActivityDateFilterMonth = (range: ActivityDateFilterRange): Date => {
  const normalizedRange = normalizeActivityDateFilterRange(range)
  if (!normalizedRange) {
    return resolveMonthStartDate(new Date())
  }

  const startDate = parseActivityDateKey(normalizedRange.startDate)
  return startDate ? resolveMonthStartDate(startDate) : resolveMonthStartDate(new Date())
}

export const shiftActivityDateFilterMonth = (monthDate: Date, offset: number): Date => {
  return new Date(monthDate.getFullYear(), monthDate.getMonth() + offset, 1)
}

export const formatActivityDateFilterMonthLabel = (monthDate: Date): string => {
  return `${monthDate.getFullYear()}年${monthDate.getMonth() + 1}月`
}

export const buildActivityDateFilterCalendarCells = (
  monthDate: Date,
  range: ActivityDateFilterRange
): ActivityDateFilterCalendarCell[] => {
  const monthStartDate = resolveMonthStartDate(monthDate)
  const monthStartWeekday = monthStartDate.getDay()
  const daysInMonth = new Date(
    monthStartDate.getFullYear(),
    monthStartDate.getMonth() + 1,
    0
  ).getDate()
  const totalCellCount = Math.ceil((monthStartWeekday + daysInMonth) / 7) * 7
  const normalizedRange = normalizeActivityDateFilterRange(range)
  const todayDateKey = resolveActivityDateKey(new Date())

  return Array.from({ length: totalCellCount }, (_, index) => {
    const dayNumber = index - monthStartWeekday + 1
    if (dayNumber <= 0 || dayNumber > daysInMonth) {
      return {
        id: `empty-${monthStartDate.getFullYear()}-${monthStartDate.getMonth()}-${index}`,
        dateKey: '',
        dayNumber: 0,
        isPlaceholder: true,
        isToday: false,
        isRangeStart: false,
        isRangeEnd: false,
        isInRange: false,
        isSingleDay: false,
      }
    }

    const dateKey = `${monthStartDate.getFullYear()}-${padTwoDigits(monthStartDate.getMonth() + 1)}-${padTwoDigits(dayNumber)}`
    const isRangeStart = normalizedRange?.startDate === dateKey
    const isRangeEnd = normalizedRange?.endDate === dateKey
    const isSingleDay = Boolean(
      normalizedRange && normalizedRange.startDate === normalizedRange.endDate && isRangeStart
    )
    const isInRange = Boolean(
      normalizedRange &&
      normalizedRange.startDate !== normalizedRange.endDate &&
      dateKey > normalizedRange.startDate &&
      dateKey < normalizedRange.endDate
    )

    return {
      id: dateKey,
      dateKey,
      dayNumber,
      isPlaceholder: false,
      isToday: todayDateKey === dateKey,
      isRangeStart,
      isRangeEnd,
      isInRange,
      isSingleDay,
    }
  })
}
