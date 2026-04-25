import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useHomeMarketQueryState } from '@/pages/home/composables/home/useHomeMarketQueryState'
import type { HomeRailHomeContent } from '@/models/home-rail/homeRailHome.model'

const createMarketContent = (): HomeRailHomeContent['market'] => ({
  sectionTitle: 'Market',
  sectionSubtitle: 'Latest collectibles',
  tags: [
    { id: 'all', label: 'All' },
    { id: 'featured', label: 'Featured' },
    { id: 'hot', label: 'Hot' },
  ],
  actions: [],
  sortConfig: {
    defaultField: 'listedAt',
    defaultDirection: 'desc',
    options: [
      { field: 'price', label: 'Price' },
      { field: 'listedAt', label: 'Time' },
    ],
  },
  cards: [],
})

const createHarness = () => {
  const marketContent = computed(() => createMarketContent())
  const marketTags = computed(() => marketContent.value.tags)

  const state = useHomeMarketQueryState({
    marketContent,
    marketTags,
    hasBootstrappedMarketResults: ref(false),
    emitMarketSearchClick: vi.fn(),
    emitMarketSortClick: vi.fn(),
    emitMarketTagSelect: vi.fn(),
    scheduleMarketMountWindowSync: vi.fn(),
    defaultSortLabel: 'Default',
    pageSize: 60,
  })

  return {
    state,
    marketTags: marketTags.value,
  }
}

describe('useHomeMarketQueryState', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces keyword input for 300ms and keeps the latest market keyword', async () => {
    vi.useFakeTimers()
    const { state } = createHarness()

    state.handleMarketKeywordInput({
      detail: {
        value: '  first',
      },
    } as unknown as Event)
    expect(state.resolveMarketListQuerySnapshot().keyword).toBeUndefined()

    await vi.advanceTimersByTimeAsync(110)
    state.handleMarketKeywordInput({
      target: {
        value: '  second',
      },
    } as unknown as Event)

    await vi.advanceTimersByTimeAsync(299)
    expect(state.resolveMarketListQuerySnapshot().keyword).toBeUndefined()
    expect(state.marketKeyword.value).toBe('second')

    await vi.advanceTimersByTimeAsync(1)
    expect(state.resolveMarketListQuerySnapshot().keyword).toBe('second')
    expect(state.marketKeyword.value).toBe('second')
    expect(state.isMarketSearchApplied.value).toBe(true)
  })

  it('clears pending search immediately when search is dismissed', async () => {
    vi.useFakeTimers()
    const { state } = createHarness()

    state.isMarketSearchVisible.value = true
    state.handleMarketKeywordInput({
      detail: {
        value: 'Collectible',
      },
    } as unknown as Event)
    await vi.advanceTimersByTimeAsync(100)

    state.clearHomeMarketSearchState()
    expect(state.marketKeyword.value).toBe('')
    expect(state.isMarketSearchVisible.value).toBe(false)
    expect(state.isMarketSearchApplied.value).toBe(false)
    expect(state.resolveMarketListQuerySnapshot().keyword).toBeUndefined()

    await vi.advanceTimersByTimeAsync(300)
    expect(state.resolveMarketListQuerySnapshot().keyword).toBeUndefined()
  })

  it('applies tag and sort switches immediately so the active UI and query stay aligned', () => {
    const { state, marketTags } = createHarness()

    const sortOptions = state.marketSortMenuOptions.value
    expect(sortOptions).toHaveLength(3)

    state.handleMarketTagSelect(marketTags[1])
    state.handleMarketSortOptionSelect(sortOptions[1])
    expect(state.resolveMarketListQuerySnapshot()).toMatchObject({
      categoryId: 'featured',
      keyword: undefined,
      sort: {
        field: 'price',
        direction: 'asc',
      },
    })

    state.handleMarketTagSelect(marketTags[2])
    state.handleMarketSortOptionSelect(sortOptions[2])

    expect(state.resolveMarketListQuerySnapshot()).toMatchObject({
      categoryId: 'hot',
      keyword: undefined,
      sort: {
        field: 'listedAt',
        direction: 'asc',
      },
    })
    expect(state.marketListQuerySignature.value).toBe('hot::::listedAt::asc')
  })
})
