import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('home shared shell source guard', () => {
  it('locks home index shell assembly for track stage, tabbar, and drawer without date filter sheet', () => {
    const source = readSource('src', 'pages', 'home', 'index.vue')

    expect(source).toContain('class="home-page"')
    expect(source).toContain("'is-drawer-open': isDrawerLayerOpen")
    expect(source).toContain("'is-global-stage-scaled': isGlobalStageScaled")
    expect(source).toContain('<HomeShellTrackStage')
    expect(source).toContain('@open-drawer="handleDrawerOpen"')
    expect(source).toContain('<HomeShellTabbar')
    expect(source).toContain('v-if="trackLayoutState.showBottomTabbar"')
    expect(source).toContain('<HomeShellDrawer')
    expect(source).toContain(':open="isDrawerLayerOpen"')
    expect(source).not.toContain("'is-filter-open': isActivityDateFilterLayerOpen")
    expect(source).not.toContain('@open-activity-date-filter="handleActivityDateFilterOpen"')
    expect(source).not.toContain('<HomeActivityDateFilterSheet')
  })

  it('locks track stage structure for refresh adapter, staged rails, profile anchor bridge, and nav rail', () => {
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
    expect(source).toContain('class="home-track-panel-stage"')
    expect(source).toContain('<HomeTrackPullRefreshScroller')
    expect(source).toContain(':refresher-threshold-px="HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX"')
    expect(source).toContain('@refresh="handleHomeTrackPullRefresh"')
    expect(source).toContain(`@refresher-pulling="handleTrackRefresherPulling('home', $event)"`)
    expect(source).toContain('v-if="!isHomePage"')
    expect(source).toContain(':refresh-slot-state="resolveTrackRefreshSlotState(\'home\')"')
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

  it('locks home pull-refresh third-party adapter behind the local wrapper', () => {
    const source = readSource(
      'src',
      'pages',
      'home',
      'components',
      'shared',
      'HomeTrackPullRefreshScroller.vue'
    )
    const pagesSource = readSource('src', 'pages.json')

    expect(pagesSource).toContain('"^z-paging$": "z-paging/components/z-paging/z-paging.vue"')
    expect(source).toContain('<z-paging')
    expect(source).toContain(':refresher-only="true"')
    expect(source).toContain(':refresher-no-transform="true"')
    expect(source).toContain(':watch-refresher-touchmove="true"')
    expect(source).toContain('@query="handleQuery"')
    expect(source).toContain('@refresher-touchmove="handleRefresherTouchmove"')
    expect(source).toContain('completeRefresh')
    expect(source).toContain('defineExpose')
  })

  it('locks home refresh visual as a content-flow slot between topbar and banner', () => {
    const source = readSource('src', 'pages', 'home', 'components', 'HomeRailHomePanel.vue')
    const slotSource = readSource(
      'src',
      'pages',
      'home',
      'components',
      'home',
      'HomeRailHomeRefreshSlot.vue'
    )

    expect(source.indexOf('<HomeRailTopbar')).toBeLessThan(
      source.indexOf('<HomeRailHomeRefreshSlot')
    )
    expect(source.indexOf('<HomeRailHomeRefreshSlot')).toBeLessThan(
      source.indexOf('<HomeRailHomeBannerCarouselSection')
    )
    expect(slotSource).toContain('class="home-refresh-slot"')
    expect(slotSource).toContain('height: `${Math.max(0, slotState.value.heightPx)}px`')
    expect(slotSource).toContain('AetherIcon')
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

  it('locks drawer and nav rail structure while keeping date filter sheet out of runtime', () => {
    const drawerSource = readSource('src', 'components', 'HomeShellDrawer.vue')
    const navRailSource = readSource('src', 'components', 'HomeShellNavRail.vue')
    const dateFilterPath = resolveRepoPath(
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

    expect(existsSync(dateFilterPath)).toBe(false)
  })
})
