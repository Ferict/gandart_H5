/**
 * Responsibility: normalize the market-card image cache scope policy and decide whether the
 * persistent local cache may be used for the current image request.
 * Out of scope: image fetching, cache file lifecycle, and reveal-phase presentation behavior.
 */
export type HomeMarketCardImageCacheScopePolicy = 'public' | 'required-user'

interface ResolveHomeMarketCardImageCachePolicyInput {
  enablePersistentLocalCache: boolean
  imageCacheUserScope?: string
  cacheScopePolicy?: HomeMarketCardImageCacheScopePolicy
}

interface ResolveHomeMarketCardImageCachePolicyResult {
  canUsePersistentLocalCache: boolean
  normalizedUserScope?: string
}

export const resolveHomeMarketCardImageCachePolicy = (
  input: ResolveHomeMarketCardImageCachePolicyInput
): ResolveHomeMarketCardImageCachePolicyResult => {
  const normalizedUserScope = input.imageCacheUserScope?.trim() || undefined
  const cacheScopePolicy = input.cacheScopePolicy ?? 'public'

  if (!input.enablePersistentLocalCache) {
    return {
      canUsePersistentLocalCache: false,
      normalizedUserScope,
    }
  }

  if (cacheScopePolicy === 'required-user' && !normalizedUserScope) {
    return {
      canUsePersistentLocalCache: false,
      normalizedUserScope: undefined,
    }
  }

  return {
    canUsePersistentLocalCache: true,
    normalizedUserScope,
  }
}
