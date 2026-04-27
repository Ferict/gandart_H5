import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('asset merge page source guard', () => {
  it('keeps the page free from front-visible seam notes and mixed english placeholders', () => {
    const pageSource = readSource('src', 'pages', 'updating', 'UpdatingAssetMergePage.vue')
    const detailSource = readSource('src', 'pages', 'updating', 'UpdatingAssetMergeDetailPanel.vue')
    const combinedSource = `${pageSource}\n${detailSource}`

    expect(combinedSource).toContain('所需素材')
    expect(combinedSource).toContain('剩余份数')
    expect(combinedSource).toContain('活动规则')
    expect(combinedSource).not.toContain('当前可参与的合成活动')
    expect(combinedSource).not.toContain('仅开放方案查看与材料核验')
    expect(combinedSource).not.toContain('项目 seam')
    expect(combinedSource).not.toContain('TIME')
    expect(combinedSource).not.toContain('/ Formula')
    expect(combinedSource).not.toContain('/ Remaining')
  })
})
