/**
 * Responsibility: orchestrate the profile-asset detail refresh flow, guard checks, and refresh presentation state.
 * Out of scope: persistent cache implementation, route-state parsing, and hero-media presentation logic.
 */
import { ref } from 'vue'
import type { ComputedRef, Ref } from 'vue'
import { useRefreshPresentationRuntime } from '../../home/composables/shared/useRefreshPresentationRuntime'
import type { ProfileAssetDetailContent } from '../../../models/profile-asset-detail/profileAssetDetail.model'
import type { ProfileCategoryKey } from '../../../models/home-rail/homeRailProfile.model'
import { resolveProfileAssetDetailContent } from '../../../services/profile-asset-detail/profileAssetDetailContent.service'
import {
  createProfileAssetDetailRouteSignature,
  shouldApplyProfileAssetDetailRefreshResult,
} from '../helpers/profileAssetDetailRefreshApplyGuard'
import { logSafeError } from '../../../utils/safeLogger.util'

export const PROFILE_ASSET_REFRESH_TRIGGER_OFFSET_PX = 96
export const PROFILE_ASSET_REFRESH_MIN_VISIBLE_DURATION_MS = 420

export interface RefresherPullingEvent {
  detail?: { dy?: number }
}

export type ProfileAssetDetailRefreshReason = 'page-open' | 'pull-refresh'

export interface ProfileAssetDetailRefreshOptions {
  force?: boolean
  reason?: ProfileAssetDetailRefreshReason
}

interface ResolvedRoute {
  itemId: string
  category: ProfileCategoryKey
}

interface UseProfileAssetDetailRefreshControllerOptions {
  currentDetailRouteSignature: ComputedRef<string>
  resolveCurrentDetailRoute: () => ResolvedRoute
  resolveCurrentUserScope: () => string | null
  applyResolvedDetailContent: (
    detail: ProfileAssetDetailContent,
    requestUserScope?: string | null
  ) => void
  loadSnapshot?: (
    itemId: string,
    category: ProfileCategoryKey
  ) => Promise<ProfileAssetDetailContent>
  shouldApplyResult?: typeof shouldApplyProfileAssetDetailRefreshResult
  logSafeErrorFn?: typeof logSafeError
  refreshTriggerOffsetPx?: number
  refreshMinVisibleDurationMs?: number
}

export interface UseProfileAssetDetailRefreshControllerResult {
  isDetailPageActive: Ref<boolean>
  isRefreshing: Ref<boolean>
  refresherTriggered: Ref<boolean>
  refresherPullDistance: Ref<number>
  refreshRequestVersion: Ref<number>
  refreshErrorMessage: Ref<string>
  prepareRefreshStateForPageOpen: () => void
  refreshContent: (
    input?: ProfileAssetDetailRefreshReason | ProfileAssetDetailRefreshOptions
  ) => Promise<void>
  waitForRefreshPresentation: () => Promise<void>
  handleRefresherPulling: (event: RefresherPullingEvent) => void
  handleRefresherRefresh: () => void
  handleRefresherRestore: () => void
  handleRefresherAbort: () => void
  activateDetailPage: () => void
  invalidateDetailPageRequests: () => void
}

const waitMs = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms))

export const useProfileAssetDetailRefreshController = ({
  currentDetailRouteSignature,
  resolveCurrentDetailRoute,
  resolveCurrentUserScope,
  applyResolvedDetailContent,
  loadSnapshot = resolveProfileAssetDetailContent,
  shouldApplyResult = shouldApplyProfileAssetDetailRefreshResult,
  logSafeErrorFn = logSafeError,
  refreshTriggerOffsetPx = PROFILE_ASSET_REFRESH_TRIGGER_OFFSET_PX,
  refreshMinVisibleDurationMs = PROFILE_ASSET_REFRESH_MIN_VISIBLE_DURATION_MS,
}: UseProfileAssetDetailRefreshControllerOptions): UseProfileAssetDetailRefreshControllerResult => {
  const isDetailPageActive = ref(true)
  const isRefreshing = ref(false)
  const refresherTriggered = ref(false)
  const refresherPullDistance = ref(0)
  const refreshRequestVersion = ref(0)
  const refreshErrorMessage = ref('')
  const refreshPresentationRuntime = useRefreshPresentationRuntime()

  const resetRefresherVisualState = () => {
    refresherTriggered.value = false
    refresherPullDistance.value = 0
  }

  const resolveRefreshReason = (
    input?: ProfileAssetDetailRefreshReason | ProfileAssetDetailRefreshOptions
  ): ProfileAssetDetailRefreshReason => {
    if (!input) {
      return 'page-open'
    }

    if (typeof input === 'string') {
      return input
    }

    return input.reason ?? 'page-open'
  }

  const canApplyDetailRefreshResult = (
    requestVersion: number,
    requestRouteSignature: string,
    requestUserScope: string | null
  ) => {
    return shouldApplyResult({
      requestVersion,
      latestRequestVersion: refreshRequestVersion.value,
      requestRouteSignature,
      currentRouteSignature: currentDetailRouteSignature.value,
      requestUserScope,
      currentUserScope: resolveCurrentUserScope(),
      isPageActive: isDetailPageActive.value,
    })
  }

  const prepareRefreshStateForPageOpen = () => {
    refreshErrorMessage.value = ''
    isRefreshing.value = false
    resetRefresherVisualState()
  }

  const refreshContent = async (
    input?: ProfileAssetDetailRefreshReason | ProfileAssetDetailRefreshOptions
  ) => {
    const reason = resolveRefreshReason(input)
    const { itemId, category } = resolveCurrentDetailRoute()
    const version = refreshRequestVersion.value + 1
    const requestRouteSignature = createProfileAssetDetailRouteSignature({ itemId, category })
    const requestUserScope = resolveCurrentUserScope()
    const lock = reason === 'pull-refresh'

    refreshRequestVersion.value = version
    refreshErrorMessage.value = ''

    const runRefresh = async () => {
      const start = Date.now()

      try {
        const resolvedDetailContent = await loadSnapshot(itemId, category)
        if (!canApplyDetailRefreshResult(version, requestRouteSignature, requestUserScope)) {
          return
        }

        applyResolvedDetailContent(resolvedDetailContent, requestUserScope)
      } catch (error) {
        if (!canApplyDetailRefreshResult(version, requestRouteSignature, requestUserScope)) {
          logSafeErrorFn('profileAssetDetail.refresh', error, {
            message: 'failed to refresh profile asset detail content',
          })
          return
        }

        refreshErrorMessage.value = '刷新失败，已保留当前可见内容。'
        logSafeErrorFn('profileAssetDetail.refresh', error, {
          message: 'failed to refresh profile asset detail content',
        })
      } finally {
        if (lock) {
          const elapsed = Date.now() - start
          if (elapsed < refreshMinVisibleDurationMs) {
            await waitMs(refreshMinVisibleDurationMs - elapsed)
          }

          if (version === refreshRequestVersion.value) {
            isRefreshing.value = false
            resetRefresherVisualState()
          }
        }
      }
    }

    if (lock) {
      isRefreshing.value = true
      refresherTriggered.value = true
      refresherPullDistance.value = refreshTriggerOffsetPx
    }

    await refreshPresentationRuntime.startRefreshPresentation(
      async () => {
        await runRefresh()
      },
      { awaitCompletion: true }
    )
  }

  const waitForRefreshPresentation = () => refreshPresentationRuntime.waitForRefreshPresentation()

  const resolvePullDistance = (event: RefresherPullingEvent) => {
    const dy = event.detail?.dy
    return typeof dy === 'number' && Number.isFinite(dy) ? Math.max(0, Math.round(dy)) : 0
  }

  const handleRefresherPulling = (event: RefresherPullingEvent) => {
    if (!isRefreshing.value) {
      refresherPullDistance.value = resolvePullDistance(event)
    }
  }

  const handleRefresherRefresh = () => {
    if (!isRefreshing.value) {
      void refreshContent({ reason: 'pull-refresh' })
    }
  }

  const handleRefresherRestore = () => {
    if (!isRefreshing.value) {
      resetRefresherVisualState()
    }
  }

  const handleRefresherAbort = () => {
    if (!isRefreshing.value) {
      resetRefresherVisualState()
    }
  }

  const activateDetailPage = () => {
    isDetailPageActive.value = true
  }

  const invalidateDetailPageRequests = () => {
    isDetailPageActive.value = false
    refreshRequestVersion.value += 1
    refreshPresentationRuntime.resetRefreshPresentationRuntimeForInactive()
  }

  return {
    isDetailPageActive,
    isRefreshing,
    refresherTriggered,
    refresherPullDistance,
    refreshRequestVersion,
    refreshErrorMessage,
    prepareRefreshStateForPageOpen,
    refreshContent,
    waitForRefreshPresentation,
    handleRefresherPulling,
    handleRefresherRefresh,
    handleRefresherRestore,
    handleRefresherAbort,
    activateDetailPage,
    invalidateDetailPageRequests,
  }
}
