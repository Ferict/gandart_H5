import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(__dirname, '../../..')
const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')

const readClassRule = (source: string, className: string) => {
  const pattern = new RegExp(`\\.${className}\\s*\\{(?<body>[^}]*)\\}`, 'm')
  return pattern.exec(source)?.groups?.body ?? ''
}

const pxValuePattern = /-?\d+(?:\.\d+)?px/g

const isGridAlignedPx = (value: number) => Math.abs(value) % 4 === 0

const isAllowedPxException = (line: string, value: number) => {
  if (line.includes('font-size:')) {
    return true
  }

  if (line.includes('border-radius: 999px')) {
    return true
  }

  if (
    value === 1 &&
    /^\s*border(?:-(?:top|right|bottom|left))?\s*:/.test(line) &&
    !line.includes('border-radius')
  ) {
    return true
  }

  if ((value === 1 || value === 2) && /^\s*height\s*:/.test(line)) {
    return true
  }

  return false
}

const collectNonGridPxLines = (source: string) =>
  source
    .split('\n')
    .flatMap((line, index) =>
      Array.from(line.matchAll(pxValuePattern)).map((match) => ({
        line: index + 1,
        raw: match[0],
        value: Number(match[0].replace('px', '')),
        text: line.trim(),
      }))
    )
    .filter(({ text, value }) => !isGridAlignedPx(value) && !isAllowedPxException(text, value))
    .map(({ line, raw, text }) => `${line}: ${raw} :: ${text}`)

describe('order page source guard', () => {
  it('registers a real order page route', () => {
    const pages = readSource('src/pages.json')

    expect(pages).toContain('"path": "pages/order/index"')
  })

  it('keeps the order page isolated from transport and copied React/Tailwind code', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(source).toContain('route-source="order-center"')
    expect(source).toContain('SecondaryPageFrame')
    expect(source).not.toContain('import React')
    expect(source).not.toContain('useState')
    expect(source).not.toContain('useEffect')
    expect(source).not.toContain('className=')
    expect(source).not.toContain('dangerouslySetInnerHTML')
    expect(source).not.toContain('ScrambleText')
    expect(source).not.toContain('unsplash.com')
    expect(source).not.toContain('Tailwind')
    expect(source).not.toContain("from '../../contracts")
    expect(source).not.toContain("from '../../ports")
    expect(source).not.toContain("from '../../implementations")
  })

  it('locks the recreated archive visual system and matching icon vocabulary', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(source).toContain('ORDER_CATEGORY_OPTIONS')
    expect(source).toContain('activeCategory')
    expect(source).toContain('order-primary-category-wrap')
    expect(source).toContain('order-primary-category-pill')
    expect(source).toContain('order-primary-category-text')
    expect(source).toContain('order-archive-tabs')
    expect(source).toContain('order-archive-card')
    expect(source).toContain('order-archive-status')
    expect(source).toContain('order-code-display')
    expect(source).toContain('order-card-enter')
    expect(source).toContain('order-archive-ending')
    expect(source).toContain('runOrderCodeReveal')
    expect(source).toContain('name="receipt"')
    expect(source).toContain(':name="order.statusIconName"')
    expect(source).toContain('name="arrow-right"')
    expect(source).not.toContain('order-page-hero')
  })

  it('keeps hit-zone shells free from visual layout pollution', () => {
    const source = readSource('src/pages/order/index.vue')
    const forbiddenLayoutProperties = /\b(min-width|min-height|padding|gap|flex|flex-basis)\s*:/

    expect(source).toContain('HomeInteractiveTarget')
    expect(source).toContain('order-archive-tab-visual')
    expect(source).toContain('order-action-visual')
    ;[
      'order-topbar-search-action',
      'order-primary-category-entry',
      'order-archive-tab-target',
      'order-archive-card-target',
      'order-card-action',
    ].forEach((className) => {
      expect(readClassRule(source, className)).not.toMatch(forbiddenLayoutProperties)
    })
  })

  it('keeps card glow and media lift tied to pointer hover only', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(source).toContain('@media (hover: hover) and (pointer: fine)')
    expect(source).toContain('is-pointer-hovered')
    expect(source).toContain('TOUCH_HOVER_SUPPRESSION_MS')
    expect(source).toContain('hasRecentTouchInteraction')
    expect(source).toContain('markOrderCardTouchInteraction')
    expect(source).not.toContain('.order-archive-card:hover')
    expect(source).not.toContain('.order-card-action:not(.is-primary):hover')
    expect(source).not.toContain('.order-archive-card.is-code-active')
    expect(source).not.toContain('is-code-active')
  })

  it('does not use pressed-state classes to color the order code on touch', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(source).not.toContain('.order-archive-card-target.is-entry-active')
    expect(source).not.toContain('.order-archive-card-target.is-entry-active .order-code-display')
  })

  it('keeps timestamp visible in the card header instead of hover-revealed chrome', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(source).toContain('order-card-head-main')
    expect(source).toContain('order-card-timestamp')
    expect(readClassRule(source, 'order-card-timestamp')).not.toMatch(/opacity\s*:\s*0/)
    expect(source).not.toContain('.order-archive-card:hover .order-card-timestamp')
  })

  it('keeps the amount footer as price-first local currency chrome', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(source).toContain('order-amount-mark')
    expect(source).not.toContain('Total_Amount')
    expect(source).not.toContain('ETH')
    expect(readClassRule(source, 'order-archive-card')).toMatch(/padding\s*:\s*24px/)
    expect(readClassRule(source, 'order-amount-unit')).toMatch(/font-size\s*:\s*12px/)
    expect(readClassRule(source, 'order-amount-unit')).toMatch(/transform\s*:\s*scale\(0\.9167\)/)
  })

  it('keeps non-text layout dimensions on the 4px grid', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(collectNonGridPxLines(source)).toEqual([])
  })

  it('does not write physical text sizes below 12px', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(source).not.toMatch(/font-size\s*:\s*(?:8|9|10|11)px/)
  })

  it('keeps the page background attached to the global page token', () => {
    const source = readSource('src/pages/order/index.vue')

    expect(source).toContain('var(--aether-page-background, #fafafa)')
    expect(source).toContain('--order-page-background: var(--aether-page-background, #fafafa)')
    expect(source).toContain(
      'background: linear-gradient(90deg, var(--order-page-background) 0%, transparent 100%)'
    )
    expect(source).toContain(
      'background: linear-gradient(270deg, var(--order-page-background) 0%, transparent 100%)'
    )
    expect(source).not.toContain('background: linear-gradient(90deg, #fafafa')
    expect(source).not.toContain('background: linear-gradient(270deg, #fafafa')
    expect(source).not.toContain('rgba(250, 250, 250, 0)')
    expect(source).not.toContain('background:#FAFAFA')
  })
})
