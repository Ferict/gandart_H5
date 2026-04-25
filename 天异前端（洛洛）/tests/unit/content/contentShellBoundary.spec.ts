import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { createContentResourceDetailShell } from '@/services/content/contentResourceDetail.service'
import { createProfileAssetDetailShell } from '@/services/profile-asset-detail/profileAssetDetailContent.service'

const resolveSourcePath = (relativePath: string) => path.resolve(process.cwd(), relativePath)

describe('content shell boundary', () => {
  it('keeps detail shell services away from direct content.mock imports', () => {
    const contentResourceSource = fs.readFileSync(
      resolveSourcePath('src/services/content/contentResourceDetail.service.ts'),
      'utf8'
    )
    const profileAssetSource = fs.readFileSync(
      resolveSourcePath('src/services/profile-asset-detail/profileAssetDetailContent.service.ts'),
      'utf8'
    )

    expect(contentResourceSource).not.toContain('createContentResourceSnapshot')
    expect(contentResourceSource).not.toContain("from '../../implementations/content.mock'")
    expect(profileAssetSource).not.toContain('createContentResourceSnapshot')
    expect(profileAssetSource).not.toContain("from '../../implementations/content.mock'")
  })

  it('builds resource detail shells from local minimal fallback data only', () => {
    expect(createContentResourceDetailShell('market_item', 'market-item-123')).toMatchObject({
      resourceType: 'market_item',
      resourceId: 'market-item-123',
      title: 'market-item-123',
      priceValue: '0',
      imageUrl: '',
    })
    expect(createContentResourceDetailShell('activity', 'activity-123')).toMatchObject({
      resourceType: 'activity',
      resourceId: 'activity-123',
      title: 'activity-123',
      priceValue: 'LIVE',
      imageUrl: '',
    })
  })

  it('builds profile asset detail shells from local fallback payload only', () => {
    expect(createProfileAssetDetailShell('asset-123', 'collections')).toMatchObject({
      id: 'asset-123',
      title: 'asset-123',
      categoryId: 'collections',
      holdingsCount: 1,
      price: 0,
      imageUrl: '',
    })
  })
})
