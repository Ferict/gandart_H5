/**
 * Responsibility: coordinate activity-page refresh presentation state, staged notice payloads,
 * and reduced-motion patch timing for the activity rail shell.
 * Out of scope: notice query execution, result-window switching, and template rendering.
 */
import { ref } from 'vue'
import { useRefreshPresentationRuntime } from '../shared/useRefreshPresentationRuntime'
import type { HomeRailActivitySceneModuleKey } from '../../../../services/home-rail/homeRailActivityContent.service'

interface StagedNoticeListUpdate<TPayload> {
  querySignature: string
  payload: TPayload
  etag?: string
  origin: 'visible-update' | 'activation-apply'
}

interface UseActivityPagePresentationRuntimeOptions {
  isNoticeRefreshPresentationSettled: (targetReplayRequestId: number) => boolean
}

export const useActivityPagePresentationRuntime = ({
  isNoticeRefreshPresentationSettled,
}: UseActivityPagePresentationRuntimeOptions) => {
  const activityRefreshRunId = ref(0)
  const refreshPresentationRuntime = useRefreshPresentationRuntime()
  const isActivityScenePatchMotionReduced = ref(false)
  const stagedNoticeListUpdate = ref<StagedNoticeListUpdate<unknown> | null>(null)

  let activityScenePatchMotionTimeoutId: ReturnType<typeof setTimeout> | null = null

  const clearStagedNoticeListUpdate = () => {
    stagedNoticeListUpdate.value = null
  }

  const stageNoticeListUpdate = (
    querySignature: string,
    payload: unknown,
    etag: string | undefined,
    origin: 'visible-update' | 'activation-apply'
  ) => {
    stagedNoticeListUpdate.value = {
      querySignature,
      payload,
      etag,
      origin,
    }
  }

  const consumeStagedNoticeListUpdate = (querySignature: string) => {
    const stagedUpdate = stagedNoticeListUpdate.value
    if (!stagedUpdate) {
      return null
    }

    stagedNoticeListUpdate.value = null
    if (stagedUpdate.querySignature !== querySignature) {
      return null
    }

    return stagedUpdate
  }

  const beginActivityRefreshRun = () => {
    const nextRunId = activityRefreshRunId.value + 1
    activityRefreshRunId.value = nextRunId
    return nextRunId
  }

  const markNoticeRefreshPresentationCancelled =
    refreshPresentationRuntime.markRefreshPresentationCancelled

  const startNoticePullRefreshPresentation = async (
    runPresentation: (presentationRunId: number) => Promise<void>
  ) => {
    await refreshPresentationRuntime.startRefreshPresentation(
      (presentationRunId) => runPresentation(presentationRunId),
      { awaitCompletion: true }
    )
  }

  const waitForNoticeRefreshPresentationSettled = async (
    targetReplayRequestId: number,
    targetPresentationRunId: number
  ) => {
    await refreshPresentationRuntime.waitForRefreshPresentationSettled({
      targetRunId: targetPresentationRunId,
      isSettled: () => isNoticeRefreshPresentationSettled(targetReplayRequestId),
      pollIntervalMs: 16,
    })
  }

  const waitForRefreshPresentation = () => refreshPresentationRuntime.waitForRefreshPresentation()

  const clearActivityScenePatchMotionTimeout = () => {
    if (!activityScenePatchMotionTimeoutId) {
      return
    }

    clearTimeout(activityScenePatchMotionTimeoutId)
    activityScenePatchMotionTimeoutId = null
  }

  const triggerActivityScenePatchMotionReduction = (modules: HomeRailActivitySceneModuleKey[]) => {
    if (
      !modules.some(
        (moduleKey) =>
          moduleKey === 'leadEntry' ||
          moduleKey === 'drawEntry' ||
          moduleKey === 'inlineEntry' ||
          moduleKey === 'entryShell'
      )
    ) {
      return
    }

    clearActivityScenePatchMotionTimeout()
    isActivityScenePatchMotionReduced.value = true
    activityScenePatchMotionTimeoutId = setTimeout(() => {
      activityScenePatchMotionTimeoutId = null
      isActivityScenePatchMotionReduced.value = false
    }, 360)
  }

  const resetActivityRuntimeForInactive = () => {
    refreshPresentationRuntime.resetRefreshPresentationRuntimeForInactive()
    clearStagedNoticeListUpdate()
  }

  const disposeActivityRuntime = () => {
    resetActivityRuntimeForInactive()
    clearActivityScenePatchMotionTimeout()
  }

  return {
    activityRefreshRunId,
    isActivityScenePatchMotionReduced,
    beginActivityRefreshRun,
    clearStagedNoticeListUpdate,
    stageNoticeListUpdate,
    consumeStagedNoticeListUpdate,
    startNoticePullRefreshPresentation,
    waitForNoticeRefreshPresentationSettled,
    waitForRefreshPresentation,
    markNoticeRefreshPresentationCancelled,
    triggerActivityScenePatchMotionReduction,
    resetActivityRuntimeForInactive,
    disposeActivityRuntime,
  }
}
