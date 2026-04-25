// Responsibility: Manage active/applied market tag state and tag-driven query trigger handoff
// for the home rail market head.
// Out of scope: Result filtering execution, network requests, or result window replay logic.

import { computed, ref, type ComputedRef } from 'vue'
import type { HomeMarketTag } from '../../../../models/home-rail/homeRailHome.model'

interface UseHomeMarketTagSelectionRuntimeOptions {
  marketTags: ComputedRef<HomeMarketTag[]>
  emitMarketTagSelect: (tagLabel: string, index: number) => void
  dismissSortPopover: () => void
  scheduleMarketQuerySwitchApply: () => void
}

export const useHomeMarketTagSelectionRuntime = ({
  marketTags,
  emitMarketTagSelect,
  dismissSortPopover,
  scheduleMarketQuerySwitchApply,
}: UseHomeMarketTagSelectionRuntimeOptions) => {
  const activeMarketTagId = ref('all')
  const appliedMarketTagId = ref('all')

  const activeMarketTag = computed(() => {
    return (
      marketTags.value.find((tag) => tag.id === activeMarketTagId.value) ??
      marketTags.value.find((tag) => tag.id === 'all') ??
      marketTags.value[0] ?? { id: 'all', label: '全部' }
    )
  })

  const appliedMarketTag = computed(() => {
    return (
      marketTags.value.find((tag) => tag.id === appliedMarketTagId.value) ??
      marketTags.value.find((tag) => tag.id === 'all') ??
      marketTags.value[0] ?? { id: 'all', label: '全部' }
    )
  })

  const syncMarketTagSelection = (tags = marketTags.value) => {
    const nextTagId =
      tags.find((tag) => tag.id === activeMarketTagId.value)?.id ??
      tags.find((tag) => tag.id === 'all')?.id ??
      tags[0]?.id ??
      'all'
    activeMarketTagId.value = nextTagId

    const nextAppliedTagId =
      tags.find((tag) => tag.id === appliedMarketTagId.value)?.id ??
      tags.find((tag) => tag.id === activeMarketTagId.value)?.id ??
      tags.find((tag) => tag.id === 'all')?.id ??
      tags[0]?.id ??
      'all'
    appliedMarketTagId.value = nextAppliedTagId
  }

  const handleMarketTagSelect = (tag: HomeMarketTag) => {
    if (activeMarketTagId.value === tag.id) {
      return
    }

    dismissSortPopover()
    activeMarketTagId.value = tag.id
    const nextIndex = marketTags.value.findIndex((entry) => entry.id === tag.id)
    emitMarketTagSelect(tag.label, nextIndex >= 0 ? nextIndex : 0)
    scheduleMarketQuerySwitchApply()
  }

  return {
    activeMarketTag,
    activeMarketTagId,
    appliedMarketTag,
    appliedMarketTagId,
    handleMarketTagSelect,
    syncMarketTagSelection,
  }
}
