/**
 * Responsibility: normalize content-scene and notice-list resources into activity rail
 * view models, signatures, and query-facing list results.
 * Out of scope: result-window switching, persistent cache orchestration, and page-local
 * presentation or animation runtime.
 */
import type {
  ContentActivityEntriesBlockDto,
  ContentActivityNoticeFeedBlockDto,
  ContentListDto,
  ContentListDtoBase,
  ContentListItemDtoBase,
  ContentNoticePayloadDto,
  ContentNoticeSummaryDto,
  ContentSceneDto,
  ContentTargetDto,
} from '../../contracts/content-api.contract'
import type {
  ActivityDateFilterRange,
  ActivityEntry,
  ActivityNotice,
  ActivityNoticeListResult,
  ActivityNoticeVisual,
  HomeRailActivityContent,
} from '../../models/home-rail/homeRailActivity.model'
import {
  resolveContentListWithMeta,
  resolveContentScene,
  runContentAction,
} from '../content/content.service'
import {
  buildRailContentSignature,
  createRailSceneResolvedMeta,
  type RailSceneResolvedContent,
} from './homeRailPageReloadPolicy.service'

const isHomeRailActivityContentDev = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

const activityShell: HomeRailActivityContent = {
  entries: [],
  notices: {
    tags: ['全部'],
    list: [],
  },
}

interface ResolveHomeRailActivityContentOptions {
  force?: boolean
}

export type HomeRailActivitySceneModuleKey =
  | 'leadEntry'
  | 'drawEntry'
  | 'inlineEntry'
  | 'noticeTags'
  | 'entryShell'

export const buildHomeRailActivityBlockSignatures = (
  content: HomeRailActivityContent
): Record<HomeRailActivitySceneModuleKey, string> => ({
  leadEntry: buildRailContentSignature(
    content.entries.find((entry) => entry.id === 'asset-merge') ?? null
  ),
  drawEntry: buildRailContentSignature(
    content.entries.find((entry) => entry.id === 'priority-draw') ?? null
  ),
  inlineEntry: buildRailContentSignature(
    content.entries.find((entry) => entry.id === 'network-invite') ?? null
  ),
  noticeTags: buildRailContentSignature(content.notices.tags),
  entryShell: buildRailContentSignature(content.entries.map((entry) => entry.id)),
})

let homeRailActivityResolvedContentInFlight: Promise<
  RailSceneResolvedContent<HomeRailActivityContent>
> | null = null

const DEFAULT_ACTIVITY_NOTICE_PAGE_SIZE = 60
const ACTIVITY_NOTICE_PROVIDER_PAGE_SIZE = 120

const formatActivityNoticeTime = (publishedAt: string): string => {
  const normalizedPublishedAt = publishedAt.trim()
  const matched = normalizedPublishedAt.match(/^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})/)

  if (matched) {
    return `${matched[2]}-${matched[3]} ${matched[4]}:${matched[5]}`
  }

  return normalizedPublishedAt
}

const cloneActivityShell = (): HomeRailActivityContent => ({
  entries: activityShell.entries.map((entry) => ({
    ...entry,
    target: cloneContentTarget(entry.target),
  })),
  notices: {
    tags: [...activityShell.notices.tags],
    list: activityShell.notices.list.map((notice) => ({
      ...notice,
      target: cloneContentTarget(notice.target),
      visual: notice.visual ? { ...notice.visual } : undefined,
    })),
  },
})

const cloneContentTarget = (target: ContentTargetDto): ContentTargetDto => {
  if (target.targetType === 'profile_asset') {
    return {
      targetType: target.targetType,
      targetId: target.targetId,
      provider: target.provider,
      params: {
        ...target.params,
      },
    }
  }

  return {
    targetType: target.targetType,
    targetId: target.targetId,
    provider: target.provider,
  }
}

const mapActivityEntries = (block?: ContentActivityEntriesBlockDto): ActivityEntry[] => {
  if (!block) {
    return []
  }

  return block.items.map<ActivityEntry>((item) => ({
    id: item.entryId,
    title: item.title,
    eyebrow: item.eyebrow,
    description: item.description,
    tone: item.tone,
    badgeText: item.badgeLabel,
    target: cloneContentTarget(item.target),
  }))
}

const mapNoticeVisual = (item: ContentNoticeSummaryDto): ActivityNoticeVisual | undefined => {
  const visual = item.visual
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

const mapNoticePayloadVisual = (
  payload: ContentNoticePayloadDto
): ActivityNoticeVisual | undefined => {
  if (!payload.visual) {
    return undefined
  }

  const imageUrl = payload.visual.asset?.variants?.card ?? payload.visual.asset?.originalUrl
  if (typeof imageUrl === 'string' && imageUrl.length > 0) {
    return {
      preset: payload.visual.preset,
      imageUrl,
    }
  }

  return {
    preset: payload.visual.preset,
  }
}

type NoticePayloadWithCategory = ContentNoticePayloadDto & {
  noticeCategory?: string
  noticeType?: string
  category?: string
  type?: string
}

const resolveNoticeCategory = (
  fallbackCategory: string,
  payload?: ContentNoticePayloadDto
): string => {
  if (!payload) {
    return fallbackCategory
  }

  const payloadWithCategory = payload as NoticePayloadWithCategory
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

const mapActivityNoticeSummary = (item: ContentNoticeSummaryDto): ActivityNotice => ({
  id: item.noticeId,
  title: item.title,
  category: resolveNoticeCategory(item.type),
  publishedAt: item.publishedAt,
  time: formatActivityNoticeTime(item.publishedAt),
  isUnread: item.isUnread,
  visual: mapNoticeVisual(item),
  target: cloneContentTarget(item.target),
})

const mapActivityNoticeListItem = (item: ContentListItemDtoBase<'notice'>): ActivityNotice => {
  const payload = item.payload
  const publishedAt =
    typeof payload.publishedAt === 'string' && payload.publishedAt.trim().length > 0
      ? payload.publishedAt
      : item.updatedAt

  return {
    id: item.resourceId,
    title: item.title,
    category: resolveNoticeCategory(item.status, payload),
    publishedAt,
    time: formatActivityNoticeTime(publishedAt),
    isUnread: payload.isUnread,
    visual: mapNoticePayloadVisual(payload),
    target: cloneContentTarget(item.target),
  }
}

const assertNoticeListDto = (list: ContentListDto): ContentListDtoBase<'notice'> => {
  if (list.resourceType !== 'notice') {
    throw new Error(`[homeRail] unexpected activity notice list resourceType: ${list.resourceType}`)
  }

  return list
}

const mapActivityNotices = (
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
    list: block.items.map<ActivityNotice>((item) => mapActivityNoticeSummary(item)),
  }
}

const adaptActivitySceneToContent = (scene: ContentSceneDto): HomeRailActivityContent => {
  const entriesBlock = scene.blocks.find((item) => item.blockType === 'activity_entries') as
    | ContentActivityEntriesBlockDto
    | undefined
  const noticesBlock = scene.blocks.find((item) => item.blockType === 'activity_notice_feed') as
    | ContentActivityNoticeFeedBlockDto
    | undefined

  return {
    entries: mapActivityEntries(entriesBlock),
    notices: mapActivityNotices(noticesBlock),
  }
}

const buildHomeRailActivityStableSignature = (content: HomeRailActivityContent): string => {
  return buildRailContentSignature({
    ...content,
    notices: {
      ...content.notices,
      list: content.notices.list.map((item) => ({
        id: item.id,
        title: item.title,
        category: item.category,
        publishedAt: item.publishedAt,
        time: item.time,
        visual: item.visual,
      })),
    },
  })
}

const resolveActivityNoticeScope = async (): Promise<{
  noticeIds: string[]
  noticeIdSet: Set<string>
  noticeOrderMap: Map<string, number>
}> => {
  const resolved = await resolveHomeRailActivityContent()
  const noticeIds = resolved.content.notices.list.map((item) => item.id)

  return {
    noticeIds,
    noticeIdSet: new Set(noticeIds),
    noticeOrderMap: new Map(noticeIds.map((noticeId, index) => [noticeId, index])),
  }
}

const applyActivityNoticeScopeToList = (
  list: ContentListDtoBase<'notice'>,
  scope: {
    noticeIdSet: Set<string>
    noticeOrderMap: Map<string, number>
  },
  input: {
    page: number
    pageSize: number
  }
) => {
  const scopedItems = list.items
    .filter((item) => scope.noticeIdSet.has(item.resourceId))
    .sort((left, right) => {
      const leftOrder = scope.noticeOrderMap.get(left.resourceId) ?? Number.MAX_SAFE_INTEGER
      const rightOrder = scope.noticeOrderMap.get(right.resourceId) ?? Number.MAX_SAFE_INTEGER

      return leftOrder - rightOrder
    })

  const pageStart = (input.page - 1) * input.pageSize

  return {
    page: input.page,
    pageSize: input.pageSize,
    total: scopedItems.length,
    items: scopedItems.slice(pageStart, pageStart + input.pageSize),
  }
}

export const createHomeRailActivityContentShell = (): HomeRailActivityContent => {
  return cloneActivityShell()
}

export const resolveHomeRailActivityContent = async (
  options: ResolveHomeRailActivityContentOptions = {}
): Promise<RailSceneResolvedContent<HomeRailActivityContent>> => {
  if (homeRailActivityResolvedContentInFlight && !options.force) {
    return homeRailActivityResolvedContentInFlight
  }

  const nextRequest = resolveContentScene({ sceneId: 'activity' })
    .then((scene) => {
      const content = adaptActivitySceneToContent(scene)
      return {
        content,
        meta: createRailSceneResolvedMeta({
          version: scene.version,
          updatedAt: scene.updatedAt,
          signature: buildHomeRailActivityStableSignature(content),
        }),
      }
    })
    .finally(() => {
      if (homeRailActivityResolvedContentInFlight === nextRequest) {
        homeRailActivityResolvedContentInFlight = null
      }
    })

  homeRailActivityResolvedContentInFlight = nextRequest
  return nextRequest
}

export const resolveHomeRailActivityNoticeList = async (input: {
  tag?: string
  keyword?: string
  dateRange?: ActivityDateFilterRange
  page?: number
  pageSize?: number
  ifNoneMatch?: string
}): Promise<ActivityNoticeListResult & { etag?: string; notModified?: boolean }> => {
  const page = input.page ?? 1
  const pageSize = input.pageSize ?? DEFAULT_ACTIVITY_NOTICE_PAGE_SIZE
  const noticeScope = await resolveActivityNoticeScope()
  const providerPageSize = Math.max(
    pageSize,
    noticeScope.noticeIds.length,
    ACTIVITY_NOTICE_PROVIDER_PAGE_SIZE
  )
  const resolved = await resolveContentListWithMeta(
    {
      resourceType: 'notice',
      tag: input.tag,
      keyword: input.keyword,
      dateRange: input.dateRange ?? undefined,
      page: 1,
      pageSize: providerPageSize,
    },
    { ifNoneMatch: input.ifNoneMatch }
  )

  if (resolved.notModified) {
    if (isHomeRailActivityContentDev) {
      console.debug('[homeRail][activity] notice list 304', {
        query: input,
        etag: resolved.etag ?? null,
      })
    }
    return {
      resourceType: 'notice',
      page,
      pageSize,
      total: 0,
      list: [],
      etag: resolved.etag,
      notModified: true,
    }
  }

  if (!resolved.list) {
    throw new Error('resolveHomeRailActivityNoticeList missing list payload')
  }

  const list = assertNoticeListDto(resolved.list)
  const scopedList = applyActivityNoticeScopeToList(list, noticeScope, {
    page,
    pageSize,
  })

  return {
    resourceType: 'notice',
    page: scopedList.page,
    pageSize: scopedList.pageSize,
    total: scopedList.total,
    list: scopedList.items.map((item) => mapActivityNoticeListItem(item)),
    etag: resolved.etag,
    notModified: false,
  }
}

export const consumeActivityNoticeUnread = async (noticeId: string): Promise<boolean> => {
  const result = await runContentAction({
    actionType: 'notice-read',
    noticeId,
  })

  return (
    'noticeId' in result &&
    'isUnread' in result &&
    result.noticeId === noticeId &&
    result.isUnread === false
  )
}
