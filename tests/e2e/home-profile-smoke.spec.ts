import { expect, test } from '@playwright/test'

test('profile tab keeps core interactions stable', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  const profileRouteFragment = '/pages/home/index?tab=profile'

  const ensureProfileStable = async () => {
    await page.waitForFunction(
      (fragment) => window.location.hash.includes(fragment),
      profileRouteFragment
    )
    await expect(page.locator('.home-profile-panel')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.home-profile-header-title')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.home-profile-assets-title')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('.home-profile-asset-grid, .home-profile-empty-card')).toBeVisible({
      timeout: 15000,
    })
  }

  const assertRouteChangedFromProfile = async () => {
    await page.waitForFunction(
      (fragment) => !window.location.hash.includes(fragment),
      profileRouteFragment
    )
  }

  const goBackToProfile = async () => {
    await page.goto(`/#${profileRouteFragment}`)
    await ensureProfileStable()
  }

  await page.goto(`/#${profileRouteFragment}`)
  await ensureProfileStable()

  const categoryTags = page.locator('.home-profile-section-tag-entry')
  await expect(categoryTags.first()).toBeVisible()
  const categoryCount = await categoryTags.count()
  if (categoryCount > 1) {
    await categoryTags.nth(1).click()
    await categoryTags.first().click()
  } else {
    await categoryTags.first().click()
  }
  await expect(page.locator('.home-profile-asset-grid, .home-profile-empty-card')).toBeVisible()

  const subCategoryTags = page.locator('.home-profile-market-tag-entry')
  const subCategoryCount = await subCategoryTags.count()
  if (subCategoryCount > 0) {
    if (subCategoryCount > 1) {
      await subCategoryTags.nth(1).click()
      await subCategoryTags.first().click()
    } else {
      await subCategoryTags.first().click()
    }
  }
  await expect(page.locator('.home-profile-asset-grid, .home-profile-empty-card')).toBeVisible()

  const searchTrigger = page.locator('.home-profile-search-entry')
  await searchTrigger.click()
  const searchInput = page.locator('.home-profile-search-input input')
  await expect(searchInput).toBeVisible()
  await searchInput.fill('temporary')
  await searchInput.fill('钘忓搧')
  await expect(searchInput).toHaveValue('钘忓搧')
  await expect(page.locator('.home-profile-asset-grid, .home-profile-empty-card')).toBeVisible()

  const clearButton = page.locator('.home-profile-search-clear')
  if (await clearButton.count()) {
    await clearButton.click()
  } else {
    await searchInput.fill('')
  }
  await expect(searchInput).toHaveValue('')
  await expect(page.locator('.home-profile-asset-grid, .home-profile-empty-card')).toBeVisible()

  const assetAnchor = page.locator('#home-profile-assets-anchor')
  await expect(assetAnchor).toBeVisible()
  await page.locator('.home-profile-summary-card').first().click()
  await expect(assetAnchor).toBeVisible()
  await expect(page.locator('.home-profile-assets-title')).toBeVisible()

  const settingsEntry = page.locator('.home-profile-header-action').nth(1)
  await expect(settingsEntry).toBeVisible()
  await settingsEntry.click()
  await assertRouteChangedFromProfile()
  await goBackToProfile()

  const qrEntry = page.locator('.home-profile-qr-entry')
  await expect(qrEntry).toBeVisible()
  await qrEntry.click()
  await assertRouteChangedFromProfile()
  await goBackToProfile()

  const quickEntry = page.locator('.home-profile-quick-entry').first()
  await expect(quickEntry).toBeVisible()
  await quickEntry.click()
  await assertRouteChangedFromProfile()
  await goBackToProfile()

  const assetCards = page
    .locator('.home-profile-asset-entry')
    .filter({ hasNot: page.locator('.home-profile-asset-shell--placeholder') })
  const realAssetCount = await assetCards.count()
  if (realAssetCount > 0) {
    await assetCards.first().click()
    await assertRouteChangedFromProfile()
    await goBackToProfile()
  } else {
    await expect(page.locator('.home-profile-empty-card')).toBeVisible()
  }
  await expect(page.locator('.home-list-loading-footer.is-error')).toHaveCount(0)

  expect(pageErrors).toEqual([])
})
