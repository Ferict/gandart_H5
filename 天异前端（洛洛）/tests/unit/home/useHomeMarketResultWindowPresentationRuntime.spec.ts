import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useHomeMarketResultWindowPresentationRuntime } from '@/pages/home/composables/home/useHomeMarketResultWindowPresentationRuntime'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string): HomeMarketCard =>
  ({
    id,
    name: `card-${id}`,
    price: '100',
    priceUnit: 'CNY',
    imageUrl: `https://cdn.example.com/${id}.png`,
  }) as HomeMarketCard

describe('useHomeMarketResultWindowPresentationRuntime', () => {
  it('derives first-screen and footer modes from the current result state', () => {
    const displayedCollection = ref<HomeMarketCard[]>([])
    const isMarketListLoading = ref(true)
    const marketListLoadingPhase = ref<'idle' | 'first-screen' | 'pagination'>('first-screen')
    const isMarketPaginationChainLoading = ref(false)
    const hasResolvedRemoteMarketList = ref(false)
    const hasMarketFirstScreenError = ref(false)
    const hasMarketPaginationError = ref(false)
    const hasMoreMarketItems = computed(() => true)
    const marketResultTotal = ref(0)

    const runtime = useHomeMarketResultWindowPresentationRuntime({
      isMarketExhausted: computed(() => false),
      displayedCollection,
      isMarketListLoading,
      marketListLoadingPhase,
      isMarketPaginationChainLoading: computed(() => isMarketPaginationChainLoading.value),
      hasResolvedRemoteMarketList,
      hasMarketFirstScreenError,
      hasMarketPaginationError,
      hasMoreMarketItems,
      marketResultTotal,
      marketCardEntryPhaseMap: ref({}),
      marketPlaceholderCardIdSet: ref(new Set<string>()),
      marketResultMotionSource: ref<'manual-query-switch' | ''>(''),
      marketCurrentEnterAddedIdSet: ref(new Set<string>()),
      mountedMarketItems: ref([]),
      hasMarketImage: (item) => Boolean(item.imageUrl),
      gridColumns: 2,
      staggerStepMs: 24,
    })

    expect(runtime.shouldShowHomeMarketFirstScreenLoading.value).toBe(true)
    expect(runtime.shouldRenderHomeBottomFooter.value).toBe(false)

    displayedCollection.value = [createCard('a')]
    isMarketListLoading.value = false
    marketListLoadingPhase.value = 'idle'
    hasMarketPaginationError.value = true

    expect(runtime.shouldRenderHomeBottomFooter.value).toBe(true)
    expect(runtime.homeBottomFooterMode.value).toBe('error')

    hasMarketPaginationError.value = false
    expect(runtime.shouldRenderHomeBottomFooter.value).toBe(false)

    isMarketPaginationChainLoading.value = true
    expect(runtime.shouldRenderHomeBottomFooter.value).toBe(true)
    expect(runtime.homeBottomFooterMode.value).toBe('loading')
  })

  it('builds removed overlay and card entry presentation from the result motion state', () => {
    const runtime = useHomeMarketResultWindowPresentationRuntime({
      isMarketExhausted: computed(() => false),
      displayedCollection: ref([createCard('a')]),
      isMarketListLoading: ref(false),
      marketListLoadingPhase: ref<'idle' | 'first-screen' | 'pagination'>('idle'),
      isMarketPaginationChainLoading: computed(() => false),
      hasResolvedRemoteMarketList: ref(true),
      hasMarketFirstScreenError: ref(false),
      hasMarketPaginationError: ref(false),
      hasMoreMarketItems: computed(() => true),
      marketResultTotal: ref(1),
      marketCardEntryPhaseMap: ref({ a: 'entering' }),
      marketPlaceholderCardIdSet: ref(new Set<string>(['placeholder'])),
      marketResultMotionSource: ref<'manual-query-switch' | ''>('manual-query-switch'),
      marketCurrentEnterAddedIdSet: ref(new Set<string>()),
      mountedMarketItems: ref([createCard('a')]),
      hasMarketImage: (item) => Boolean(item.imageUrl),
      gridColumns: 2,
      staggerStepMs: 24,
    })

    expect(runtime.resolveMarketRemovedOverlayItemStyle(3).gridColumnStart).toBe('2')
    expect(runtime.resolveMarketRemovedOverlayRevealPhase(createCard('a'))).toBe('steady')
    expect(runtime.isMarketCardPlaceholder('placeholder')).toBe(true)
    expect(runtime.resolveMarketCardEntryClass('a')['is-entering']).toBe(true)
    expect(runtime.resolveMarketCardEntryStyle('a', 1)['--home-market-card-entry-delay']).toBe(
      '24ms'
    )
  })
})
