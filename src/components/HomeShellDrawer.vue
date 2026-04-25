<!--
Responsibility: render the home shell drawer and keep the local mask, layout shell, and
presentation wiring isolated from the app-level menu runtime.
Out of scope: menu data ownership, route navigation strategy, and page content loading.
-->

<template>
  <view
    class="home-shell-drawer-mask"
    :class="{ 'is-open': props.open }"
    @tap="emitClose"
    @touchmove.stop.prevent
  />

  <view
    class="home-shell-side-drawer"
    :class="{ 'is-open': props.open }"
    :style="drawerStyle"
    @tap.stop
    @touchmove.stop.prevent
  >
    <view class="home-shell-drawer-panel">
      <view class="home-shell-drawer-safe-top" />

      <view class="home-shell-drawer-head">
        <view class="home-shell-drawer-copy">
          <view class="home-shell-drawer-title-group">
            <text class="home-shell-drawer-title">更多服务</text>
            <text class="home-shell-drawer-title-subtitle">{{ AETHER_SERVICE_HUB_LABEL_EN }}</text>
          </view>
          <view class="home-shell-drawer-title-divider" />
        </view>

        <HomeInteractiveTarget
          class="home-shell-drawer-close-entry"
          interaction-mode="compact"
          label="关闭更多服务"
          @activate="emitClose"
        >
          <view class="home-shell-drawer-close-visual">
            <AetherIcon name="x" :size="20" :stroke-width="1.9" />
          </view>
        </HomeInteractiveTarget>
      </view>

      <scroll-view class="home-shell-drawer-scroll" scroll-y>
        <view class="home-shell-drawer-list">
          <HomeInteractiveTarget
            v-for="entry in drawerEntries"
            :key="entry.id"
            class="home-shell-drawer-item-entry"
            :label="entry.label"
            @activate="handleEntryActivate(entry.routeUrl)"
          >
            <view class="home-shell-drawer-item">
              <view class="home-shell-drawer-item-left">
                <view class="home-shell-drawer-icon-shell">
                  <AetherIcon
                    :name="resolveHomeShellIconName(entry.iconKey)"
                    :size="16"
                    :stroke-width="1.8"
                  />
                  <view
                    v-if="entry.indicator?.visible"
                    class="home-shell-drawer-indicator"
                    :class="`tone-${entry.indicator.tone}`"
                  />
                </view>

                <view class="home-shell-drawer-labels">
                  <text class="home-shell-drawer-item-title">{{ entry.label }}</text>
                </view>
              </view>

              <view class="home-shell-drawer-item-right">
                <view
                  v-if="entry.badge"
                  class="home-shell-drawer-badge"
                  :class="`tone-${entry.badge.tone}`"
                >
                  <text class="home-shell-drawer-badge-label">{{ entry.badge.label }}</text>
                  <text v-if="entry.badge.value" class="home-shell-drawer-badge-value">{{
                    entry.badge.value
                  }}</text>
                </view>

                <AetherIcon
                  class="home-shell-drawer-chevron"
                  name="chevron-right"
                  :size="16"
                  :stroke-width="1.9"
                />
              </view>
            </view>
          </HomeInteractiveTarget>
        </view>
      </scroll-view>

      <view class="home-shell-drawer-footer">
        <view class="home-shell-drawer-footer-copy">
          <text class="home-shell-drawer-footer-name">{{ AETHER_APP_NAME_ZH }}</text>
          <text class="home-shell-drawer-footer-version">{{ AETHER_APP_VERSION }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AetherIcon from './AetherIcon.vue'
import HomeInteractiveTarget from './HomeInteractiveTarget.vue'
import {
  AETHER_APP_NAME_ZH,
  AETHER_APP_VERSION,
  AETHER_SERVICE_HUB_LABEL_EN,
} from '../services/app/appIdentity.service'
import {
  resolveHomeShellInsets,
  type ViewportRuntimeContext,
} from '../services/home-shell/homeShellLayoutMode.service'
import { resolveHomeShellIconName } from '../utils/homeShellIconMap'
import { useHomeShellDrawerRuntime } from '../pages/home/composables/shared/useHomeShellDrawerRuntime'

interface Props {
  open: boolean
  runtimeContext: ViewportRuntimeContext
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
}>()

const drawerStyle = computed<CSSProperties>(() => {
  const insets = resolveHomeShellInsets(props.runtimeContext)
  return {
    '--home-drawer-safe-top': `${insets.topInset}px`,
    '--home-drawer-safe-bottom': `${insets.bottomInset}px`,
  } as CSSProperties
})

const emitClose = () => {
  emit('close')
}

const { drawerEntries, handleEntryActivate } = useHomeShellDrawerRuntime({
  emitClose,
})
</script>

<style lang="scss" scoped>
.home-shell-drawer-mask {
  position: fixed;
  inset: 0;
  z-index: 40;
  background: rgba(15, 23, 42, 0);
  opacity: 0;
  pointer-events: none;
  transition:
    opacity 200ms ease,
    background-color 200ms ease;
}

.home-shell-drawer-mask.is-open {
  opacity: 1;
  pointer-events: auto;
  background: rgba(15, 23, 42, 0.4);
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .home-shell-drawer-mask.is-open {
    background: rgba(15, 23, 42, 0.48);
  }
}

.home-shell-side-drawer {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  z-index: 50;
  width: min(304px, calc(100vw - 24px));
  transform: translateX(100%);
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
  pointer-events: none;
}

.home-shell-side-drawer.is-open {
  transform: translateX(0);
  pointer-events: auto;
}

.home-shell-drawer-panel {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  background: rgba(250, 250, 250, 0.98);
  border-left: 1px solid rgba(226, 232, 240, 0.92);
  box-shadow: var(--aether-shadow-overlay-sheet, 0 0 32px rgba(15, 23, 42, 0.08));
  -webkit-backdrop-filter: blur(12px);
  backdrop-filter: blur(12px);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .home-shell-drawer-panel {
    background: var(--aether-page-background, #fafafa);
  }
}

.home-shell-drawer-safe-top {
  width: 100%;
  height: var(--home-drawer-safe-top, 0);
  flex: 0 0 auto;
}

.home-shell-drawer-head {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 12px 20px 16px;
  box-sizing: border-box;
}

.home-shell-drawer-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-shell-drawer-title-group {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.home-shell-drawer-title {
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  color: #111111;
}

.home-shell-drawer-title-subtitle {
  min-height: 12px;
  display: inline-block;
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
  color: #22d3ee;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transform: scale(0.75);
  transform-origin: left bottom;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-shell-drawer-title-divider {
  width: 24px;
  height: 2px;
  border-radius: 999px;
  background: rgba(34, 211, 238, 0.78);
}

.home-shell-drawer-close-entry {
  width: 40px;
  height: 40px;
  flex: 0 0 auto;
}

.home-shell-drawer-close-visual {
  width: 40px;
  height: 40px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  color: #111111;
  box-shadow: none;
}

.home-shell-drawer-scroll {
  flex: 1 1 auto;
  min-height: 0;
}

.home-shell-drawer-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 16px;
  box-sizing: border-box;
}

.home-shell-drawer-item-entry {
  border-radius: var(--aether-surface-radius-md, 16px);
}

.home-shell-drawer-item {
  min-height: 72px;
  border-radius: var(--aether-surface-radius-md, 16px);
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px;
  box-sizing: border-box;
  box-shadow: var(--aether-shadow-surface-sm, 0 0 16px rgba(15, 23, 42, 0.04));
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.home-shell-drawer-item-left {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-shell-drawer-icon-shell {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 12px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
  background: #f4f5f7;
  transition:
    background-color 180ms ease,
    color 180ms ease;
}

.home-shell-drawer-indicator {
  position: absolute;
  top: -1px;
  right: -1px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
}

.home-shell-drawer-indicator.tone-cyan {
  background: #22d3ee;
}

.home-shell-drawer-indicator.tone-green {
  background: #34d399;
}

.home-shell-drawer-indicator.tone-amber {
  background: #f59e0b;
}

.home-shell-drawer-indicator.tone-rose {
  background: #fb7185;
}

.home-shell-drawer-indicator.tone-red {
  background: #ef4444;
}

.home-shell-drawer-labels {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  align-items: center;
}

.home-shell-drawer-item-title {
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 800;
  color: #111111;
}

.home-shell-drawer-item-right {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-shell-drawer-badge {
  min-height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 0 12px;
  box-sizing: border-box;
}

.home-shell-drawer-badge-label,
.home-shell-drawer-badge-value {
  font-size: 10px;
  line-height: 12px;
  font-weight: 800;
}

.home-shell-drawer-badge-value {
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-shell-drawer-badge.tone-success {
  background: #ecfdf5;
  color: #10b981;
}

.home-shell-drawer-badge.tone-info {
  background: #ecfeff;
  color: #0891b2;
}

.home-shell-drawer-badge.tone-accent {
  background: #f4f8ff;
  color: #4c7bef;
}

.home-shell-drawer-chevron {
  color: #cbd5e1;
  transition:
    color 180ms ease,
    transform 180ms ease;
}

.home-shell-drawer-footer {
  flex: 0 0 auto;
  padding: 20px 20px calc(32px + var(--home-drawer-safe-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-shell-drawer-footer-copy {
  position: relative;
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding-top: 12px;
  font-family: var(--aether-font-system, system-ui, sans-serif);
  color: #94a3b8;
}

.home-shell-drawer-footer-copy::before {
  content: '';
  position: absolute;
  top: 0;
  left: 50%;
  width: 20px;
  height: 1px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.24);
  transform: translateX(-50%);
}

.home-shell-drawer-footer-name {
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
  letter-spacing: 0.04em;
}

.home-shell-drawer-footer-version {
  font-size: 11px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.06em;
  opacity: 0.9;
}

@media (hover: hover) and (pointer: fine) {
  .home-shell-drawer-item-entry:hover .home-shell-drawer-item {
    transform: translateX(-2px);
    background: var(--aether-surface-primary, #ffffff);
    box-shadow: var(--aether-shadow-surface-md, 0 0 24px rgba(15, 23, 42, 0.05));
  }

  .home-shell-drawer-item-entry:hover .home-shell-drawer-icon-shell {
    color: #22d3ee;
    background: var(--aether-surface-inverse, #111111);
  }

  .home-shell-drawer-item-entry:hover .home-shell-drawer-chevron {
    color: #111111;
    transform: translateX(1px);
  }
}
</style>
