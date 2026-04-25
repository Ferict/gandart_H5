/**
 * Responsibility: provide shared mock-provider envelope builders, request metadata helpers,
 * and common DTO assembly utilities reused by content.mock scene, list, and resource adapters.
 * Out of scope: scene-specific branching, list pagination policy, and provider selection.
 */
import type {
  ContentEnvelope,
  ContentListDto,
  ContentNoticeBlockDto,
  ContentServiceEntryId,
  ContentServiceHubEntryReminderDto,
  ContentNoticeVisualDto,
  ContentNoticeVisualPreset,
  ContentResourceDto,
} from '../../contracts/content-api.contract'
import { cloneContentAsset } from '../../mocks/content-db/assets'
import {
  contentNoticeDb,
  contentNoticeUnreadSeed,
  type ContentNoticeRecord,
} from '../../mocks/content-db/notices'
import { contentServiceHubReminderSeed } from '../../mocks/content-db/service-hub'
import { buildRailContentSignature } from '../../services/home-rail/homeRailPageReloadPolicy.service'

const createRequestId = (prefix: string) => `${prefix}_${Date.now()}`
export const createServerTime = () => new Date().toISOString()

export const createEnvelope = <T>(data: T, requestIdPrefix: string): ContentEnvelope<T> => ({
  code: 0,
  message: 'ok',
  requestId: createRequestId(requestIdPrefix),
  serverTime: createServerTime(),
  data,
})

export const createErrorEnvelope = <T>(
  message: string,
  requestIdPrefix: string,
  data: T
): ContentEnvelope<T> => ({
  code: 1,
  message,
  requestId: createRequestId(requestIdPrefix),
  serverTime: createServerTime(),
  data,
})

export const createMockListEtag = (list: ContentListDto) => {
  return `W/"${buildRailContentSignature(list)}"`
}

const noticeUnreadDefaultState: Record<string, boolean> = Object.fromEntries(
  contentNoticeDb.map((item) => [item.noticeId, true])
)

let noticeUnreadState: Record<string, boolean> = {
  ...noticeUnreadDefaultState,
  ...contentNoticeUnreadSeed,
}

type NoticeVisualOverrideRecord = {
  preset: ContentNoticeVisualPreset
  assetId?: string
}

const noticeVisualOverrideSeed: Record<string, NoticeVisualOverrideRecord> = {
  'N-08': { preset: 'release', assetId: 'ASSET-HOME-MARKET-C04' },
  'N-09': { preset: 'synthesis', assetId: 'ASSET-HOME-MARKET-C18' },
  'N-10': { preset: 'limit_price', assetId: 'ASSET-HOME-MARKET-C12' },
  'N-11': { preset: 'airdrop', assetId: 'ASSET-HOME-MARKET-C25' },
  'N-12': { preset: 'consignment', assetId: 'ASSET-HOME-MARKET-C06' },
  'N-13': { preset: 'swap', assetId: 'ASSET-HOME-MARKET-C14' },
}

const noticeVisualOverrideState: Record<string, NoticeVisualOverrideRecord> = {
  ...noticeVisualOverrideSeed,
}

let serviceHubReminderState: Record<ContentServiceEntryId, ContentServiceHubEntryReminderDto> = {
  ...contentServiceHubReminderSeed,
}

export const getNoticeUnreadState = (noticeId: string): boolean => {
  return noticeUnreadState[noticeId] ?? false
}

export const consumeNoticeUnreadState = (noticeId: string) => {
  noticeUnreadState = {
    ...noticeUnreadState,
    [noticeId]: false,
  }

  return {
    noticeId,
    isUnread: noticeUnreadState[noticeId] ?? false,
  }
}

export const getServiceHubReminderEntries = () => {
  return Object.values(serviceHubReminderState).map((item) => ({
    ...item,
  }))
}

export const consumeServiceHubReminderState = (serviceId: ContentServiceEntryId) => {
  const currentState = serviceHubReminderState[serviceId]
  if (!currentState) {
    return {
      serviceId,
      hasReminder: false,
      unreadCount: 0,
    }
  }

  serviceHubReminderState = {
    ...serviceHubReminderState,
    [serviceId]: {
      ...currentState,
      hasReminder: false,
      unreadCount: 0,
    },
  }

  return {
    serviceId,
    hasReminder: serviceHubReminderState[serviceId].hasReminder,
    unreadCount: serviceHubReminderState[serviceId].unreadCount,
    latestMessageId: serviceHubReminderState[serviceId].latestMessageId,
    latestMessageAt: serviceHubReminderState[serviceId].latestMessageAt,
  }
}

export const compareNoticeByPublishedAtDesc = (
  left: ContentNoticeRecord,
  right: ContentNoticeRecord
): number => {
  const leftTimestamp = Date.parse(left.publishedAt)
  const rightTimestamp = Date.parse(right.publishedAt)

  if (
    Number.isFinite(leftTimestamp) &&
    Number.isFinite(rightTimestamp) &&
    leftTimestamp !== rightTimestamp
  ) {
    return rightTimestamp - leftTimestamp
  }

  if (left.updatedAt !== right.updatedAt) {
    return right.updatedAt.localeCompare(left.updatedAt)
  }

  return right.noticeId.localeCompare(left.noticeId)
}

export const cloneNoticeBlocks = (blocks: ContentNoticeBlockDto[]): ContentNoticeBlockDto[] => {
  return blocks.map((block) => {
    if (block.kind === 'paragraph') {
      return { ...block }
    }

    if (block.kind === 'list') {
      return {
        ...block,
        items: [...block.items],
      }
    }

    if (block.kind === 'market_item_card') {
      return {
        ...block,
        target: { ...block.target },
      }
    }

    return {
      ...block,
      target: { ...block.target },
    }
  })
}

export const cloneRelations = (
  relations: ContentResourceDto['relations']
): ContentResourceDto['relations'] => {
  return relations.map((item) => ({
    relationType: item.relationType,
    target: { ...item.target },
  }))
}

const resolveNoticeVisualPresetByType = (type: string): ContentNoticeVisualPreset => {
  const normalizedType = type.trim().toLowerCase()

  if (normalizedType.includes('寄售') || normalizedType.includes('consign')) {
    return 'consignment'
  }

  if (normalizedType.includes('限价') || normalizedType.includes('limit')) {
    return 'limit_price'
  }

  if (
    normalizedType.includes('发售') ||
    normalizedType.includes('预告') ||
    normalizedType.includes('release')
  ) {
    return 'release'
  }

  if (normalizedType.includes('空投') || normalizedType.includes('airdrop')) {
    return 'airdrop'
  }

  if (
    normalizedType.includes('合成') ||
    normalizedType.includes('synthesis') ||
    normalizedType.includes('merge')
  ) {
    return 'synthesis'
  }

  if (
    normalizedType.includes('置换') ||
    normalizedType.includes('swap') ||
    normalizedType.includes('exchange')
  ) {
    return 'swap'
  }

  return 'platform'
}

export const resolveNoticeVisual = (item: ContentNoticeRecord): ContentNoticeVisualDto => {
  const override = noticeVisualOverrideState[item.noticeId]
  const preset = override?.preset ?? resolveNoticeVisualPresetByType(item.type)
  const asset = cloneContentAsset(override?.assetId)

  if (asset) {
    return {
      preset,
      asset,
    }
  }

  return {
    preset,
  }
}
