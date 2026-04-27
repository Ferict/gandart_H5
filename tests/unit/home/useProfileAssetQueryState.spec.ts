import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useProfileAssetQueryState } from '@/pages/home/composables/profile/useProfileAssetQueryState'
import type {
  HomeRailProfileContent,
  ProfileAssetItem,
} from '@/models/home-rail/homeRailProfile.model'

const createProfileContent = (): HomeRailProfileContent => ({
  summary: {
    displayName: 'Tester',
    summary: 'Profile summary',
    currency: 'CNY',
    totalValue: '1000',
    holdings: '2',
    address: '0x1234567890abcdef',
  },
  categories: [
    {
      id: 'collections',
      label: 'Collections',
      subCategories: ['All', 'Reserved', '资格证'],
    },
    {
      id: 'blindBoxes',
      label: 'Blind boxes',
      subCategories: ['All', 'Unopened'],
    },
  ],
  assets: {
    collections: [],
    blindBoxes: [],
  },
})

const createAsset = (id: string, subCategory: string): ProfileAssetItem => ({
  id,
  name: `Asset ${id}`,
  date: '2026-04-01',
  subCategory,
  holdingsCount: 1,
  priceUnit: 'CNY',
  price: 100,
  editionCode: 'E-001',
  issueCount: 1,
  imageUrl: '',
  visualTone: 'ink',
  target: {
    targetType: 'asset',
    targetId: id,
  },
})

const createHarness = () => {
  const content = computed(() => createProfileContent())
  const activeCategory = ref<'collections' | 'blindBoxes'>('collections')
  const activeSubCategory = ref('')

  const currentCategoryAssets = computed(() => {
    if (activeCategory.value === 'collections') {
      return [createAsset('c1', 'Reserved'), createAsset('c2', 'Unopened')]
    }

    if (activeCategory.value === 'blindBoxes') {
      return [createAsset('b1', 'Unopened')]
    }

    return []
  })

  const state = useProfileAssetQueryState({
    resolvedProfileCategories: computed(() => content.value.categories),
    currentCategoryAssets,
    emitScrollToAssetsSection: vi.fn(),
    activeCategoryRef: activeCategory,
    activeSubCategoryRef: activeSubCategory,
  })

  return {
    state,
    activeCategory,
    activeSubCategory,
  }
}

describe('useProfileAssetQueryState', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('debounces keyword input for 300ms and keeps the latest profile keyword', async () => {
    vi.useFakeTimers()
    const { state } = createHarness()

    state.handleProfileKeywordInput({
      detail: {
        value: '  first',
      },
    } as unknown as Event)
    expect(state.resolveProfileAssetQuerySnapshot().keyword).toBeUndefined()

    await vi.advanceTimersByTimeAsync(110)
    state.handleProfileKeywordInput({
      target: {
        value: '  second',
      },
    } as unknown as Event)

    await vi.advanceTimersByTimeAsync(299)
    expect(state.resolveProfileAssetQuerySnapshot().keyword).toBeUndefined()
    expect(state.profileKeyword.value).toBe('second')

    await vi.advanceTimersByTimeAsync(1)
    expect(state.resolveProfileAssetQuerySnapshot().keyword).toBe('second')
    expect(state.profileKeyword.value).toBe('second')
    expect(state.isProfileSearchApplied.value).toBe(true)
  })

  it('clears pending profile search immediately when search is collapsed', async () => {
    vi.useFakeTimers()
    const { state } = createHarness()

    state.isProfileSearchVisible.value = true
    state.handleProfileKeywordInput({
      detail: {
        value: 'Collectible',
      },
    } as unknown as Event)
    await vi.advanceTimersByTimeAsync(100)

    state.clearProfileSearchState({ collapse: true })
    expect(state.profileKeyword.value).toBe('')
    expect(state.isProfileSearchVisible.value).toBe(false)
    expect(state.isProfileSearchApplied.value).toBe(false)
    expect(state.resolveProfileAssetQuerySnapshot().keyword).toBeUndefined()

    await vi.advanceTimersByTimeAsync(300)
    expect(state.resolveProfileAssetQuerySnapshot().keyword).toBeUndefined()
  })

  it('applies category and subcategory switches immediately so the active UI and query stay aligned', () => {
    const { state, activeCategory } = createHarness()

    state.handleCategoryChange('blindBoxes')
    state.handleSubCategoryChange('Unopened')
    expect(state.resolveProfileAssetQuerySnapshot()).toMatchObject({
      categoryId: 'blindBoxes',
      subCategory: 'Unopened',
      keyword: undefined,
      page: 1,
      pageSize: 15,
    })

    state.handleCategoryChange('collections')
    state.handleSubCategoryChange('资格证')

    expect(activeCategory.value).toBe('collections')

    expect(state.resolveProfileAssetQuerySnapshot()).toMatchObject({
      categoryId: 'collections',
      subCategory: '资格证',
      keyword: undefined,
      page: 1,
      pageSize: 15,
    })
  })
})
