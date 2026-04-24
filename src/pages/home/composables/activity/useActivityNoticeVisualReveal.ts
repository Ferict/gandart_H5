/**
 * Responsibility: manage activity notice visual reveal phases, preset-driven icon/tone
 * derivation, and shared image-ready state for notice cards.
 * Out of scope: notice query execution, result-window timing, and activity page lifecycle
 * orchestration.
 */
import { computed, ref, type Ref } from 'vue'
import { useHomeVisualImageState } from '../../../../composables/useHomeVisualImageState'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type {
  ActivityNotice,
  ActivityNoticeVisualPreset,
} from '../../../../models/home-rail/homeRailActivity.model'

export type NoticeRevealPhase = 'icon' | 'reveal-scan' | 'steady' | 'fallback'

const NOTICE_PRESET_ICON_MAP: Record<ActivityNoticeVisualPreset, AetherIconName> = {
  consignment: 'shopping-cart',
  limit_price: 'chart-candlestick',
  release: 'zap',
  airdrop: 'emerald',
  synthesis: 'atom',
  platform: 'bell',
  swap: 'repeat-2',
}

const NOTICE_PRESET_TONE_MAP: Record<
  ActivityNoticeVisualPreset,
  'cyan' | 'violet' | 'amber' | 'rose' | 'slate' | 'emerald' | 'indigo'
> = {
  consignment: 'cyan',
  limit_price: 'amber',
  release: 'violet',
  airdrop: 'emerald',
  synthesis: 'indigo',
  platform: 'slate',
  swap: 'rose',
}

export const useActivityNoticeVisualReveal = ({
  mountedNotices,
  isNoticePlaceholder,
}: {
  mountedNotices: Ref<ActivityNotice[]>
  isNoticePlaceholder: (noticeId: string) => boolean
}) => {
  const noticeRevealPhaseMap = ref<Record<string, NoticeRevealPhase>>({})
  const noticeRevealTimeoutMap = new Map<string, ReturnType<typeof setTimeout>>()
  const {
    syncHomeVisualImageState,
    markHomeVisualImageLoaded,
    markHomeVisualImageError,
    markHomeVisualImageRetrying,
    isHomeVisualImageRevealReady,
    resolveHomeVisualImageDisplaySource,
    activityNoticeImageStateVersion,
  } = useHomeVisualImageState()

  const resolveRequestStamp = (payload?: unknown) => {
    if (!payload || typeof payload !== 'object') {
      return undefined
    }

    const requestStamp = (payload as { requestStamp?: unknown }).requestStamp
    return typeof requestStamp === 'number' && Number.isFinite(requestStamp)
      ? requestStamp
      : undefined
  }

  const resolveNoticePreset = (notice: ActivityNotice): ActivityNoticeVisualPreset => {
    return notice.visual?.preset ?? 'platform'
  }

  const resolveNoticeIcon = (notice: ActivityNotice): AetherIconName => {
    return NOTICE_PRESET_ICON_MAP[resolveNoticePreset(notice)] ?? 'bell'
  }

  const resolveNoticeTone = (notice: ActivityNotice) => {
    return NOTICE_PRESET_TONE_MAP[resolveNoticePreset(notice)] ?? 'slate'
  }

  const resolveNoticeImageUrl = (notice: ActivityNotice): string => {
    const value = notice.visual?.imageUrl?.trim()
    return value || ''
  }

  const setNoticeRevealPhase = (noticeId: string, phase: NoticeRevealPhase) => {
    if (noticeRevealPhaseMap.value[noticeId] === phase) {
      return
    }
    noticeRevealPhaseMap.value = { ...noticeRevealPhaseMap.value, [noticeId]: phase }
  }

  const clearNoticeRevealTimeout = (noticeId: string) => {
    const timeoutId = noticeRevealTimeoutMap.get(noticeId)
    if (!timeoutId) {
      return
    }
    clearTimeout(timeoutId)
    noticeRevealTimeoutMap.delete(noticeId)
  }

  const clearNoticeRevealTimeouts = (retainIds?: Set<string>) => {
    Array.from(noticeRevealTimeoutMap.keys()).forEach((noticeId) => {
      if (retainIds && retainIds.has(noticeId)) {
        return
      }
      clearNoticeRevealTimeout(noticeId)
    })
  }

  const startNoticeRevealScan = (noticeId: string) => {
    setNoticeRevealPhase(noticeId, 'reveal-scan')
    clearNoticeRevealTimeout(noticeId)
    const timeoutId = setTimeout(() => {
      noticeRevealTimeoutMap.delete(noticeId)
      if (noticeRevealPhaseMap.value[noticeId] !== 'reveal-scan') {
        return
      }
      setNoticeRevealPhase(noticeId, 'steady')
    }, 220)
    noticeRevealTimeoutMap.set(noticeId, timeoutId)
  }

  const syncNoticeVisualImages = (list: ActivityNotice[] = mountedNotices.value) => {
    syncHomeVisualImageState(
      list
        .filter((notice) => !isNoticePlaceholder(notice.id))
        .map((notice) => ({
          scope: 'activityNotice' as const,
          resourceId: notice.id,
          imageUrl: resolveNoticeImageUrl(notice),
        }))
    )
    list.forEach((notice) => {
      const noticeId = notice.id
      if (isNoticePlaceholder(noticeId)) {
        return
      }
    })
  }

  const syncNoticeRevealPhases = (list: ActivityNotice[] = mountedNotices.value) => {
    const activeIds = new Set<string>()
    list.forEach((notice) => {
      const noticeId = notice.id
      activeIds.add(noticeId)
      if (isNoticePlaceholder(noticeId)) {
        setNoticeRevealPhase(noticeId, 'icon')
        return
      }

      const imageUrl = resolveNoticeImageUrl(notice)
      if (!imageUrl) {
        setNoticeRevealPhase(noticeId, 'fallback')
        return
      }

      if (!isHomeVisualImageRevealReady('activityNotice', noticeId, imageUrl)) {
        setNoticeRevealPhase(noticeId, 'icon')
        return
      }

      const displaySource = resolveHomeVisualImageDisplaySource(
        'activityNotice',
        noticeId,
        imageUrl
      )
      if (displaySource === 'fallback') {
        setNoticeRevealPhase(noticeId, 'fallback')
        return
      }

      const currentPhase = noticeRevealPhaseMap.value[noticeId]
      if (currentPhase === 'steady' || currentPhase === 'reveal-scan') {
        return
      }
      startNoticeRevealScan(noticeId)
    })

    clearNoticeRevealTimeouts(activeIds)
    noticeRevealPhaseMap.value = Object.fromEntries(
      Object.entries(noticeRevealPhaseMap.value).filter(([noticeId]) => activeIds.has(noticeId))
    )
  }

  const resolveNoticeRevealPhase = (notice: ActivityNotice): NoticeRevealPhase =>
    noticeRevealPhaseMap.value[notice.id] ?? 'icon'

  const resolveNoticeRemovedOverlayRevealPhase = (notice: ActivityNotice): NoticeRevealPhase =>
    resolveNoticeImageUrl(notice) ? 'steady' : 'fallback'

  const handleNoticeVisualImageLoad = (notice: ActivityNotice, payload?: unknown) => {
    markHomeVisualImageLoaded(
      'activityNotice',
      notice.id,
      resolveNoticeImageUrl(notice),
      resolveRequestStamp(payload)
    )
    syncNoticeRevealPhases()
  }

  const handleNoticeVisualImageError = (notice: ActivityNotice, payload?: unknown) => {
    markHomeVisualImageError(
      'activityNotice',
      notice.id,
      resolveNoticeImageUrl(notice),
      resolveRequestStamp(payload)
    )
    syncNoticeRevealPhases()
  }

  const handleNoticeVisualImageRetrying = (notice: ActivityNotice, payload?: unknown) => {
    markHomeVisualImageRetrying(
      'activityNotice',
      notice.id,
      resolveNoticeImageUrl(notice),
      resolveRequestStamp(payload)
    )
    syncNoticeRevealPhases()
  }

  const resetNoticeVisualRevealForInactive = () => {
    clearNoticeRevealTimeouts()
    noticeRevealPhaseMap.value = Object.fromEntries(
      Object.entries(noticeRevealPhaseMap.value).map(([noticeId, phase]) => [
        noticeId,
        phase === 'reveal-scan' ? 'icon' : phase,
      ])
    )
  }

  const disposeNoticeVisualReveal = () => {
    clearNoticeRevealTimeouts()
    noticeRevealPhaseMap.value = {}
  }

  const activityNoticeImageStateVersionRef = computed(() => activityNoticeImageStateVersion.value)

  return {
    noticeRevealPhaseMap,
    activityNoticeImageStateVersionRef,
    resolveNoticePreset,
    resolveNoticeIcon,
    resolveNoticeTone,
    resolveNoticeImageUrl,
    resolveNoticeRevealPhase,
    resolveNoticeRemovedOverlayRevealPhase,
    syncNoticeVisualImages,
    syncNoticeRevealPhases,
    handleNoticeVisualImageLoad,
    handleNoticeVisualImageError,
    handleNoticeVisualImageRetrying,
    clearNoticeRevealTimeouts,
    resetNoticeVisualRevealForInactive,
    disposeNoticeVisualReveal,
  }
}
