/**
 * Responsibility: host pure runtime state for the home market rail, including request versions,
 * activation flags, and foreground or poll signals.
 * Out of scope: content refresh, list queries, result windows, reveal runtime, and watchers.
 */
import { computed, ref, type ComputedRef } from 'vue'
import {
  useHomeRailForegroundSignal,
  useHomeRailPollSignal,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'

interface UseHomeRailHomeRuntimeStateOptions {
  isActive: ComputedRef<boolean>
}

export const useHomeRailHomeRuntimeState = (options: UseHomeRailHomeRuntimeStateOptions) => {
  const homeContentRequestVersion = ref(0)
  const homeContentRefreshRunId = ref(0)
  const hasResolvedInitialHomeContent = ref(false)
  const hasSeenHomePageActivation = ref(false)
  const noticeRefreshRenderKey = ref(0)
  const bannerRefreshRenderKey = ref(0)
  const featuredRefreshRenderKey = ref(0)
  const homeForegroundSignal = useHomeRailForegroundSignal()
  const homePollSignal = useHomeRailPollSignal()
  const homeActivationCheckVersion = ref(0)
  const isHomePanelActive = computed(() => options.isActive.value)

  return {
    homeContentRequestVersion,
    homeContentRefreshRunId,
    hasResolvedInitialHomeContent,
    hasSeenHomePageActivation,
    noticeRefreshRenderKey,
    bannerRefreshRenderKey,
    featuredRefreshRenderKey,
    homeForegroundSignal,
    homePollSignal,
    homeActivationCheckVersion,
    isHomePanelActive,
  }
}
