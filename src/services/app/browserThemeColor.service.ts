/**
 * Responsibility: keep browser chrome theme-color hints aligned with the active page background.
 * Out of scope: feature theme selection, native status-bar APIs, and platform-specific app shells.
 */

const THEME_COLOR_FALLBACK = '#fafafa'
const AETHER_PAGE_BACKGROUND_TOKEN = '--aether-page-background'
const RGB_COLOR_PATTERN = /^rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*[\d.]+)?\)$/i
const HEX_COLOR_PATTERN = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i
const DARK_LUMINANCE_THRESHOLD = 0.42

let themeColorObserver: MutationObserver | undefined
let themeColorRafId = 0
let themeColorMediaQuery: MediaQueryList | undefined

const hasBrowserDocument = () => typeof window !== 'undefined' && typeof document !== 'undefined'

const ensureNamedMeta = (name: string, fallbackContent: string): HTMLMetaElement | undefined => {
  if (!hasBrowserDocument()) {
    return undefined
  }

  const existing = document.head.querySelector<HTMLMetaElement>(`meta[name="${name}"]`)
  if (existing) {
    return existing
  }

  const meta = document.createElement('meta')
  meta.setAttribute('name', name)
  meta.setAttribute('content', fallbackContent)
  document.head.appendChild(meta)
  return meta
}

const expandHexColor = (hexColor: string): string => {
  const normalized = hexColor.toLowerCase()
  if (normalized.length === 7) {
    return normalized
  }

  const [, r, g, b] = normalized
  return `#${r}${r}${g}${g}${b}${b}`
}

const clampColorChannel = (value: number): number => Math.min(255, Math.max(0, value))

const toHexChannel = (value: number): string => {
  return clampColorChannel(value).toString(16).padStart(2, '0')
}

const normalizeCssColor = (color: string): string => {
  const normalized = color.trim()
  if (!normalized) {
    return THEME_COLOR_FALLBACK
  }

  if (HEX_COLOR_PATTERN.test(normalized)) {
    return expandHexColor(normalized)
  }

  const rgbMatch = normalized.match(RGB_COLOR_PATTERN)
  if (!rgbMatch) {
    return normalized
  }

  const [, red, green, blue] = rgbMatch
  return `#${toHexChannel(Number(red))}${toHexChannel(Number(green))}${toHexChannel(Number(blue))}`
}

const parseHexColorChannels = (color: string): [number, number, number] | undefined => {
  if (!HEX_COLOR_PATTERN.test(color)) {
    return undefined
  }

  const normalized = expandHexColor(color).slice(1)
  return [
    Number.parseInt(normalized.slice(0, 2), 16),
    Number.parseInt(normalized.slice(2, 4), 16),
    Number.parseInt(normalized.slice(4, 6), 16),
  ]
}

const calculateRelativeLuminance = ([red, green, blue]: [number, number, number]): number => {
  const [r, g, b] = [red, green, blue].map((channel) => {
    const normalized = channel / 255
    return normalized <= 0.03928 ? normalized / 12.92 : ((normalized + 0.055) / 1.055) ** 2.4
  })

  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

const isDarkThemeColor = (color: string): boolean => {
  const channels = parseHexColorChannels(color)
  if (!channels) {
    return false
  }

  return calculateRelativeLuminance(channels) < DARK_LUMINANCE_THRESHOLD
}

const resolveThemeSourceElement = (): HTMLElement => {
  const themedPage = document.querySelector<HTMLElement>('page[data-aether-theme]')
  if (themedPage) {
    return themedPage
  }

  const themedElement = document.querySelector<HTMLElement>('[data-aether-theme]')
  if (themedElement) {
    return themedElement
  }

  const pageElement = document.querySelector<HTMLElement>('page')
  return pageElement ?? document.documentElement
}

const resolvePageBackgroundColor = (): string => {
  const source = resolveThemeSourceElement()
  const probe = document.createElement('span')
  probe.style.cssText = [
    'position:absolute',
    'width:0',
    'height:0',
    'overflow:hidden',
    'pointer-events:none',
    'visibility:hidden',
    `color:var(${AETHER_PAGE_BACKGROUND_TOKEN}, ${THEME_COLOR_FALLBACK})`,
  ].join(';')

  source.appendChild(probe)
  const resolvedColor = window.getComputedStyle(probe).color
  probe.remove()

  return normalizeCssColor(resolvedColor || THEME_COLOR_FALLBACK)
}

const applyBrowserThemeColor = () => {
  if (!hasBrowserDocument()) {
    return
  }

  const themeColor = resolvePageBackgroundColor()
  ensureNamedMeta('theme-color', THEME_COLOR_FALLBACK)?.setAttribute('content', themeColor)
  ensureNamedMeta('apple-mobile-web-app-capable', 'yes')?.setAttribute('content', 'yes')
  ensureNamedMeta('apple-mobile-web-app-status-bar-style', 'default')?.setAttribute(
    'content',
    isDarkThemeColor(themeColor) ? 'black-translucent' : 'default'
  )
}

const scheduleBrowserThemeColorApply = () => {
  if (!hasBrowserDocument() || themeColorRafId) {
    return
  }

  themeColorRafId = window.requestAnimationFrame(() => {
    themeColorRafId = 0
    applyBrowserThemeColor()
  })
}

export const initializeBrowserThemeColorSync = () => {
  if (!hasBrowserDocument()) {
    return
  }

  scheduleBrowserThemeColorApply()

  if (!themeColorObserver) {
    themeColorObserver = new MutationObserver(scheduleBrowserThemeColorApply)
    themeColorObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'style', 'data-aether-theme'],
      subtree: true,
    })
  }

  if (!themeColorMediaQuery && typeof window.matchMedia === 'function') {
    themeColorMediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    themeColorMediaQuery.addEventListener?.('change', scheduleBrowserThemeColorApply)
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', scheduleBrowserThemeColorApply, { once: true })
  }

  window.setTimeout(scheduleBrowserThemeColorApply, 0)
  window.setTimeout(scheduleBrowserThemeColorApply, 120)
  window.setTimeout(scheduleBrowserThemeColorApply, 600)
}
