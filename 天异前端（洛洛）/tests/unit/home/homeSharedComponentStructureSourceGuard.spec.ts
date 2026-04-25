import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('home shared component structure source guard', () => {
  it('locks activity notice card media, unread pill, type pill, and time anchors', () => {
    const source = readSource(
      'src',
      'pages',
      'home',
      'components',
      'shared',
      'HomeActivityNoticeCard.vue'
    )

    expect(source).toContain('class="home-activity-notice-shell"')
    expect(source).toContain('class="home-activity-notice-icon-wrap"')
    expect(source).toContain('class="home-activity-notice-icon-frame"')
    expect(source).toContain('<HomeMarketCardImageReveal')
    expect(source).toContain('class="home-activity-notice-copy"')
    expect(source).toContain('class="home-activity-notice-title-row"')
    expect(source).toContain('class="home-activity-notice-new-pill"')
    expect(source).toContain('class="home-activity-notice-meta"')
    expect(source).toContain('class="home-activity-notice-type-pill"')
    expect(source).toContain('class="home-activity-notice-time"')
  })

  it('locks list loading footer loading, error, and endline structural anchors', () => {
    const source = readSource(
      'src',
      'pages',
      'home',
      'components',
      'shared',
      'HomeRailListLoadingFooter.vue'
    )

    expect(source).toContain('class="home-list-loading-footer"')
    expect(source).toContain('`is-${props.mode}`')
    expect(source).toContain('class="home-list-loading-footer-ring"')
    expect(source).toContain('class="home-list-loading-footer-wave"')
    expect(source).toContain(
      'class="home-list-loading-footer-pill home-list-loading-footer-pill--error"'
    )
    expect(source).toContain('class="home-list-loading-footer-error-live"')
    expect(source).toContain('<HomeInteractiveTarget')
    expect(source).toContain('class="home-list-loading-footer-retry-target"')
    expect(source).toContain('class="home-list-loading-footer-endline-shell"')
    expect(source).toContain('class="home-list-loading-footer-endline-orbit"')
    expect(source).toContain('class="home-list-loading-footer-endline-copy"')
  })

  it('locks interactive target hit layer, visual slot shell, and keyboard anchors', () => {
    const source = readSource('src', 'components', 'HomeInteractiveTarget.vue')

    expect(source).toContain('class="home-interactive-target"')
    expect(source).toContain('class="home-interactive-target-hit"')
    expect(source).toContain('class="home-interactive-target-visual"')
    expect(source).toContain('role="button"')
    expect(source).toContain('@keydown.enter="handleKeyDown"')
    expect(source).toContain('@keyup.enter="handleKeyActivate"')
    expect(source).toContain('@keydown.space.prevent="handleKeyDown"')
    expect(source).toContain('@keyup.space.prevent="handleKeyActivate"')
    expect(source).toContain('<slot />')
  })

  it('locks market card image reveal base, placeholder, loading, and retry anchors', () => {
    const source = readSource('src', 'components', 'HomeMarketCardImageReveal.vue')

    expect(source).toContain('class="home-market-card-image-reveal"')
    expect(source).toContain('class="home-market-card-material-base"')
    expect(source).toContain('class="home-market-card-image-shell"')
    expect(source).toContain('class="home-market-card-image"')
    expect(source).toContain('class="home-market-card-placeholder-shell"')
    expect(source).toContain('class="home-market-card-placeholder-icon"')
    expect(source).toContain('class="home-market-card-fallback-text"')
    expect(source).toContain('class="home-market-card-retry-action"')
    expect(source).toContain('class="home-market-card-loading-overlay"')
    expect(source).toContain('class="home-market-card-retry-hit"')
  })
})
