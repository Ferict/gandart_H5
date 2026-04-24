/**
 * Responsibility: adapt the extracted legacy backend HTTP contract into the
 * current content-domain port without exposing legacy transport shapes to UI.
 * Out of scope: page presentation, cache policy, and backend contract authoring.
 */
import type {
  ContentActionRequestDto,
  ContentActionResultDto,
  ContentActivityEntryDto,
  ContentApiHttpMethod,
  ContentAssetDto,
  ContentEnvelope,
  ContentGenericTargetDto,
  ContentFeaturedDropDto,
  ContentHomeBannerDto,
  ContentListDto,
  ContentListItemDtoBase,
  ContentListRequestDto,
  ContentMarketItemPayloadDto,
  ContentMarketItemSummaryDto,
  ContentNoticePayloadDto,
  ContentNoticeSummaryDto,
  ContentProfileAssetCategoryDto,
  ContentProfileAssetItemDto,
  ContentProfileAssetPayloadDto,
  ContentProfileCategoryId,
  ContentResourceDto,
  ContentResourceRequestDto,
  ContentSceneBlockDto,
  ContentSceneDto,
  ContentSceneRequestDto,
} from '../contracts/content-api.contract'
import type {
  ContentListPortResponse,
  ContentListRequestOptions,
  ContentPort,
} from '../ports/content.port'

interface ContentBackendHttpImplementationOptions {
  baseUrl: string
  isProduction: boolean
}

interface LegacyBackendResponse {
  code?: unknown
  msg?: unknown
  message?: unknown
  data?: unknown
  requestId?: unknown
  serverTime?: unknown
}

interface ExtractedPageItems {
  items: unknown[]
  total?: number
}

const backendEndpoints = {
  activityList: '/activity/index',
  bannerList: '/banner/show/getBanner',
  featuredDropList: '/box/blind_box/list',
  marketList: '/market/market/getMarketList',
  noticeList: '/index/afficheList',
  noticeDetail: '/index/afficheDetail/ids/{id}',
  profileAssetList: '/user_collection/user_collection/antMycollection',
  profileAssetDetail: '/user_collection/user_collection/detail/ids/{id}',
  userInfo: '/user/getUserInfo',
  noticeRead: '/user/readMsgById',
} as const

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isLoopbackHostname = (hostname: string) => {
  const normalized = hostname.trim().toLowerCase()
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '[::1]'
  )
}

const normalizeBaseUrl = (rawBaseUrl: string, isProduction: boolean) => {
  const trimmed = rawBaseUrl.trim()
  if (!trimmed) {
    throw new Error(
      '[content-backend-http] VITE_CONTENT_BACKEND_API_BASE_URL is required when provider=backend-http.'
    )
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('[content-backend-http] Backend base URL must be an absolute http(s) URL.')
  }

  const protocol = parsed.protocol.toLowerCase()
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error('[content-backend-http] Backend base URL must use http:// or https://.')
  }

  if (isProduction && protocol !== 'https:') {
    throw new Error(
      '[content-backend-http] Backend base URL must use https:// in production when provider=backend-http.'
    )
  }

  if (!isProduction && protocol === 'http:' && !isLoopbackHostname(parsed.hostname)) {
    throw new Error(
      '[content-backend-http] Non-https backend base URL is only allowed for localhost/127.0.0.1/::1 in development.'
    )
  }

  return trimmed.replace(/\/+$/, '')
}

const buildBackendUrl = (
  baseUrl: string,
  path: string,
  pathParams: Record<string, string | number | undefined> = {}
) => {
  const resolvedPath = Object.entries(pathParams).reduce((result, [key, value]) => {
    return result.replace(`{${key}}`, encodeURIComponent(String(value ?? '')))
  }, path)
  return `${baseUrl}${resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`}`
}

const normalizeResponseHeaders = (headers: unknown): Record<string, string> => {
  if (!isObjectRecord(headers)) {
    return {}
  }

  return Object.entries(headers).reduce<Record<string, string>>((result, [key, value]) => {
    if (typeof value === 'string') {
      result[key.toLowerCase()] = value
      return result
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      result[key.toLowerCase()] = String(value)
    }

    return result
  }, {})
}

const requestBackend = async (
  method: ContentApiHttpMethod,
  url: string,
  payload?: Record<string, unknown>
): Promise<{ envelope: LegacyBackendResponse; headers: Record<string, string> }> => {
  return new Promise((resolve, reject) => {
    uni.request({
      method,
      url,
      data: payload,
      header: {
        'content-type': 'application/json',
      },
      success: (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(
            new Error(
              `[content-backend-http] ${method} ${url} failed with HTTP ${response.statusCode}.`
            )
          )
          return
        }

        if (!isObjectRecord(response.data)) {
          reject(new Error('[content-backend-http] Invalid legacy backend response envelope.'))
          return
        }

        resolve({
          envelope: response.data,
          headers: normalizeResponseHeaders(response.header),
        })
      },
      fail: (error) => {
        const reason = isObjectRecord(error) && typeof error.errMsg === 'string' ? error.errMsg : ''
        reject(
          new Error(`[content-backend-http] ${method} ${url} failed.${reason ? ` ${reason}` : ''}`)
        )
      },
    })
  })
}

const resolveEnvelopeCode = (raw: LegacyBackendResponse): number => {
  if (typeof raw.code === 'number') {
    return raw.code
  }

  if (typeof raw.code === 'string') {
    const parsed = Number(raw.code)
    return Number.isFinite(parsed) ? parsed : -1
  }

  return -1
}

const resolveEnvelopeMessage = (raw: LegacyBackendResponse): string => {
  if (typeof raw.message === 'string' && raw.message.trim().length > 0) {
    return raw.message
  }

  if (typeof raw.msg === 'string' && raw.msg.trim().length > 0) {
    return raw.msg
  }

  return resolveEnvelopeCode(raw) === 0 ? 'ok' : 'backend error'
}

const createContentEnvelope = <T>(
  raw: LegacyBackendResponse,
  data: T | null
): ContentEnvelope<T> => ({
  code: resolveEnvelopeCode(raw),
  message: resolveEnvelopeMessage(raw),
  requestId: typeof raw.requestId === 'string' ? raw.requestId : '',
  serverTime: typeof raw.serverTime === 'string' ? raw.serverTime : new Date().toISOString(),
  data,
})

const readString = (value: unknown): string | undefined => {
  if (typeof value === 'string') {
    const normalized = value.trim()
    return normalized.length > 0 ? normalized : undefined
  }

  if (typeof value === 'number' && Number.isFinite(value)) {
    return String(value)
  }

  return undefined
}

const readNumber = (value: unknown): number | undefined => {
  if (typeof value === 'number' && Number.isFinite(value)) {
    return value
  }

  if (typeof value === 'string' && value.trim().length > 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }

  return undefined
}

const readBoolean = (value: unknown): boolean | undefined => {
  if (typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'number') {
    return value !== 0
  }

  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase()
    if (['1', 'true', 'yes'].includes(normalized)) {
      return true
    }
    if (['0', 'false', 'no'].includes(normalized)) {
      return false
    }
  }

  return undefined
}

const firstString = (...values: unknown[]): string | undefined => {
  for (const value of values) {
    const normalized = readString(value)
    if (normalized) {
      return normalized
    }
  }

  return undefined
}

const firstNumber = (...values: unknown[]): number | undefined => {
  for (const value of values) {
    const normalized = readNumber(value)
    if (normalized !== undefined) {
      return normalized
    }
  }

  return undefined
}

const createContentAsset = (assetId: string, url: string | undefined): ContentAssetDto | null => {
  if (!url) {
    return null
  }

  return {
    assetId,
    originalUrl: url,
    width: 0,
    height: 0,
    variants: {
      thumb: url,
      card: url,
      banner: url,
      detail: url,
    },
  }
}

const yuanToCent = (value: unknown): number => Math.round((firstNumber(value) ?? 0) * 100)

const normalizeId = (fallback: string, ...values: unknown[]): string =>
  firstString(...values) ?? fallback

const createBasicTarget = (
  targetType: ContentGenericTargetDto['targetType'],
  targetId: string
): ContentGenericTargetDto => ({
  targetType,
  targetId,
  provider: 'content',
})

const extractArray = (value: unknown): unknown[] | undefined => {
  if (Array.isArray(value)) {
    return value
  }

  if (!isObjectRecord(value)) {
    return undefined
  }

  const arrayCandidates = [value.list, value.data, value.items, value.rows, value.records]
  for (const candidate of arrayCandidates) {
    if (Array.isArray(candidate)) {
      return candidate
    }
  }

  if (isObjectRecord(value.data)) {
    return extractArray(value.data)
  }

  return undefined
}

const extractPageItems = (data: unknown, page: number, pageSize: number): ExtractedPageItems => {
  const items = extractArray(data) ?? []
  const dataRecord = isObjectRecord(data) ? data : {}
  const nestedData = isObjectRecord(dataRecord.data) ? dataRecord.data : {}
  const total =
    firstNumber(
      dataRecord.total,
      dataRecord.count,
      dataRecord.total_count,
      nestedData.total,
      nestedData.count,
      nestedData.total_count
    ) ?? (page <= 1 ? items.length : (page - 1) * pageSize + items.length)

  return {
    items,
    total,
  }
}

const normalizeLegacyMarketItem = (
  item: unknown,
  index: number,
  input: Extract<ContentListRequestDto, { resourceType: 'market_item' }>
): ContentListItemDtoBase<'market_item'> | null => {
  if (!isObjectRecord(item)) {
    return null
  }

  const product = isObjectRecord(item.product) ? item.product : {}
  const resourceId = normalizeId(
    `market_${input.page}_${index + 1}`,
    item.id,
    item.market_id,
    item.goods_id,
    product.id
  )
  const title =
    firstString(product.name, product.goods_name, item.goods_name, item.name) ?? '未命名藏品'
  const imageUrl = firstString(product.listimg, product.main_image, item.listimg, item.main_image)
  const issueCount = Math.max(
    Math.round(firstNumber(item.total_num, product.total_num, item.issue_num) ?? 0),
    0
  )
  const priceInCent = yuanToCent(firstNumber(item.min_price, item.price, product.price))
  const now = new Date().toISOString()
  const payload: ContentMarketItemPayloadDto = {
    currency: 'CNY',
    priceInCent,
    listedAt:
      firstString(item.listed_at, item.create_time, item.createtime, item.updated_at) ?? now,
    tradeVolume24h: 0,
    holderCount: Math.max(Math.round(firstNumber(item.flux, item.hold_num) ?? 0), 0),
    editionCode: firstString(item.edition_code, item.goods_type) ?? 'LTD',
    issueCount,
    categoryIds: [input.categoryId ?? 'all'],
    placeholderIconKey: 'hexagon',
    visualTone: 'mist',
  }

  return {
    resourceType: 'market_item',
    resourceId,
    title,
    status: 'active',
    updatedAt: firstString(item.updated_at, item.update_time, item.create_time) ?? now,
    asset: createContentAsset(`market_${resourceId}`, imageUrl),
    target: createBasicTarget('market_item', resourceId),
    payload,
  }
}

const normalizeLegacyMarketSummary = (
  item: unknown,
  index: number,
  input: Extract<ContentListRequestDto, { resourceType: 'market_item' }>
): ContentMarketItemSummaryDto | null => {
  const normalized = normalizeLegacyMarketItem(item, index, input)
  if (!normalized) {
    return null
  }

  return {
    itemId: normalized.resourceId,
    title: normalized.title,
    currency: normalized.payload.currency,
    priceInCent: normalized.payload.priceInCent,
    listedAt: normalized.payload.listedAt,
    tradeVolume24h: normalized.payload.tradeVolume24h,
    holderCount: normalized.payload.holderCount,
    editionCode: normalized.payload.editionCode,
    issueCount: normalized.payload.issueCount,
    categoryIds: [...normalized.payload.categoryIds],
    asset: normalized.asset,
    placeholderIconKey: normalized.payload.placeholderIconKey,
    visualTone: normalized.payload.visualTone,
    badgeType: normalized.payload.badgeType,
    badgeLabel: normalized.payload.badgeLabel,
    target: normalized.target,
  }
}

const normalizeLegacyNoticeItem = (
  item: unknown,
  index: number,
  input: Extract<ContentListRequestDto, { resourceType: 'notice' }>
): ContentListItemDtoBase<'notice'> | null => {
  if (!isObjectRecord(item)) {
    return null
  }

  const resourceId = normalizeId(`notice_${input.page}_${index + 1}`, item.id, item.notice_id)
  const publishedAt =
    firstString(item.published_at, item.create_time, item.createtime, item.updated_at) ??
    new Date().toISOString()
  const title = firstString(item.title, item.name) ?? '未命名公告'
  const noticeType = firstString(item.type_name, item.type, item.category_name, input.tag) ?? '公告'
  const payload: ContentNoticePayloadDto = {
    publishedAt,
    isUnread: readBoolean(item.is_read) === false,
    englishTitle: firstString(item.english_title, item.en_title) ?? '',
    badges: [noticeType],
    blocks: [],
  }

  return {
    resourceType: 'notice',
    resourceId,
    title,
    status: noticeType,
    updatedAt: publishedAt,
    summary: firstString(item.summary, item.desc, item.description, item.content),
    asset: null,
    target: createBasicTarget('notice', resourceId),
    payload,
  }
}

const normalizeLegacyNoticeSummary = (
  item: unknown,
  index: number,
  input: Extract<ContentListRequestDto, { resourceType: 'notice' }>
): ContentNoticeSummaryDto | null => {
  const normalized = normalizeLegacyNoticeItem(item, index, input)
  if (!normalized) {
    return null
  }

  return {
    noticeId: normalized.resourceId,
    title: normalized.title,
    type: normalized.status,
    publishedAt: normalized.payload.publishedAt,
    isUnread: normalized.payload.isUnread,
    visual: normalized.payload.visual,
    target: normalized.target,
  }
}

const normalizeLegacyHomeBanner = (item: unknown, index: number): ContentHomeBannerDto | null => {
  if (!isObjectRecord(item)) {
    return null
  }

  const bannerId = normalizeId(`banner_${index + 1}`, item.id, item.banner_id)
  const imageUrl = firstString(item.image, item.image_url, item.listimg, item.pic, item.url)
  const asset = createContentAsset(`banner_${bannerId}`, imageUrl)
  if (!asset) {
    return null
  }

  return {
    bannerId,
    title: firstString(item.title, item.name) ?? '首页横幅',
    liveLabel: firstString(item.live_label, item.status_label) ?? 'Live',
    tone: 'azure',
    asset,
    target: createBasicTarget('home_banner', bannerId),
  }
}

const normalizeLegacyFeaturedDrop = (
  item: unknown,
  index: number
): ContentFeaturedDropDto | null => {
  if (!isObjectRecord(item)) {
    return null
  }

  const dropId = normalizeId(`drop_${index + 1}`, item.id, item.goods_id, item.batch_id)
  const imageUrl = firstString(item.image, item.image_url, item.listimg, item.main_image)

  return {
    dropId,
    title: firstString(item.title, item.name, item.goods_name) ?? '首发藏品',
    sectionTitle: '首发藏品',
    sectionSubtitle: 'Featured Drop',
    priceLabel: '铸造价格',
    currency: 'CNY',
    priceInCent: yuanToCent(item.price),
    mintedCount: Math.max(Math.round(firstNumber(item.minted_num, item.sold_num) ?? 0), 0),
    supplyCount: Math.max(Math.round(firstNumber(item.total_num, item.issue_num) ?? 0), 0),
    asset: createContentAsset(`drop_${dropId}`, imageUrl),
    placeholderIconKey: 'box',
    target: createBasicTarget('drop', dropId),
  }
}

const normalizeLegacyActivityEntry = (
  item: unknown,
  index: number
): ContentActivityEntryDto | null => {
  if (!isObjectRecord(item)) {
    return null
  }

  const entryId = normalizeId(`activity_${index + 1}`, item.id, item.activity_id)
  const title = firstString(item.title, item.name) ?? '活动'

  return {
    entryId,
    title,
    eyebrow: firstString(item.eyebrow, item.status_label, item.type_name) ?? '活动',
    description: firstString(item.description, item.desc, item.summary) ?? '',
    tone: 'soft',
    badgeLabel: firstString(item.badge_label, item.status_label),
    target: createBasicTarget('activity', entryId),
  }
}

const isContentProfileCategoryId = (value: string): value is ContentProfileCategoryId =>
  value === 'collections' || value === 'blindBoxes' || value === 'certificates'

const resolveProfileCategoryId = (
  fallback: string | undefined,
  legacyType: unknown
): ContentProfileCategoryId => {
  if (fallback && isContentProfileCategoryId(fallback)) {
    return fallback
  }

  const normalizedType = readString(legacyType)?.toLowerCase()
  if (normalizedType === '2' || normalizedType === 'box' || normalizedType === 'blindbox') {
    return 'blindBoxes'
  }
  if (
    normalizedType === '3' ||
    normalizedType === 'certificate' ||
    normalizedType === 'credential'
  ) {
    return 'certificates'
  }

  return 'collections'
}

const normalizeLegacyProfileAssetItem = (
  item: unknown,
  index: number,
  input: Extract<ContentListRequestDto, { resourceType: 'profile_asset' }>
): ContentListItemDtoBase<'profile_asset'> | null => {
  if (!isObjectRecord(item)) {
    return null
  }

  const product = isObjectRecord(item.product) ? item.product : {}
  const resourceId = normalizeId(
    `profile_asset_${input.page}_${index + 1}`,
    item.id,
    item.user_collection_id,
    item.collection_id,
    product.id
  )
  const title =
    firstString(product.name, product.goods_name, item.goods_name, item.name) ?? '未命名资产'
  const categoryId = resolveProfileCategoryId(input.categoryId, item.goods_type)
  const imageUrl = firstString(product.listimg, product.main_image, item.listimg, item.main_image)
  const acquiredAt =
    firstString(item.acquired_at, item.create_time, item.createtime, item.updated_at) ??
    new Date().toISOString()
  const issueCount = Math.max(
    Math.round(firstNumber(item.total_num, product.total_num, item.issue_num) ?? 0),
    0
  )
  const payload: ContentProfileAssetPayloadDto = {
    categoryId,
    subCategory: firstString(item.series_name, item.type_name, input.subCategory) ?? '默认分区',
    acquiredAt,
    holdingsCount: Math.max(Math.round(firstNumber(item.num, item.count, item.holdings) ?? 1), 1),
    currency: 'CNY',
    priceInCent: yuanToCent(firstNumber(item.price, item.market_price, product.price)),
    editionCode: firstString(item.edition_code, item.rz_code, item.goods_type) ?? 'LTD',
    issueCount,
    placeholderIconKey: categoryId === 'blindBoxes' ? 'box' : 'hexagon',
    visualTone: 'mist',
    assetId: firstString(item.asset_id, product.id),
    linkedMarketItemId: firstString(item.market_id, item.goods_id, product.id),
  }

  return {
    resourceType: 'profile_asset',
    resourceId,
    title,
    status: 'OWNED',
    updatedAt: acquiredAt,
    summary: payload.subCategory,
    asset: createContentAsset(`profile_${resourceId}`, imageUrl),
    target: {
      targetType: 'profile_asset',
      targetId: resourceId,
      provider: 'content',
      params: {
        category: categoryId,
        subCategory: payload.subCategory,
      },
    },
    payload,
  }
}

const normalizeProfileAssetBlockItem = (
  item: ContentListItemDtoBase<'profile_asset'>
): ContentProfileAssetItemDto => ({
  itemId: item.resourceId,
  title: item.title,
  acquiredAt: item.payload.acquiredAt,
  subCategory: item.payload.subCategory,
  categoryId: item.payload.categoryId,
  holdingsCount: item.payload.holdingsCount,
  currency: item.payload.currency,
  priceInCent: item.payload.priceInCent,
  editionCode: item.payload.editionCode,
  issueCount: item.payload.issueCount,
  asset: item.asset,
  placeholderIconKey: item.payload.placeholderIconKey,
  visualTone: item.payload.visualTone,
  badgeType: item.payload.badgeType,
  badgeLabel: item.payload.badgeLabel,
  assetId: item.payload.assetId,
  linkedMarketItemId: item.payload.linkedMarketItemId,
  target: item.target,
})

const normalizeLegacyNoticeResource = (
  item: unknown,
  resourceId: string
): ContentResourceDto | null => {
  if (!isObjectRecord(item)) {
    return null
  }

  const listItem = normalizeLegacyNoticeItem(
    {
      ...item,
      id: firstString(item.id, item.notice_id) ?? resourceId,
    },
    0,
    {
      resourceType: 'notice',
      page: 1,
      pageSize: 1,
    }
  )
  if (!listItem) {
    return null
  }

  const body = firstString(item.content, item.detail, item.description, item.desc)
  const payload: ContentNoticePayloadDto = {
    ...listItem.payload,
    blocks: body
      ? [
          {
            id: `${resourceId}_paragraph_1`,
            kind: 'paragraph',
            text: body,
          },
        ]
      : [],
  }

  return {
    resourceType: 'notice',
    resourceId,
    title: listItem.title,
    status: listItem.status,
    updatedAt: listItem.updatedAt,
    summary: listItem.summary,
    asset: null,
    payload,
    relations: [],
  }
}

const normalizeLegacyProfileAssetResource = (
  item: unknown,
  resourceId: string
): ContentResourceDto | null => {
  const listItem = normalizeLegacyProfileAssetItem(item, 0, {
    resourceType: 'profile_asset',
    page: 1,
    pageSize: 1,
  })
  if (!listItem) {
    return null
  }

  return {
    resourceType: 'profile_asset',
    resourceId,
    title: listItem.title,
    status: listItem.status,
    updatedAt: listItem.updatedAt,
    summary: listItem.summary,
    asset: listItem.asset,
    payload: listItem.payload,
    relations: [],
  }
}

const profileAssetCategories: ContentProfileAssetCategoryDto[] = [
  {
    categoryId: 'collections',
    categoryName: '资产',
    subCategories: ['全部'],
  },
  {
    categoryId: 'blindBoxes',
    categoryName: '盲盒',
    subCategories: ['全部'],
  },
  {
    categoryId: 'certificates',
    categoryName: '资格证',
    subCategories: ['全部'],
  },
]

const unsupportedSceneEnvelope = (
  input: ContentSceneRequestDto
): ContentEnvelope<ContentSceneDto> =>
  ({
    code: 501,
    message: `[content-backend-http] scene ${input.sceneId} is not mapped yet.`,
    requestId: '',
    serverTime: new Date().toISOString(),
    data: null,
  }) satisfies ContentEnvelope<ContentSceneDto>

const unsupportedResourceEnvelope = (
  input: ContentResourceRequestDto
): ContentEnvelope<ContentResourceDto> =>
  ({
    code: 501,
    message: `[content-backend-http] resource ${input.resourceType} is not mapped yet.`,
    requestId: '',
    serverTime: new Date().toISOString(),
    data: null,
  }) satisfies ContentEnvelope<ContentResourceDto>

const unsupportedActionEnvelope = (
  input: ContentActionRequestDto
): ContentEnvelope<ContentActionResultDto> =>
  ({
    code: 501,
    message: `[content-backend-http] action ${input.actionType} is not mapped yet.`,
    requestId: '',
    serverTime: new Date().toISOString(),
    data: null,
  }) satisfies ContentEnvelope<ContentActionResultDto>

export const createContentBackendHttpImplementation = (
  options: ContentBackendHttpImplementationOptions
): ContentPort => {
  const baseUrl = normalizeBaseUrl(options.baseUrl, options.isProduction)

  const requestLegacy = (path: string, payload?: Record<string, unknown>) =>
    requestBackend('POST', buildBackendUrl(baseUrl, path), payload)
  const requestLegacyPath = (
    path: string,
    pathParams: Record<string, string | number | undefined>,
    payload?: Record<string, unknown>
  ) => requestBackend('POST', buildBackendUrl(baseUrl, path, pathParams), payload)

  const resolveHomeScene = async (): Promise<ContentEnvelope<ContentSceneDto>> => {
    const [noticeResponse, bannerResponse, featuredResponse, marketResponse] = await Promise.all([
      requestLegacy(backendEndpoints.noticeList, {
        page: 1,
        list_rows: 3,
      }),
      requestLegacy(backendEndpoints.bannerList, {
        type: 1,
      }),
      requestLegacy(backendEndpoints.featuredDropList, {
        page: 1,
        list_rows: 1,
      }),
      requestLegacy(backendEndpoints.marketList, {
        page: 1,
        list_rows: 4,
      }),
    ])

    const noticePage = extractPageItems(noticeResponse.envelope.data, 1, 3)
    const bannerPage = extractPageItems(bannerResponse.envelope.data, 1, 20)
    const featuredPage = extractPageItems(featuredResponse.envelope.data, 1, 1)
    const marketPage = extractPageItems(marketResponse.envelope.data, 1, 4)

    const notices = noticePage.items
      .map((item, index) =>
        normalizeLegacyNoticeSummary(item, index, {
          resourceType: 'notice',
          page: 1,
          pageSize: 3,
        })
      )
      .filter((item): item is ContentNoticeSummaryDto => Boolean(item))
    const banners = bannerPage.items
      .map((item, index) => normalizeLegacyHomeBanner(item, index))
      .filter((item): item is ContentHomeBannerDto => Boolean(item))
    const featured =
      featuredPage.items
        .map((item, index) => normalizeLegacyFeaturedDrop(item, index))
        .find((item): item is ContentFeaturedDropDto => Boolean(item)) ??
      normalizeLegacyFeaturedDrop({}, 0)
    const marketItems = marketPage.items
      .map((item, index) =>
        normalizeLegacyMarketSummary(item, index, {
          resourceType: 'market_item',
          sort: {
            field: 'listedAt',
            direction: 'desc',
          },
          page: 1,
          pageSize: 4,
        })
      )
      .filter((item): item is ContentMarketItemSummaryDto => Boolean(item))

    const blocks: ContentSceneBlockDto[] = [
      {
        blockType: 'notice_bar',
        label: '公告栏',
        detailLabel: '查看公告详情',
        items: notices,
      },
      {
        blockType: 'banner_carousel',
        items: banners,
      },
      {
        blockType: 'featured_drop',
        item:
          featured ??
          ({
            dropId: '',
            title: '',
            sectionTitle: '首发藏品',
            sectionSubtitle: 'Featured Drop',
            priceLabel: '铸造价格',
            currency: 'CNY',
            priceInCent: 0,
            mintedCount: 0,
            supplyCount: 0,
            asset: null,
            placeholderIconKey: 'box',
            target: createBasicTarget('drop', ''),
          } satisfies ContentFeaturedDropDto),
      },
      {
        blockType: 'market_overview',
        sectionTitle: '藏品市场',
        sectionSubtitle: 'Market Flow',
        categories: [
          {
            categoryId: 'all',
            categoryName: '全部',
          },
        ],
        actions: [
          {
            actionId: 'search',
            label: '搜索',
            target: createBasicTarget('market_action', 'search'),
          },
          {
            actionId: 'history',
            label: '历史',
            target: createBasicTarget('market_action', 'history'),
          },
        ],
        sortConfig: {
          defaultField: 'listedAt',
          defaultDirection: 'desc',
          options: [
            {
              field: 'listedAt',
              label: '时间',
            },
            {
              field: 'priceInCent',
              label: '市场价',
            },
          ],
        },
        items: marketItems,
      },
    ]

    return createContentEnvelope<ContentSceneDto>(noticeResponse.envelope, {
      sceneId: 'home',
      version: 1,
      updatedAt: new Date().toISOString(),
      blocks,
    })
  }

  const resolveActivityScene = async (): Promise<ContentEnvelope<ContentSceneDto>> => {
    const [activityResponse, noticeResponse] = await Promise.all([
      requestLegacy(backendEndpoints.activityList, {}),
      requestLegacy(backendEndpoints.noticeList, {
        page: 1,
        list_rows: 8,
      }),
    ])

    const activityPage = extractPageItems(activityResponse.envelope.data, 1, 8)
    const noticePage = extractPageItems(noticeResponse.envelope.data, 1, 8)
    const activityEntries = activityPage.items
      .map((item, index) => normalizeLegacyActivityEntry(item, index))
      .filter((item): item is ContentActivityEntryDto => Boolean(item))
    const notices = noticePage.items
      .map((item, index) =>
        normalizeLegacyNoticeSummary(item, index, {
          resourceType: 'notice',
          page: 1,
          pageSize: 8,
        })
      )
      .filter((item): item is ContentNoticeSummaryDto => Boolean(item))
    const noticeTags = Array.from(new Set(['全部', ...notices.map((item) => item.type)]))

    return createContentEnvelope<ContentSceneDto>(activityResponse.envelope, {
      sceneId: 'activity',
      version: 1,
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          blockType: 'activity_entries',
          items: activityEntries,
        },
        {
          blockType: 'activity_notice_feed',
          tags: noticeTags,
          items: notices,
        },
      ],
    })
  }

  const resolveProfileScene = async (): Promise<ContentEnvelope<ContentSceneDto>> => {
    const [userResponse, assetResponse] = await Promise.all([
      requestLegacy(backendEndpoints.userInfo, {}),
      requestLegacy(backendEndpoints.profileAssetList, {
        page: 1,
        list_rows: 9,
      }),
    ])

    const userInfo = isObjectRecord(userResponse.envelope.data) ? userResponse.envelope.data : {}
    const assetPage = extractPageItems(assetResponse.envelope.data, 1, 9)
    const assets = assetPage.items
      .map((item, index) =>
        normalizeLegacyProfileAssetItem(item, index, {
          resourceType: 'profile_asset',
          page: 1,
          pageSize: 9,
        })
      )
      .filter((item): item is ContentListItemDtoBase<'profile_asset'> => Boolean(item))
      .map((item) => normalizeProfileAssetBlockItem(item))

    return createContentEnvelope<ContentSceneDto>(userResponse.envelope, {
      sceneId: 'profile',
      version: 1,
      updatedAt: new Date().toISOString(),
      blocks: [
        {
          blockType: 'profile_summary',
          displayName:
            firstString(userInfo.nickname, userInfo.username, userInfo.name, userInfo.mobile) ??
            '当前用户',
          address:
            firstString(
              userInfo.user_hash,
              userInfo.wallet_address,
              userInfo.address,
              userInfo.mobile
            ) ?? '',
          summary: firstString(userInfo.summary, userInfo.desc),
          currency: 'CNY',
          totalValueInCent: yuanToCent(
            firstNumber(userInfo.total_money, userInfo.total_value, userInfo.balance)
          ),
          holdingsCount: Math.max(
            Math.round(
              firstNumber(userInfo.collection_num, userInfo.holdings_count, userInfo.asset_count) ??
                assets.length
            ),
            0
          ),
          networkLabel: firstString(userInfo.network_label) ?? '天异链路',
          statusLabel: firstString(userInfo.status_label) ?? '已连接',
          qrPayload: firstString(
            userInfo.invitation_code,
            userInfo.invite_code,
            userInfo.user_hash
          ),
        },
        {
          blockType: 'profile_assets',
          categories: profileAssetCategories.map((item) => ({
            ...item,
            subCategories: [...item.subCategories],
          })),
          items: assets,
        },
      ],
    })
  }

  return {
    async getScene(input: ContentSceneRequestDto) {
      if (input.sceneId === 'home') {
        return resolveHomeScene()
      }

      if (input.sceneId === 'activity') {
        return resolveActivityScene()
      }

      if (input.sceneId === 'profile') {
        return resolveProfileScene()
      }

      return unsupportedSceneEnvelope(input)
    },

    async getResource(input: ContentResourceRequestDto) {
      if (input.resourceType === 'notice') {
        const response = await requestLegacyPath(backendEndpoints.noticeDetail, {
          id: input.resourceId,
        })
        if (resolveEnvelopeCode(response.envelope) !== 0) {
          return createContentEnvelope<ContentResourceDto>(response.envelope, null)
        }

        return createContentEnvelope<ContentResourceDto>(
          response.envelope,
          normalizeLegacyNoticeResource(response.envelope.data, input.resourceId)
        )
      }

      if (input.resourceType === 'profile_asset') {
        const response = await requestLegacyPath(backendEndpoints.profileAssetDetail, {
          id: input.resourceId,
        })
        if (resolveEnvelopeCode(response.envelope) !== 0) {
          return createContentEnvelope<ContentResourceDto>(response.envelope, null)
        }

        return createContentEnvelope<ContentResourceDto>(
          response.envelope,
          normalizeLegacyProfileAssetResource(
            isObjectRecord(response.envelope.data)
              ? {
                  ...response.envelope.data,
                  id: input.resourceId,
                }
              : response.envelope.data,
            input.resourceId
          )
        )
      }

      return unsupportedResourceEnvelope(input)
    },

    async getList(
      input: ContentListRequestDto,
      options: ContentListRequestOptions = {}
    ): Promise<ContentListPortResponse> {
      const requestPayload: Record<string, unknown> = {
        page: input.page,
        list_rows: input.pageSize,
      }

      if (input.resourceType === 'market_item') {
        if (input.categoryId && input.categoryId !== 'all') {
          requestPayload.series_id = input.categoryId
        }
        if (input.keyword) {
          requestPayload.keywords = input.keyword
        }

        const response = await requestLegacy(backendEndpoints.marketList, requestPayload)
        if (resolveEnvelopeCode(response.envelope) !== 0) {
          return {
            envelope: createContentEnvelope<ContentListDto>(response.envelope, null),
            etag: response.headers.etag,
            notModified: false,
          }
        }

        const extracted = extractPageItems(response.envelope.data, input.page, input.pageSize)
        const items = extracted.items
          .map((item, index) => normalizeLegacyMarketItem(item, index, input))
          .filter((item): item is ContentListItemDtoBase<'market_item'> => Boolean(item))

        return {
          envelope: createContentEnvelope<ContentListDto>(response.envelope, {
            resourceType: 'market_item',
            page: input.page,
            pageSize: input.pageSize,
            total: extracted.total ?? items.length,
            items,
          }),
          etag: response.headers.etag ?? options.ifNoneMatch,
          notModified: false,
        }
      }

      if (input.resourceType === 'notice') {
        if (input.tag && input.tag !== '全部') {
          requestPayload.type = input.tag
        }
        if (input.keyword) {
          requestPayload.keywords = input.keyword
        }

        const response = await requestLegacy(backendEndpoints.noticeList, requestPayload)
        if (resolveEnvelopeCode(response.envelope) !== 0) {
          return {
            envelope: createContentEnvelope<ContentListDto>(response.envelope, null),
            etag: response.headers.etag,
            notModified: false,
          }
        }

        const extracted = extractPageItems(response.envelope.data, input.page, input.pageSize)
        const items = extracted.items
          .map((item, index) => normalizeLegacyNoticeItem(item, index, input))
          .filter((item): item is ContentListItemDtoBase<'notice'> => Boolean(item))

        return {
          envelope: createContentEnvelope<ContentListDto>(response.envelope, {
            resourceType: 'notice',
            page: input.page,
            pageSize: input.pageSize,
            total: extracted.total ?? items.length,
            items,
          }),
          etag: response.headers.etag ?? options.ifNoneMatch,
          notModified: false,
        }
      }

      if (input.categoryId && input.categoryId !== 'all') {
        requestPayload.type = input.categoryId
      }
      if (input.subCategory && input.subCategory !== '全部') {
        requestPayload.sub_type = input.subCategory
      }
      if (input.keyword) {
        requestPayload.keyword = input.keyword
      }

      const response = await requestLegacy(backendEndpoints.profileAssetList, requestPayload)
      if (resolveEnvelopeCode(response.envelope) !== 0) {
        return {
          envelope: createContentEnvelope<ContentListDto>(response.envelope, null),
          etag: response.headers.etag,
          notModified: false,
        }
      }

      const extracted = extractPageItems(response.envelope.data, input.page, input.pageSize)
      const items = extracted.items
        .map((item, index) => normalizeLegacyProfileAssetItem(item, index, input))
        .filter((item): item is ContentListItemDtoBase<'profile_asset'> => Boolean(item))

      return {
        envelope: createContentEnvelope<ContentListDto>(response.envelope, {
          resourceType: 'profile_asset',
          page: input.page,
          pageSize: input.pageSize,
          total: extracted.total ?? items.length,
          items,
        }),
        etag: response.headers.etag ?? options.ifNoneMatch,
        notModified: false,
      }
    },

    async runAction(input: ContentActionRequestDto) {
      if (input.actionType !== 'notice-read') {
        return unsupportedActionEnvelope(input)
      }

      const response = await requestLegacy(backendEndpoints.noticeRead, {
        id: input.noticeId,
      })
      if (resolveEnvelopeCode(response.envelope) !== 0) {
        return createContentEnvelope<ContentActionResultDto>(response.envelope, null)
      }

      return createContentEnvelope<ContentActionResultDto>(response.envelope, {
        noticeId: input.noticeId,
        isUnread: false,
      })
    },
  }
}
