import { describe, expect, it } from 'vitest'
import {
  buildHomeMarketWindowDiff,
  buildVisibleHomeMarketCollection,
  isSameHomeMarketCollection,
  resolveNextHomeMarketVisibleCount,
} from '@/pages/home/composables/home/homeMarketResultWindowProjection'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string): HomeMarketCard =>
  ({
    id,
    name: `card-${id}`,
    price: '100',
    priceUnit: 'CNY',
    imageUrl: `https://cdn.example.com/${id}.png`,
  }) as HomeMarketCard

describe('homeMarketResultWindowProjection', () => {
  it('compares collections by ordered ids', () => {
    expect(isSameHomeMarketCollection([createCard('a')], [createCard('a')])).toBe(true)
    expect(isSameHomeMarketCollection([createCard('a')], [createCard('b')])).toBe(false)
    expect(
      isSameHomeMarketCollection(
        [createCard('a'), createCard('b')],
        [createCard('b'), createCard('a')]
      )
    ).toBe(false)
  })

  it('builds the visible collection with the requested count', () => {
    expect(
      buildVisibleHomeMarketCollection([createCard('a'), createCard('b'), createCard('c')], 2).map(
        (item) => item.id
      )
    ).toEqual(['a', 'b'])
  })

  it('builds a result-window diff against the visible slice', () => {
    const diff = buildHomeMarketWindowDiff({
      displayedCollection: [createCard('a')],
      nextCollection: [createCard('a'), createCard('b'), createCard('c')],
      visibleCount: 2,
    })

    expect(diff.nextWindow.map((item) => item.id)).toEqual(['a', 'b'])
    expect(Array.from(diff.addedIds)).toEqual(['b'])
  })

  it('resolves the next visible count with or without preserve mode', () => {
    expect(
      resolveNextHomeMarketVisibleCount({
        currentVisibleCount: 6,
        nextCollectionLength: 3,
        initialVisibleCount: 8,
        preserveVisibleCount: true,
      })
    ).toBe(3)

    expect(
      resolveNextHomeMarketVisibleCount({
        currentVisibleCount: 6,
        nextCollectionLength: 10,
        initialVisibleCount: 4,
      })
    ).toBe(4)
  })
})
