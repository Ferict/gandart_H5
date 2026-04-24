/**
 * Responsibility: co-locate home rail market result-stage window and presentation-state wiring.
 * Out of scope: query state, remote list loading, scene lifecycle, and visual reveal internals.
 */
import { useHomeMarketResultWindow } from './useHomeMarketResultWindow'
import { useHomeMarketResultWindowPresentationRuntime } from './useHomeMarketResultWindowPresentationRuntime'
import { useHomeRailHomePresentationState } from './useHomeRailHomePresentationState'

type HomeMarketResultWindowOptions = Parameters<typeof useHomeMarketResultWindow>[0]
type HomePresentationStateOptions = Parameters<typeof useHomeRailHomePresentationState>[0]
type HomeMarketResultPresentationOptions = Parameters<
  typeof useHomeMarketResultWindowPresentationRuntime
>[0]

interface UseHomeRailHomeMarketResultRuntimeOptions {
  resultWindow: HomeMarketResultWindowOptions
  presentation: HomePresentationStateOptions
  resultPresentation: Omit<
    HomeMarketResultPresentationOptions,
    | 'isMarketExhausted'
    | 'displayedCollection'
    | 'hasMoreMarketItems'
    | 'marketResultTotal'
    | 'marketCardEntryPhaseMap'
    | 'marketPlaceholderCardIdSet'
    | 'marketResultMotionSource'
    | 'marketCurrentEnterAddedIdSet'
    | 'mountedMarketItems'
    | 'isMarketPaginationChainLoading'
  >
}

export const useHomeRailHomeMarketResultRuntime = (
  options: UseHomeRailHomeMarketResultRuntimeOptions
) => {
  const homeMarketResultWindow = useHomeMarketResultWindow(options.resultWindow)

  const homeMarketPresentationState = useHomeRailHomePresentationState({
    ...options.presentation,
  })

  const homeMarketResultPresentationRuntime = useHomeMarketResultWindowPresentationRuntime({
    ...options.resultPresentation,
    isMarketExhausted: homeMarketResultWindow.isMarketExhausted,
    displayedCollection: homeMarketResultWindow.displayedCollection,
    hasMoreMarketItems: homeMarketResultWindow.hasMoreMarketItems,
    marketResultTotal: homeMarketResultWindow.marketResultTotal,
    marketCardEntryPhaseMap: homeMarketResultWindow.marketCardEntryPhaseMap,
    marketPlaceholderCardIdSet: homeMarketResultWindow.marketPlaceholderCardIdSet,
    marketResultMotionSource: homeMarketResultWindow.marketResultMotionSource,
    marketCurrentEnterAddedIdSet: homeMarketResultWindow.marketCurrentEnterAddedIdSet,
    mountedMarketItems: homeMarketResultWindow.mountedMarketItems,
    isMarketPaginationChainLoading: homeMarketResultWindow.isMarketPaginationChainLoading,
  })

  return {
    ...homeMarketResultWindow,
    ...homeMarketPresentationState,
    ...homeMarketResultPresentationRuntime,
  }
}
