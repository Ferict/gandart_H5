/**
 * Responsibility: own persisted content user-scope read/write helpers on top of the cache runtime
 * gate so user-scoped snapshots can share a stable storage key.
 * Out of scope: content snapshot serialization, cache mode detection, and scene/list fetching.
 */
import { isAppContentPersistentCacheEnabled } from './contentCacheRuntime.service'

const CONTENT_USER_SCOPE_STORAGE_KEY = 'aether:content-cache:current-user-scope'

const safeGetStorageSync = (storageKey: string): string | null => {
  try {
    const rawValue = uni.getStorageSync(storageKey)
    if (typeof rawValue !== 'string') {
      return null
    }
    const normalized = rawValue.trim()
    return normalized.length > 0 ? normalized : null
  } catch {
    return null
  }
}

const safeSetStorageSync = (storageKey: string, value: string): boolean => {
  try {
    uni.setStorageSync(storageKey, value)
    return true
  } catch {
    return false
  }
}

const safeRemoveStorageSync = (storageKey: string) => {
  try {
    uni.removeStorageSync(storageKey)
  } catch {
    // no-op
  }
}

export const normalizeContentUserScope = (address?: string | null): string | null => {
  if (typeof address !== 'string') {
    return null
  }

  const normalized = address.trim().toLowerCase()
  return normalized.length > 0 ? normalized : null
}

export const resolveCurrentContentUserScope = (): string | null => {
  if (!isAppContentPersistentCacheEnabled()) {
    return null
  }

  return safeGetStorageSync(CONTENT_USER_SCOPE_STORAGE_KEY)
}

export const syncCurrentContentUserScope = (address?: string | null) => {
  const previousScope = resolveCurrentContentUserScope()
  const nextScope = normalizeContentUserScope(address)

  if (previousScope === nextScope) {
    return {
      previousScope,
      currentScope: nextScope,
      changed: false,
    }
  }

  if (!isAppContentPersistentCacheEnabled()) {
    return {
      previousScope,
      currentScope: nextScope,
      changed: previousScope !== nextScope,
    }
  }

  if (nextScope) {
    safeSetStorageSync(CONTENT_USER_SCOPE_STORAGE_KEY, nextScope)
  } else {
    safeRemoveStorageSync(CONTENT_USER_SCOPE_STORAGE_KEY)
  }

  return {
    previousScope,
    currentScope: nextScope,
    changed: previousScope !== nextScope,
  }
}

export const clearCurrentContentUserScope = (): string | null => {
  const previousScope = resolveCurrentContentUserScope()
  if (!isAppContentPersistentCacheEnabled()) {
    return previousScope
  }

  safeRemoveStorageSync(CONTENT_USER_SCOPE_STORAGE_KEY)
  return previousScope
}
