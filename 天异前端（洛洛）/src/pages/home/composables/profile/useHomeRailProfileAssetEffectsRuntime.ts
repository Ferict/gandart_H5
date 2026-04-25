/**
 * Responsibility: co-locate the profile rail asset effects wiring behind the panel runtime.
 * Out of scope: profile effects implementation details and page template structure.
 */
import { useHomeRailProfileEffects } from './useHomeRailProfileEffects'

type HomeRailProfileEffectsOptions = Parameters<typeof useHomeRailProfileEffects>[0]

export const useHomeRailProfileAssetEffectsRuntime = (options: HomeRailProfileEffectsOptions) => {
  useHomeRailProfileEffects(options)
}
