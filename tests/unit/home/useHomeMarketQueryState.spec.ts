import { computed } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useHomeMarketQueryState } from '@/pages/home/composables/home/useHomeMarketQueryState'
import type { HomeMarketTag } from '@/models/home-rail/homeRailHome.model'
const marketTagSeeds: HomeMarketTag[] = [
  { id: 'all', label: 'All' },
  { id: 'featured', label: 'Featured', marketKinds: ['collections'] },
  { id: 'box-series', label: 'Box Series', marketKinds: ['blindBoxes'] },
  { id: 'shared', label: 'Shared', marketKinds: ['collections', 'blindBoxes'] },
]

const createHarness = () => {
  const marketTags = computed(() => marketTagSeeds)

  const state = useHomeMarketQueryState({
    marketTags,
    emitMarketSearchClick: vi.fn(),
    emitMarketTagSelect: vi.fn(),
    scheduleMarketMountWindowSync: vi.fn(),
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

  it('applies tag switches immediately so the active UI and query stay aligned', () => {
    const { state } = createHarness()
    const visibleMarketTags = state.marketTags.value

    state.handleMarketTagSelect(visibleMarketTags[1])
    expect(state.resolveMarketListQuerySnapshot()).toMatchObject({
      categoryId: 'featured',
      keyword: undefined,
    })

    state.handleMarketTagSelect(visibleMarketTags[2])

    expect(state.resolveMarketListQuerySnapshot()).toMatchObject({
      categoryId: 'shared',
      keyword: undefined,
    })
    expect(state.marketListQuerySignature.value).toBe('collections::shared::')
  })

  it('includes marketKind in signature and resets tag when kind changes', () => {
    const { state } = createHarness()

    state.handleMarketTagSelect(state.marketTags.value[2])
    expect(state.resolveMarketListQuerySnapshot()).toMatchObject({
      marketKind: 'collections',
      categoryId: 'shared',
    })

    state.handleMarketKindSelect('blindBoxes')

    expect(state.resolveMarketListQuerySnapshot()).toMatchObject({
      marketKind: 'blindBoxes',
      categoryId: undefined,
    })
    expect(state.marketListQuerySignature.value).toBe('blindBoxes::::')
  })

  it('exposes different tag lists for collections and blind boxes', () => {
    const { state } = createHarness()

    expect(state.marketTags.value.map((tag) => tag.id)).toEqual(['all', 'featured', 'shared'])

    state.handleMarketKindSelect('blindBoxes')

    expect(state.marketTags.value.map((tag) => tag.id)).toEqual(['all', 'box-series', 'shared'])
    state.handleMarketTagSelect(state.marketTags.value[1])
    expect(state.resolveMarketListQuerySnapshot()).toMatchObject({
      marketKind: 'blindBoxes',
      categoryId: 'box-series',
    })
  })

  it('keeps applied keyword when marketKind changes', async () => {
    vi.useFakeTimers()
    const { state } = createHarness()

    state.handleMarketKeywordInput({
      detail: {
        value: 'dragon',
      },
    } as unknown as Event)
    await vi.advanceTimersByTimeAsync(300)
    state.handleMarketKindSelect('blindBoxes')

    expect(state.resolveMarketListQuerySnapshot()).toMatchObject({
      marketKind: 'blindBoxes',
      keyword: 'dragon',
    })
  })
})
