import { ref } from 'vue'
import { useProfileAssetDetailPresentation } from '@/pages/profile-asset-detail/runtime/useProfileAssetDetailPresentation'
import type { ProfileAssetDetailContent } from '@/models/profile-asset-detail/profileAssetDetail.model'
import type { ProfileAssetDetailRouteQuery } from '@/pages/profile-asset-detail/runtime/profileAssetDetailRouteQuery'

const createDetailSnapshot = (
  overrides: Partial<ProfileAssetDetailContent> = {}
): ProfileAssetDetailContent => ({
  id: 'C-10',
  title: '裂彩奔影',
  categoryId: 'collections',
  categoryLabel: '资产',
  categoryEnglishLabel: 'COLLECTION',
  subCategory: '数字雕塑',
  acquiredAt: '2026-01-01',
  statusLabel: 'OWNED',
  summary: 'presentation summary',
  holdingsCount: 1,
  price: 2600,
  priceUnit: 'CNY',
  currency: 'CNY',
  editionCode: 'LTD',
  issueCount: 120,
  imageUrl: 'https://cdn.example.com/c-10.jpg',
  visualTone: 'mist',
  ...overrides,
})

describe('useProfileAssetDetailPresentation', () => {
  it('keeps preset-driven presentation output stable for detail content', () => {
    const detailContent = ref(createDetailSnapshot())
    const routeQuery = ref<ProfileAssetDetailRouteQuery>({
      source: 'profile',
      itemId: '',
      assetId: '',
      category: '',
      subCategory: '',
      holdingInstanceId: '',
      holdingSerial: '',
      holdingAcquiredAt: '',
    })
    const presentation = useProfileAssetDetailPresentation({ detailContent, routeQuery })

    expect(presentation.activeUiPreset.value.heroImageUrl).toBe(
      '/static/home/market/c10-market.png'
    )
    expect(presentation.heroTopCodeText.value).toBe('TIANYI ART')
    expect(presentation.valueCardTitleText.value).toBe('裂彩奔影')
    expect(presentation.valueCardPartitionDisplayText.value).toBe('数字雕塑')
    expect(presentation.displayPrice.value).toBe('2,600.00')
    expect(presentation.displayPriceUnitVisual.value).toBe('￥')
    expect(presentation.valueCardMetricLabelText.value).toBe('当前估值 / MARKET VALUE')
    expect(presentation.assetDescriptionText.value).toContain('裂彩奔影')
    expect(presentation.valueCardTotalValueCompactLabelText.value).toBe('TCV ≈ ￥312,000')
    expect(presentation.valueCardHoldingSerialText.value).toBe('')
    expect(presentation.valueCardHoldingCount.value).toBe(1)
    expect(presentation.valueCardAcquiredAtText.value).toBe('2026-01-01')
    expect(presentation.resolvedTraits.value.length).toBeGreaterThan(0)
  })

  it('overrides the value card with selected holding instance route data', () => {
    const detailContent = ref(
      createDetailSnapshot({
        holdingsCount: 4,
        acquiredAt: '2026-01-01',
      })
    )
    const routeQuery = ref<ProfileAssetDetailRouteQuery>({
      source: 'profile',
      itemId: 'C-10',
      assetId: '',
      category: 'collections',
      subCategory: '数字雕塑',
      holdingInstanceId: 'asset-genesis-zero::holding::2',
      holdingSerial: '#10291',
      holdingAcquiredAt: '2026.04.03 08:41:00',
    })
    const presentation = useProfileAssetDetailPresentation({ detailContent, routeQuery })

    expect(presentation.valueCardHoldingSerialText.value).toBe('#10291')
    expect(presentation.valueCardHoldingCount.value).toBe(1)
    expect(presentation.valueCardAcquiredAtText.value).toBe('2026.04.03 08:41:00')
  })
})
