/**
 * Responsibility: define the mock home-scene source data, including banner, featured, notice,
 * and market-entry records consumed by the content mock provider.
 * Out of scope: scene response wrapping, category catalogs, and home page runtime presentation.
 */

import type {
  ContentHomeBannerTone,
  ContentMarketActionId,
  ContentTargetDto,
} from '../../../contracts/content-api.contract'
import { homeMarketCategoryIds, homeMarketItemIds } from '../shared-home-collection-catalog'

export interface HomeSceneBannerRecord {
  bannerId: string
  title: string
  liveLabel: string
  tone: ContentHomeBannerTone
  assetId: string
  target: ContentTargetDto
}

export interface HomeSceneDb {
  sceneId: 'home'
  version: number
  updatedAt: string
  noticeBar: {
    label: string
    detailLabel: string
    noticeIds: string[]
  }
  banners: HomeSceneBannerRecord[]
  featured: {
    dropId: string
  }
  market: {
    sectionTitle: string
    sectionSubtitle: string
    categoryIds: string[]
    actionIds: ContentMarketActionId[]
    itemIds: string[]
  }
}

export const homeMarketActionDb: Record<
  ContentMarketActionId,
  { label: string; target: ContentTargetDto }
> = {
  search: {
    label: '打开市场搜索',
    target: {
      targetType: 'market_action',
      targetId: 'search',
      provider: 'content',
    },
  },
  history: {
    label: '打开市场历史订单',
    target: {
      targetType: 'market_action',
      targetId: 'history',
      provider: 'content',
    },
  },
}

export const homeSceneDb: HomeSceneDb = {
  sceneId: 'home',
  version: 1,
  updatedAt: '2026-03-25T12:24:00+08:00',
  noticeBar: {
    label: '公告：',
    detailLabel: '查看公告详情',
    noticeIds: ['HOME-N-003', 'HOME-N-001', 'HOME-N-002'],
  },
  banners: [
    {
      bannerId: 'AX-99',
      title: '合成黎明',
      liveLabel: 'LIVE',
      tone: 'dawn',
      assetId: 'ASSET-BANNER-AX99',
      target: {
        targetType: 'home_banner',
        targetId: 'AX-99',
        provider: 'content',
      },
    },
    {
      bannerId: 'BX-17',
      title: '折光边界',
      liveLabel: 'LIVE',
      tone: 'azure',
      assetId: 'ASSET-BANNER-BX17',
      target: {
        targetType: 'home_banner',
        targetId: 'BX-17',
        provider: 'content',
      },
    },
    {
      bannerId: 'CX-42',
      title: '余烬轨道',
      liveLabel: 'LIVE',
      tone: 'ember',
      assetId: 'ASSET-BANNER-CX42',
      target: {
        targetType: 'home_banner',
        targetId: 'CX-42',
        provider: 'content',
      },
    },
  ],
  featured: {
    dropId: 'AX-99',
  },
  market: {
    sectionTitle: '藏品市场',
    sectionSubtitle: 'Market Flow',
    categoryIds: [...homeMarketCategoryIds],
    actionIds: ['search', 'history'],
    itemIds: [...homeMarketItemIds],
  },
}
