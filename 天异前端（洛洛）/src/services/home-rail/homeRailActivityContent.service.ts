/**
 * Responsibility: resolve activity rail scene and notice list resources through the shared
 * content service seam, then delegate DTO normalization to adapters.
 * Out of scope: result-window switching, persistent cache orchestration, and read-state UI.
 */
import type {
  ActivityDateFilterRange,
  ActivityNoticeListResult,
  HomeRailActivityContent,
} from '../../models/home-rail/homeRailActivity.model'
import {
  adaptHomeRailActivityNoticeListItemDto,
  adaptHomeRailActivitySceneDto,
  createHomeRailActivityContentShell as createHomeRailActivityContentShellAdapter,
} from '../../adapters/content/homeRailActivityContent.adapter'
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
  list: {
    items: Array<Parameters<typeof adaptHomeRailActivityNoticeListItemDto>[0]>
  },
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
  return createHomeRailActivityContentShellAdapter()
}

export const resolveHomeRailActivityContent = async (
  options: ResolveHomeRailActivityContentOptions = {}
): Promise<RailSceneResolvedContent<HomeRailActivityContent>> => {
  if (homeRailActivityResolvedContentInFlight && !options.force) {
    return homeRailActivityResolvedContentInFlight
  }

  const nextRequest = resolveContentScene({ sceneId: 'activity' })
    .then((scene) => {
      const content = adaptHomeRailActivitySceneDto(scene)
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

  const list = resolved.list
  if (list.resourceType !== 'notice') {
    throw new Error(`[homeRail] unexpected activity notice list resourceType: ${list.resourceType}`)
  }

  const scopedList = applyActivityNoticeScopeToList(list, noticeScope, {
    page,
    pageSize,
  })

  return {
    resourceType: 'notice',
    page: scopedList.page,
    pageSize: scopedList.pageSize,
    total: scopedList.total,
    list: scopedList.items.map((item) => adaptHomeRailActivityNoticeListItemDto(item)),
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
