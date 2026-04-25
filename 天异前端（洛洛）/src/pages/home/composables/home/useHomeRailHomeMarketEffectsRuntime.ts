/**
 * Responsibility: co-locate the home rail market effects wiring behind the panel runtime.
 * Out of scope: market effects implementation details and page template structure.
 */
import { useHomeRailHomeEffects } from './useHomeRailHomeEffects'

type HomeRailHomeEffectsOptions = Parameters<typeof useHomeRailHomeEffects>[0]

export const useHomeRailHomeMarketEffectsRuntime = (options: HomeRailHomeEffectsOptions) => {
  useHomeRailHomeEffects(options)
}
