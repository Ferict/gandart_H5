/**
 * Responsibility: coordinate cross-rail refresh, polling, prefetch, and scope-aware
 * synchronization for the home experience across home, profile, and activity rails.
 * Out of scope: low-level content fetching, persistent cache storage internals, and
 * page-local presentation or animation runtime.
 */
import { ref } from 'vue'
import {
  HOME_ACTIVITY_PAGE_KEY,
  HOME_PRIMARY_PAGE_KEY,
  type PageKey,
} from '../../models/home-shell/homeShell.model'
import type {
  RailSceneResolvedContent,
  RailSceneResolvedMeta,
} from './homeRailPageReloadPolicy.service'
import { buildRailContentSignature } from './homeRailPageReloadPolicy.service'
import {
  buildHomeRailActivityBlockSignatures,
  resolveHomeRailActivityContent,
  resolveHomeRailActivityNoticeList,
} from './homeRailActivityContent.service'
import type {
  HomeRailActivityContent,
  ActivityNoticeListResult,
} from '../../models/home-rail/homeRailActivity.model'
import {
  buildHomeRailHomeBlockSignatures,
  resolveHomeRailHomeContent,
  resolveHomeRailMarketCardList,
  type HomeRailMarketCardListResult,
  type ResolveHomeRailMarketCardListInput,
  type HomeRailHomeSceneModuleKey,
} from './homeRailHomeContent.service'
import type { HomeRailHomeContent } from '../../models/home-rail/homeRailHome.model'
import {
  buildHomeRailProfileBlockSignatures,
  resolveHomeRailProfileContent,
  resolveHomeRailProfileAssetList,
  type ResolveHomeRailProfileAssetListInput,
  type HomeRailProfileAssetListResult,
  type HomeRailProfileSceneModuleKey,
} from './homeRailProfileContent.service'
import {
  persistActivityNoticeListToPersistentCache,
  persistActivitySceneToPersistentCache,
  persistHomeMarketListToPersistentCache,
  persistHomeSceneToPersistentCache,
  persistProfileAssetListToPersistentCache,
  persistProfileSceneToPersistentCache,
  resolveCurrentHomeRailProfileUserScope,
  transitionHomeRailProfileUserScope,
} from './homeRailPersistentCacheIntegration.service'
import type { HomeRailProfileContent } from '../../models/home-rail/homeRailProfile.model'
import type { HomeRailActivitySceneModuleKey } from './homeRailActivityContent.service'
import { COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH } from '../../pages/home/composables/shared/homeRailBatchStrategy'

const HOME_RAIL_SILENT_UPDATE_INTERVAL_MS = 120000
const isHomeRailCoordinatorDev = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

type HomeActivityNoticeListQuery = {
  tag?: string
  keyword?: string
  page: number
  pageSize: number
}

type RailListQuerySnapshot =
  | ResolveHomeRailMarketCardListInput
  | HomeActivityNoticeListQuery
  | ResolveHomeRailProfileAssetListInput

interface SceneCache<TContent, TModuleKey extends string> {
  displayedMeta: RailSceneResolvedMeta | null
  displayedContent: TContent | null
  displayedSignatures: Record<TModuleKey, string> | null
  latestMeta: RailSceneResolvedMeta | null
  latestContent: TContent | null
  latestSignatures: Record<TModuleKey, string> | null
  staleModules: TModuleKey[]
}

interface ListCache<TQuery extends RailListQuerySnapshot, TResult> {
  activeQuery: TQuery | null
  activeQueryKey: string | null
  displayedQuery: TQuery | null
  displayedQueryKey: string | null
  displayedResult: TResult | null
  displayedEtag: string | null
  displayedIsBeyondFirstTransportBatch: boolean
  latestQuery: TQuery | null
  latestQueryKey: string | null
  latestResult: TResult | null
  latestEtag: string | null
  latestIsBeyondFirstTransportBatch: boolean
  stale: boolean
}

interface HomeActivationUpdate {
  scene: RailSceneResolvedContent<HomeRailHomeContent> | null
  sceneChangedModules: HomeRailHomeSceneModuleKey[]
  marketList: HomeRailMarketCardListResult | null
}

interface ActivityActivationUpdate {
  scene: RailSceneResolvedContent<HomeRailActivityContent> | null
  sceneChangedModules: HomeRailActivitySceneModuleKey[]
  noticeList: ActivityNoticeListResult | null
  noticeListEtag?: string
}

interface ProfileActivationUpdate {
  scene: RailSceneResolvedContent<HomeRailProfileContent> | null
  sceneChangedModules: HomeRailProfileSceneModuleKey[]
  assetList: HomeRailProfileAssetListResult | null
}

const createSceneCache = <TContent, TModuleKey extends string>(): SceneCache<
  TContent,
  TModuleKey
> => ({
  displayedMeta: null,
  displayedContent: null,
  displayedSignatures: null,
  latestMeta: null,
  latestContent: null,
  latestSignatures: null,
  staleModules: [],
})

const createListCache = <TQuery extends RailListQuerySnapshot, TResult>(): ListCache<
  TQuery,
  TResult
> => ({
  activeQuery: null,
  activeQueryKey: null,
  displayedQuery: null,
  displayedQueryKey: null,
  displayedResult: null,
  displayedEtag: null,
  displayedIsBeyondFirstTransportBatch: false,
  latestQuery: null,
  latestQueryKey: null,
  latestResult: null,
  latestEtag: null,
  latestIsBeyondFirstTransportBatch: false,
  stale: false,
})

const homeSceneCache = createSceneCache<HomeRailHomeContent, HomeRailHomeSceneModuleKey>()
const homeListCache = createListCache<
  ResolveHomeRailMarketCardListInput,
  HomeRailMarketCardListResult
>()
const activitySceneCache = createSceneCache<
  HomeRailActivityContent,
  HomeRailActivitySceneModuleKey
>()
const activityListCache = createListCache<HomeActivityNoticeListQuery, ActivityNoticeListResult>()
const profileSceneCache = createSceneCache<HomeRailProfileContent, HomeRailProfileSceneModuleKey>()
const profileListCache = createListCache<
  ResolveHomeRailProfileAssetListInput,
  HomeRailProfileAssetListResult
>()

const foregroundSignal = ref(0)
const pollSignal = ref(0)
const isAppVisible = ref(true)
let coordinatorConsumerCount = 0
let pollTimer: ReturnType<typeof setInterval> | null = null
let isPolling = false

const logCoordinatorDebug = (message: string, detail?: unknown) => {
  if (!isHomeRailCoordinatorDev) {
    return
  }

  if (detail === undefined) {
    console.debug(`[homeRail][coordinator] ${message}`)
    return
  }

  console.debug(`[homeRail][coordinator] ${message}`, detail)
}

const normalizeQueryKey = (query: RailListQuerySnapshot | null): string | null => {
  if (!query) {
    return null
  }

  return buildRailContentSignature(query)
}

const diffSceneModules = <TModuleKey extends string>(
  displayed: Record<TModuleKey, string> | null,
  latest: Record<TModuleKey, string>
): TModuleKey[] => {
  if (!displayed) {
    return []
  }

  return (Object.keys(latest) as TModuleKey[]).filter((key) => displayed[key] !== latest[key])
}

const syncSceneCache = <TContent, TModuleKey extends string>(
  cache: SceneCache<TContent, TModuleKey>,
  resolved: RailSceneResolvedContent<TContent>,
  signatures: Record<TModuleKey, string>
) => {
  cache.displayedMeta = resolved.meta
  cache.displayedContent = resolved.content
  cache.displayedSignatures = signatures
  cache.latestMeta = resolved.meta
  cache.latestContent = resolved.content
  cache.latestSignatures = signatures
  cache.staleModules = []
}

const syncListCache = <TQuery extends RailListQuerySnapshot, TResult>(
  cache: ListCache<TQuery, TResult>,
  query: TQuery,
  result: TResult,
  etag?: string,
  options: { isBeyondFirstTransportBatch?: boolean } = {}
) => {
  const queryKey = normalizeQueryKey(query)
  const isBeyondFirstTransportBatch =
    options.isBeyondFirstTransportBatch ?? resolveDeepPaginatedListResult(query, result)
  cache.activeQuery = query
  cache.activeQueryKey = queryKey
  cache.displayedQuery = query
  cache.displayedQueryKey = queryKey
  cache.displayedResult = result
  cache.displayedEtag = etag ?? null
  cache.displayedIsBeyondFirstTransportBatch = isBeyondFirstTransportBatch
  cache.latestQuery = query
  cache.latestQueryKey = queryKey
  cache.latestResult = result
  cache.latestEtag = etag ?? null
  cache.latestIsBeyondFirstTransportBatch = isBeyondFirstTransportBatch
  cache.stale = false
}

const syncListQuerySnapshot = <TQuery extends RailListQuerySnapshot, TResult>(
  cache: ListCache<TQuery, TResult>,
  query: TQuery
) => {
  cache.activeQuery = query
  cache.activeQueryKey = normalizeQueryKey(query)
}

const hasMatchingListStale = <TQuery extends RailListQuerySnapshot, TResult>(
  cache: ListCache<TQuery, TResult>
) => {
  return (
    cache.stale &&
    cache.activeQueryKey !== null &&
    cache.activeQueryKey === cache.latestQueryKey &&
    cache.latestResult !== null &&
    !cache.displayedIsBeyondFirstTransportBatch
  )
}

const hasSceneStale = <TContent, TModuleKey extends string>(
  cache: SceneCache<TContent, TModuleKey>
) => {
  return cache.staleModules.length > 0 && cache.latestContent !== null && cache.latestMeta !== null
}

const updateSceneLatest = <TContent, TModuleKey extends string>(
  cache: SceneCache<TContent, TModuleKey>,
  resolved: RailSceneResolvedContent<TContent>,
  signatures: Record<TModuleKey, string>
) => {
  cache.latestMeta = resolved.meta
  cache.latestContent = resolved.content
  cache.latestSignatures = signatures
  cache.staleModules = diffSceneModules(cache.displayedSignatures, signatures)
  if (cache.staleModules.length > 0) {
    logCoordinatorDebug('scene modules marked stale', {
      version: resolved.meta.version,
      modules: cache.staleModules,
    })
  }
}

const updateListLatest = <TQuery extends RailListQuerySnapshot, TResult>(
  cache: ListCache<TQuery, TResult>,
  query: TQuery,
  result: TResult,
  etag?: string,
  options: { isBeyondFirstTransportBatch?: boolean } = {}
) => {
  const queryKey = normalizeQueryKey(query)
  const isBeyondFirstTransportBatch =
    options.isBeyondFirstTransportBatch ?? resolveDeepPaginatedListResult(query, result)
  cache.latestQuery = query
  cache.latestQueryKey = queryKey
  cache.latestResult = result
  cache.latestEtag = etag ?? null
  cache.latestIsBeyondFirstTransportBatch = isBeyondFirstTransportBatch
  cache.stale =
    cache.displayedQueryKey !== null &&
    cache.displayedQueryKey === queryKey &&
    cache.displayedEtag !== null &&
    cache.displayedEtag !== (etag ?? null)
  if (cache.stale) {
    logCoordinatorDebug('list query marked stale', {
      query,
      etag: etag ?? null,
    })
  }
}

const markSceneModulesDisplayed = <TContent, TModuleKey extends string>(
  cache: SceneCache<TContent, TModuleKey>,
  resolved: RailSceneResolvedContent<TContent>,
  signatures: Record<TModuleKey, string>,
  displayedModules: TModuleKey[]
) => {
  cache.latestMeta = resolved.meta
  cache.latestContent = resolved.content
  cache.latestSignatures = signatures
  const nextDisplayedSignatures = {
    ...(cache.displayedSignatures ?? signatures),
  }
  displayedModules.forEach((moduleKey) => {
    nextDisplayedSignatures[moduleKey] = signatures[moduleKey]
  })
  cache.displayedMeta = resolved.meta
  cache.displayedContent = resolved.content
  cache.displayedSignatures = nextDisplayedSignatures
  cache.staleModules = diffSceneModules(nextDisplayedSignatures, signatures)
}

const resolveDeepPaginatedListResult = (query: RailListQuerySnapshot, result: unknown) => {
  if (
    typeof query.pageSize !== 'number' ||
    !Number.isFinite(query.pageSize) ||
    query.pageSize <= 0 ||
    !result ||
    typeof result !== 'object'
  ) {
    return false
  }

  if (!('items' in result) || !Array.isArray((result as { items?: unknown }).items)) {
    return false
  }

  return (
    (result as { items: unknown[] }).items.length >
    query.pageSize * COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH
  )
}

const prefetchHomeScene = async () => {
  if (!homeSceneCache.displayedMeta) {
    return
  }

  const resolved = await resolveHomeRailHomeContent({ force: true })
  updateSceneLatest(homeSceneCache, resolved, buildHomeRailHomeBlockSignatures(resolved.content))
  await persistHomeSceneToPersistentCache(resolved)
}

const prefetchActivityScene = async () => {
  if (!activitySceneCache.displayedMeta) {
    return
  }

  const resolved = await resolveHomeRailActivityContent({ force: true })
  updateSceneLatest(
    activitySceneCache,
    resolved,
    buildHomeRailActivityBlockSignatures(resolved.content)
  )
  await persistActivitySceneToPersistentCache(resolved)
}

const prefetchProfileScene = async () => {
  if (!profileSceneCache.displayedMeta) {
    return
  }

  const resolved = await resolveHomeRailProfileContent({ force: true })
  const requestUserScope = transitionHomeRailProfileUserScope(resolved.content.summary.address)
  updateSceneLatest(
    profileSceneCache,
    resolved,
    buildHomeRailProfileBlockSignatures(resolved.content)
  )
  await persistProfileSceneToPersistentCache(resolved, requestUserScope)
}

const prefetchHomeList = async () => {
  if (!homeListCache.activeQuery || !homeListCache.activeQueryKey) {
    return
  }

  const result = await resolveHomeRailMarketCardList(homeListCache.activeQuery, {
    ifNoneMatch:
      homeListCache.latestQueryKey === homeListCache.activeQueryKey
        ? (homeListCache.latestEtag ?? undefined)
        : homeListCache.displayedQueryKey === homeListCache.activeQueryKey
          ? (homeListCache.displayedEtag ?? undefined)
          : undefined,
  })
  if (result.notModified) {
    return
  }

  updateListLatest(homeListCache, homeListCache.activeQuery, result, result.etag)
  await persistHomeMarketListToPersistentCache(homeListCache.activeQuery, result)
}

const prefetchActivityList = async () => {
  if (!activityListCache.activeQuery || !activityListCache.activeQueryKey) {
    return
  }

  const result = await resolveHomeRailActivityNoticeList({
    ...activityListCache.activeQuery,
    ifNoneMatch:
      activityListCache.latestQueryKey === activityListCache.activeQueryKey
        ? (activityListCache.latestEtag ?? undefined)
        : activityListCache.displayedQueryKey === activityListCache.activeQueryKey
          ? (activityListCache.displayedEtag ?? undefined)
          : undefined,
  })
  if (result.notModified) {
    return
  }

  updateListLatest(activityListCache, activityListCache.activeQuery, result, result.etag)
  await persistActivityNoticeListToPersistentCache(activityListCache.activeQuery, result)
}

const prefetchProfileList = async () => {
  if (!profileListCache.activeQuery || !profileListCache.activeQueryKey) {
    return
  }

  const requestUserScope = resolveCurrentHomeRailProfileUserScope()
  const result = await resolveHomeRailProfileAssetList(profileListCache.activeQuery, {
    ifNoneMatch:
      profileListCache.latestQueryKey === profileListCache.activeQueryKey
        ? (profileListCache.latestEtag ?? undefined)
        : profileListCache.displayedQueryKey === profileListCache.activeQueryKey
          ? (profileListCache.displayedEtag ?? undefined)
          : undefined,
  })
  if (result.notModified) {
    return
  }

  updateListLatest(profileListCache, profileListCache.activeQuery, result, result.etag)
  await persistProfileAssetListToPersistentCache(
    profileListCache.activeQuery,
    result,
    requestUserScope
  )
}

const runCoordinatorPoll = async () => {
  if (isPolling) {
    return
  }

  isPolling = true
  try {
    await Promise.allSettled([
      prefetchHomeScene(),
      prefetchHomeList(),
      prefetchActivityScene(),
      prefetchActivityList(),
      prefetchProfileScene(),
      prefetchProfileList(),
    ])
    pollSignal.value += 1
  } finally {
    isPolling = false
  }
}

const ensureCoordinatorPollTimer = () => {
  if (pollTimer) {
    return
  }

  pollTimer = setInterval(() => {
    void runCoordinatorPoll()
  }, HOME_RAIL_SILENT_UPDATE_INTERVAL_MS)
}

const clearCoordinatorPollTimer = () => {
  if (!pollTimer) {
    return
  }

  clearInterval(pollTimer)
  pollTimer = null
}

export const startHomeRailUpdateCoordinator = () => {
  coordinatorConsumerCount += 1
  ensureCoordinatorPollTimer()
}

export const stopHomeRailUpdateCoordinator = () => {
  coordinatorConsumerCount = Math.max(0, coordinatorConsumerCount - 1)
  if (coordinatorConsumerCount === 0) {
    clearCoordinatorPollTimer()
  }
}

export const markHomeRailAppShown = () => {
  isAppVisible.value = true
  void (async () => {
    await runCoordinatorPoll()
    foregroundSignal.value += 1
  })()
}

export const markHomeRailAppHidden = () => {
  isAppVisible.value = false
}

export const useHomeRailForegroundSignal = () => foregroundSignal

export const useHomeRailPollSignal = () => pollSignal

export const syncHomeRailHomeSceneSnapshot = (
  resolved: RailSceneResolvedContent<HomeRailHomeContent>
) => {
  syncSceneCache(homeSceneCache, resolved, buildHomeRailHomeBlockSignatures(resolved.content))
}

export const markHomeRailHomeSceneModulesDisplayed = (
  resolved: RailSceneResolvedContent<HomeRailHomeContent>,
  modules: HomeRailHomeSceneModuleKey[]
) => {
  markSceneModulesDisplayed(
    homeSceneCache,
    resolved,
    buildHomeRailHomeBlockSignatures(resolved.content),
    modules
  )
}

export const syncHomeRailHomeMarketQuerySnapshot = (query: ResolveHomeRailMarketCardListInput) => {
  syncListQuerySnapshot(homeListCache, query)
}

export const syncHomeRailHomeMarketListSnapshot = (
  query: ResolveHomeRailMarketCardListInput,
  result: HomeRailMarketCardListResult,
  etag?: string,
  options: { isBeyondFirstTransportBatch?: boolean } = {}
) => {
  syncListCache(homeListCache, query, result, etag, options)
}

export const syncHomeRailActivitySceneSnapshot = (
  resolved: RailSceneResolvedContent<HomeRailActivityContent>
) => {
  syncSceneCache(
    activitySceneCache,
    resolved,
    buildHomeRailActivityBlockSignatures(resolved.content)
  )
}

export const markHomeRailActivitySceneModulesDisplayed = (
  resolved: RailSceneResolvedContent<HomeRailActivityContent>,
  modules: HomeRailActivitySceneModuleKey[]
) => {
  markSceneModulesDisplayed(
    activitySceneCache,
    resolved,
    buildHomeRailActivityBlockSignatures(resolved.content),
    modules
  )
}

export const syncHomeRailActivityNoticeQuerySnapshot = (query: HomeActivityNoticeListQuery) => {
  syncListQuerySnapshot(activityListCache, query)
}

export const syncHomeRailActivityNoticeListSnapshot = (
  query: HomeActivityNoticeListQuery,
  result: ActivityNoticeListResult,
  etag?: string
) => {
  syncListCache(activityListCache, query, result, etag)
}

export const syncHomeRailProfileSceneSnapshot = (
  resolved: RailSceneResolvedContent<HomeRailProfileContent>
) => {
  syncSceneCache(profileSceneCache, resolved, buildHomeRailProfileBlockSignatures(resolved.content))
}

export const markHomeRailProfileSceneModulesDisplayed = (
  resolved: RailSceneResolvedContent<HomeRailProfileContent>,
  modules: HomeRailProfileSceneModuleKey[]
) => {
  markSceneModulesDisplayed(
    profileSceneCache,
    resolved,
    buildHomeRailProfileBlockSignatures(resolved.content),
    modules
  )
}

export const syncHomeRailProfileAssetQuerySnapshot = (
  query: ResolveHomeRailProfileAssetListInput
) => {
  syncListQuerySnapshot(profileListCache, query)
}

export const syncHomeRailProfileAssetListSnapshot = (
  query: ResolveHomeRailProfileAssetListInput,
  result: HomeRailProfileAssetListResult,
  etag?: string,
  options: { isBeyondFirstTransportBatch?: boolean } = {}
) => {
  syncListCache(profileListCache, query, result, etag, options)
}

export const resolveHomeRailHomeActivationUpdate = async (
  options: { allowNetworkFallback?: boolean } = {}
): Promise<HomeActivationUpdate> => {
  const allowNetworkFallback = options.allowNetworkFallback !== false
  let scene: RailSceneResolvedContent<HomeRailHomeContent> | null = null
  let sceneChangedModules: HomeRailHomeSceneModuleKey[] = []
  if (hasSceneStale(homeSceneCache)) {
    scene = {
      content: homeSceneCache.latestContent as HomeRailHomeContent,
      meta: homeSceneCache.latestMeta as RailSceneResolvedMeta,
    }
    sceneChangedModules = [...homeSceneCache.staleModules]
  } else if (allowNetworkFallback && homeSceneCache.displayedMeta) {
    const resolved = await resolveHomeRailHomeContent({ force: true })
    const signatures = buildHomeRailHomeBlockSignatures(resolved.content)
    const changedModules = diffSceneModules(homeSceneCache.displayedSignatures, signatures)
    updateSceneLatest(homeSceneCache, resolved, signatures)
    if (changedModules.length) {
      scene = resolved
      sceneChangedModules = changedModules
    }
  }

  let marketList: HomeRailMarketCardListResult | null = null
  if (hasMatchingListStale(homeListCache)) {
    marketList = homeListCache.latestResult
  } else if (allowNetworkFallback && homeListCache.activeQuery) {
    const result = await resolveHomeRailMarketCardList(homeListCache.activeQuery, {
      ifNoneMatch: homeListCache.displayedEtag ?? undefined,
    })
    if (!result.notModified) {
      updateListLatest(homeListCache, homeListCache.activeQuery, result, result.etag)
      if (!homeListCache.displayedIsBeyondFirstTransportBatch) {
        marketList = result
      }
    }
  }

  return {
    scene,
    sceneChangedModules,
    marketList,
  }
}

export const resolveHomeRailHomeVisibleUpdate = (): HomeActivationUpdate => ({
  scene: hasSceneStale(homeSceneCache)
    ? {
        content: homeSceneCache.latestContent as HomeRailHomeContent,
        meta: homeSceneCache.latestMeta as RailSceneResolvedMeta,
      }
    : null,
  sceneChangedModules: hasSceneStale(homeSceneCache) ? [...homeSceneCache.staleModules] : [],
  marketList: hasMatchingListStale(homeListCache) ? homeListCache.latestResult : null,
})

export const resolveHomeRailActivityActivationUpdate = async (
  options: { allowNetworkFallback?: boolean } = {}
): Promise<ActivityActivationUpdate> => {
  const allowNetworkFallback = options.allowNetworkFallback !== false
  let scene: RailSceneResolvedContent<HomeRailActivityContent> | null = null
  let sceneChangedModules: HomeRailActivitySceneModuleKey[] = []
  if (hasSceneStale(activitySceneCache)) {
    scene = {
      content: activitySceneCache.latestContent as HomeRailActivityContent,
      meta: activitySceneCache.latestMeta as RailSceneResolvedMeta,
    }
    sceneChangedModules = [...activitySceneCache.staleModules]
  } else if (allowNetworkFallback && activitySceneCache.displayedMeta) {
    const resolved = await resolveHomeRailActivityContent({ force: true })
    const signatures = buildHomeRailActivityBlockSignatures(resolved.content)
    const changedModules = diffSceneModules(activitySceneCache.displayedSignatures, signatures)
    updateSceneLatest(activitySceneCache, resolved, signatures)
    if (changedModules.length) {
      scene = resolved
      sceneChangedModules = changedModules
    }
  }

  let noticeList: ActivityNoticeListResult | null = null
  let noticeListEtag: string | undefined
  if (hasMatchingListStale(activityListCache)) {
    noticeList = activityListCache.latestResult
    noticeListEtag = activityListCache.latestEtag ?? undefined
  } else if (allowNetworkFallback && activityListCache.activeQuery) {
    const result = await resolveHomeRailActivityNoticeList({
      ...activityListCache.activeQuery,
      ifNoneMatch: activityListCache.displayedEtag ?? undefined,
    })
    if (!result.notModified) {
      updateListLatest(activityListCache, activityListCache.activeQuery, result, result.etag)
      noticeList = result
      noticeListEtag = result.etag
    }
  }

  return {
    scene,
    sceneChangedModules,
    noticeList,
    noticeListEtag,
  }
}

export const resolveHomeRailActivityVisibleUpdate = (): ActivityActivationUpdate => ({
  scene: hasSceneStale(activitySceneCache)
    ? {
        content: activitySceneCache.latestContent as HomeRailActivityContent,
        meta: activitySceneCache.latestMeta as RailSceneResolvedMeta,
      }
    : null,
  sceneChangedModules: hasSceneStale(activitySceneCache)
    ? [...activitySceneCache.staleModules]
    : [],
  noticeList: hasMatchingListStale(activityListCache) ? activityListCache.latestResult : null,
  noticeListEtag: hasMatchingListStale(activityListCache)
    ? (activityListCache.latestEtag ?? undefined)
    : undefined,
})

export const resolveHomeRailProfileActivationUpdate = async (
  options: { allowNetworkFallback?: boolean } = {}
): Promise<ProfileActivationUpdate> => {
  const allowNetworkFallback = options.allowNetworkFallback !== false
  let scene: RailSceneResolvedContent<HomeRailProfileContent> | null = null
  let sceneChangedModules: HomeRailProfileSceneModuleKey[] = []
  if (hasSceneStale(profileSceneCache)) {
    scene = {
      content: profileSceneCache.latestContent as HomeRailProfileContent,
      meta: profileSceneCache.latestMeta as RailSceneResolvedMeta,
    }
    sceneChangedModules = [...profileSceneCache.staleModules]
  } else if (allowNetworkFallback && profileSceneCache.displayedMeta) {
    const resolved = await resolveHomeRailProfileContent({ force: true })
    const signatures = buildHomeRailProfileBlockSignatures(resolved.content)
    const changedModules = diffSceneModules(profileSceneCache.displayedSignatures, signatures)
    updateSceneLatest(profileSceneCache, resolved, signatures)
    if (changedModules.length) {
      scene = resolved
      sceneChangedModules = changedModules
    }
  }

  let assetList: HomeRailProfileAssetListResult | null = null
  if (hasMatchingListStale(profileListCache)) {
    assetList = profileListCache.latestResult
  } else if (allowNetworkFallback && profileListCache.activeQuery) {
    const result = await resolveHomeRailProfileAssetList(profileListCache.activeQuery, {
      ifNoneMatch: profileListCache.displayedEtag ?? undefined,
    })
    if (!result.notModified) {
      updateListLatest(profileListCache, profileListCache.activeQuery, result, result.etag)
      if (!profileListCache.displayedIsBeyondFirstTransportBatch) {
        assetList = result
      }
    }
  }

  return {
    scene,
    sceneChangedModules,
    assetList,
  }
}

export const resolveHomeRailProfileVisibleUpdate = (): ProfileActivationUpdate => ({
  scene: hasSceneStale(profileSceneCache)
    ? {
        content: profileSceneCache.latestContent as HomeRailProfileContent,
        meta: profileSceneCache.latestMeta as RailSceneResolvedMeta,
      }
    : null,
  sceneChangedModules: hasSceneStale(profileSceneCache) ? [...profileSceneCache.staleModules] : [],
  assetList: hasMatchingListStale(profileListCache) ? profileListCache.latestResult : null,
})

export const triggerHomeRailBackgroundUpdateCheck = async () => {
  await runCoordinatorPoll()
}

export const isHomeRailAppVisible = () => isAppVisible.value

export const getHomeRailSceneStaleModules = (pageKey: PageKey): string[] => {
  if (pageKey === HOME_PRIMARY_PAGE_KEY) {
    return [...homeSceneCache.staleModules]
  }

  if (pageKey === HOME_ACTIVITY_PAGE_KEY) {
    return [...activitySceneCache.staleModules]
  }

  return [...profileSceneCache.staleModules]
}
