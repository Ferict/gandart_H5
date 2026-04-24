/**
 * Responsibility: own HomeMarketCardImageReveal's image request sequencing, local-cache
 * bridge, timeout handling, and retry runtime without changing the component's visual contract.
 * Out of scope: card metadata assembly, market query execution, and result-window timing.
 */

import { computed, onBeforeUnmount, ref, watch } from 'vue'
import {
  evictImageLocalCacheEntry,
  resolveImageUriWithLocalCache,
  writeBackImageLocalCache,
} from '../services/content/contentImageFileCache.service'

export type HomeMarketCardImageRequestMode = 'initial' | 'auto-retry' | 'manual-retry'

const HOME_MARKET_IMAGE_REQUEST_TIMEOUT_MS = 8000
const HOME_MARKET_IMAGE_AUTO_RETRY_LIMIT = 1
const HOME_MARKET_IMAGE_MANUAL_RETRY_THROTTLE_MS = 500

interface UseHomeMarketCardImageRevealRuntimeOptions {
  resolveImageUrl: () => string
  resolveCanUsePersistentLocalCache: () => boolean
  resolveImageCacheUserScope: () => string | undefined
  emitLoad: (payload: unknown) => void
  emitError: (payload: unknown) => void
  emitRetrying: (payload: unknown) => void
}

export const resolveHomeMarketCardRemoteImageSrc = (url: string, retryNonce: number) => {
  if (!url) {
    return ''
  }

  if (retryNonce <= 0) {
    return url
  }

  const hashIndex = url.indexOf('#')
  const hashPart = hashIndex >= 0 ? url.slice(hashIndex) : ''
  const basePart = hashIndex >= 0 ? url.slice(0, hashIndex) : url
  const querySeparator = basePart.includes('?') ? '&' : '?'
  return `${basePart}${querySeparator}aether_retry=${retryNonce}${hashPart}`
}

export const resolveHomeMarketCardImageEventRequestStamp = (event: unknown): number | null => {
  const eventObject = event as {
    currentTarget?: { dataset?: Record<string, unknown> }
    target?: { dataset?: Record<string, unknown> }
  }

  const maybeValue =
    eventObject.currentTarget?.dataset?.requestStamp ?? eventObject.target?.dataset?.requestStamp

  if (typeof maybeValue === 'number') {
    return maybeValue
  }
  if (typeof maybeValue === 'string' && maybeValue.trim()) {
    const parsed = Number(maybeValue)
    return Number.isFinite(parsed) ? parsed : null
  }

  return null
}

export const useHomeMarketCardImageRevealRuntime = ({
  resolveImageUrl,
  resolveCanUsePersistentLocalCache,
  resolveImageCacheUserScope,
  emitLoad,
  emitError,
  emitRetrying,
}: UseHomeMarketCardImageRevealRuntimeOptions) => {
  const trimmedImageUrl = computed(() => resolveImageUrl().trim())
  const hasImageUrl = computed(() => trimmedImageUrl.value.length > 0)
  const activeRequestStamp = ref(0)
  const activeRequestMode = ref<HomeMarketCardImageRequestMode>('initial')
  const retryNonce = ref(0)
  const autoRetryCount = ref(0)
  const isRetrying = ref(false)
  const lastManualRetryAt = ref(0)
  const resolvedImageSrc = ref('')
  const resolvedImageSource = ref<'local' | 'remote'>('remote')
  let requestTimeoutId: ReturnType<typeof setTimeout> | null = null

  const clearRequestTimeout = () => {
    if (!requestTimeoutId) {
      return
    }

    clearTimeout(requestTimeoutId)
    requestTimeoutId = null
  }

  const isStaleEvent = (event: unknown): boolean => {
    const eventRequestStamp = resolveHomeMarketCardImageEventRequestStamp(event)
    if (eventRequestStamp === null) {
      return false
    }

    return eventRequestStamp !== activeRequestStamp.value
  }

  const scheduleRequestTimeout = (requestStamp: number) => {
    clearRequestTimeout()
    requestTimeoutId = setTimeout(() => {
      requestTimeoutId = null
      if (requestStamp !== activeRequestStamp.value) {
        return
      }
      triggerRetryOrFail('timeout')
    }, HOME_MARKET_IMAGE_REQUEST_TIMEOUT_MS)
  }

  const resolveImageSourceForRequest = async (
    requestStamp: number,
    mode: HomeMarketCardImageRequestMode
  ) => {
    const remoteUrl = trimmedImageUrl.value
    if (!remoteUrl) {
      if (requestStamp === activeRequestStamp.value) {
        resolvedImageSrc.value = ''
        resolvedImageSource.value = 'remote'
      }
      return
    }

    if (mode !== 'initial') {
      if (requestStamp === activeRequestStamp.value) {
        resolvedImageSrc.value = resolveHomeMarketCardRemoteImageSrc(remoteUrl, retryNonce.value)
        resolvedImageSource.value = 'remote'
      }
      return
    }

    if (!resolveCanUsePersistentLocalCache()) {
      if (requestStamp === activeRequestStamp.value) {
        resolvedImageSrc.value = resolveHomeMarketCardRemoteImageSrc(remoteUrl, retryNonce.value)
        resolvedImageSource.value = 'remote'
      }
      return
    }

    const resolvedUri = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope: resolveImageCacheUserScope(),
      warmupOnMiss: false,
    })
    if (requestStamp !== activeRequestStamp.value) {
      return
    }

    resolvedImageSrc.value =
      resolvedUri.source === 'local'
        ? resolvedUri.uri
        : resolveHomeMarketCardRemoteImageSrc(remoteUrl, retryNonce.value)
    resolvedImageSource.value = resolvedUri.source
  }

  const scheduleNextImageRequest = (mode: HomeMarketCardImageRequestMode) => {
    activeRequestStamp.value += 1
    activeRequestMode.value = mode
    if (mode === 'initial') {
      isRetrying.value = false
    } else {
      isRetrying.value = true
      retryNonce.value += 1
    }

    resolvedImageSrc.value = ''
    resolvedImageSource.value = 'remote'
    scheduleRequestTimeout(activeRequestStamp.value)
    void resolveImageSourceForRequest(activeRequestStamp.value, mode)
    if (mode !== 'initial') {
      emitRetrying({
        mode,
        requestStamp: activeRequestStamp.value,
      })
    }
  }

  const emitFailure = (reason: 'error' | 'timeout') => {
    clearRequestTimeout()
    isRetrying.value = false
    emitError({
      reason,
      requestStamp: activeRequestStamp.value,
      source: resolvedImageSource.value,
      mode: activeRequestMode.value,
    })
  }

  const triggerRetryOrFail = (reason: 'error' | 'timeout') => {
    if (autoRetryCount.value < HOME_MARKET_IMAGE_AUTO_RETRY_LIMIT) {
      autoRetryCount.value += 1
      scheduleNextImageRequest('auto-retry')
      return
    }

    emitFailure(reason)
  }

  const resetByImageUrl = () => {
    clearRequestTimeout()
    autoRetryCount.value = 0
    retryNonce.value = 0
    isRetrying.value = false
    resolvedImageSrc.value = ''
    resolvedImageSource.value = 'remote'
    if (!hasImageUrl.value) {
      activeRequestStamp.value = 0
      return
    }

    scheduleNextImageRequest('initial')
  }

  const handleLoad = (event: unknown) => {
    if (isStaleEvent(event)) {
      return
    }

    clearRequestTimeout()
    isRetrying.value = false
    if (resolveCanUsePersistentLocalCache() && resolvedImageSource.value === 'remote') {
      void writeBackImageLocalCache({
        remoteUrl: trimmedImageUrl.value,
        userScope: resolveImageCacheUserScope(),
      })
    }
    emitLoad({
      event,
      requestStamp: activeRequestStamp.value,
      source: resolvedImageSource.value,
      mode: activeRequestMode.value,
    })
  }

  const handleError = (event: unknown) => {
    if (isStaleEvent(event)) {
      return
    }

    clearRequestTimeout()
    if (
      resolveCanUsePersistentLocalCache() &&
      activeRequestMode.value === 'initial' &&
      resolvedImageSource.value === 'local'
    ) {
      evictImageLocalCacheEntry({
        remoteUrl: trimmedImageUrl.value,
        userScope: resolveImageCacheUserScope(),
      })
      resolvedImageSrc.value = resolveHomeMarketCardRemoteImageSrc(
        trimmedImageUrl.value,
        retryNonce.value
      )
      resolvedImageSource.value = 'remote'
      scheduleRequestTimeout(activeRequestStamp.value)
      return
    }
    triggerRetryOrFail('error')
  }

  const handleManualRetry = (canRetryManually: boolean) => {
    if (!canRetryManually) {
      return
    }

    const now = Date.now()
    if (now - lastManualRetryAt.value < HOME_MARKET_IMAGE_MANUAL_RETRY_THROTTLE_MS) {
      return
    }

    lastManualRetryAt.value = now
    autoRetryCount.value = 0
    scheduleNextImageRequest('manual-retry')
  }

  watch(
    () => [
      trimmedImageUrl.value,
      resolveCanUsePersistentLocalCache(),
      resolveImageCacheUserScope(),
    ],
    () => {
      resetByImageUrl()
    },
    { immediate: true }
  )

  onBeforeUnmount(() => {
    clearRequestTimeout()
  })

  return {
    trimmedImageUrl,
    hasImageUrl,
    activeRequestStamp,
    isRetrying,
    resolvedImageSrc,
    handleLoad,
    handleError,
    handleManualRetry,
  }
}
