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
  await expect(page.locator('.home-market-kind-indicator')).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-market-title')).toHaveText('藏品市场', { timeout: 15000 })
  await expect(page.locator('.home-market-subtitle')).toHaveText(/MARKET FLOW/i, {
    timeout: 15000,
  })
  await page.locator('.home-market-kind-option').nth(1).click()
  await expect(page.locator('.home-market-title')).toHaveText('盲盒市场', { timeout: 15000 })
  await expect(page.locator('.home-market-subtitle')).toHaveText('BLIND BOX', {
    timeout: 15000,
  })
  await page.locator('.home-market-kind-option').first().click()
  await expect(page.locator('.home-market-title')).toHaveText('藏品市场', { timeout: 15000 })
  await expect(page.locator('.home-market-action-entry')).toBeVisible({ timeout: 15000 })
  const stickyHeaderMetricsBeforeScroll = await page.evaluate(() => {
    const header = document.querySelector('.home-market-sticky-header')

    if (!header) {
      return null
    }

    const headerStyle = window.getComputedStyle(header)
    const dividerStyle = window.getComputedStyle(header, '::after')
    const headerRect = header.getBoundingClientRect()

    return {
      className: header.className,
      headerTop: headerRect.top,
      dividerOpacity: dividerStyle.opacity,
      dividerHeight: dividerStyle.height,
      dividerBackground: dividerStyle.backgroundColor,
      boxShadow: headerStyle.boxShadow,
    }
  })

  expect(stickyHeaderMetricsBeforeScroll).not.toBeNull()
  expect(stickyHeaderMetricsBeforeScroll?.className).not.toContain('is-stuck')
  expect(stickyHeaderMetricsBeforeScroll?.headerTop).toBeGreaterThan(0)
  expect(Number.parseFloat(stickyHeaderMetricsBeforeScroll?.dividerOpacity ?? '1')).toBeLessThan(
    0.1
  )
  expect(stickyHeaderMetricsBeforeScroll?.dividerHeight).toBe('1px')
  expect(stickyHeaderMetricsBeforeScroll?.dividerBackground).toBe('rgb(220, 230, 239)')
  expect(stickyHeaderMetricsBeforeScroll?.boxShadow).toBe('none')
  await page.mouse.wheel(0, 1400)
  await page.waitForTimeout(360)
  const stickyHeaderMetricsAfterScroll = await page.evaluate(() => {
    const header = document.querySelector('.home-market-sticky-header')

    if (!header) {
      return null
    }

    const dividerStyle = window.getComputedStyle(header, '::after')
    const headerRect = header.getBoundingClientRect()

    return {
      className: header.className,
      headerTop: headerRect.top,
      dividerOpacity: dividerStyle.opacity,
    }
  })

  expect(stickyHeaderMetricsAfterScroll).not.toBeNull()
  expect(stickyHeaderMetricsAfterScroll?.className).toContain('is-stuck')
  expect(stickyHeaderMetricsAfterScroll?.headerTop).toBeLessThanOrEqual(1)
  expect(Number.parseFloat(stickyHeaderMetricsAfterScroll?.dividerOpacity ?? '0')).toBeGreaterThan(
    0.9
  )
  const marketTagOverlayMetrics = await page.evaluate(() => {
    const wrap = document.querySelector('.home-market-tag-wrap')
    const viewport = document.querySelector(
      '.home-market-tag-tabs .u-tabs__wrapper__scroll-view-wrapper'
    )
    const overlay = document.querySelector('.home-market-action-overlay')
    const action = document.querySelector('.home-market-action-entry')

    if (!wrap || !viewport || !overlay || !action) {
      return null
    }

    const wrapRect = wrap.getBoundingClientRect()
    const viewportRect = viewport.getBoundingClientRect()
    const overlayRect = overlay.getBoundingClientRect()
    const actionRect = action.getBoundingClientRect()

    return {
      wrapLeft: wrapRect.left,
      wrapRight: wrapRect.right,
      wrapWidth: wrapRect.width,
      viewportLeft: viewportRect.left,
      viewportRight: viewportRect.right,
      viewportWidth: viewportRect.width,
      overlayLeft: overlayRect.left,
      overlayRight: overlayRect.right,
      actionLeft: actionRect.left,
      actionRight: actionRect.right,
    }
  })

  expect(marketTagOverlayMetrics).not.toBeNull()
  expect(marketTagOverlayMetrics?.viewportWidth).toBeGreaterThan(
    (marketTagOverlayMetrics?.wrapWidth ?? 0) - 4
  )
  expect(
    Math.abs(
      (marketTagOverlayMetrics?.overlayRight ?? 0) - (marketTagOverlayMetrics?.wrapRight ?? 0)
    )
  ).toBeLessThanOrEqual(2)
  expect(marketTagOverlayMetrics?.overlayLeft).toBeLessThan(
    marketTagOverlayMetrics?.viewportRight ?? 0
  )
  expect(marketTagOverlayMetrics?.actionLeft).toBeLessThan(
    marketTagOverlayMetrics?.viewportRight ?? 0
  )
  const marketTagInternalLayoutMetrics = await page.evaluate(() => {
    const wrap = document.querySelector('.home-market-tag-wrap')
    const nav = document.querySelector('.home-market-tag-tabs .u-tabs__wrapper__nav')
    const firstItem = document.querySelector('.home-market-tag-tabs .u-tabs__wrapper__nav__item')
    const firstPill = firstItem?.querySelector('.home-market-tag-pill')
    const firstText = firstItem?.querySelector('.home-market-tag-text')
    const items = Array.from(
      document.querySelectorAll('.home-market-tag-tabs .u-tabs__wrapper__nav__item')
    )
    const lastItem = items.at(-1)
    const overlay = document.querySelector('.home-market-action-overlay')
    const fade = document.querySelector('.home-market-tag-fade-right')
    const nativeScroll = document.querySelector(
      '.home-market-tag-tabs .u-tabs__wrapper__scroll-view .uni-scroll-view-scrollbar-hidden'
    )

    if (
      !wrap ||
      !nav ||
      !firstItem ||
      !firstPill ||
      !firstText ||
      !lastItem ||
      !overlay ||
      !fade ||
      !nativeScroll
    ) {
      return null
    }

    const wrapStyle = window.getComputedStyle(wrap)
    const wrapRect = wrap.getBoundingClientRect()
    const firstPillRect = firstPill.getBoundingClientRect()
    const firstTextRect = firstText.getBoundingClientRect()
    const overlayRect = overlay.getBoundingClientRect()
    const inlinePadding =
      Number.parseFloat(wrapStyle.getPropertyValue('--home-page-inline-padding')) || 16
    const overlayWidthVar = Number.parseFloat(
      wrapStyle.getPropertyValue('--home-market-action-overlay-width')
    )
    const reserveWidthVar = Number.parseFloat(
      wrapStyle.getPropertyValue('--home-market-action-reserve-width')
    )
    const fadeStyle = window.getComputedStyle(fade)
    const navStyle = window.getComputedStyle(nav)
    const firstItemStyle = window.getComputedStyle(firstItem)
    const lastItemStyle = window.getComputedStyle(lastItem)

    return {
      contentLeft: wrapRect.left + inlinePadding,
      firstPillLeft: firstPillRect.left,
      firstPillRight: firstPillRect.right,
      firstPillCenter: firstPillRect.left + firstPillRect.width / 2,
      firstTextLeft: firstTextRect.left,
      firstTextRight: firstTextRect.right,
      firstTextCenter: firstTextRect.left + firstTextRect.width / 2,
      overlayWidth: overlayRect.width,
      overlayWidthVar,
      reserveWidthVar,
      fadeClass: fade.className,
      fadeOpacity: fadeStyle.opacity,
      nativeScrollLeft: nativeScroll.scrollLeft,
      nativeClientWidth: nativeScroll.clientWidth,
      nativeScrollWidth: nativeScroll.scrollWidth,
      navPaddingLeft: navStyle.paddingLeft,
      navPaddingRight: navStyle.paddingRight,
      firstItemPaddingLeft: firstItemStyle.paddingLeft,
      firstItemMarginRight: firstItemStyle.marginRight,
      firstItemPaddingRight: firstItemStyle.paddingRight,
      lastItemPaddingRight: lastItemStyle.paddingRight,
    }
  })

  expect(marketTagInternalLayoutMetrics).not.toBeNull()
  expect(marketTagInternalLayoutMetrics?.firstPillLeft).toBeGreaterThanOrEqual(
    (marketTagInternalLayoutMetrics?.contentLeft ?? 0) - 1
  )
  expect(
    Math.abs(
      (marketTagInternalLayoutMetrics?.firstTextCenter ?? 0) -
        (marketTagInternalLayoutMetrics?.firstPillCenter ?? 0)
    )
  ).toBeLessThanOrEqual(1)
  expect(
    (marketTagInternalLayoutMetrics?.firstTextLeft ?? 0) -
      (marketTagInternalLayoutMetrics?.firstPillLeft ?? 0)
  ).toBeGreaterThanOrEqual(10)
  expect(
    (marketTagInternalLayoutMetrics?.firstPillRight ?? 0) -
      (marketTagInternalLayoutMetrics?.firstTextRight ?? 0)
  ).toBeGreaterThanOrEqual(10)
  expect(marketTagInternalLayoutMetrics?.navPaddingLeft).toBe('0px')
  expect(marketTagInternalLayoutMetrics?.navPaddingRight).toBe('0px')
  expect(marketTagInternalLayoutMetrics?.firstItemMarginRight).toBe('0px')
  expect(
    Number.parseFloat(marketTagInternalLayoutMetrics?.firstItemPaddingLeft ?? '0')
  ).toBeGreaterThan(Number.parseFloat(marketTagInternalLayoutMetrics?.firstItemPaddingRight ?? '0'))
  expect(marketTagInternalLayoutMetrics?.overlayWidthVar).toBe(96)
  expect(marketTagInternalLayoutMetrics?.reserveWidthVar).toBe(52)
  expect(marketTagInternalLayoutMetrics?.overlayWidth).toBeCloseTo(96, 0)
  expect(
    Number.parseFloat(marketTagInternalLayoutMetrics?.lastItemPaddingRight ?? '0')
  ).toBeCloseTo(marketTagInternalLayoutMetrics?.reserveWidthVar ?? 0, 0)
  if (
    (marketTagInternalLayoutMetrics?.nativeScrollWidth ?? 0) >
    (marketTagInternalLayoutMetrics?.nativeClientWidth ?? 0) + 2
  ) {
    expect(marketTagInternalLayoutMetrics?.fadeClass).toContain('is-visible')
    expect(Number.parseFloat(marketTagInternalLayoutMetrics?.fadeOpacity ?? '0')).toBeGreaterThan(
      0.9
    )
  }
  await expect(page.locator('img[src*="tianyi.svg"]').first()).toBeVisible({ timeout: 15000 })
  await expect(page.locator('.home-track-bottom-capsule')).toHaveCount(0)
  const marketTabs = page.locator('.home-market-tag-tabs .u-tabs__wrapper__nav__item')
  const marketTags = marketTabs
  const tagCount = await marketTags.count()
  expect(tagCount).toBeGreaterThan(1)
  await marketTags.nth(1).click()
  if (tagCount > 2) {
    const rightLeaningTagIndex = Math.max(1, tagCount - 2)
    await marketTags.nth(rightLeaningTagIndex).click()
    await expect(marketTags.nth(rightLeaningTagIndex)).toHaveClass(
      /u-tabs__wrapper__nav__item-active/
    )
    await page.waitForTimeout(360)
    const centeredTagMetrics = await page.evaluate(() => {
      const viewport = document.querySelector(
        '.home-market-tag-tabs .u-tabs__wrapper__scroll-view-wrapper'
      )
      const active = document.querySelector(
        '.home-market-tag-tabs .u-tabs__wrapper__nav__item-active'
      )
      const viewportRect = viewport?.getBoundingClientRect()
      const activeRect = active?.getBoundingClientRect()

      if (!viewportRect || !activeRect) {
        return null
      }

      return {
        activeCenter: activeRect.left + activeRect.width / 2,
        viewportLeft: viewportRect.left,
        viewportRight: viewportRect.right,
        viewportWidth: viewportRect.width,
        viewportScrollWidth: viewport.scrollWidth,
      }
    })

    expect(centeredTagMetrics).not.toBeNull()
    const hasHorizontalOverflow =
      (centeredTagMetrics?.viewportScrollWidth ?? 0) > (centeredTagMetrics?.viewportWidth ?? 0) + 1

    if (hasHorizontalOverflow) {
      expect(centeredTagMetrics?.activeCenter).toBeGreaterThan(
        (centeredTagMetrics?.viewportLeft ?? 0) + (centeredTagMetrics?.viewportWidth ?? 0) * 0.25
      )
      expect(centeredTagMetrics?.activeCenter).toBeLessThan(
        (centeredTagMetrics?.viewportLeft ?? 0) + (centeredTagMetrics?.viewportWidth ?? 0) * 0.75
      )
    } else {
      expect(centeredTagMetrics?.activeCenter).toBeGreaterThan(
        centeredTagMetrics?.viewportLeft ?? 0
      )
      expect(centeredTagMetrics?.activeCenter).toBeLessThan(centeredTagMetrics?.viewportRight ?? 0)
    }
    await marketTags.nth(tagCount - 1).click()
    await expect(marketTags.nth(tagCount - 1)).toHaveClass(/u-tabs__wrapper__nav__item-active/)
    await page.waitForTimeout(360)
    const lastTagMetrics = await page.evaluate(() => {
      const active = document.querySelector(
        '.home-market-tag-tabs .u-tabs__wrapper__nav__item-active'
      )
      const overlay = document.querySelector('.home-market-action-overlay')
      const action = document.querySelector('.home-market-action-entry')
      const fade = document.querySelector('.home-market-tag-fade-right')
      const activePill = active?.querySelector('.home-market-tag-pill')
      const activeText = active?.querySelector('.home-market-tag-text')
      const activePillRect = activePill?.getBoundingClientRect()
      const activeTextRect = activeText?.getBoundingClientRect()
      const overlayRect = overlay?.getBoundingClientRect()
      const actionRect = action?.getBoundingClientRect()
      const fadeStyle = fade ? window.getComputedStyle(fade) : null

      if (
        !active ||
        !activePillRect ||
        !activeTextRect ||
        !overlayRect ||
        !actionRect ||
        !fade ||
        !fadeStyle
      ) {
        return null
      }

      return {
        activePillRight: activePillRect.right,
        activePillCenter: activePillRect.left + activePillRect.width / 2,
        activeTextCenter: activeTextRect.left + activeTextRect.width / 2,
        overlayLeft: overlayRect.left,
        actionLeft: actionRect.left,
        fadeClass: fade.className,
        fadeOpacity: fadeStyle.opacity,
      }
    })

    expect(lastTagMetrics).not.toBeNull()
    expect(
      Math.abs((lastTagMetrics?.activeTextCenter ?? 0) - (lastTagMetrics?.activePillCenter ?? 0))
    ).toBeLessThanOrEqual(1)
    expect(lastTagMetrics?.activePillRight).toBeLessThanOrEqual(
      (lastTagMetrics?.actionLeft ?? 0) - 2
    )
    expect(lastTagMetrics?.fadeClass).not.toContain('is-visible')
    expect(Number.parseFloat(lastTagMetrics?.fadeOpacity ?? '1')).toBeLessThan(0.1)
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

  await expect(page.locator('.home-market-sort-trigger')).toHaveCount(0)
  await expect(page.locator('.home-market-sort-option')).toHaveCount(0)
  await expect
    .poll(async () => marketCardsAfterTagSwitch.count(), {
      message: 'expected market cards to stay rendered without market sorting controls',
    })
    .toBeGreaterThan(0)
  await expect(page.locator('.home-market-card-name').first()).toBeVisible()
  await expect(page.locator('.home-market-results-stage')).toBeVisible()
  await expect(page.locator('.home-list-loading-footer.is-error')).toHaveCount(0)

  expect(pageErrors).toEqual([])
})
