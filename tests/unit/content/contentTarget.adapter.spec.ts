import { describe, expect, it } from 'vitest'
import { adaptContentTarget, cloneContentTargetRef } from '@/adapters/content/contentTarget.adapter'

describe('contentTarget adapter', () => {
  it('normalizes a generic target without mutating shape semantics', () => {
    expect(
      adaptContentTarget({
        targetType: 'market_item',
        targetId: 'item-001',
        provider: 'home',
      })
    ).toEqual({
      targetType: 'market_item',
      targetId: 'item-001',
      provider: 'home',
    })
  })

  it('normalizes a profile asset target with stable params', () => {
    expect(
      adaptContentTarget({
        targetType: 'profile_asset',
        targetId: 'asset-001',
        provider: 'profile',
        params: {
          category: 'collections',
          subCategory: 'Oil',
        },
      })
    ).toEqual({
      targetType: 'profile_asset',
      targetId: 'asset-001',
      provider: 'profile',
      params: {
        category: 'collections',
        subCategory: 'Oil',
      },
    })
  })

  it('clones refs without sharing nested profile params', () => {
    const original = {
      targetType: 'profile_asset' as const,
      targetId: 'asset-002',
      provider: 'profile',
      params: {
        category: 'blindBoxes' as const,
        subCategory: 'Rare',
      },
    }

    const cloned = cloneContentTargetRef(original)

    expect(cloned).toEqual(original)
    expect(cloned).not.toBe(original)
    expect(cloned?.targetType).toBe('profile_asset')
    if (cloned?.targetType === 'profile_asset') {
      expect(cloned.params).not.toBe(original.params)
    }
  })
})
