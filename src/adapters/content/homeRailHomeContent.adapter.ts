/**
 * Responsibility: normalize home rail DTO blocks and list items into the home rail view model.
 * Out of scope: scene fetch orchestration, cache policy, and page/runtime presentation state.
 */
import type {
  ContentAssetDto,
  ContentBannerCarouselBlockDto,
  ContentFeaturedDropBlockDto,
  ContentListItemDtoBase,
  ContentMarketItemPayloadDto,
  ContentMarketOverviewBlockDto,
  ContentMarketSortConfigDto,
  ContentNoticeBarBlockDto,
  ContentSceneDto,
} from '../../contracts/content-api.contract'
import { formatNoticeDisplayTime } from '../../utils/noticeTime.util'
import { adaptContentTarget } from './contentTarget.adapter'
import type {
  HomeBannerItem,
  HomeFeaturedDropContent,
  HomeMarketAction,
  HomeMarketCard,
  HomeMarketSortConfig,
  HomeMarketSortField,
  HomeMarketTag,
  HomeNoticeBarConfig,
  HomeRailHomeContent,
} from '../../models/home-rail/homeRailHome.model'

const homeRailHomeContentShell: HomeRailHomeContent = {
  noticeBar: {
    label: '公告栏',
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
    priceUnit: '元',
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
        { field: 'tradeVolume24h', label: '成交量' },
        { field: 'holderCount', label: '持有量' },
      ],
    },
    cards: [],
  },
}

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
      options: homeRailHomeContentShell.market.sortConfig.options.map((option) => ({
        ...option,
      })),
    },
    cards: [...homeRailHomeContentShell.market.cards],
  },
})

export const adaptHomeRailHomeTargetDto = adaptContentTarget

const resolveHomeRailHomeAssetUrl = (
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

const resolveHomeRailHomeCurrencyUnit = (currency: string): string =>
  currency === 'CNY' ? '元' : currency

const mapHomeRailHomeSortFieldToModel = (
  field: ContentMarketSortConfigDto['defaultField']
): HomeMarketSortField => (field === 'priceInCent' ? 'price' : field)

export const adaptHomeRailHomeNoticeBarBlockDto = (
  block?: ContentNoticeBarBlockDto
): HomeNoticeBarConfig => {
  if (!block) {
    return {
      ...homeRailHomeContentShell.noticeBar,
      items: [...homeRailHomeContentShell.noticeBar.items],
    }
  }

  return {
    label: block.label,
    detailLabel: block.detailLabel,
    items: block.items.map((item) => ({
      noticeId: item.noticeId,
      title: item.title,
      type: item.type,
      time: formatNoticeDisplayTime(item.publishedAt),
      isUnread: item.isUnread,
      target: adaptHomeRailHomeTargetDto(item.target),
    })),
  }
}

export const adaptHomeRailHomeBannerCarouselBlockDto = (
  block?: ContentBannerCarouselBlockDto
): HomeBannerItem[] => {
  if (!block) {
    return []
  }

  return block.items.map((item) => ({
    id: item.bannerId,
    title: item.title,
    liveLabel: item.liveLabel,
    tone: item.tone,
    imageUrl: resolveHomeRailHomeAssetUrl(item.asset, 'banner'),
    focalPoint: item.asset?.focalPoint ? { ...item.asset.focalPoint } : undefined,
    target: adaptHomeRailHomeTargetDto(item.target),
  }))
}

export const adaptHomeRailHomeFeaturedDropBlockDto = (
  block?: ContentFeaturedDropBlockDto
): HomeFeaturedDropContent => {
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
    priceUnit: resolveHomeRailHomeCurrencyUnit(block.item.currency),
    price: Math.round(block.item.priceInCent / 100),
    minted: block.item.mintedCount,
    supply: block.item.supplyCount,
    imageUrl: resolveHomeRailHomeAssetUrl(block.item.asset, 'card'),
    placeholderIconKey: block.item.placeholderIconKey,
    target: adaptHomeRailHomeTargetDto(block.item.target),
  }
}

export const adaptHomeRailHomeMarketTagsBlockDto = (
  block?: ContentMarketOverviewBlockDto
): HomeMarketTag[] => {
  if (!block) {
    return []
  }

  return block.categories.map((item) => ({
    id: item.categoryId,
    label: item.categoryName,
  }))
}

export const adaptHomeRailHomeMarketActionsBlockDto = (
  block?: ContentMarketOverviewBlockDto
): HomeMarketAction[] => {
  if (!block) {
    return []
  }

  return block.actions.map((item) => ({
    id: item.actionId,
    label: item.label,
    target: adaptHomeRailHomeTargetDto(item.target),
  }))
}

export const adaptHomeRailHomeMarketSortConfigBlockDto = (
  block?: ContentMarketOverviewBlockDto
): HomeMarketSortConfig => {
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
    field: mapHomeRailHomeSortFieldToModel(option.field),
    label: option.label,
  }))
  const resolvedOptions =
    mappedOptions.length > 0
      ? mappedOptions
      : shellSortConfig.options.map((option) => ({ ...option }))

  return {
    defaultField: mapHomeRailHomeSortFieldToModel(sortConfig.defaultField),
    defaultDirection: sortConfig.defaultDirection,
    options: resolvedOptions,
  }
}

export const adaptHomeRailHomeSceneDto = (scene: ContentSceneDto): HomeRailHomeContent => {
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
    noticeBar: adaptHomeRailHomeNoticeBarBlockDto(noticeBarBlock),
    banners: adaptHomeRailHomeBannerCarouselBlockDto(bannerBlock),
    featured: adaptHomeRailHomeFeaturedDropBlockDto(featuredBlock),
    market: {
      sectionTitle: marketBlock?.sectionTitle ?? homeRailHomeContentShell.market.sectionTitle,
      sectionSubtitle:
        marketBlock?.sectionSubtitle ?? homeRailHomeContentShell.market.sectionSubtitle,
      tags: adaptHomeRailHomeMarketTagsBlockDto(marketBlock),
      actions: adaptHomeRailHomeMarketActionsBlockDto(marketBlock),
      sortConfig: adaptHomeRailHomeMarketSortConfigBlockDto(marketBlock),
      cards: [],
    },
  }
}

export const adaptHomeRailHomeMarketListItemDto = (
  item: ContentListItemDtoBase<'market_item'>
): HomeMarketCard => {
  const payload: ContentMarketItemPayloadDto = item.payload

  return {
    id: item.resourceId,
    name: item.title,
    priceUnit: resolveHomeRailHomeCurrencyUnit(payload.currency),
    price: Math.round(payload.priceInCent / 100),
    listedAt: payload.listedAt,
    tradeVolume24h: payload.tradeVolume24h,
    holderCount: payload.holderCount,
    editionCode: payload.editionCode,
    issueCount: payload.issueCount,
    categories: [...payload.categoryIds],
    imageUrl: resolveHomeRailHomeAssetUrl(item.asset, 'card'),
    placeholderIconKey: payload.placeholderIconKey,
    visualTone: payload.visualTone,
    badge:
      payload.badgeType && payload.badgeLabel
        ? { tone: payload.badgeType, label: payload.badgeLabel }
        : undefined,
    target: adaptHomeRailHomeTargetDto(item.target),
  }
}

export const createHomeRailHomeContentShell = (): HomeRailHomeContent => {
  return cloneHomeRailHomeContentShell()
}
