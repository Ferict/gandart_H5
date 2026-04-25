/**
 * Responsibility: adapt retained asset-merge provider DTOs into the stable page view model.
 * Out of scope: provider selection, page rendering, and merge execution side effects.
 */
import type { AssetMergeArchiveDto, AssetMergeEventDto } from './asset-merge.port'
import type { AssetMergeEventViewModel } from './asset-merge.model'

const formatSupplyLabel = (value: number) => {
  if (value >= 10000) {
    return `${(value / 10000).toFixed(1).replace(/\.0$/, '')}W`
  }

  return `${value}`
}

const resolveStatusLabel = (status: AssetMergeEventDto['status']) => {
  if (status === 'LIVE') {
    return '进行中'
  }

  if (status === 'UPCOMING') {
    return '未开始'
  }

  return '已结束'
}

export const adaptAssetMergeEvent = (input: AssetMergeEventDto): AssetMergeEventViewModel => ({
  id: input.id,
  title: input.title,
  status: input.status,
  statusLabel: resolveStatusLabel(input.status),
  timeRange: input.timeRange,
  formula: input.formula,
  totalSupply: input.totalSupply,
  remainingSupply: input.remainingSupply,
  totalSupplyLabel: formatSupplyLabel(input.totalSupply),
  remainingSupplyLabel: formatSupplyLabel(input.remainingSupply),
  coverImageUrl: input.coverImageUrl,
  tone: input.tone,
})

export const adaptAssetMergeArchive = (input: AssetMergeArchiveDto): AssetMergeEventViewModel[] =>
  input.events.map(adaptAssetMergeEvent)
