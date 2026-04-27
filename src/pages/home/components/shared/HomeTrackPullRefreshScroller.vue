<!--
Responsibility: hide the third-party z-paging pull-refresh scroller behind a home-track local
adapter so HomeShellTrackStage keeps a stable scroll and refresh contract.
Out of scope: rail content fetching, refresh indicator rendering, and non-home rail migration.
-->

<template>
  <view v-bind="$attrs" class="home-track-pull-refresh-scroller" :style="scrollerStyle">
    <z-paging
      ref="pagingRef"
      v-model="pagingList"
      class="home-track-pull-refresh-paging"
      :fixed="false"
      :use-page-scroll="false"
      :auto="false"
      :created-reload="false"
      :refresher-enabled="props.isActive"
      :refresher-only="true"
      :use-custom-refresher="true"
      :refresher-no-transform="true"
      :watch-refresher-touchmove="true"
      :refresher-threshold="props.refresherThresholdPx"
      refresher-default-style="none"
      refresher-background="transparent"
      refresher-fixed-background="transparent"
      :refresher-default-duration="100"
      :refresher-complete-delay="0"
      :refresher-complete-duration="120"
      :refresher-end-bounce-enabled="false"
      :refresher-refreshing-scrollable="true"
      :loading-more-enabled="false"
      :to-bottom-loading-more-enabled="false"
      :show-scrollbar="false"
      :auto-clean-list-when-reload="false"
      :auto-scroll-to-top-when-reload="false"
      :scroll-to-top-bounce-enabled="false"
      :scroll-to-bottom-bounce-enabled="false"
      @scroll="handleScroll"
      @query="handleQuery"
      @refresher-status-change="handleRefresherStatusChange"
      @refresher-touchmove="handleRefresherTouchmove"
    >
      <slot />

      <template #refresher>
        <view class="home-track-pull-refresh-refresher" aria-hidden="true" />
      </template>
    </z-paging>
  </view>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'

defineOptions({
  inheritAttrs: false,
})

interface Props {
  refresherThresholdPx: number
  isActive?: boolean
}

interface ZPagingScrollEvent {
  detail?: {
    scrollTop?: number
    scrollHeight?: number
    scrollLeft?: number
    scrollWidth?: number
    deltaX?: number
    deltaY?: number
  }
  target?: EventTarget | null
  currentTarget?: EventTarget | null
}

interface ZPagingRefresherTouchmoveInfo {
  pullingDistance?: number
  dy?: number
}

interface HomeTrackRefresherPullingEvent {
  detail: {
    pullingDistance: number
    dy: number
  }
}

interface ZPagingExpose {
  complete?: (data: unknown[] | false, success?: boolean) => Promise<unknown> | void
  endRefresh?: () => void
}

const props = withDefaults(defineProps<Props>(), {
  isActive: true,
})

const emit = defineEmits<{
  scroll: [event: ZPagingScrollEvent]
  refresh: []
  refresherPulling: [event: HomeTrackRefresherPullingEvent]
  refresherRestore: []
}>()

const pagingRef = ref<ZPagingExpose | null>(null)
const pagingList = ref<unknown[]>([])

const scrollerStyle = computed(() => ({
  '--home-track-pull-refresh-threshold': `${props.refresherThresholdPx}px`,
}))

const resolveFiniteNumber = (value: unknown) => {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

const completeRefresh = async (success = true) => {
  const paging = pagingRef.value
  if (!paging) {
    return
  }

  try {
    const completeResult = paging.complete?.([], success)
    if (completeResult && typeof completeResult.then === 'function') {
      await completeResult
    }
  } catch {
    paging.endRefresh?.()
  }
}

const handleScroll = (event: ZPagingScrollEvent) => {
  emit('scroll', event)
}

const handleQuery = (_pageNo: number, _pageSize: number, from: string) => {
  if (from !== 'user-pull-down' || !props.isActive) {
    void completeRefresh(true)
    return
  }

  emit('refresh')
}

const handleRefresherStatusChange = (status: string) => {
  if (status === 'default') {
    emit('refresherRestore')
  }
}

const handleRefresherTouchmove = (info: ZPagingRefresherTouchmoveInfo) => {
  emit('refresherPulling', {
    detail: {
      pullingDistance: resolveFiniteNumber(info.pullingDistance),
      dy: resolveFiniteNumber(info.dy),
    },
  })
}

defineExpose({
  completeRefresh,
})
</script>

<style lang="scss" scoped>
.home-track-pull-refresh-scroller {
  position: relative;
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--aether-page-background, #fafafa);
  box-sizing: border-box;
}

.home-track-pull-refresh-paging {
  display: block;
  width: 100%;
  height: 100%;
  min-height: 0;
}

.home-track-pull-refresh-refresher {
  width: 100%;
  height: var(--home-track-pull-refresh-threshold, 144px);
  pointer-events: none;
}

.home-track-pull-refresh-scroller :deep(.z-paging-content),
.home-track-pull-refresh-scroller :deep(.zp-view-super),
.home-track-pull-refresh-scroller :deep(.zp-scroll-view-super),
.home-track-pull-refresh-scroller :deep(.zp-scroll-view-container),
.home-track-pull-refresh-scroller :deep(.zp-scroll-view) {
  height: 100%;
  min-height: 0;
  background: var(--aether-page-background, #fafafa);
}

.home-track-pull-refresh-scroller :deep(.zp-paging-main),
.home-track-pull-refresh-scroller :deep(.zp-paging-container),
.home-track-pull-refresh-scroller :deep(.zp-paging-container-content) {
  min-height: 100%;
}
</style>
