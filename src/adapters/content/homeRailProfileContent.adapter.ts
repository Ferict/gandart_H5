/**
 * Responsibility: normalize profile rail DTO blocks and profile asset list items into view models.
 * Out of scope: list query orchestration, scope switching, and persistent cache side effects.
 */
import type {
  ContentAssetDto,
  ContentListItemDtoBase,
  ContentProfileAssetCategoryDto,
  ContentProfileAssetPayloadDto,
  ContentProfileAssetsBlockDto,
  ContentProfileCategoryId,
  ContentProfileSummaryBlockDto,
  ContentSceneDto,
} from '../../contracts/content-api.contract'
import type {
  HomeRailProfileContent,
  ProfileAssetItem,
  ProfileCategory,
  ProfileCategoryKey,
  ProfileSummary,
} from '../../models/home-rail/homeRailProfile.model'
import type { ContentTargetRef } from '../../models/content/contentTarget.model'
import { resolvePriceSymbol } from '../../utils/priceSymbol.util'
import { adaptContentTarget } from './contentTarget.adapter'

const profileShell: HomeRailProfileContent = {
  summary: {
    displayName: '',
    summary: '',
    currency: 'CNY',
    totalValue: '0',
    holdings: '0',
    address: '',
  },
  categories: [],
  assets: {
    collections: [],
    blindBoxes: [],
  },
}

const isProfileCategoryKey = (value: string): value is ProfileCategoryKey => {
  return value === 'collections' || value === 'blindBoxes'
}

const isContentProfileCategoryId = (value: string): value is ContentProfileCategoryId => {
  return value === 'collections' || value === 'blindBoxes'
}

const formatCurrencyValue = (priceInCent: number): string => {
  return Math.round(priceInCent / 100).toLocaleString('en-US')
}

const resolveCurrencyUnit = resolvePriceSymbol

const normalizeProfileCategoryLabel = (
  categoryId: ContentProfileCategoryId,
  label: string
): string => {
  const normalizedLabel = label.trim()
  return normalizedLabel || categoryId
}

const resolveAssetUrl = (asset: ContentAssetDto | null | undefined): string => {
  if (!asset) {
    return ''
  }

  return asset.variants?.card ?? asset.originalUrl
}

export const adaptHomeRailProfileTargetDto = (
  target?: Parameters<typeof adaptContentTarget>[0]
): ContentTargetRef | undefined => {
  if (!target) {
    return undefined
  }

  if (target.targetType === 'profile_asset') {
    const targetCategory = target.params?.category
    if (!targetCategory || !isContentProfileCategoryId(targetCategory)) {
      return undefined
    }

    const normalizedSubCategory = target.params?.subCategory?.trim()
    const normalizedSeriesId = target.params?.seriesId?.trim()
    return {
      targetType: 'profile_asset',
      targetId: target.targetId,
      provider: target.provider,
      params: {
        category: targetCategory,
        ...(normalizedSubCategory ? { subCategory: normalizedSubCategory } : {}),
        ...(normalizedSeriesId ? { seriesId: normalizedSeriesId } : {}),
      },
    }
  }

  return adaptContentTarget(target)
}

export const adaptHomeRailProfileSummaryBlockDto = (
  block?: ContentProfileSummaryBlockDto
): ProfileSummary => {
  if (!block) {
    return { ...profileShell.summary }
  }

  return {
    displayName: block.displayName,
    summary: block.summary?.trim() ?? '',
    currency: block.currency,
    totalValue: formatCurrencyValue(block.totalValueInCent),
    holdings: String(block.holdingsCount),
    address: block.address,
    networkLabel: block.networkLabel,
    statusLabel: block.statusLabel,
    qrPayload: block.qrPayload,
    shareTarget: adaptHomeRailProfileTargetDto(block.shareTarget),
  }
}

const resolveCategorySubCategories = (category: ContentProfileAssetCategoryDto): string[] => {
  return category.subCategories.map((subCategory) => subCategory.trim()).filter(Boolean)
}

export const adaptHomeRailProfileCategoriesBlockDto = (
  block?: ContentProfileAssetsBlockDto
): ProfileCategory[] => {
  if (!block) {
    return []
  }

  return block.categories.map<ProfileCategory>((category) => ({
    id: category.categoryId as ProfileCategoryKey,
    label: normalizeProfileCategoryLabel(category.categoryId, category.categoryName),
    subCategories: resolveCategorySubCategories(category),
  }))
}

export const adaptHomeRailProfileAssetListItemDto = (
  item: ContentListItemDtoBase<'profile_asset'>
): ProfileAssetItem | null => {
  const payload: ContentProfileAssetPayloadDto = item.payload
  if (!isProfileCategoryKey(payload.categoryId)) {
    return null
  }

  return {
    id: item.resourceId,
    name: item.title,
    date: payload.acquiredAt || item.updatedAt,
    subCategory: payload.subCategory,
    ...(payload.seriesId ? { seriesId: payload.seriesId } : {}),
    holdingsCount: payload.holdingsCount,
    priceUnit: resolveCurrencyUnit(payload.currency),
    price: Math.round(payload.priceInCent / 100),
    editionCode: payload.editionCode,
    issueCount: payload.issueCount,
    imageUrl: resolveAssetUrl(item.asset),
    placeholderIconKey: payload.placeholderIconKey,
    visualTone: payload.visualTone,
    badge:
      payload.badgeType && payload.badgeLabel
        ? { tone: payload.badgeType, label: payload.badgeLabel }
        : undefined,
    assetId: payload.assetId,
    linkedMarketItemId: payload.linkedMarketItemId,
    target: adaptHomeRailProfileTargetDto(item.target),
  }
}

export const adaptHomeRailProfileAssetsBlockDto = (
  block?: ContentProfileAssetsBlockDto
): Record<ProfileCategoryKey, ProfileAssetItem[]> => {
  const assetMap: Record<ProfileCategoryKey, ProfileAssetItem[]> = {
    collections: [],
    blindBoxes: [],
  }

  if (!block) {
    return assetMap
  }

  block.items.forEach((item) => {
    if (!isProfileCategoryKey(item.categoryId)) {
      return
    }

    assetMap[item.categoryId].push({
      id: item.itemId,
      name: item.title,
      date: item.acquiredAt,
      subCategory: item.subCategory,
      ...(item.seriesId ? { seriesId: item.seriesId } : {}),
      holdingsCount: item.holdingsCount,
      priceUnit: resolveCurrencyUnit(item.currency),
      price: Math.round(item.priceInCent / 100),
      editionCode: item.editionCode,
      issueCount: item.issueCount,
      imageUrl: resolveAssetUrl(item.asset),
      placeholderIconKey: item.placeholderIconKey,
      visualTone: item.visualTone,
      badge:
        item.badgeType && item.badgeLabel
          ? { tone: item.badgeType, label: item.badgeLabel }
          : undefined,
      assetId: item.assetId,
      linkedMarketItemId: item.linkedMarketItemId,
      target: adaptHomeRailProfileTargetDto(item.target),
    })
  })

  return assetMap
}

export const adaptHomeRailProfileSceneDto = (scene: ContentSceneDto): HomeRailProfileContent => {
  const summaryBlock = scene.blocks.find((item) => item.blockType === 'profile_summary') as
    | ContentProfileSummaryBlockDto
    | undefined
  const assetsBlock = scene.blocks.find((item) => item.blockType === 'profile_assets') as
    | ContentProfileAssetsBlockDto
    | undefined

  return {
    summary: adaptHomeRailProfileSummaryBlockDto(summaryBlock),
    categories: adaptHomeRailProfileCategoriesBlockDto(assetsBlock),
    assets: adaptHomeRailProfileAssetsBlockDto(assetsBlock),
  }
}

export const createHomeRailProfileContentShell = (): HomeRailProfileContent => ({
  summary: { ...profileShell.summary },
  categories: profileShell.categories.map((item) => ({
    ...item,
    subCategories: [...item.subCategories],
  })),
  assets: {
    collections: profileShell.assets.collections.map((item) => ({ ...item })),
    blindBoxes: profileShell.assets.blindBoxes.map((item) => ({ ...item })),
  },
})
