/**
 * Responsibility: define the mock profile-scene source records that describe owned assets,
 * profile summary payloads, and profile-target metadata for content.mock scenes.
 * Out of scope: scene response assembly, persistent cache behavior, and UI presentation derivation.
 */
import type {
  ContentProfileCategoryId,
  ContentTargetDto,
} from '../../../contracts/content-api.contract'
import { ownedHomeCollectionCatalog } from '../shared-home-collection-catalog'

export interface ProfileSceneAssetRecord {
  itemId: string
  title: string
  acquiredAt: string
  subCategory: string
  categoryId: ContentProfileCategoryId
  holdingsCount: number
  currency: 'CNY'
  priceInCent: number
  editionCode: 'LTD' | 'BOX' | 'PASS'
  issueCount: number
  placeholderIconKey?: (typeof ownedHomeCollectionCatalog)[number]['placeholderIconKey']
  visualTone: (typeof ownedHomeCollectionCatalog)[number]['visualTone']
  badgeType?: (typeof ownedHomeCollectionCatalog)[number]['badgeType']
  badgeLabel?: (typeof ownedHomeCollectionCatalog)[number]['badgeLabel']
  assetId?: string
  linkedMarketItemId?: string
  target?: ContentTargetDto
}

export interface ProfileSceneDb {
  sceneId: 'profile'
  version: number
  updatedAt: string
  summary: {
    displayName: string
    address: string
    summary?: string
    currency: string
    totalValueInCent: number
    holdingsCount: number
    networkLabel?: string
    statusLabel?: string
    qrPayload?: string
    shareTarget?: ContentTargetDto
  }
  assets: {
    categories: Array<{
      categoryId: ContentProfileCategoryId
      categoryName: string
      subCategories?: string[]
    }>
    subCategories: string[]
    items: ProfileSceneAssetRecord[]
  }
}

const profileSceneItems: ProfileSceneAssetRecord[] = ownedHomeCollectionCatalog.map((item) => ({
  itemId: item.itemId,
  title: item.title,
  acquiredAt: item.acquiredAt ?? item.updatedAt.slice(0, 10).replace(/-/g, '.'),
  subCategory: item.profileSubCategory,
  categoryId: item.profileCategoryId,
  holdingsCount: 1,
  currency: item.currency,
  priceInCent: item.priceInCent,
  editionCode: item.editionCode,
  issueCount: item.issueCount,
  placeholderIconKey: item.placeholderIconKey,
  visualTone: item.visualTone,
  badgeType: item.badgeType,
  badgeLabel: item.badgeLabel,
  assetId: item.assetId,
  linkedMarketItemId: item.linkedMarketItemId,
  target: {
    targetType: 'profile_asset',
    targetId: item.itemId,
    provider: 'content',
    params: {
      category: item.profileCategoryId,
      subCategory: item.profileSubCategory,
    },
  },
}))

const profileSubCategories = ['全部', ...new Set(profileSceneItems.map((item) => item.subCategory))]
const profileSubCategoryByCategory = (categoryId: ContentProfileCategoryId) => [
  '全部',
  ...new Set(
    profileSceneItems
      .filter((item) => item.categoryId === categoryId)
      .map((item) => item.subCategory)
  ),
]
const totalValueInCent = ownedHomeCollectionCatalog.reduce((sum, item) => sum + item.priceInCent, 0)

/**
 * 个人中心暂未对接完成。
 * 这里从首页共享藏品目录抽取“已拥有”子集，作为预留链路，后续改动需要避免破坏同藏品关联。
 */
export const profileSceneDb: ProfileSceneDb = {
  sceneId: 'profile',
  version: 1,
  updatedAt: '2026-03-26T23:58:00+08:00',
  summary: {
    displayName: 'Kael_0x',
    address: '0x8A25C6D41C93B7F0A12E45C89D7E31B4AA3F3F92',
    summary: '当前地址用于承接账户资产、铸造结果与后续服务动作的统一归属。',
    currency: 'CNY',
    totalValueInCent,
    holdingsCount: profileSceneItems.length,
    networkLabel: 'AETHER ADDRESS',
    statusLabel: 'BOUND',
    qrPayload: 'ethereum:0x8A25C6D41C93B7F0A12E45C89D7E31B4AA3F3F92',
  },
  assets: {
    categories: [
      {
        categoryId: 'collections',
        categoryName: '资产',
        subCategories: profileSubCategoryByCategory('collections'),
      },
      {
        categoryId: 'blindBoxes',
        categoryName: '盲盒',
        subCategories: profileSubCategoryByCategory('blindBoxes'),
      },
      {
        categoryId: 'certificates',
        categoryName: '资格证',
        subCategories: profileSubCategoryByCategory('certificates'),
      },
    ],
    subCategories: profileSubCategories,
    items: profileSceneItems,
  },
}
