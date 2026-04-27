<!--
Responsibility: host the top-level home page shell, wire page entry props into shell runtime,
and bridge shell-level emits back to uni-app page events.
Out of scope: rail-specific data pipelines, result-window timing, and leaf component presentation.
-->

<template>
  <page-meta :page-style="pageMetaStyle" />
  <view
    class="home-page"
    :class="[
      layoutMode,
      {
        'is-drawer-open': isDrawerLayerOpen,
        'is-global-stage-scaled': isGlobalStageScaled,
      },
    ]"
    :style="pageRuntimeStyle"
  >
    <view class="home-stage-scale-shell">
      <view class="home-stage" :class="[layoutMode]">
        <HomeShellTrackStage
          :layout-mode="layoutMode"
          :runtime-context="runtimeContext"
          :home-shell-derived-state="homeShellDerivedState"
          @open-drawer="handleDrawerOpen"
          @change-tab="handleTabChange"
        />
      </view>
    </view>

    <HomeShellTabbar
      v-if="trackLayoutState.showBottomTabbar"
      :runtime-context="runtimeContext"
      :tab-activity-flags="homeShellDerivedState.tabActivityFlags"
      @change-tab="handleTabChange"
    />

    <HomeShellDrawer
      :open="isDrawerLayerOpen"
      :runtime-context="runtimeContext"
      @close="handleDrawerClose"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { useHomeShellState } from '../../composables/useHomeShellState'
import { useResponsiveRailLayout } from '../../composables/useResponsiveRailLayout'
import { HOME_SHELL_PAGE_KEYS, type PageKey } from '../../models/home-shell/homeShell.model'
import { resolveHomeShellTrackLayoutState } from '../../services/home-shell/homeShellLayoutMode.service'
import HomeShellDrawer from '../../components/HomeShellDrawer.vue'
import HomeShellTabbar from './components/shared/HomeShellTabbar.vue'
import HomeShellTrackStage from './components/shared/HomeShellTrackStage.vue'

/**
 * 文件职责：
 * 1. 只维护首页现行单页壳层、窄侧边栏、抽屉与底部标签栏。
 * 2. 小于 375 时统一按 375 基准全局缩放。
 * 3. 768 仅登记为待启用网页阈值，当前运行仍保持单页带侧边栏。
 */

const { layoutMode, runtimeContext } = useResponsiveRailLayout()
const trackLayoutState = computed(() => resolveHomeShellTrackLayoutState(layoutMode.value))
const globalStageScale = computed(() => {
  const viewportWidth = runtimeContext.value.viewportWidth
  if (viewportWidth <= 0 || viewportWidth >= 375) {
    return 1
  }
  return viewportWidth / 375
})
const isGlobalStageScaled = computed(() => {
  return globalStageScale.value < 1
})
const pageRuntimeStyle = computed<CSSProperties>(() => {
  const viewportHeight = runtimeContext.value.viewportHeight
  const stageHeight = viewportHeight > 0 ? `${viewportHeight}px` : undefined
  const stageScale = globalStageScale.value
  const stageWidth = runtimeContext.value.viewportWidth
  const scaledStageWidth = 375 * stageScale
  const stageOffsetXRaw =
    stageScale < 1 && stageWidth > scaledStageWidth ? (stageWidth - scaledStageWidth) / 2 : 0
  const stageOffsetX = Math.round(stageOffsetXRaw)
  const compensatedHeight =
    stageScale < 1 && viewportHeight > 0
      ? `${Math.round(viewportHeight / stageScale)}px`
      : undefined

  return {
    '--home-global-stage-height': stageHeight,
    '--home-global-stage-scale': `${stageScale}`,
    '--home-global-stage-offset-x': `${stageOffsetX}px`,
    '--home-stage-shell-height': compensatedHeight,
  } as CSSProperties
})
const pageMetaStyle = computed(() => {
  const viewportHeight = runtimeContext.value.viewportHeight
  const height = viewportHeight > 0 ? `${viewportHeight}px` : '100vh'
  return `height:${height};min-height:${height};background:var(--aether-page-background,#fafafa);`
})

const {
  isDrawerLayerOpen,
  homeShellDerivedState,
  handleDrawerOpen,
  handleDrawerClose,
  handleTabChange,
} = useHomeShellState({
  layoutMode,
})

onLoad((query) => {
  const nextTab = typeof query?.tab === 'string' ? query.tab : ''
  if (!HOME_SHELL_PAGE_KEYS.includes(nextTab as PageKey)) {
    return
  }

  handleTabChange(nextTab as PageKey)
})
</script>

<style src="./index.scss" lang="scss" scoped></style>
