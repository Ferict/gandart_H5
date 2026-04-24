import { afterEach, describe, expect, it, vi } from 'vitest'
import { ref } from 'vue'
import { useHomeMarketCardVisualRevealRuntime } from '@/pages/home/composables/home/useHomeMarketCardVisualRevealRuntime'
import { buildResultWindowDiff } from '@/services/home-rail/homeRailResultWindow.service'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string, imageUrl = `https://cdn.example.com/${id}.png`) =>
  ({
    id,
    imageUrl,
  }) as HomeMarketCard

const createHarness = () => {
  const mountedMarketItems = ref<HomeMarketCard[]>([])
  const isActive = ref(true)
  const readyMap = new Map<string, boolean>()
  const displayMap = new Map<string, 'fallback' | 'remote' | 'local'>()

  const runtime = useHomeMarketCardVisualRevealRuntime({
    mountedMarketItems,
    isMarketCardPlaceholder: () => false,
    isActive,
    marketCardImageScanDurationMs: 120,
    isHomeVisualImageRevealReady: (_scope, resourceId) => readyMap.get(resourceId) ?? false,
    resolveHomeVisualImageDisplaySource: (_scope, resourceId) =>
      displayMap.get(resourceId) ?? 'fallback',
  })

  return {
    runtime,
    refs: {
      mountedMarketItems,
      isActive,
    },
    readyMap,
    displayMap,
  }
}

describe('useHomeMarketCardVisualRevealRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('promotes a ready remote market card from icon to steady through reveal-scan', async () => {
    vi.useFakeTimers()
    const harness = createHarness()
    const card = createCard('a')
    harness.refs.mountedMarketItems.value = [card]
    harness.readyMap.set('a', true)
    harness.displayMap.set('a', 'remote')

    harness.runtime.syncMarketCardRevealStates()

    expect(harness.runtime.marketCardRevealPhaseMap.value.a).toBe('reveal-scan')

    await vi.advanceTimersByTimeAsync(120)

    expect(harness.runtime.marketCardRevealPhaseMap.value.a).toBe('steady')
  })

  it('replays retained cards back to icon on manual refresh', () => {
    const harness = createHarness()
    const currentCard = createCard('a')
    const nextCard = createCard('a')
    harness.readyMap.set('a', true)
    harness.displayMap.set('a', 'remote')
    harness.refs.mountedMarketItems.value = [currentCard]
    harness.runtime.syncMarketCardRevealStates([currentCard])
    harness.runtime.marketCardRevealPhaseMap.value = { a: 'steady' }

    const diff = buildResultWindowDiff([currentCard], [nextCard], (item) => item.imageUrl.trim())

    expect(harness.runtime.buildNextMarketRevealPhaseMap(diff, 'manual-refresh')).toEqual({
      a: 'icon',
    })
  })

  it('resets reveal-scan cards back to icon when the panel becomes inactive', async () => {
    vi.useFakeTimers()
    const harness = createHarness()
    const card = createCard('a')
    harness.refs.mountedMarketItems.value = [card]
    harness.readyMap.set('a', true)
    harness.displayMap.set('a', 'remote')

    harness.runtime.syncMarketCardRevealStates()
    expect(harness.runtime.marketCardRevealPhaseMap.value.a).toBe('reveal-scan')

    harness.runtime.resetHomeMarketCardVisualRevealForInactive()
    await vi.advanceTimersByTimeAsync(120)

    expect(harness.runtime.marketCardRevealPhaseMap.value.a).toBe('icon')
  })
})
