/**
 * Responsibility: coordinate profile asset reload application, including query snapshot capture,
 * replay requests, and resolved-list handoff into the result window.
 * Out of scope: query editing, remote request execution details, and result-window timing internals.
 */
import type { Ref } from 'vue'
import type {
  HomeRailProfileAssetListResult,
  ResolveHomeRailProfileAssetListInput,
} from '../../../../services/home-rail/homeRailProfileContent.service'
import type {
  ProfileAssetResultMotionSource,
  ProfileAssetResultWindowListPayload,
} from './useProfileAssetResultWindow'

interface ReloadRemoteProfileAssetListOptions {
  force?: boolean
}

interface UseProfileAssetReloadCoordinatorOptions {
  resolveProfileAssetQuerySnapshot: () => ResolveHomeRailProfileAssetListInput
  reloadRemoteProfileAssetList: (
    query?: ResolveHomeRailProfileAssetListInput,
    options?: ReloadRemoteProfileAssetListOptions
  ) => Promise<HomeRailProfileAssetListResult | null>
  hasResolvedRemoteProfileAssets: Ref<boolean>
  requestProfileAssetRefreshReplay: () => void
  applyResolvedProfileAssetList: (
    result: ProfileAssetResultWindowListPayload,
    options?: { replay?: boolean; motionSource?: ProfileAssetResultMotionSource }
  ) => void
}

interface ReloadProfileAssetListAndApplyOptions {
  force?: boolean
  replay?: boolean
  motionSource?: ProfileAssetResultMotionSource
}

export const useProfileAssetReloadCoordinator = ({
  resolveProfileAssetQuerySnapshot,
  reloadRemoteProfileAssetList,
  hasResolvedRemoteProfileAssets,
  requestProfileAssetRefreshReplay,
  applyResolvedProfileAssetList,
}: UseProfileAssetReloadCoordinatorOptions) => {
  const reloadProfileAssetListAndApply = async (
    options: ReloadProfileAssetListAndApplyOptions = {}
  ) => {
    const querySnapshot = resolveProfileAssetQuerySnapshot()
    const result = await reloadRemoteProfileAssetList(querySnapshot, {
      force: options.force,
    })
    if (!result) {
      return null
    }

    if (result.notModified) {
      if (options.replay && hasResolvedRemoteProfileAssets.value) {
        requestProfileAssetRefreshReplay()
      }
      return result
    }

    applyResolvedProfileAssetList(result, {
      replay: options.replay,
      motionSource: options.motionSource,
    })
    return result
  }

  return {
    reloadProfileAssetListAndApply,
  }
}
