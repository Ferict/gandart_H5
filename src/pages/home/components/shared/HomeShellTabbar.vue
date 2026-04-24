<!--
Responsibility: render the home shell bottom tabbar, including active state display,
click forwarding, and local shell-level presentation.
Out of scope: tab routing policy, page visibility orchestration, and rail data runtime.
-->

<template>
  <view class="home-shell-tabbar-wrap" :style="tabbarStyle">
    <view class="home-shell-tabbar-surface">
      <view class="home-shell-tabbar-track">
        <HomeInteractiveTarget
          class="home-shell-tabbar-item"
          :class="{
            'is-active': props.tabActivityFlags.isHomeTabActive,
            'is-preview':
              previewTab === HOME_PRIMARY_PAGE_KEY && !props.tabActivityFlags.isHomeTabActive,
          }"
          interaction-mode="compact"
          :hit-width="48"
          :hit-height="48"
          label="首页"
          @mouseenter="handlePreviewEnter(HOME_PRIMARY_PAGE_KEY)"
          @mouseleave="handlePreviewLeave"
          @touchstart="handlePreviewTouchStart(HOME_PRIMARY_PAGE_KEY)"
          @touchmove="handlePreviewTouchMove"
          @touchend="handlePreviewTouchEnd"
          @touchcancel="handlePreviewTouchEnd"
          @activate="handleChangeTab(HOME_PRIMARY_PAGE_KEY)"
        >
          <view
            class="home-shell-tabbar-icon-shell"
            :class="{ 'is-active': props.tabActivityFlags.isHomeTabActive }"
          >
            <view class="home-shell-tabbar-hit">
              <view class="home-shell-tabbar-icon">
                <AetherIcon
                  class="home-shell-tabbar-icon-svg"
                  name="house"
                  :size="24"
                  :stroke-width="1.5"
                />
              </view>
            </view>
          </view>
        </HomeInteractiveTarget>

        <HomeInteractiveTarget
          class="home-shell-tabbar-item"
          :class="{
            'is-active': props.tabActivityFlags.isActivityTabActive,
            'is-preview':
              previewTab === HOME_ACTIVITY_PAGE_KEY && !props.tabActivityFlags.isActivityTabActive,
          }"
          interaction-mode="compact"
          :hit-width="48"
          :hit-height="48"
          label="活动"
          @mouseenter="handlePreviewEnter(HOME_ACTIVITY_PAGE_KEY)"
          @mouseleave="handlePreviewLeave"
          @touchstart="handlePreviewTouchStart(HOME_ACTIVITY_PAGE_KEY)"
          @touchmove="handlePreviewTouchMove"
          @touchend="handlePreviewTouchEnd"
          @touchcancel="handlePreviewTouchEnd"
          @activate="handleChangeTab(HOME_ACTIVITY_PAGE_KEY)"
        >
          <view
            class="home-shell-tabbar-icon-shell"
            :class="{ 'is-active': props.tabActivityFlags.isActivityTabActive }"
          >
            <view class="home-shell-tabbar-hit">
              <view class="home-shell-tabbar-icon">
                <AetherIcon
                  class="home-shell-tabbar-icon-svg"
                  name="activity"
                  :size="24"
                  :stroke-width="1.5"
                />
              </view>
            </view>
          </view>
        </HomeInteractiveTarget>

        <HomeInteractiveTarget
          class="home-shell-tabbar-item"
          :class="{
            'is-active': props.tabActivityFlags.isProfileTabActive,
            'is-preview':
              previewTab === HOME_PROFILE_PAGE_KEY && !props.tabActivityFlags.isProfileTabActive,
          }"
          interaction-mode="compact"
          :hit-width="48"
          :hit-height="48"
          label="我的"
          @mouseenter="handlePreviewEnter(HOME_PROFILE_PAGE_KEY)"
          @mouseleave="handlePreviewLeave"
          @touchstart="handlePreviewTouchStart(HOME_PROFILE_PAGE_KEY)"
          @touchmove="handlePreviewTouchMove"
          @touchend="handlePreviewTouchEnd"
          @touchcancel="handlePreviewTouchEnd"
          @activate="handleChangeTab(HOME_PROFILE_PAGE_KEY)"
        >
          <view
            class="home-shell-tabbar-icon-shell"
            :class="{ 'is-active': props.tabActivityFlags.isProfileTabActive }"
          >
            <view class="home-shell-tabbar-hit">
              <view class="home-shell-tabbar-icon">
                <AetherIcon
                  class="home-shell-tabbar-icon-svg"
                  name="user-round"
                  :size="24"
                  :stroke-width="1.5"
                />
              </view>
            </view>
          </view>
        </HomeInteractiveTarget>

        <view class="home-shell-tabbar-preview-rail" :style="previewRailStyle" aria-hidden="true">
          <view class="home-shell-tabbar-preview-pill" />
        </view>

        <view class="home-shell-tabbar-indicator-rail" :style="indicatorRailStyle">
          <view class="home-shell-tabbar-indicator-dot" />
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import {
  HOME_ACTIVITY_PAGE_KEY,
  HOME_PRIMARY_PAGE_KEY,
  HOME_PROFILE_PAGE_KEY,
  type PageKey,
} from '../../../../models/home-shell/homeShell.model'
import {
  resolveHomeShellInsets,
  type ViewportRuntimeContext,
} from '../../../../services/home-shell/homeShellLayoutMode.service'
import type { HomeShellTabActivityFlags } from '../../../../services/home-shell/homeShellState.service'
import { useHomeShellTabbarRuntime } from '../../composables/shared/useHomeShellTabbarRuntime'

interface Props {
  runtimeContext: ViewportRuntimeContext
  tabActivityFlags: HomeShellTabActivityFlags
}

const props = defineProps<Props>()
const emit = defineEmits<{
  changeTab: [tab: PageKey]
}>()

const TABBAR_BOTTOM_GAP_BASE = 32

const tabbarStyle = computed<CSSProperties>(() => {
  const insets = resolveHomeShellInsets(props.runtimeContext)
  return {
    '--home-tabbar-safe-bottom': `${insets.bottomInset}px`,
    '--home-tabbar-bottom-gap': `${TABBAR_BOTTOM_GAP_BASE}px`,
  } as CSSProperties
})
const {
  previewTab,
  indicatorRailStyle,
  previewRailStyle,
  handlePreviewEnter,
  handlePreviewLeave,
  handlePreviewTouchStart,
  handlePreviewTouchMove,
  handlePreviewTouchEnd,
  handleChangeTab,
} = useHomeShellTabbarRuntime({
  resolveTabActivityFlags: () => props.tabActivityFlags,
  emitChangeTab: (tab) => {
    emit('changeTab', tab)
  },
})
</script>

<style lang="scss" scoped>
.home-shell-tabbar-surface {
  position: relative;
  display: flex;
  width: 100%;
  min-height: 64px;
  padding: 8px 16px;
  box-sizing: border-box;
  border-radius: 999px;
  border: 1px solid var(--aether-glass-border, rgba(229, 231, 235, 0.68));
  background-image: var(
    --aether-glass-background-image,
    linear-gradient(180deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.8) 100%)
  );
  -webkit-backdrop-filter: var(--aether-glass-blur-filter, blur(8px) saturate(1.2));
  backdrop-filter: var(--aether-glass-blur-filter, blur(8px) saturate(1.2));
  box-shadow: var(--aether-glass-shadow, 0 0 44px rgba(15, 23, 42, 0.08));
  overflow: hidden;
}

.home-shell-tabbar-surface::before {
  display: none;
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .home-shell-tabbar-surface {
    background-color: var(--aether-glass-fallback-bg, rgba(255, 255, 255, 0.96));
    background-image: none;
  }
}

.home-shell-tabbar-wrap {
  position: fixed;
  left: 50%;
  bottom: calc(
    max(var(--home-tabbar-safe-bottom, 0px), var(--window-bottom, 0px)) +
      var(--home-tabbar-bottom-gap, 32px)
  );
  z-index: 20;
  transform: translateX(-50%);
  width: 272px;
  max-width: calc(100% - 24px);
}

.home-shell-tabbar-track {
  position: relative;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 0;
  min-height: 48px;
  isolation: isolate;
}

.home-shell-tabbar-item {
  position: relative;
  z-index: 1;
  display: flex;
  min-width: 0;
  flex: 1 1 0;
  align-items: center;
  justify-content: center;
  height: 48px;
  cursor: pointer;
  outline: none;
}

.home-shell-tabbar-item:focus-visible .home-shell-tabbar-icon {
  color: #111111;
}

.home-shell-tabbar-icon-shell {
  display: inline-flex;
  transition:
    transform 200ms ease,
    color 160ms ease;
}

.home-shell-tabbar-icon-shell.is-active {
  transform: translateY(-1px) scale(1.0417);
  animation: home-shell-tabbar-icon-active-in 220ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-shell-tabbar-hit {
  position: relative;
  width: 48px;
  height: 48px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-shell-tabbar-item.is-preview .home-shell-tabbar-icon-shell {
  transform: translateY(-1px);
}

.home-shell-tabbar-item.is-preview .home-shell-tabbar-icon {
  color: #6b7280;
}

.home-shell-tabbar-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
}

.home-shell-tabbar-item.is-active .home-shell-tabbar-icon {
  color: #111111;
}

.home-shell-tabbar-item.is-fixed .home-shell-tabbar-icon {
  color: #475569;
}

.home-shell-tabbar-preview-rail {
  position: absolute;
  left: 0;
  top: 0;
  width: calc(100% / 3);
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
  z-index: 0;
  transition:
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1),
    opacity 140ms ease;
}

.home-shell-tabbar-preview-pill {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.24);
  background: rgba(148, 163, 184, 0.15);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.38);
}

.home-shell-tabbar-indicator-rail {
  position: absolute;
  left: 0;
  bottom: 4px;
  width: calc(100% / 3);
  display: flex;
  justify-content: center;
  pointer-events: none;
  z-index: 2;
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-shell-tabbar-indicator-dot {
  width: 4px;
  height: 4px;
  border-radius: 999px;
  background: #22d3ee;
}

@keyframes home-shell-tabbar-icon-active-in {
  0% {
    opacity: 0.76;
    transform: translateY(4px) scale(0.9583);
  }

  100% {
    opacity: 1;
    transform: translateY(-1px) scale(1.0417);
  }
}
</style>
