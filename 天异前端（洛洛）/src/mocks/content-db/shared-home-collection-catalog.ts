/**
 * Responsibility: define the shared mock collection catalog used to build home-market
 * and profile-asset mock records across scenes.
 * Out of scope: provider runtime behavior, UI presentation mapping, and asset file
 * storage layout.
 */
import type {
  ContentMarketBadgeType,
  ContentMarketSortField,
  ContentSortDirection,
  ContentMarketVisualTone,
  ContentPlaceholderIconKey,
  ContentProfileCategoryId,
} from '../../contracts/content-api.contract'

export interface SharedHomeCollectionRecord {
  itemId: string
  title: string
  currency: 'CNY'
  priceInCent: number
  listedAt: string
  tradeVolume24h: number
  holderCount: number
  editionCode: 'LTD' | 'BOX' | 'PASS'
  issueCount: number
  marketCategoryId: string
  assetId: string
  imageFileName: string
  imageWidth: number
  imageHeight: number
  placeholderIconKey: ContentPlaceholderIconKey
  visualTone: ContentMarketVisualTone
  badgeType?: ContentMarketBadgeType
  badgeLabel?: string
  status: 'online'
  updatedAt: string
  summary: string
  profileCategoryId: ContentProfileCategoryId
  profileSubCategory: '数字艺术' | '3D组件' | '音乐现场'
  acquiredAt?: string
  linkedMarketItemId: string
}

const baseSummary = '首页市场与个人中心共用的藏品 mock 目录，后续接真实内容时继续沿用这条共享链路。'
const updatedAt = '2026-03-26T23:58:00+08:00'

export const homeMarketSortOptionSeed: Array<{ field: ContentMarketSortField; label: string }> = [
  { field: 'listedAt', label: '时间' },
  { field: 'priceInCent', label: '市场价' },
]

export const homeMarketDefaultSortField: ContentMarketSortField = 'listedAt'
export const homeMarketDefaultSortDirection: ContentSortDirection = 'desc'

/**
 * 首页市场卡与个人中心“我的藏品”必须共用这份目录。
 * 个人中心暂未校对完成，这里只作为预留链路；后续改动需要避免破坏同藏品关联。
 * 市场分区当前强制单归属：每个藏品只允许进入一个市场组。
 */
const sharedHomeCollectionCatalogSeed: Omit<
  SharedHomeCollectionRecord,
  'listedAt' | 'tradeVolume24h' | 'holderCount'
>[] = [
  {
    itemId: 'C-01',
    title: '青藤萌种',
    currency: 'CNY',
    priceInCent: 45000,
    editionCode: 'BOX',
    issueCount: 48,
    marketCategoryId: '3d-component',
    assetId: 'ASSET-HOME-MARKET-C01',
    imageFileName: 'c01-market.png',
    imageWidth: 1728,
    imageHeight: 2304,
    placeholderIconKey: 'cpu',
    visualTone: 'aqua',
    badgeType: 'hot',
    badgeLabel: 'HOT',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'blindBoxes',
    profileSubCategory: '3D组件',
    acquiredAt: '2024.10.05',
    linkedMarketItemId: 'C-01',
  },
  {
    itemId: 'C-02',
    title: '云海牛魇',
    currency: 'CNY',
    priceInCent: 68000,
    editionCode: 'LTD',
    issueCount: 12,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C02',
    imageFileName: 'c02-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'hexagon',
    visualTone: 'ink',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.08',
    linkedMarketItemId: 'C-02',
  },
  {
    itemId: 'C-03',
    title: '青岚滑手',
    currency: 'CNY',
    priceInCent: 38800,
    editionCode: 'LTD',
    issueCount: 64,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C03',
    imageFileName: 'c03-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'disc3',
    visualTone: 'sand',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '音乐现场',
    linkedMarketItemId: 'C-03',
  },
  {
    itemId: 'C-04',
    title: '裂彩奔影',
    currency: 'CNY',
    priceInCent: 52000,
    editionCode: 'LTD',
    issueCount: 36,
    marketCategoryId: 'generated-video',
    assetId: 'ASSET-HOME-MARKET-C04',
    imageFileName: 'c04-market.png',
    imageWidth: 2880,
    imageHeight: 3840,
    placeholderIconKey: 'aperture',
    visualTone: 'mist',
    badgeType: 'new',
    badgeLabel: 'NEW',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.10',
    linkedMarketItemId: 'C-04',
  },
  {
    itemId: 'C-05',
    title: '终界遗神·初相',
    currency: 'CNY',
    priceInCent: 76000,
    editionCode: 'LTD',
    issueCount: 9,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C05',
    imageFileName: 'c05-market.png',
    imageWidth: 936,
    imageHeight: 1664,
    placeholderIconKey: 'hexagon',
    visualTone: 'ink',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    linkedMarketItemId: 'C-05',
  },
  {
    itemId: 'C-06',
    title: '终界遗神·回响',
    currency: 'CNY',
    priceInCent: 74800,
    editionCode: 'LTD',
    issueCount: 11,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C06',
    imageFileName: 'c06-market.png',
    imageWidth: 936,
    imageHeight: 1664,
    placeholderIconKey: 'aperture',
    visualTone: 'ink',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    linkedMarketItemId: 'C-06',
  },
  {
    itemId: 'C-07',
    title: '终界遗神·残照',
    currency: 'CNY',
    priceInCent: 77200,
    editionCode: 'LTD',
    issueCount: 8,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C07',
    imageFileName: 'c07-market.png',
    imageWidth: 936,
    imageHeight: 1664,
    placeholderIconKey: 'aperture',
    visualTone: 'ink',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    linkedMarketItemId: 'C-07',
  },
  {
    itemId: 'C-08',
    title: '虚无遗神',
    currency: 'CNY',
    priceInCent: 79900,
    editionCode: 'LTD',
    issueCount: 6,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C08',
    imageFileName: 'c08-market.png',
    imageWidth: 936,
    imageHeight: 1664,
    placeholderIconKey: 'aperture',
    visualTone: 'ink',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    linkedMarketItemId: 'C-08',
  },
  {
    itemId: 'C-09',
    title: '星海旅人',
    currency: 'CNY',
    priceInCent: 89900,
    editionCode: 'LTD',
    issueCount: 18,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C09',
    imageFileName: 'c09-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'box',
    visualTone: 'mist',
    badgeType: 'featured',
    badgeLabel: '精选',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.12',
    linkedMarketItemId: 'C-09',
  },
  {
    itemId: 'C-10',
    title: '夕照刃客',
    currency: 'CNY',
    priceInCent: 61000,
    editionCode: 'LTD',
    issueCount: 24,
    marketCategoryId: 'virtual-wear',
    assetId: 'ASSET-HOME-MARKET-C10',
    imageFileName: 'c10-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'triangle',
    visualTone: 'ink',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    linkedMarketItemId: 'C-10',
  },
  {
    itemId: 'C-11',
    title: '蓝域熊灵',
    currency: 'CNY',
    priceInCent: 46800,
    editionCode: 'BOX',
    issueCount: 40,
    marketCategoryId: 'generated-video',
    assetId: 'ASSET-HOME-MARKET-C11',
    imageFileName: 'c11-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'hexagon',
    visualTone: 'aqua',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'blindBoxes',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.15',
    linkedMarketItemId: 'C-11',
  },
  {
    itemId: 'C-12',
    title: '北豚尾猴',
    currency: 'CNY',
    priceInCent: 49900,
    editionCode: 'BOX',
    issueCount: 32,
    marketCategoryId: 'co-brand-badge',
    assetId: 'ASSET-HOME-MARKET-C12',
    imageFileName: 'c12-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'box',
    visualTone: 'aqua',
    badgeType: 'new',
    badgeLabel: 'NEW',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'blindBoxes',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.16',
    linkedMarketItemId: 'C-12',
  },
  {
    itemId: 'C-13',
    title: '番茄手札',
    currency: 'CNY',
    priceInCent: 34200,
    editionCode: 'BOX',
    issueCount: 56,
    marketCategoryId: '3d-component',
    assetId: 'ASSET-HOME-MARKET-C13',
    imageFileName: 'c13-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'cpu',
    visualTone: 'sand',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'blindBoxes',
    profileSubCategory: '3D组件',
    linkedMarketItemId: 'C-13',
  },
  {
    itemId: 'C-14',
    title: '黑刃风暴',
    currency: 'CNY',
    priceInCent: 59000,
    editionCode: 'LTD',
    issueCount: 20,
    marketCategoryId: 'virtual-wear',
    assetId: 'ASSET-HOME-MARKET-C14',
    imageFileName: 'c14-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'triangle',
    visualTone: 'ink',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '音乐现场',
    linkedMarketItemId: 'C-14',
  },
  {
    itemId: 'C-15',
    title: '北境侧梦',
    currency: 'CNY',
    priceInCent: 43800,
    editionCode: 'BOX',
    issueCount: 28,
    marketCategoryId: 'co-brand-badge',
    assetId: 'ASSET-HOME-MARKET-C15',
    imageFileName: 'c15-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'box',
    visualTone: 'mist',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'blindBoxes',
    profileSubCategory: '数字艺术',
    linkedMarketItemId: 'C-15',
  },
  {
    itemId: 'C-16',
    title: '符文见证者',
    currency: 'CNY',
    priceInCent: 72000,
    editionCode: 'PASS',
    issueCount: 16,
    marketCategoryId: 'equity-certificate',
    assetId: 'ASSET-HOME-MARKET-C16',
    imageFileName: 'c16-market.png',
    imageWidth: 936,
    imageHeight: 1664,
    placeholderIconKey: 'hexagon',
    visualTone: 'mist',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'certificates',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.18',
    linkedMarketItemId: 'C-16',
  },
  {
    itemId: 'C-17',
    title: '赤日狂舞',
    currency: 'CNY',
    priceInCent: 68800,
    editionCode: 'PASS',
    issueCount: 14,
    marketCategoryId: 'equity-certificate',
    assetId: 'ASSET-HOME-MARKET-C17',
    imageFileName: 'c17-market.png',
    imageWidth: 936,
    imageHeight: 1664,
    placeholderIconKey: 'hexagon',
    visualTone: 'sand',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'certificates',
    profileSubCategory: '数字艺术',
    linkedMarketItemId: 'C-17',
  },
  {
    itemId: 'C-18',
    title: '青灯纸魇',
    currency: 'CNY',
    priceInCent: 76000,
    editionCode: 'PASS',
    issueCount: 10,
    marketCategoryId: 'equity-certificate',
    assetId: 'ASSET-HOME-MARKET-C18',
    imageFileName: 'c18-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'hexagon',
    visualTone: 'ink',
    badgeType: 'featured',
    badgeLabel: '精选',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'certificates',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.19',
    linkedMarketItemId: 'C-18',
  },
  {
    itemId: 'C-19',
    title: '帐幕呆鸡',
    currency: 'CNY',
    priceInCent: 31800,
    editionCode: 'BOX',
    issueCount: 72,
    marketCategoryId: '3d-component',
    assetId: 'ASSET-HOME-MARKET-C19',
    imageFileName: 'c19-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'cpu',
    visualTone: 'sand',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'blindBoxes',
    profileSubCategory: '3D组件',
    linkedMarketItemId: 'C-19',
  },
  {
    itemId: 'C-20',
    title: '麦浪旅伴',
    currency: 'CNY',
    priceInCent: 52000,
    editionCode: 'LTD',
    issueCount: 36,
    marketCategoryId: '3d-component',
    assetId: 'ASSET-HOME-MARKET-C20',
    imageFileName: 'c20-market.png',
    imageWidth: 1728,
    imageHeight: 2304,
    placeholderIconKey: 'hexagon',
    visualTone: 'mist',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '3D组件',
    acquiredAt: '2024.10.20',
    linkedMarketItemId: 'C-20',
  },
  {
    itemId: 'C-21',
    title: '玫瑰列车',
    currency: 'CNY',
    priceInCent: 56000,
    editionCode: 'LTD',
    issueCount: 22,
    marketCategoryId: 'generated-video',
    assetId: 'ASSET-HOME-MARKET-C21',
    imageFileName: 'c21-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'disc3',
    visualTone: 'sand',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '音乐现场',
    linkedMarketItemId: 'C-21',
  },
  {
    itemId: 'C-22',
    title: '雨幕自由者',
    currency: 'CNY',
    priceInCent: 60200,
    editionCode: 'LTD',
    issueCount: 18,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C22',
    imageFileName: 'c22-market.png',
    imageWidth: 2880,
    imageHeight: 3840,
    placeholderIconKey: 'aperture',
    visualTone: 'mist',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '音乐现场',
    acquiredAt: '2024.10.22',
    linkedMarketItemId: 'C-22',
  },
  {
    itemId: 'C-23',
    title: '宇宙机匣',
    currency: 'CNY',
    priceInCent: 84000,
    editionCode: 'PASS',
    issueCount: 8,
    marketCategoryId: 'equity-certificate',
    assetId: 'ASSET-HOME-MARKET-C23',
    imageFileName: 'c23-market.png',
    imageWidth: 936,
    imageHeight: 1664,
    placeholderIconKey: 'hexagon',
    visualTone: 'ink',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'certificates',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.23',
    linkedMarketItemId: 'C-23',
  },
  {
    itemId: 'C-24',
    title: '旷野舞者',
    currency: 'CNY',
    priceInCent: 54800,
    editionCode: 'LTD',
    issueCount: 30,
    marketCategoryId: 'digital-art',
    assetId: 'ASSET-HOME-MARKET-C24',
    imageFileName: 'c24-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'box',
    visualTone: 'mist',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '数字艺术',
    linkedMarketItemId: 'C-24',
  },
  {
    itemId: 'C-25',
    title: '雪朝禁城',
    currency: 'CNY',
    priceInCent: 73200,
    editionCode: 'PASS',
    issueCount: 12,
    marketCategoryId: 'equity-certificate',
    assetId: 'ASSET-HOME-MARKET-C25',
    imageFileName: 'c25-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'hexagon',
    visualTone: 'sand',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'certificates',
    profileSubCategory: '数字艺术',
    acquiredAt: '2024.10.24',
    linkedMarketItemId: 'C-25',
  },
  {
    itemId: 'C-26',
    title: '荒原槊影',
    currency: 'CNY',
    priceInCent: 57600,
    editionCode: 'LTD',
    issueCount: 26,
    marketCategoryId: 'music-scene',
    assetId: 'ASSET-HOME-MARKET-C26',
    imageFileName: 'c26-market.png',
    imageWidth: 1440,
    imageHeight: 2560,
    placeholderIconKey: 'disc3',
    visualTone: 'sand',
    status: 'online',
    updatedAt,
    summary: baseSummary,
    profileCategoryId: 'collections',
    profileSubCategory: '音乐现场',
    linkedMarketItemId: 'C-26',
  },
]

const duplicateCollectionItemIdOffset = sharedHomeCollectionCatalogSeed.length

const buildSharedHomeCollectionDuplicateItemId = (index: number) => {
  return `C-${String(index + duplicateCollectionItemIdOffset + 1).padStart(2, '0')}`
}

const buildSharedHomeCollectionDuplicateAssetId = (itemId: string) => {
  return `ASSET-HOME-MARKET-${itemId.replace('-', '')}`
}

// 直接复用现有藏品图补一批假藏品，用于分页、加载与长列表体验验证。
const sharedHomeCollectionCatalogExpandedSeed = [
  ...sharedHomeCollectionCatalogSeed,
  ...sharedHomeCollectionCatalogSeed.map((item, index) => {
    const duplicateItemId = buildSharedHomeCollectionDuplicateItemId(index)

    return {
      ...item,
      itemId: duplicateItemId,
      title: `${item.title}2`,
      assetId: buildSharedHomeCollectionDuplicateAssetId(duplicateItemId),
      linkedMarketItemId: duplicateItemId,
    }
  }),
]

const sharedHomeCollectionListedAtBaseMs = Date.parse('2026-02-18T09:30:00+08:00')

const buildSharedHomeCollectionListedAt = (index: number) => {
  return new Date(sharedHomeCollectionListedAtBaseMs + index * 6 * 60 * 60 * 1000).toISOString()
}

const buildSharedHomeCollectionTradeVolume24h = (
  item: Omit<SharedHomeCollectionRecord, 'listedAt' | 'tradeVolume24h' | 'holderCount'>,
  index: number
) => {
  return Math.max(
    24,
    Math.round(item.issueCount * 1.8 + item.priceInCent / 2400 + (index % 5) * 17)
  )
}

const buildSharedHomeCollectionHolderCount = (
  item: Omit<SharedHomeCollectionRecord, 'listedAt' | 'tradeVolume24h' | 'holderCount'>,
  index: number
) => {
  return Math.max(12, Math.round(item.issueCount * 2.2 + (index % 7) * 11 + 18))
}

export const sharedHomeCollectionCatalog: SharedHomeCollectionRecord[] =
  sharedHomeCollectionCatalogExpandedSeed.map((item, index) => ({
    ...item,
    listedAt: buildSharedHomeCollectionListedAt(index),
    tradeVolume24h: buildSharedHomeCollectionTradeVolume24h(item, index),
    holderCount: buildSharedHomeCollectionHolderCount(item, index),
  }))

const sharedHomeCollectionByItemId = new Map(
  sharedHomeCollectionCatalog.map((item) => [item.itemId, item])
)
const sharedHomeCollectionByAssetId = new Map(
  sharedHomeCollectionCatalog.map((item) => [item.assetId, item])
)

export const getSharedHomeCollectionByItemId = (itemId?: string | null) => {
  if (!itemId) {
    return undefined
  }

  return sharedHomeCollectionByItemId.get(itemId)
}

export const getSharedHomeCollectionByAssetId = (assetId?: string | null) => {
  if (!assetId) {
    return undefined
  }

  return sharedHomeCollectionByAssetId.get(assetId)
}

export const ownedHomeCollectionCatalog = sharedHomeCollectionCatalog.filter((item) =>
  Boolean(item.acquiredAt)
)

export const homeMarketCategoryIds = [
  'all',
  ...new Set(sharedHomeCollectionCatalog.map((item) => item.marketCategoryId)),
]

export const homeMarketItemIds = sharedHomeCollectionCatalog.map((item) => item.itemId)
