<!--
Responsibility: render the shared interactive target shell used by home-page controls,
including state classes, pointer affordance, and slot projection.
Out of scope: business click behavior, routing policy, and query/runtime orchestration.
-->

<template>
  <view
    class="home-interactive-target"
    :class="[
      `mode-${props.interactionMode}`,
      {
        'is-disabled': props.disabled,
        'is-pressed': isPressed,
        'is-entry-active': isPressed,
        'is-selected': props.selected,
      },
    ]"
    :style="interactionStyle"
    hover-class="none"
    role="button"
    :tabindex="props.disabled ? -1 : 0"
    :aria-label="props.label || undefined"
    :aria-disabled="props.disabled ? 'true' : 'false'"
    @keydown.enter="handleKeyDown"
    @keyup.enter="handleKeyActivate"
    @keydown.space.prevent="handleKeyDown"
    @keyup.space.prevent="handleKeyActivate"
    @blur="handleBlur"
  >
    <view
      class="home-interactive-target-hit"
      aria-hidden="true"
      @tap.stop="handleActivate"
      @mouseenter="handleMouseEnter"
      @mouseleave="handleMouseLeave"
      @mousedown="handlePointerDown"
      @mouseup="handlePointerUp"
      @touchstart.passive="handleTouchStart"
      @touchend="handleTouchEnd"
      @touchcancel="handleTouchCancel"
    />
    <view class="home-interactive-target-visual">
      <slot />
    </view>
  </view>
</template>

<script setup lang="ts">
import { useHomeInteractiveTargetRuntime } from './homeInteractiveTarget.runtime'

interface Props {
  label?: string
  disabled?: boolean
  selected?: boolean
  interactionMode?: 'block' | 'compact'
  hitWidth?: number
  hitHeight?: number
  hitRadius?: string
}

const props = withDefaults(defineProps<Props>(), {
  label: '',
  disabled: false,
  selected: false,
  interactionMode: 'block',
  hitWidth: 44,
  hitHeight: 44,
  hitRadius: '999px',
})

const emit = defineEmits<{
  activate: []
  mouseenter: []
  mouseleave: []
  touchstart: []
  touchend: []
  touchcancel: []
}>()

const {
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
} = useHomeInteractiveTargetRuntime({
  resolveDisabled: () => props.disabled,
  resolveHitWidth: () => props.hitWidth,
  resolveHitHeight: () => props.hitHeight,
  resolveHitRadius: () => props.hitRadius,
  emitActivate: () => emit('activate'),
  emitMouseEnter: () => emit('mouseenter'),
  emitMouseLeave: () => emit('mouseleave'),
  emitTouchStart: () => emit('touchstart'),
  emitTouchEnd: () => emit('touchend'),
  emitTouchCancel: () => emit('touchcancel'),
})
</script>

<style lang="scss" scoped>
.home-interactive-target {
  position: relative;
  display: block;
  min-width: 0;
  outline: none;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  touch-action: manipulation;
  overflow: visible;
}

.home-interactive-target.is-disabled {
  cursor: default;
  pointer-events: none;
}

.home-interactive-target-hit {
  position: absolute;
  z-index: 0;
  pointer-events: auto;
  transition:
    box-shadow 180ms ease,
    background-color 180ms ease,
    opacity 180ms ease;
  cursor: inherit;
}

.home-interactive-target.mode-block .home-interactive-target-hit {
  inset: 0;
  border-radius: inherit;
}

.home-interactive-target.mode-compact .home-interactive-target-hit {
  left: 50%;
  top: 50%;
  width: max(100%, var(--home-interactive-hit-width, 44px));
  height: max(100%, var(--home-interactive-hit-height, 44px));
  border-radius: var(--home-interactive-hit-radius, 999px);
  transform: translate(-50%, -50%);
}

.home-interactive-target-visual {
  position: relative;
  z-index: 1;
  min-width: 0;
  display: inherit;
  align-items: inherit;
  justify-content: inherit;
  flex-direction: inherit;
  gap: inherit;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.home-interactive-target:focus-visible .home-interactive-target-hit {
  outline: 2px solid rgba(15, 23, 42, 0.18);
  outline-offset: 2px;
  box-shadow: none;
}

.home-interactive-target.is-disabled .home-interactive-target-hit {
  opacity: 0.48;
  box-shadow: none;
  background: transparent;
}
</style>
