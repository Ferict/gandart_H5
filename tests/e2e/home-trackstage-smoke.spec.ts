import { expect, test } from '@playwright/test'

type HomeTab = 'home' | 'activity' | 'profile'

test('trackstage keeps tab switching and profile anchor chain stable', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  const fallbackReloadToTab = async (tab: HomeTab) => {
    await page.goto('about:blank')
    const route = tab === 'home' ? '/#/pages/home/index' : `/#/pages/home/index?tab=${tab}`
    await page.goto(route)
  }

  const resolveTabIndex = (tab: HomeTab) => {
    if (tab === 'home') {
      return 0
    }
    if (tab === 'activity') {
      return 1
    }
    return 2
  }

  const switchTab = async (tab: HomeTab) => {
    const tabbarItems = page.locator('.home-shell-tabbar-item')
    const tabbarCount = await tabbarItems.count()
    if (tabbarCount >= 3) {
      await tabbarItems.nth(resolveTabIndex(tab)).click()
      return
    }

    await fallbackReloadToTab(tab)
  }

  const ensureHomeVisible = async () => {
    await expect(page.locator('.home-track-panel-stage')).toBeVisible()
    await expect(page.locator('.home-market-results-stage')).toBeVisible()
  }

  const ensureActivityVisible = async () => {
    await expect(page.locator('.home-track-panel-stage')).toBeVisible()
    await expect(page.locator('.home-activity-panel')).toBeVisible()
    await expect(
      page.locator('.home-activity-notice-entry, .home-activity-notice-empty-state').first()
    ).toBeVisible()
  }

  const ensureProfileVisible = async () => {
    await expect(page.locator('.home-track-panel-stage')).toBeVisible()
    await expect(page.locator('.home-profile-panel')).toBeVisible()
    await expect(page.locator('.home-profile-assets-title')).toBeVisible()
  }

  await page.goto('/#/pages/home/index')
  await ensureHomeVisible()

  await switchTab('activity')
  await ensureActivityVisible()

  await switchTab('profile')
  await ensureProfileVisible()

  const profileAssetsAnchor = page.locator('#home-profile-assets-anchor')
  await expect(profileAssetsAnchor).toBeVisible()
  await page.locator('.home-profile-summary-card').first().click()
  await expect(profileAssetsAnchor).toBeVisible()
  await expect(page.locator('.home-profile-assets-title')).toBeVisible()

  await switchTab('home')
  await ensureHomeVisible()

  expect(pageErrors).toEqual([])
})
