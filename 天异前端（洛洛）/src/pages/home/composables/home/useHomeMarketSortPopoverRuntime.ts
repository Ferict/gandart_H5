// Responsibility: Manage the market sort trigger, popover mount element, menu options, and
// selection handoff for the home rail market head.
// Out of scope: Query execution, result window switching, or any market data fetching logic.

import { computed, ref, type ComputedRef, type Ref } from 'vue'
import type {
  HomeMarketSortDirection as MarketSortDirection,
  HomeMarketSortField as MarketSortField,
  HomeMarketSortOption,
  HomeRailHomeContent,
} from '../../../../models/home-rail/homeRailHome.model'
import { resolveTemplateRefElement } from '../../../../utils/resolveTemplateRefElement.util'

export interface HomeMarketSortMenuOption {
  key: 'default' | MarketSortField
  label: string
  isDefault: boolean
  field?: MarketSortField
}

interface UseHomeMarketSortPopoverRuntimeOptions {
  marketContent: ComputedRef<HomeRailHomeContent['market']>
  defaultSortLabel: string
  emitMarketSortClick: () => void
  scheduleMarketQuerySwitchApply: () => void
  marketSortLayerRef: Ref<HTMLElement | null>
  marketSortField: Ref<MarketSortField>
  marketSortDirection: Ref<MarketSortDirection>
  isMarketDefaultSortSelected: Ref<boolean>
  isAppliedMarketDefaultSortSelected: Ref<boolean>
  appliedMarketSortField: Ref<MarketSortField>
  appliedMarketSortDirection: Ref<MarketSortDirection>
}

const MARKET_SORT_POPOVER_UPWARD_VIEWPORT_THRESHOLD_PX = 848

export const useHomeMarketSortPopoverRuntime = ({
  marketContent,
  defaultSortLabel,
  emitMarketSortClick,
  scheduleMarketQuerySwitchApply,
  marketSortLayerRef,
  marketSortField,
  marketSortDirection,
  isMarketDefaultSortSelected,
  isAppliedMarketDefaultSortSelected,
  appliedMarketSortField,
  appliedMarketSortDirection,
}: UseHomeMarketSortPopoverRuntimeOptions) => {
  const marketSortOptions = computed<HomeMarketSortOption[]>(
    () => marketContent.value.sortConfig.options
  )
  const isMarketSortPopoverOpen = ref(false)
  const marketSortPopoverPlacement = ref<'down' | 'up'>('down')
  let marketSortPopoverScrollHost: EventTarget | null = null

  const activeMarketSortOption = computed<HomeMarketSortOption | null>(() => {
    return (
      marketSortOptions.value.find((option) => option.field === marketSortField.value) ??
      marketSortOptions.value[0]
    )
  })

  const marketSortMenuOptions = computed<HomeMarketSortMenuOption[]>(() => {
    return [
      {
        key: 'default',
        label: defaultSortLabel,
        isDefault: true,
      },
      ...marketSortOptions.value.map((option) => ({
        key: option.field,
        label: option.label,
        isDefault: false,
        field: option.field,
      })),
    ]
  })

  const marketSortTriggerLabel = computed(() => {
    if (isMarketDefaultSortSelected.value) {
      return `打开市场排序，当前按${defaultSortLabel}`
    }

    const activeLabel = activeMarketSortOption.value?.label ?? defaultSortLabel
    const directionLabel = marketSortDirection.value === 'asc' ? '正序' : '反序'
    return `打开市场排序，当前按${activeLabel}${directionLabel}`
  })

  const syncMarketSortConfig = (
    sortConfig = marketContent.value.sortConfig,
    options: { preserveCurrent?: boolean } = {}
  ) => {
    const preserveCurrent = options.preserveCurrent ?? false
    const hasCurrentField = sortConfig.options.some(
      (option) => option.field === marketSortField.value
    )
    if (!preserveCurrent) {
      isMarketDefaultSortSelected.value = true
      marketSortField.value = sortConfig.defaultField
      marketSortDirection.value = sortConfig.defaultDirection
      isAppliedMarketDefaultSortSelected.value = true
      appliedMarketSortField.value = sortConfig.defaultField
      appliedMarketSortDirection.value = sortConfig.defaultDirection
      return
    }

    if (isMarketDefaultSortSelected.value) {
      marketSortField.value = sortConfig.defaultField
      marketSortDirection.value = sortConfig.defaultDirection
      isAppliedMarketDefaultSortSelected.value = true
      appliedMarketSortField.value = sortConfig.defaultField
      appliedMarketSortDirection.value = sortConfig.defaultDirection
      return
    }

    if (!hasCurrentField) {
      isMarketDefaultSortSelected.value = true
      marketSortField.value = sortConfig.defaultField
      marketSortDirection.value = sortConfig.defaultDirection
      isAppliedMarketDefaultSortSelected.value = true
      appliedMarketSortField.value = sortConfig.defaultField
      appliedMarketSortDirection.value = sortConfig.defaultDirection
    }
  }

  const resolveMarketSortPopoverPlacement = (): 'down' | 'up' => {
    if (typeof window === 'undefined') {
      return 'down'
    }

    return window.innerHeight <= MARKET_SORT_POPOVER_UPWARD_VIEWPORT_THRESHOLD_PX ? 'up' : 'down'
  }

  const handleMarketSortDismiss = () => {
    isMarketSortPopoverOpen.value = false
  }

  const handleMarketSortPopoverViewportChange = () => {
    handleMarketSortDismiss()
  }

  const handleMarketSortPopoverOutsidePointerDown = (event: Event) => {
    if (!isMarketSortPopoverOpen.value) {
      return
    }

    const layerElement = resolveTemplateRefElement(marketSortLayerRef.value)
    const targetNode = event.target as Node | null
    if (layerElement && targetNode && layerElement.contains(targetNode)) {
      return
    }

    handleMarketSortDismiss()
  }

  const bindMarketSortPopoverViewportListeners = () => {
    if (typeof window === 'undefined') {
      return
    }

    window.addEventListener('resize', handleMarketSortPopoverViewportChange, { passive: true })
    window.addEventListener('orientationchange', handleMarketSortPopoverViewportChange)
    if (typeof document !== 'undefined') {
      marketSortPopoverScrollHost = document.querySelector('.home-track-panel-scroll')
      marketSortPopoverScrollHost?.addEventListener(
        'scroll',
        handleMarketSortPopoverViewportChange,
        {
          passive: true,
        }
      )
      document.addEventListener('pointerdown', handleMarketSortPopoverOutsidePointerDown, true)
    }
  }

  const unbindMarketSortPopoverViewportListeners = () => {
    if (typeof window !== 'undefined') {
      window.removeEventListener('resize', handleMarketSortPopoverViewportChange)
      window.removeEventListener('orientationchange', handleMarketSortPopoverViewportChange)
    }

    marketSortPopoverScrollHost?.removeEventListener(
      'scroll',
      handleMarketSortPopoverViewportChange
    )
    if (typeof document !== 'undefined') {
      document.removeEventListener('pointerdown', handleMarketSortPopoverOutsidePointerDown, true)
    }
    marketSortPopoverScrollHost = null
  }

  const handleMarketSortTriggerClick = () => {
    emitMarketSortClick()

    if (isMarketSortPopoverOpen.value) {
      handleMarketSortDismiss()
      return
    }

    marketSortPopoverPlacement.value = resolveMarketSortPopoverPlacement()
    isMarketSortPopoverOpen.value = true
  }

  const isMarketSortOptionActive = (option: HomeMarketSortMenuOption) => {
    if (option.isDefault) {
      return isMarketDefaultSortSelected.value
    }

    return !isMarketDefaultSortSelected.value && option.field === marketSortField.value
  }

  const resolveMarketSortOptionAriaLabel = (option: HomeMarketSortMenuOption) => {
    if (option.isDefault) {
      return `按${option.label}排序`
    }

    const directionLabel = isMarketSortOptionActive(option)
      ? marketSortDirection.value === 'asc'
        ? '正序'
        : '反序'
      : ''
    const label = option.label
    return directionLabel ? `按${label}${directionLabel}排序` : `按${label}排序`
  }

  const handleMarketSortOptionSelect = (option: HomeMarketSortMenuOption) => {
    if (option.isDefault) {
      isMarketDefaultSortSelected.value = true
      marketSortField.value = marketContent.value.sortConfig.defaultField
      marketSortDirection.value = marketContent.value.sortConfig.defaultDirection
    } else if (!option.field) {
      return
    } else if (!isMarketDefaultSortSelected.value && marketSortField.value === option.field) {
      marketSortDirection.value = marketSortDirection.value === 'asc' ? 'desc' : 'asc'
    } else {
      isMarketDefaultSortSelected.value = false
      marketSortField.value = option.field
      marketSortDirection.value = 'asc'
    }

    isMarketSortPopoverOpen.value = false
    scheduleMarketQuerySwitchApply()
  }

  return {
    activeMarketSortOption,
    bindMarketSortPopoverViewportListeners,
    handleMarketSortDismiss,
    handleMarketSortOptionSelect,
    handleMarketSortTriggerClick,
    isMarketSortOptionActive,
    isMarketSortPopoverOpen,
    marketSortMenuOptions,
    marketSortPopoverPlacement,
    marketSortTriggerLabel,
    resolveMarketSortOptionAriaLabel,
    syncMarketSortConfig,
    unbindMarketSortPopoverViewportListeners,
  }
}
