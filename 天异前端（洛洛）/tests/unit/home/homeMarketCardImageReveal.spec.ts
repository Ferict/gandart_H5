import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { resolveHomeMarketCardImageCachePolicy } from '@/components/homeMarketCardImageReveal.cachePolicy'

const resolveImageRevealSfc = () =>
  path.resolve(process.cwd(), 'src/components/HomeMarketCardImageReveal.vue')
const resolveProfilePanelSfc = () =>
  path.resolve(process.cwd(), 'src/pages/home/components/HomeRailProfilePanel.vue')
const resolveProfileAssetCardShellSfc = () =>
  path.resolve(process.cwd(), 'src/pages/home/components/profile/HomeRailProfileAssetCardShell.vue')

describe('HomeMarketCardImageReveal fallback presentation', () => {
  it('disables local cache when required-user policy has no user scope', () => {
    expect(
      resolveHomeMarketCardImageCachePolicy({
        enablePersistentLocalCache: true,
        cacheScopePolicy: 'required-user',
      })
    ).toEqual({
      canUsePersistentLocalCache: false,
      normalizedUserScope: undefined,
    })
  })

  it('keeps local cache enabled when required-user policy receives a user scope', () => {
    expect(
      resolveHomeMarketCardImageCachePolicy({
        enablePersistentLocalCache: true,
        cacheScopePolicy: 'required-user',
        imageCacheUserScope: ' 0xAbC ',
      })
    ).toEqual({
      canUsePersistentLocalCache: true,
      normalizedUserScope: '0xAbC',
    })
  })

  it('keeps public mode behavior unchanged without an explicit user scope', () => {
    expect(
      resolveHomeMarketCardImageCachePolicy({
        enablePersistentLocalCache: true,
        cacheScopePolicy: 'public',
      })
    ).toEqual({
      canUsePersistentLocalCache: true,
      normalizedUserScope: undefined,
    })
  })

  it('keeps profile assets on required-user cache policy', () => {
    const panelSource = fs.readFileSync(resolveProfilePanelSfc(), 'utf8')
    const assetCardShellSource = fs.readFileSync(resolveProfileAssetCardShellSfc(), 'utf8')

    expect(panelSource).toContain(':profile-image-cache-user-scope="profileImageCacheUserScope"')
    expect(assetCardShellSource).toContain('cache-scope-policy="required-user"')
    expect(assetCardShellSource).toContain(
      ':image-cache-user-scope="resolvedProfileImageCacheUserScope"'
    )
  })

  it('keeps fallback text contract in component template', () => {
    const source = fs.readFileSync(resolveImageRevealSfc(), 'utf8')

    expect(source).toContain('home-market-card-fallback-text')
    expect(source).toContain('fallbackText')
  })

  it('uses 14px font size and 18px line-height for fallback text token', () => {
    const source = fs.readFileSync(resolveImageRevealSfc(), 'utf8')

    expect(source).toMatch(/\.home-market-card-fallback-text[\s\S]*font-size:\s*14px;/)
    expect(source).toMatch(/\.home-market-card-fallback-text[\s\S]*line-height:\s*18px;/)
  })
})
