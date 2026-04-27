/**
 * Responsibility: adapt retained asset-merge provider DTOs into the stable page view model.
 * Out of scope: provider selection, page rendering, and merge execution side effects.
 */
import type { AssetMergeArchiveDto, AssetMergeEventDto } from './asset-merge.port'
import type {
  AssetMergeEventViewModel,
  AssetMergeMaterialViewModel,
  AssetMergeRecipeViewModel,
} from './asset-merge.model'

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

const adaptMaterial = (material: AssetMergeEventDto['recipes'][number]['materials'][number]) => {
  const safeRequired = Math.max(material.required, 1)
  const safeOwned = Math.max(material.owned, 0)

  return {
    id: material.id,
    name: material.name,
    owned: safeOwned,
    required: safeRequired,
    coverImageUrl: material.coverImageUrl,
    isReady: safeOwned >= safeRequired,
    progressPercent: Math.min(Math.round((safeOwned / safeRequired) * 100), 100),
  } satisfies AssetMergeMaterialViewModel
}

const adaptRecipe = (recipe: AssetMergeEventDto['recipes'][number]): AssetMergeRecipeViewModel => {
  const materials = recipe.materials.map(adaptMaterial)
  const readyMaterialCount = materials.filter((material) => material.isReady).length

  return {
    id: recipe.id,
    name: recipe.name,
    materials,
    readyMaterialCount,
    materialCount: materials.length,
    isReady: materials.length > 0 && readyMaterialCount === materials.length,
  }
}

export const adaptAssetMergeEvent = (input: AssetMergeEventDto): AssetMergeEventViewModel => ({
  id: input.id,
  title: input.title,
  status: input.status,
  statusLabel: resolveStatusLabel(input.status),
  timeRange: input.timeRange,
  countdownLabel: input.countdownLabel,
  participants: input.participants,
  participantsLabel: input.participants.toLocaleString('zh-CN'),
  formula: input.formula,
  totalSupply: input.totalSupply,
  remainingSupply: input.remainingSupply,
  totalSupplyLabel: formatSupplyLabel(input.totalSupply),
  remainingSupplyLabel: formatSupplyLabel(input.remainingSupply),
  coverImageUrl: input.coverImageUrl,
  tone: input.tone,
  yieldAsset: { ...input.yieldAsset },
  recipes: input.recipes.map(adaptRecipe),
  rules: [...input.rules],
})

export const adaptAssetMergeArchive = (input: AssetMergeArchiveDto): AssetMergeEventViewModel[] =>
  input.events.map(adaptAssetMergeEvent)
