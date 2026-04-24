/**
 * Responsibility: resolve mock scene responses and block payloads from in-repo scene
 * databases for the mock content provider.
 * Out of scope: resource detail resolution, transport/provider selection, and UI view-
 * model transformation.
 */
import type {
  ContentActivityEntriesBlockDto,
  ContentActivityNoticeFeedBlockDto,
  ContentMarketItemSummaryDto,
  ContentProfileAssetsBlockDto,
  ContentProfileSummaryBlockDto,
  ContentSceneBlockDto,
  ContentSceneDto,
  ContentSceneRequestDto,
  ContentServiceHubEntriesBlockDto,
  ContentSettingsSectionsBlockDto,
  ContentSettingsSummaryBlockDto,
} from '../../contracts/content-api.contract'
import { cloneContentAsset } from '../../mocks/content-db/assets'
import { contentCategoryDb } from '../../mocks/content-db/categories'
import { contentDropDb } from '../../mocks/content-db/drops'
import { contentMarketItemDb } from '../../mocks/content-db/market-items'
import { contentNoticeDb } from '../../mocks/content-db/notices'
import { activitySceneDb } from '../../mocks/content-db/scenes/activity'
import { homeMarketActionDb, homeSceneDb } from '../../mocks/content-db/scenes/home'
import {
  homeMarketDefaultSortDirection,
  homeMarketDefaultSortField,
  homeMarketSortOptionSeed,
} from '../../mocks/content-db/shared-home-collection-catalog'
import { profileSceneDb } from '../../mocks/content-db/scenes/profile'
import { settingsSceneDb } from '../../mocks/content-db/scenes/settings'
import {
  createServerTime,
  getNoticeUnreadState,
  getServiceHubReminderEntries,
  resolveNoticeVisual,
} from './shared'

const buildHomeSceneBlocks = (): ContentSceneBlockDto[] => {
  const noticeBarBlock: ContentSceneBlockDto = {
    blockType: 'notice_bar',
    label: homeSceneDb.noticeBar.label,
    detailLabel: homeSceneDb.noticeBar.detailLabel,
    items: homeSceneDb.noticeBar.noticeIds
      .map((noticeId) => contentNoticeDb.find((item) => item.noticeId === noticeId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        noticeId: item.noticeId,
        title: item.title,
        type: item.type,
        publishedAt: item.publishedAt,
        isUnread: getNoticeUnreadState(item.noticeId),
        visual: resolveNoticeVisual(item),
        target: {
          targetType: 'notice',
          targetId: item.noticeId,
        },
      })),
  }

  const bannerBlock: ContentSceneBlockDto = {
    blockType: 'banner_carousel',
    items: homeSceneDb.banners
      .map((item) => {
        const asset = cloneContentAsset(item.assetId)
        if (!asset) {
          return null
        }

        return {
          bannerId: item.bannerId,
          title: item.title,
          liveLabel: item.liveLabel,
          tone: item.tone,
          asset,
          target: { ...item.target },
        }
      })
      .filter((item): item is NonNullable<typeof item> => Boolean(item)),
  }

  const featuredRecord = contentDropDb.find((item) => item.dropId === homeSceneDb.featured.dropId)
  const featuredBlock: ContentSceneBlockDto = {
    blockType: 'featured_drop',
    item: featuredRecord
      ? {
          dropId: featuredRecord.dropId,
          title: featuredRecord.title,
          sectionTitle: featuredRecord.sectionTitle,
          sectionSubtitle: featuredRecord.sectionSubtitle,
          priceLabel: featuredRecord.priceLabel,
          currency: featuredRecord.currency,
          priceInCent: featuredRecord.priceInCent,
          mintedCount: featuredRecord.mintedCount,
          supplyCount: featuredRecord.supplyCount,
          asset: cloneContentAsset(featuredRecord.assetId),
          placeholderIconKey: featuredRecord.placeholderIconKey,
          target: {
            targetType: 'drop',
            targetId: featuredRecord.dropId,
          },
        }
      : {
          dropId: '',
          title: '',
          sectionTitle: '',
          sectionSubtitle: '',
          priceLabel: '',
          currency: 'CNY',
          priceInCent: 0,
          mintedCount: 0,
          supplyCount: 0,
          asset: null,
          target: {
            targetType: 'drop',
            targetId: '',
          },
        },
  }

  const marketBlock: ContentSceneBlockDto = {
    blockType: 'market_overview',
    sectionTitle: homeSceneDb.market.sectionTitle,
    sectionSubtitle: homeSceneDb.market.sectionSubtitle,
    categories: homeSceneDb.market.categoryIds
      .map((categoryId) => contentCategoryDb.find((item) => item.categoryId === categoryId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        categoryId: item.categoryId,
        categoryName: item.categoryName,
      })),
    actions: homeSceneDb.market.actionIds.map((actionId) => ({
      actionId,
      label: homeMarketActionDb[actionId].label,
      target: { ...homeMarketActionDb[actionId].target },
    })),
    sortConfig: {
      defaultField: homeMarketDefaultSortField,
      defaultDirection: homeMarketDefaultSortDirection,
      options: homeMarketSortOptionSeed.map((item) => ({
        field: item.field,
        label: item.label,
      })),
    },
    items: homeSceneDb.market.itemIds
      .map((itemId) => contentMarketItemDb.find((item) => item.itemId === itemId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map<ContentMarketItemSummaryDto>((item) => ({
        itemId: item.itemId,
        title: item.title,
        currency: item.currency,
        priceInCent: item.priceInCent,
        listedAt: item.listedAt,
        tradeVolume24h: item.tradeVolume24h,
        holderCount: item.holderCount,
        editionCode: item.editionCode,
        issueCount: item.issueCount,
        categoryIds: [...item.categoryIds],
        asset: cloneContentAsset(item.assetId),
        placeholderIconKey: item.placeholderIconKey,
        visualTone: item.visualTone,
        badgeType: item.badgeType,
        badgeLabel: item.badgeLabel,
        target: {
          targetType: 'market_item',
          targetId: item.itemId,
        },
      })),
  }

  return [noticeBarBlock, bannerBlock, featuredBlock, marketBlock]
}

const buildActivitySceneBlocks = (): ContentSceneBlockDto[] => {
  const entriesBlock: ContentActivityEntriesBlockDto = {
    blockType: 'activity_entries',
    items: activitySceneDb.entries.map((item) => ({
      entryId: item.entryId,
      title: item.title,
      eyebrow: item.eyebrow,
      description: item.description,
      tone: item.tone,
      badgeLabel: item.badgeLabel,
      target: { ...item.target },
    })),
  }

  const noticesBlock: ContentActivityNoticeFeedBlockDto = {
    blockType: 'activity_notice_feed',
    tags: [...activitySceneDb.notices.tags],
    items: activitySceneDb.notices.noticeIds
      .map((noticeId) => contentNoticeDb.find((item) => item.noticeId === noticeId))
      .filter((item): item is NonNullable<typeof item> => Boolean(item))
      .map((item) => ({
        noticeId: item.noticeId,
        title: item.title,
        type: item.type,
        publishedAt: item.publishedAt,
        isUnread: getNoticeUnreadState(item.noticeId),
        visual: resolveNoticeVisual(item),
        target: {
          targetType: 'notice',
          targetId: item.noticeId,
        },
      })),
  }

  return [entriesBlock, noticesBlock]
}

const buildProfileSceneBlocks = (): ContentSceneBlockDto[] => {
  const summaryBlock: ContentProfileSummaryBlockDto = {
    blockType: 'profile_summary',
    displayName: profileSceneDb.summary.displayName,
    address: profileSceneDb.summary.address,
    summary: profileSceneDb.summary.summary,
    currency: profileSceneDb.summary.currency,
    totalValueInCent: profileSceneDb.summary.totalValueInCent,
    holdingsCount: profileSceneDb.summary.holdingsCount,
    networkLabel: profileSceneDb.summary.networkLabel,
    statusLabel: profileSceneDb.summary.statusLabel,
    qrPayload: profileSceneDb.summary.qrPayload,
    shareTarget: profileSceneDb.summary.shareTarget
      ? { ...profileSceneDb.summary.shareTarget }
      : undefined,
  }

  const assetsBlock: ContentProfileAssetsBlockDto = {
    blockType: 'profile_assets',
    categories: profileSceneDb.assets.categories.map((item) => ({
      ...item,
      subCategories: [...(item.subCategories ?? [])],
    })),
    items: profileSceneDb.assets.items.map((item) => ({
      ...item,
      asset: item.assetId ? cloneContentAsset(item.assetId) : null,
      target: item.target ? { ...item.target } : undefined,
    })),
  }

  return [summaryBlock, assetsBlock]
}

const buildSettingsSceneBlocks = (): ContentSceneBlockDto[] => {
  const summaryBlock: ContentSettingsSummaryBlockDto = {
    blockType: 'settings_summary',
    title: settingsSceneDb.summary.title,
    englishTitle: settingsSceneDb.summary.englishTitle,
    description: settingsSceneDb.summary.description,
    actionLabel: settingsSceneDb.summary.actionLabel,
    actionEnglishLabel: settingsSceneDb.summary.actionEnglishLabel,
    actionTarget: { ...settingsSceneDb.summary.actionTarget },
  }

  const sectionsBlock: ContentSettingsSectionsBlockDto = {
    blockType: 'settings_sections',
    sections: settingsSceneDb.sections.map((section) => ({
      sectionId: section.sectionId,
      title: section.title,
      englishTitle: section.englishTitle,
      items: section.items.map((item) => ({
        itemId: item.itemId,
        title: item.title,
        value: item.value,
        target: { ...item.target },
      })),
    })),
  }

  return [summaryBlock, sectionsBlock]
}

const buildServiceHubSceneBlocks = (): ContentSceneBlockDto[] => {
  const reminderBlock: ContentServiceHubEntriesBlockDto = {
    blockType: 'service_hub_entries',
    items: getServiceHubReminderEntries(),
  }

  return [reminderBlock]
}

export const buildSceneData = (input: ContentSceneRequestDto): ContentSceneDto | null => {
  if (input.sceneId === 'home') {
    return {
      sceneId: 'home',
      version: homeSceneDb.version,
      updatedAt: homeSceneDb.updatedAt,
      blocks: buildHomeSceneBlocks(),
    }
  }

  if (input.sceneId === 'activity') {
    return {
      sceneId: 'activity',
      version: activitySceneDb.version,
      updatedAt: activitySceneDb.updatedAt,
      blocks: buildActivitySceneBlocks(),
    }
  }

  if (input.sceneId === 'profile') {
    return {
      sceneId: 'profile',
      version: profileSceneDb.version,
      updatedAt: profileSceneDb.updatedAt,
      blocks: buildProfileSceneBlocks(),
    }
  }

  if (input.sceneId === 'settings') {
    return {
      sceneId: 'settings',
      version: settingsSceneDb.version,
      updatedAt: settingsSceneDb.updatedAt,
      blocks: buildSettingsSceneBlocks(),
    }
  }

  if (input.sceneId === 'service_hub') {
    return {
      sceneId: 'service_hub',
      version: 1,
      updatedAt: createServerTime(),
      blocks: buildServiceHubSceneBlocks(),
    }
  }

  return {
    sceneId: input.sceneId,
    version: 1,
    updatedAt: createServerTime(),
    blocks: [],
  }
}

export const createContentSceneSnapshot = (
  sceneId: ContentSceneRequestDto['sceneId']
): ContentSceneDto | null => {
  return buildSceneData({ sceneId })
}
