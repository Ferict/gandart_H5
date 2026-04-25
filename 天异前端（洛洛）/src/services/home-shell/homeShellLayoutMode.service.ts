/**
 * Responsibility: resolve the home shell layout mode and viewport-derived shell sizing
 * policy for the current device width.
 * Out of scope: per-rail runtime, page data orchestration, and component presentation.
 */

import {
  HOME_LAYOUT_MIN_NAV_WIDTH,
  HOME_LAYOUT_MODE_SINGLE_PAGE,
  HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV,
  type LayoutMode,
} from '../../models/home-shell/homeShell.model'

export interface ViewportRuntimeContext {
  viewportWidth: number
  viewportHeight: number
  safeAreaTop: number
  safeAreaBottom: number
  hasVisualViewport: boolean
}

export interface HomeShellInsets {
  topInset: number
  bottomInset: number
}

interface HomeShellViewportSnapshot {
  runtimeContext: ViewportRuntimeContext
}

type ViewportSyncListener = () => void

interface ViewportListenerBindOptions {
  minIntervalMs?: number
}

interface UniWindowInfoCandidate {
  safeAreaInsets?: {
    top?: number
    bottom?: number
  }
  statusBarHeight?: number
  safeArea?: {
    top?: number
    bottom?: number
    height?: number
  }
  windowHeight?: number
}

const getNumberOrFallback = (value: number | undefined, fallback: number): number => {
  if (typeof value !== 'number' || !Number.isFinite(value) || value <= 0) {
    return fallback
  }

  return value
}

const HOME_LAYOUT_SWITCH_HYSTERESIS = 12
const HOME_LAYOUT_VIEWPORT_LISTENER_MIN_INTERVAL_MS = 80

const resolveViewportDimensionByPriority = (candidates: number[]): number => {
  for (const candidate of candidates) {
    if (candidate > 0) {
      return Math.round(candidate)
    }
  }
  return 0
}

export const resolveWindowViewportWidth = (currentWindow: Window): number => {
  return resolveViewportDimensionByPriority([
    getNumberOrFallback(currentWindow.innerWidth, 0),
    getNumberOrFallback(currentWindow.visualViewport?.width, 0),
    getNumberOrFallback(currentWindow.document?.documentElement?.clientWidth, 0),
  ])
}

export const resolveWindowViewportHeight = (currentWindow: Window): number => {
  return resolveViewportDimensionByPriority([
    getNumberOrFallback(currentWindow.visualViewport?.height, 0),
    getNumberOrFallback(currentWindow.innerHeight, 0),
    getNumberOrFallback(currentWindow.document?.documentElement?.clientHeight, 0),
  ])
}

export const isSingleLayoutMode = (layoutMode: LayoutMode): boolean => {
  return (
    layoutMode === HOME_LAYOUT_MODE_SINGLE_PAGE ||
    layoutMode === HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV
  )
}

export const canUseDrawerInLayoutMode = (layoutMode: LayoutMode): boolean => {
  return (
    layoutMode === HOME_LAYOUT_MODE_SINGLE_PAGE ||
    layoutMode === HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV
  )
}

export const showNavRailInLayoutMode = (layoutMode: LayoutMode): boolean => {
  return layoutMode === HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV
}

export const showBottomTabbarInLayoutMode = (_layoutMode: LayoutMode): boolean => {
  return true
}

export interface HomeShellLayoutFlags {
  isSingleMode: boolean
  canUseDrawer: boolean
  showNavRail: boolean
  showBottomTabbar: boolean
}

export interface HomeShellStageModeClassMap {
  'mode-single': boolean
  'mode-single-nav': boolean
}

export interface HomeShellPageGridClassMap {
  'is-single': boolean
}

export interface HomeShellTrackLayoutState extends HomeShellLayoutFlags {
  stageModeClass: HomeShellStageModeClassMap
  pageGridClass: HomeShellPageGridClassMap
}

export const resolveHomeShellLayoutFlags = (layoutMode: LayoutMode): HomeShellLayoutFlags => {
  const isSingleMode = isSingleLayoutMode(layoutMode)
  const canUseDrawer = canUseDrawerInLayoutMode(layoutMode)
  const showNavRail = showNavRailInLayoutMode(layoutMode)
  const showBottomTabbar = showBottomTabbarInLayoutMode(layoutMode)

  return {
    isSingleMode,
    canUseDrawer,
    showNavRail,
    showBottomTabbar,
  }
}

const resolveHomeShellStageModeClassByFlags = (
  layoutFlags: HomeShellLayoutFlags
): HomeShellStageModeClassMap => {
  return {
    'mode-single': layoutFlags.isSingleMode && !layoutFlags.showNavRail,
    'mode-single-nav': layoutFlags.showNavRail,
  }
}

const resolveHomeShellPageGridClassByFlags = (
  layoutFlags: HomeShellLayoutFlags
): HomeShellPageGridClassMap => {
  return {
    'is-single': layoutFlags.isSingleMode,
  }
}

export const resolveHomeShellStageModeClass = (
  layoutMode: LayoutMode
): HomeShellStageModeClassMap => {
  const layoutFlags = resolveHomeShellLayoutFlags(layoutMode)
  return resolveHomeShellStageModeClassByFlags(layoutFlags)
}

export const resolveHomeShellPageGridClass = (
  layoutMode: LayoutMode
): HomeShellPageGridClassMap => {
  const layoutFlags = resolveHomeShellLayoutFlags(layoutMode)
  return resolveHomeShellPageGridClassByFlags(layoutFlags)
}

export const resolveHomeShellTrackLayoutState = (
  layoutMode: LayoutMode
): HomeShellTrackLayoutState => {
  const layoutFlags = resolveHomeShellLayoutFlags(layoutMode)
  const stageModeClass = resolveHomeShellStageModeClassByFlags(layoutFlags)
  const pageGridClass = resolveHomeShellPageGridClassByFlags(layoutFlags)

  return {
    ...layoutFlags,
    stageModeClass,
    pageGridClass,
  }
}

const parseCssLengthToNumber = (rawValue: string | undefined): number => {
  if (typeof rawValue !== 'string') {
    return 0
  }

  const trimmed = rawValue.trim()
  if (!trimmed) {
    return 0
  }

  const parsed = Number.parseFloat(trimmed)
  if (!Number.isFinite(parsed)) {
    return 0
  }

  return Math.max(0, Math.round(parsed))
}

const resolveCssSafeAreaInset = (currentWindow: Window, cssVariableName: string): number => {
  const rootElement = currentWindow.document?.documentElement
  if (!rootElement) {
    return 0
  }

  const computedStyle = currentWindow.getComputedStyle(rootElement)
  return parseCssLengthToNumber(computedStyle.getPropertyValue(cssVariableName))
}

const resolveUniWindowInfo = (): UniWindowInfoCandidate | null => {
  const host = globalThis as typeof globalThis & {
    uni?: {
      getWindowInfo?: () => unknown
    }
  }

  const getWindowInfo = host.uni?.getWindowInfo
  if (typeof getWindowInfo !== 'function') {
    return null
  }

  try {
    const info = getWindowInfo()
    if (!info || typeof info !== 'object') {
      return null
    }

    return info as UniWindowInfoCandidate
  } catch {
    return null
  }
}

const resolveSafeAreaTopFromUni = (windowInfo: UniWindowInfoCandidate | null): number => {
  if (!windowInfo) {
    return 0
  }

  const safeInsetsTop = getNumberOrFallback(windowInfo.safeAreaInsets?.top, 0)
  const statusBarHeight = getNumberOrFallback(windowInfo.statusBarHeight, 0)
  const safeAreaTop = getNumberOrFallback(windowInfo.safeArea?.top, 0)

  return Math.max(safeInsetsTop, statusBarHeight, safeAreaTop)
}

const resolveSafeAreaBottomFromUni = (windowInfo: UniWindowInfoCandidate | null): number => {
  if (!windowInfo) {
    return 0
  }

  const safeInsetsBottom = getNumberOrFallback(windowInfo.safeAreaInsets?.bottom, 0)
  if (safeInsetsBottom > 0) {
    return safeInsetsBottom
  }

  const safeAreaBottom = getNumberOrFallback(windowInfo.safeArea?.bottom, 0)
  const windowHeight = getNumberOrFallback(windowInfo.windowHeight, 0)
  if (safeAreaBottom > 0 && windowHeight > 0) {
    return Math.max(0, Math.round(windowHeight - safeAreaBottom))
  }

  return 0
}

export const resolveHomeShellViewportSnapshot = (
  currentWindow: Window
): HomeShellViewportSnapshot => {
  const uniWindowInfo = resolveUniWindowInfo()
  const topInsetFromUni = resolveSafeAreaTopFromUni(uniWindowInfo)
  const bottomInsetFromUni = resolveSafeAreaBottomFromUni(uniWindowInfo)
  const topInsetFromCss = resolveCssSafeAreaInset(currentWindow, '--app-safe-area-top')
  const bottomInsetFromCss = resolveCssSafeAreaInset(currentWindow, '--app-safe-area-bottom')

  return {
    runtimeContext: {
      viewportWidth: resolveWindowViewportWidth(currentWindow),
      viewportHeight: resolveWindowViewportHeight(currentWindow),
      safeAreaTop: Math.max(topInsetFromUni, topInsetFromCss),
      safeAreaBottom: Math.max(bottomInsetFromUni, bottomInsetFromCss),
      hasVisualViewport: Boolean(currentWindow.visualViewport),
    },
  }
}

export const resolveHomeShellInsets = (runtimeContext: ViewportRuntimeContext): HomeShellInsets => {
  return {
    topInset: Math.max(0, runtimeContext.safeAreaTop),
    bottomInset: Math.max(0, runtimeContext.safeAreaBottom),
  }
}

export const bindHomeShellViewportListeners = (
  currentWindow: Window,
  listener: ViewportSyncListener,
  options?: ViewportListenerBindOptions
): (() => void) => {
  const minIntervalMs = Math.max(
    0,
    Math.round(options?.minIntervalMs ?? HOME_LAYOUT_VIEWPORT_LISTENER_MIN_INTERVAL_MS)
  )
  let animationFrameId: number | null = null
  let delayedTimerId: number | null = null
  let lastEmitTimestamp = 0

  const flushListener = () => {
    const nowTimestamp = Date.now()
    const elapsedMs = nowTimestamp - lastEmitTimestamp

    if (elapsedMs >= minIntervalMs) {
      lastEmitTimestamp = nowTimestamp
      listener()
      return
    }

    if (delayedTimerId !== null) {
      currentWindow.clearTimeout(delayedTimerId)
    }

    delayedTimerId = currentWindow.setTimeout(() => {
      delayedTimerId = null
      lastEmitTimestamp = Date.now()
      listener()
    }, minIntervalMs - elapsedMs)
  }

  const scheduleListener = () => {
    if (animationFrameId !== null) {
      return
    }

    animationFrameId = currentWindow.requestAnimationFrame(() => {
      animationFrameId = null
      flushListener()
    })
  }

  currentWindow.addEventListener('resize', scheduleListener)
  currentWindow.addEventListener('orientationchange', scheduleListener)
  const currentVisualViewport = currentWindow.visualViewport ?? null
  currentVisualViewport?.addEventListener('resize', scheduleListener)

  return () => {
    currentWindow.removeEventListener('resize', scheduleListener)
    currentWindow.removeEventListener('orientationchange', scheduleListener)
    currentVisualViewport?.removeEventListener('resize', scheduleListener)

    if (animationFrameId !== null) {
      currentWindow.cancelAnimationFrame(animationFrameId)
      animationFrameId = null
    }

    if (delayedTimerId !== null) {
      currentWindow.clearTimeout(delayedTimerId)
      delayedTimerId = null
    }
  }
}

const resolveHomeShellLayoutModeByWidth = (viewportWidth: number): LayoutMode => {
  if (viewportWidth < HOME_LAYOUT_MIN_NAV_WIDTH) {
    return HOME_LAYOUT_MODE_SINGLE_PAGE
  }

  return HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV
}

const resolveHomeShellLayoutModeWithHysteresis = (
  viewportWidth: number,
  targetMode: LayoutMode,
  previousMode?: LayoutMode
): LayoutMode => {
  if (!previousMode) {
    return targetMode
  }

  const hysteresis = HOME_LAYOUT_SWITCH_HYSTERESIS

  if (previousMode === HOME_LAYOUT_MODE_SINGLE_PAGE) {
    if (viewportWidth < HOME_LAYOUT_MIN_NAV_WIDTH + hysteresis) {
      return HOME_LAYOUT_MODE_SINGLE_PAGE
    }
    return targetMode
  }

  if (previousMode === HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV) {
    if (viewportWidth >= HOME_LAYOUT_MIN_NAV_WIDTH - hysteresis) {
      return HOME_LAYOUT_MODE_SINGLE_PAGE_WITH_NAV
    }
    return targetMode
  }

  return targetMode
}

export const resolveHomeShellLayoutMode = (
  viewportWidth: number,
  previousMode?: LayoutMode
): LayoutMode => {
  const targetMode = resolveHomeShellLayoutModeByWidth(viewportWidth)
  return resolveHomeShellLayoutModeWithHysteresis(viewportWidth, targetMode, previousMode)
}
