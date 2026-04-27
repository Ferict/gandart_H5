/**
 * Responsibility: derive the profile asset detail page's stable presentation view-model,
 * including UI presets, value cards, hero metadata, and description/trait display fields.
 * Out of scope: route parsing, detail refresh orchestration, persistent cache flow, and
 * hero media request/runtime management.
 */
import { computed, type ComputedRef, type Ref } from 'vue'
import type { ProfileCategoryKey } from '../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetDetailContent } from '../../../models/profile-asset-detail/profileAssetDetail.model'
import { resolvePriceSymbol } from '../../../utils/priceSymbol.util'
import { DEFAULT_PROFILE_ASSET_ITEM_ID } from './useProfileAssetDetailRouteState'
import type { ProfileAssetDetailRouteQuery } from './profileAssetDetailRouteQuery'

export interface AssetDetailTrait {
  typeLabel: string
  value: string
  rarity?: string
}

export interface AssetDetailUiPreset {
  heroImageUrl: string
  verifiedLabel: string
  creatorLabel: string
  collectionLabel: string
  owner: string
  contract: string
  chain: string
  tokenStandard: string
  fiatText: string
  archiveNote: string
  descriptionNote: string
  primaryActionText: string
  secondaryActionText: string
  traits: AssetDetailTrait[]
}

const HERO_TOP_BRAND_TEXT = 'TIANYI ART'

const DEFAULT_PRESET: AssetDetailUiPreset = {
  heroImageUrl: '/static/home/market/c02-market.jpg',
  verifiedLabel: 'AUTHENTIC / VERIFIED',
  creatorLabel: 'Tianyi_art',
  collectionLabel: '多维档案计划',
  owner: '0x8A...3F92',
  contract: '0x7F2...C4A1',
  chain: '0xE4...9AC1',
  tokenStandard: 'BSN',
  fiatText: '≈ ￥8,542.10',
  archiveNote: '该资产已通过链上索引映射，当前为个人中心持有态。',
  descriptionNote: '当前页仅完成 UI 落地，交易与分享动作由主控后续接入。',
  primaryActionText: '挂售资产',
  secondaryActionText: '发起报价',
  traits: [
    { typeLabel: '阵营 / FACTION', value: '守望者' },
    { typeLabel: '装甲 / ARMOR', value: '星尘合金', rarity: '1.2%' },
    { typeLabel: '核心 / CORE', value: '高频脉冲', rarity: '0.5%' },
    { typeLabel: '涂装 / PAINT', value: '深空耀黑', rarity: '5.0%' },
    { typeLabel: '武装 / WEAPON', value: '等离子刃' },
    { typeLabel: '状态 / STATUS', value: '未觉醒' },
  ],
}

const PRESET_BY_CATEGORY: Record<ProfileCategoryKey, Partial<AssetDetailUiPreset>> = {
  collections: { collectionLabel: '收藏藏品档案' },
  blindBoxes: {
    collectionLabel: '盲盒资产档案',
    primaryActionText: '挂售资产',
    secondaryActionText: '转移仓位',
  },
}

const PRESET_BY_ITEM: Record<string, Partial<AssetDetailUiPreset>> = {
  'C-02': {
    heroImageUrl: '/static/home/market/c02-market.jpg',
    creatorLabel: 'Tianyi_art',
    collectionLabel: 'AETHER CURATION / COLLECTION',
  },
  'C-10': {
    heroImageUrl: '/static/home/market/c10-market.png',
    creatorLabel: 'Tianyi_art',
    collectionLabel: 'VIRTUAL WEAR CURATION',
  },
}

interface UseProfileAssetDetailPresentationOptions {
  detailContent: Ref<ProfileAssetDetailContent>
  routeQuery: Ref<ProfileAssetDetailRouteQuery>
}

export interface UseProfileAssetDetailPresentationResult {
  activeUiPreset: ComputedRef<AssetDetailUiPreset>
  heroTopCodeText: ComputedRef<string>
  heroBarcodeBars: ComputedRef<number[]>
  displayPrice: ComputedRef<string>
  valueCardCreatorText: ComputedRef<string>
  valueCardPartitionDisplayText: ComputedRef<string>
  valueCardTitleText: ComputedRef<string>
  displayPriceUnitVisual: ComputedRef<string>
  valueCardMetricLabelText: ComputedRef<string>
  valueCardHoldingSerialText: ComputedRef<string>
  valueCardHoldingCount: ComputedRef<number>
  valueCardAcquiredAtText: ComputedRef<string>
  assetDescriptionText: ComputedRef<string>
  valueCardTotalValueCompactLabelText: ComputedRef<string>
  resolvedTraits: ComputedRef<AssetDetailTrait[]>
}

const resolvePreset = (itemId: string, categoryId: ProfileCategoryKey): AssetDetailUiPreset => {
  const categoryPreset = PRESET_BY_CATEGORY[categoryId]
  const itemPreset = PRESET_BY_ITEM[itemId]
  return {
    ...DEFAULT_PRESET,
    ...categoryPreset,
    ...itemPreset,
    traits: itemPreset?.traits ?? categoryPreset?.traits ?? DEFAULT_PRESET.traits,
  }
}

const trimTrailingZeros = (value: string) => value.replace(/\.?0+$/, '')

const formatCompactTotalValue = (value: number) => {
  if (!Number.isFinite(value) || value <= 0) {
    return '--'
  }

  const units = [
    { threshold: 1e12, suffix: 'T' },
    { threshold: 1e9, suffix: 'B' },
    { threshold: 1e6, suffix: 'M' },
  ] as const

  for (const unit of units) {
    if (value >= unit.threshold) {
      const scaled = value / unit.threshold
      const fractionDigits = scaled >= 100 ? 0 : scaled >= 10 ? 1 : 2
      return `${trimTrailingZeros(scaled.toFixed(fractionDigits))}${unit.suffix}`
    }
  }

  return value.toLocaleString('en-US')
}

export const useProfileAssetDetailPresentation = ({
  detailContent,
  routeQuery,
}: UseProfileAssetDetailPresentationOptions): UseProfileAssetDetailPresentationResult => {
  const activeUiPreset = computed(() =>
    resolvePreset(detailContent.value.id, detailContent.value.categoryId)
  )

  const heroTopCodeText = computed(() => HERO_TOP_BRAND_TEXT)

  const heroBarcodeBars = computed(() => {
    const seed = detailContent.value.id || DEFAULT_PROFILE_ASSET_ITEM_ID
    return Array.from({ length: 12 }, (_, index) => {
      const code = seed.charCodeAt(index % seed.length) || 67
      return (code % 3) + 2
    })
  })

  const displayPrice = computed(() =>
    detailContent.value.price > 0
      ? detailContent.value.price.toLocaleString('en-US', {
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        })
      : '--'
  )

  const valueCardCreatorText = computed(
    () => activeUiPreset.value.creatorLabel.trim() || DEFAULT_PRESET.creatorLabel
  )

  const valueCardPartitionDisplayText = computed(() => {
    const subCategoryZh = detailContent.value.subCategory.trim()
    const categoryZh = detailContent.value.categoryLabel.trim()
    return subCategoryZh || categoryZh || '未分区'
  })

  const valueCardTitleText = computed(() => detailContent.value.title.trim())

  const displayPriceUnitVisual = computed(() => {
    const raw = (detailContent.value.priceUnit || detailContent.value.currency || 'CNY').trim()
    return resolvePriceSymbol(raw) || '￥'
  })

  const valueCardMetricLabelText = computed(() => '当前估值 / MARKET VALUE')

  const valueCardHoldingSerialText = computed(() => routeQuery.value.holdingSerial.trim())

  const valueCardHoldingCount = computed(() => {
    return valueCardHoldingSerialText.value ? 1 : detailContent.value.holdingsCount
  })

  const valueCardAcquiredAtText = computed(() => {
    return routeQuery.value.holdingAcquiredAt.trim() || detailContent.value.acquiredAt
  })

  const assetDescriptionText = computed(() => {
    const title = detailContent.value.title.trim() || '该藏品'
    const category =
      detailContent.value.subCategory.trim() || detailContent.value.categoryLabel.trim()

    return `《${title}》已纳入天异数字艺术档案体系，当前以可验证资产记录形态展示。作品定位于${category || '数字艺术'}分区，页面同步呈现持有关系、发行版本与授权标准等关键信息，便于后续流通、授权与策展场景进行一致性校验。`
  })

  const valueCardTotalValueCompactLabelText = computed(() => {
    const circulationUnits = Math.max(detailContent.value.issueCount || 0, 0)
    const unitPrice = Math.max(detailContent.value.price || 0, 0)
    if (circulationUnits <= 0 || unitPrice <= 0) {
      return 'TCV ≈ --'
    }

    const totalValue = circulationUnits * unitPrice
    return `TCV ≈ ${displayPriceUnitVisual.value}${formatCompactTotalValue(totalValue)}`
  })

  const resolvedTraits = computed<AssetDetailTrait[]>(() =>
    activeUiPreset.value.traits.length
      ? activeUiPreset.value.traits
      : [
          { typeLabel: '分类 / CATEGORY', value: detailContent.value.categoryLabel },
          { typeLabel: '子类 / SUBCATEGORY', value: detailContent.value.subCategory || '未标注' },
          { typeLabel: '状态 / STATUS', value: detailContent.value.statusLabel },
        ]
  )

  return {
    activeUiPreset,
    heroTopCodeText,
    heroBarcodeBars,
    displayPrice,
    valueCardCreatorText,
    valueCardPartitionDisplayText,
    valueCardTitleText,
    displayPriceUnitVisual,
    valueCardMetricLabelText,
    valueCardHoldingSerialText,
    valueCardHoldingCount,
    valueCardAcquiredAtText,
    assetDescriptionText,
    valueCardTotalValueCompactLabelText,
    resolvedTraits,
  }
}
