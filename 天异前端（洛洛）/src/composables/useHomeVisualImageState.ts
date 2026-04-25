/**
 * Responsibility: manage shared visual-image loading state, local/remote source
 * switching, retry status, and display-source bookkeeping for home-page imagery.
 * Out of scope: business-specific result-window timing, page query execution, and
 * provider-side image resolution.
 */
import { computed, ref } from 'vue'

export type HomeVisualImageLoadStatus = 'idle' | 'loading' | 'retrying' | 'loaded' | 'error'
export type HomeVisualImageDisplaySource = 'fallback' | 'remote' | 'local'
export type HomeVisualImageScope =
  | 'banner'
  | 'featured'
  | 'market'
  | 'activityNotice'
  | 'profileAsset'

export interface HomeVisualImageEntry {
  scope: HomeVisualImageScope
  resourceId: string
  imageUrl: string
}

interface HomeVisualImageStateEntry {
  displaySource: HomeVisualImageDisplaySource
  status: HomeVisualImageLoadStatus
  requestStamp?: number
}

const HOME_VISUAL_IMAGE_LOAD_TIMEOUT_MS = 8000

const homeVisualImageStateMap = ref<Record<string, HomeVisualImageStateEntry>>({})
const homeVisualImageTimeoutMap = new Map<string, ReturnType<typeof setTimeout>>()
const homeVisualImageScopeVersionMap = ref<Record<HomeVisualImageScope, number>>({
  banner: 0,
  featured: 0,
  market: 0,
  activityNotice: 0,
  profileAsset: 0,
})

export const createHomeVisualImageStateKey = (
  scope: HomeVisualImageScope,
  resourceId: string,
  imageUrl: string
): string => {
  return `${scope}::${resourceId}::${imageUrl}`
}

const resolveHomeVisualImageScopeByStateKey = (stateKey: string): HomeVisualImageScope | null => {
  const [scope] = stateKey.split('::')
  if (
    scope === 'banner' ||
    scope === 'featured' ||
    scope === 'market' ||
    scope === 'activityNotice' ||
    scope === 'profileAsset'
  ) {
    return scope
  }

  return null
}

const isHomeVisualImageRuntimeManagedScope = (scope: HomeVisualImageScope): boolean => {
  return scope === 'market' || scope === 'activityNotice' || scope === 'profileAsset'
}

const bumpHomeVisualImageScopeVersion = (scope: HomeVisualImageScope) => {
  homeVisualImageScopeVersionMap.value = {
    ...homeVisualImageScopeVersionMap.value,
    [scope]: homeVisualImageScopeVersionMap.value[scope] + 1,
  }
}

const setHomeVisualImageStateEntry = (stateKey: string, nextEntry: HomeVisualImageStateEntry) => {
  const currentEntry = homeVisualImageStateMap.value[stateKey]
  if (
    currentEntry?.displaySource === nextEntry.displaySource &&
    currentEntry?.status === nextEntry.status &&
    currentEntry?.requestStamp === nextEntry.requestStamp
  ) {
    return
  }

  homeVisualImageStateMap.value = {
    ...homeVisualImageStateMap.value,
    [stateKey]: nextEntry,
  }

  const scope = resolveHomeVisualImageScopeByStateKey(stateKey)
  if (scope) {
    bumpHomeVisualImageScopeVersion(scope)
  }
}

const removeHomeVisualImageStateEntry = (stateKey: string) => {
  if (!(stateKey in homeVisualImageStateMap.value)) {
    return
  }

  const nextStateMap = { ...homeVisualImageStateMap.value }
  delete nextStateMap[stateKey]
  homeVisualImageStateMap.value = nextStateMap

  const scope = resolveHomeVisualImageScopeByStateKey(stateKey)
  if (scope) {
    bumpHomeVisualImageScopeVersion(scope)
  }
}

const clearHomeVisualImageTimeout = (stateKey: string) => {
  const timeoutId = homeVisualImageTimeoutMap.get(stateKey)
  if (!timeoutId) {
    return
  }

  clearTimeout(timeoutId)
  homeVisualImageTimeoutMap.delete(stateKey)
}

const ensureHomeVisualImageTimeout = (stateKey: string) => {
  const scope = resolveHomeVisualImageScopeByStateKey(stateKey)
  if (scope && isHomeVisualImageRuntimeManagedScope(scope)) {
    return
  }

  if (homeVisualImageTimeoutMap.has(stateKey)) {
    return
  }

  const timeoutId = setTimeout(() => {
    homeVisualImageTimeoutMap.delete(stateKey)
    const currentEntry = homeVisualImageStateMap.value[stateKey]
    if (currentEntry?.status !== 'loading' && currentEntry?.status !== 'retrying') {
      return
    }

    setHomeVisualImageStateEntry(stateKey, {
      displaySource: 'fallback',
      status: 'error',
    })
  }, HOME_VISUAL_IMAGE_LOAD_TIMEOUT_MS)

  homeVisualImageTimeoutMap.set(stateKey, timeoutId)
}

const syncHomeVisualImageState = (entries: HomeVisualImageEntry[]) => {
  const activeStateKeys = new Set<string>()
  const activeScopes = new Set<HomeVisualImageScope>()

  entries.forEach((entry) => {
    const imageUrl = entry.imageUrl.trim()
    activeScopes.add(entry.scope)
    if (!imageUrl) {
      return
    }

    const stateKey = createHomeVisualImageStateKey(entry.scope, entry.resourceId, imageUrl)
    activeStateKeys.add(stateKey)

    const currentEntry = homeVisualImageStateMap.value[stateKey]
    if (currentEntry?.status === 'loaded' || currentEntry?.status === 'error') {
      clearHomeVisualImageTimeout(stateKey)
      return
    }

    setHomeVisualImageStateEntry(stateKey, {
      displaySource: 'fallback',
      status: 'loading',
    })
    ensureHomeVisualImageTimeout(stateKey)
  })

  Array.from(homeVisualImageTimeoutMap.keys()).forEach((stateKey) => {
    const scope = resolveHomeVisualImageScopeByStateKey(stateKey)
    if (scope && activeScopes.has(scope) && !activeStateKeys.has(stateKey)) {
      clearHomeVisualImageTimeout(stateKey)
    }
  })

  Object.keys(homeVisualImageStateMap.value).forEach((stateKey) => {
    const scope = resolveHomeVisualImageScopeByStateKey(stateKey)
    if (scope && activeScopes.has(scope) && !activeStateKeys.has(stateKey)) {
      removeHomeVisualImageStateEntry(stateKey)
    }
  })
}

const markHomeVisualImageLoaded = (
  scope: HomeVisualImageScope,
  resourceId: string,
  imageUrl: string,
  requestStamp?: number
) => {
  const normalizedImageUrl = imageUrl.trim()
  if (!normalizedImageUrl) {
    return
  }

  const stateKey = createHomeVisualImageStateKey(scope, resourceId, normalizedImageUrl)
  const currentEntry = homeVisualImageStateMap.value[stateKey]
  if (
    typeof requestStamp === 'number' &&
    typeof currentEntry?.requestStamp === 'number' &&
    requestStamp < currentEntry.requestStamp
  ) {
    return
  }

  clearHomeVisualImageTimeout(stateKey)
  setHomeVisualImageStateEntry(stateKey, {
    displaySource: 'remote',
    status: 'loaded',
    requestStamp,
  })
}

const markHomeVisualImageError = (
  scope: HomeVisualImageScope,
  resourceId: string,
  imageUrl: string,
  requestStamp?: number
) => {
  const normalizedImageUrl = imageUrl.trim()
  if (!normalizedImageUrl) {
    return
  }

  const stateKey = createHomeVisualImageStateKey(scope, resourceId, normalizedImageUrl)
  const currentEntry = homeVisualImageStateMap.value[stateKey]
  if (
    typeof requestStamp === 'number' &&
    typeof currentEntry?.requestStamp === 'number' &&
    requestStamp < currentEntry.requestStamp
  ) {
    return
  }

  if (currentEntry?.status === 'loaded') {
    return
  }

  clearHomeVisualImageTimeout(stateKey)
  setHomeVisualImageStateEntry(stateKey, {
    displaySource: 'fallback',
    status: 'error',
    requestStamp,
  })
}

const markHomeVisualImageRetrying = (
  scope: HomeVisualImageScope,
  resourceId: string,
  imageUrl: string,
  requestStamp?: number
) => {
  const normalizedImageUrl = imageUrl.trim()
  if (!normalizedImageUrl) {
    return
  }

  const stateKey = createHomeVisualImageStateKey(scope, resourceId, normalizedImageUrl)
  const currentEntry = homeVisualImageStateMap.value[stateKey]
  if (
    typeof requestStamp === 'number' &&
    typeof currentEntry?.requestStamp === 'number' &&
    requestStamp < currentEntry.requestStamp
  ) {
    return
  }

  clearHomeVisualImageTimeout(stateKey)
  setHomeVisualImageStateEntry(stateKey, {
    displaySource: 'fallback',
    status: 'retrying',
    requestStamp,
  })
}

const marketImageStateVersion = computed(() => homeVisualImageScopeVersionMap.value.market)
const activityNoticeImageStateVersion = computed(
  () => homeVisualImageScopeVersionMap.value.activityNotice
)
const profileAssetImageStateVersion = computed(
  () => homeVisualImageScopeVersionMap.value.profileAsset
)

const isHomeVisualImageLoaded = (
  scope: HomeVisualImageScope,
  resourceId: string,
  imageUrl: string
): boolean => {
  const normalizedImageUrl = imageUrl.trim()
  if (!normalizedImageUrl) {
    return false
  }

  return (
    homeVisualImageStateMap.value[
      createHomeVisualImageStateKey(scope, resourceId, normalizedImageUrl)
    ]?.status === 'loaded'
  )
}

const isHomeVisualImageRevealReady = (
  scope: HomeVisualImageScope,
  resourceId: string,
  imageUrl: string
): boolean => {
  const normalizedImageUrl = imageUrl.trim()
  if (!normalizedImageUrl) {
    return false
  }

  const status =
    homeVisualImageStateMap.value[
      createHomeVisualImageStateKey(scope, resourceId, normalizedImageUrl)
    ]?.status
  return status === 'loaded' || status === 'error'
}

const resolveHomeVisualImageDisplaySource = (
  scope: HomeVisualImageScope,
  resourceId: string,
  imageUrl: string
): HomeVisualImageDisplaySource => {
  const normalizedImageUrl = imageUrl.trim()
  if (!normalizedImageUrl) {
    return 'fallback'
  }

  return (
    homeVisualImageStateMap.value[
      createHomeVisualImageStateKey(scope, resourceId, normalizedImageUrl)
    ]?.displaySource ?? 'fallback'
  )
}

export const useHomeVisualImageState = () => {
  return {
    syncHomeVisualImageState,
    markHomeVisualImageLoaded,
    markHomeVisualImageError,
    markHomeVisualImageRetrying,
    isHomeVisualImageLoaded,
    isHomeVisualImageRevealReady,
    resolveHomeVisualImageDisplaySource,
    marketImageStateVersion,
    activityNoticeImageStateVersion,
    profileAssetImageStateVersion,
  }
}
