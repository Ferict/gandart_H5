import { computed, ref } from 'vue'
import { useHomeTrackRefreshController } from '@/pages/home/composables/home/useHomeTrackRefreshController'
import type { PageKey } from '@/models/home-shell/homeShell.model'

type RefreshHandle = {
  refreshContent?: (options?: { force?: boolean; reason?: 'pull-refresh' }) => Promise<void>
  waitForRefreshPresentation?: () => Promise<void>
}

const PAGE_KEYS: readonly PageKey[] = ['home', 'activity', 'profile']
const CONTENT_LOCK_OFFSET_PX = 24
const REVEAL_RAW_DISTANCE_PX = 120
const TRIGGER_OFFSET_PX = CONTENT_LOCK_OFFSET_PX + REVEAL_RAW_DISTANCE_PX
const INDICATOR_TOP_OFFSET_PX = 80
const INDICATOR_FADE_RISE_PX = 10
const PULL_RESISTANCE_POWER = 1.75

const waitUntil = async (
  condition: () => boolean,
  { timeoutMs = 800, intervalMs = 20 }: { timeoutMs?: number; intervalMs?: number } = {}
) => {
  const start = Date.now()
  while (!condition()) {
    if (Date.now() - start >= timeoutMs) {
      throw new Error('condition did not become true in time')
    }
    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }
}

const createHarness = (options?: {
  activePage?: PageKey
  homeWaitForRefreshPresentation?: () => Promise<void>
}) => {
  const activePage = ref<PageKey>(options?.activePage ?? 'home')
  const homeRefreshContent = vi.fn(async () => {})
  const homeWaitForRefreshPresentation =
    options?.homeWaitForRefreshPresentation ?? vi.fn(async () => {})
  const logSafeError = vi.fn()
  const nextTickFn = vi.fn(async () => {})

  const handles: Record<PageKey, RefreshHandle> = {
    home: {
      refreshContent: homeRefreshContent,
      waitForRefreshPresentation: homeWaitForRefreshPresentation,
    },
    activity: {
      refreshContent: vi.fn(async () => {}),
      waitForRefreshPresentation: vi.fn(async () => {}),
    },
    profile: {
      refreshContent: vi.fn(async () => {}),
      waitForRefreshPresentation: vi.fn(async () => {}),
    },
  }

  const controller = useHomeTrackRefreshController({
    pageKeys: PAGE_KEYS,
    activePageKey: computed(() => activePage.value),
    nextTickFn,
    resolveTrackRefreshHandle: (pageKey) => handles[pageKey] ?? null,
    logSafeError,
    pullRefreshContentLockOffsetPx: CONTENT_LOCK_OFFSET_PX,
    pullRefreshRevealRawDistancePx: REVEAL_RAW_DISTANCE_PX,
    pullRefreshTriggerOffsetPx: TRIGGER_OFFSET_PX,
    refreshIndicatorTopOffsetPx: INDICATOR_TOP_OFFSET_PX,
    refreshIndicatorFadeInRisePx: INDICATOR_FADE_RISE_PX,
    pullResistancePower: PULL_RESISTANCE_POWER,
  })

  return {
    controller,
    activePage,
    homeRefreshContent,
    homeWaitForRefreshPresentation,
    logSafeError,
  }
}

describe('useHomeTrackRefreshController', () => {
  it('maps pulling distance into reveal progress', () => {
    const { controller, activePage } = createHarness({ activePage: 'home' })
    activePage.value = 'home'

    const baseStyle = controller.resolveTrackRefreshIndicatorStyle('home')
    expect(Number(baseStyle.opacity ?? 0)).toBe(0)

    controller.handleTrackRefresherPulling('home', { detail: { pullingDistance: 84 } })
    const partialClass = controller.resolveTrackRefreshIndicatorClass('home')
    const partialStyle = controller.resolveTrackRefreshIndicatorStyle('home')
    const partialOpacity = Number(partialStyle.opacity ?? 0)

    expect(partialClass['is-visible']).toBe(true)
    expect(partialClass['is-pull-active']).toBe(true)
    expect(partialOpacity).toBeGreaterThan(0)
    expect(partialOpacity).toBeLessThan(1)

    controller.handleTrackRefresherPulling('home', { detail: { pullingDistance: 999 } })
    const fullStyle = controller.resolveTrackRefreshIndicatorStyle('home')
    expect(Number(fullStyle.opacity ?? 0)).toBe(1)

    controller.handleTrackRefresherPulling('activity', { detail: { pullingDistance: 999 } })
    const inactiveStyle = controller.resolveTrackRefreshIndicatorStyle('activity')
    expect(Number(inactiveStyle.opacity ?? 0)).toBe(0)
  })

  it('cleans refresher state after triggerPageRefresh success path', async () => {
    const { controller, homeRefreshContent, homeWaitForRefreshPresentation } = createHarness({
      activePage: 'home',
    })

    controller.handleTrackRefresherPulling('home', { detail: { pullingDistance: 120 } })
    expect(controller.resolveTrackWindowingSuspended('home')).toBe(true)

    controller.handleTrackRefresherRefresh('home')

    await waitUntil(() => homeRefreshContent.mock.calls.length > 0)
    await waitUntil(() => homeWaitForRefreshPresentation.mock.calls.length > 0)
    await waitUntil(
      () =>
        controller.resolveTrackRefresherTriggered('home') === false &&
        controller.resolveTrackWindowingSuspended('home') === false
    )

    expect(homeRefreshContent).toHaveBeenCalledWith({ force: true, reason: 'pull-refresh' })
    expect(homeWaitForRefreshPresentation).toHaveBeenCalledTimes(1)
    expect(controller.resolveTrackRefresherTriggered('home')).toBe(false)
    expect(controller.resolveTrackWindowingSuspended('home')).toBe(false)
    expect(Number(controller.resolveTrackRefreshIndicatorStyle('home').opacity ?? 0)).toBe(0)
  })

  it('keeps finally cleanup when waitForRefreshPresentation throws', async () => {
    const waitError = new Error('wait failed')
    const throwingWaitForPresentation = vi.fn(async () => {
      throw waitError
    })

    const { controller, homeRefreshContent, logSafeError } = createHarness({
      activePage: 'home',
      homeWaitForRefreshPresentation: throwingWaitForPresentation,
    })

    controller.handleTrackRefresherRefresh('home')

    await waitUntil(() => homeRefreshContent.mock.calls.length > 0)
    await waitUntil(() => throwingWaitForPresentation.mock.calls.length > 0)
    await waitUntil(
      () =>
        controller.resolveTrackRefresherTriggered('home') === false &&
        controller.resolveTrackWindowingSuspended('home') === false
    )

    expect(logSafeError).toHaveBeenCalledWith(
      'homeTrack',
      waitError,
      expect.objectContaining({
        message: 'failed to wait for refresh presentation',
      })
    )
    expect(controller.resolveTrackRefresherTriggered('home')).toBe(false)
    expect(controller.resolveTrackWindowingSuspended('home')).toBe(false)
    expect(Number(controller.resolveTrackRefreshIndicatorStyle('home').opacity ?? 0)).toBe(0)
  })

  it('resetTrackRefresherVisualState clears pull state and refresher suspension after pulling', () => {
    const { controller, activePage } = createHarness({ activePage: 'home' })
    activePage.value = 'home'

    controller.handleTrackRefresherPulling('home', { detail: { pullingDistance: 96 } })
    expect(controller.resolveTrackWindowingSuspended('home')).toBe(true)
    expect(controller.resolveTrackRefresherTriggered('home')).toBe(false)

    controller.resetTrackRefresherVisualState('home')

    expect(controller.resolveTrackRefresherTriggered('home')).toBe(false)
    expect(Number(controller.resolveTrackRefreshIndicatorStyle('home').opacity ?? 0)).toBe(0)
    expect(controller.resolveTrackWindowingSuspended('home')).toBe(false)
  })

  it('resetTrackRefresherVisualState does not clear active refreshing page', async () => {
    const pendingWaitForPresentation = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          setTimeout(resolve, 40)
        })
    )
    const { controller, homeRefreshContent } = createHarness({
      activePage: 'home',
      homeWaitForRefreshPresentation: pendingWaitForPresentation,
    })

    controller.handleTrackRefresherRefresh('home')
    await waitUntil(() => homeRefreshContent.mock.calls.length > 0)
    await waitUntil(() => pendingWaitForPresentation.mock.calls.length > 0)
    await waitUntil(() => controller.resolveTrackRefresherTriggered('home') === true)

    controller.resetTrackRefresherVisualState('home')

    expect(controller.resolveTrackRefresherTriggered('home')).toBe(true)
    expect(controller.resolveTrackWindowingSuspended('home')).toBe(true)
    expect(Number(controller.resolveTrackRefreshIndicatorStyle('home').opacity ?? 0)).toBe(1)
  })
})
