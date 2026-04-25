/**
 * Responsibility: define the page-local provider seam for retained asset-merge content.
 * Out of scope: formal backend contract truth, page rendering, and transport bootstrap policy.
 */
export type AssetMergeStatusDto = 'LIVE' | 'UPCOMING' | 'ENDED'
export type AssetMergeToneDto = 'dark' | 'warm' | 'snow' | 'field'

export interface AssetMergeEventDto {
  id: string
  title: string
  status: AssetMergeStatusDto
  timeRange: string
  formula: string
  totalSupply: number
  remainingSupply: number
  coverImageUrl: string
  tone: AssetMergeToneDto
}

export interface AssetMergeArchiveDto {
  events: AssetMergeEventDto[]
}

export interface AssetMergePort {
  getArchive: () => AssetMergeArchiveDto
}
