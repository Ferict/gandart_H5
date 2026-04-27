import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('identity verification bridge', () => {
  it('routes UPD-SERVICE-AUTH to a retained updating module page', () => {
    const source = readSource('src', 'pages', 'updating', 'index.vue')

    expect(source).toContain('UPD-SERVICE-AUTH')
    expect(source).toContain('UpdatingIdentityVerificationPage')
    expect(source).not.toContain('ConstructionPlaceholder v-else-if="isIdentityVerificationModule"')
  })

  it('creates a retained identity-verification page file inside updating instead of a new route', () => {
    const pagePath = resolveRepoPath(
      'src',
      'pages',
      'updating',
      'UpdatingIdentityVerificationPage.vue'
    )

    expect(existsSync(pagePath)).toBe(true)
  })
})
