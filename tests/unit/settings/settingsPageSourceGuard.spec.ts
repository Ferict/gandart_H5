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

const readClassRule = (source: string, className: string) => {
  const pattern = new RegExp(`\\.${className}\\s*\\{(?<body>[^}]*)\\}`, 'm')
  return pattern.exec(source)?.groups?.body ?? ''
}

describe('settings page source guard', () => {
  it('registers the real settings page route', () => {
    const pages = readSource('src', 'pages.json')

    expect(pages).toContain('"path": "pages/settings/index"')
  })

  it('uses the unified secondary-page shell, shared hit targets, and icon registry', () => {
    const source = readSourceIfExists('src', 'pages', 'settings', 'index.vue')

    expect(source).toContain('<SecondaryPageFrame')
    expect(source).toContain('HomeInteractiveTarget')
    expect(source).toContain('AetherIcon')
    expect(source).toContain('route-source="settings-page"')
    expect(source).toContain("from './runtime/settingsPage.adapter'")
  })

  it('keeps the page free from copied React, Tailwind, and direct transport details', () => {
    const source = readSourceIfExists('src', 'pages', 'settings', 'index.vue')

    expect(source).not.toContain('import React')
    expect(source).not.toContain('useState')
    expect(source).not.toContain('useEffect')
    expect(source).not.toContain('className=')
    expect(source).not.toContain('dangerouslySetInnerHTML')
    expect(source).not.toContain('ScrambleText')
    expect(source).not.toContain('Tailwind')
    expect(source).not.toContain('lucide-vue-next')
    expect(source).not.toContain("from '../../contracts")
    expect(source).not.toContain("from '../../ports")
    expect(source).not.toContain("from '../../implementations")
  })

  it('locks settings page sections, official copy, and icon vocabulary', () => {
    const source = readSourceIfExists('src', 'pages', 'settings', 'index.vue')
    const adapterSource = readSourceIfExists(
      'src',
      'pages',
      'settings',
      'runtime',
      'settingsPage.adapter.ts'
    )

    const combinedSource = `${source}\n${adapterSource}`

    expect(combinedSource).toContain('关于天异')
    expect(combinedSource).toContain('问题反馈')
    expect(source).toContain('退出登录')
    expect(adapterSource).toContain('message-circle-more')
    expect(adapterSource).toContain('user-round')
    expect(adapterSource).toContain('shield-check')
    expect(adapterSource).toContain('wallet')
    expect(adapterSource).toContain('bell-ring')
    expect(adapterSource).toContain('paintbrush')
    expect(adapterSource).toContain('languages')
    expect(source).toContain('log-out')
  })

  it('rejects forbidden copied settings capabilities', () => {
    const source = readSourceIfExists('src', 'pages', 'settings', 'index.vue')

    expect(source).not.toContain('MAINNET')
    expect(source).not.toContain('NODE_07')
    expect(source).not.toContain('Node_07')
    expect(source).not.toContain('智能合约授权管理')
    expect(source).not.toContain('清理系统缓存')
    expect(source).not.toContain('128.4 MB')
    expect(source).not.toContain('生物识别验证')
    expect(source).not.toContain('已实名')
    expect(source).not.toContain('交易签名成功')
  })

  it('keeps settings hit-zone shells free from visual layout pollution', () => {
    const source = readSourceIfExists('src', 'pages', 'settings', 'index.vue')
    const forbiddenLayoutProperties = /\b(min-width|min-height|padding|gap|flex|flex-basis)\s*:/

    ;[
      'settings-summary-action-target',
      'settings-row-target',
      'settings-logout-target',
      'settings-confirm-action-target',
    ].forEach((className) => {
      expect(readClassRule(source, className)).not.toMatch(forbiddenLayoutProperties)
    })
  })
})
