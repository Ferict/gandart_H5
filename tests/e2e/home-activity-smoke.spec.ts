import { expect, test } from '@playwright/test'

test('activity tab keeps core interactions stable', async ({ page }) => {
  const pageErrors: string[] = []
  page.on('pageerror', (error) => {
    pageErrors.push(error.message)
  })

  const activityRouteFragment = '/pages/home/index?tab=activity'
  const noticeCards = page.locator(
    '.home-activity-notice-entry:not(.is-placeholder):not(.is-removed-overlay)'
  )

  const ensureRealNoticeCards = async () => {
    await expect
      .poll(async () => noticeCards.count(), {
        message: 'expected activity page to render at least one real notice card',
      })
      .toBeGreaterThan(0)
  }

  const ensureActivityStable = async () => {
    await page.waitForFunction(
      (fragment) => window.location.hash.includes(fragment),
      activityRouteFragment
    )
    await expect(page.locator('.home-activity-panel')).toBeVisible()
    await expect(page.locator('.home-activity-header-title')).toBeVisible()
    await expect(page.locator('.home-activity-section-head')).toBeVisible()
    await expect(page.locator('.home-activity-section-title')).toBeVisible()
    await expect(page.locator('.home-activity-notice-list')).toBeVisible()
    await ensureRealNoticeCards()
    await expect(noticeCards.first().locator('.home-activity-notice-title-row')).toBeVisible()
    await expect(noticeCards.first().locator('.home-activity-notice-meta')).toBeVisible()
  }

  const assertRouteChangedFromActivity = async () => {
    await page.waitForFunction(
      (fragment) => !window.location.hash.includes(fragment),
      activityRouteFragment
    )
  }

  const goBackToActivity = async () => {
    await page.goto(`/#${activityRouteFragment}`)
    await ensureActivityStable()
  }

  await page.goto(`/#${activityRouteFragment}`)
  await ensureActivityStable()

  const noticeTags = page.locator('.home-activity-tag-entry')
  await expect(noticeTags.first()).toBeVisible()
  const tagCount = await noticeTags.count()
  if (tagCount > 1) {
    await noticeTags.nth(1).click()
    if (tagCount > 2) {
      await noticeTags.nth(2).click()
    } else {
      await noticeTags.first().click()
    }
  } else {
    await noticeTags.first().click()
  }
  await ensureRealNoticeCards()
  await expect(page.locator('.home-activity-notice-empty-state:not(.is-error)')).toHaveCount(0)
  await expect(page.locator('.home-activity-notice-list')).toBeVisible()

  const searchTrigger = page.locator('.home-activity-section-action-entry').first()
  await searchTrigger.click()
  const searchInput = page.locator('.home-activity-notice-search-input input')
  await expect(searchInput).toBeVisible()
  await searchInput.fill('temporary')
  await searchInput.fill('notice')
  await expect(searchInput).toHaveValue('notice')

  const clearButton = page.locator('.home-activity-notice-search-clear')
  if (await clearButton.count()) {
    await clearButton.click()
  } else {
    await searchInput.fill('')
  }
  await expect(searchInput).toHaveValue('')
  await ensureRealNoticeCards()
  await expect(page.locator('.home-activity-notice-empty-state:not(.is-error)')).toHaveCount(0)

  if (tagCount > 2) {
    await noticeTags.nth(1).click()
    await noticeTags.nth(2).click()
    await noticeTags.first().click()
    await ensureRealNoticeCards()
    await expect(page.locator('.home-activity-notice-empty-state:not(.is-error)')).toHaveCount(0)
  }

  const activityFooter = page.locator('.home-list-loading-footer')
  if (await activityFooter.count()) {
    await expect(activityFooter.first()).toBeVisible()
  }
  await expect(page.locator('.home-list-loading-footer.is-error')).toHaveCount(0)

  await expect(page.locator('.home-activity-filter-mask')).toHaveCount(0)
  await expect(page.locator('.home-activity-filter-bottom-sheet')).toHaveCount(0)

  const activityEntries = page.locator('.home-activity-entry')
  const entryCount = await activityEntries.count()
  expect(entryCount).toBeGreaterThanOrEqual(3)
  for (let index = 0; index < Math.min(entryCount, 3); index += 1) {
    await activityEntries.nth(index).click()
    await assertRouteChangedFromActivity()
    await goBackToActivity()
  }

  const noticeCount = await noticeCards.count()
  expect(noticeCount).toBeGreaterThan(0)

  const firstNoticeCard = noticeCards.first()
  await expect(firstNoticeCard).toBeVisible()
  const firstNoticeIconWrap = firstNoticeCard.locator('.home-activity-notice-icon-wrap')
  await expect(firstNoticeIconWrap).toBeVisible()
  const firstNoticeIconBox = await firstNoticeIconWrap.boundingBox()
  expect(firstNoticeIconBox).not.toBeNull()
  if (!firstNoticeIconBox) {
    throw new Error('Expected first activity notice icon wrap bounding box to exist')
  }
  expect(firstNoticeIconBox.width).toBeGreaterThanOrEqual(48)
  expect(firstNoticeIconBox.height).toBeGreaterThanOrEqual(48)
  await expect(firstNoticeCard.locator('.home-activity-notice-title')).toBeVisible()
  await expect(firstNoticeCard.locator('.home-activity-notice-title-row')).toBeVisible()
  await expect(firstNoticeCard.locator('.home-activity-notice-meta')).toBeVisible()

  await noticeCards.first().click()
  await assertRouteChangedFromActivity()
  await goBackToActivity()

  expect(pageErrors).toEqual([])
})
