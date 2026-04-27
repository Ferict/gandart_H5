/**
 * Responsibility: manage top-level track refresh gesture state, indicator presentation,
 * and refresh dispatch orchestration across home-page rails.
 * Out of scope: rail-specific content fetching, result-window timing, and page-shell
 * layout assembly.
 */
import { computed, reactive, ref, type CSSProperties, type ComputedRef } from 'vue'
import { HOME_SHELL_PAGE_KEYS, type PageKey } from '../../../../models/home-shell/homeShell.model'
import {
  HOME_TRACK_PULL_REFRESH_CONTENT_LOCK_OFFSET_PX,
  HOME_TRACK_PULL_REFRESH_REVEAL_RAW_DISTANCE_PX,
  HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX,
  HOME_TRACK_REFRESH_INDICATOR_FADE_IN_RISE_PX,
  HOME_TRACK_REFRESH_TOP_OFFSET_PX,
  HOME_TRACK_REFRESH_SLOT_MAX_HEIGHT_PX,
  HOME_TRACK_PULL_RESISTANCE_POWER,
} from './homeTrackRefresh.constants'

interface HomeTrackRefresherPullingEvent {
  detail?: {
    dy?: number
    pullingDistance?: number
  }
}

interface HomeTrackRefreshControllerOptions {
  activePageKey: ComputedRef<PageKey>
  nextTickFn: () => Promise<void>
  resolveTrackRefreshHandle: (pageKey: PageKey) => HomeTrackRefreshHandle | null
  logSafeError: (scope: string, error: unknown, context?: Record<string, unknown>) => void
}

export interface HomeTrackRefreshOptions {
  force?: boolean
  reason?: 'pull-refresh'
}

export interface HomeTrackRefreshHandle {
  refreshContent?: (options?: HomeTrackRefreshOptions) => Promise<void>
  waitForRefreshPresentation?: () => Promise<void>
}

export interface HomeTrackRefreshSlotState {
  heightPx: number
  progress: number
  isVisible: boolean
  isRefreshing: boolean
  isPullActive: boolean
}

const createTrackNumberStateRecord = (pageKeys: readonly PageKey[]) => {
  return Object.fromEntries(pageKeys.map((pageKey) => [pageKey, 0])) as Record<PageKey, number>
}

const createTrackBooleanStateRecord = (pageKeys: readonly PageKey[]) => {
  return Object.fromEntries(pageKeys.map((pageKey) => [pageKey, false])) as Record<PageKey, boolean>
}

const clampNumber = (value: number, min: number, max: number) => {
  return Math.max(min, Math.min(max, value))
}

export const useHomeTrackRefreshController = ({
  activePageKey,
  nextTickFn,
  resolveTrackRefreshHandle,
  logSafeError,
}: HomeTrackRefreshControllerOptions) => {
  const trackRefresherPullDistance = reactive<Record<PageKey, number>>(
    createTrackNumberStateRecord(HOME_SHELL_PAGE_KEYS)
  )
  const trackRefresherTriggered = reactive<Record<PageKey, boolean>>(
    createTrackBooleanStateRecord(HOME_SHELL_PAGE_KEYS)
  )
  const trackWindowingSuspendedByRefresher = reactive<Record<PageKey, boolean>>(
    createTrackBooleanStateRecord(HOME_SHELL_PAGE_KEYS)
  )
  const trackWindowingSuspendedByPresentation = reactive<Record<PageKey, boolean>>(
    createTrackBooleanStateRecord(HOME_SHELL_PAGE_KEYS)
  )
  const trackWindowingPresentationRunId = reactive<Record<PageKey, number>>(
    createTrackNumberStateRecord(HOME_SHELL_PAGE_KEYS)
  )
  const refreshingPageKey = ref<PageKey | null>(null)
  const isTrackRefreshing = computed(() => refreshingPageKey.value !== null)

  const resolveTrackPullResistanceProgress = (distance: number, maxDistance: number) => {
    if (maxDistance <= 0) {
      return 0
    }

    const linearProgress = clampNumber(distance / maxDistance, 0, 1)
    return 1 - Math.pow(1 - linearProgress, HOME_TRACK_PULL_RESISTANCE_POWER)
  }

  const resolveTrackRefreshRevealProgress = (pageKey: PageKey) => {
    if (refreshingPageKey.value === pageKey) {
      return 1
    }

    if (activePageKey.value !== pageKey) {
      return 0
    }

    const revealDistance = Math.max(
      0,
      trackRefresherPullDistance[pageKey] - HOME_TRACK_PULL_REFRESH_CONTENT_LOCK_OFFSET_PX
    )
    return resolveTrackPullResistanceProgress(
      Math.min(revealDistance, HOME_TRACK_PULL_REFRESH_REVEAL_RAW_DISTANCE_PX),
      HOME_TRACK_PULL_REFRESH_REVEAL_RAW_DISTANCE_PX
    )
  }

  const resolveTrackRefreshIndicatorClass = (pageKey: PageKey) => {
    const isRefreshingPage = refreshingPageKey.value === pageKey
    const revealProgress = resolveTrackRefreshRevealProgress(pageKey)
    const isPullActive = !isRefreshingPage && revealProgress > 0
    return {
      'is-visible': revealProgress > 0 || isRefreshingPage,
      'is-refreshing': isRefreshingPage,
      'is-pull-active': isPullActive,
    }
  }

  const resolveTrackRefreshIndicatorStyle = (pageKey: PageKey): CSSProperties => {
    const revealProgress = resolveTrackRefreshRevealProgress(pageKey)
    const revealTranslateY = Math.round(
      (revealProgress - 1) * HOME_TRACK_REFRESH_INDICATOR_FADE_IN_RISE_PX
    )
    return {
      top: `${HOME_TRACK_REFRESH_TOP_OFFSET_PX}px`,
      opacity: `${revealProgress}`,
      transform: `translate(-50%, ${revealTranslateY}px)`,
    }
  }

  const resolveTrackRefreshSlotState = (pageKey: PageKey): HomeTrackRefreshSlotState => {
    const isRefreshingPage = refreshingPageKey.value === pageKey
    const progress = resolveTrackRefreshRevealProgress(pageKey)
    const isVisible = progress > 0 || isRefreshingPage
    return {
      heightPx: isVisible ? Math.round(progress * HOME_TRACK_REFRESH_SLOT_MAX_HEIGHT_PX) : 0,
      progress,
      isVisible,
      isRefreshing: isRefreshingPage,
      isPullActive: !isRefreshingPage && progress > 0,
    }
  }

  const resetTrackRefresherVisualState = (pageKey: PageKey) => {
    if (refreshingPageKey.value === pageKey) {
      return
    }

    trackRefresherTriggered[pageKey] = false
    trackRefresherPullDistance[pageKey] = 0
    trackWindowingSuspendedByRefresher[pageKey] = false
  }

  const resetTrackRefresherVisualStateForAllPages = () => {
    HOME_SHELL_PAGE_KEYS.forEach((pageKey) => {
      resetTrackRefresherVisualState(pageKey)
    })
  }

  const resolveTrackWindowingSuspended = (pageKey: PageKey) => {
    return (
      trackWindowingSuspendedByRefresher[pageKey] || trackWindowingSuspendedByPresentation[pageKey]
    )
  }

  const triggerPageRefresh = async (pageKey: PageKey) => {
    const refreshHandle = resolveTrackRefreshHandle(pageKey)
    if (!refreshHandle?.refreshContent) {
      trackRefresherTriggered[pageKey] = false
      trackRefresherPullDistance[pageKey] = 0
      trackWindowingSuspendedByRefresher[pageKey] = false
      trackWindowingSuspendedByPresentation[pageKey] = false
      return false
    }

    let didRefreshSucceed = true
    refreshingPageKey.value = pageKey
    trackRefresherTriggered[pageKey] = true
    trackRefresherPullDistance[pageKey] = HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX
    trackWindowingSuspendedByRefresher[pageKey] = true

    try {
      await nextTickFn()
      await refreshHandle.refreshContent({ force: true, reason: 'pull-refresh' })
      if (refreshHandle.waitForRefreshPresentation) {
        const currentPresentationRunId = trackWindowingPresentationRunId[pageKey] + 1
        trackWindowingPresentationRunId[pageKey] = currentPresentationRunId
        trackWindowingSuspendedByPresentation[pageKey] = true
        try {
          await refreshHandle.waitForRefreshPresentation()
        } catch (error) {
          logSafeError('homeTrack', error, {
            message: 'failed to wait for refresh presentation',
          })
        } finally {
          if (trackWindowingPresentationRunId[pageKey] === currentPresentationRunId) {
            trackWindowingSuspendedByPresentation[pageKey] = false
          }
        }
      } else {
        trackWindowingSuspendedByPresentation[pageKey] = false
      }
    } catch (error) {
      didRefreshSucceed = false
      logSafeError('homeTrack', error, {
        message: 'failed to refresh current page',
      })
    } finally {
      trackWindowingSuspendedByRefresher[pageKey] = false
      trackRefresherTriggered[pageKey] = false
      trackRefresherPullDistance[pageKey] = 0
      refreshingPageKey.value = null
    }

    return didRefreshSucceed
  }

  const refreshTrackPage = async (pageKey: PageKey) => {
    if (activePageKey.value !== pageKey || isTrackRefreshing.value) {
      return false
    }

    return triggerPageRefresh(pageKey)
  }

  const resolveTrackRefresherTriggered = (pageKey: PageKey) => {
    return trackRefresherTriggered[pageKey]
  }

  const resolveTrackRefresherEventDistance = (event: HomeTrackRefresherPullingEvent) => {
    const pullingDistance = event.detail?.pullingDistance
    if (typeof pullingDistance === 'number') {
      return pullingDistance
    }

    return event.detail?.dy ?? 0
  }

  const handleTrackRefresherPulling = (pageKey: PageKey, event: HomeTrackRefresherPullingEvent) => {
    if (activePageKey.value !== pageKey || refreshingPageKey.value === pageKey) {
      return
    }

    const nextPullDistance = Math.min(
      HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX,
      Math.max(0, Math.round(resolveTrackRefresherEventDistance(event)))
    )
    trackRefresherPullDistance[pageKey] = nextPullDistance
    if (nextPullDistance > 0) {
      trackWindowingSuspendedByRefresher[pageKey] = true
    }
  }

  const handleTrackRefresherRefresh = (pageKey: PageKey) => {
    if (activePageKey.value !== pageKey || isTrackRefreshing.value) {
      return
    }

    void triggerPageRefresh(pageKey)
  }

  const handleTrackRefresherRestore = (pageKey: PageKey) => {
    if (refreshingPageKey.value === pageKey) {
      return
    }

    trackRefresherTriggered[pageKey] = false
    trackRefresherPullDistance[pageKey] = 0
    trackWindowingSuspendedByRefresher[pageKey] = false
  }

  const handleTrackRefresherAbort = (pageKey: PageKey) => {
    if (refreshingPageKey.value === pageKey) {
      return
    }

    trackRefresherTriggered[pageKey] = false
    trackRefresherPullDistance[pageKey] = 0
    trackWindowingSuspendedByRefresher[pageKey] = false
  }

  return {
    resolveTrackWindowingSuspended,
    resolveTrackRefresherTriggered,
    resolveTrackRefreshIndicatorClass,
    resolveTrackRefreshIndicatorStyle,
    resolveTrackRefreshSlotState,
    resetTrackRefresherVisualState,
    resetTrackRefresherVisualStateForAllPages,
    refreshTrackPage,
    handleTrackRefresherPulling,
    handleTrackRefresherRefresh,
    handleTrackRefresherRestore,
    handleTrackRefresherAbort,
  }
}
