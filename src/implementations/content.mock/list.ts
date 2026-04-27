/**
 * Responsibility: build mock list responses for content-domain requests, including home,
 * activity, market, and profile list DTO projection.
 * Out of scope: scene/detail response building, HTTP transport, and persistent cache
 * orchestration.
 */
import type {
  ContentListDto,
  ContentListItemDtoBase,
  ContentListRequestDto,
} from '../../contracts/content-api.contract'
import { cloneContentAsset } from '../../mocks/content-db/assets'
import { contentMarketItemDb } from '../../mocks/content-db/market-items'
import { contentNoticeDb } from '../../mocks/content-db/notices'
import { profileSceneDb } from '../../mocks/content-db/scenes/profile'
import { compareNoticeByPublishedAtDesc, getNoticeUnreadState, resolveNoticeVisual } from './shared'

export const buildListData = (input: ContentListRequestDto): ContentListDto | null => {
  if (input.resourceType === 'market_item') {
    const marketKind = input.marketKind ?? 'collections'
    const filtered = contentMarketItemDb.filter((item) => {
      const matchMarketKind = item.marketKind === marketKind
      const matchCategory =
        !input.categoryId ||
        input.categoryId === 'all' ||
        item.categoryIds.includes(input.categoryId)
      const matchKeyword = !input.keyword || item.title.includes(input.keyword)
      return matchMarketKind && matchCategory && matchKeyword
    })

    const pageStart = (input.page - 1) * input.pageSize
    const pageItems = filtered.slice(pageStart, pageStart + input.pageSize)
    const items: ContentListItemDtoBase<'market_item'>[] = pageItems.map((item) => ({
      resourceType: 'market_item',
      resourceId: item.itemId,
      title: item.title,
      status: item.status,
      updatedAt: item.updatedAt,
      summary: item.summary,
      asset: cloneContentAsset(item.assetId),
      target: {
        targetType: 'market_item',
        targetId: item.itemId,
        provider: 'content',
      },
      payload: {
        currency: item.currency,
        priceInCent: item.priceInCent,
        listedAt: item.listedAt,
        tradeVolume24h: item.tradeVolume24h,
        holderCount: item.holderCount,
        editionCode: item.editionCode,
        issueCount: item.issueCount,
        categoryIds: [...item.categoryIds],
        placeholderIconKey: item.placeholderIconKey,
        visualTone: item.visualTone,
        badgeType: item.badgeType,
        badgeLabel: item.badgeLabel,
      },
    }))

    return {
      resourceType: 'market_item',
      page: input.page,
      pageSize: input.pageSize,
      total: filtered.length,
      items,
    }
  }

  if (input.resourceType === 'notice') {
    const normalizedKeyword = input.keyword?.trim().toLowerCase() ?? ''
    const filtered = contentNoticeDb
      .filter((item) => {
        const publishedDate = item.publishedAt.slice(0, 10)
        const matchTag = !input.tag || input.tag === '全部' || item.type === input.tag
        const matchKeyword =
          !normalizedKeyword ||
          item.title.toLowerCase().includes(normalizedKeyword) ||
          item.type.toLowerCase().includes(normalizedKeyword)
        const matchDateRange =
          !input.dateRange ||
          (publishedDate >= input.dateRange.startDate && publishedDate <= input.dateRange.endDate)

        return matchTag && matchKeyword && matchDateRange
      })
      .sort(compareNoticeByPublishedAtDesc)

    const pageStart = (input.page - 1) * input.pageSize
    const pageItems = filtered.slice(pageStart, pageStart + input.pageSize)
    const items: ContentListItemDtoBase<'notice'>[] = pageItems.map((item) => ({
      resourceType: 'notice',
      resourceId: item.noticeId,
      title: item.title,
      status: item.type,
      updatedAt: item.updatedAt,
      summary: item.summary,
      asset: null,
      target: {
        targetType: 'notice',
        targetId: item.noticeId,
        provider: 'content',
      },
      payload: {
        publishedAt: item.publishedAt,
        isUnread: getNoticeUnreadState(item.noticeId),
        englishTitle: item.englishTitle,
        badges: [...item.badges],
        blocks: [],
        visual: resolveNoticeVisual(item),
      },
    }))

    return {
      resourceType: 'notice',
      page: input.page,
      pageSize: input.pageSize,
      total: filtered.length,
      items,
    }
  }

  if (input.resourceType === 'profile_asset') {
    const normalizedKeyword = input.keyword?.trim() ?? ''
    const filtered = profileSceneDb.assets.items.filter((item) => {
      const matchCategory =
        !input.categoryId || input.categoryId === 'all' || item.categoryId === input.categoryId
      const matchSubCategory =
        !input.subCategory || input.subCategory === '全部' || item.subCategory === input.subCategory
      const matchKeyword =
        !normalizedKeyword ||
        item.title.includes(normalizedKeyword) ||
        item.itemId.toLowerCase().includes(normalizedKeyword.toLowerCase())

      return matchCategory && matchSubCategory && matchKeyword
    })

    const pageStart = (input.page - 1) * input.pageSize
    const pageItems = filtered.slice(pageStart, pageStart + input.pageSize)
    const items: ContentListItemDtoBase<'profile_asset'>[] = pageItems.map((item) => ({
      resourceType: 'profile_asset',
      resourceId: item.itemId,
      title: item.title,
      status: 'OWNED',
      updatedAt: item.acquiredAt,
      summary: item.subCategory,
      asset: item.assetId ? cloneContentAsset(item.assetId) : null,
      target: item.target
        ? { ...item.target }
        : {
            targetType: 'profile_asset',
            targetId: item.itemId,
            provider: 'content',
            params: {
              category: item.categoryId,
              subCategory: item.subCategory,
            },
          },
      payload: {
        categoryId: item.categoryId,
        subCategory: item.subCategory,
        acquiredAt: item.acquiredAt,
        holdingsCount: item.holdingsCount,
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
      },
    }))

    return {
      resourceType: 'profile_asset',
      page: input.page,
      pageSize: input.pageSize,
      total: filtered.length,
      items,
    }
  }

  return null
}
