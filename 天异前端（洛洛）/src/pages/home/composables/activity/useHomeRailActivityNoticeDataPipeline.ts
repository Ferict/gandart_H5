/**
 * Responsibility: assemble the activity notice query and remote-list pipeline, including local
 * snapshot bridge wiring used by the parent panel runtime.
 * Out of scope: read bridge behavior, result-window timing, scene patching, and template logic.
 */
import type { ComputedRef } from 'vue'
import type {
  ActivityDateFilterRange,
  ActivityNoticeListResult,
  HomeRailActivityContent,
} from '../../../../models/home-rail/homeRailActivity.model'
import type { ActivityNoticeQuerySnapshot } from './useActivityNoticeRemoteListState'
import { useActivityNoticeQueryState } from './useActivityNoticeQueryState'
import { useActivityNoticeRemoteListState } from './useActivityNoticeRemoteListState'

interface UseHomeRailActivityNoticeDataPipelineOptions {
  content: { value: HomeRailActivityContent }
  activeDateFilterRange: ComputedRef<ActivityDateFilterRange>
  syncResolvedNoticeSnapshot: (
    query: ActivityNoticeQuerySnapshot,
    list: ActivityNoticeListResult,
    etag?: string
  ) => void
  hydratePersistedNoticeListSnapshot?: (
    query: ActivityNoticeQuerySnapshot
  ) => Promise<ActivityNoticeListResult | null>
  persistResolvedNoticeListSnapshot?: (
    query: ActivityNoticeQuerySnapshot,
    list: ActivityNoticeListResult
  ) => Promise<void> | void
}

export const useHomeRailActivityNoticeDataPipeline = (
  options: UseHomeRailActivityNoticeDataPipelineOptions
) => {
  const activityNoticeQueryState = useActivityNoticeQueryState({
    content: options.content,
    activeDateFilterRange: options.activeDateFilterRange,
  })

  const activityNoticeRemoteListState = useActivityNoticeRemoteListState({
    resolveQuerySnapshot: activityNoticeQueryState.resolveActivityNoticeQuerySnapshot,
    syncResolvedNoticeSnapshot: options.syncResolvedNoticeSnapshot,
    hydratePersistedNoticeListSnapshot: options.hydratePersistedNoticeListSnapshot,
    persistResolvedNoticeListSnapshot: options.persistResolvedNoticeListSnapshot,
  })

  return {
    activityNoticeQueryState,
    activityNoticeRemoteListState,
  }
}
