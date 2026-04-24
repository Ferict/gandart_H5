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
    expectInOrder(source, ['<HomeRailHomePanel', '<HomeRailActivityPanel', '<HomeRailProfilePanel'])
  })

  it('locks home panel core sections, market stack assembly order, and anchor classes', () => {
    const source = readSource('src', 'pages', 'home', 'components', 'HomeRailHomePanel.vue')

    expect(source).toContain('class="home-panel"')
    expect(source).toContain('class="home-panel-content"')
    expect(source).toContain('class="home-market-stack"')
    expectInOrder(source, [
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
})
