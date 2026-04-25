import { expect, test } from '@playwright/test'

type HomeTab = 'home' | 'activity' | 'profile'

test('trackstage keeps tab switching and profile anchor chain stable', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  await page.setViewportSize({ width: 390, height: 844 })

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
      await expect(tabbarItems.nth(resolveTabIndex(tab))).toHaveClass(/is-active/)
      return
    }

    await fallbackReloadToTab(tab)
  }

  const ensureHomeVisible = async () => {
    await expect(page.locator('.home-track-panel-stage')).toBeVisible()
    await expect(page.locator('.home-topbar')).toBeVisible()
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

  const openDrawer = async () => {
    await expect(page.locator('.home-topbar-menu-entry')).toBeVisible()
    await page.locator('.home-topbar-menu-entry').click()
    await expect(page.locator('.home-shell-drawer-mask.is-open')).toBeVisible()
    await expect(page.locator('.home-shell-side-drawer.is-open')).toBeVisible()
    await expect(page.locator('.home-shell-drawer-panel')).toBeVisible()
  }

  const closeDrawerByCloseEntry = async () => {
    await page.locator('.home-shell-drawer-close-entry').click()
    await expect(page.locator('.home-shell-side-drawer.is-open')).toHaveCount(0)
    await expect(page.locator('.home-shell-drawer-mask.is-open')).toHaveCount(0)
  }

  const closeDrawerByMask = async () => {
    await page.locator('.home-shell-drawer-mask').click({ position: { x: 12, y: 12 } })
    await expect(page.locator('.home-shell-side-drawer.is-open')).toHaveCount(0)
    await expect(page.locator('.home-shell-drawer-mask.is-open')).toHaveCount(0)
  }

  const assertProfileAnchorChain = async () => {
    const profileAssetsAnchor = page.locator('#home-profile-assets-anchor')
    const profileSummaryCard = page.locator('.home-profile-summary-card').first()

    await expect(profileSummaryCard).toBeVisible()
    await expect(profileAssetsAnchor).toBeVisible()
    await profileSummaryCard.click()
    await expect(profileAssetsAnchor).toBeVisible()
    await expect(page.locator('.home-profile-assets-title')).toBeVisible()
  }

  await page.goto('/#/pages/home/index')
  await ensureHomeVisible()
  await openDrawer()
  await closeDrawerByCloseEntry()
  await openDrawer()
  await closeDrawerByMask()

  await switchTab('activity')
  await ensureActivityVisible()

  await switchTab('profile')
  await ensureProfileVisible()
  await assertProfileAnchorChain()

  await switchTab('home')
  await ensureHomeVisible()

  await switchTab('profile')
  await ensureProfileVisible()
  await assertProfileAnchorChain()

  expect(pageErrors).toEqual([])
})
