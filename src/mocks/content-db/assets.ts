/**
 * Responsibility: define the mock asset registry consumed by content.mock scenes, lists, and
 * resource payload builders across banner, featured, and market surfaces.
 * Out of scope: scene composition, category metadata, and runtime image reveal behavior.
 */
import type { ContentAssetDto } from '../../contracts/content-api.contract'
import { sharedHomeCollectionCatalog } from './shared-home-collection-catalog'

const bannerBase = '/static/home/banner'
const featuredBase = '/static/home/featured'
const marketBase = '/static/home/market'

const staticAssetDb: Record<string, ContentAssetDto> = {
  'ASSET-BANNER-AX99': {
    assetId: 'ASSET-BANNER-AX99',
    originalUrl: `${bannerBase}/ax99-banner.jpg`,
    width: 686,
    height: 336,
    focalPoint: { x: 0.5, y: 0.5 },
    variants: {
      banner: `${bannerBase}/ax99-banner.jpg`,
      detail: `${bannerBase}/ax99-banner.jpg`,
    },
  },
  'ASSET-BANNER-BX17': {
    assetId: 'ASSET-BANNER-BX17',
    originalUrl: `${bannerBase}/bx17-banner.jpg`,
    width: 686,
    height: 336,
    focalPoint: { x: 0.5, y: 0.5 },
    variants: {
      banner: `${bannerBase}/bx17-banner.jpg`,
      detail: `${bannerBase}/bx17-banner.jpg`,
    },
  },
  'ASSET-BANNER-CX42': {
    assetId: 'ASSET-BANNER-CX42',
    originalUrl: `${bannerBase}/cx42-banner.jpg`,
    width: 686,
    height: 336,
    focalPoint: { x: 0.5, y: 0.5 },
    variants: {
      banner: `${bannerBase}/cx42-banner.jpg`,
      detail: `${bannerBase}/cx42-banner.jpg`,
    },
  },
  'ASSET-HOME-FEATURED-AX99': {
    assetId: 'ASSET-HOME-FEATURED-AX99',
    originalUrl: `${featuredBase}/ax99-featured.png`,
    width: 1440,
    height: 2560,
    focalPoint: { x: 0.5, y: 0.5 },
    variants: {
      card: `${featuredBase}/ax99-featured.png`,
      detail: `${featuredBase}/ax99-featured.png`,
    },
  },
}

const marketAssetDb = Object.fromEntries(
  sharedHomeCollectionCatalog.map((item) => [
    item.assetId,
    {
      assetId: item.assetId,
      originalUrl: `${marketBase}/${item.imageFileName}`,
      width: item.imageWidth,
      height: item.imageHeight,
      focalPoint: { x: 0.5, y: 0.5 },
      variants: {
        card: `${marketBase}/${item.imageFileName}`,
        detail: `${marketBase}/${item.imageFileName}`,
      },
    } satisfies ContentAssetDto,
  ])
)

export const contentAssetDb: Record<string, ContentAssetDto> = {
  ...staticAssetDb,
  ...marketAssetDb,
}

export const cloneContentAsset = (assetId?: string | null): ContentAssetDto | null => {
  if (!assetId) {
    return null
  }

  const asset = contentAssetDb[assetId]
  if (!asset) {
    return null
  }

  return {
    ...asset,
    focalPoint: asset.focalPoint ? { ...asset.focalPoint } : undefined,
    variants: asset.variants ? { ...asset.variants } : undefined,
  }
}
