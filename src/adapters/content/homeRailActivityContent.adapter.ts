/**
 * Responsibility: normalize activity rail DTO blocks and notice list items into view models.
 * Out of scope: list query orchestration, scope window switching, and read-state side effects.
 */
import type {
  ContentActivityEntriesBlockDto,
  ContentActivityNoticeFeedBlockDto,
  ContentListItemDtoBase,
  ContentNoticePayloadDto,
  ContentNoticeSummaryDto,
  ContentNoticeVisualDto,
  ContentSceneDto,
} from '../../contracts/content-api.contract'
import type {
  ActivityEntry,
  ActivityNotice,
  ActivityNoticeVisual,
  HomeRailActivityContent,
} from '../../models/home-rail/homeRailActivity.model'
import { adaptContentTarget, cloneContentTargetRef } from './contentTarget.adapter'

const activityShell: HomeRailActivityContent = {
  entries: [],
  notices: {
    tags: ['全部'],
    list: [],
  },
}

const formatActivityNoticeTime = (publishedAt: string): string => {
  const normalizedPublishedAt = publishedAt.trim()
  const matched = normalizedPublishedAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)

  if (matched) {
    return `${matched[2]}-${matched[3]} ${matched[4]}:${matched[5]}`
  }

  return normalizedPublishedAt
}

export const adaptHomeRailActivityNoticeVisualDto = (
  visual?: ContentNoticeVisualDto
): ActivityNoticeVisual | undefined => {
  if (!visual) {
    return undefined
  }

  const imageUrl = visual.asset?.variants?.card ?? visual.asset?.originalUrl
  if (typeof imageUrl === 'string' && imageUrl.length > 0) {
    return {
      preset: visual.preset,
      imageUrl,
    }
  }

  return {
    preset: visual.preset,
  }
}

const adaptHomeRailActivityNoticeCategory = (
  fallbackCategory: string,
  payload?: ContentNoticePayloadDto
): string => {
  if (!payload) {
    return fallbackCategory
  }

  const payloadWithCategory = payload as ContentNoticePayloadDto & {
    noticeCategory?: string
    noticeType?: string
    category?: string
    type?: string
  }
  const payloadCategoryCandidates = [
    payloadWithCategory.noticeCategory,
    payloadWithCategory.noticeType,
    payloadWithCategory.category,
    payloadWithCategory.type,
  ]
  const payloadCategory = payloadCategoryCandidates.find(
    (item): item is string => typeof item === 'string' && item.trim().length > 0
  )

  return payloadCategory?.trim() ?? fallbackCategory
}

export const adaptHomeRailActivityEntriesBlockDto = (
  block?: ContentActivityEntriesBlockDto
): ActivityEntry[] => {
  if (!block) {
    return []
  }

  return block.items.map((item) => ({
    id: item.entryId,
    title: item.title,
    eyebrow: item.eyebrow,
    description: item.description,
    tone: item.tone,
    badgeText: item.badgeLabel,
    target: adaptContentTarget(item.target),
  }))
}

export const adaptHomeRailActivityNoticeSummaryDto = (
  item: ContentNoticeSummaryDto
): ActivityNotice => ({
  id: item.noticeId,
  title: item.title,
  category: adaptHomeRailActivityNoticeCategory(item.type),
  publishedAt: item.publishedAt,
  time: formatActivityNoticeTime(item.publishedAt),
  isUnread: item.isUnread,
  visual: adaptHomeRailActivityNoticeVisualDto(item.visual),
  target: adaptContentTarget(item.target),
})

export const adaptHomeRailActivityNoticeListItemDto = (
  item: ContentListItemDtoBase<'notice'>
): ActivityNotice => {
  const payload = item.payload
  const publishedAt =
    typeof payload.publishedAt === 'string' && payload.publishedAt.trim().length > 0
      ? payload.publishedAt
      : item.updatedAt

  return {
    id: item.resourceId,
    title: item.title,
    category: adaptHomeRailActivityNoticeCategory(item.status, payload),
    publishedAt,
    time: formatActivityNoticeTime(publishedAt),
    isUnread: payload.isUnread,
    visual: adaptHomeRailActivityNoticeVisualDto(payload.visual),
    target: adaptContentTarget(item.target),
  }
}

export const adaptHomeRailActivityNoticesBlockDto = (
  block?: ContentActivityNoticeFeedBlockDto
): HomeRailActivityContent['notices'] => {
  if (!block) {
    return {
      tags: [...activityShell.notices.tags],
      list: [...activityShell.notices.list],
    }
  }

  return {
    tags: [...block.tags],
    list: block.items.map((item) => adaptHomeRailActivityNoticeSummaryDto(item)),
  }
}

export const adaptHomeRailActivitySceneDto = (scene: ContentSceneDto): HomeRailActivityContent => {
  const entriesBlock = scene.blocks.find((item) => item.blockType === 'activity_entries') as
    | ContentActivityEntriesBlockDto
    | undefined
  const noticesBlock = scene.blocks.find((item) => item.blockType === 'activity_notice_feed') as
    | ContentActivityNoticeFeedBlockDto
    | undefined

  return {
    entries: adaptHomeRailActivityEntriesBlockDto(entriesBlock),
    notices: adaptHomeRailActivityNoticesBlockDto(noticesBlock),
  }
}

export const createHomeRailActivityContentShell = (): HomeRailActivityContent => ({
  entries: activityShell.entries.map((entry) => ({
    ...entry,
    target: cloneContentTargetRef(entry.target)!,
  })),
  notices: {
    tags: [...activityShell.notices.tags],
    list: activityShell.notices.list.map((notice) => ({
      ...notice,
      target: cloneContentTargetRef(notice.target)!,
      visual: notice.visual ? { ...notice.visual } : undefined,
    })),
  },
})
