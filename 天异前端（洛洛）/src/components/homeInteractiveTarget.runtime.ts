/**
 * Responsibility: own HomeInteractiveTarget's pressed-state runtime, hit-area style, and
 * interaction handler routing without changing the component's event contract.
 * Out of scope: consumer-specific business actions, icon rendering, and parent layout styling.
 */

import { computed, ref, type CSSProperties } from 'vue'

interface UseHomeInteractiveTargetRuntimeOptions {
  resolveDisabled: () => boolean
  resolveHitWidth: () => number
  resolveHitHeight: () => number
  resolveHitRadius: () => string
  emitActivate: () => void
  emitMouseEnter: () => void
  emitMouseLeave: () => void
  emitTouchStart: () => void
  emitTouchEnd: () => void
  emitTouchCancel: () => void
}

export const useHomeInteractiveTargetRuntime = ({
  resolveDisabled,
  resolveHitWidth,
  resolveHitHeight,
  resolveHitRadius,
  emitActivate,
  emitMouseEnter,
  emitMouseLeave,
  emitTouchStart,
  emitTouchEnd,
  emitTouchCancel,
}: UseHomeInteractiveTargetRuntimeOptions) => {
  const isPressed = ref(false)

  const interactionStyle = computed<CSSProperties>(() => {
    return {
      '--home-interactive-hit-width': `${Math.max(resolveHitWidth(), 44)}px`,
      '--home-interactive-hit-height': `${Math.max(resolveHitHeight(), 44)}px`,
      '--home-interactive-hit-radius': resolveHitRadius(),
    } as CSSProperties
  })

  const clearPressed = () => {
    isPressed.value = false
  }

  const setPressed = () => {
    if (resolveDisabled()) {
      return
    }
    isPressed.value = true
  }

  const handleActivate = () => {
    if (resolveDisabled()) {
      clearPressed()
      return
    }
    emitActivate()
    clearPressed()
  }

  const handleMouseEnter = () => {
    emitMouseEnter()
  }

  const handleMouseLeave = () => {
    emitMouseLeave()
    clearPressed()
  }

  const handlePointerDown = () => {
    setPressed()
  }

  const handlePointerUp = () => {
    clearPressed()
  }

  const handleTouchStart = () => {
    setPressed()
    emitTouchStart()
  }

  const handleTouchEnd = () => {
    clearPressed()
    emitTouchEnd()
  }

  const handleTouchCancel = () => {
    clearPressed()
    emitTouchCancel()
  }

  const handleKeyDown = () => {
    setPressed()
  }

  const handleKeyActivate = () => {
    handleActivate()
  }

  const handleBlur = () => {
    clearPressed()
  }

  return {
    isPressed,
    interactionStyle,
    handleActivate,
    handleMouseEnter,
    handleMouseLeave,
    handlePointerDown,
    handlePointerUp,
    handleTouchStart,
    handleTouchEnd,
    handleTouchCancel,
    handleKeyDown,
    handleKeyActivate,
    handleBlur,
  }
}
