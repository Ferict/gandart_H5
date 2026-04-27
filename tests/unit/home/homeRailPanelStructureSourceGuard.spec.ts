import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

const expectInOrder = (source: string, anchors: string[]) => {
  let lastIndex = -1

  for (const anchor of anchors) {
    const nextIndex = source.indexOf(anchor)
    expect(nextIndex, `expected source to contain anchor: ${anchor}`).toBeGreaterThan(-1)
    expect(nextIndex, `expected anchor to appear after previous anchor: ${anchor}`).toBeGreaterThan(
      lastIndex
    )
    lastIndex = nextIndex
  }
}

describe('home rail panel structure source guard', () => {
  it('locks three rail panels in shared track stage order', () => {
    const source = readSource(
      'src',
      'pages',
      'home',
      'components',
      'shared',
      'HomeShellTrackStage.vue'
    )

    expect(source).toContain('class="home-track-panel-stage"')
    expect(source).toContain('class="home-track-scroll home-track-panel-scroll"')
    expect(source).toContain('<HomeRailProfileAssetHoldingsSheet')
    expect(source).toContain(':open="isProfileAssetHoldingsSheetOpen"')
    expect(source).not.toContain('@detail="handleProfileAssetHoldingsDetail"')
    expect(source).not.toContain('handleProfileAssetHoldingsDetailActivate')
    expectInOrder(source, ['<HomeRailHomePanel', '<HomeRailActivityPanel', '<HomeRailProfilePanel'])
    expectInOrder(source, ['<HomeRailProfilePanel', '<HomeRailProfileAssetHoldingsSheet'])
  })

  it('locks home panel core sections, market stack assembly order, and anchor classes', () => {
    const source = readSource('src', 'pages', 'home', 'components', 'HomeRailHomePanel.vue')

    expect(source).toContain('class="home-panel"')
    expect(source).toContain('class="home-panel-content"')
    expect(source).toContain('class="home-market-stack"')
    expect(source).toContain('id="market-sticky-sentinel"')
    expect(source).toContain(':class="{ \'is-stuck\': isMarketStickyHeaderStuck }"')
    expect(source).toContain('let marketStickyObserver')
    expect(source).toContain('marketStickyObserver?.disconnect()')
    expect(source).toContain('&::after {')
    expect(source).toContain('background: var(--aether-border-subtle, #dce6ef);')
    expect(source).toContain('transition: opacity 180ms ease;')
    expect(source).toContain('&.is-stuck::after {')
    expect(source).toContain('opacity: 1;')
    expect(source).not.toContain('transition: box-shadow 300ms ease;')
    expect(source).not.toContain('box-shadow: var(--aether-shadow-soft')
    expectInOrder(source, [
      '<HomeRailTopbar',
      '<HomeRailHomeRefreshSlot',
      '<HomeRailHomeBannerCarouselSection',
      '<HomeRailHomeNoticeBarSection',
      '<HomeRailHomeFeaturedSection',
      '<view class="home-market-stack">',
      '<HomeRailHomeMarketHeadSection',
      '<HomeRailHomeMarketTagSection',
      '<HomeRailHomeMarketSearchSection',
      '<HomeRailHomeMarketResultsSection',
    ])
  })

  it('locks market head kind switch and tag-row search composition', () => {
    const panelSource = readSource('src', 'pages', 'home', 'components', 'HomeRailHomePanel.vue')
    const headSource = readSource(
      'src',
      'pages',
      'home',
      'components',
      'home',
      'HomeRailHomeMarketHeadSection.vue'
    )
    const kindSource = readSource(
      'src',
      'pages',
      'home',
      'components',
      'home',
      'HomeRailHomeMarketKindSection.vue'
    )
    const tagSource = readSource(
      'src',
      'pages',
      'home',
      'components',
      'home',
      'HomeRailHomeMarketTagSection.vue'
    )

    expect(panelSource).not.toContain('<HomeRailHomeMarketKindSection')
    expect(headSource).toContain('<HomeRailHomeMarketKindSection')
    expect(headSource).toContain(':market-kind-options="marketKindOptions"')
    expect(headSource).toContain('resolveMarketHeadCopy')
    expect(headSource).toContain('BLIND BOX')
    expect(headSource).toContain('{{ marketHeadCopy.title }}')
    expect(headSource).toContain('{{ marketHeadCopy.subtitle }}')
    expect(headSource).not.toContain('useScrambleText')
    expect(headSource).not.toContain('SCRAMBLE_')
    expect(headSource).not.toContain('setInterval')
    expect(headSource).not.toContain('onBeforeUnmount')
    expect(headSource).not.toContain('!@#$%^&*')
    expect(headSource).toContain('line-height: 24px')
    expect(headSource).toContain('font-weight: 900')
    expect(headSource).toContain('font-size: 12px')
    expect(headSource).toContain('font-weight: 500')
    expect(headSource).toContain('letter-spacing: 0.18em')
    expect(headSource).toContain('transform: scale(0.75)')
    expect(headSource).not.toContain('home-market-action-entry')
    expect(headSource).not.toContain('market-search-click')

    expect(kindSource).toContain('class="home-market-kind-indicator"')
    expect(kindSource).toContain('border-radius: 8px')
    expect(kindSource).toContain('width: `calc(100% / ${optionCount})`')
    expect(kindSource).toContain(':hit-width="46"')
    expect(kindSource).toContain(':hit-height="44"')
    expect(kindSource).toContain('align-self: center')
    expect(kindSource).toContain('width: 88px')
    expect(kindSource).toContain('height: 24px')
    expect(kindSource).not.toContain('width: 92px')
    expect(kindSource).not.toContain('height: 26px')
    expect(kindSource).not.toContain('width: 100px')
    expect(kindSource).not.toContain('height: 28px')
    expect(kindSource).toContain('padding: 0;')
    expect(kindSource).not.toContain('padding: 2px;')
    expect(kindSource).toContain('top: 0;')
    expect(kindSource).toContain('bottom: 0;')
    expect(kindSource).toContain('left: 0;')
    expect(kindSource).toContain('translateX')
    expect(kindSource).toContain('background: #22d3ee')
    expect(kindSource).not.toContain('rgba(34, 211, 238, 0.4)')
    expect(kindSource).not.toContain('0 2px 8px')
    expect(kindSource).toContain('color: #ffffff')
    expect(kindSource).toContain('font-size: 10px')
    expect(kindSource).toContain('300ms cubic-bezier(0.4, 0, 0.2, 1)')

    expect(tagSource).toContain('<up-tabs')
    expect(tagSource).toContain('scrollable')
    expect(tagSource).toContain(':current="activeMarketTagIndex"')
    expect(tagSource).toContain('@change="handleTagChange"')
    expect(tagSource).toContain('#content="{ item }"')
    expect(tagSource).toContain('class="home-market-tag-pill"')
    expect(tagSource).toContain('class="home-market-tag-text"')
    expect(tagSource).not.toContain('#right')
    expect(tagSource).not.toContain('home-market-action-slot')
    expect(tagSource).toContain('class="home-market-action-overlay"')
    expect(tagSource).toContain('class="home-market-tag-fade-right"')
    expect(tagSource).toContain(':class="{ \'is-visible\': showFadeRight }"')
    expect(tagSource).toContain('class="home-market-action-entry"')
    expect(tagSource).toContain(
      "const RIGHT_FADE_SCROLL_SELECTOR = '.u-tabs__wrapper__scroll-view'"
    )
    expect(tagSource).toContain(
      "const RIGHT_FADE_H5_NATIVE_SCROLL_SELECTOR = '.uni-scroll-view-scrollbar-hidden'"
    )
    expect(tagSource).toContain('resolveNativeScrollElement')
    expect(tagSource).not.toContain("'.u-tabs__wrapper__scroll-view-wrapper'")
    expect(tagSource).toContain('isRightFadeVisible')
    expect(tagSource).toContain('line-color="transparent"')
    expect(tagSource).toContain(':line-width="0"')
    expect(tagSource).toContain(':line-height="0"')
    expect(tagSource).toContain("fontSize: '12px'")
    expect(tagSource).toContain("lineHeight: '16px'")
    expect(tagSource).toContain('fontWeight: 700')
    expect(tagSource).toContain("height: '44px'")
    expect(tagSource).toContain("padding: '8px 6px'")
    expect(tagSource).not.toContain('padding: 0 var(--home-page-inline-padding, 16px);')
    expect(tagSource).not.toContain('margin-left: var(--home-page-inline-padding, 16px);')
    expect(tagSource).not.toContain('margin-right: 12px;')
    expect(tagSource).toContain('.u-tabs__wrapper__nav__item:first-child')
    expect(tagSource).toContain('padding-left: var(--home-page-inline-padding, 16px) !important;')
    expect(tagSource).toContain('.u-tabs__wrapper__nav__item:nth-last-child(2)')
    expect(tagSource).toContain('--home-market-action-overlay-width: 96px;')
    expect(tagSource).toContain('--home-market-action-reserve-width: 52px;')
    expect(tagSource).toContain(
      'padding-right: var(--home-market-action-reserve-width, 52px) !important;'
    )
    expect(tagSource).not.toContain('tagActionOverlayWidthPx')
    expect(tagSource).not.toContain('market-tag-action-overlay-width-px')
    expect(tagSource).toContain('position: absolute;')
    expect(tagSource).toContain('right: 0;')
    expect(tagSource).toContain('pointer-events: none;')
    expect(tagSource).toContain('pointer-events: auto;')
    expect(tagSource).not.toContain('.u-tabs__wrapper__nav__item::before')
    expect(tagSource).toContain('background: #f2f4f7')
    expect(tagSource).toContain('background: #111111')
    expect(tagSource).toContain('border-radius: 999px')
    expect(tagSource).toContain('display: none;')
    expect(tagSource).not.toContain('v-for="tag in props.marketTags"')
    expect(tagSource).not.toContain('class="home-market-tag-track"')
  })

  it('locks activity panel core sections, notice stack assembly order, and anchor classes', () => {
    const source = readSource('src', 'pages', 'home', 'components', 'HomeRailActivityPanel.vue')

    expect(source).toContain('class="home-activity-panel"')
    expect(source).toContain('class="home-activity-header"')
    expect(source).toContain('class="home-activity-content"')
    expect(source).toContain('class="home-activity-notice-stack"')
    expectInOrder(source, [
      '<HomeRailActivityEntryHighlightsSection',
      '<view class="home-activity-notice-stack">',
      '<HomeRailActivityNoticeHeadSection',
      '<HomeRailActivityTagSection',
      '<HomeRailActivitySearchSection',
      '<HomeRailActivityNoticeResultsSection',
    ])
  })

  it('locks profile panel core sections, assets stack assembly order, and anchor classes', () => {
    const source = readSource('src', 'pages', 'home', 'components', 'HomeRailProfilePanel.vue')

    expect(source).toContain('class="home-profile-panel"')
    expect(source).toContain('class="home-profile-header"')
    expect(source).toContain('class="home-profile-body"')
    expect(source).toContain('id="home-profile-assets-anchor"')
    expect(source).toContain('class="home-profile-assets-stack"')
    expect(source).toContain('resolveProfileAssetHoldingsSheetOpen')
    expect(source).toContain('resolveActiveProfileAssetHoldingsSheetViewModel')
    expect(source).not.toContain('handleProfileAssetHoldingsDetailActivate')
    expectInOrder(source, [
      '<HomeRailProfileIdentitySection',
      '<HomeRailProfileSummarySection',
      '<HomeRailProfileQuickActionsSection',
      '<view id="home-profile-assets-anchor" class="home-profile-assets-stack">',
      '<HomeRailProfileAssetsHeadSection',
      '<HomeRailProfileCategorySection',
      '<HomeRailProfileSubCategorySection',
      '<HomeRailProfileSearchSection',
      '<HomeRailProfileResultsSection',
    ])
  })

  it('locks holdings sheet to header-plus-list only and full-width bottom-sheet sizing', () => {
    const source = readSource(
      'src',
      'pages',
      'home',
      'components',
      'profile',
      'HomeRailProfileAssetHoldingsSheet.vue'
    )

    expect(source).not.toContain('profile-asset-holdings-signal-line')
    expect(source).not.toContain('profile-asset-holdings-summary')
    expect(source).not.toContain('profile-asset-holdings-footer')
    expect(source).not.toContain('detail: []')
    expect(source).toContain('width: 100%;')
    expect(source).toContain('min-height:')
    expect(source).toContain('max-height: calc(82vh + var(--home-safe-bottom, 0px));')
  })
})
