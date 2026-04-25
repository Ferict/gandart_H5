/**
 * Responsibility: own removed-overlay lifecycle for the profile asset result-window,
 * including mounted-id filtering, delayed clear, and stage-height release handoff.
 * Out of scope: reveal sequencing, switch gateway decisions, and geometry math.
 */
import type { Ref } from 'vue'
import {
  buildResultWindowOverlayItems,
  type ResultWindowDiff,
  type ResultWindowOverlayItem,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'

interface UseProfileAssetResultWindowOverlayRuntimeOptions {
  mountedAssetIdSet: Ref<Set<string>>
  profileAssetRemovedOverlayItems: Ref<ResultWindowOverlayItem<ProfileAssetItem>[]>
  shouldReleaseProfileAssetResultsStageHeightOnOverlayClear: Ref<boolean>
  leaveDurationMs: number
  releaseProfileAssetResultsStageMinHeight: () => void
}

export const useProfileAssetResultWindowOverlayRuntime = (
  options: UseProfileAssetResultWindowOverlayRuntimeOptions
) => {
  let profileAssetRemovedOverlayClearTimeoutId: ReturnType<typeof setTimeout> | null = null

  const clearProfileAssetRemovedOverlayTimeout = () => {
    if (!profileAssetRemovedOverlayClearTimeoutId) {
      return
    }

    clearTimeout(profileAssetRemovedOverlayClearTimeoutId)
    profileAssetRemovedOverlayClearTimeoutId = null
  }

  const clearProfileAssetRemovedOverlayItems = () => {
    clearProfileAssetRemovedOverlayTimeout()
    options.profileAssetRemovedOverlayItems.value = []
    if (options.shouldReleaseProfileAssetResultsStageHeightOnOverlayClear.value) {
      options.shouldReleaseProfileAssetResultsStageHeightOnOverlayClear.value = false
      options.releaseProfileAssetResultsStageMinHeight()
    }
  }

  const syncProfileAssetRemovedOverlayItems = (
    diff: ResultWindowDiff<ProfileAssetItem>,
    syncOptions: { releaseStageHeightAfterClear?: boolean; mountedIds?: Set<string> } = {}
  ) => {
    clearProfileAssetRemovedOverlayTimeout()
    const mountedIds = syncOptions.mountedIds ?? options.mountedAssetIdSet.value
    const overlayItems = buildResultWindowOverlayItems(diff).filter((overlayItem) =>
      mountedIds.has(overlayItem.id)
    )
    options.profileAssetRemovedOverlayItems.value = overlayItems
    options.shouldReleaseProfileAssetResultsStageHeightOnOverlayClear.value = Boolean(
      syncOptions.releaseStageHeightAfterClear
    )

    if (!overlayItems.length) {
      if (options.shouldReleaseProfileAssetResultsStageHeightOnOverlayClear.value) {
        options.shouldReleaseProfileAssetResultsStageHeightOnOverlayClear.value = false
        options.releaseProfileAssetResultsStageMinHeight()
      }
      return
    }

    profileAssetRemovedOverlayClearTimeoutId = setTimeout(() => {
      clearProfileAssetRemovedOverlayTimeout()
      options.profileAssetRemovedOverlayItems.value = []
      if (options.shouldReleaseProfileAssetResultsStageHeightOnOverlayClear.value) {
        options.shouldReleaseProfileAssetResultsStageHeightOnOverlayClear.value = false
        options.releaseProfileAssetResultsStageMinHeight()
      }
    }, options.leaveDurationMs)
  }

  return {
    clearProfileAssetRemovedOverlayItems,
    syncProfileAssetRemovedOverlayItems,
  }
}
