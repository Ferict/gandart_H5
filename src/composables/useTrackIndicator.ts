/**
 * Responsibility: measure and synchronize the active-track indicator geometry for tab or rail
 * surfaces that highlight one active entry at a time.
 * Out of scope: track item rendering, active-entry selection policy, and page navigation logic.
 */
import {
  computed,
  getCurrentInstance,
  nextTick,
  onBeforeUnmount,
  onMounted,
  ref,
  type CSSProperties,
} from 'vue'

interface UseTrackIndicatorOptions {
  trackSelector: string
  activeSelector: string
  minWidth?: number
  fixedWidth?: number
}

interface BoundingRectLike {
  left: number
  width: number
}

export function useTrackIndicator(options: UseTrackIndicatorOptions) {
  const instance = getCurrentInstance()
  const indicatorLeft = ref(0)
  const indicatorWidth = ref(0)
  const isIndicatorReady = ref(false)
  let syncTimeoutId: ReturnType<typeof setTimeout> | null = null

  const indicatorStyle = computed<CSSProperties>(() => {
    return {
      width: `${indicatorWidth.value}px`,
      transform: `translate3d(${indicatorLeft.value}px, 0, 0)`,
    }
  })

  const clearScheduledSync = () => {
    if (!syncTimeoutId) {
      return
    }

    clearTimeout(syncTimeoutId)
    syncTimeoutId = null
  }

  const applyMeasuredRects = (
    trackRect?: BoundingRectLike | null,
    activeRect?: BoundingRectLike | null
  ) => {
    if (
      !trackRect ||
      !activeRect ||
      !Number.isFinite(trackRect.left) ||
      !Number.isFinite(activeRect.left)
    ) {
      isIndicatorReady.value = false
      indicatorLeft.value = 0
      indicatorWidth.value = 0
      return
    }

    if (typeof options.fixedWidth === 'number' && options.fixedWidth > 0) {
      indicatorWidth.value = options.fixedWidth
      indicatorLeft.value = Math.max(
        0,
        activeRect.left - trackRect.left + Math.max(0, (activeRect.width - options.fixedWidth) / 2)
      )
    } else {
      indicatorLeft.value = Math.max(0, activeRect.left - trackRect.left)
      indicatorWidth.value = Math.max(options.minWidth ?? 0, activeRect.width || 0)
    }
    isIndicatorReady.value = indicatorWidth.value > 0
  }

  const syncIndicator = async () => {
    clearScheduledSync()
    await nextTick()

    const proxy = instance?.proxy
    if (!proxy) {
      return
    }

    const query = uni.createSelectorQuery().in(proxy)
    query.select(options.trackSelector).boundingClientRect()
    query.select(options.activeSelector).boundingClientRect()
    query.exec((result) => {
      const [trackRect, activeRect] = result as [
        BoundingRectLike | null | undefined,
        BoundingRectLike | null | undefined,
      ]
      applyMeasuredRects(trackRect, activeRect)
    })
  }

  const scheduleIndicatorSync = () => {
    clearScheduledSync()
    syncTimeoutId = setTimeout(() => {
      syncTimeoutId = null
      void syncIndicator()
    }, 16)
  }

  const handleResize = () => {
    scheduleIndicatorSync()
  }

  onMounted(() => {
    void syncIndicator()

    if (typeof window !== 'undefined') {
      window.addEventListener('resize', handleResize)
    }
  })

  onBeforeUnmount(() => {
    clearScheduledSync()

    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleResize)
    }
  })

  return {
    indicatorStyle,
    isIndicatorReady,
    scheduleIndicatorSync,
    syncIndicator,
  }
}
