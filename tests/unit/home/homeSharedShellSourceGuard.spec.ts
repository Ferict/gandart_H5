import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('home shared shell source guard', () => {
  it('locks home index shell assembly for track stage, tabbar, drawer, and date filter sheet', () => {
    const source = readSource('src', 'pages', 'home', 'index.vue')

    expect(source).toContain('class="home-page"')
    expect(source).toContain("'is-drawer-open': isDrawerLayerOpen")
    expect(source).toContain("'is-filter-open': isActivityDateFilterLayerOpen")
    expect(source).toContain("'is-global-stage-scaled': isGlobalStageScaled")
    expect(source).toContain('<HomeShellTrackStage')
    expect(source).toContain('@open-drawer="handleDrawerOpen"')
    expect(source).toContain('@open-activity-date-filter="handleActivityDateFilterOpen"')
    expect(source).toContain('<HomeShellTabbar')
    expect(source).toContain('v-if="trackLayoutState.showBottomTabbar"')
    expect(source).toContain('<HomeShellDrawer')
    expect(source).toContain(':open="isDrawerLayerOpen"')
    expect(source).toContain('<HomeActivityDateFilterSheet')
    expect(source).toContain(':open="isActivityDateFilterLayerOpen"')
  })

  it('locks track stage structure for topbar, staged rails, profile anchor bridge, and nav rail', () => {
    const source = readSource(
      'src',
      'pages',
      'home',
      'components',
      'shared',
      'HomeShellTrackStage.vue'
    )

    expect(source).toContain('class="home-main-stage"')
    expect(source).toContain('class="home-main-stage-inner"')
    expect(source).toContain('class="home-track-home-topbar"')
    expect(source).toContain('<HomeRailTopbar')
    expect(source).toContain('class="home-track-panel-stage"')
    expect(source).toContain('class="home-track-scroll home-track-panel-scroll"')
    expect(source).toContain('<HomeRailHomePanel')
    expect(source).toContain('<HomeRailActivityPanel')
    expect(source).toContain('<HomeRailProfilePanel')
    expect(source).toContain('@scroll-to-assets-section="handleProfileScrollToAssetsSection"')
    expect(source).toContain(':scroll-into-view="profileScrollIntoViewTarget"')
    expect(source).toContain('<HomeShellNavRail')
    expect(source).toContain('v-if="isNavRailVisible"')
    expect(source).toContain('@open-drawer="handleOpenDrawer"')
  })

  it('locks tabbar/topbar shell classes and interaction anchors', () => {
    const tabbarSource = readSource(
      'src',
      'pages',
      'home',
      'components',
      'shared',
      'HomeShellTabbar.vue'
    )
    const topbarSource = readSource(
      'src',
      'pages',
      'home',
      'components',
      'shared',
      'HomeRailTopbar.vue'
    )

    expect(tabbarSource).toContain('class="home-shell-tabbar-wrap"')
    expect(tabbarSource).toContain('class="home-shell-tabbar-surface"')
    expect(tabbarSource).toContain('class="home-shell-tabbar-track"')
    expect(tabbarSource).toContain('class="home-shell-tabbar-item"')
    expect(tabbarSource).toContain('class="home-shell-tabbar-preview-rail"')
    expect(tabbarSource).toContain('class="home-shell-tabbar-indicator-rail"')
    expect(tabbarSource).toContain('HOME_PRIMARY_PAGE_KEY')
    expect(tabbarSource).toContain('HOME_ACTIVITY_PAGE_KEY')
    expect(tabbarSource).toContain('HOME_PROFILE_PAGE_KEY')

    expect(topbarSource).toContain('class="home-topbar"')
    expect(topbarSource).toContain(`class="home-topbar-copy"`)
    expect(topbarSource).toContain('class="home-topbar-brand-wrap"')
    expect(topbarSource).toContain('class="home-topbar-title-logo"')
    expect(topbarSource).toContain('class="home-topbar-dot"')
    expect(topbarSource).toContain('class="home-topbar-menu-entry"')
    expect(topbarSource).toContain(`@activate="emit('openDrawer')"`)
  })

  it('locks drawer or nav rail structure plus date filter sheet width and seven-column grid', () => {
    const drawerSource = readSource('src', 'components', 'HomeShellDrawer.vue')
    const navRailSource = readSource('src', 'components', 'HomeShellNavRail.vue')
    const dateFilterSource = readSource(
      'src',
      'pages',
      'home',
      'components',
      'shared',
      'HomeActivityDateFilterSheet.vue'
    )

    expect(drawerSource).toContain('class="home-shell-drawer-mask"')
    expect(drawerSource).toContain('class="home-shell-side-drawer"')
    expect(drawerSource).toContain('class="home-shell-drawer-panel"')
    expect(drawerSource).toContain('class="home-shell-drawer-close-entry"')
    expect(drawerSource).toContain('class="home-shell-drawer-list"')
    expect(drawerSource).toContain('class="home-shell-drawer-footer"')

    expect(navRailSource).toContain('class="home-shell-nav-rail"')
    expect(navRailSource).toContain('class="home-shell-nav-group"')
    expect(navRailSource).toContain('class="home-shell-nav-hit"')
    expect(navRailSource).toContain('class="home-shell-nav-button home-shell-nav-button-menu"')
    expect(navRailSource).toContain('class="home-shell-nav-indicator"')

    expect(dateFilterSource).toContain('class="home-activity-filter-mask"')
    expect(dateFilterSource).toContain('class="home-activity-filter-bottom-sheet"')
    expect(dateFilterSource).toContain('class="home-activity-filter-panel"')
    expect(dateFilterSource).toContain('class="home-activity-filter-day-grid"')
    expect(dateFilterSource).toContain('max-width: 343px;')
    expect(dateFilterSource).toContain('grid-template-columns: repeat(7, minmax(0, 1fr));')
    expect(dateFilterSource).toContain('@activate="handleDateSelect(cell.dateKey)"')
  })
})
