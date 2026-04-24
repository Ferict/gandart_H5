/**
 * Responsibility: host stable constants used by the profile rail panel so shell configuration
 * stays out of the component body and runtime composables.
 * Out of scope: query ownership, refresh workflows, result windows, reveal runtime, and page events.
 */
export const IS_HOME_RAIL_PROFILE_DEV = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)
export const PROFILE_ASSET_REVEAL_SCAN_DURATION_MS = 220
export const PROFILE_ASSET_ENTER_DURATION_MS = 300
export const PROFILE_ASSET_LEAVE_DURATION_MS = 300
export const PROFILE_ASSET_STAGGER_STEP_MS = 100
export const PROFILE_ASSET_REFRESH_SETTLE_POLL_INTERVAL_MS = 16
export const PROFILE_ASSET_GRID_COLUMNS = 2
export const PROFILE_ASSET_GRID_COLUMN_GAP_PX = 12
export const PROFILE_ASSET_GRID_ROW_GAP_PX = 20
export const PROFILE_ASSET_CARD_COPY_HEIGHT_PX = 72
export const PROFILE_ASSET_CARD_FALLBACK_WIDTH_PX = 164
export const PROFILE_ASSET_INITIAL_VISIBLE_COUNT = 32
export const PROFILE_ASSET_LOAD_MORE_COUNT = 16
export const PROFILE_ASSET_REMOTE_PAGE_SIZE = 32
export const PROFILE_ASSET_LOAD_MORE_REMAINING_ROWS_THRESHOLD = 8
export const PROFILE_ASSET_MOUNT_BUFFER_TOP_ROWS = 2
export const PROFILE_ASSET_MOUNT_BUFFER_BOTTOM_ROWS = 3
export const PROFILE_SEARCH_REVEAL_FALLBACK_HEIGHT_PX = 48
export const PROFILE_ADDRESS_SUFFIX_LENGTH = 4
