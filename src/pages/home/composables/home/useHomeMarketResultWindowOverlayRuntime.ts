/**
 * Responsibility: own removed-overlay lifecycle for the home market result-window,
 * including overlay projection, delayed clear, and stage-height release handoff.
 * Out of scope: switch decisions, enter sequencing, and mounted-window geometry.
 */
import type { Ref } from 'vue'
import {
  buildResultWindowOverlayItems,
  type ResultWindowDiff,
  type ResultWindowOverlayItem,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'

interface UseHomeMarketResultWindowOverlayRuntimeOptions {
  marketRemovedOverlayItems: Ref<ResultWindowOverlayItem<HomeMarketCard>[]>
  shouldReleaseMarketResultsStageHeightOnOverlayClear: Ref<boolean>
  leaveDurationMs: number
  releaseMarketResultsStageHeightLock: () => void
}

export const useHomeMarketResultWindowOverlayRuntime = (
  options: UseHomeMarketResultWindowOverlayRuntimeOptions
) => {
  let marketRemovedOverlayClearTimeoutId: ReturnType<typeof setTimeout> | null = null

  const clearMarketRemovedOverlayTimeout = () => {
    if (!marketRemovedOverlayClearTimeoutId) {
      return
    }

    clearTimeout(marketRemovedOverlayClearTimeoutId)
    marketRemovedOverlayClearTimeoutId = null
  }

  const clearMarketRemovedOverlayItems = () => {
    clearMarketRemovedOverlayTimeout()
    options.marketRemovedOverlayItems.value = []
    if (options.shouldReleaseMarketResultsStageHeightOnOverlayClear.value) {
      options.shouldReleaseMarketResultsStageHeightOnOverlayClear.value = false
      options.releaseMarketResultsStageHeightLock()
    }
  }

  const syncMarketRemovedOverlayItems = (
    diff: ResultWindowDiff<HomeMarketCard>,
    syncOptions: { releaseStageHeightAfterClear?: boolean } = {}
  ) => {
    clearMarketRemovedOverlayTimeout()
    const overlayItems = buildResultWindowOverlayItems(diff)
    options.marketRemovedOverlayItems.value = overlayItems
    options.shouldReleaseMarketResultsStageHeightOnOverlayClear.value =
      syncOptions.releaseStageHeightAfterClear === true

    if (!overlayItems.length) {
      if (options.shouldReleaseMarketResultsStageHeightOnOverlayClear.value) {
        options.shouldReleaseMarketResultsStageHeightOnOverlayClear.value = false
        options.releaseMarketResultsStageHeightLock()
      }
      return
    }

    marketRemovedOverlayClearTimeoutId = setTimeout(() => {
      clearMarketRemovedOverlayTimeout()
      options.marketRemovedOverlayItems.value = []
      if (options.shouldReleaseMarketResultsStageHeightOnOverlayClear.value) {
        options.shouldReleaseMarketResultsStageHeightOnOverlayClear.value = false
        options.releaseMarketResultsStageHeightLock()
      }
    }, options.leaveDurationMs)
  }

  return {
    clearMarketRemovedOverlayItems,
    syncMarketRemovedOverlayItems,
  }
}
