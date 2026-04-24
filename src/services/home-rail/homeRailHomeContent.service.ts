/**
 * Responsibility: normalize content-scene and list resources into the home rail view
 * models, signatures, and query-facing list results for the home page.
 * Out of scope: scene scheduling, persistent cache orchestration, and page-local
 * presentation or animation runtime.
 */
import type {
  ContentAssetDto,
  ContentBannerCarouselBlockDto,
  ContentListDto,
  ContentListDtoBase,
  ContentListItemDtoBase,
  ContentMarketItemPayloadDto,
  ContentFeaturedDropBlockDto,
  ContentMarketSortConfigDto,
  ContentMarketOverviewBlockDto,
  ContentNoticeBarBlockDto,
  ContentSortDirection,
  ContentTargetDto,
  ContentSceneDto,
} from '../../contracts/content-api.contract'
import type {
  HomeAnnouncementItem,
  HomeBannerItem,
  HomeContentTargetRef,
  HomeFeaturedDropContent,
  HomeMarketAction,
  HomeMarketCard,
  HomeMarketSortConfig,
  HomeMarketSortField,
  HomeMarketTag,
  HomeNoticeBarConfig,
  HomeRailHomeContent,
} from '../../models/home-rail/homeRailHome.model'
import { resolveContentListWithMeta, resolveContentScene } from '../content/content.service'
import { formatNoticeDisplayTime } from '../../utils/noticeTime.util'
import {
  buildRailContentSignature,
  createRailSceneResolvedMeta,
  type RailSceneResolvedContent,
} from './homeRailPageReloadPolicy.service'

const isHomeRailHomeContentDev = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

const homeRailHomeContentShell: HomeRailHomeContent = {
  noticeBar: {
    label: '公告：',
    detailLabel: '查看公告详情',
    items: [],
  },
  banners: [],
  featured: {
    id: '',
    title: '',
    sectionTitle: '首发藏品',
    sectionSubtitle: 'Featured Drop',
    priceLabel: '铸造价格',
    priceUnit: '￥',
    price: 0,
    minted: 0,
    supply: 0,
    imageUrl: '',
    placeholderIconKey: 'box',
    target: {
      targetType: 'drop',
      targetId: '',
    },
  },
  market: {
    sectionTitle: '藏品市场',
    sectionSubtitle: 'Market Flow',
    tags: [],
    actions: [],
    sortConfig: {
      defaultField: 'listedAt',
      defaultDirection: 'desc',
      options: [
        { field: 'listedAt', label: '时间' },
        { field: 'price', label: '市场价' },
        { field: 'tradeVolume24h', label: '交易量' },
        { field: 'holderCount', label: '持有量' },
      ],
    },
    cards: [],
  },
}

interface ResolveHomeRailHomeContentOptions {
  force?: boolean
}

export interface ResolveHomeRailMarketCardListInput {
  categoryId?: string
  keyword?: string
  sort: {
    field: HomeMarketSortField
    direction: ContentSortDirection
  }
  page: number
  pageSize: number
}

export interface HomeRailMarketCardListResult {
  page: number
  pageSize: number
  total: number
  items: HomeMarketCard[]
  etag?: string
  notModified?: boolean
}

export type HomeRailHomeSceneModuleKey = 'noticeBar' | 'banner' | 'featured' | 'marketShell'

export const buildHomeRailHomeBlockSignatures = (
  content: HomeRailHomeContent
): Record<HomeRailHomeSceneModuleKey, string> => ({
  noticeBar: buildRailContentSignature(content.noticeBar),
  banner: buildRailContentSignature(content.banners),
  featured: buildRailContentSignature(content.featured),
  marketShell: buildRailContentSignature({
    sectionTitle: content.market.sectionTitle,
    sectionSubtitle: content.market.sectionSubtitle,
    tags: content.market.tags,
    actions: content.market.actions,
    sortConfig: content.market.sortConfig,
  }),
})

let homeRailHomeResolvedContentInFlight: Promise<
  RailSceneResolvedContent<HomeRailHomeContent>
> | null = null

const cloneHomeRailHomeContentShell = (): HomeRailHomeContent => ({
  noticeBar: {
    ...homeRailHomeContentShell.noticeBar,
    items: [...homeRailHomeContentShell.noticeBar.items],
  },
  banners: [...homeRailHomeContentShell.banners],
  featured: {
    ...homeRailHomeContentShell.featured,
    target: { ...homeRailHomeContentShell.featured.target },
  },
  market: {
    sectionTitle: homeRailHomeContentShell.market.sectionTitle,
    sectionSubtitle: homeRailHomeContentShell.market.sectionSubtitle,
    tags: [...homeRailHomeContentShell.market.tags],
    actions: [...homeRailHomeContentShell.market.actions],
    sortConfig: {
      defaultField: homeRailHomeContentShell.market.sortConfig.defaultField,
      defaultDirection: homeRailHomeContentShell.market.sortConfig.defaultDirection,
      options: homeRailHomeContentShell.market.sortConfig.options.map((option) => ({ ...option })),
    },
    cards: [...homeRailHomeContentShell.market.cards],
  },
})

const resolveAssetUrl = (
  asset: ContentAssetDto | null | undefined,
  variant: 'banner' | 'card'
): string => {
  if (!asset) {
    return ''
  }

  if (variant === 'banner') {
    return asset.variants?.banner ?? asset.originalUrl
  }

  return asset.variants?.card ?? asset.originalUrl
}

const resolveCurrencyUnit = (currency: string): string => (currency === 'CNY' ? '￥' : currency)
const toHomeTarget = (target: ContentTargetDto): HomeContentTargetRef => {
  if (target.targetType === 'profile_asset') {
    return {
      targetType: target.targetType,
      targetId: target.targetId,
      params: {
        category: target.params.category,
        subCategory: target.params.subCategory,
      },
      provider: target.provider,
    }
  }

  return {
    targetType: target.targetType,
    targetId: target.targetId,
    provider: target.provider,
  }
}

const mapNoticeBar = (block?: ContentNoticeBarBlockDto): HomeNoticeBarConfig => {
  if (!block) {
    return {
      ...homeRailHomeContentShell.noticeBar,
      items: [...homeRailHomeContentShell.noticeBar.items],
    }
  }

  return {
    label: block.label,
    detailLabel: block.detailLabel,
    items: block.items.map<HomeAnnouncementItem>((item) => ({
      noticeId: item.noticeId,
      title: item.title,
      type: item.type,
      time: formatNoticeDisplayTime(item.publishedAt),
      isUnread: item.isUnread,
      target: toHomeTarget(item.target),
    })),
  }
}

const mapBanners = (block?: ContentBannerCarouselBlockDto): HomeBannerItem[] => {
  if (!block) {
    return []
  }

  return block.items.map((item) => ({
    id: item.bannerId,
    title: item.title,
    liveLabel: item.liveLabel,
    tone: item.tone,
    imageUrl: resolveAssetUrl(item.asset, 'banner'),
    focalPoint: item.asset?.focalPoint ? { ...item.asset.focalPoint } : undefined,
    target: toHomeTarget(item.target),
  }))
}

const mapFeatured = (block?: ContentFeaturedDropBlockDto): HomeFeaturedDropContent => {
  if (!block) {
    return {
      ...homeRailHomeContentShell.featured,
      target: { ...homeRailHomeContentShell.featured.target },
    }
  }

  return {
    id: block.item.dropId,
    title: block.item.title,
    sectionTitle: block.item.sectionTitle,
    sectionSubtitle: block.item.sectionSubtitle,
    priceLabel: block.item.priceLabel,
    priceUnit: resolveCurrencyUnit(block.item.currency),
    price: Math.round(block.item.priceInCent / 100),
    minted: block.item.mintedCount,
    supply: block.item.supplyCount,
    imageUrl: resolveAssetUrl(block.item.asset, 'card'),
    placeholderIconKey: block.item.placeholderIconKey,
    target: toHomeTarget(block.item.target),
  }
}

const mapMarketTags = (block?: ContentMarketOverviewBlockDto): HomeMarketTag[] => {
  if (!block) {
    return []
  }

  return block.categories.map((item) => ({
    id: item.categoryId,
    label: item.categoryName,
  }))
}

const mapMarketActions = (block?: ContentMarketOverviewBlockDto): HomeMarketAction[] => {
  if (!block) {
    return []
  }

  return block.actions.map((item) => ({
    id: item.actionId,
    label: item.label,
    target: toHomeTarget(item.target),
  }))
}

const mapContentSortFieldToHome = (
  field: ContentMarketSortConfigDto['defaultField']
): HomeMarketSortField => {
  if (field === 'priceInCent') {
    return 'price'
  }
  return field
}

const mapMarketSortConfig = (block?: ContentMarketOverviewBlockDto): HomeMarketSortConfig => {
  const shellSortConfig = homeRailHomeContentShell.market.sortConfig
  const sortConfig = block?.sortConfig
  if (!sortConfig) {
    return {
      defaultField: shellSortConfig.defaultField,
      defaultDirection: shellSortConfig.defaultDirection,
      options: shellSortConfig.options.map((option) => ({ ...option })),
    }
  }

  const mappedOptions = sortConfig.options.map((option) => ({
    field: mapContentSortFieldToHome(option.field),
    label: option.label,
  }))
  const resolvedOptions =
    mappedOptions.length > 0
      ? mappedOptions
      : shellSortConfig.options.map((option) => ({ ...option }))
  return {
    defaultField: mapContentSortFieldToHome(sortConfig.defaultField),
    defaultDirection: sortConfig.defaultDirection,
    options: resolvedOptions,
  }
}

const adaptHomeSceneToContent = (scene: ContentSceneDto): HomeRailHomeContent => {
  const noticeBarBlock = scene.blocks.find((item) => item.blockType === 'notice_bar') as
    | ContentNoticeBarBlockDto
    | undefined
  const bannerBlock = scene.blocks.find((item) => item.blockType === 'banner_carousel') as
    | ContentBannerCarouselBlockDto
    | undefined
  const featuredBlock = scene.blocks.find((item) => item.blockType === 'featured_drop') as
    | ContentFeaturedDropBlockDto
    | undefined
  const marketBlock = scene.blocks.find((item) => item.blockType === 'market_overview') as
    | ContentMarketOverviewBlockDto
    | undefined

  return {
    noticeBar: mapNoticeBar(noticeBarBlock),
    banners: mapBanners(bannerBlock),
    featured: mapFeatured(featuredBlock),
    market: {
      sectionTitle: marketBlock?.sectionTitle ?? homeRailHomeContentShell.market.sectionTitle,
      sectionSubtitle:
        marketBlock?.sectionSubtitle ?? homeRailHomeContentShell.market.sectionSubtitle,
      tags: mapMarketTags(marketBlock),
      actions: mapMarketActions(marketBlock),
      sortConfig: mapMarketSortConfig(marketBlock),
      cards: [],
    },
  }
}

const buildHomeRailHomeStableSignature = (content: HomeRailHomeContent): string => {
  return buildRailContentSignature({
    ...content,
    noticeBar: {
      ...content.noticeBar,
      items: content.noticeBar.items.map((item) => ({
        noticeId: item.noticeId,
        title: item.title,
        type: item.type,
        time: item.time,
      })),
    },
  })
}

export const createHomeRailHomeContentShell = (): HomeRailHomeContent => {
  return cloneHomeRailHomeContentShell()
}

const mapHomeSortFieldToContent = (
  field: HomeMarketSortField
): ContentMarketSortConfigDto['defaultField'] => {
  if (field === 'price') {
    return 'priceInCent'
  }
  return field
}

const mapMarketListItem = (item: ContentListItemDtoBase<'market_item'>): HomeMarketCard => {
  const payload: ContentMarketItemPayloadDto = item.payload
  return {
    id: item.resourceId,
    name: item.title,
    priceUnit: resolveCurrencyUnit(payload.currency),
    price: Math.round(payload.priceInCent / 100),
    listedAt: payload.listedAt,
    tradeVolume24h: payload.tradeVolume24h,
    holderCount: payload.holderCount,
    editionCode: payload.editionCode,
    issueCount: payload.issueCount,
    categories: [...payload.categoryIds],
    imageUrl: resolveAssetUrl(item.asset, 'card'),
    placeholderIconKey: payload.placeholderIconKey,
    visualTone: payload.visualTone,
    badge:
      payload.badgeType && payload.badgeLabel
        ? { tone: payload.badgeType, label: payload.badgeLabel }
        : undefined,
    target: toHomeTarget(item.target),
  }
}

export const resolveHomeRailMarketCardList = async (
  input: ResolveHomeRailMarketCardListInput,
  options: { ifNoneMatch?: string } = {}
): Promise<HomeRailMarketCardListResult> => {
  const resolved = await resolveContentListWithMeta(
    {
      resourceType: 'market_item',
      categoryId: input.categoryId,
      keyword: input.keyword,
      sort: {
        field: mapHomeSortFieldToContent(input.sort.field),
        direction: input.sort.direction,
      },
      page: input.page,
      pageSize: input.pageSize,
    },
    options
  )

  if (resolved.notModified || !resolved.list) {
    if (resolved.notModified && isHomeRailHomeContentDev) {
      console.debug('[homeRail][home] market list 304', {
        query: input,
        etag: resolved.etag ?? null,
      })
    }
    return {
      page: input.page,
      pageSize: input.pageSize,
      total: 0,
      items: [],
      etag: resolved.etag,
      notModified: true,
    }
  }

  const list = resolved.list
  const typedList = assertMarketListDto(list)

  const items = typedList.items.map((item) => mapMarketListItem(item))

  return {
    page: typedList.page,
    pageSize: typedList.pageSize,
    total: typedList.total,
    items,
    etag: resolved.etag,
    notModified: false,
  }
}

const assertMarketListDto = (list: ContentListDto): ContentListDtoBase<'market_item'> => {
  if (list.resourceType !== 'market_item') {
    throw new Error(`[homeRail] unexpected market list resourceType: ${list.resourceType}`)
  }

  return list
}

export const resolveHomeRailHomeContent = async (
  options: ResolveHomeRailHomeContentOptions = {}
): Promise<RailSceneResolvedContent<HomeRailHomeContent>> => {
  if (homeRailHomeResolvedContentInFlight && !options.force) {
    return homeRailHomeResolvedContentInFlight
  }

  const nextRequest = resolveContentScene({ sceneId: 'home' })
    .then((scene) => {
      const content = adaptHomeSceneToContent(scene)
      return {
        content,
        meta: createRailSceneResolvedMeta({
          version: scene.version,
          updatedAt: scene.updatedAt,
          signature: buildHomeRailHomeStableSignature(content),
        }),
      }
    })
    .finally(() => {
      if (homeRailHomeResolvedContentInFlight === nextRequest) {
        homeRailHomeResolvedContentInFlight = null
      }
    })

  homeRailHomeResolvedContentInFlight = nextRequest
  return nextRequest
}
