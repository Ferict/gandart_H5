import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('setup-quality-tools Windows script guard', () => {
  it('does not contain physical delete commands', () => {
    const source = readSource('scripts', 'setup-quality-tools.ps1')

    expect(source).not.toMatch(/\bRemove-Item\b/)
    expect(source).not.toMatch(/\brm\b/)
    expect(source).not.toMatch(/\bdel\b/)
    expect(source).not.toMatch(/\brmdir\b/)
  })

  it('uses unique reviewdog temp extraction path', () => {
    const source = readSource('scripts', 'setup-quality-tools.ps1')

    expect(source).toContain('reviewdog-extract-$PID-')
    expect(source).toContain('reviewdog-latest-$PID-')
  })
})
