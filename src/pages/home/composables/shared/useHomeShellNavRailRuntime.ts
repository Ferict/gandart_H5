/**
 * Responsibility: host HomeShellNavRail entry resolution, active-state checks, and guarded
 * navigation dispatch without changing the component contract.
 * Out of scope: drawer entry source construction, shell layout state, and visual presentation.
 */

import type {
  HomeShellDrawerEntry,
  HomeShellDrawerEntryId,
} from '../../../../models/home-shell/homeShellMenu.model'
import { navigateByUrlSafely } from '../../../../services/home-rail/homeRailNavigation.service'
import { useResolvedHomeShellDrawerEntries } from '../../../../services/home-shell/homeShellMenuState.service'

interface UseHomeShellNavRailRuntimeOptions {
  resolveActiveEntryId: () => HomeShellDrawerEntryId | undefined
}

export const useHomeShellNavRailRuntime = ({
  resolveActiveEntryId,
}: UseHomeShellNavRailRuntimeOptions) => {
  const railEntries = useResolvedHomeShellDrawerEntries()

  const isEntryActive = (entry: HomeShellDrawerEntry) => {
    return resolveActiveEntryId() === entry.id
  }

  const handleNavActivate = (entry: HomeShellDrawerEntry) => {
    if (isEntryActive(entry) || !entry.routeUrl) {
      return
    }

    navigateByUrlSafely(entry.routeUrl)
  }

  return {
    railEntries,
    isEntryActive,
    handleNavActivate,
  }
}
