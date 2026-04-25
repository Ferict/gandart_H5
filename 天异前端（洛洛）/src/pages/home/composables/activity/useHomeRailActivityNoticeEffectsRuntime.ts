/**
 * Responsibility: co-locate the activity rail notice effects wiring behind the panel runtime.
 * Out of scope: activity effects implementation details and page template structure.
 */
import { useHomeRailActivityEffects } from './useHomeRailActivityEffects'

type HomeRailActivityEffectsOptions = Parameters<typeof useHomeRailActivityEffects>[0]

export const useHomeRailActivityNoticeEffectsRuntime = (
  options: HomeRailActivityEffectsOptions
) => {
  useHomeRailActivityEffects(options)
}
