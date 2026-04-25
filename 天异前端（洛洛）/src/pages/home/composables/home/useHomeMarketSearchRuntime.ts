// Responsibility: Manage the market search bar reveal state, debounce lifecycle, and search
// entry interactions for the home rail market head.
// Out of scope: Search result fetching, query diff application, or result window presentation.

import { computed, ref } from 'vue'

interface SearchDebounceController {
  schedule: (task: () => void, delayMs: number) => void
  clear: () => void
}

interface UseHomeMarketSearchRuntimeOptions {
  emitMarketSearchClick: () => void
  dismissSortPopover: () => void
  scheduleMarketMountWindowSync: () => void
  searchDebounce: SearchDebounceController
}

const MARKET_SEARCH_REVEAL_FALLBACK_HEIGHT_PX = 46
const MARKET_SEARCH_QUERY_DEBOUNCE_MS = 300

export const useHomeMarketSearchRuntime = ({
  emitMarketSearchClick,
  dismissSortPopover,
  scheduleMarketMountWindowSync,
  searchDebounce,
}: UseHomeMarketSearchRuntimeOptions) => {
  const marketKeyword = ref('')
  const appliedMarketKeyword = ref('')
  const isMarketSearchVisible = ref(false)
  const marketSearchRevealHeightPx = ref(0)

  const normalizedMarketKeyword = computed(() => marketKeyword.value.trim().toLowerCase())
  const normalizedAppliedMarketKeyword = computed(() => appliedMarketKeyword.value)
  const hasActiveMarketSearch = computed(() => normalizedMarketKeyword.value.length > 0)
  const isMarketSearchApplied = computed(() => appliedMarketKeyword.value.length > 0)

  const clearMarketListQueryDebounce = () => {
    searchDebounce.clear()
  }

  const clearHomeMarketSearchState = () => {
    clearMarketListQueryDebounce()
    marketKeyword.value = ''
    appliedMarketKeyword.value = ''
    isMarketSearchVisible.value = false
  }

  const resolveMarketSearchRevealHeightPx = (element: Element | null) => {
    const stageElement = element as HTMLElement | null
    const cardElement = stageElement?.querySelector<HTMLElement>('.home-market-search-card')
    const nextHeight = Math.ceil(cardElement?.offsetHeight ?? 0)
    if (nextHeight > 0) {
      marketSearchRevealHeightPx.value = nextHeight
    }
    return marketSearchRevealHeightPx.value || MARKET_SEARCH_REVEAL_FALLBACK_HEIGHT_PX
  }

  const cleanupMarketSearchRevealStage = (element: Element) => {
    const stageElement = element as HTMLElement
    stageElement.style.height = ''
    stageElement.style.overflow = ''
    stageElement.style.transition = ''
    stageElement.style.willChange = ''
  }

  const waitForMarketSearchRevealHeightTransition = (element: Element, done: () => void) => {
    const stageElement = element as HTMLElement
    const handleTransitionEnd = (event: TransitionEvent) => {
      if (event.target !== stageElement || event.propertyName !== 'height') {
        return
      }
      stageElement.removeEventListener('transitionend', handleTransitionEnd)
      done()
    }
    stageElement.addEventListener('transitionend', handleTransitionEnd)
  }

  const handleMarketSearchRevealBeforeEnter = (element: Element) => {
    const stageElement = element as HTMLElement
    const targetHeight = resolveMarketSearchRevealHeightPx(stageElement)
    stageElement.dataset.revealHeight = `${targetHeight}`
    stageElement.style.height = '0px'
    stageElement.style.overflow = 'hidden'
    stageElement.style.willChange = 'height'
  }

  const handleMarketSearchRevealEnter = (element: Element, done: () => void) => {
    const stageElement = element as HTMLElement
    const targetHeight = Number(
      stageElement.dataset.revealHeight ?? resolveMarketSearchRevealHeightPx(stageElement)
    )
    stageElement.style.transition = 'height 180ms cubic-bezier(0.22, 1, 0.36, 1)'
    void stageElement.offsetHeight
    requestAnimationFrame(() => {
      stageElement.style.height = `${targetHeight}px`
    })
    waitForMarketSearchRevealHeightTransition(stageElement, done)
  }

  const handleMarketSearchRevealAfterEnter = (element: Element) => {
    const stageElement = element as HTMLElement
    delete stageElement.dataset.revealHeight
    cleanupMarketSearchRevealStage(stageElement)
    scheduleMarketMountWindowSync()
  }

  const handleMarketSearchRevealBeforeLeave = (element: Element) => {
    const stageElement = element as HTMLElement
    const targetHeight = resolveMarketSearchRevealHeightPx(stageElement)
    stageElement.style.height = `${targetHeight}px`
    stageElement.style.overflow = 'hidden'
    stageElement.style.willChange = 'height'
  }

  const handleMarketSearchRevealLeave = (element: Element, done: () => void) => {
    const stageElement = element as HTMLElement
    stageElement.style.transition = 'height 180ms cubic-bezier(0.4, 0, 0.2, 1)'
    void stageElement.offsetHeight
    requestAnimationFrame(() => {
      stageElement.style.height = '0px'
    })
    waitForMarketSearchRevealHeightTransition(stageElement, done)
  }

  const handleMarketSearchRevealAfterLeave = (element: Element) => {
    cleanupMarketSearchRevealStage(element)
    scheduleMarketMountWindowSync()
  }

  const handleMarketSearchClick = () => {
    emitMarketSearchClick()
    dismissSortPopover()
    if (isMarketSearchVisible.value) {
      clearHomeMarketSearchState()
      return
    }

    isMarketSearchVisible.value = true
  }

  const handleMarketKeywordInput = (event: Event) => {
    const inputTarget = event.target as HTMLInputElement | null
    const detailValue = (event as Event & { detail?: { value?: string } }).detail?.value
    marketKeyword.value = (inputTarget?.value ?? detailValue ?? '').trimStart()
    searchDebounce.schedule(() => {
      appliedMarketKeyword.value = marketKeyword.value.trim().toLowerCase()
    }, MARKET_SEARCH_QUERY_DEBOUNCE_MS)
  }

  const handleMarketKeywordClear = () => {
    clearMarketListQueryDebounce()
    marketKeyword.value = ''
    appliedMarketKeyword.value = ''
  }

  return {
    clearHomeMarketSearchState,
    clearMarketListQueryDebounce,
    handleMarketKeywordClear,
    handleMarketKeywordInput,
    handleMarketSearchClick,
    handleMarketSearchRevealAfterEnter,
    handleMarketSearchRevealAfterLeave,
    handleMarketSearchRevealBeforeEnter,
    handleMarketSearchRevealBeforeLeave,
    handleMarketSearchRevealEnter,
    handleMarketSearchRevealLeave,
    hasActiveMarketSearch,
    isMarketSearchApplied,
    isMarketSearchVisible,
    marketKeyword,
    marketSearchRevealHeightPx,
    normalizedAppliedMarketKeyword,
    normalizedMarketKeyword,
  }
}
