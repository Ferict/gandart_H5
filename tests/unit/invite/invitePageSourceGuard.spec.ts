import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const repoRoot = path.resolve(__dirname, '../../..')
const resolveRepoPath = (...segments: string[]) => path.join(repoRoot, ...segments)
const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')
const readSourceIfExists = (...segments: string[]) => {
  const filePath = resolveRepoPath(...segments)
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
}

describe('invite page source guard', () => {
  it('registers the real invite page route', () => {
    const pages = readSource('src', 'pages.json')

    expect(pages).toContain('"path": "pages/invite/index"')
  })

  it('uses the unified secondary-page shell, shared hit targets, and page-local runtime', () => {
    const source = readSourceIfExists('src', 'pages', 'invite', 'index.vue')

    expect(source).toContain('<SecondaryPageFrame')
    expect(source).toContain('HomeInteractiveTarget')
    expect(source).toContain('AetherIcon')
    expect(source).toContain('route-source="invite-page"')
    expect(source).toContain("from './runtime/invitePage.service'")
  })

  it('keeps the page free from copied React, Tailwind, and direct transport details', () => {
    const source = readSourceIfExists('src', 'pages', 'invite', 'index.vue')

    expect(source).not.toContain('import React')
    expect(source).not.toContain('useState')
    expect(source).not.toContain('useEffect')
    expect(source).not.toContain('className=')
    expect(source).not.toContain('dangerouslySetInnerHTML')
    expect(source).not.toContain('Tailwind')
    expect(source).not.toContain('lucide-vue-next')
    expect(source).not.toContain("from '../../contracts")
    expect(source).not.toContain("from '../../ports")
    expect(source).not.toContain("from '../../implementations")
  })

  it('locks invite page copy to the current invite-hub vocabulary', () => {
    const source = readSourceIfExists('src', 'pages', 'invite', 'index.vue')
    const runtimeSource = readSourceIfExists(
      'src',
      'pages',
      'invite',
      'runtime',
      'invitePage.service.ts'
    )
    const combinedSource = `${source}\n${runtimeSource}`

    expect(combinedSource).toContain('邀请好友')
    expect(combinedSource).toContain('邀请战绩')
    expect(combinedSource).toContain('奖励明细')
    expect(combinedSource).toContain('邀请海报')
    expect(combinedSource).toContain('规则说明')
  })

  it('does not render ad-hoc hero, metric, or front-visible seam copy', () => {
    const source = readSourceIfExists('src', 'pages', 'invite', 'index.vue')

    expect(source).not.toContain('invite-hero-card')
    expect(source).not.toContain('invite-seam-note')
    expect(source).not.toContain('当前页面只保留静态入口和结构壳')
  })
})
