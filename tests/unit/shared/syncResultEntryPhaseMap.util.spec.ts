import { describe, expect, it } from 'vitest'
import { syncResultEntryPhaseMap } from '@/utils/syncResultEntryPhaseMap.util'

describe('syncResultEntryPhaseMap.util', () => {
  it('keeps current phases by id when no resolver is provided', () => {
    expect(
      syncResultEntryPhaseMap([{ id: 'a' }, { id: 'b' }], { a: 'entering', c: 'leaving' })
    ).toEqual({
      a: 'entering',
      b: 'steady',
    })
  })

  it('lets the caller override each next phase', () => {
    expect(
      syncResultEntryPhaseMap(
        [{ id: 'a' }, { id: 'b' }],
        { a: 'replay-prep', b: 'steady' },
        (_, currentPhase) => (currentPhase === 'replay-prep' ? 'replay-entering' : 'steady')
      )
    ).toEqual({
      a: 'replay-entering',
      b: 'steady',
    })
  })
})
