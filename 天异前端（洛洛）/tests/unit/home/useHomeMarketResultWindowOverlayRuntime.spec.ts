import { ref } from 'vue'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { buildResultWindowDiff } from '@/services/home-rail/homeRailResultWindow.service'
import { useHomeMarketResultWindowOverlayRuntime } from '@/pages/home/composables/home/useHomeMarketResultWindowOverlayRuntime'
import type { HomeMarketCard } from '@/models/home-rail/homeRailHome.model'

const createCard = (id: string) =>
  ({
    id,
    imageUrl: `https://cdn.example.com/${id}.png`,
  }) as HomeMarketCard

describe('useHomeMarketResultWindowOverlayRuntime', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('releases stage height immediately when there is no removed overlay', () => {
    const releaseMarketResultsStageHeightLock = vi.fn()
    const runtime = useHomeMarketResultWindowOverlayRuntime({
      marketRemovedOverlayItems: ref([]),
      shouldReleaseMarketResultsStageHeightOnOverlayClear: ref(false),
      leaveDurationMs: 300,
      releaseMarketResultsStageHeightLock,
    })

    runtime.syncMarketRemovedOverlayItems(
      buildResultWindowDiff([createCard('a')], [createCard('a')], (item) => item.imageUrl),
      { releaseStageHeightAfterClear: true }
    )

    expect(releaseMarketResultsStageHeightLock).toHaveBeenCalledTimes(1)
  })

  it('clears overlay items after leave duration', async () => {
    vi.useFakeTimers()
    const marketRemovedOverlayItems = ref([] as Array<unknown>)
    const runtime = useHomeMarketResultWindowOverlayRuntime({
      marketRemovedOverlayItems: marketRemovedOverlayItems as never,
      shouldReleaseMarketResultsStageHeightOnOverlayClear: ref(false),
      leaveDurationMs: 300,
      releaseMarketResultsStageHeightLock: vi.fn(),
    })

    runtime.syncMarketRemovedOverlayItems(
      buildResultWindowDiff([createCard('a')], [createCard('b')], (item) => item.imageUrl)
    )
    expect(marketRemovedOverlayItems.value.length).toBeGreaterThan(0)

    await vi.advanceTimersByTimeAsync(300)
    expect(marketRemovedOverlayItems.value).toEqual([])
  })
})
