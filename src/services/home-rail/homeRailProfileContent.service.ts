/**
 * Responsibility: resolve profile rail scene and profile-asset list resources through the shared
 * content service seam, then delegate DTO normalization to adapters.
 * Out of scope: page-local result-window choreography, cache persistence, and transport policy.
 */
import type {
  HomeRailProfileContent,
  ProfileAssetItem,
  ProfileCategoryKey,
} from '../../models/home-rail/homeRailProfile.model'
import {
  adaptHomeRailProfileAssetListItemDto,
  adaptHomeRailProfileSceneDto,
  createHomeRailProfileContentShell as createHomeRailProfileContentShellAdapter,
} from '../../adapters/content/homeRailProfileContent.adapter'
import { resolveContentListWithMeta, resolveContentScene } from '../content/content.service'
import {
  buildRailContentSignature,
  createRailSceneResolvedMeta,
  type RailSceneResolvedContent,
} from './homeRailPageReloadPolicy.service'

const isHomeRailProfileContentDev = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)

interface ResolveHomeRailProfileContentOptions {
  force?: boolean
}

export interface ResolveHomeRailProfileAssetListInput {
  categoryId?: ProfileCategoryKey | 'all'
  subCategory?: string
  keyword?: string
  page?: number
  pageSize?: number
}

export interface HomeRailProfileAssetListResult {
  page: number
  pageSize: number
  total: number
  items: ProfileAssetItem[]
  etag?: string
  notModified?: boolean
}

export type HomeRailProfileSceneModuleKey = 'summary' | 'categories' | 'subCategories'

export const buildHomeRailProfileBlockSignatures = (
  content: HomeRailProfileContent
): Record<HomeRailProfileSceneModuleKey, string> => ({
  summary: buildRailContentSignature(content.summary),
  categories: buildRailContentSignature(
    content.categories.map((item) => ({ id: item.id, label: item.label }))
  ),
  subCategories: buildRailContentSignature(
    content.categories.map((item) => ({ id: item.id, subCategories: item.subCategories }))
  ),
})

let homeRailProfileResolvedContentInFlight: Promise<
  RailSceneResolvedContent<HomeRailProfileContent>
> | null = null

export const createHomeRailProfileContentShell = (): HomeRailProfileContent => {
  return createHomeRailProfileContentShellAdapter()
}

export const resolveHomeRailProfileContent = async (
  options: ResolveHomeRailProfileContentOptions = {}
): Promise<RailSceneResolvedContent<HomeRailProfileContent>> => {
  if (homeRailProfileResolvedContentInFlight && !options.force) {
    return homeRailProfileResolvedContentInFlight
  }

  const nextRequest = resolveContentScene({ sceneId: 'profile' })
    .then((scene) => {
      const content = adaptHomeRailProfileSceneDto(scene)
      return {
        content,
        meta: createRailSceneResolvedMeta({
          version: scene.version,
          updatedAt: scene.updatedAt,
          signature: buildRailContentSignature(content),
        }),
      }
    })
    .finally(() => {
      if (homeRailProfileResolvedContentInFlight === nextRequest) {
        homeRailProfileResolvedContentInFlight = null
      }
    })

  homeRailProfileResolvedContentInFlight = nextRequest
  return nextRequest
}

export const resolveHomeRailProfileAssetList = async (
  input: ResolveHomeRailProfileAssetListInput = {},
  options: { ifNoneMatch?: string } = {}
): Promise<HomeRailProfileAssetListResult> => {
  const resolved = await resolveContentListWithMeta(
    {
      resourceType: 'profile_asset',
      categoryId: input.categoryId === 'all' ? undefined : input.categoryId,
      subCategory: input.subCategory?.trim() || undefined,
      keyword: input.keyword?.trim() || undefined,
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 60,
    },
    { ifNoneMatch: options.ifNoneMatch }
  )

  if (resolved.notModified || !resolved.list) {
    if (resolved.notModified && isHomeRailProfileContentDev) {
      console.debug('[homeRail][profile] asset list 304', {
        query: input,
        etag: resolved.etag ?? null,
      })
    }

    return {
      page: input.page ?? 1,
      pageSize: input.pageSize ?? 60,
      total: 0,
      items: [],
      etag: resolved.etag,
      notModified: true,
    }
  }

  const list = resolved.list
  if (list.resourceType !== 'profile_asset') {
    throw new Error(`[homeRail] unexpected profile asset list resourceType: ${list.resourceType}`)
  }

  return {
    page: list.page,
    pageSize: list.pageSize,
    total: list.total,
    items: list.items
      .map((item) => adaptHomeRailProfileAssetListItemDto(item))
      .filter((item): item is ProfileAssetItem => Boolean(item)),
    etag: resolved.etag,
    notModified: false,
  }
}
