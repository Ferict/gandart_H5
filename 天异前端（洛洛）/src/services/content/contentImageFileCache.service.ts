/**
 * Responsibility: manage scope-aware image file cache records, key generation, and
 * persistence helpers for content-domain image snapshots.
 * Out of scope: business-specific image selection, page refresh orchestration, and UI
 * reveal or placeholder behavior.
 */
import type { ContentImageCacheRecord } from '../../models/content/contentPersistentCache.model'
import { isAppContentPersistentCacheEnabled } from './contentCacheRuntime.service'

const CONTENT_IMAGE_CACHE_PREFIX = 'aether:image-file-cache'
const CONTENT_IMAGE_CACHE_SCHEMA_VERSION = 'v1'

const CONTENT_IMAGE_SAVE_TIMEOUT_MS = 12000
const CONTENT_IMAGE_CACHE_MAX_ENTRIES_PER_SCOPE = 256

type CacheSource = 'local' | 'remote'

interface ResolveImageCacheUriResult {
  uri: string
  source: CacheSource
}

interface CacheImageWritebackResult {
  localPath: string | null
  wroteBack: boolean
}

const inFlightWritebackMap = new Map<string, Promise<CacheImageWritebackResult>>()

const resolveNowIso = () => new Date().toISOString()

const safeGetStorageSync = <T>(storageKey: string): T | null => {
  try {
    const raw = uni.getStorageSync(storageKey)
    if (raw === '' || raw == null) {
      return null
    }
    return raw as T
  } catch {
    return null
  }
}

const safeSetStorageSync = (storageKey: string, value: unknown): boolean => {
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

const safeRemoveSavedFile = (filePath: string) => {
  if (!filePath.trim()) {
    return
  }

  const typedUni = uni as unknown as {
    removeSavedFile?: (options: { filePath: string; complete?: () => void }) => void
  }
  typedUni.removeSavedFile?.({
    filePath,
  })
}

const resolveScopeIndexStorageKey = (userScope: string) => {
  return `${CONTENT_IMAGE_CACHE_PREFIX}:${CONTENT_IMAGE_CACHE_SCHEMA_VERSION}:scope:${userScope}:index`
}

const normalizeUserScope = (userScope?: string): string => {
  const normalized = userScope?.trim()
  if (!normalized) {
    return 'public'
  }
  return normalized.toLowerCase()
}

const hashRemoteUrl = (remoteUrl: string): string => {
  let hash = 2166136261
  for (let index = 0; index < remoteUrl.length; index += 1) {
    hash ^= remoteUrl.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }
  return (hash >>> 0).toString(16)
}

const resolveImageStorageKey = (input: { remoteUrl: string; userScope: string }) => {
  return `${CONTENT_IMAGE_CACHE_PREFIX}:${CONTENT_IMAGE_CACHE_SCHEMA_VERSION}:scope:${input.userScope}:url:${hashRemoteUrl(
    input.remoteUrl
  )}`
}

const appendScopeIndexStorageKey = (userScope: string, storageKey: string) => {
  const scopeIndexStorageKey = resolveScopeIndexStorageKey(userScope)
  const currentIndex = safeGetStorageSync<string[]>(scopeIndexStorageKey) ?? []
  if (currentIndex.includes(storageKey)) {
    return
  }
  safeSetStorageSync(scopeIndexStorageKey, [...currentIndex, storageKey])
}

const removeScopeIndexStorageKey = (userScope: string, storageKey: string) => {
  const scopeIndexStorageKey = resolveScopeIndexStorageKey(userScope)
  const currentIndex = safeGetStorageSync<string[]>(scopeIndexStorageKey) ?? []
  if (!currentIndex.length) {
    return
  }
  const nextIndex = currentIndex.filter((item) => item !== storageKey)
  if (nextIndex.length > 0) {
    safeSetStorageSync(scopeIndexStorageKey, nextIndex)
    return
  }
  safeRemoveStorageSync(scopeIndexStorageKey)
}

const resolveStoredImageRecord = (input: { remoteUrl: string; userScope: string }) => {
  const storageKey = resolveImageStorageKey(input)
  const record = safeGetStorageSync<ContentImageCacheRecord>(storageKey)
  if (!record || record.remoteUrl !== input.remoteUrl) {
    return null
  }
  return {
    storageKey,
    record,
  }
}

const resolveScopeImageStorageKeys = (userScope: string): string[] => {
  return safeGetStorageSync<string[]>(resolveScopeIndexStorageKey(userScope)) ?? []
}

const removeStoredImageRecord = (input: { storageKey: string; userScope: string }) => {
  const record = safeGetStorageSync<ContentImageCacheRecord>(input.storageKey)
  if (record?.localPath) {
    safeRemoveSavedFile(record.localPath)
  }
  safeRemoveStorageSync(input.storageKey)
  removeScopeIndexStorageKey(input.userScope, input.storageKey)
}

const trimImageLocalCacheByUserScope = (input: {
  userScope: string
  preserveStorageKey?: string | null
}) => {
  const scopeStorageKeys = resolveScopeImageStorageKeys(input.userScope)
  if (scopeStorageKeys.length <= CONTENT_IMAGE_CACHE_MAX_ENTRIES_PER_SCOPE) {
    return
  }

  const evictableEntries = scopeStorageKeys
    .map((storageKey) => ({
      storageKey,
      record: safeGetStorageSync<ContentImageCacheRecord>(storageKey),
    }))
    .filter(
      (entry): entry is { storageKey: string; record: ContentImageCacheRecord } =>
        Boolean(entry.record) && entry.storageKey !== input.preserveStorageKey
    )
    .sort((left, right) => {
      const leftKey = Date.parse(left.record.lastHitAt || left.record.savedAt || '') || 0
      const rightKey = Date.parse(right.record.lastHitAt || right.record.savedAt || '') || 0
      return leftKey - rightKey
    })

  let overflowCount = scopeStorageKeys.length - CONTENT_IMAGE_CACHE_MAX_ENTRIES_PER_SCOPE
  for (const entry of evictableEntries) {
    if (overflowCount <= 0) {
      break
    }
    removeStoredImageRecord({
      storageKey: entry.storageKey,
      userScope: input.userScope,
    })
    overflowCount -= 1
  }
}

const isHttpImageUrl = (imageUrl: string): boolean => {
  const normalized = imageUrl.trim().toLowerCase()
  return normalized.startsWith('http://') || normalized.startsWith('https://')
}

const probeSavedFile = (filePath: string): Promise<boolean> => {
  return new Promise((resolve) => {
    const typedUni = uni as unknown as {
      getSavedFileInfo?: (options: {
        filePath: string
        success: () => void
        fail: () => void
      }) => void
    }
    if (typeof typedUni.getSavedFileInfo !== 'function') {
      resolve(false)
      return
    }

    typedUni.getSavedFileInfo({
      filePath,
      success: () => resolve(true),
      fail: () => resolve(false),
    })
  })
}

const downloadRemoteFile = (remoteUrl: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const typedUni = uni as unknown as {
      downloadFile?: (options: {
        url: string
        timeout?: number
        success: (result: { statusCode?: number; tempFilePath?: string }) => void
        fail: () => void
      }) => void
    }

    if (typeof typedUni.downloadFile !== 'function') {
      resolve(null)
      return
    }

    typedUni.downloadFile({
      url: remoteUrl,
      timeout: CONTENT_IMAGE_SAVE_TIMEOUT_MS,
      success: (result) => {
        if (result.statusCode && result.statusCode >= 200 && result.statusCode < 300) {
          resolve(result.tempFilePath?.trim() || null)
          return
        }
        resolve(null)
      },
      fail: () => resolve(null),
    })
  })
}

const saveTempFile = (tempFilePath: string): Promise<string | null> => {
  return new Promise((resolve) => {
    const typedUni = uni as unknown as {
      saveFile?: (options: {
        tempFilePath: string
        success: (result: { savedFilePath?: string }) => void
        fail: () => void
      }) => void
    }

    if (typeof typedUni.saveFile !== 'function') {
      resolve(null)
      return
    }

    typedUni.saveFile({
      tempFilePath,
      success: (result) => resolve(result.savedFilePath?.trim() || null),
      fail: () => resolve(null),
    })
  })
}

const writeImageRecord = (input: { remoteUrl: string; localPath: string; userScope: string }) => {
  const storageKey = resolveImageStorageKey({
    remoteUrl: input.remoteUrl,
    userScope: input.userScope,
  })
  const nextRecord: ContentImageCacheRecord = {
    remoteUrl: input.remoteUrl,
    localPath: input.localPath,
    userScope: input.userScope,
    schemaVersion: CONTENT_IMAGE_CACHE_SCHEMA_VERSION,
    savedAt: resolveNowIso(),
    lastHitAt: resolveNowIso(),
  }
  const succeeded = safeSetStorageSync(storageKey, nextRecord)
  if (succeeded) {
    appendScopeIndexStorageKey(input.userScope, storageKey)
    trimImageLocalCacheByUserScope({
      userScope: input.userScope,
      preserveStorageKey: storageKey,
    })
  }
  return succeeded
}

export const resolveImageUriWithLocalCache = async (input: {
  remoteUrl: string
  userScope?: string
  warmupOnMiss?: boolean
}): Promise<ResolveImageCacheUriResult> => {
  const remoteUrl = input.remoteUrl.trim()
  if (!remoteUrl) {
    return {
      uri: '',
      source: 'remote',
    }
  }

  if (!isAppContentPersistentCacheEnabled() || !isHttpImageUrl(remoteUrl)) {
    return {
      uri: remoteUrl,
      source: 'remote',
    }
  }

  const userScope = normalizeUserScope(input.userScope)
  const matched = resolveStoredImageRecord({ remoteUrl, userScope })
  if (matched) {
    const isLocalFileValid = await probeSavedFile(matched.record.localPath)
    if (isLocalFileValid) {
      const updatedRecord: ContentImageCacheRecord = {
        ...matched.record,
        lastHitAt: resolveNowIso(),
      }
      safeSetStorageSync(matched.storageKey, updatedRecord)
      return {
        uri: matched.record.localPath,
        source: 'local',
      }
    }

    safeRemoveStorageSync(matched.storageKey)
    removeScopeIndexStorageKey(userScope, matched.storageKey)
  }

  if (input.warmupOnMiss !== false) {
    void writeBackImageLocalCache({
      remoteUrl,
      userScope,
    })
  }

  return {
    uri: remoteUrl,
    source: 'remote',
  }
}

export const writeBackImageLocalCache = async (input: {
  remoteUrl: string
  userScope?: string
}): Promise<CacheImageWritebackResult> => {
  const remoteUrl = input.remoteUrl.trim()
  if (!remoteUrl || !isHttpImageUrl(remoteUrl) || !isAppContentPersistentCacheEnabled()) {
    return {
      localPath: null,
      wroteBack: false,
    }
  }

  const userScope = normalizeUserScope(input.userScope)
  const inFlightKey = `${userScope}::${remoteUrl}`
  const existingInFlight = inFlightWritebackMap.get(inFlightKey)
  if (existingInFlight) {
    return existingInFlight
  }

  const nextInFlight = (async (): Promise<CacheImageWritebackResult> => {
    const matched = resolveStoredImageRecord({ remoteUrl, userScope })
    if (matched) {
      const isLocalFileValid = await probeSavedFile(matched.record.localPath)
      if (isLocalFileValid) {
        return {
          localPath: matched.record.localPath,
          wroteBack: false,
        }
      }
      safeRemoveStorageSync(matched.storageKey)
      removeScopeIndexStorageKey(userScope, matched.storageKey)
    }

    const tempFilePath = await downloadRemoteFile(remoteUrl)
    if (!tempFilePath) {
      return {
        localPath: null,
        wroteBack: false,
      }
    }

    const savedFilePath = await saveTempFile(tempFilePath)
    if (!savedFilePath) {
      return {
        localPath: null,
        wroteBack: false,
      }
    }

    const wroteBack = writeImageRecord({
      remoteUrl,
      localPath: savedFilePath,
      userScope,
    })

    return {
      localPath: wroteBack ? savedFilePath : null,
      wroteBack,
    }
  })().finally(() => {
    inFlightWritebackMap.delete(inFlightKey)
  })

  inFlightWritebackMap.set(inFlightKey, nextInFlight)
  return nextInFlight
}

export const clearImageLocalCacheByUserScope = (userScope?: string) => {
  if (!isAppContentPersistentCacheEnabled()) {
    return
  }

  const normalizedScope = normalizeUserScope(userScope)
  resolveScopeImageStorageKeys(normalizedScope).forEach((storageKey) => {
    removeStoredImageRecord({
      storageKey,
      userScope: normalizedScope,
    })
  })
  safeRemoveStorageSync(resolveScopeIndexStorageKey(normalizedScope))
}

export const evictImageLocalCacheEntry = (input: { remoteUrl: string; userScope?: string }) => {
  if (!isAppContentPersistentCacheEnabled()) {
    return
  }

  const remoteUrl = input.remoteUrl.trim()
  if (!remoteUrl) {
    return
  }

  const userScope = normalizeUserScope(input.userScope)
  const matched = resolveStoredImageRecord({ remoteUrl, userScope })
  if (!matched) {
    return
  }

  removeStoredImageRecord({
    storageKey: matched.storageKey,
    userScope,
  })
}

export const getContentImageCacheSchemaVersion = () => CONTENT_IMAGE_CACHE_SCHEMA_VERSION

export const getContentImageCacheMaxEntriesPerScope = () =>
  CONTENT_IMAGE_CACHE_MAX_ENTRIES_PER_SCOPE
