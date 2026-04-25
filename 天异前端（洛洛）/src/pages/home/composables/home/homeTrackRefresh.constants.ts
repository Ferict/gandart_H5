/**
 * Responsibility: host stable pull-refresh geometry constants for the home track shell so
 * refresh thresholds stay centralized and reusable.
 * Out of scope: refresh state ownership, gesture handling, and replay timing behavior.
 */
export const HOME_TRACK_PULL_REFRESH_CONTENT_LOCK_OFFSET_PX = 24
export const HOME_TRACK_PULL_REFRESH_REVEAL_RAW_DISTANCE_PX = 120
export const HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX =
  HOME_TRACK_PULL_REFRESH_CONTENT_LOCK_OFFSET_PX + HOME_TRACK_PULL_REFRESH_REVEAL_RAW_DISTANCE_PX
export const HOME_TRACK_REFRESH_TOP_OFFSET_PX = 80
export const HOME_TRACK_REFRESH_INDICATOR_FADE_IN_RISE_PX = 10
export const HOME_TRACK_PULL_RESISTANCE_POWER = 1.75
