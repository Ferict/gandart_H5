import {
  adaptHomeRailActivityNoticeListItemDto,
  adaptHomeRailActivitySceneDto,
  adaptHomeRailActivityNoticeVisualDto,
} from '@/adapters/content/homeRailActivityContent.adapter'
import {
  adaptHomeRailHomeMarketListItemDto,
  adaptHomeRailHomeSceneDto,
  adaptHomeRailHomeTargetDto,
} from '@/adapters/content/homeRailHomeContent.adapter'
import {
  adaptHomeRailProfileAssetListItemDto,
  adaptHomeRailProfileSceneDto,
  adaptHomeRailProfileTargetDto,
} from '@/adapters/content/homeRailProfileContent.adapter'
import type {
  ContentAssetDto,
  ContentListItemDtoBase,
  ContentNoticePayloadDto,
  ContentSceneDto,
  ContentTargetDto,
} from '@/contracts/content-api.contract'

const profileAssetTarget = {
  targetType: 'profile_asset',
  targetId: 'profile-asset-001',
  provider: 'content',
  params: {
    category: 'collections',
    subCategory: '  rare set  ',
  },
} satisfies ContentTargetDto

const homeScene = {
  sceneId: 'home',
  version: 3,
  updatedAt: '2026-04-24T00:00:00.000Z',
  blocks: [
    {
      blockType: 'notice_bar',
      label: '公告栏',
      detailLabel: '查看公告详情',
      items: [
        {
          noticeId: 'notice-001',
          title: '公告 A',
          type: 'platform',
          publishedAt: '2026-04-24T01:02:03.000Z',
          isUnread: true,
          target: {
            targetType: 'notice',
            targetId: 'notice-001',
            provider: 'content',
          },
        },
      ],
    },
    {
      blockType: 'banner_carousel',
      items: [
        {
          bannerId: 'banner-001',
          title: 'Banner A',
          liveLabel: 'Live',
          tone: 'dawn',
          asset: {
            assetId: 'asset-banner-001',
            originalUrl: 'https://example.com/banner.jpg',
            width: 1200,
            height: 480,
            focalPoint: { x: 0.2, y: 0.8 },
            variants: {
              banner: 'https://example.com/banner@2x.jpg',
            },
          } satisfies ContentAssetDto,
          target: {
            targetType: 'home_banner',
            targetId: 'home-banner-001',
            provider: 'content',
          },
        },
      ],
    },
    {
      blockType: 'featured_drop',
      item: {
        dropId: 'drop-001',
        title: 'Drop A',
        sectionTitle: '首发藏品',
        sectionSubtitle: 'Featured Drop',
        priceLabel: '铸造价格',
        currency: 'CNY',
        priceInCent: 19900,
        mintedCount: 10,
        supplyCount: 100,
        asset: {
          assetId: 'asset-drop-001',
          originalUrl: 'https://example.com/drop.jpg',
          width: 800,
          height: 800,
          variants: {
            card: 'https://example.com/drop@2x.jpg',
          },
        } satisfies ContentAssetDto,
        placeholderIconKey: 'box',
        target: {
          targetType: 'drop',
          targetId: 'drop-001',
          provider: 'content',
        },
      },
    },
    {
      blockType: 'market_overview',
      sectionTitle: '藏品市场',
      sectionSubtitle: 'Market Flow',
      categories: [{ categoryId: 'cat-001', categoryName: '艺术' }],
      actions: [
        {
          actionId: 'search',
          label: '搜索',
          target: {
            targetType: 'market_action',
            targetId: 'search',
            provider: 'content',
          },
        },
      ],
      sortConfig: {
        defaultField: 'priceInCent',
        defaultDirection: 'desc',
        options: [
          { field: 'priceInCent', label: '市场价' },
          { field: 'tradeVolume24h', label: '成交量' },
        ],
      },
    },
  ],
} satisfies ContentSceneDto

const homeMarketItem = {
  resourceType: 'market_item',
  resourceId: 'market-item-001',
  title: '市场卡片',
  status: 'published',
  updatedAt: '2026-04-24T02:03:04.000Z',
  target: {
    targetType: 'market_item',
    targetId: 'market-item-001',
    provider: 'content',
  },
  asset: {
    assetId: 'asset-market-001',
    originalUrl: 'https://example.com/market.jpg',
    width: 640,
    height: 640,
    variants: {
      card: 'https://example.com/market@2x.jpg',
    },
  } satisfies ContentAssetDto,
  payload: {
    currency: 'CNY',
    priceInCent: 38800,
    listedAt: '2026-04-23T10:20:30.000Z',
    tradeVolume24h: 1234,
    holderCount: 56,
    editionCode: 'ED-001',
    issueCount: 99,
    categoryIds: ['art', 'featured'],
    placeholderIconKey: 'box',
    visualTone: 'aqua',
    badgeType: 'hot',
    badgeLabel: 'Hot',
  },
} satisfies ContentListItemDtoBase<'market_item'>

const activityScene = {
  sceneId: 'activity',
  version: 5,
  updatedAt: '2026-04-24T00:00:00.000Z',
  blocks: [
    {
      blockType: 'activity_entries',
      items: [
        {
          entryId: 'entry-001',
          title: '活动入口',
          eyebrow: 'Today',
          description: '活动描述',
          tone: 'soft',
          badgeLabel: 'New',
          target: {
            targetType: 'activity',
            targetId: 'activity-001',
            provider: 'content',
          },
        },
      ],
    },
    {
      blockType: 'activity_notice_feed',
      tags: ['全部', '公告'],
      items: [
        {
          noticeId: 'notice-activity-001',
          title: '活动公告',
          type: 'platform',
          publishedAt: '2026-04-24T03:04:05.000Z',
          isUnread: false,
          visual: {
            preset: 'platform',
            asset: {
              assetId: 'asset-notice-001',
              originalUrl: 'https://example.com/notice.jpg',
              width: 640,
              height: 360,
            } satisfies ContentAssetDto,
          },
          target: {
            targetType: 'notice',
            targetId: 'notice-activity-001',
            provider: 'content',
          },
        },
      ],
    },
  ],
} satisfies ContentSceneDto

const activityNoticeListPayload = {
  publishedAt: '2026-04-24T03:04:05.000Z',
  isUnread: true,
  englishTitle: 'Activity Notice',
  badges: [],
  blocks: [],
  visual: {
    preset: 'limit_price',
    asset: {
      assetId: 'asset-notice-list-001',
      originalUrl: 'https://example.com/notice-list.jpg',
      width: 640,
      height: 360,
      variants: {
        card: 'https://example.com/notice-list@2x.jpg',
      },
    } satisfies ContentAssetDto,
  },
  noticeCategory: '  自定义分类  ',
  category: 'fallback',
  type: 'ignored',
} satisfies ContentNoticePayloadDto & {
  noticeCategory: string
  category: string
  type: string
}

const activityNoticeListItem = {
  resourceType: 'notice',
  resourceId: 'notice-list-001',
  title: '通知卡片',
  status: 'ignored',
  updatedAt: '2026-04-24T03:05:06.000Z',
  target: {
    targetType: 'notice',
    targetId: 'notice-list-001',
    provider: 'content',
  },
  payload: activityNoticeListPayload,
} satisfies ContentListItemDtoBase<'notice'>

const profileScene = {
  sceneId: 'profile',
  version: 9,
  updatedAt: '2026-04-24T00:00:00.000Z',
  blocks: [
    {
      blockType: 'profile_summary',
      displayName: 'Aether',
      address: 'Shanghai',
      summary: '  个人简介  ',
      currency: 'CNY',
      totalValueInCent: 123456,
      holdingsCount: 12,
      networkLabel: 'Mainnet',
      statusLabel: 'Active',
      qrPayload: 'qr://profile',
      shareTarget: profileAssetTarget,
    },
    {
      blockType: 'profile_assets',
      categories: [
        {
          categoryId: 'collections',
          categoryName: '  藏品  ',
          subCategories: ['  Rare  ', '  '],
        },
        {
          categoryId: 'blindBoxes',
          categoryName: '',
          subCategories: [],
        },
      ],
      items: [
        {
          itemId: 'asset-001',
          title: '资产 A',
          acquiredAt: '2026-04-22T08:09:10.000Z',
          subCategory: 'Rare',
          categoryId: 'collections',
          holdingsCount: 3,
          currency: 'CNY',
          priceInCent: 8888,
          editionCode: 'ED-100',
          issueCount: 8,
          asset: {
            assetId: 'asset-profile-001',
            originalUrl: 'https://example.com/profile.jpg',
            width: 512,
            height: 512,
          } satisfies ContentAssetDto,
          placeholderIconKey: 'cpu',
          visualTone: 'mist',
          badgeType: 'featured',
          badgeLabel: '精选',
          assetId: 'linked-asset-001',
          linkedMarketItemId: 'market-linked-001',
          target: {
            targetType: 'profile_asset',
            targetId: 'asset-001',
            provider: 'content',
            params: {
              category: 'collections',
              subCategory: '  Rare  ',
            },
          },
        },
      ],
    },
  ],
} satisfies ContentSceneDto

describe('home rail content adapters', () => {
  it('maps home scene dto blocks into the home rail model', () => {
    const content = adaptHomeRailHomeSceneDto(homeScene)

    expect(content.noticeBar).toEqual({
      label: '公告栏',
      detailLabel: '查看公告详情',
      items: [
        {
          noticeId: 'notice-001',
          title: '公告 A',
          type: 'platform',
          time: '04-24 01:02',
          isUnread: true,
          target: {
            targetType: 'notice',
            targetId: 'notice-001',
            provider: 'content',
          },
        },
      ],
    })
    expect(content.banners).toEqual([
      {
        id: 'banner-001',
        title: 'Banner A',
        liveLabel: 'Live',
        tone: 'dawn',
        imageUrl: 'https://example.com/banner@2x.jpg',
        focalPoint: { x: 0.2, y: 0.8 },
        target: {
          targetType: 'home_banner',
          targetId: 'home-banner-001',
          provider: 'content',
        },
      },
    ])
    expect(content.featured).toEqual({
      id: 'drop-001',
      title: 'Drop A',
      sectionTitle: '首发藏品',
      sectionSubtitle: 'Featured Drop',
      priceLabel: '铸造价格',
      priceUnit: '￥',
      price: 199,
      minted: 10,
      supply: 100,
      imageUrl: 'https://example.com/drop@2x.jpg',
      placeholderIconKey: 'box',
      target: {
        targetType: 'drop',
        targetId: 'drop-001',
        provider: 'content',
      },
    })
    expect(content.market.sectionTitle).toBe('藏品市场')
    expect(content.market.sectionSubtitle).toBe('Market Flow')
    expect(content.market.tags).toEqual([{ id: 'cat-001', label: '艺术' }])
    expect(content.market.actions).toEqual([
      {
        id: 'search',
        label: '搜索',
        target: {
          targetType: 'market_action',
          targetId: 'search',
          provider: 'content',
        },
      },
    ])
    expect(content.market.sortConfig).toEqual({
      defaultField: 'price',
      defaultDirection: 'desc',
      options: [{ field: 'price', label: '市场价' }],
    })
  })

  it('keeps home defaults when dto blocks are missing', () => {
    const content = adaptHomeRailHomeSceneDto({
      sceneId: 'home',
      version: 1,
      updatedAt: '2026-04-24T00:00:00.000Z',
      blocks: [],
    })

    expect(content.noticeBar.label).toBe('公告栏')
    expect(content.featured.sectionTitle).toBe('首发藏品')
    expect(content.market.sortConfig.options).toEqual([
      { field: 'listedAt', label: '时间' },
      { field: 'price', label: '市场价' },
    ])
    expect(content.banners).toEqual([])
  })

  it('maps home market list items without changing DTO semantics', () => {
    expect(adaptHomeRailHomeTargetDto(profileAssetTarget)).toEqual({
      targetType: 'profile_asset',
      targetId: 'profile-asset-001',
      provider: 'content',
      params: {
        category: 'collections',
        subCategory: '  rare set  ',
      },
    })

    expect(adaptHomeRailHomeMarketListItemDto(homeMarketItem)).toEqual({
      id: 'market-item-001',
      name: '市场卡片',
      priceUnit: '￥',
      price: 388,
      listedAt: '2026-04-23T10:20:30.000Z',
      tradeVolume24h: 1234,
      holderCount: 56,
      editionCode: 'ED-001',
      issueCount: 99,
      categories: ['art', 'featured'],
      imageUrl: 'https://example.com/market@2x.jpg',
      placeholderIconKey: 'box',
      visualTone: 'aqua',
      badge: { tone: 'hot', label: 'Hot' },
      target: {
        targetType: 'market_item',
        targetId: 'market-item-001',
        provider: 'content',
      },
    })
  })

  it('maps activity scene and notice list dto blocks into the activity rail model', () => {
    const content = adaptHomeRailActivitySceneDto(activityScene)

    expect(content.entries).toEqual([
      {
        id: 'entry-001',
        title: '活动入口',
        eyebrow: 'Today',
        description: '活动描述',
        tone: 'soft',
        badgeText: 'New',
        target: {
          targetType: 'activity',
          targetId: 'activity-001',
          provider: 'content',
        },
      },
    ])
    expect(content.notices).toEqual({
      tags: ['全部', '公告'],
      list: [
        {
          id: 'notice-activity-001',
          title: '活动公告',
          category: 'platform',
          publishedAt: '2026-04-24T03:04:05.000Z',
          time: '04-24 03:04',
          isUnread: false,
          visual: {
            preset: 'platform',
            imageUrl: 'https://example.com/notice.jpg',
          },
          target: {
            targetType: 'notice',
            targetId: 'notice-activity-001',
            provider: 'content',
          },
        },
      ],
    })

    expect(adaptHomeRailActivityNoticeVisualDto(undefined)).toBeUndefined()
    expect(adaptHomeRailActivityNoticeListItemDto(activityNoticeListItem)).toEqual({
      id: 'notice-list-001',
      title: '通知卡片',
      category: '自定义分类',
      publishedAt: '2026-04-24T03:04:05.000Z',
      time: '04-24 03:04',
      isUnread: true,
      visual: {
        preset: 'limit_price',
        imageUrl: 'https://example.com/notice-list@2x.jpg',
      },
      target: {
        targetType: 'notice',
        targetId: 'notice-list-001',
        provider: 'content',
      },
    })
  })

  it('maps profile scene and asset dto blocks into the profile rail model', () => {
    expect(adaptHomeRailProfileTargetDto(profileAssetTarget)).toEqual({
      targetType: 'profile_asset',
      targetId: 'profile-asset-001',
      provider: 'content',
      params: {
        category: 'collections',
        subCategory: 'rare set',
      },
    })

    const content = adaptHomeRailProfileSceneDto(profileScene)

    expect(content.summary).toEqual({
      displayName: 'Aether',
      summary: '个人简介',
      currency: 'CNY',
      totalValue: '1,235',
      holdings: '12',
      address: 'Shanghai',
      networkLabel: 'Mainnet',
      statusLabel: 'Active',
      qrPayload: 'qr://profile',
      shareTarget: {
        targetType: 'profile_asset',
        targetId: 'profile-asset-001',
        provider: 'content',
        params: {
          category: 'collections',
          subCategory: 'rare set',
        },
      },
    })
    expect(content.categories).toEqual([
      {
        id: 'collections',
        label: '藏品',
        subCategories: ['Rare'],
      },
      {
        id: 'blindBoxes',
        label: 'blindBoxes',
        subCategories: [],
      },
    ])
    expect(content.assets).toEqual({
      collections: [
        {
          id: 'asset-001',
          name: '资产 A',
          date: '2026-04-22T08:09:10.000Z',
          subCategory: 'Rare',
          holdingsCount: 3,
          priceUnit: '￥',
          price: 89,
          editionCode: 'ED-100',
          issueCount: 8,
          imageUrl: 'https://example.com/profile.jpg',
          placeholderIconKey: 'cpu',
          visualTone: 'mist',
          badge: { tone: 'featured', label: '精选' },
          assetId: 'linked-asset-001',
          linkedMarketItemId: 'market-linked-001',
          target: {
            targetType: 'profile_asset',
            targetId: 'asset-001',
            provider: 'content',
            params: {
              category: 'collections',
              subCategory: 'Rare',
            },
          },
        },
      ],
      blindBoxes: [],
    })
  })

  it('drops profile asset list items with unsupported category ids', () => {
    const unsupportedItem = {
      ...homeMarketItem,
      resourceType: 'profile_asset',
      resourceId: 'profile-asset-list-001',
      target: profileAssetTarget,
      payload: {
        categoryId: 'unknown',
        subCategory: '  Rare  ',
        acquiredAt: '2026-04-24T00:00:00.000Z',
        holdingsCount: 1,
        currency: 'CNY',
        priceInCent: 1000,
        editionCode: 'ED-1',
        issueCount: 1,
        visualTone: 'mist',
        assetId: 'asset-1',
        linkedMarketItemId: 'market-1',
      },
    } as unknown as ContentListItemDtoBase<'profile_asset'>

    expect(adaptHomeRailProfileAssetListItemDto(unsupportedItem)).toBeNull()
  })
})
