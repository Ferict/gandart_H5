/**
 * Responsibility: bridge home-rail scene/list/detail snapshots and related image cache
 * operations into the shared persistent cache layer with scope-aware helpers.
 * Out of scope: remote content fetching, page-local result-window runtime, and UI
 * presentation state assembly.
 */
import type {
  HomeRailMarketCardListResult,
  ResolveHomeRailMarketCardListInput,
} from './homeRailHomeContent.service'
import {
  buildRailContentSignature,
  type RailSceneResolvedContent,
} from './homeRailPageReloadPolicy.service'
import type {
  HomeRailProfileAssetListResult,
  ResolveHomeRailProfileAssetListInput,
} from './homeRailProfileContent.service'
import type { HomeRailActivityContent } from '../../models/home-rail/homeRailActivity.model'
import type { HomeRailHomeContent } from '../../models/home-rail/homeRailHome.model'
import type { HomeRailProfileContent } from '../../models/home-rail/homeRailProfile.model'
import type {
  ActivityDateFilterRange,
  ActivityNoticeListResult,
} from '../../models/home-rail/homeRailActivity.model'
import { isAppContentPersistentCacheEnabled } from '../content/contentCacheRuntime.service'
import { clearImageLocalCacheByUserScope } from '../content/contentImageFileCache.service'
import {
  clearContentPersistentCacheByUserScope,
  initializeContentPersistentCache,
  readContentListSnapshot,
  readContentSceneSnapshot,
  writeContentListSnapshot,
  writeContentSceneSnapshot,
} from '../content/contentPersistentCache.service'
import {
  clearCurrentContentUserScope,
  normalizeContentUserScope,
  resolveCurrentContentUserScope,
  syncCurrentContentUserScope,
} from '../content/contentUserScope.service'
import { logSafeError } from '../../utils/safeLogger.util'

export interface ActivityNoticeQuerySnapshot {
  tag?: string
  keyword?: string
  dateRange?: ActivityDateFilterRange
  page: number
  pageSize: number
}

export interface HomeRailPersistentCacheAdapter {
  hydrateHomeScene?: () => Promise<RailSceneResolvedContent<HomeRailHomeContent> | null>
  persistHomeScene?: (scene: RailSceneResolvedContent<HomeRailHomeContent>) => Promise<void> | void
  hydrateHomeMarketList?: (
    query: ResolveHomeRailMarketCardListInput
  ) => Promise<HomeRailMarketCardListResult | null>
  persistHomeMarketList?: (
    query: ResolveHomeRailMarketCardListInput,
    list: HomeRailMarketCardListResult
  ) => Promise<void> | void
  hydrateActivityScene?: () => Promise<RailSceneResolvedContent<HomeRailActivityContent> | null>
  persistActivityScene?: (
    scene: RailSceneResolvedContent<HomeRailActivityContent>
  ) => Promise<void> | void
  hydrateActivityNoticeList?: (
    query: ActivityNoticeQuerySnapshot
  ) => Promise<ActivityNoticeListResult | null>
  persistActivityNoticeList?: (
    query: ActivityNoticeQuerySnapshot,
    list: ActivityNoticeListResult
  ) => Promise<void> | void
  hydrateProfileScene?: () => Promise<RailSceneResolvedContent<HomeRailProfileContent> | null>
  persistProfileScene?: (
    scene: RailSceneResolvedContent<HomeRailProfileContent>,
    userScope?: string | null
  ) => Promise<void> | void
  hydrateProfileAssetList?: (
    query: ResolveHomeRailProfileAssetListInput
  ) => Promise<HomeRailProfileAssetListResult | null>
  persistProfileAssetList?: (
    query: ResolveHomeRailProfileAssetListInput,
    list: HomeRailProfileAssetListResult,
    userScope?: string | null
  ) => Promise<void> | void
}

let homeRailPersistentCacheAdapter: HomeRailPersistentCacheAdapter | null = null

export const registerHomeRailPersistentCacheAdapter = (adapter: HomeRailPersistentCacheAdapter) => {
  homeRailPersistentCacheAdapter = adapter
}

const HOME_RAIL_SCENE_DOMAIN_MAP = {
  home: 'home',
  activity: 'activity',
  profile: 'profile',
} as const

const HOME_RAIL_LIST_RESOURCE_MAP = {
  market: 'market_item',
  notice: 'notice',
  profileAsset: 'profile_asset',
} as const

const resolveAdapterMethod = <T extends keyof HomeRailPersistentCacheAdapter>(key: T) => {
  if (!isAppContentPersistentCacheEnabled()) {
    return null
  }
  return homeRailPersistentCacheAdapter?.[key] ?? null
}

const resolveQuerySignature = (query: unknown) => buildRailContentSignature(query)

const resolveProfileUserScopeOrNull = () => {
  return resolveCurrentContentUserScope()
}

const resolveExplicitProfileUserScopeOrNull = (userScope?: string | null) => {
  return normalizeContentUserScope(userScope)
}

const createDefaultHomeRailPersistentCacheAdapter = (): HomeRailPersistentCacheAdapter => ({
  hydrateHomeScene: async () => {
    const snapshot = readContentSceneSnapshot<HomeRailHomeContent>({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.home,
      sceneId: 'home',
    })
    if (!snapshot) {
      return null
    }
    return {
      content: snapshot.content,
      meta: {
        version: Number(snapshot.meta.version ?? 0),
        updatedAt: String(snapshot.meta.updatedAt ?? ''),
        signature: String(snapshot.meta.signature ?? buildRailContentSignature(snapshot.content)),
      },
    }
  },
  persistHomeScene: async (scene) => {
    writeContentSceneSnapshot({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.home,
      sceneId: 'home',
      content: scene.content,
      meta: {
        version: scene.meta.version,
        updatedAt: scene.meta.updatedAt,
        signature: scene.meta.signature,
      },
    })
  },
  hydrateHomeMarketList: async (query) => {
    return (
      readContentListSnapshot<HomeRailMarketCardListResult>({
        domain: HOME_RAIL_SCENE_DOMAIN_MAP.home,
        resourceType: HOME_RAIL_LIST_RESOURCE_MAP.market,
        querySignature: resolveQuerySignature(query),
        page: query.page,
      })?.result ?? null
    )
  },
  persistHomeMarketList: async (query, list) => {
    writeContentListSnapshot({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.home,
      resourceType: HOME_RAIL_LIST_RESOURCE_MAP.market,
      querySignature: resolveQuerySignature(query),
      page: query.page,
      pageSize: list.pageSize,
      result: list,
      etag: list.etag ?? null,
    })
  },
  hydrateActivityScene: async () => {
    const snapshot = readContentSceneSnapshot<HomeRailActivityContent>({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.activity,
      sceneId: 'activity',
    })
    if (!snapshot) {
      return null
    }
    return {
      content: snapshot.content,
      meta: {
        version: Number(snapshot.meta.version ?? 0),
        updatedAt: String(snapshot.meta.updatedAt ?? ''),
        signature: String(snapshot.meta.signature ?? buildRailContentSignature(snapshot.content)),
      },
    }
  },
  persistActivityScene: async (scene) => {
    writeContentSceneSnapshot({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.activity,
      sceneId: 'activity',
      content: scene.content,
      meta: {
        version: scene.meta.version,
        updatedAt: scene.meta.updatedAt,
        signature: scene.meta.signature,
      },
    })
  },
  hydrateActivityNoticeList: async (query) => {
    return (
      readContentListSnapshot<ActivityNoticeListResult>({
        domain: HOME_RAIL_SCENE_DOMAIN_MAP.activity,
        resourceType: HOME_RAIL_LIST_RESOURCE_MAP.notice,
        querySignature: resolveQuerySignature(query),
        page: query.page,
      })?.result ?? null
    )
  },
  persistActivityNoticeList: async (query, list) => {
    writeContentListSnapshot({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.activity,
      resourceType: HOME_RAIL_LIST_RESOURCE_MAP.notice,
      querySignature: resolveQuerySignature(query),
      page: query.page,
      pageSize: list.pageSize,
      result: list,
      etag: list.etag ?? null,
    })
  },
  hydrateProfileScene: async () => {
    const userScope = resolveProfileUserScopeOrNull()
    if (!userScope) {
      return null
    }
    const snapshot = readContentSceneSnapshot<HomeRailProfileContent>({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.profile,
      sceneId: 'profile',
      userScope,
    })
    if (!snapshot) {
      return null
    }
    return {
      content: snapshot.content,
      meta: {
        version: Number(snapshot.meta.version ?? 0),
        updatedAt: String(snapshot.meta.updatedAt ?? ''),
        signature: String(snapshot.meta.signature ?? buildRailContentSignature(snapshot.content)),
      },
    }
  },
  persistProfileScene: async (scene, userScope) => {
    const resolvedUserScope = resolveExplicitProfileUserScopeOrNull(userScope)
    if (!resolvedUserScope) {
      return
    }
    writeContentSceneSnapshot({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.profile,
      sceneId: 'profile',
      content: scene.content,
      userScope: resolvedUserScope,
      meta: {
        version: scene.meta.version,
        updatedAt: scene.meta.updatedAt,
        signature: scene.meta.signature,
      },
    })
  },
  hydrateProfileAssetList: async (query) => {
    const userScope = resolveProfileUserScopeOrNull()
    if (!userScope) {
      return null
    }
    return (
      readContentListSnapshot<HomeRailProfileAssetListResult>({
        domain: HOME_RAIL_SCENE_DOMAIN_MAP.profile,
        resourceType: HOME_RAIL_LIST_RESOURCE_MAP.profileAsset,
        querySignature: resolveQuerySignature(query),
        page: query.page ?? 1,
        userScope,
      })?.result ?? null
    )
  },
  persistProfileAssetList: async (query, list, userScope) => {
    const resolvedUserScope = resolveExplicitProfileUserScopeOrNull(userScope)
    if (!resolvedUserScope) {
      return
    }
    writeContentListSnapshot({
      domain: HOME_RAIL_SCENE_DOMAIN_MAP.profile,
      resourceType: HOME_RAIL_LIST_RESOURCE_MAP.profileAsset,
      querySignature: resolveQuerySignature(query),
      page: query.page ?? 1,
      pageSize: list.pageSize,
      result: list,
      etag: list.etag ?? null,
      userScope: resolvedUserScope,
    })
  },
})

export const initializeHomeRailPersistentCacheIntegration = () => {
  const initialized = initializeContentPersistentCache()
  if (!initialized) {
    homeRailPersistentCacheAdapter = null
    return false
  }

  if (!homeRailPersistentCacheAdapter) {
    registerHomeRailPersistentCacheAdapter(createDefaultHomeRailPersistentCacheAdapter())
  }
  return true
}

export const clearHomeRailPersistentCacheByUserScope = (userScope?: string) => {
  clearContentPersistentCacheByUserScope(userScope)
}

export const clearHomeRailImageLocalCacheByUserScope = (userScope?: string) => {
  clearImageLocalCacheByUserScope(userScope)
}

export const resolveCurrentHomeRailProfileUserScope = () => {
  return resolveProfileUserScopeOrNull()
}

export const transitionHomeRailProfileUserScope = (address?: string | null): string | null => {
  const nextScopeState = syncCurrentContentUserScope(address)
  if (
    nextScopeState.changed &&
    nextScopeState.previousScope &&
    nextScopeState.previousScope !== nextScopeState.currentScope
  ) {
    clearContentPersistentCacheByUserScope(nextScopeState.previousScope)
    clearImageLocalCacheByUserScope(nextScopeState.previousScope)
  }

  return nextScopeState.currentScope
}

export const clearHomeRailProfileUserCachesOnLogout = (): string | null => {
  const previousScope = clearCurrentContentUserScope()
  if (previousScope) {
    clearContentPersistentCacheByUserScope(previousScope)
    clearImageLocalCacheByUserScope(previousScope)
  }
  return previousScope
}

const hydrateFromAdapter = async <TResult = unknown>(
  key: keyof HomeRailPersistentCacheAdapter,
  ...args: unknown[]
): Promise<TResult | null> => {
  const method = resolveAdapterMethod(key)
  if (!method) {
    return null
  }
  try {
    return (await (method as (...input: unknown[]) => Promise<unknown>)(...args)) as TResult | null
  } catch (error) {
    logSafeError('homeRail.persistentCache', error, {
      message: `failed to hydrate ${String(key)}`,
    })
    return null
  }
}

const persistToAdapter = async (key: keyof HomeRailPersistentCacheAdapter, ...args: unknown[]) => {
  const method = resolveAdapterMethod(key)
  if (!method) {
    return
  }
  try {
    await (method as (...input: unknown[]) => Promise<unknown> | unknown)(...args)
  } catch (error) {
    logSafeError('homeRail.persistentCache', error, {
      message: `failed to persist ${String(key)}`,
    })
  }
}

export const hydrateHomeSceneFromPersistentCache = () =>
  hydrateFromAdapter<RailSceneResolvedContent<HomeRailHomeContent>>('hydrateHomeScene')

export const persistHomeSceneToPersistentCache = (
  scene: RailSceneResolvedContent<HomeRailHomeContent>
) => persistToAdapter('persistHomeScene', scene)

export const hydrateHomeMarketListFromPersistentCache = (
  query: ResolveHomeRailMarketCardListInput
) => hydrateFromAdapter<HomeRailMarketCardListResult>('hydrateHomeMarketList', query)

export const persistHomeMarketListToPersistentCache = (
  query: ResolveHomeRailMarketCardListInput,
  list: HomeRailMarketCardListResult
) => persistToAdapter('persistHomeMarketList', query, list)

export const hydrateActivitySceneFromPersistentCache = () =>
  hydrateFromAdapter<RailSceneResolvedContent<HomeRailActivityContent>>('hydrateActivityScene')

export const persistActivitySceneToPersistentCache = (
  scene: RailSceneResolvedContent<HomeRailActivityContent>
) => persistToAdapter('persistActivityScene', scene)

export const hydrateActivityNoticeListFromPersistentCache = (query: ActivityNoticeQuerySnapshot) =>
  hydrateFromAdapter<ActivityNoticeListResult>('hydrateActivityNoticeList', query)

export const persistActivityNoticeListToPersistentCache = (
  query: ActivityNoticeQuerySnapshot,
  list: ActivityNoticeListResult
) => persistToAdapter('persistActivityNoticeList', query, list)

export const hydrateProfileSceneFromPersistentCache = () =>
  hydrateFromAdapter<RailSceneResolvedContent<HomeRailProfileContent>>('hydrateProfileScene')

export const persistProfileSceneToPersistentCache = (
  scene: RailSceneResolvedContent<HomeRailProfileContent>,
  userScope?: string | null
) => persistToAdapter('persistProfileScene', scene, userScope)

export const hydrateProfileAssetListFromPersistentCache = (
  query: ResolveHomeRailProfileAssetListInput
) => hydrateFromAdapter<HomeRailProfileAssetListResult>('hydrateProfileAssetList', query)

export const persistProfileAssetListToPersistentCache = (
  query: ResolveHomeRailProfileAssetListInput,
  list: HomeRailProfileAssetListResult,
  userScope?: string | null
) => persistToAdapter('persistProfileAssetList', query, list, userScope)
