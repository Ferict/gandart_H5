<!--
Responsibility: render the market result footer shell, including the load-more sentinel and
shared list footer feedback states for the home rail.
Out of scope: result-window behavior, load-more policy, and footer mode decision logic.
-->
<template>
  <view
    v-if="hasMoreMarketItems"
    :ref="handleMarketLoadMoreSentinelRef"
    class="home-market-load-more-sentinel"
    aria-hidden="true"
  />

  <HomeRailListLoadingFooter
    v-if="shouldRenderHomeBottomFooter"
    :mode="footerMode"
    error-text="加载失败"
    retry-text="重试"
    zh-text="没有更多藏品了"
    en-text="No more collectibles"
    @retry="emit('retry')"
  />
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import type { HomeRailListLoadingFooterMode } from '../shared/homeRailListLoadingFooter.a11y'
import HomeRailListLoadingFooter from '../shared/HomeRailListLoadingFooter.vue'

interface Props {
  hasMoreMarketItems: boolean
  shouldRenderHomeBottomFooter: boolean
  footerMode: HomeRailListLoadingFooterMode
  setMarketLoadMoreSentinelRef: (element: HTMLElement | null) => void
}

const props = defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()

const handleMarketLoadMoreSentinelRef = (element: Element | ComponentPublicInstance | null) => {
  props.setMarketLoadMoreSentinelRef(element instanceof HTMLElement ? element : null)
}
</script>

<style lang="scss" scoped>
.home-market-load-more-sentinel {
  width: 100%;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}
</style>
