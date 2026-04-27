/**
 * Responsibility: define the page-local provider seam for retained asset-merge content.
 * Out of scope: formal backend contract truth, page rendering, and transport bootstrap policy.
 */
export type AssetMergeStatusDto = 'LIVE' | 'UPCOMING' | 'ENDED'
export type AssetMergeToneDto = 'dark' | 'warm' | 'snow' | 'field'

export interface AssetMergeYieldAssetDto {
  id: string
  title: string
  level: string
  coverImageUrl: string
}

export interface AssetMergeMaterialDto {
  id: string
  name: string
  owned: number
  required: number
  coverImageUrl: string
}

export interface AssetMergeRecipeDto {
  id: string
  name: string
  materials: AssetMergeMaterialDto[]
}

export interface AssetMergeEventDto {
  id: string
  title: string
  status: AssetMergeStatusDto
  timeRange: string
  countdownLabel: string
  participants: number
  formula: string
  totalSupply: number
  remainingSupply: number
  coverImageUrl: string
  tone: AssetMergeToneDto
  yieldAsset: AssetMergeYieldAssetDto
  recipes: AssetMergeRecipeDto[]
  rules: string[]
}

export interface AssetMergeArchiveDto {
  events: AssetMergeEventDto[]
}

export interface AssetMergePort {
  getArchive: () => AssetMergeArchiveDto
}
