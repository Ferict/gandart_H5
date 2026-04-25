/**
 * Responsibility: host pure runtime state for the profile rail, including activation flags,
 * scroll metrics, foreground or poll signals, and scene adapter refs.
 * Out of scope: query state, content refresh, result windows, reveal runtime, and watchers.
 */
import { computed, ref, type ComputedRef } from 'vue'
import type { ResultMountScrollMetrics } from '../../../../services/home-rail/homeRailResultMountWindow.service'
import {
  useHomeRailForegroundSignal,
  useHomeRailPollSignal,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'
import type { HomeRailProfileContent } from '../../../../models/home-rail/homeRailProfile.model'

interface UseHomeRailProfileRuntimeStateOptions {
  isActive: ComputedRef<boolean>
  mountScrollMetrics: ComputedRef<ResultMountScrollMetrics | null>
  isDev: boolean
}

export const useHomeRailProfileRuntimeState = (options: UseHomeRailProfileRuntimeStateOptions) => {
  const isProfilePanelActive = computed(() => Boolean(options.isActive.value))
  const profileMountScrollMetrics = computed(() => options.mountScrollMetrics.value)
  const profileForegroundSignal = useHomeRailForegroundSignal()
  const profilePollSignal = useHomeRailPollSignal()
  const hasSeenProfilePageActivation = ref(false)
  const profileActivationCheckVersion = ref(0)
  const profileSceneQueryAdapter = ref<{
    syncProfileFilters: () => void
    canApplyProfileCategoryConfigLive: (nextContent: HomeRailProfileContent) => boolean
  } | null>(null)
  const profileSceneResultAdapter = ref<{
    resetProfileAssetProjection: () => void
    reconcileProfileAssetRender: () => void
  } | null>(null)

  const logProfileRefreshDebug = (message: string, detail?: unknown) => {
    if (!options.isDev) {
      return
    }

    if (detail === undefined) {
      console.debug(`[homeRail][profile] ${message}`)
      return
    }

    console.debug(`[homeRail][profile] ${message}`, detail)
  }

  return {
    isProfilePanelActive,
    profileMountScrollMetrics,
    profileForegroundSignal,
    profilePollSignal,
    hasSeenProfilePageActivation,
    profileActivationCheckVersion,
    profileSceneQueryAdapter,
    profileSceneResultAdapter,
    logProfileRefreshDebug,
  }
}
