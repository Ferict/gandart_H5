import { computed, ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useHomeTrackPageMountState } from '@/pages/home/composables/home/useHomeTrackPageMountState'
import type { PageKey } from '@/models/home-shell/homeShell.model'

const flushMicrotasks = async () => {
  await Promise.resolve()
  await Promise.resolve()
}

describe('useHomeTrackPageMountState', () => {
  it('syncs home snapshot before reconcile when switching activity -> home', async () => {
    const activePage = ref<PageKey>('home')
    const pageKeys: readonly PageKey[] = ['home', 'activity', 'profile']

    const callOrder: string[] = []
    const resetTrackRefresherVisualState = vi.fn((pageKey: PageKey) => {
      callOrder.push(`reset:${pageKey}`)
    })
    const clearHomeTrackScrolled = vi.fn(() => {
      callOrder.push('clear-home-scrolled')
    })
    const syncTrackViewportSnapshot = vi.fn((pageKey: PageKey) => {
      callOrder.push(`sync:${pageKey}`)
    })
    const reconcileHomeTrackScrolled = vi.fn(() => {
      callOrder.push('reconcile-home-scrolled')
    })
    const nextTickFn = vi.fn(async () => {})

    useHomeTrackPageMountState({
      activePageKey: computed(() => activePage.value),
      pageKeys,
      homePageKey: 'home',
      activityPageKey: 'activity',
      profilePageKey: 'profile',
      resetTrackRefresherVisualState,
      clearHomeTrackScrolled,
      syncTrackViewportSnapshot,
      reconcileHomeTrackScrolled,
      nextTickFn,
    })

    // Drop immediate watch effects from setup.
    await flushMicrotasks()
    callOrder.length = 0
    resetTrackRefresherVisualState.mockClear()
    clearHomeTrackScrolled.mockClear()
    syncTrackViewportSnapshot.mockClear()
    reconcileHomeTrackScrolled.mockClear()
    nextTickFn.mockClear()

    activePage.value = 'activity'
    await flushMicrotasks()

    expect(clearHomeTrackScrolled).toHaveBeenCalledTimes(1)
    expect(syncTrackViewportSnapshot).toHaveBeenCalledWith('activity')
    expect(reconcileHomeTrackScrolled).not.toHaveBeenCalled()
    expect(callOrder.indexOf('clear-home-scrolled')).toBeGreaterThan(-1)
    expect(callOrder.indexOf('sync:activity')).toBeGreaterThan(-1)

    callOrder.length = 0
    syncTrackViewportSnapshot.mockClear()
    reconcileHomeTrackScrolled.mockClear()

    activePage.value = 'home'
    await flushMicrotasks()

    expect(syncTrackViewportSnapshot).toHaveBeenCalledWith('home')
    expect(reconcileHomeTrackScrolled).toHaveBeenCalledTimes(1)
    expect(callOrder).toContain('sync:home')
    expect(callOrder).toContain('reconcile-home-scrolled')
    expect(callOrder.indexOf('sync:home')).toBeLessThan(
      callOrder.indexOf('reconcile-home-scrolled')
    )
  })

  it('ignores stale nextTick mount sync when active page switches rapidly', async () => {
    const activePage = ref<PageKey>('home')
    const pageKeys: readonly PageKey[] = ['home', 'activity', 'profile']
    const pendingResolves: Array<() => void> = []

    const resetTrackRefresherVisualState = vi.fn()
    const clearHomeTrackScrolled = vi.fn()
    const syncTrackViewportSnapshot = vi.fn()
    const reconcileHomeTrackScrolled = vi.fn()
    const nextTickFn = vi.fn(
      () =>
        new Promise<void>((resolve) => {
          pendingResolves.push(resolve)
        })
    )

    useHomeTrackPageMountState({
      activePageKey: computed(() => activePage.value),
      pageKeys,
      homePageKey: 'home',
      activityPageKey: 'activity',
      profilePageKey: 'profile',
      resetTrackRefresherVisualState,
      clearHomeTrackScrolled,
      syncTrackViewportSnapshot,
      reconcileHomeTrackScrolled,
      nextTickFn,
    })

    pendingResolves.splice(0).forEach((resolve) => resolve())
    await flushMicrotasks()
    syncTrackViewportSnapshot.mockClear()

    activePage.value = 'activity'
    await flushMicrotasks()
    expect(pendingResolves.length).toBe(1)

    activePage.value = 'home'
    await flushMicrotasks()
    expect(pendingResolves.length).toBe(2)

    pendingResolves[0]?.()
    await flushMicrotasks()
    expect(syncTrackViewportSnapshot).not.toHaveBeenCalledWith('activity')

    pendingResolves[1]?.()
    await flushMicrotasks()
    expect(syncTrackViewportSnapshot).toHaveBeenCalledWith('home')
  })
})
