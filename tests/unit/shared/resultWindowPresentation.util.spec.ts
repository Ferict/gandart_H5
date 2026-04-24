import { describe, expect, it } from 'vitest'
import {
  buildResultEntryClass,
  buildResultEntryDelayStyle,
  buildResultGridRemovedOverlayItemStyle,
  buildResultListRemovedOverlayItemStyle,
  buildResultStructureSignatureById,
} from '@/utils/resultWindowPresentation.util'

describe('resultWindowPresentation.util', () => {
  it('builds an ordered structure signature by id', () => {
    expect(buildResultStructureSignatureById([{ id: 'a' }, { id: 'b' }])).toBe('a|b')
  })

  it('builds a shared entry-class map', () => {
    expect(
      buildResultEntryClass({
        entryPhase: 'entering',
        motionSource: 'load-more',
        isLightMotion: false,
        includeLoadMoreMotion: true,
      })
    ).toMatchObject({
      'is-entering': true,
      'is-motion-load-more': true,
      'is-motion-light': false,
    })
  })

  it('builds a CSS custom-property delay style only when delay is positive', () => {
    expect(buildResultEntryDelayStyle('--demo-delay', 120)).toEqual({
      '--demo-delay': '120ms',
    })
    expect(buildResultEntryDelayStyle('--demo-delay', 0)).toEqual({})
  })

  it('builds grid and list removed-overlay positions', () => {
    expect(buildResultGridRemovedOverlayItemStyle(3, 2)).toEqual({
      gridRowStart: '2',
      gridColumnStart: '2',
    })
    expect(buildResultListRemovedOverlayItemStyle(2)).toEqual({
      gridRowStart: '3',
    })
  })
})
