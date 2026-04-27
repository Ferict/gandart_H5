/**
 * Responsibility: assemble the activity notice query and remote-list pipeline, including local
 * snapshot bridge wiring used by the parent panel runtime.
 * Out of scope: read bridge behavior, result-window timing, scene patching, and template logic.
 */
import type { ComputedRef } from 'vue'
import type {
  ActivityNoticeListResult,
  HomeRailActivityContent,
} from '../../../../models/home-rail/homeRailActivity.model'
import type { ActivityNoticeQuerySnapshot } from './useActivityNoticeRemoteListState'
import { useActivityNoticeQueryState } from './useActivityNoticeQueryState'
import { useActivityNoticeRemoteListState } from './useActivityNoticeRemoteListState'

interface UseHomeRailActivityNoticeDataPipelineOptions {
  content: { value: HomeRailActivityContent }
  isActive: ComputedRef<boolean>
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
  })

  const activityNoticeRemoteListState = useActivityNoticeRemoteListState({
    resolveIsActive: () => options.isActive.value,
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
