import { ref } from 'vue'
import { describe, expect, it, vi } from 'vitest'
import { useProfileAssetResultWindowInactiveResetRuntime } from '@/pages/home/composables/profile/useProfileAssetResultWindowInactiveResetRuntime'
import type { ProfileAssetRevealPhase } from '@/pages/home/composables/profile/useProfileAssetVisualReveal'

describe('useProfileAssetResultWindowInactiveResetRuntime', () => {
  it('clears queued state and normalizes reveal-scan to icon on inactive reset', () => {
    const queuedProfileAssetSwitch = ref([{ id: 'queued-a' }] as never[])
    const pendingProfileAssetWindowDiff = ref({ nextWindow: [] } as never)
    const profileAssetPlaceholderIdSet = ref(new Set(['placeholder-a']))
    const profileAssetTransitionPhase = ref<'idle' | 'entering'>('entering')
    const handledProfileAssetRefreshReplayRequestId = ref(2)
    const profileAssetRefreshReplayRequestId = ref(4)
    const profileAssetRevealPhaseMap = ref<Record<string, ProfileAssetRevealPhase>>({
      a: 'reveal-scan',
      b: 'steady',
    })

    const setProfileAssetRevealPhaseMap = vi.fn(
      (nextMap: Record<string, ProfileAssetRevealPhase>) => {
        profileAssetRevealPhaseMap.value = nextMap
      }
    )

    const runtime = useProfileAssetResultWindowInactiveResetRuntime({
      queuedProfileAssetSwitch,
      pendingProfileAssetWindowDiff,
      profileAssetPlaceholderIdSet,
      profileAssetTransitionPhase,
      handledProfileAssetRefreshReplayRequestId,
      profileAssetRefreshReplayRequestId,
      profileAssetRevealPhaseMap,
      clearProfileAssetMountWindowSyncRaf: vi.fn(),
      releaseProfileAssetResultsStageMinHeight: vi.fn(),
      clearProfileAssetEnterMotionTimeout: vi.fn(),
      clearProfileAssetQueuedInsertTimeouts: vi.fn(),
      clearProfileAssetRemovedOverlayItems: vi.fn(),
      clearMountedProfileAssetWindow: vi.fn(),
      clearProfileAssetRevealTimeouts: vi.fn(),
      setProfileAssetRevealPhaseMap,
    })

    runtime.resetProfileResultWindowForInactive()

    expect(queuedProfileAssetSwitch.value).toBeNull()
    expect(pendingProfileAssetWindowDiff.value).toBeNull()
    expect(Array.from(profileAssetPlaceholderIdSet.value)).toEqual([])
    expect(handledProfileAssetRefreshReplayRequestId.value).toBe(4)
    expect(setProfileAssetRevealPhaseMap).toHaveBeenCalledWith({
      a: 'icon',
      b: 'steady',
    })
  })
})
