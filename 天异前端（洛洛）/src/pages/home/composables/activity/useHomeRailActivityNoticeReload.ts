/**
 * Responsibility: host the activity notice list reload and retry shell used by the parent panel
 * so refresh entry points stay out of the component body.
 * Out of scope: query ownership, page lifecycle orchestration, and presentation derivation.
 */
import type { Ref } from 'vue'
import type { ActivityNoticeListResult } from '../../../../models/home-rail/homeRailActivity.model'
import type { ActivityNoticeRemoteListResult } from './useActivityNoticeRemoteListState'

type ActivityNoticeMotionSource = 'initial-enter' | 'manual-query-switch' | 'manual-refresh'

interface UseHomeRailActivityNoticeReloadOptions {
  hasResolvedRemoteNoticeList: Ref<boolean>
  remoteFilteredNoticeList: Ref<ActivityNoticeListResult | null>
  reloadRemoteActivityNoticeList: (options?: {
    force?: boolean
    replay?: boolean
    motionSource?: ActivityNoticeMotionSource
  }) => Promise<ActivityNoticeRemoteListResult | null>
  requestActivityNoticeRefreshReplay: () => void
  applyResolvedActivityNoticeList: (
    result: Pick<ActivityNoticeListResult, 'list' | 'total'>,
    options?: { replay?: boolean; motionSource?: ActivityNoticeMotionSource }
  ) => void
}

export const useHomeRailActivityNoticeReload = (
  options: UseHomeRailActivityNoticeReloadOptions
) => {
  const reloadActivityNoticeListAndApply = async (
    params: {
      force?: boolean
      replay?: boolean
      motionSource?: ActivityNoticeMotionSource
    } = {}
  ) => {
    const nextListResult = await options.reloadRemoteActivityNoticeList({
      force: params.force,
      replay: params.replay,
      motionSource: params.motionSource,
    })
    if (!nextListResult) {
      return null
    }
    if (nextListResult.notModified) {
      if (
        params.replay &&
        options.hasResolvedRemoteNoticeList.value &&
        options.remoteFilteredNoticeList.value
      ) {
        options.requestActivityNoticeRefreshReplay()
      }
      return nextListResult
    }

    options.applyResolvedActivityNoticeList(
      {
        list: nextListResult.list,
        total: nextListResult.total,
      },
      {
        replay: params.replay,
        motionSource: params.motionSource,
      }
    )
    return nextListResult
  }

  const handleNoticeFirstScreenRetry = () => {
    void reloadActivityNoticeListAndApply({
      force: true,
      motionSource: 'manual-query-switch',
    })
  }

  const handleActivityBottomRetry = () => {
    void reloadActivityNoticeListAndApply({
      force: true,
      motionSource: 'manual-query-switch',
    })
  }

  return {
    reloadActivityNoticeListAndApply,
    handleNoticeFirstScreenRetry,
    handleActivityBottomRetry,
  }
}
