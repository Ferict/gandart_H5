/**
 * Responsibility: own profile asset result-window switch gateway, queued snapshot bookkeeping,
 * refresh replay bookkeeping, and no-replay reconciliation decisions without touching
 * enter/reveal timing internals.
 * Out of scope: enter queue sequencing, retained image replay, removed overlay lifecycle,
 * and inactive reset cleanup.
 */
import { ref, type ComputedRef, type Ref } from 'vue'
import type {
  ResultLoadSource,
  ResultWindowDiff,
} from '../../../../services/home-rail/homeRailResultWindow.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'

type ProfileAssetResultMotionSource = ResultLoadSource

export interface ProfileAssetResultWindowListPayload {
  items: ProfileAssetItem[]
  total: number
}

interface UseProfileAssetResultWindowSwitchGatewayOptions {
  hasResolvedInitialProfileContent: Ref<boolean>
  visibleAssets: ComputedRef<ProfileAssetItem[]>
  displayedAssets: Ref<ProfileAssetItem[]>
  pendingAssets: Ref<ProfileAssetItem[]>
  hasBootstrappedProfileAssets: Ref<boolean>
  profileAssetResultMotionSource: Ref<ProfileAssetResultMotionSource>
  profileAssetTransitionPhase: Ref<'idle' | 'entering'>
  pendingProfileAssetWindowDiff: Ref<ResultWindowDiff<ProfileAssetItem> | null>
  isRemoteProfileAssetsLoading: Ref<boolean>
  cloneProfileAssetList: (list: ProfileAssetItem[]) => ProfileAssetItem[]
  buildProfileAssetStructureSignature: (list: ProfileAssetItem[]) => string
  buildProfileAssetContentSignature: (list: ProfileAssetItem[]) => string
  bootstrapProfileAssetList: (list?: ProfileAssetItem[]) => void
  replaceProfileAssetListsImmediately: (nextAssets: ProfileAssetItem[]) => void
  syncProfileAssetListsWithoutReplay: (nextAssets: ProfileAssetItem[]) => void
  startProfileAssetResultSwitch: (nextAssets: ProfileAssetItem[]) => Promise<void> | void
  resetPreserveReadyProfileAssetRevealOnNextEnter: () => void
}

export const useProfileAssetResultWindowSwitchGateway = (
  options: UseProfileAssetResultWindowSwitchGatewayOptions
) => {
  const queuedProfileAssetSwitch = ref<ProfileAssetItem[] | null>(null)
  const profileAssetRefreshReplayRequestId = ref(0)
  const handledProfileAssetRefreshReplayRequestId = ref(0)

  const requestProfileAssetRefreshReplay = () => {
    options.resetPreserveReadyProfileAssetRevealOnNextEnter()
    profileAssetRefreshReplayRequestId.value += 1
  }

  const reconcileProfileAssetRender = (
    nextAssets: ProfileAssetItem[] = options.visibleAssets.value
  ) => {
    if (!options.hasResolvedInitialProfileContent.value) {
      return
    }

    const nextSnapshot = options.cloneProfileAssetList(nextAssets)
    const shouldForceRefreshReplay =
      profileAssetRefreshReplayRequestId.value !== handledProfileAssetRefreshReplayRequestId.value
    if (!options.hasBootstrappedProfileAssets.value) {
      options.bootstrapProfileAssetList(nextSnapshot)
      return
    }

    const nextStructureSignature = options.buildProfileAssetStructureSignature(nextSnapshot)
    const nextContentSignature = options.buildProfileAssetContentSignature(nextSnapshot)
    const displayedStructureSignature = options.buildProfileAssetStructureSignature(
      options.displayedAssets.value
    )
    const displayedContentSignature = options.buildProfileAssetContentSignature(
      options.displayedAssets.value
    )
    const pendingStructureSignature = options.buildProfileAssetStructureSignature(
      options.pendingAssets.value
    )
    const pendingContentSignature = options.buildProfileAssetContentSignature(
      options.pendingAssets.value
    )
    const shouldBypassManualQuerySwitchMotion =
      options.profileAssetResultMotionSource.value === 'manual-query-switch' &&
      !shouldForceRefreshReplay

    if (shouldBypassManualQuerySwitchMotion) {
      if (
        options.profileAssetTransitionPhase.value !== 'idle' ||
        nextStructureSignature !== displayedStructureSignature ||
        nextContentSignature !== displayedContentSignature
      ) {
        options.replaceProfileAssetListsImmediately(nextSnapshot)
        return
      }

      options.syncProfileAssetListsWithoutReplay(nextSnapshot)
      return
    }

    if (options.profileAssetTransitionPhase.value !== 'idle') {
      if (shouldForceRefreshReplay) {
        handledProfileAssetRefreshReplayRequestId.value = profileAssetRefreshReplayRequestId.value
        queuedProfileAssetSwitch.value = null
        void options.startProfileAssetResultSwitch(nextSnapshot)
        return
      }

      if (
        nextStructureSignature !== pendingStructureSignature ||
        nextContentSignature !== pendingContentSignature
      ) {
        queuedProfileAssetSwitch.value = nextSnapshot
        return
      }

      options.syncProfileAssetListsWithoutReplay(nextSnapshot)
      return
    }

    if (shouldForceRefreshReplay) {
      handledProfileAssetRefreshReplayRequestId.value = profileAssetRefreshReplayRequestId.value
      void options.startProfileAssetResultSwitch(nextSnapshot)
      return
    }

    if (
      nextStructureSignature !== displayedStructureSignature ||
      nextContentSignature !== displayedContentSignature
    ) {
      void options.startProfileAssetResultSwitch(nextSnapshot)
      return
    }

    options.syncProfileAssetListsWithoutReplay(nextSnapshot)
  }

  const applyResolvedProfileAssetList = (
    result: ProfileAssetResultWindowListPayload,
    applyOptions: { replay?: boolean; motionSource?: ProfileAssetResultMotionSource } = {}
  ) => {
    options.profileAssetResultMotionSource.value =
      applyOptions.motionSource ??
      (options.hasBootstrappedProfileAssets.value ? 'manual-query-switch' : 'initial-enter')

    if (applyOptions.replay) {
      requestProfileAssetRefreshReplay()
      return
    }

    options.hasBootstrappedProfileAssets.value = true
    void options.startProfileAssetResultSwitch(result.items)
  }

  const isProfileRefreshPresentationSettled = (targetReplayRequestId: number) => {
    return (
      !options.isRemoteProfileAssetsLoading.value &&
      options.profileAssetTransitionPhase.value === 'idle' &&
      handledProfileAssetRefreshReplayRequestId.value === targetReplayRequestId &&
      queuedProfileAssetSwitch.value === null &&
      options.pendingProfileAssetWindowDiff.value === null
    )
  }

  return {
    queuedProfileAssetSwitch,
    profileAssetRefreshReplayRequestId,
    handledProfileAssetRefreshReplayRequestId,
    requestProfileAssetRefreshReplay,
    reconcileProfileAssetRender,
    applyResolvedProfileAssetList,
    isProfileRefreshPresentationSettled,
  }
}
