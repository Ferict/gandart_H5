import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useHomeMarketSortPopoverRuntime } from '@/pages/home/composables/home/useHomeMarketSortPopoverRuntime'
import type { HomeRailHomeContent } from '@/models/home-rail/homeRailHome.model'

const createMarketContent = (): HomeRailHomeContent['market'] => ({
  sectionTitle: 'Market',
  sectionSubtitle: 'Latest collectibles',
  tags: [],
  actions: [],
  sortConfig: {
    defaultField: 'listedAt',
    defaultDirection: 'desc',
    options: [
      { field: 'price', label: 'Price' },
      { field: 'tradeVolume24h', label: '24h Volume' },
    ],
  },
  cards: [],
})

const createHarness = () => {
  const marketContent = computed(() => createMarketContent())
  const runtime = useHomeMarketSortPopoverRuntime({
    marketContent,
    defaultSortLabel: 'Default',
    emitMarketSortClick: vi.fn(),
    scheduleMarketQuerySwitchApply: vi.fn(),
    marketSortLayerRef: ref<HTMLElement | null>(null),
    marketSortField: ref<'listedAt' | 'price' | 'tradeVolume24h'>('listedAt'),
    marketSortDirection: ref<'asc' | 'desc'>('desc'),
    isMarketDefaultSortSelected: ref(true),
    isAppliedMarketDefaultSortSelected: ref(true),
    appliedMarketSortField: ref<'listedAt' | 'price' | 'tradeVolume24h'>('listedAt'),
    appliedMarketSortDirection: ref<'asc' | 'desc'>('desc'),
  })

  return {
    marketContent,
    runtime,
  }
}

describe('useHomeMarketSortPopoverRuntime', () => {
  it('opens the popover and resolves upward placement on a short viewport', () => {
    const { runtime } = createHarness()
    const originalWindow = globalThis.window
    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: {
        innerHeight: 800,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
      },
    })

    runtime.handleMarketSortTriggerClick()
    expect(runtime.isMarketSortPopoverOpen.value).toBe(true)
    expect(runtime.marketSortPopoverPlacement.value).toBe('up')

    if (originalWindow === undefined) {
      delete (globalThis as typeof globalThis & { window?: Window }).window
      return
    }

    Object.defineProperty(globalThis, 'window', {
      configurable: true,
      value: originalWindow,
    })
  })

  it('toggles direction when the same sort option is selected twice', () => {
    const { runtime } = createHarness()
    const priceOption = runtime.marketSortMenuOptions.value.find((option) => option.key === 'price')
    expect(priceOption).toBeTruthy()

    runtime.handleMarketSortOptionSelect(priceOption!)
    expect(runtime.isMarketSortOptionActive(priceOption!)).toBe(true)
    expect(runtime.resolveMarketSortOptionAriaLabel(priceOption!)).toContain('正序')

    runtime.handleMarketSortOptionSelect(priceOption!)
    expect(runtime.resolveMarketSortOptionAriaLabel(priceOption!)).toContain('反序')
  })
})
