/**
 * Responsibility: declare the stable view model consumed by the retained asset-merge page.
 * Out of scope: provider DTOs, backend contract design, and merge action execution.
 */
export type AssetMergeStatus = 'LIVE' | 'UPCOMING' | 'ENDED'
export type AssetMergeTone = 'dark' | 'warm' | 'snow' | 'field'

export interface AssetMergeYieldAssetViewModel {
  id: string
  title: string
  level: string
  coverImageUrl: string
}

export interface AssetMergeMaterialViewModel {
  id: string
  name: string
  owned: number
  required: number
  coverImageUrl: string
  isReady: boolean
  progressPercent: number
}

export interface AssetMergeRecipeViewModel {
  id: string
  name: string
  materials: AssetMergeMaterialViewModel[]
  readyMaterialCount: number
  materialCount: number
  isReady: boolean
}

export interface AssetMergeEventViewModel {
  id: string
  title: string
  status: AssetMergeStatus
  statusLabel: string
  timeRange: string
  countdownLabel: string
  participants: number
  participantsLabel: string
  formula: string
  totalSupply: number
  remainingSupply: number
  totalSupplyLabel: string
  remainingSupplyLabel: string
  coverImageUrl: string
  tone: AssetMergeTone
  yieldAssets: AssetMergeYieldAssetViewModel[]
  recipes: AssetMergeRecipeViewModel[]
  rules: string[]
}
