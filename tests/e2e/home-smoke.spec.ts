import { expect, test } from '@playwright/test'

test('home 页面能正常渲染关键内容并保持市场交互稳定', async ({ page }) => {
  const pageErrors: string[] = []

  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  await page.goto('/#/pages/home/index')
  await page.waitForFunction(
    (fragment) => window.location.hash.includes(fragment),
    '/pages/home/index'
  )
  await expect(page.locator('.home-panel')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-banner-carousel')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-banner-entry').first()).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-notice-hit')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-notice-bar')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-notice-title').first()).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-featured-layout')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-featured-info-card')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-featured-visual')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-market-results-stage')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('公告：')).toBeVisible({ timeout: 15000 })
  await expect(page.getByText('藏品市场')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('img[src*="tianyi.svg"]').first()).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-track-bottom-capsule')).toHaveCount(0)
  const marketTags = page.locator('.home-market-tag-entry')
  const tagCount = await marketTags.count()
  expect(tagCount).toBeGreaterThan(1)
  await marketTags.nth(1).click()
  if (tagCount > 2) {
    await marketTags.nth(2).click()
    await marketTags.first().click()
  } else {
    await marketTags.first().click()
  }

  const marketCardsAfterTagSwitch = page.locator('.home-market-card-name')
  await expect(marketCardsAfterTagSwitch.first()).toBeVisible()
  const keyword = (await marketCardsAfterTagSwitch.first().textContent())?.trim()
  expect(keyword).toBeTruthy()

  const marketSearchTrigger = page.locator('.home-market-action-entry').first()
  await marketSearchTrigger.click()
  const marketSearchInput = page.locator('.home-market-search-input input')
  await expect(marketSearchInput).toBeVisible()
  await marketSearchInput.fill('temporary')
  await marketSearchInput.fill(keyword as string)
  await expect(marketSearchInput).toHaveValue(keyword as string)
  await expect
    .poll(async () => marketCardsAfterTagSwitch.count(), {
      message: 'expected market cards to remain visible after debounced keyword input',
    })
    .toBeGreaterThan(0)
  await expect(page.locator('.home-market-card-name').first()).toBeVisible()

  const marketSortTrigger = page.locator('.home-market-sort-trigger')
  await marketSortTrigger.click()
  const marketSortOptions = page.locator('.home-market-sort-option')
  const sortOptionCount = await marketSortOptions.count()
  expect(sortOptionCount).toBeGreaterThan(1)
  await marketSortOptions.nth(1).click()
  if (sortOptionCount > 2) {
    await marketSortTrigger.click()
    await marketSortOptions.nth(2).click()
  }
  await expect
    .poll(async () => marketCardsAfterTagSwitch.count(), {
      message: 'expected market cards to stay rendered after throttled sort switching',
    })
    .toBeGreaterThan(0)
  await expect(page.locator('.home-market-card-name').first()).toBeVisible()
  await expect(page.locator('.home-market-results-stage')).toBeVisible()
  await expect(page.locator('.home-list-loading-footer.is-error')).toHaveCount(0)

  expect(pageErrors).toEqual([])
})
