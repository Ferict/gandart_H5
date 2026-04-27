/**
 * Responsibility: host transport-batch and reveal-batch strategy constants shared by
 * home/profile/activity list runtimes.
 * Out of scope: remote fetching, query signatures, and page-local result-window animation.
 */
export type HomeRailTransportMode = 'common-batched' | 'activity-scoped-special'

export interface HomeRailBatchStrategy {
  backendPageSize: number
  transportPagesPerBatch: number
  transportBatchSize: number
  initialRevealCount: number
  revealStepCount: number
  transportMode: HomeRailTransportMode
}

export const COMMON_BATCHED_BACKEND_PAGE_SIZE = 15
export const COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH = 2
export const COMMON_BATCHED_TRANSPORT_BATCH_SIZE =
  COMMON_BATCHED_BACKEND_PAGE_SIZE * COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH

export const HOME_MARKET_BATCH_STRATEGY: HomeRailBatchStrategy = {
  backendPageSize: COMMON_BATCHED_BACKEND_PAGE_SIZE,
  transportPagesPerBatch: COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH,
  transportBatchSize: COMMON_BATCHED_TRANSPORT_BATCH_SIZE,
  initialRevealCount: 16,
  revealStepCount: 16,
  transportMode: 'common-batched',
}

export const PROFILE_ASSET_BATCH_STRATEGY: HomeRailBatchStrategy = {
  backendPageSize: COMMON_BATCHED_BACKEND_PAGE_SIZE,
  transportPagesPerBatch: COMMON_BATCHED_TRANSPORT_PAGES_PER_BATCH,
  transportBatchSize: COMMON_BATCHED_TRANSPORT_BATCH_SIZE,
  initialRevealCount: 16,
  revealStepCount: 16,
  transportMode: 'common-batched',
}

export const ACTIVITY_NOTICE_BATCH_STRATEGY: HomeRailBatchStrategy = {
  backendPageSize: 60,
  transportPagesPerBatch: 1,
  transportBatchSize: 60,
  initialRevealCount: 12,
  revealStepCount: 12,
  transportMode: 'activity-scoped-special',
}

export const hasRevealBufferItems = (visibleCount: number, loadedItemCount: number) => {
  return visibleCount < loadedItemCount
}

export const resolveNextRevealCount = (
  currentVisibleCount: number,
  loadedItemCount: number,
  revealStepCount: number
) => {
  return Math.min(loadedItemCount, currentVisibleCount + revealStepCount)
}

export const isBeyondFirstTransportBatchLoaded = (
  loadedItemCount: number,
  transportBatchSize: number
) => {
  return loadedItemCount > transportBatchSize
}
