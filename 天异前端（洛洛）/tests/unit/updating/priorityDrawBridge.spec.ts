import { readFileSync } from 'node:fs'
import path from 'node:path'
import { describe, expect, it } from 'vitest'

import { usePriorityDrawRuntime } from '@/pages/updating/runtime/usePriorityDrawRuntime'

const resolveRepoPath = (...segments: string[]) =>
  path.resolve(__dirname, '..', '..', '..', ...segments)

const readSource = (...segments: string[]) => readFileSync(resolveRepoPath(...segments), 'utf8')

describe('priority draw bridge', () => {
  it('keeps the page on the legacy import surface while the source file becomes a compatibility bridge', () => {
    const source = readSource('src', 'pages', 'updating', 'UpdatingPriorityDrawPage.vue')

    expect(source).toContain("from './updatingPriorityDrawContent'")
  })

  it('hydrates retained priority-draw event list from unified runtime bridge', () => {
    const runtime = usePriorityDrawRuntime()

    expect(runtime.priorityDrawEventList.value.length).toBeGreaterThan(0)
    expect(runtime.priorityDrawEventList.value[0]).toMatchObject({
      id: expect.any(String),
      title: expect.any(String),
      coverImageUrl: expect.any(String),
    })
  })

  it('keeps the legacy page-local content file as a compatibility bridge instead of a second data source', () => {
    const source = readSource('src', 'pages', 'updating', 'updatingPriorityDrawContent.ts')

    expect(source).toContain("from './runtime/priority-draw.service'")
    expect(source).not.toContain('priorityDrawEventList: PriorityDrawEventViewModel[] = [')
  })
})
