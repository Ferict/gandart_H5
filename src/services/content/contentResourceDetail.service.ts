/**
 * Responsibility: map generic content resources into detail-page view models and
 * provide shell fallbacks for supported resource types.
 * Out of scope: provider transport, cache runtime policy, and page-level refresh or
 * persistence orchestration.
 */
import type {
  ContentActivityPayloadDto,
  ContentHomeBannerPayloadDto,
  ContentDropPayloadDto,
  ContentMarketItemPayloadDto,
  ContentResourceDto,
} from '../../contracts/content-api.contract'
import type {
  ContentResourceDetailBadge,
  ContentResourceDetailContent,
  ContentResourceDetailStat,
} from '../../models/content/contentResourceDetail.model'
import { resolvePriceSymbol } from '../../utils/priceSymbol.util'
import { contentResourceBadgeToneMap } from '../../models/content/contentResourceDetail.model'
import { resolveContentResource } from './content.service'

type SupportedResourceType = 'home_banner' | 'activity' | 'drop' | 'market_item'

const resolveCurrencyUnit = resolvePriceSymbol
const formatCurrencyValue = (priceInCent: number): string =>
  Math.round(priceInCent / 100).toLocaleString('en-US')

const createBannerShell = (resourceId: string): ContentResourceDetailContent => ({
  resourceType: 'home_banner',
  resourceId,
  title: resourceId || '未命名首页主视觉',
  subtitle: '首页主视觉详情',
  statusLabel: 'LIVE',
  summary: '当前首页主视觉已经进入正式资源链，后续继续由后台上传成品图并维护同一资源 ID。',
  englishTitle: 'BANNER DETAIL',
  imageUrl: '',
  placeholderIconKey: 'box',
  priceLabel: '展示状态',
  priceUnit: '',
  priceValue: 'LIVE',
  progressRate: 100,
  progressLabel: 'BANNER READY',
  visualTone: 'slate',
  badges: [{ id: 'banner', label: '首页主视觉', tone: 'cyan' }],
  stats: [
    { id: 'status', label: '当前状态', value: 'LIVE' },
    { id: 'pipeline', label: '详情链路', value: 'RESOURCE', caption: 'Stable' },
  ],
  relationNote:
    '当前页面继续按 `resourceType + resourceId` 取数，后续只需要让后台返回同一 banner 资源详情即可。',
})

const createDropShell = (resourceId: string): ContentResourceDetailContent => ({
  resourceType: 'drop',
  resourceId,
  title: resourceId || '未命名首发藏品',
  subtitle: '首发藏品详情',
  statusLabel: 'ONLINE',
  summary: '当前首发藏品详情已脱离泛占位链路，后续直接承接真实后台资源详情。',
  englishTitle: 'DROP DETAIL',
  imageUrl: '',
  placeholderIconKey: 'box',
  priceLabel: '铸造价格',
  priceUnit: '￥',
  priceValue: '0',
  progressRate: 0,
  progressLabel: '0 / 0',
  visualTone: 'slate',
  badges: [{ id: 'drop', label: '首发藏品', tone: 'cyan' }],
  stats: [
    { id: 'status', label: '当前状态', value: 'ONLINE' },
    { id: 'pipeline', label: '详情链路', value: 'RESOURCE', caption: 'Stable' },
  ],
  relationNote: '当前页面继续按 `resourceType + resourceId` 取数，后续只需替换成真实后台资源详情。',
})

const createActivityShell = (resourceId: string): ContentResourceDetailContent => ({
  resourceType: 'activity',
  resourceId,
  title: resourceId || '未命名活动',
  subtitle: '活动详情',
  statusLabel: 'LIVE',
  summary: '当前活动详情已经进入正式资源链，后续继续由后台返回同一活动资源详情。',
  englishTitle: 'ACTIVITY DETAIL',
  imageUrl: '',
  placeholderIconKey: 'aperture',
  priceLabel: '活动状态',
  priceUnit: '',
  priceValue: 'LIVE',
  progressRate: 100,
  progressLabel: 'EVENT READY',
  visualTone: 'aqua',
  badges: [{ id: 'activity', label: '活动资源', tone: 'cyan' }],
  stats: [
    { id: 'status', label: '当前状态', value: 'LIVE' },
    { id: 'pipeline', label: '详情链路', value: 'RESOURCE', caption: 'Stable' },
  ],
  relationNote:
    '当前页面继续按 `resourceType + resourceId` 取数，后续只需要让后台返回同一活动资源详情即可。',
})

const createMarketShell = (resourceId: string): ContentResourceDetailContent => ({
  resourceType: 'market_item',
  resourceId,
  title: resourceId || '未命名市场藏品',
  subtitle: '市场藏品详情',
  statusLabel: 'ONLINE',
  summary: '当前市场藏品详情已脱离泛占位链路，后续直接承接真实后台资源详情。',
  englishTitle: 'MARKET DETAIL',
  imageUrl: '',
  placeholderIconKey: 'hexagon',
  priceLabel: '当前售价',
  priceUnit: '￥',
  priceValue: '0',
  progressRate: 0,
  progressLabel: 'RESOURCE READY',
  visualTone: 'mist',
  badges: [{ id: 'market', label: '市场资源', tone: 'slate' }],
  stats: [
    { id: 'status', label: '当前状态', value: 'ONLINE' },
    { id: 'pipeline', label: '详情链路', value: 'RESOURCE', caption: 'Stable' },
  ],
  relationNote: '当前页面继续按 `resourceType + resourceId` 取数，后续只需替换成真实后台资源详情。',
})

const createShellByType = (
  resourceType: SupportedResourceType,
  resourceId: string
): ContentResourceDetailContent => {
  if (resourceType === 'home_banner') {
    return createBannerShell(resourceId)
  }

  if (resourceType === 'activity') {
    return createActivityShell(resourceId)
  }

  return resourceType === 'drop' ? createDropShell(resourceId) : createMarketShell(resourceId)
}

const mapBannerResource = (
  resource: Pick<
    ContentResourceDto,
    'resourceId' | 'title' | 'subtitle' | 'status' | 'summary' | 'asset'
  > & {
    payload: ContentHomeBannerPayloadDto
  }
): ContentResourceDetailContent => {
  const assetSizeLabel = resource.asset
    ? `${resource.asset.width} × ${resource.asset.height}`
    : 'ASSET READY'

  return {
    resourceType: 'home_banner',
    resourceId: resource.resourceId,
    title: resource.title,
    subtitle: resource.subtitle ?? '首页主视觉详情',
    statusLabel: resource.status.toUpperCase(),
    summary:
      resource.summary ??
      '当前首页主视觉已经进入正式资源链，后续继续由后台上传成品图并维护同一资源 ID。',
    englishTitle: 'BANNER DETAIL',
    imageUrl:
      resource.asset?.variants?.detail ??
      resource.asset?.variants?.banner ??
      resource.asset?.originalUrl ??
      '',
    placeholderIconKey: 'box',
    priceLabel: '展示状态',
    priceUnit: '',
    priceValue: resource.payload.liveLabel,
    progressRate: 100,
    progressLabel: assetSizeLabel,
    visualTone: 'slate',
    badges: [
      { id: 'banner', label: '首页主视觉', tone: 'cyan' },
      { id: 'tone', label: resource.payload.tone.toUpperCase(), tone: 'slate' },
    ],
    stats: [
      { id: 'status', label: '当前状态', value: resource.status.toUpperCase() },
      { id: 'asset', label: '资源尺寸', value: assetSizeLabel, caption: 'Asset' },
    ],
    relationNote:
      '后续接入真实后台时，这里只需要继续返回 `home_banner` 资源详情，不需要再新增页面。',
  }
}

const mapDropResource = (
  resource: Pick<
    ContentResourceDto,
    'resourceId' | 'title' | 'subtitle' | 'status' | 'summary' | 'asset'
  > & {
    payload: ContentDropPayloadDto
  }
): ContentResourceDetailContent => {
  const progressRate =
    resource.payload.supplyCount > 0
      ? Math.min(
          100,
          Math.max(0, (resource.payload.mintedCount / resource.payload.supplyCount) * 100)
        )
      : 0

  const stats: ContentResourceDetailStat[] = [
    {
      id: 'minted',
      label: '铸造进度',
      value: `${resource.payload.mintedCount} / ${resource.payload.supplyCount}`,
    },
    {
      id: 'status',
      label: '当前状态',
      value: resource.status.toUpperCase(),
    },
  ]

  const badges: ContentResourceDetailBadge[] = [
    { id: 'drop', label: resource.payload.sectionTitle, tone: 'cyan' },
    { id: 'subtitle', label: resource.payload.sectionSubtitle, tone: 'slate' },
  ]

  return {
    resourceType: 'drop',
    resourceId: resource.resourceId,
    title: resource.title,
    subtitle: resource.subtitle ?? '首发藏品详情',
    statusLabel: resource.status.toUpperCase(),
    summary: resource.summary ?? '当前首发藏品详情已脱离泛占位链路，后续直接承接真实后台资源详情。',
    englishTitle: 'DROP DETAIL',
    imageUrl:
      resource.asset?.variants?.detail ??
      resource.asset?.variants?.card ??
      resource.asset?.originalUrl ??
      '',
    placeholderIconKey: resource.payload.placeholderIconKey ?? 'box',
    priceLabel: resource.payload.priceLabel,
    priceUnit: resolveCurrencyUnit(resource.payload.currency),
    priceValue: formatCurrencyValue(resource.payload.priceInCent),
    progressRate,
    progressLabel: `${resource.payload.mintedCount} / ${resource.payload.supplyCount}`,
    visualTone: 'slate',
    badges,
    stats,
    relationNote: '后续接入真实后台时，这里只需要继续返回 `drop` 资源详情，不需要再新增页面。',
  }
}

const mapActivityResource = (
  resource: Pick<
    ContentResourceDto,
    'resourceId' | 'title' | 'subtitle' | 'status' | 'summary' | 'asset'
  > & {
    payload: ContentActivityPayloadDto
  }
): ContentResourceDetailContent => {
  return {
    resourceType: 'activity',
    resourceId: resource.resourceId,
    title: resource.title,
    subtitle: resource.subtitle ?? '活动详情',
    statusLabel: resource.status.toUpperCase(),
    summary: resource.summary ?? resource.payload.description,
    englishTitle: 'ACTIVITY DETAIL',
    imageUrl: '',
    placeholderIconKey: 'aperture',
    priceLabel: '活动状态',
    priceUnit: '',
    priceValue: resource.payload.eyebrow,
    progressRate: 100,
    progressLabel: resource.payload.badgeLabel ?? 'EVENT READY',
    visualTone:
      resource.payload.tone === 'dark'
        ? 'slate'
        : resource.payload.tone === 'light'
          ? 'sand'
          : 'aqua',
    badges: [
      { id: 'activity', label: '活动资源', tone: 'cyan' },
      ...(resource.payload.badgeLabel
        ? [{ id: 'badge', label: resource.payload.badgeLabel, tone: 'amber' as const }]
        : []),
    ],
    stats: [
      { id: 'status', label: '当前状态', value: resource.status.toUpperCase() },
      {
        id: 'tone',
        label: '视觉口径',
        value: resource.payload.tone.toUpperCase(),
        caption: 'Tone',
      },
    ],
    relationNote: '后续接入真实后台时，这里只需要继续返回 `activity` 资源详情，不需要再新增页面。',
  }
}

const mapMarketResource = (
  resource: Pick<
    ContentResourceDto,
    'resourceId' | 'title' | 'subtitle' | 'status' | 'summary' | 'asset'
  > & {
    payload: ContentMarketItemPayloadDto
  }
): ContentResourceDetailContent => {
  const badges: ContentResourceDetailBadge[] = [{ id: 'market', label: '市场资源', tone: 'slate' }]

  if (resource.payload.badgeType && resource.payload.badgeLabel) {
    badges.unshift({
      id: resource.payload.badgeType,
      label: resource.payload.badgeLabel,
      tone: contentResourceBadgeToneMap[resource.payload.badgeType],
    })
  }

  const stats: ContentResourceDetailStat[] = [
    {
      id: 'categories',
      label: '分类数量',
      value: String(resource.payload.categoryIds.length).padStart(2, '0'),
      caption: 'Tags',
    },
    {
      id: 'status',
      label: '当前状态',
      value: resource.status.toUpperCase(),
    },
  ]

  return {
    resourceType: 'market_item',
    resourceId: resource.resourceId,
    title: resource.title,
    subtitle: resource.subtitle ?? '市场藏品详情',
    statusLabel: resource.status.toUpperCase(),
    summary: resource.summary ?? '当前市场藏品详情已脱离泛占位链路，后续直接承接真实后台资源详情。',
    englishTitle: 'MARKET DETAIL',
    imageUrl:
      resource.asset?.variants?.detail ??
      resource.asset?.variants?.card ??
      resource.asset?.originalUrl ??
      '',
    placeholderIconKey: resource.payload.placeholderIconKey ?? 'hexagon',
    priceLabel: '当前售价',
    priceUnit: resolveCurrencyUnit(resource.payload.currency),
    priceValue: formatCurrencyValue(resource.payload.priceInCent),
    progressRate: 100,
    progressLabel: resource.payload.categoryIds.join(' · ') || 'RESOURCE READY',
    visualTone: resource.payload.visualTone,
    badges,
    stats,
    relationNote:
      '后续接入真实后台时，这里只需要继续返回 `market_item` 资源详情，不需要再新增页面。',
  }
}

const adaptResource = (
  resource: ContentResourceDto,
  fallbackType: SupportedResourceType
): ContentResourceDetailContent => {
  if (resource.resourceType === 'drop') {
    return mapDropResource({
      resourceId: resource.resourceId,
      title: resource.title,
      subtitle: resource.subtitle,
      status: resource.status,
      summary: resource.summary,
      asset: resource.asset,
      payload: resource.payload as ContentDropPayloadDto,
    })
  }

  if (resource.resourceType === 'home_banner') {
    return mapBannerResource({
      resourceId: resource.resourceId,
      title: resource.title,
      subtitle: resource.subtitle,
      status: resource.status,
      summary: resource.summary,
      asset: resource.asset,
      payload: resource.payload as ContentHomeBannerPayloadDto,
    })
  }

  if (resource.resourceType === 'activity') {
    return mapActivityResource({
      resourceId: resource.resourceId,
      title: resource.title,
      subtitle: resource.subtitle,
      status: resource.status,
      summary: resource.summary,
      asset: resource.asset,
      payload: resource.payload as ContentActivityPayloadDto,
    })
  }

  if (resource.resourceType === 'market_item') {
    return mapMarketResource({
      resourceId: resource.resourceId,
      title: resource.title,
      subtitle: resource.subtitle,
      status: resource.status,
      summary: resource.summary,
      asset: resource.asset,
      payload: resource.payload as ContentMarketItemPayloadDto,
    })
  }

  return createShellByType(fallbackType, resource.resourceId)
}

/**
 * Shell stays local and synchronous; real detail data must come from resolveContentResource.
 */
export const createContentResourceDetailShell = (
  resourceType: SupportedResourceType,
  resourceId: string
): ContentResourceDetailContent => createShellByType(resourceType, resourceId)

export const resolveContentResourceDetail = async (
  resourceType: SupportedResourceType,
  resourceId: string
): Promise<ContentResourceDetailContent> => {
  const resource = await resolveContentResource({
    resourceType,
    resourceId,
  })

  return adaptResource(resource, resourceType)
}
