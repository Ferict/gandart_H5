import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('profileAssetDetail source guard', () => {
  it('locks index shell assembly, SecondaryPageFrame wiring, and action rail anchor', () => {
    const source = readSource('src', 'pages', 'profile-asset-detail', 'index.vue')

    expect(source).toContain('<SecondaryPageFrame')
    expect(source).toContain(':route-source="routeSource"')
    expect(source).toContain('title="藏品详情"')
    expect(source).toContain(':show-share="true"')
    expect(source).toContain(':refresher-enabled="true"')
    expect(source).toContain(':has-action-rail="true"')
    expect(source).toContain(
      ':action-rail-occupied-height="PROFILE_ASSET_ACTION_RAIL_OCCUPIED_HEIGHT_PX"'
    )
    expect(source).toContain('@back="handleBack"')
    expect(source).toContain('@share="handleShare"')
    expect(source).toContain('@refresherpulling="handleRefresherPulling"')
    expect(source).toContain('@refresherrefresh="handleRefresherRefresh"')
    expect(source).toContain('@refresherrestore="handleRefresherRestore"')
    expect(source).toContain('@refresherabort="handleRefresherAbort"')
    expect(source).toContain('<template #action-rail>')
    expect(source).toContain('class="action-primary action-primary-tab"')
    expect(source).toContain('class="action-primary-shell"')
    expect(source).toContain('class="action-primary-content"')
    expect(source).toContain('class="action-primary-text"')
  })

  it('locks detail card composition order in index shell', () => {
    const source = readSource('src', 'pages', 'profile-asset-detail', 'index.vue')

    const heroIndex = source.indexOf('<ProfileAssetDetailHeroCard')
    const valueIndex = source.indexOf('<ProfileAssetDetailValueCard')
    const provenanceIndex = source.indexOf('<ProfileAssetDetailProvenanceCard')
    const traitsIndex = source.indexOf('<ProfileAssetDetailTraitsCard')
    const descriptionIndex = source.indexOf('<ProfileAssetDetailDescriptionCard')

    expect(heroIndex).toBeGreaterThan(-1)
    expect(valueIndex).toBeGreaterThan(heroIndex)
    expect(provenanceIndex).toBeGreaterThan(valueIndex)
    expect(traitsIndex).toBeGreaterThan(provenanceIndex)
    expect(descriptionIndex).toBeGreaterThan(traitsIndex)
    expect(source).toContain(':hero-image-url="heroImageUrl"')
    expect(source).toContain(':title-text="valueCardTitleText"')
    expect(source).toContain('@copy="handleCopyProvenanceValue"')
    expect(source).toContain(':traits="resolvedTraits"')
    expect(source).toContain(':description="assetDescriptionText"')
    expect(source).toContain(':error-message="refreshErrorMessage || undefined"')
  })

  it('locks SecondaryPageFrame structural anchors used by detail shell', () => {
    const source = readSource('src', 'components', 'SecondaryPageFrame.vue')

    expect(source).toContain('class="secondary-page-frame"')
    expect(source).toContain('class="secondary-page-frame-topbar-shell"')
    expect(source).toContain('class="secondary-page-frame-panel"')
    expect(source).toContain('class="secondary-page-frame-refresh-rail"')
    expect(source).toContain('class="secondary-page-frame-scroll"')
    expect(source).toContain('class="secondary-page-frame-content"')
    expect(source).toContain('class="secondary-page-frame-action-rail"')
    expect(source).toContain('<SecondaryPageTopbar')
    expect(source).toContain('<StandalonePageScaffold :route-source="props.routeSource">')
    expect(source).toContain('<slot name="action-rail" />')
  })

  it('locks hero, value, provenance, traits, and description class anchors', () => {
    const heroSource = readSource(
      'src',
      'pages',
      'profile-asset-detail',
      'components',
      'ProfileAssetDetailHeroCard.vue'
    )
    const valueSource = readSource(
      'src',
      'pages',
      'profile-asset-detail',
      'components',
      'ProfileAssetDetailValueCard.vue'
    )
    const provenanceSource = readSource(
      'src',
      'pages',
      'profile-asset-detail',
      'components',
      'ProfileAssetDetailProvenanceCard.vue'
    )
    const traitsSource = readSource(
      'src',
      'pages',
      'profile-asset-detail',
      'components',
      'ProfileAssetDetailTraitsCard.vue'
    )
    const descriptionSource = readSource(
      'src',
      'pages',
      'profile-asset-detail',
      'components',
      'ProfileAssetDetailDescriptionCard.vue'
    )

    expect(heroSource).toContain('class="hero-card"')
    expect(heroSource).toContain('class="hero-media-frame"')
    expect(heroSource).toContain('class="hero-media-image-shell"')
    expect(heroSource).toContain('class="hero-card-tail"')

    expect(valueSource).toContain('class="value-card"')
    expect(valueSource).toContain('class="value-card-header"')
    expect(valueSource).toContain('class="value-card-title"')
    expect(valueSource).toContain('class="value-card-price-row"')
    expect(valueSource).toContain('class="summary-grid"')

    expect(provenanceSource).toContain('class="card-provenance"')
    expect(provenanceSource).toContain('class="provenance-list"')
    expect(provenanceSource).toContain('class="provenance-row"')
    expect(provenanceSource).toContain('class="provenance-copy-hit"')

    expect(traitsSource).toContain('class="card-traits"')
    expect(traitsSource).toContain('class="trait-grid"')
    expect(traitsSource).toContain('class="trait-item"')
    expect(traitsSource).toContain('class="trait-value"')

    expect(descriptionSource).toContain('class="card-description"')
    expect(descriptionSource).toContain('class="desc"')
    expect(descriptionSource).toContain('class="err"')
  })
})
