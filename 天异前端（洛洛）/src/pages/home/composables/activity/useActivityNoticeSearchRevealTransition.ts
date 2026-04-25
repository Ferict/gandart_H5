/**
 * Responsibility: own the local height measurement and transition timing helpers for the
 * activity notice search reveal shell.
 * Out of scope: search keyword ownership, query execution, and result filtering behavior.
 */
import { ref } from 'vue'

const DEFAULT_NOTICE_SEARCH_REVEAL_HEIGHT_PX = 48
const NOTICE_SEARCH_REVEAL_TRANSITION_TIMEOUT_MS = 260

export const useActivityNoticeSearchRevealTransition = () => {
  const noticeSearchRevealHeightPx = ref(0)

  const resolveNoticeSearchRevealHeightPx = (element: Element | null) => {
    const targetElement = element instanceof HTMLElement ? element : null
    if (!targetElement) {
      return noticeSearchRevealHeightPx.value || DEFAULT_NOTICE_SEARCH_REVEAL_HEIGHT_PX
    }
    const measuredHeight = Math.max(0, Math.round(targetElement.scrollHeight))
    if (measuredHeight > 0) {
      noticeSearchRevealHeightPx.value = measuredHeight
    }
    return (
      measuredHeight || noticeSearchRevealHeightPx.value || DEFAULT_NOTICE_SEARCH_REVEAL_HEIGHT_PX
    )
  }

  const waitForNoticeSearchRevealHeightTransition = (element: Element, done: () => void) => {
    const targetElement = element as HTMLElement
    let resolved = false
    const clear = () => {
      targetElement.removeEventListener('transitionend', onTransitionEnd)
    }
    const finish = () => {
      if (resolved) {
        return
      }
      resolved = true
      clear()
      done()
    }
    const onTransitionEnd = (event: Event) => {
      if (event.target === targetElement && (event as TransitionEvent).propertyName === 'height') {
        finish()
      }
    }
    targetElement.addEventListener('transitionend', onTransitionEnd)
    setTimeout(finish, NOTICE_SEARCH_REVEAL_TRANSITION_TIMEOUT_MS)
  }

  const handleNoticeSearchRevealBeforeEnter = (element: Element) => {
    const targetElement = element as HTMLElement
    targetElement.style.height = '0px'
    targetElement.style.opacity = '0'
  }

  const handleNoticeSearchRevealEnter = (element: Element, done: () => void) => {
    const targetElement = element as HTMLElement
    const targetHeight = resolveNoticeSearchRevealHeightPx(targetElement)
    targetElement.style.height = `${targetHeight}px`
    targetElement.style.opacity = '1'
    waitForNoticeSearchRevealHeightTransition(targetElement, done)
  }

  const handleNoticeSearchRevealAfterEnter = (element: Element) => {
    const targetElement = element as HTMLElement
    targetElement.style.height = 'auto'
    targetElement.style.opacity = '1'
  }

  const handleNoticeSearchRevealBeforeLeave = (element: Element) => {
    const targetElement = element as HTMLElement
    const targetHeight = resolveNoticeSearchRevealHeightPx(targetElement)
    targetElement.style.height = `${targetHeight}px`
    targetElement.style.opacity = '1'
  }

  const handleNoticeSearchRevealLeave = (element: Element, done: () => void) => {
    const targetElement = element as HTMLElement
    targetElement.style.height = '0px'
    targetElement.style.opacity = '0'
    waitForNoticeSearchRevealHeightTransition(targetElement, done)
  }

  const handleNoticeSearchRevealAfterLeave = (element: Element) => {
    const targetElement = element as HTMLElement
    targetElement.style.height = '0px'
    targetElement.style.opacity = '0'
  }

  return {
    handleNoticeSearchRevealBeforeEnter,
    handleNoticeSearchRevealEnter,
    handleNoticeSearchRevealAfterEnter,
    handleNoticeSearchRevealBeforeLeave,
    handleNoticeSearchRevealLeave,
    handleNoticeSearchRevealAfterLeave,
  }
}
