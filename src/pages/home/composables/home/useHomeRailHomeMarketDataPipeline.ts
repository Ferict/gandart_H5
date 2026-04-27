/**
 * Responsibility: assemble the home market query and remote-list pipeline used by the parent
 * home panel runtime, including dependency wiring and entry-point bridges.
 * Out of scope: market result windows, scene patching, reload orchestration, and template logic.
 */
import type { ComputedRef } from 'vue'
import type { HomeMarketCard, HomeMarketTag } from '../../../../models/home-rail/homeRailHome.model'
import type {
  HomeRailMarketCardListResult,
  ResolveHomeRailMarketCardListInput,
} from '../../../../services/home-rail/homeRailHomeContent.service'
import { useHomeMarketQueryState } from './useHomeMarketQueryState'
import { useHomeMarketRemoteListState } from './useHomeMarketRemoteListState'

interface UseHomeRailHomeMarketDataPipelineOptions {
  marketTags: ComputedRef<HomeMarketTag[]>
  scheduleMarketMountWindowSync: () => void
  emitMarketSearchClick: () => void
  emitMarketTagSelect: (tagLabel: string, index: number) => void
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
    marketTags: options.marketTags,
    scheduleMarketMountWindowSync: options.scheduleMarketMountWindowSync,
    emitMarketSearchClick: options.emitMarketSearchClick,
    emitMarketTagSelect: options.emitMarketTagSelect,
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
