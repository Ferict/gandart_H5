/**
 * Responsibility: host profile rail navigation, quick actions, and detail URL building so
 * click wiring stays outside the parent profile panel.
 * Out of scope: list refresh, scene hydration, visual reveal, and result window runtime.
 */
import type { ComputedRef, Ref } from 'vue'
import {
  buildActionEntryUrl,
  buildContentResourceUrl,
  buildHomeServiceEntryUrl,
  navigateByUrlSafely,
  buildProfileAddressQrUrl,
  buildProfileAssetDetailUrl,
  buildProfileSettingsUrl,
} from '../../../../services/home-rail/homeRailNavigation.service'
import type {
  ProfileAssetItem,
  ProfileCategoryKey,
} from '../../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetHoldingInstanceViewModel } from './useProfileAssetHoldingsSheet'

interface UseHomeRailProfileNavigationOptions {
  activeCategory: Ref<ProfileCategoryKey>
  profileAddress: ComputedRef<string>
}

const safeNavigate = (url: string) => {
  navigateByUrlSafely(url)
}

const resolveProfileCategoryKey = (value?: string): ProfileCategoryKey | undefined => {
  if (!value) {
    return undefined
  }

  if (value === 'collections' || value === 'blindBoxes') {
    return value
  }

  return undefined
}

export const useHomeRailProfileNavigation = (options: UseHomeRailProfileNavigationOptions) => {
  const handleOpenCommunity = () => {
    safeNavigate(buildHomeServiceEntryUrl('community', 'profile-header-community'))
  }

  const handleOpenSettings = () => {
    safeNavigate(buildProfileSettingsUrl())
  }

  const handleCopyAddress = () => {
    uni.setClipboardData({
      data: options.profileAddress.value,
    })
  }

  const handleShowQr = () => {
    safeNavigate(buildProfileAddressQrUrl())
  }

  const handleQuickEntryClick = (url: string) => {
    safeNavigate(url)
  }

  const resolveProfileAssetDetailUrl = (
    item: ProfileAssetItem,
    instance?: ProfileAssetHoldingInstanceViewModel
  ): string => {
    const target = item.target
    const profileAssetTarget = target?.targetType === 'profile_asset' ? target : undefined
    const targetCategory = resolveProfileCategoryKey(profileAssetTarget?.params?.category)
    const resolvedCategory = targetCategory ?? options.activeCategory.value
    const resolvedItemId = profileAssetTarget?.targetId || item.id
    const targetSubCategory = profileAssetTarget?.params?.subCategory?.trim()
    return buildProfileAssetDetailUrl(
      resolvedItemId,
      resolvedCategory,
      item.name,
      targetSubCategory,
      instance?.id,
      instance?.serial,
      instance?.acquiredAtLabel
    )
  }

  const handleAssetClick = (item: ProfileAssetItem) => {
    if (item.target) {
      if (
        item.target.targetType === 'notice' ||
        item.target.targetType === 'home_banner' ||
        item.target.targetType === 'activity' ||
        item.target.targetType === 'drop' ||
        item.target.targetType === 'market_item'
      ) {
        safeNavigate(buildContentResourceUrl(item.target, 'profile-asset-card'))
        return
      }

      if (
        item.target.targetType === 'market_action' ||
        item.target.targetType === 'service_action' ||
        item.target.targetType === 'settings_action'
      ) {
        safeNavigate(buildActionEntryUrl(item.target, 'profile-asset-card'))
        return
      }

      if (item.target.targetType === 'profile_asset') {
        safeNavigate(resolveProfileAssetDetailUrl(item))
        return
      }
    }

    safeNavigate(resolveProfileAssetDetailUrl(item))
  }

  const handleAssetDetailNavigation = (item: ProfileAssetItem) => {
    safeNavigate(resolveProfileAssetDetailUrl(item))
  }

  const handleAssetInstanceDetailNavigation = (
    item: ProfileAssetItem,
    instance: ProfileAssetHoldingInstanceViewModel
  ) => {
    safeNavigate(resolveProfileAssetDetailUrl(item, instance))
  }

  return {
    handleOpenCommunity,
    handleOpenSettings,
    handleCopyAddress,
    handleShowQr,
    handleQuickEntryClick,
    resolveProfileAssetDetailUrl,
    handleAssetDetailNavigation,
    handleAssetInstanceDetailNavigation,
    handleAssetClick,
  }
}
