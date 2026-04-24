/**
 * Responsibility: provide cross-rail presentation helpers shared by result-window pipelines,
 * including structure signatures, entry classes, delay styles, and removed-overlay positioning.
 * Out of scope: result-window timing orchestration, data fetching, and card component rendering.
 */
import type { CSSProperties } from 'vue'
import type {
  CardQueuePhase,
  ResultLoadSource,
} from '../services/home-rail/homeRailResultWindow.service'

interface BuildResultEntryClassOptions {
  entryPhase: CardQueuePhase
  motionSource: ResultLoadSource
  isLightMotion: boolean
  includeLoadMoreMotion?: boolean
}

export const buildResultStructureSignatureById = <T extends { id: string }>(list: T[]) =>
  list.map((item) => item.id).join('|')

export const buildResultEntryClass = ({
  entryPhase,
  motionSource,
  isLightMotion,
  includeLoadMoreMotion = false,
}: BuildResultEntryClassOptions) => {
  return {
    'is-leaving': entryPhase === 'leaving',
    'is-entering': entryPhase === 'entering',
    'is-replay-prep': entryPhase === 'replay-prep',
    'is-replay-entering': entryPhase === 'replay-entering',
    'is-motion-manual-query-switch': motionSource === 'manual-query-switch',
    'is-motion-manual-refresh': motionSource === 'manual-refresh',
    'is-motion-load-more': includeLoadMoreMotion && motionSource === 'load-more',
    'is-motion-light': isLightMotion,
  }
}

export const buildResultEntryDelayStyle = (
  delayVarName: string,
  delayMs: number
): CSSProperties => {
  if (delayMs <= 0) {
    return {}
  }

  return {
    [delayVarName]: `${delayMs}ms`,
  } as CSSProperties
}

export const buildResultGridRemovedOverlayItemStyle = (
  sourceIndex: number,
  columns: number
): CSSProperties => {
  const row = Math.floor(sourceIndex / columns) + 1
  const column = (sourceIndex % columns) + 1
  return {
    gridRowStart: `${row}`,
    gridColumnStart: `${column}`,
  }
}

export const buildResultListRemovedOverlayItemStyle = (sourceIndex: number): CSSProperties => ({
  gridRowStart: `${sourceIndex + 1}`,
})
