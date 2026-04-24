/**
 * Responsibility: derive pure presentation state for the profile rail, including first-screen
 * status, footer feedback, address preview, currency symbol, and quick action visibility.
 * Out of scope: remote list loading, load-more flow, visual reveal timing, and navigation effects.
 */

import { computed, type ComputedRef, type Ref } from 'vue'
import { normalizeContentUserScope } from '../../../../services/content/contentUserScope.service'
import type { HomeShellDrawerEntry } from '../../../../models/home-shell/homeShellMenu.model'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'

interface UseHomeRailProfilePresentationStateOptions {
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
  summaryCurrency: ComputedRef<string>
  profileAddress: ComputedRef<string>
  resolveCurrentPersistUserScope: () => string | null | undefined
  drawerEntries: ComputedRef<HomeShellDrawerEntry[]>
  addressSuffixLength: number
}

export const useHomeRailProfilePresentationState = (
  options: UseHomeRailProfilePresentationStateOptions
) => {
  const shouldShowProfileFirstScreenLoading = computed(() => {
    return (
      options.displayedAssets.value.length <= 0 &&
      options.isRemoteProfileAssetsLoading.value &&
      options.profileAssetLoadingPhase.value === 'first-screen'
    )
  })

  const shouldShowProfileFirstScreenError = computed(() => {
    return (
      options.displayedAssets.value.length <= 0 &&
      !options.isRemoteProfileAssetsLoading.value &&
      options.hasProfileAssetFirstScreenError.value
    )
  })

  const shouldShowProfileFirstScreenEmpty = computed(() => {
    return (
      options.displayedAssets.value.length <= 0 &&
      options.hasResolvedRemoteProfileAssets.value &&
      !options.isRemoteProfileAssetsLoading.value &&
      !options.hasProfileAssetFirstScreenError.value &&
      options.resolvedProfileAssetTotal.value <= 0
    )
  })

  const shouldShowProfileBottomError = computed(() => {
    return (
      options.displayedAssets.value.length > 0 &&
      options.hasProfileAssetPaginationError.value &&
      options.hasMoreProfileAssets.value &&
      !options.isRemoteProfileAssetsLoading.value &&
      !options.isProfileAssetPaginationChainLoading.value
    )
  })

  const shouldRenderProfileBottomEndline = computed(() => {
    return (
      options.shouldShowProfileBottomEndline.value && !options.hasProfileAssetPaginationError.value
    )
  })

  const shouldRenderProfileBottomFooter = computed(() => {
    return (
      options.displayedAssets.value.length > 0 &&
      (options.isProfileAssetPaginationChainLoading.value ||
        shouldShowProfileBottomError.value ||
        shouldRenderProfileBottomEndline.value)
    )
  })

  const profileBottomFooterMode = computed<'loading' | 'error' | 'endline'>(() => {
    if (options.isProfileAssetPaginationChainLoading.value) {
      return 'loading'
    }

    if (shouldShowProfileBottomError.value) {
      return 'error'
    }

    if (shouldRenderProfileBottomEndline.value) {
      return 'endline'
    }

    return 'loading'
  })

  const resolvedSummaryCurrencySymbol = computed(() => {
    const normalizedCurrency = (options.summaryCurrency.value || '').trim().toUpperCase()
    if (normalizedCurrency === 'USD') {
      return '$'
    }

    if (normalizedCurrency === 'EUR') {
      return '€'
    }

    if (normalizedCurrency === 'CNY') {
      return '¥'
    }

    return normalizedCurrency || '¥'
  })

  const profileAddressPreview = computed(() => {
    const address = options.profileAddress.value.trim()

    if (!address) {
      return {
        head: '',
        tail: '',
      }
    }

    if (address.includes('...') || address.length <= options.addressSuffixLength + 6) {
      return {
        head: address,
        tail: '',
      }
    }

    return {
      head: address.slice(0, -options.addressSuffixLength),
      tail: address.slice(-options.addressSuffixLength),
    }
  })

  const profileImageCacheUserScope = computed(() => {
    return (
      normalizeContentUserScope(options.profileAddress.value) ??
      options.resolveCurrentPersistUserScope() ??
      undefined
    )
  })

  const profileQuickActions = computed<HomeShellDrawerEntry[]>(() => {
    return options.drawerEntries.value.filter(
      (entry) => entry.id !== 'community' && entry.id !== 'settings'
    )
  })

  return {
    shouldShowProfileFirstScreenLoading,
    shouldShowProfileFirstScreenError,
    shouldShowProfileFirstScreenEmpty,
    shouldShowProfileBottomError,
    shouldRenderProfileBottomEndline,
    shouldRenderProfileBottomFooter,
    profileBottomFooterMode,
    resolvedSummaryCurrencySymbol,
    profileAddressPreview,
    profileImageCacheUserScope,
    profileQuickActions,
  }
}
