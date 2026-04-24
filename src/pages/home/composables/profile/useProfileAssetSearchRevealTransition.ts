/**
 * Responsibility: host the profile search reveal-height bridge used by the result header so
 * search-card expansion can sync mount-window recalculation.
 * Out of scope: query state, result-window transitions, and profile page presentation runtime.
 */
import { ref } from 'vue'

interface UseProfileAssetSearchRevealTransitionOptions {
  scheduleProfileAssetMountWindowSync: () => void
  fallbackHeightPx: number
}

export const useProfileAssetSearchRevealTransition = ({
  scheduleProfileAssetMountWindowSync,
  fallbackHeightPx,
}: UseProfileAssetSearchRevealTransitionOptions) => {
  const profileSearchRevealHeightPx = ref(0)

  const resolveProfileSearchRevealHeightPx = (element: Element | null) => {
    const stageElement = element as HTMLElement | null
    const cardElement = stageElement?.querySelector<HTMLElement>('.home-profile-search-card')
    const nextHeight = Math.ceil(cardElement?.offsetHeight ?? 0)
    if (nextHeight > 0) {
      profileSearchRevealHeightPx.value = nextHeight
    }

    return profileSearchRevealHeightPx.value || fallbackHeightPx
  }

  const cleanupProfileSearchRevealStage = (element: Element) => {
    const stageElement = element as HTMLElement
    stageElement.style.height = ''
    stageElement.style.overflow = ''
    stageElement.style.transition = ''
    stageElement.style.willChange = ''
  }

  const waitForProfileSearchRevealHeightTransition = (element: Element, done: () => void) => {
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

  const handleProfileSearchRevealBeforeEnter = (element: Element) => {
    const stageElement = element as HTMLElement
    const targetHeight = resolveProfileSearchRevealHeightPx(stageElement)
    stageElement.dataset.revealHeight = `${targetHeight}`
    stageElement.style.height = '0px'
    stageElement.style.overflow = 'hidden'
    stageElement.style.willChange = 'height'
  }

  const handleProfileSearchRevealEnter = (element: Element, done: () => void) => {
    const stageElement = element as HTMLElement
    const targetHeight = Number(
      stageElement.dataset.revealHeight ?? resolveProfileSearchRevealHeightPx(stageElement)
    )
    stageElement.style.transition = 'height 180ms cubic-bezier(0.22, 1, 0.36, 1)'
    void stageElement.offsetHeight
    requestAnimationFrame(() => {
      stageElement.style.height = `${targetHeight}px`
    })
    waitForProfileSearchRevealHeightTransition(stageElement, done)
  }

  const handleProfileSearchRevealAfterEnter = (element: Element) => {
    const stageElement = element as HTMLElement
    delete stageElement.dataset.revealHeight
    cleanupProfileSearchRevealStage(stageElement)
    scheduleProfileAssetMountWindowSync()
  }

  const handleProfileSearchRevealBeforeLeave = (element: Element) => {
    const stageElement = element as HTMLElement
    const targetHeight = resolveProfileSearchRevealHeightPx(stageElement)
    stageElement.style.height = `${targetHeight}px`
    stageElement.style.overflow = 'hidden'
    stageElement.style.willChange = 'height'
  }

  const handleProfileSearchRevealLeave = (element: Element, done: () => void) => {
    const stageElement = element as HTMLElement
    stageElement.style.transition = 'height 180ms cubic-bezier(0.4, 0, 0.2, 1)'
    void stageElement.offsetHeight
    requestAnimationFrame(() => {
      stageElement.style.height = '0px'
    })
    waitForProfileSearchRevealHeightTransition(stageElement, done)
  }

  const handleProfileSearchRevealAfterLeave = (element: Element) => {
    cleanupProfileSearchRevealStage(element)
    scheduleProfileAssetMountWindowSync()
  }

  return {
    handleProfileSearchRevealBeforeEnter,
    handleProfileSearchRevealEnter,
    handleProfileSearchRevealAfterEnter,
    handleProfileSearchRevealBeforeLeave,
    handleProfileSearchRevealLeave,
    handleProfileSearchRevealAfterLeave,
  }
}
