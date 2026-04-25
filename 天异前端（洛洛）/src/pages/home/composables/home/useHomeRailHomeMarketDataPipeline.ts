/**
 * Responsibility: assemble the home market query and remote-list pipeline used by the parent
 * home panel runtime, including dependency wiring and entry-point bridges.
 * Out of scope: market result windows, scene patching, reload orchestration, and template logic.
 */
import type { ComputedRef } from 'vue'
import type {
  HomeMarketCard,
  HomeMarketTag,
  HomeRailHomeContent,
} from '../../../../models/home-rail/homeRailHome.model'
import type {
  HomeRailMarketCardListResult,
  ResolveHomeRailMarketCardListInput,
} from '../../../../services/home-rail/homeRailHomeContent.service'
import { useHomeMarketQueryState } from './useHomeMarketQueryState'
import { useHomeMarketRemoteListState } from './useHomeMarketRemoteListState'

interface UseHomeRailHomeMarketDataPipelineOptions {
  marketContent: ComputedRef<HomeRailHomeContent['market']>
  marketTags: ComputedRef<HomeMarketTag[]>
  resolveHasBootstrappedMarketResults: () => boolean
  scheduleMarketMountWindowSync: () => void
  emitMarketSearchClick: () => void
  emitMarketSortClick: () => void
  emitMarketTagSelect: (tagLabel: string, index: number) => void
  defaultSortLabel: string
  remotePageSize: number
  syncMarketListQuerySnapshot: (query: ResolveHomeRailMarketCardListInput) => void
  syncResolvedMarketListSnapshot: (
    query: ResolveHomeRailMarketCardListInput,
    result: HomeRailMarketCardListResult,
    etag?: string
  ) => void
  resolveCurrentMarketCollection: () => HomeMarketCard[]
  resolveCurrentPendingCollectionLength: () => number
  resolveCurrentMarketResultTotal: () => number
  setMarketCollection: (items: HomeMarketCard[]) => void
  hydratePersistedMarketListSnapshot?: (
    query: ResolveHomeRailMarketCardListInput
  ) => Promise<HomeRailMarketCardListResult | null>
  persistResolvedMarketListSnapshot?: (
    query: ResolveHomeRailMarketCardListInput,
    list: HomeRailMarketCardListResult
  ) => Promise<void> | void
}

export const useHomeRailHomeMarketDataPipeline = (
  options: UseHomeRailHomeMarketDataPipelineOptions
) => {
  const homeMarketQueryState = useHomeMarketQueryState({
    marketContent: options.marketContent,
    marketTags: options.marketTags,
    resolveHasBootstrappedMarketResults: options.resolveHasBootstrappedMarketResults,
    scheduleMarketMountWindowSync: options.scheduleMarketMountWindowSync,
    emitMarketSearchClick: options.emitMarketSearchClick,
    emitMarketSortClick: options.emitMarketSortClick,
    emitMarketTagSelect: options.emitMarketTagSelect,
    defaultSortLabel: options.defaultSortLabel,
    pageSize: options.remotePageSize,
  })

  const homeMarketRemoteListState = useHomeMarketRemoteListState({
    remotePageSize: options.remotePageSize,
    resolveMarketListRequestBase: () => homeMarketQueryState.resolveMarketListRequestBase(),
    resolveMarketListQuerySnapshot: () => homeMarketQueryState.resolveMarketListQuerySnapshot(),
    resolveMarketListQuerySignature: () => homeMarketQueryState.marketListQuerySignature.value,
    syncMarketListQuerySnapshot: options.syncMarketListQuerySnapshot,
    syncResolvedMarketListSnapshot: options.syncResolvedMarketListSnapshot,
    resolveCurrentMarketCollection: options.resolveCurrentMarketCollection,
    resolveCurrentPendingCollectionLength: options.resolveCurrentPendingCollectionLength,
    resolveCurrentMarketResultTotal: options.resolveCurrentMarketResultTotal,
    setMarketCollection: options.setMarketCollection,
    hydratePersistedMarketListSnapshot: options.hydratePersistedMarketListSnapshot,
    persistResolvedMarketListSnapshot: options.persistResolvedMarketListSnapshot,
  })

  return {
    homeMarketQueryState,
    homeMarketRemoteListState,
  }
}
