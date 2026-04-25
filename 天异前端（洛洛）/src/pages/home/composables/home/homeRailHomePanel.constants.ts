/**
 * Responsibility: host stable constants used by the home market rail panel so panel-shell
 * configuration stays out of the component body and runtime composables.
 * Out of scope: business state ownership, refresh workflows, reveal runtime, and page events.
 */
export const HOME_BANNER_PLACEHOLDER_URL = '/static/home/banner/banner-placeholder.jpg'
export const IS_HOME_RAIL_HOME_DEV = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)
export const HOME_MARKET_RESULT_SWITCH_DEBOUNCE_MS = 120
export const HOME_MARKET_RESULT_INITIAL_VISIBLE_COUNT = 32
export const HOME_MARKET_RESULT_LOAD_MORE_COUNT = 16
export const HOME_MARKET_RESULT_LEAVE_DURATION_MS = 300
export const HOME_MARKET_RESULT_ENTER_DURATION_MS = 300
export const HOME_MARKET_REMOTE_PAGE_SIZE = 32
export const HOME_MARKET_REFRESH_MIN_VISIBLE_DURATION_MS = 320
export const HOME_MARKET_REFRESH_SETTLE_POLL_INTERVAL_MS = 16
export const HOME_TOP_REFRESH_REPLAY_MIN_VISIBLE_DURATION_MS = 260
export const HOME_MARKET_CARD_IMAGE_SCAN_DURATION_MS = 220
export const HOME_MARKET_CARD_STAGGER_STEP_MS = 100
export const HOME_MARKET_CARD_FALLBACK_TEXT = '网络较慢'
export const HOME_MARKET_GRID_COLUMNS = 2
export const HOME_MARKET_GRID_COLUMN_GAP_PX = 16
export const HOME_MARKET_GRID_ROW_GAP_PX = 16
export const HOME_MARKET_CARD_COPY_HEIGHT_PX = 72
export const HOME_MARKET_CARD_FALLBACK_WIDTH_PX = 164
export const HOME_MARKET_MOUNT_BUFFER_TOP_ROWS = 2
export const HOME_MARKET_MOUNT_BUFFER_BOTTOM_ROWS = 3
export const HOME_MARKET_DEFAULT_SORT_LABEL = '默认排序'
