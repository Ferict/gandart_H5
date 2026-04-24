/**
 * Responsibility: host pure runtime state for the activity rail, including activation checks,
 * foreground or poll signals, and dev logging flags.
 * Out of scope: notice queries, remote refresh, result windows, and visual reveal orchestration.
 */
import { ref } from 'vue'
import {
  useHomeRailForegroundSignal,
  useHomeRailPollSignal,
} from '../../../../services/home-rail/homeRailUpdateCoordinator.service'

interface UseHomeRailActivityRuntimeStateOptions {
  isDev: boolean
}

export const useHomeRailActivityRuntimeState = (
  options: UseHomeRailActivityRuntimeStateOptions
) => {
  const activityForegroundSignal = useHomeRailForegroundSignal()
  const activityPollSignal = useHomeRailPollSignal()
  const activityActivationCheckVersion = ref(0)
  const hasSeenActivityPageActivation = ref(false)

  const logActivityRefreshDebug = (message: string, detail?: unknown) => {
    if (!options.isDev) {
      return
    }

    if (detail === undefined) {
      console.debug(`[homeRail][activity] ${message}`)
      return
    }

    console.debug(`[homeRail][activity] ${message}`, detail)
  }

  return {
    activityForegroundSignal,
    activityPollSignal,
    activityActivationCheckVersion,
    hasSeenActivityPageActivation,
    logActivityRefreshDebug,
  }
}
