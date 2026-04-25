/**
 * Responsibility: define the frontend-stable content target shape consumed by runtime,
 * navigation services, and UI-facing models after transport DTOs are normalized.
 * Out of scope: wire-contract field validation, route URL assembly, and provider bootstrap policy.
 */

export type ContentTargetProfileCategoryKey = 'collections' | 'blindBoxes'

export type ContentTargetType =
  | 'notice'
  | 'home_banner'
  | 'activity'
  | 'drop'
  | 'market_item'
  | 'asset'
  | 'category'
  | 'user_profile'
  | 'service_entry'
  | 'market_action'
  | 'service_action'
  | 'settings_action'
  | 'profile_asset'

export interface ContentTargetParams {
  category?: ContentTargetProfileCategoryKey
  subCategory?: string
  seriesId?: string
}

export interface ContentTargetRefBase {
  targetType: Exclude<ContentTargetType, 'profile_asset'>
  targetId: string
  provider?: string
}

export interface ContentProfileAssetTargetRef {
  targetType: 'profile_asset'
  targetId: string
  provider?: string
  params: {
    category: ContentTargetProfileCategoryKey
    subCategory?: string
    seriesId?: string
  }
}

export type ContentTargetRef = ContentTargetRefBase | ContentProfileAssetTargetRef
