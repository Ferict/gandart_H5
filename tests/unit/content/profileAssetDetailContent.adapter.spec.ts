import {
  adaptProfileAssetDetailContent,
  createProfileAssetDetailFallbackPayload,
  resolveProfileAssetDetailAssetUrl,
  resolveProfileAssetDetailCurrencyUnit,
} from '@/adapters/content/profileAssetDetailContent.adapter'

describe('profileAssetDetailContent adapter', () => {
  it('creates the expected fallback payload', () => {
    expect(createProfileAssetDetailFallbackPayload('blindBoxes')).toEqual({
      categoryId: 'blindBoxes',
      subCategory: '',
      acquiredAt: '',
      holdingsCount: 1,
      currency: 'CNY',
      priceInCent: 0,
      editionCode: 'LTD',
      issueCount: 0,
      placeholderIconKey: 'box',
      visualTone: 'mist',
    })
  })

  it('resolves the currency unit as a visible price prefix', () => {
    expect(resolveProfileAssetDetailCurrencyUnit('CNY')).toBe('￥')
    expect(resolveProfileAssetDetailCurrencyUnit('RMB')).toBe('￥')
    expect(resolveProfileAssetDetailCurrencyUnit('元')).toBe('￥')
    expect(resolveProfileAssetDetailCurrencyUnit('¥')).toBe('￥')
    expect(resolveProfileAssetDetailCurrencyUnit('￥')).toBe('￥')
    expect(resolveProfileAssetDetailCurrencyUnit('USD')).toBe('$')
    expect(resolveProfileAssetDetailCurrencyUnit('EUR')).toBe('€')
    expect(resolveProfileAssetDetailCurrencyUnit('ETH')).toBe('ETH')
  })

  it('resolves asset url by detail, card, then original url', () => {
    expect(resolveProfileAssetDetailAssetUrl(null)).toBe('')
    expect(
      resolveProfileAssetDetailAssetUrl({
        originalUrl: 'https://example.com/original.png',
        variants: {
          detail: 'https://example.com/detail.png',
          card: 'https://example.com/card.png',
        },
      })
    ).toBe('https://example.com/detail.png')
    expect(
      resolveProfileAssetDetailAssetUrl({
        originalUrl: 'https://example.com/original.png',
        variants: {
          card: 'https://example.com/card.png',
        },
      })
    ).toBe('https://example.com/card.png')
    expect(
      resolveProfileAssetDetailAssetUrl({
        originalUrl: 'https://example.com/original.png',
      })
    ).toBe('https://example.com/original.png')
  })

  it('adapts the dto into the normalized detail model without changing behavior', () => {
    expect(
      adaptProfileAssetDetailContent(
        {
          resourceId: 'asset-001',
          title: 'Asset Title',
          status: 'OWNED',
          summary: undefined,
          asset: {
            originalUrl: 'https://example.com/original.png',
            variants: {
              card: 'https://example.com/card.png',
            },
          },
          payload: {
            categoryId: 'collections',
            subCategory: '二级分类',
            acquiredAt: '2026-04-24T00:00:00.000Z',
            holdingsCount: 0,
            currency: 'CNY',
            priceInCent: 149,
            editionCode: 'ED-001',
            issueCount: 12,
            placeholderIconKey: 'box',
            visualTone: 'mist',
            badgeType: 'hot',
            badgeLabel: 'Hot',
            assetId: 'asset-meta-001',
            linkedMarketItemId: 'market-001',
          },
        },
        'blindBoxes'
      )
    ).toEqual({
      id: 'asset-001',
      title: 'Asset Title',
      categoryId: 'collections',
      categoryLabel: '资产',
      categoryEnglishLabel: 'COLLECTION',
      subCategory: '二级分类',
      acquiredAt: '2026-04-24T00:00:00.000Z',
      statusLabel: 'OWNED',
      summary: '当前资产已归档到个人中心资产链路，后续可在这里承接更多权益与管理动作。',
      holdingsCount: 1,
      price: 1,
      priceUnit: '￥',
      currency: 'CNY',
      editionCode: 'ED-001',
      issueCount: 12,
      imageUrl: 'https://example.com/card.png',
      placeholderIconKey: 'box',
      visualTone: 'mist',
      badge: {
        tone: 'hot',
        label: 'Hot',
      },
      assetId: 'asset-meta-001',
      linkedMarketItemId: 'market-001',
    })
  })

  it('normalizes a legacy certificates fallback category into collections', () => {
    expect(
      adaptProfileAssetDetailContent(
        {
          resourceId: 'asset-002',
          title: 'Fallback Asset',
          status: 'OWNED',
          payload: {
            categoryId: '' as 'collections',
            subCategory: '',
            acquiredAt: '',
            holdingsCount: 2,
            currency: 'USD',
            priceInCent: 250,
            editionCode: 'LTD',
            issueCount: 1,
            placeholderIconKey: 'box',
            visualTone: 'mist',
          },
        },
        'certificates' as 'collections'
      )
    ).toMatchObject({
      categoryId: 'collections',
      categoryLabel: '资产',
      categoryEnglishLabel: 'COLLECTION',
      priceUnit: '$',
    })
  })
})
