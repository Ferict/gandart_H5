import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('asset merge action guard', () => {
  it('does not simulate asset merge success', () => {
    const source = readSource('src', 'pages', 'updating', 'UpdatingAssetMergePage.vue')

    expect(source).not.toContain('setTimeout')
    expect(source).not.toContain("icon: 'success'")
    expect(source).not.toContain('合成成功')
  })

  it('keeps asset merge submit disabled until real action exists', () => {
    const source = readSource('src', 'pages', 'updating', 'UpdatingAssetMergePage.vue')

    expect(source).toContain('合成功能接驳中')
    expect(source).toContain('isPrimaryActionDisabled')
  })
})
