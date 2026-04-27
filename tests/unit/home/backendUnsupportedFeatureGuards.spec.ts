import fs from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(__dirname, '../../..')

const readSource = (relativePath: string) =>
  fs.readFileSync(path.join(repoRoot, relativePath), 'utf8')

describe('backend unsupported feature guards', () => {
  it('keeps market sort popover out of runtime source', () => {
    const marketHead = readSource(
      'src/pages/home/components/home/HomeRailHomeMarketHeadSection.vue'
    )
    const marketPanel = readSource('src/pages/home/components/HomeRailHomePanel.vue')
    const marketQueryState = readSource(
      'src/pages/home/composables/home/useHomeMarketQueryState.ts'
    )
    const homeModel = readSource('src/models/home-rail/homeRailHome.model.ts')

    expect(marketHead).not.toContain('home-market-sort-popover')
    expect(marketHead).not.toContain('sliders-horizontal')
    expect(marketPanel).not.toContain('market-sort-trigger')
    expect(marketQueryState).not.toContain('useHomeMarketSortPopoverRuntime')
    expect(homeModel).not.toContain('sortConfig')
  })

  it('keeps activity date filter out of runtime source', () => {
    const homeIndex = readSource('src/pages/home/index.vue')
    const activityHead = readSource(
      'src/pages/home/components/activity/HomeRailActivityNoticeHeadSection.vue'
    )
    const activityQueryState = readSource(
      'src/pages/home/composables/activity/useActivityNoticeQueryState.ts'
    )

    expect(homeIndex).not.toContain('HomeActivityDateFilterSheet')
    expect(activityHead).not.toContain('calendar-days')
    expect(activityHead).not.toContain('date-filter-open')
    expect(activityQueryState).not.toContain('activeDateFilterRange')
  })

  it('keeps backend unsupported docs out of the clean source snapshot', () => {
    expect(fs.existsSync(path.join(repoRoot, '后端未实现', 'README.md'))).toBe(false)
  })
})
