/**
 * Responsibility: expose the minimal left-fade visibility state for horizontally scrollable
 * surfaces based on current scroll-left position.
 * Out of scope: scroll container rendering, pointer gestures, and width measurement logic.
 */
import { ref } from 'vue'

type HorizontalScrollEvent = {
  detail?: {
    scrollLeft?: number
  }
}

const LEFT_FADE_VISIBLE_THRESHOLD = 1

export const useHorizontalScrollFade = () => {
  const isLeftFadeVisible = ref(false)

  const handleHorizontalScroll = (event?: HorizontalScrollEvent) => {
    const scrollLeft = event?.detail?.scrollLeft ?? 0
    isLeftFadeVisible.value = scrollLeft > LEFT_FADE_VISIBLE_THRESHOLD
  }

  return {
    isLeftFadeVisible,
    handleHorizontalScroll,
  }
}
