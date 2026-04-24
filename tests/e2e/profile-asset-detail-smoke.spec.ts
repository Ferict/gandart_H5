import { expect, test } from '@playwright/test'

test('profile asset detail remains stable on page-open and back', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  await page.setViewportSize({ width: 390, height: 844 })

  const detailRouteFragment = '/pages/profile-asset-detail/index?itemId=C-04&category=collections'
  const profileRouteFragment = '/pages/home/index?tab=profile'

  const ensureDetailStable = async (expectedTitle?: string) => {
    await page.waitForFunction(
      (fragment) => window.location.hash.includes(fragment),
      '/pages/profile-asset-detail/index'
    )
    await expect(page.locator('.secondary-page-frame')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.secondary-page-frame-topbar-shell')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.locator('.secondary-page-frame-content')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.secondary-page-topbar-title')).toHaveText('藏品详情', {
      timeout: 15000,
    })
    await expect(page.locator('.hero-card')).toBeVisible({ timeout: 15000 })
    if (expectedTitle) {
      await expect(page.locator('.value-card-title')).toHaveText(expectedTitle, { timeout: 15000 })
    }
    await expect(page.locator('.value-card')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.card-provenance')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.card-traits')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.card-description')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.secondary-page-frame-action-rail')).toBeVisible({
      timeout: 15000,
    })
    await expect(page.locator('.action-primary')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.action-primary-text')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.provenance-row')).toHaveCount(4, { timeout: 15000 })
    await expect(page.locator('.trait-item').first()).toBeVisible({ timeout: 15000 })
    await expect
      .poll(async () => page.locator('.trait-item').count(), {
        message: 'expected at least one visible trait item in detail traits card',
      })
      .toBeGreaterThan(0)
    await expect(page.locator('.desc')).toBeVisible({ timeout: 15000 })
  }

  const ensureProfileStable = async () => {
    await page.waitForFunction(
      (fragment) => window.location.hash.includes(fragment),
      profileRouteFragment
    )
    await expect(page.locator('.home-profile-panel')).toBeVisible()
    await expect(page.locator('.home-profile-asset-grid, .home-profile-empty-card')).toBeVisible()
  }

  await page.goto(`/#${detailRouteFragment}&source=e2e-smoke`)
  await ensureDetailStable('裂彩奔影')

  await page.locator('.secondary-page-topbar-hit').first().click()
  await page.waitForFunction(
    (fragment) => !window.location.hash.includes(fragment),
    '/pages/profile-asset-detail/index'
  )

  await page.goto(`/#${profileRouteFragment}`)
  await ensureProfileStable()

  const availableAssetCards = page
    .locator('.home-profile-asset-entry')
    .filter({ hasNot: page.locator('.home-profile-asset-shell--placeholder') })
  if ((await availableAssetCards.count()) > 0) {
    await availableAssetCards.first().click()
    await ensureDetailStable()
    await page.locator('.secondary-page-topbar-hit').first().click()
    await page.waitForFunction(
      (fragment) => !window.location.hash.includes(fragment),
      '/pages/profile-asset-detail/index'
    )
  }

  await page.goto(`/#${detailRouteFragment}&source=e2e-smoke-return`)
  await ensureDetailStable('裂彩奔影')
  await page.locator('.secondary-page-topbar-hit').first().click()
  await page.waitForFunction(
    (fragment) => !window.location.hash.includes(fragment),
    '/pages/profile-asset-detail/index'
  )
  await page.goto(`/#${detailRouteFragment}&source=e2e-smoke-stability`)
  await ensureDetailStable('裂彩奔影')

  expect(pageErrors).toEqual([])
})
