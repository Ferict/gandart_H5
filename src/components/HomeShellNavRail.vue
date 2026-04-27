<!--
Responsibility: render the persistent left navigation rail for the home shell and emit
user navigation or drawer-intent events without owning page state transitions.
Out of scope: home-shell runtime derivation, tab activation policy, and drawer content rendering.
-->

<template>
  <view class="home-shell-nav-rail" :style="railStyle">
    <view class="home-shell-nav-rail-scroll">
      <view class="home-shell-nav-safe-top" />

      <view class="home-shell-nav-group">
        <HomeInteractiveTarget
          v-if="props.canExpandDrawer"
          class="home-shell-nav-hit"
          interaction-mode="compact"
          label="打开更多服务"
          @activate="emit('openDrawer')"
        >
          <view class="home-shell-nav-button home-shell-nav-button-menu">
            <AetherIcon
              class="home-shell-nav-menu-icon"
              name="panel-right-open"
              :size="24"
              :stroke-width="1.9"
            />
          </view>
        </HomeInteractiveTarget>
      </view>

      <view class="home-shell-nav-group home-shell-nav-group-main">
        <HomeInteractiveTarget
          v-for="entry in railEntries"
          :key="entry.id"
          class="home-shell-nav-hit"
          interaction-mode="compact"
          :label="entry.label"
          :selected="isEntryActive(entry)"
          @activate="handleNavActivate(entry)"
        >
          <view class="home-shell-nav-button" :class="{ 'is-active': isEntryActive(entry) }">
            <AetherIcon
              :name="resolveHomeShellIconName(entry.iconKey)"
              :size="20"
              :stroke-width="1.9"
            />
            <view
              v-if="entry.indicator?.visible"
              class="home-shell-nav-indicator"
              :class="`tone-${entry.indicator.tone}`"
            />
          </view>
        </HomeInteractiveTarget>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AetherIcon from './AetherIcon.vue'
import type { HomeShellDrawerEntryId } from '../models/home-shell/homeShellMenu.model'
import HomeInteractiveTarget from './HomeInteractiveTarget.vue'
import {
  resolveHomeShellInsets,
  type ViewportRuntimeContext,
} from '../services/home-shell/homeShellLayoutMode.service'
import { resolveHomeShellIconName } from '../utils/homeShellIconMap'
import { useHomeShellNavRailRuntime } from '../pages/home/composables/shared/useHomeShellNavRailRuntime'

interface Props {
  runtimeContext: ViewportRuntimeContext
  canExpandDrawer: boolean
  activeEntryId?: HomeShellDrawerEntryId
}

const props = defineProps<Props>()
const emit = defineEmits<{
  openDrawer: []
}>()

const { railEntries, isEntryActive, handleNavActivate } = useHomeShellNavRailRuntime({
  resolveActiveEntryId: () => props.activeEntryId,
})

const railStyle = computed<CSSProperties>(() => {
  const insets = resolveHomeShellInsets(props.runtimeContext)
  return {
    '--home-rail-safe-top': `${insets.topInset}px`,
    '--home-rail-safe-bottom': `${insets.bottomInset}px`,
  } as CSSProperties
})
</script>

<style lang="scss" scoped>
.home-shell-nav-rail {
  width: 76px;
  min-width: 76px;
  max-width: 76px;
  min-height: 100%;
  overflow: hidden;
  border-radius: 20px;
  border: 1px solid rgba(226, 232, 240, 0.9);
  background-color: rgba(255, 255, 255, 0.92);
  background-image: var(
    --aether-glass-background-image,
    linear-gradient(180deg, rgba(255, 255, 255, 0.82) 0%, rgba(255, 255, 255, 0.82) 100%)
  );
  -webkit-backdrop-filter: var(--aether-glass-blur-filter, blur(8px) saturate(1.2));
  backdrop-filter: var(--aether-glass-blur-filter, blur(8px) saturate(1.2));
  box-shadow: 0 0 20px rgba(15, 23, 42, 0.04);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .home-shell-nav-rail {
    background-color: var(--aether-glass-fallback-bg, rgba(255, 255, 255, 0.96));
    background-image: none;
  }
}

.home-shell-nav-rail-scroll {
  height: 100%;
  min-height: 0;
  overflow: hidden auto;
  padding: calc(8px + var(--home-rail-safe-top, 0px)) 16px
    calc(12px + var(--home-rail-safe-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  scrollbar-width: none;
}

.home-shell-nav-rail-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
}

.home-shell-nav-safe-top {
  width: 100%;
  height: 0;
  flex: 0 0 auto;
}

.home-shell-nav-group {
  width: 44px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.home-shell-nav-group-main {
  gap: 12px;
  margin-top: 4px;
}

.home-shell-nav-hit {
  width: 44px;
  height: 44px;
}

.home-shell-nav-button {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--aether-surface-primary, #ffffff);
  color: #64748b;
  transition:
    transform 180ms ease,
    color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.home-shell-nav-button.is-active {
  background: var(--aether-surface-inverse, #111111);
  color: #22d3ee;
  box-shadow: 0 0 16px rgba(15, 23, 42, 0.08);
}

.home-shell-nav-menu-icon {
  color: inherit;
}

.home-shell-nav-indicator {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  box-shadow: 0 0 0 2px rgba(250, 250, 250, 0.9);
}

.home-shell-nav-indicator.tone-cyan {
  background: #22d3ee;
}

.home-shell-nav-indicator.tone-green {
  background: #34d399;
}

.home-shell-nav-indicator.tone-amber {
  background: #f59e0b;
}

.home-shell-nav-indicator.tone-rose {
  background: #fb7185;
}

.home-shell-nav-indicator.tone-red {
  background: #ef4444;
}

@media (hover: hover) and (pointer: fine) {
  .home-shell-nav-hit:hover .home-shell-nav-button:not(.is-active) {
    transform: translateY(-1px);
    background: var(--aether-surface-primary, #ffffff);
    color: #334155;
    box-shadow: 0 0 16px rgba(15, 23, 42, 0.05);
  }
}
</style>
