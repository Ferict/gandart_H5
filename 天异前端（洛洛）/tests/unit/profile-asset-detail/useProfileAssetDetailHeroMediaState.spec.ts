import { computed, nextTick, ref } from 'vue'
import { useProfileAssetDetailHeroMediaState } from '@/pages/profile-asset-detail/runtime/useProfileAssetDetailHeroMediaState'
import type { ProfileAssetDetailContent } from '@/models/profile-asset-detail/profileAssetDetail.model'

const createDetailSnapshot = (
  overrides: Partial<ProfileAssetDetailContent> = {}
): ProfileAssetDetailContent => ({
  id: 'C-02',
  title: 'Detail Hero',
  categoryId: 'collections',
  categoryLabel: '资产',
  categoryEnglishLabel: 'COLLECTION',
  subCategory: '数字藏品',
  acquiredAt: '2026-01-01',
  statusLabel: 'OWNED',
  summary: 'hero summary',
  holdingsCount: 1,
  price: 1888,
  priceUnit: '¥',
  currency: 'CNY',
  editionCode: 'LTD',
  issueCount: 100,
  imageUrl: ' https://cdn.example.com/full-hero.jpg ',
  visualTone: 'mist',
  placeholderIconKey: 'hexagon',
  ...overrides,
})

describe('useProfileAssetDetailHeroMediaState', () => {
  it('prefers the full detail image and restores ratio from the wrapped load event', async () => {
    const detailContent = ref(createDetailSnapshot())
    const detailPersistentUserScope = ref<string | null>('0xhero')
    const heroMediaState = useProfileAssetDetailHeroMediaState({
      detailContent,
      detailPersistentUserScope,
      fallbackHeroImageUrl: computed(() => '/static/home/market/c10-market.png'),
    })

    expect(heroMediaState.heroImageUrl.value).toBe('https://cdn.example.com/full-hero.jpg')
    expect(heroMediaState.heroImageCacheUserScope.value).toBe('0xhero')
    expect(heroMediaState.heroPlaceholderIcon.value).toBe('hexagon')

    heroMediaState.handleHeroImageLoad({
      event: {
        detail: {
          width: 720,
          height: 1080,
        },
      },
    })
    expect(heroMediaState.heroMediaFrameStyle.value.aspectRatio).toBe('0.6667')

    detailContent.value = createDetailSnapshot({
      id: 'C-10',
      imageUrl: '   ',
    })
    await nextTick()

    expect(heroMediaState.heroImageUrl.value).toBe('/static/home/market/c10-market.png')
    expect(heroMediaState.heroMediaFrameStyle.value.aspectRatio).toBe('0.8000')

    heroMediaState.handleHeroImageError()
    expect(heroMediaState.heroMediaFrameStyle.value.aspectRatio).toBe('0.8000')
  })
})
