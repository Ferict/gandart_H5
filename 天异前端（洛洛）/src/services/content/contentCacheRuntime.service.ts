/**
 * Responsibility: resolve the current content-cache runtime mode and expose the app-only gating
 * helpers used by persistent cache features.
 * Out of scope: cache storage I/O, user-scope persistence, and content snapshot reads/writes.
 */
export type ContentCacheRuntimeMode = 'app' | 'h5'

const CONTENT_CACHE_RUNTIME_APP_PREFIX = 'app'

let contentCacheRuntimeModeOverride: ContentCacheRuntimeMode | null = null

const resolvePlatformFromEnv = (): string | null => {
  const viteEnv = (import.meta as unknown as { env?: Record<string, unknown> }).env
  const rawVitePlatform = viteEnv?.UNI_PLATFORM
  if (typeof rawVitePlatform === 'string' && rawVitePlatform.trim().length > 0) {
    return rawVitePlatform.trim().toLowerCase()
  }

  const processEnv = (globalThis as { process?: { env?: Record<string, unknown> } }).process?.env
  const rawProcessPlatform = processEnv?.UNI_PLATFORM
  if (typeof rawProcessPlatform === 'string' && rawProcessPlatform.trim().length > 0) {
    return rawProcessPlatform.trim().toLowerCase()
  }

  return null
}

const resolveModeByPlatform = (platform: string | null): ContentCacheRuntimeMode | null => {
  if (!platform) {
    return null
  }

  if (platform === 'h5') {
    return 'h5'
  }

  if (platform.startsWith(CONTENT_CACHE_RUNTIME_APP_PREFIX)) {
    return 'app'
  }

  return null
}

export const resolveContentCacheRuntimeMode = (): ContentCacheRuntimeMode => {
  if (contentCacheRuntimeModeOverride) {
    return contentCacheRuntimeModeOverride
  }

  const modeByPlatform = resolveModeByPlatform(resolvePlatformFromEnv())
  if (modeByPlatform) {
    return modeByPlatform
  }

  const maybePlus = (globalThis as { plus?: unknown }).plus
  if (typeof maybePlus !== 'undefined') {
    return 'app'
  }

  return 'h5'
}

export const isAppContentPersistentCacheEnabled = (): boolean => {
  return resolveContentCacheRuntimeMode() === 'app'
}

export const __setContentCacheRuntimeModeForTest = (mode: ContentCacheRuntimeMode | null) => {
  contentCacheRuntimeModeOverride = mode
}
