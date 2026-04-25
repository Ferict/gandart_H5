/**
 * Responsibility: host the home market list reload and retry shell so reload entry points stay
 * out of the parent panel runtime.
 * Out of scope: query ownership, content lifecycle orchestration, and template structure.
 */
import type { Ref } from 'vue'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import type { HomeRailMarketCardListResult } from '../../../../services/home-rail/homeRailHomeContent.service'
import type { HomeMarketResultMotionSource } from './useHomeMarketQueryState'

interface UseHomeRailHomeMarketReloadOptions {
  clearMarketListQueryDebounce: () => void
  clearStagedMarketListUpdate: () => void
  reloadRemoteMarketList: (options?: {
    force?: boolean
  }) => Promise<HomeRailMarketCardListResult | null>
  hasBootstrappedMarketResults: Ref<boolean>
  marketCollection: Ref<HomeMarketCard[]>
  marketResultTotal: Ref<number>
  replaceMarketCollectionImmediately: (
    nextCollection: HomeMarketCard[],
    options?: { preserveVisibleCount?: boolean }
  ) => void
  applyResolvedMarketListResult: (
    list: HomeRailMarketCardListResult,
    options?: {
      preserveVisibleCount?: boolean
      immediate?: boolean
      forceReplay?: boolean
      motionSource?: HomeMarketResultMotionSource
    }
  ) => void
  scheduleMarketLoadMoreObserver: () => void
  appendVisibleMarketItems: (options?: { manual?: boolean }) => Promise<void>
}

export const useHomeRailHomeMarketReload = (options: UseHomeRailHomeMarketReloadOptions) => {
  const reloadMarketList = async (
    params: {
      preserveVisibleCount?: boolean
      immediate?: boolean
      forceReplay?: boolean
      motionSource?: HomeMarketResultMotionSource
      force?: boolean
    } = {}
  ) => {
    options.clearMarketListQueryDebounce()
    options.clearStagedMarketListUpdate()
    const list = await options.reloadRemoteMarketList({ force: params.force ?? true })
    if (!list || list.notModified) {
      if (!options.hasBootstrappedMarketResults.value) {
        options.marketCollection.value = []
        options.marketResultTotal.value = 0
        options.replaceMarketCollectionImmediately([])
      }
      void options.scheduleMarketLoadMoreObserver()
      return
    }

    options.applyResolvedMarketListResult(list, params)
    void options.scheduleMarketLoadMoreObserver()
  }

  const handleHomeMarketFirstScreenRetry = () => {
    void reloadMarketList({
      immediate: true,
      forceReplay: true,
      motionSource: 'manual-refresh',
    })
  }

  const handleHomeMarketLoadMoreRetry = () => {
    void options.appendVisibleMarketItems({ manual: true })
  }

  return {
    reloadMarketList,
    handleHomeMarketFirstScreenRetry,
    handleHomeMarketLoadMoreRetry,
  }
}
