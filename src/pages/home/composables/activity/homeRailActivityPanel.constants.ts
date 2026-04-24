/**
 * Responsibility: host stable constants for the home activity rail panel so layout and
 * panel-shell configuration values stay out of the component body.
 * Out of scope: query state, refresh workflows, result windows, and reveal orchestration.
 */

export const IS_HOME_RAIL_ACTIVITY_DEV = Boolean(
  (import.meta as unknown as { env?: { DEV?: boolean } }).env?.DEV
)
