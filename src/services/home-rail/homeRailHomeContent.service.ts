/**
 * Responsibility: resolve home rail content and market list resources through the shared content
 * service seam, then hand DTO normalization off to adapters.
 * Out of scope: page-local presentation, animation runtime, and transport implementation details.
 */
import type {
  HomeMarketCard,
  HomeMarketSortDirection,
  HomeMarketSortField,
  HomeRailHomeContent,
} from '../../models/home-rail/homeRailHome.model'
import {
  adaptHomeRailHomeMarketListItemDto,
  adaptHomeRailHomeSceneDto,
  createHomeRailHomeContentShell as createHomeRailHomeContentShellAdapter,
} from '../../adapters/content/homeRailHomeContent.adapter'
import { resolveContentListWithMeta, resolveContentScene } from '../content/content.service'
import {
  buildRailContentSignature,
  createRailSceneResolvedMeta,
  type RailSceneResolvedContent,
} from './homeRailPageReloadPolicy.service'

const isHomeRailHomeContentDev = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

interface ResolveHomeRailHomeContentOptions {
  force?: boolean
}

export interface ResolveHomeRailMarketCardListInput {
  categoryId?: string
  keyword?: string
  sort: {
    field: HomeMarketSortField
    direction: HomeMarketSortDirection
  }
  page: number
  pageSize: number
}

export interface HomeRailMarketCardListResult {
  page: number
  pageSize: number
  total: number
  items: HomeMarketCard[]
  etag?: string
  notModified?: boolean
}

export type HomeRailHomeSceneModuleKey = 'noticeBar' | 'banner' | 'featured' | 'marketShell'

export const buildHomeRailHomeBlockSignatures = (
  content: HomeRailHomeContent
): Record<HomeRailHomeSceneModuleKey, string> => ({
  noticeBar: buildRailContentSignature(content.noticeBar),
  banner: buildRailContentSignature(content.banners),
  featured: buildRailContentSignature(content.featured),
  marketShell: buildRailContentSignature({
    sectionTitle: content.market.sectionTitle,
    sectionSubtitle: content.market.sectionSubtitle,
    tags: content.market.tags,
    actions: content.market.actions,
    sortConfig: content.market.sortConfig,
  }),
})

let homeRailHomeResolvedContentInFlight: Promise<
  RailSceneResolvedContent<HomeRailHomeContent>
> | null = null

const buildHomeRailHomeStableSignature = (content: HomeRailHomeContent): string => {
  return buildRailContentSignature({
    ...content,
    noticeBar: {
      ...content.noticeBar,
      items: content.noticeBar.items.map((item) => ({
        noticeId: item.noticeId,
        title: item.title,
        type: item.type,
        time: item.time,
      })),
    },
  })
}

export const createHomeRailHomeContentShell = (): HomeRailHomeContent => {
  return createHomeRailHomeContentShellAdapter()
}

const mapHomeSortFieldToContent = (field: HomeMarketSortField): 'listedAt' | 'priceInCent' => {
  if (field === 'price') {
    return 'priceInCent'
  }

  return field
}

export const resolveHomeRailMarketCardList = async (
  input: ResolveHomeRailMarketCardListInput,
  options: { ifNoneMatch?: string } = {}
): Promise<HomeRailMarketCardListResult> => {
  const resolved = await resolveContentListWithMeta(
    {
      resourceType: 'market_item',
      categoryId: input.categoryId,
      keyword: input.keyword,
      sort: {
        field: mapHomeSortFieldToContent(input.sort.field),
        direction: input.sort.direction,
      },
      page: input.page,
      pageSize: input.pageSize,
    },
    options
  )

  if (resolved.notModified || !resolved.list) {
    if (resolved.notModified && isHomeRailHomeContentDev) {
      console.debug('[homeRail][home] market list 304', {
        query: input,
        etag: resolved.etag ?? null,
      })
    }

    return {
      page: input.page,
      pageSize: input.pageSize,
      total: 0,
      items: [],
      etag: resolved.etag,
      notModified: true,
    }
  }

  const list = resolved.list
  if (list.resourceType !== 'market_item') {
    throw new Error(`[homeRail] unexpected market list resourceType: ${list.resourceType}`)
  }

  return {
    page: list.page,
    pageSize: list.pageSize,
    total: list.total,
    items: list.items.map((item) => adaptHomeRailHomeMarketListItemDto(item)),
    etag: resolved.etag,
    notModified: false,
  }
}

export const resolveHomeRailHomeContent = async (
  options: ResolveHomeRailHomeContentOptions = {}
): Promise<RailSceneResolvedContent<HomeRailHomeContent>> => {
  if (homeRailHomeResolvedContentInFlight && !options.force) {
    return homeRailHomeResolvedContentInFlight
  }

  const nextRequest = resolveContentScene({ sceneId: 'home' })
    .then((scene) => {
      const content = adaptHomeRailHomeSceneDto(scene)
      return {
        content,
        meta: createRailSceneResolvedMeta({
          version: scene.version,
          updatedAt: scene.updatedAt,
          signature: buildHomeRailHomeStableSignature(content),
        }),
      }
    })
    .finally(() => {
      if (homeRailHomeResolvedContentInFlight === nextRequest) {
        homeRailHomeResolvedContentInFlight = null
      }
    })

  homeRailHomeResolvedContentInFlight = nextRequest
  return nextRequest
}
