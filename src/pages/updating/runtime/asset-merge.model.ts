/**
 * Responsibility: declare the stable view model consumed by the retained asset-merge page.
 * Out of scope: provider DTOs, backend contract design, and merge action execution.
 */
export type AssetMergeStatus = 'LIVE' | 'UPCOMING' | 'ENDED'
export type AssetMergeTone = 'dark' | 'warm' | 'snow' | 'field'

export interface AssetMergeEventViewModel {
  id: string
  title: string
  status: AssetMergeStatus
  statusLabel: string
  timeRange: string
  formula: string
  totalSupply: number
  remainingSupply: number
  totalSupplyLabel: string
  remainingSupplyLabel: string
  coverImageUrl: string
  tone: AssetMergeTone
}
