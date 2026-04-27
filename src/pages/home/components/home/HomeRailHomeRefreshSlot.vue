<!--
Responsibility: render the home rail pull-refresh visual as a real content-flow slot between
HomeRailTopbar and the banner.
Out of scope: gesture ownership, refresh dispatching, and non-home rail refresh indicators.
-->

<template>
  <view
    class="home-refresh-slot"
    :class="{
      'is-visible': slotState.isVisible,
      'is-refreshing': slotState.isRefreshing,
      'is-pull-active': slotState.isPullActive,
    }"
    :style="slotStyle"
    aria-hidden="true"
  >
    <view class="home-refresh-slot-indicator" :style="indicatorStyle">
      <view class="home-refresh-slot-surface">
        <view class="home-refresh-slot-icon-stack">
          <AetherIcon
            class="home-refresh-slot-icon"
            name="refresh-cw"
            :size="18"
            :stroke-width="2"
          />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AetherIcon from '../../../../components/AetherIcon.vue'
import type { HomeTrackRefreshSlotState } from '../../composables/home/useHomeTrackRefreshController'

interface Props {
  state?: HomeTrackRefreshSlotState | null
}

const props = withDefaults(defineProps<Props>(), {
  state: null,
})

const fallbackState: HomeTrackRefreshSlotState = {
  heightPx: 0,
  progress: 0,
  isVisible: false,
  isRefreshing: false,
  isPullActive: false,
}

const slotState = computed(() => props.state ?? fallbackState)

const slotStyle = computed<CSSProperties>(() => ({
  height: `${Math.max(0, slotState.value.heightPx)}px`,
  opacity: slotState.value.isVisible ? '1' : '0',
}))

const indicatorStyle = computed<CSSProperties>(() => ({
  opacity: `${slotState.value.progress}`,
  transform: `translateY(${Math.round((slotState.value.progress - 1) * 10)}px)`,
}))
</script>

<style lang="scss" scoped>
.home-refresh-slot {
  display: flex;
  width: 100%;
  min-height: 0;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  pointer-events: none;
  transition:
    height 180ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 120ms ease;
  box-sizing: border-box;
}

.home-refresh-slot.is-pull-active {
  transition: none;
}

.home-refresh-slot-indicator {
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}

.home-refresh-slot.is-pull-active .home-refresh-slot-indicator {
  transition: none;
}

.home-refresh-slot-surface {
  position: relative;
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-image: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.56) 0%,
    rgba(255, 255, 255, 0.32) 100%
  );
  -webkit-backdrop-filter: blur(8px) saturate(1.2);
  backdrop-filter: blur(8px) saturate(1.2);
  box-shadow:
    var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08)),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .home-refresh-slot-surface {
    background-color: rgba(255, 255, 255, 0.4);
    background-image: none;
  }
}

.home-refresh-slot-icon-stack {
  position: relative;
  z-index: 1;
  display: flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
}

.home-refresh-slot-icon {
  display: inline-flex;
  color: #111111;
  align-items: center;
  justify-content: center;
}

.home-refresh-slot.is-refreshing .home-refresh-slot-icon-stack {
  animation: home-refresh-slot-spin 720ms linear infinite;
}

@keyframes home-refresh-slot-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
