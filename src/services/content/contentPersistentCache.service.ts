/**
 * Responsibility: manage scope-aware content snapshot persistence, read/write helpers,
 * and cache invalidation for the shared content persistent cache layer.
 * Out of scope: business fetch orchestration, page runtime switching, and image reveal
 * behavior.
 */
import type {
  ContentCacheDomain,
  ContentListSnapshotRecord,
  ContentResourceSnapshotRecord,
  ContentSceneSnapshotRecord,
} from '../../models/content/contentPersistentCache.model'
import { isAppContentPersistentCacheEnabled } from './contentCacheRuntime.service'

const CONTENT_PERSISTENT_CACHE_PREFIX = 'aether:content-cache'
const CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION = 'v1'
const CONTENT_PERSISTENT_CACHE_META_KEY = `${CONTENT_PERSISTENT_CACHE_PREFIX}:meta`

interface ContentCacheMetaRecord {
  schemaVersion: string
  updatedAt: string
}

const resolveNowIso = () => new Date().toISOString()

const safeGetStorageSync = <T>(storageKey: string): T | null => {
  try {
    const rawValue = uni.getStorageSync(storageKey)
    if (rawValue === '' || rawValue == null) {
      return null
    }
    return rawValue as T
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

const safeGetStorageKeys = (): string[] => {
  try {
    const info = uni.getStorageInfoSync()
    return Array.isArray(info.keys) ? info.keys : []
  } catch {
    return []
  }
}

const resolveScopeIndexStorageKey = (userScope: string): string => {
  return `${CONTENT_PERSISTENT_CACHE_PREFIX}:${CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION}:scope:${userScope}:index`
}

const resolveSceneStorageKey = (input: {
  domain: ContentCacheDomain
  sceneId: string
  userScope: string
}): string => {
  return `${CONTENT_PERSISTENT_CACHE_PREFIX}:${CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION}:scope:${input.userScope}:scene:${input.domain}:${input.sceneId}`
}

const resolveListStorageKey = (input: {
  domain: ContentCacheDomain
  resourceType: string
  querySignature: string
  page: number
  userScope: string
}): string => {
  return `${CONTENT_PERSISTENT_CACHE_PREFIX}:${CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION}:scope:${input.userScope}:list:${input.domain}:${input.resourceType}:${input.querySignature}:p${input.page}`
}

const resolveResourceStorageKey = (input: {
  resourceType: string
  resourceId: string
  userScope: string
}): string => {
  return `${CONTENT_PERSISTENT_CACHE_PREFIX}:${CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION}:scope:${input.userScope}:resource:${input.resourceType}:${input.resourceId}`
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

const clearLegacySchemaIfNeeded = () => {
  const currentMeta = safeGetStorageSync<ContentCacheMetaRecord>(CONTENT_PERSISTENT_CACHE_META_KEY)
  if (currentMeta?.schemaVersion === CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION) {
    return
  }

  safeGetStorageKeys().forEach((storageKey) => {
    if (!storageKey.startsWith(`${CONTENT_PERSISTENT_CACHE_PREFIX}:`)) {
      return
    }
    safeRemoveStorageSync(storageKey)
  })

  const nextMeta: ContentCacheMetaRecord = {
    schemaVersion: CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION,
    updatedAt: resolveNowIso(),
  }
  safeSetStorageSync(CONTENT_PERSISTENT_CACHE_META_KEY, nextMeta)
}

const normalizeUserScope = (userScope?: string): string => {
  const normalized = userScope?.trim()
  if (!normalized) {
    return 'public'
  }
  return normalized.toLowerCase()
}

export const initializeContentPersistentCache = (): boolean => {
  if (!isAppContentPersistentCacheEnabled()) {
    return false
  }

  clearLegacySchemaIfNeeded()
  return true
}

export const writeContentSceneSnapshot = <TContent>(input: {
  domain: ContentCacheDomain
  sceneId: string
  content: TContent
  meta?: ContentSceneSnapshotRecord<TContent>['meta']
  userScope?: string
}): boolean => {
  if (!isAppContentPersistentCacheEnabled()) {
    return false
  }

  const userScope = normalizeUserScope(input.userScope)
  const storageKey = resolveSceneStorageKey({
    domain: input.domain,
    sceneId: input.sceneId,
    userScope,
  })
  const payload: ContentSceneSnapshotRecord<TContent> = {
    domain: input.domain,
    sceneId: input.sceneId,
    userScope,
    schemaVersion: CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION,
    savedAt: resolveNowIso(),
    meta: input.meta ?? {},
    content: input.content,
  }
  const succeeded = safeSetStorageSync(storageKey, payload)
  if (succeeded) {
    appendScopeIndexStorageKey(userScope, storageKey)
  }
  return succeeded
}

export const readContentSceneSnapshot = <TContent>(input: {
  domain: ContentCacheDomain
  sceneId: string
  userScope?: string
}): ContentSceneSnapshotRecord<TContent> | null => {
  if (!isAppContentPersistentCacheEnabled()) {
    return null
  }

  const userScope = normalizeUserScope(input.userScope)
  const storageKey = resolveSceneStorageKey({
    domain: input.domain,
    sceneId: input.sceneId,
    userScope,
  })
  return safeGetStorageSync<ContentSceneSnapshotRecord<TContent>>(storageKey)
}

export const writeContentListSnapshot = <TResult>(input: {
  domain: ContentCacheDomain
  resourceType: string
  querySignature: string
  page: number
  pageSize: number
  result: TResult
  etag?: string | null
  cursor?: string | null
  version?: number | string | null
  userScope?: string
}): boolean => {
  if (!isAppContentPersistentCacheEnabled()) {
    return false
  }

  const userScope = normalizeUserScope(input.userScope)
  const storageKey = resolveListStorageKey({
    domain: input.domain,
    resourceType: input.resourceType,
    querySignature: input.querySignature,
    page: input.page,
    userScope,
  })
  const payload: ContentListSnapshotRecord<TResult> = {
    domain: input.domain,
    resourceType: input.resourceType,
    userScope,
    schemaVersion: CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION,
    savedAt: resolveNowIso(),
    meta: {
      querySignature: input.querySignature,
      page: input.page,
      pageSize: input.pageSize,
      etag: input.etag ?? null,
      cursor: input.cursor ?? null,
      version: input.version ?? null,
    },
    result: input.result,
  }
  const succeeded = safeSetStorageSync(storageKey, payload)
  if (succeeded) {
    appendScopeIndexStorageKey(userScope, storageKey)
  }
  return succeeded
}

export const readContentListSnapshot = <TResult>(input: {
  domain: ContentCacheDomain
  resourceType: string
  querySignature: string
  page: number
  userScope?: string
}): ContentListSnapshotRecord<TResult> | null => {
  if (!isAppContentPersistentCacheEnabled()) {
    return null
  }

  const userScope = normalizeUserScope(input.userScope)
  const storageKey = resolveListStorageKey({
    domain: input.domain,
    resourceType: input.resourceType,
    querySignature: input.querySignature,
    page: input.page,
    userScope,
  })
  return safeGetStorageSync<ContentListSnapshotRecord<TResult>>(storageKey)
}

export const removeContentListSnapshot = (input: {
  domain: ContentCacheDomain
  resourceType: string
  querySignature: string
  page: number
  userScope?: string
}) => {
  if (!isAppContentPersistentCacheEnabled()) {
    return
  }

  const userScope = normalizeUserScope(input.userScope)
  const storageKey = resolveListStorageKey({
    domain: input.domain,
    resourceType: input.resourceType,
    querySignature: input.querySignature,
    page: input.page,
    userScope,
  })
  safeRemoveStorageSync(storageKey)
  removeScopeIndexStorageKey(userScope, storageKey)
}

export const writeContentResourceSnapshot = <TResource>(input: {
  resourceType: string
  resourceId: string
  resource: TResource
  etag?: string | null
  cursor?: string | null
  version?: number | string | null
  updatedAt?: string
  userScope?: string
}): boolean => {
  if (!isAppContentPersistentCacheEnabled()) {
    return false
  }

  const userScope = normalizeUserScope(input.userScope)
  const storageKey = resolveResourceStorageKey({
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    userScope,
  })
  const payload: ContentResourceSnapshotRecord<TResource> = {
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    userScope,
    schemaVersion: CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION,
    savedAt: resolveNowIso(),
    meta: {
      etag: input.etag ?? null,
      cursor: input.cursor ?? null,
      version: input.version ?? null,
      updatedAt: input.updatedAt,
    },
    resource: input.resource,
  }
  const succeeded = safeSetStorageSync(storageKey, payload)
  if (succeeded) {
    appendScopeIndexStorageKey(userScope, storageKey)
  }
  return succeeded
}

export const readContentResourceSnapshot = <TResource>(input: {
  resourceType: string
  resourceId: string
  userScope?: string
}): ContentResourceSnapshotRecord<TResource> | null => {
  if (!isAppContentPersistentCacheEnabled()) {
    return null
  }

  const userScope = normalizeUserScope(input.userScope)
  const storageKey = resolveResourceStorageKey({
    resourceType: input.resourceType,
    resourceId: input.resourceId,
    userScope,
  })
  return safeGetStorageSync<ContentResourceSnapshotRecord<TResource>>(storageKey)
}

export const clearContentPersistentCacheByUserScope = (userScope?: string) => {
  if (!isAppContentPersistentCacheEnabled()) {
    return
  }

  const normalizedScope = normalizeUserScope(userScope)
  const scopeIndexStorageKey = resolveScopeIndexStorageKey(normalizedScope)
  const scopeStorageKeys = safeGetStorageSync<string[]>(scopeIndexStorageKey) ?? []
  scopeStorageKeys.forEach((storageKey) => {
    safeRemoveStorageSync(storageKey)
  })
  safeRemoveStorageSync(scopeIndexStorageKey)
}

export const clearAllContentPersistentCache = () => {
  if (!isAppContentPersistentCacheEnabled()) {
    return
  }

  safeGetStorageKeys().forEach((storageKey) => {
    if (storageKey.startsWith(`${CONTENT_PERSISTENT_CACHE_PREFIX}:`)) {
      safeRemoveStorageSync(storageKey)
    }
  })
}

export const getContentPersistentCacheSchemaVersion = () => {
  return CONTENT_PERSISTENT_CACHE_SCHEMA_VERSION
}
