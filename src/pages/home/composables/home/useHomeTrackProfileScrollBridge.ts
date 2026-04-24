/**
 * Responsibility: host the profile scroll-into-view bridge used by the home track so profile
 * assets can request a one-shot anchor reveal without owning the track shell.
 * Out of scope: profile query behavior, track mount state, and panel refresh orchestration.
 */
import { nextTick, ref } from 'vue'

interface UseHomeTrackProfileScrollBridgeOptions {
  profileAssetsAnchorId?: string
}

const DEFAULT_PROFILE_ASSETS_ANCHOR_ID = 'home-profile-assets-anchor'

export const useHomeTrackProfileScrollBridge = ({
  profileAssetsAnchorId = DEFAULT_PROFILE_ASSETS_ANCHOR_ID,
}: UseHomeTrackProfileScrollBridgeOptions = {}) => {
  const profileScrollIntoViewTarget = ref('')
  let profileScrollIntoViewClearTimer: ReturnType<typeof setTimeout> | null = null
  let isDisposed = false

  const clearProfileScrollIntoViewTimer = () => {
    if (!profileScrollIntoViewClearTimer) {
      return
    }

    clearTimeout(profileScrollIntoViewClearTimer)
    profileScrollIntoViewClearTimer = null
  }

  const requestProfileScrollIntoView = async (targetId: string) => {
    if (isDisposed) {
      return
    }

    clearProfileScrollIntoViewTimer()
    profileScrollIntoViewTarget.value = ''
    await nextTick()
    if (isDisposed) {
      return
    }

    profileScrollIntoViewTarget.value = targetId
    profileScrollIntoViewClearTimer = setTimeout(() => {
      if (isDisposed) {
        profileScrollIntoViewClearTimer = null
        return
      }
      profileScrollIntoViewTarget.value = ''
      profileScrollIntoViewClearTimer = null
    }, 180)
  }

  const handleProfileScrollToAssetsSection = () => {
    void requestProfileScrollIntoView(profileAssetsAnchorId)
  }

  const disposeProfileScrollBridge = () => {
    isDisposed = true
    clearProfileScrollIntoViewTimer()
    profileScrollIntoViewTarget.value = ''
  }

  return {
    profileScrollIntoViewTarget,
    handleProfileScrollToAssetsSection,
    disposeProfileScrollBridge,
  }
}
