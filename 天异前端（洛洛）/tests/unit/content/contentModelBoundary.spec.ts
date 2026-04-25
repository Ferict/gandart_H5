import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const resolveSourcePath = (relativePath: string) =>
  resolve(process.cwd(), relativePath).replace(/\\/g, '/')

const UI_MODEL_PATHS = [
  'src/models/content/contentTarget.model.ts',
  'src/models/content/contentResourceDetail.model.ts',
  'src/models/home-rail/homeRailHome.model.ts',
  'src/models/home-rail/homeRailActivity.model.ts',
  'src/models/home-rail/homeRailProfile.model.ts',
]

describe('content model boundary', () => {
  it('keeps UI-facing models detached from the formal content contract file', () => {
    UI_MODEL_PATHS.forEach((relativePath) => {
      const source = readFileSync(resolveSourcePath(relativePath), 'utf8')
      expect(source).not.toContain('content-api.contract')
    })
  })
})
