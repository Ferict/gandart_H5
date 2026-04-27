import { existsSync, readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSourceIfExists = (...segments: string[]) => {
  const filePath = resolveRepoPath(...segments)
  return existsSync(filePath) ? readFileSync(filePath, 'utf8') : ''
}

const readClassRule = (source: string, className: string) => {
  const pattern = new RegExp(`\\.${className}\\s*\\{(?<body>[^}]*)\\}`, 'm')
  return pattern.exec(source)?.groups?.body ?? ''
}

describe('identity verification page source guard', () => {
  it('keeps the page on the unified secondary-page shell and shared interaction target', () => {
    const source = readSourceIfExists(
      'src',
      'pages',
      'updating',
      'UpdatingIdentityVerificationPage.vue'
    )

    expect(source).toContain('SecondaryPageFrame')
    expect(source).toContain('HomeInteractiveTarget')
    expect(source).toContain('AetherIcon')
    expect(source).toContain("from './runtime/identityVerification.runtime'")
  })

  it('keeps the recreated page free from copied React and Tailwind implementation details', () => {
    const source = readSourceIfExists(
      'src',
      'pages',
      'updating',
      'UpdatingIdentityVerificationPage.vue'
    )

    expect(source).not.toContain('import React')
    expect(source).not.toContain('useState')
    expect(source).not.toContain('useEffect')
    expect(source).not.toContain('className=')
    expect(source).not.toContain('dangerouslySetInnerHTML')
    expect(source).not.toContain('ScrambleText')
    expect(source).not.toContain('Tailwind')
  })

  it('keeps hit-zone shells free from visual layout pollution', () => {
    const source = readSourceIfExists(
      'src',
      'pages',
      'updating',
      'UpdatingIdentityVerificationPage.vue'
    )
    const forbiddenLayoutProperties = /\b(min-width|min-height|padding|gap|flex|flex-basis)\s*:/

    ;[
      'identity-verification-topbar-debug',
      'identity-verification-agreement-entry',
      'identity-verification-submit-entry',
      'identity-verification-result-action-entry',
    ].forEach((className) => {
      expect(readClassRule(source, className)).not.toMatch(forbiddenLayoutProperties)
    })
  })
})
