/**
 * Responsibility: declare the persistent cache record shapes shared by content scene, list,
 * and resource snapshot storage across cache domains.
 * Out of scope: cache IO behavior, schema migration execution, and provider-specific serialization.
 */
export type ContentCacheDomain = 'home' | 'activity' | 'profile' | string

export interface ContentSceneSnapshotMeta {
  version?: number
  updatedAt?: string
  signature?: string
}

export interface ContentSceneSnapshotRecord<TContent> {
  domain: ContentCacheDomain
  sceneId: string
  userScope: string
  schemaVersion: string
  savedAt: string
  meta: ContentSceneSnapshotMeta
  content: TContent
}

export interface ContentListSnapshotMeta {
  etag?: string | null
  cursor?: string | null
  version?: number | string | null
  querySignature: string
  page: number
  pageSize: number
}

export interface ContentListSnapshotRecord<TResult> {
  domain: ContentCacheDomain
  resourceType: string
  userScope: string
  schemaVersion: string
  savedAt: string
  meta: ContentListSnapshotMeta
  result: TResult
}

export interface ContentResourceSnapshotMeta {
  etag?: string | null
  cursor?: string | null
  version?: number | string | null
  updatedAt?: string
}

export interface ContentResourceSnapshotRecord<TResource> {
  resourceType: string
  resourceId: string
  userScope: string
  schemaVersion: string
  savedAt: string
  meta: ContentResourceSnapshotMeta
  resource: TResource
}

export interface ContentImageCacheRecord {
  remoteUrl: string
  localPath: string
  userScope: string
  schemaVersion: string
  savedAt: string
  lastHitAt: string
}
