/**
 * Responsibility: assemble the top-section presentation state for HomeRailProfilePanel,
 * including summary copy, quick-action entries, and profile image cache scope.
 * Out of scope: result-window timing, remote fetching, and profile query ownership.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import { useResolvedHomeShellDrawerEntries } from '../../../../services/home-shell/homeShellMenuState.service'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import { useHomeRailProfilePresentationState } from './useHomeRailProfilePresentationState'

interface UseHomeRailProfileTopPresentationOptions {
  displayedAssets: Ref<ProfileAssetItem[]>
  isRemoteProfileAssetsLoading: Ref<boolean>
  profileAssetLoadingPhase: Ref<'idle' | 'first-screen' | 'pagination'>
  isProfileAssetPaginationChainLoading: ComputedRef<boolean>
  hasResolvedRemoteProfileAssets: Ref<boolean>
  hasProfileAssetFirstScreenError: Ref<boolean>
  hasProfileAssetPaginationError: Ref<boolean>
  hasMoreProfileAssets: ComputedRef<boolean>
  shouldShowProfileBottomEndline: ComputedRef<boolean>
  resolvedProfileAssetTotal: ComputedRef<number>
  resolveSummaryCurrency: () => string
  resolveProfileAddress: () => string
  resolveCurrentPersistUserScope: () => string | null
  addressSuffixLength: number
}

export const useHomeRailProfileTopPresentation = ({
  displayedAssets,
  isRemoteProfileAssetsLoading,
  profileAssetLoadingPhase,
  isProfileAssetPaginationChainLoading,
  hasResolvedRemoteProfileAssets,
  hasProfileAssetFirstScreenError,
  hasProfileAssetPaginationError,
  hasMoreProfileAssets,
  shouldShowProfileBottomEndline,
  resolvedProfileAssetTotal,
  resolveSummaryCurrency,
  resolveProfileAddress,
  resolveCurrentPersistUserScope,
  addressSuffixLength,
}: UseHomeRailProfileTopPresentationOptions) => {
  const drawerEntries = useResolvedHomeShellDrawerEntries('profile-quick-action')
  const profileSummaryCurrency = computed(() => resolveSummaryCurrency())
  const profileSummaryAddress = computed(() => resolveProfileAddress())

  const {
    shouldShowProfileFirstScreenLoading,
    shouldShowProfileFirstScreenError,
    shouldShowProfileFirstScreenEmpty,
    shouldRenderProfileBottomFooter,
    profileBottomFooterMode,
    resolvedSummaryCurrencySymbol,
    profileAddressPreview,
    profileImageCacheUserScope,
    profileQuickActions,
  } = useHomeRailProfilePresentationState({
    displayedAssets,
    isRemoteProfileAssetsLoading,
    profileAssetLoadingPhase,
    isProfileAssetPaginationChainLoading,
    hasResolvedRemoteProfileAssets,
    hasProfileAssetFirstScreenError,
    hasProfileAssetPaginationError,
    hasMoreProfileAssets,
    shouldShowProfileBottomEndline,
    resolvedProfileAssetTotal,
    summaryCurrency: profileSummaryCurrency,
    profileAddress: profileSummaryAddress,
    resolveCurrentPersistUserScope,
    drawerEntries,
    addressSuffixLength,
  })

  return {
    profileSummaryAddress,
    shouldShowProfileFirstScreenLoading,
    shouldShowProfileFirstScreenError,
    shouldShowProfileFirstScreenEmpty,
    shouldRenderProfileBottomFooter,
    profileBottomFooterMode,
    resolvedSummaryCurrencySymbol,
    profileAddressPreview,
    profileImageCacheUserScope,
    profileQuickActions,
  }
}
