/**
 * Responsibility: normalize content-scene and asset-list resources into profile rail
 * view models, signatures, and query-facing list results.
 * Out of scope: scope transition policy, persistent cache orchestration, and page-local
 * result-window presentation or animation runtime.
 */
import type {
  ContentAssetDto,
  ContentListDto,
  ContentListDtoBase,
  ContentListItemDtoBase,
  ContentProfileAssetPayloadDto,
  ContentProfileAssetCategoryDto,
  ContentProfileAssetsBlockDto,
  ContentProfileCategoryId,
  ContentProfileSummaryBlockDto,
  ContentSceneDto,
  ContentTargetDto,
} from '../../contracts/content-api.contract'
import type {
  HomeRailProfileContent,
  ProfileAssetItem,
  ProfileCategory,
  ProfileCategoryKey,
  ProfileSummary,
} from '../../models/home-rail/homeRailProfile.model'
import { resolveContentListWithMeta, resolveContentScene } from '../content/content.service'
import {
  buildRailContentSignature,
  createRailSceneResolvedMeta,
  type RailSceneResolvedContent,
} from './homeRailPageReloadPolicy.service'

const isHomeRailProfileContentDev = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

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
    certificates: [],
  },
}

interface ResolveHomeRailProfileContentOptions {
  force?: boolean
}

export interface ResolveHomeRailProfileAssetListInput {
  categoryId?: ProfileCategoryKey | 'all'
  subCategory?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface HomeRailProfileAssetListResult {
  page: number
  pageSize: number
  total: number
  items: ProfileAssetItem[]
  etag?: string
  notModified?: boolean
}

export type HomeRailProfileSceneModuleKey = 'summary' | 'categories' | 'subCategories'

export const buildHomeRailProfileBlockSignatures = (
  content: HomeRailProfileContent
): Record<HomeRailProfileSceneModuleKey, string> => ({
  summary: buildRailContentSignature(content.summary),
  categories: buildRailContentSignature(
    content.categories.map((item) => ({ id: item.id, label: item.label }))
  ),
  subCategories: buildRailContentSignature(
    content.categories.map((item) => ({ id: item.id, subCategories: item.subCategories }))
  ),
})

let homeRailProfileResolvedContentInFlight: Promise<
  RailSceneResolvedContent<HomeRailProfileContent>
> | null = null

const cloneProfileShell = (): HomeRailProfileContent => ({
  summary: { ...profileShell.summary },
  categories: profileShell.categories.map((item) => ({
    ...item,
    subCategories: [...item.subCategories],
  })),
  assets: {
    collections: profileShell.assets.collections.map((item) => ({ ...item })),
    blindBoxes: profileShell.assets.blindBoxes.map((item) => ({ ...item })),
    certificates: profileShell.assets.certificates.map((item) => ({ ...item })),
  },
})

const isProfileCategoryKey = (value: string): value is ProfileCategoryKey => {
  return value === 'collections' || value === 'blindBoxes' || value === 'certificates'
}

const isContentProfileCategoryId = (value: string): value is ContentProfileCategoryId => {
  return value === 'collections' || value === 'blindBoxes' || value === 'certificates'
}

const formatCurrencyValue = (priceInCent: number): string => {
  return Math.round(priceInCent / 100).toLocaleString('en-US')
}

const resolveCurrencyUnit = (currency: string): string => {
  return currency === 'CNY' ? '¥' : currency
}

const normalizeProfileCategoryLabel = (
  categoryId: ContentProfileCategoryId,
  label: string
): string => {
  const normalizedLabel = label.trim()
  return normalizedLabel || categoryId
}

const toContentTarget = (target?: ContentTargetDto): ContentTargetDto | undefined => {
  if (!target) {
    return undefined
  }

  if (target.targetType === 'profile_asset') {
    const targetCategory = target.params?.category
    if (!targetCategory || !isContentProfileCategoryId(targetCategory)) {
      return undefined
    }

    const normalizedSubCategory = target.params?.subCategory?.trim()
    return {
      targetType: 'profile_asset',
      targetId: target.targetId,
      provider: target.provider,
      params: {
        category: targetCategory,
        ...(normalizedSubCategory ? { subCategory: normalizedSubCategory } : {}),
      },
    }
  }

  return {
    targetType: target.targetType,
    targetId: target.targetId,
    provider: target.provider,
  }
}

const mapProfileAssetListItem = (
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
    target: toContentTarget(item.target),
  }
}

const resolveAssetUrl = (asset: ContentAssetDto | null | undefined): string => {
  if (!asset) {
    return ''
  }

  return asset.variants?.card ?? asset.originalUrl
}

const mapProfileSummary = (block?: ContentProfileSummaryBlockDto): ProfileSummary => {
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
    shareTarget: toContentTarget(block.shareTarget),
  }
}

const resolveCategorySubCategories = (category: ContentProfileAssetCategoryDto): string[] => {
  return category.subCategories.map((subCategory) => subCategory.trim()).filter(Boolean)
}

const mapProfileCategories = (block?: ContentProfileAssetsBlockDto): ProfileCategory[] => {
  if (!block) {
    return []
  }

  return block.categories.map<ProfileCategory>((category) => ({
    id: category.categoryId as ProfileCategoryKey,
    label: normalizeProfileCategoryLabel(category.categoryId, category.categoryName),
    subCategories: resolveCategorySubCategories(category),
  }))
}

const mapProfileAssetsByCategory = (
  block?: ContentProfileAssetsBlockDto
): Record<ProfileCategoryKey, ProfileAssetItem[]> => {
  const assetMap: Record<ProfileCategoryKey, ProfileAssetItem[]> = {
    collections: [],
    blindBoxes: [],
    certificates: [],
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
      target: toContentTarget(item.target),
    })
  })

  return assetMap
}

const adaptProfileSceneToContent = (scene: ContentSceneDto): HomeRailProfileContent => {
  const summaryBlock = scene.blocks.find((item) => item.blockType === 'profile_summary') as
    | ContentProfileSummaryBlockDto
    | undefined
  const assetsBlock = scene.blocks.find((item) => item.blockType === 'profile_assets') as
    | ContentProfileAssetsBlockDto
    | undefined

  return {
    summary: mapProfileSummary(summaryBlock),
    categories: mapProfileCategories(assetsBlock),
    assets: mapProfileAssetsByCategory(assetsBlock),
  }
}

export const createHomeRailProfileContentShell = (): HomeRailProfileContent => {
  return cloneProfileShell()
}

export const resolveHomeRailProfileContent = async (
  options: ResolveHomeRailProfileContentOptions = {}
): Promise<RailSceneResolvedContent<HomeRailProfileContent>> => {
  if (homeRailProfileResolvedContentInFlight && !options.force) {
    return homeRailProfileResolvedContentInFlight
  }

  const nextRequest = resolveContentScene({ sceneId: 'profile' })
    .then((scene) => {
      const content = adaptProfileSceneToContent(scene)
      return {
        content,
        meta: createRailSceneResolvedMeta({
          version: scene.version,
          updatedAt: scene.updatedAt,
          signature: buildRailContentSignature(content),
        }),
      }
    })
    .finally(() => {
      if (homeRailProfileResolvedContentInFlight === nextRequest) {
        homeRailProfileResolvedContentInFlight = null
      }
    })

  homeRailProfileResolvedContentInFlight = nextRequest
  return nextRequest
}

const assertProfileAssetListDto = (list: ContentListDto): ContentListDtoBase<'profile_asset'> => {
  if (list.resourceType !== 'profile_asset') {
    throw new Error(`[homeRail] unexpected profile asset list resourceType: ${list.resourceType}`)
  }

  return list
}

export const resolveHomeRailProfileAssetList = async (
  input: ResolveHomeRailProfileAssetListInput = {},
  options: { ifNoneMatch?: string } = {}
): Promise<HomeRailProfileAssetListResult> => {
  const resolved = await resolveContentListWithMeta(
    {
      resourceType: 'profile_asset',
      categoryId: input.categoryId === 'all' ? undefined : input.categoryId,
      subCategory: input.subCategory?.trim() || undefined,
      keyword: input.keyword?.trim() || undefined,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 60,
    },
    { ifNoneMatch: options.ifNoneMatch }
  )

  if (resolved.notModified || !resolved.list) {
    if (resolved.notModified && isHomeRailProfileContentDev) {
      console.debug('[homeRail][profile] asset list 304', {
        query: input,
        etag: resolved.etag ?? null,
      })
    }
    return {
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 60,
      total: 0,
      items: [],
      etag: resolved.etag,
      notModified: true,
    }
  }

  const list = assertProfileAssetListDto(resolved.list)

  const items = list.items
    .map((item) => mapProfileAssetListItem(item))
    .filter((item): item is ProfileAssetItem => Boolean(item))

  return {
    page: list.page,
    pageSize: list.pageSize,
    total: list.total,
    items,
    etag: resolved.etag,
    notModified: false,
  }
}
