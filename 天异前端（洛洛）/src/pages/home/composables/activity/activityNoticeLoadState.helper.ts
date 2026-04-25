/**
 * Responsibility: resolve the activity notice list load state from first-screen, pagination,
 * switch, and exhaustion signals without touching remote state ownership.
 * Out of scope: fetching notices, mutating result windows, and driving UI side effects.
 */
export type ActivityNoticeListLoadState =
  | 'first-screen-loading'
  | 'first-screen-error'
  | 'first-screen-empty'
  | 'ready'
  | 'pagination-loading'
  | 'pagination-error'
  | 'exhausted'

export interface ResolveActivityNoticeListLoadStateOptions {
  hasResolvedInitialContent: boolean
  hasRenderableNotices: boolean
  hasFirstScreenLoading: boolean
  hasFirstScreenError: boolean
  hasPaginationLoading: boolean
  hasPaginationError: boolean
  hasPendingSwitch: boolean
  isExhausted: boolean
}

export const resolveActivityNoticeListLoadState = ({
  hasResolvedInitialContent,
  hasRenderableNotices,
  hasFirstScreenLoading,
  hasFirstScreenError,
  hasPaginationLoading,
  hasPaginationError,
  hasPendingSwitch,
  isExhausted,
}: ResolveActivityNoticeListLoadStateOptions): ActivityNoticeListLoadState => {
  if (!hasRenderableNotices) {
    if (
      !hasResolvedInitialContent ||
      hasFirstScreenLoading ||
      hasPaginationLoading ||
      hasPendingSwitch
    ) {
      return 'first-screen-loading'
    }

    if (hasFirstScreenError || hasPaginationError) {
      return 'first-screen-error'
    }

    return 'first-screen-empty'
  }

  if (hasPaginationLoading) {
    return 'pagination-loading'
  }

  if (hasPaginationError) {
    return 'pagination-error'
  }

  if (isExhausted) {
    return 'exhausted'
  }

  return 'ready'
}
