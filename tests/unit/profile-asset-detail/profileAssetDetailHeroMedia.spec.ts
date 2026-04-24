import {
  resolveProfileAssetDetailHeroImageRatio,
  resolveProfileAssetDetailHeroImageUrl,
} from '@/pages/profile-asset-detail/helpers/profileAssetDetailHeroMedia'

describe('profileAssetDetail hero media', () => {
  it('keeps full static hero image urls instead of forcing cropped variants', () => {
    expect(resolveProfileAssetDetailHeroImageUrl('/static/home/market/c02-market.jpg')).toBe(
      '/static/home/market/c02-market.jpg'
    )
    expect(resolveProfileAssetDetailHeroImageUrl('/static/home/market/c10-market.png')).toBe(
      '/static/home/market/c10-market.png'
    )
  })

  it('resolves image ratio from wrapped HomeMarketCardImageReveal load payload', () => {
    expect(
      resolveProfileAssetDetailHeroImageRatio({
        event: {
          detail: {
            width: 720,
            height: 1080,
          },
        },
      })
    ).toBeCloseTo(2 / 3)
  })

  it('returns null when load payload does not contain valid dimensions', () => {
    expect(resolveProfileAssetDetailHeroImageRatio({})).toBeNull()
    expect(
      resolveProfileAssetDetailHeroImageRatio({
        event: {
          detail: {
            width: 0,
            height: 1080,
          },
        },
      })
    ).toBeNull()
  })
})
