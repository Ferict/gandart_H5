/**
 * Responsibility: track per-page mount metrics and scroll geometry for the home track so result
 * windowing services can read a stable local measurement shell.
 * Out of scope: result window ownership, page content loading, and panel presentation behavior.
 */
import { reactive, ref } from 'vue'
import type { PageKey } from '../../../../models/home-shell/homeShell.model'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import { resolveTemplateRefElement } from '../../../../utils/resolveTemplateRefElement.util'

interface TrackScrollMetrics {
  scrollTop: number
  scrollHeight: number
  clientHeight: number
  viewportTop: number
  isReady: boolean
}

interface HomeTrackScrollEvent {
  detail?: number | { scrollTop?: number; scrollHeight?: number }
  target?: EventTarget | null
  currentTarget?: EventTarget | null
}

interface UseHomeTrackMountMetricsOptions {
  pageKeys: readonly PageKey[]
  homePageKey: PageKey
  resolveTrackScrollViewRef: (pageKey: PageKey) => unknown
  resolveTrackWindowingSuspended: (pageKey: PageKey) => boolean
}

const createTrackScrollMetrics = (): TrackScrollMetrics => ({
  scrollTop: 0,
  scrollHeight: 0,
  clientHeight: 0,
  viewportTop: 0,
  isReady: false,
})

const createTrackScrollMetricsRecord = (pageKeys: readonly PageKey[]) => {
  return Object.fromEntries(
    pageKeys.map((pageKey) => [pageKey, createTrackScrollMetrics()])
  ) as Record<PageKey, TrackScrollMetrics>
}

const resolveFiniteNumber = (candidates: Array<number | undefined>, fallback: number) => {
  const candidate = candidates.find((value) => typeof value === 'number' && Number.isFinite(value))
  return candidate ?? fallback
}

const resolvePositiveNumber = (candidates: Array<number | undefined>, fallback: number) => {
  const candidate = candidates.find(
    (value) => typeof value === 'number' && Number.isFinite(value) && value > 0
  )
  return candidate ?? fallback
}

export const useHomeTrackMountMetrics = ({
  pageKeys,
  homePageKey,
  resolveTrackScrollViewRef,
  resolveTrackWindowingSuspended,
}: UseHomeTrackMountMetricsOptions) => {
  const homeTrackScrolled = ref(false)
  const trackScrollMetrics = reactive<Record<PageKey, TrackScrollMetrics>>(
    createTrackScrollMetricsRecord(pageKeys)
  )

  const syncTrackViewportSnapshot = (pageKey: PageKey) => {
    const metrics = trackScrollMetrics[pageKey]
    const scrollViewElement = resolveTemplateRefElement(resolveTrackScrollViewRef(pageKey))
    if (!scrollViewElement) {
      metrics.isReady = false
      return
    }

    const rect = scrollViewElement.getBoundingClientRect()
    metrics.clientHeight = scrollViewElement.clientHeight
    metrics.viewportTop = rect.top
    metrics.isReady = metrics.clientHeight > 0
  }

  const syncTrackViewportSnapshotForAllPages = () => {
    pageKeys.forEach((pageKey) => {
      syncTrackViewportSnapshot(pageKey)
    })
  }

  const resolveTrackMountScrollMetrics = (pageKey: PageKey): ResultMountScrollMetrics => {
    const metrics = trackScrollMetrics[pageKey]
    return {
      scrollTop: metrics.scrollTop,
      viewportHeight: metrics.clientHeight,
      viewportTop: metrics.viewportTop,
      isReady: metrics.isReady,
      windowingSuspended: resolveTrackWindowingSuspended(pageKey),
    }
  }

  const handleTrackScroll = (pageKey: PageKey, event: HomeTrackScrollEvent) => {
    const metrics = trackScrollMetrics[pageKey]
    const detailScrollTop =
      typeof event.detail === 'number' ? event.detail : event.detail?.scrollTop
    const detailScrollHeight =
      typeof event.detail === 'object' ? event.detail?.scrollHeight : undefined
    const targetElement = ((event.target as HTMLElement | null) ??
      (event.currentTarget as HTMLElement | null)) as HTMLElement | null
    const targetScrollTop = targetElement?.scrollTop
    const targetScrollHeight = targetElement?.scrollHeight
    const targetClientHeight = targetElement?.clientHeight
    const currentTargetScrollTop = (event.currentTarget as HTMLElement | null)?.scrollTop
    const currentTargetScrollHeight = (event.currentTarget as HTMLElement | null)?.scrollHeight
    const currentTargetClientHeight = (event.currentTarget as HTMLElement | null)?.clientHeight
    const currentTargetViewportTop = (
      event.currentTarget as HTMLElement | null
    )?.getBoundingClientRect?.().top

    metrics.scrollTop = Math.max(
      0,
      resolveFiniteNumber(
        [detailScrollTop, targetScrollTop, currentTargetScrollTop],
        metrics.scrollTop
      )
    )
    metrics.scrollHeight = Math.max(
      0,
      resolveFiniteNumber(
        [detailScrollHeight, targetScrollHeight, currentTargetScrollHeight],
        metrics.scrollHeight
      )
    )
    metrics.clientHeight = resolvePositiveNumber(
      [targetClientHeight, currentTargetClientHeight],
      metrics.clientHeight
    )
    if (typeof currentTargetViewportTop === 'number' && Number.isFinite(currentTargetViewportTop)) {
      metrics.viewportTop = currentTargetViewportTop
    } else if (!metrics.isReady || metrics.clientHeight <= 0) {
      syncTrackViewportSnapshot(pageKey)
    }
    metrics.isReady = metrics.clientHeight > 0
    if (pageKey === homePageKey) {
      homeTrackScrolled.value = metrics.scrollTop > 0
    }
  }

  const clearHomeTrackScrolled = () => {
    homeTrackScrolled.value = false
  }

  const reconcileHomeTrackScrolled = () => {
    homeTrackScrolled.value = trackScrollMetrics[homePageKey].scrollTop > 0
  }

  return {
    homeTrackScrolled,
    resolveTrackMountScrollMetrics,
    handleTrackScroll,
    syncTrackViewportSnapshot,
    syncTrackViewportSnapshotForAllPages,
    clearHomeTrackScrolled,
    reconcileHomeTrackScrolled,
  }
}
