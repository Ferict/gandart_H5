/**
 * Responsibility: own the home market result-window enter-phase assembly,
 * including mounted-window sync, placeholder projection, overlay handoff,
 * no-motion bypass, and enter scheduling.
 * Out of scope: diff construction, switch gateway bookkeeping, and enter-runtime internals.
 */
import type { Ref } from 'vue'
import {
  buildResultWindowQueueIdSet,
  buildResultWindowStableSlotIdSet,
  resolveResultWindowEnterQueueItems,
  shouldReplayRetainedForResultSource,
  type CardQueuePhase,
  type ResultLoadSource,
  type ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'

type HomeMarketResultMotionSource = ResultLoadSource
type MarketCardEntryPhase = CardQueuePhase

interface UseHomeMarketResultWindowEnterPhaseAssemblyOptions {
  pendingCollection: Ref<HomeMarketCard[]>
  displayedCollection: Ref<HomeMarketCard[]>
  mountedMarketItems: Ref<HomeMarketCard[]>
  mountedMarketItemIdSet: Ref<Set<string>>
  marketPlaceholderCardIdSet: Ref<Set<string>>
  marketCurrentEnterAddedIdSet: Ref<Set<string>>
  marketPendingWindowDiff: Ref<ResultWindowDiff<HomeMarketCard> | null>
  marketResultSwitchRunId: Ref<number>
  marketResultMotionSource: Ref<HomeMarketResultMotionSource>
  marketTransitionPhase: Ref<'idle' | 'leaving' | 'entering'>
  hasBootstrappedMarketResults: Ref<boolean>
  marketEnterMotionTimeoutId: Ref<ReturnType<typeof setTimeout> | null>
  buildMarketWindowDiff: (nextCollection: HomeMarketCard[]) => ResultWindowDiff<HomeMarketCard>
  clearMarketLeaveMotionTimeout: () => void
  clearMarketQueuedInsertTimeouts: () => void
  clearMarketCardMotionTimeouts: (retainIds?: Set<string>) => void
  syncMarketRemovedOverlayItems: (
    diff: ResultWindowDiff<HomeMarketCard>,
    options?: { releaseStageHeightAfterClear?: boolean }
  ) => void
  syncMountedMarketWindow: (items?: HomeMarketCard[]) => void
  syncMarketCardEntryPhaseMap: (
    items?: HomeMarketCard[],
    resolvePhase?: (
      item: HomeMarketCard,
      currentPhase: MarketCardEntryPhase
    ) => MarketCardEntryPhase
  ) => void
  applyMarketCardRevealDiff: (diff: ResultWindowDiff<HomeMarketCard>) => void
  syncCurrentHomeVisualImages: () => void
  syncMarketCardRevealStates: (items?: HomeMarketCard[]) => void
  scheduleMarketQueuedInsertions: (diff: ResultWindowDiff<HomeMarketCard>, runId: number) => void
  hasFullMarketResultSwitchMotion: (source?: HomeMarketResultMotionSource) => boolean
  flushQueuedMarketSwitch: () => void
  scheduleMarketRetainedReplayEnter: (
    diff: ResultWindowDiff<HomeMarketCard>,
    runId: number,
    source: HomeMarketResultMotionSource
  ) => Promise<void> | void
  resolveMarketEnterMotionDurationMs: (items?: HomeMarketCard[]) => number
  finalizeMarketEnter: () => void
}

export const useHomeMarketResultWindowEnterPhaseAssembly = (
  options: UseHomeMarketResultWindowEnterPhaseAssemblyOptions
) => {
  const startMarketEnterPhase = (
    diff: ResultWindowDiff<HomeMarketCard> = options.marketPendingWindowDiff.value ??
      options.buildMarketWindowDiff(options.pendingCollection.value)
  ) => {
    const runId = options.marketResultSwitchRunId.value + 1
    options.marketResultSwitchRunId.value = runId
    options.clearMarketLeaveMotionTimeout()
    options.clearMarketQueuedInsertTimeouts()
    const retainIds = new Set(diff.nextWindow.map((item) => item.id))
    options.clearMarketCardMotionTimeouts(retainIds)
    options.marketCurrentEnterAddedIdSet.value = new Set(diff.addedIds)
    options.syncMarketRemovedOverlayItems(diff)
    options.displayedCollection.value = diff.nextWindow.slice()
    options.syncMountedMarketWindow(diff.nextWindow)
    options.marketPlaceholderCardIdSet.value = new Set(
      Array.from(buildResultWindowStableSlotIdSet(diff)).filter((itemId) =>
        options.mountedMarketItemIdSet.value.has(itemId)
      )
    )
    options.hasBootstrappedMarketResults.value = true
    const source = options.marketResultMotionSource.value
    const queueIds = buildResultWindowQueueIdSet(diff, source, options.mountedMarketItemIdSet.value)
    options.syncMarketCardEntryPhaseMap(options.displayedCollection.value, (item) => {
      if (diff.addedIds.has(item.id)) {
        return 'steady'
      }

      if (queueIds.has(item.id)) {
        return shouldReplayRetainedForResultSource(source) ? 'replay-prep' : 'entering'
      }

      return 'steady'
    })
    options.applyMarketCardRevealDiff(diff)
    options.syncCurrentHomeVisualImages()
    options.scheduleMarketQueuedInsertions(diff, runId)

    if (!diff.nextWindow.length) {
      options.marketTransitionPhase.value = 'idle'
      options.marketPendingWindowDiff.value = null
      options.marketCurrentEnterAddedIdSet.value = new Set()
      options.syncMarketRemovedOverlayItems(diff, { releaseStageHeightAfterClear: true })
      options.flushQueuedMarketSwitch()
      return
    }

    if (!options.hasFullMarketResultSwitchMotion()) {
      options.syncMarketCardEntryPhaseMap(options.displayedCollection.value, () => 'steady')
      options.marketTransitionPhase.value = 'idle'
      options.marketPendingWindowDiff.value = null
      options.marketCurrentEnterAddedIdSet.value = new Set()
      options.syncMarketCardRevealStates(options.mountedMarketItems.value)
      options.flushQueuedMarketSwitch()
      return
    }

    options.marketTransitionPhase.value = 'entering'
    options.syncMarketCardRevealStates(options.mountedMarketItems.value)
    void options.scheduleMarketRetainedReplayEnter(diff, runId, source)
    const enterQueueItems = resolveResultWindowEnterQueueItems(
      diff,
      source,
      options.mountedMarketItemIdSet.value
    )
    if (!enterQueueItems.length) {
      options.finalizeMarketEnter()
      return
    }

    options.marketEnterMotionTimeoutId.value = setTimeout(
      options.finalizeMarketEnter,
      options.resolveMarketEnterMotionDurationMs(enterQueueItems)
    )
  }

  return {
    startMarketEnterPhase,
  }
}
