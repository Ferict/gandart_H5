<!--
Responsibility: adapt the home market category data to full-width uview-plus tabs while floating
the fixed search entry over the right edge.
Out of scope: active tag ownership, market query execution, and search visibility orchestration.
-->
<template>
  <view ref="tagWrapRef" class="home-market-tag-wrap">
    <up-tabs
      class="home-market-tag-tabs"
      :list="props.marketTags"
      :current="activeMarketTagIndex"
      key-name="label"
      scrollable
      :duration="resolvedScrollDurationMs"
      line-color="transparent"
      :line-width="0"
      :line-height="0"
      :active-style="marketTagActiveStyle"
      :inactive-style="marketTagInactiveStyle"
      :item-style="marketTagItemStyle"
      @change="handleTagChange"
    >
      <template #content="{ item }">
        <view class="home-market-tag-pill">
          <text class="home-market-tag-text">{{ item.label }}</text>
        </view>
      </template>
    </up-tabs>

    <view class="home-market-action-overlay">
      <view
        class="home-market-tag-fade-right"
        :class="{ 'is-visible': showFadeRight }"
        aria-hidden="true"
      />
      <HomeInteractiveTarget
        class="home-market-action-entry"
        :class="{ 'is-active': props.isMarketSearchActive }"
        interaction-mode="compact"
        :hit-width="44"
        :hit-height="44"
        :label="props.isMarketSearchActive ? '收起市场搜索' : props.marketSearchActionLabel"
        @activate="emit('market-search-click')"
      >
        <AetherIcon class="home-market-action-icon" name="search" :size="16" :stroke-width="2" />
      </HomeInteractiveTarget>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import type { HomeMarketTag } from '../../../../models/home-rail/homeRailHome.model'
import { isRightFadeVisible } from './homeMarketTagFade'

interface Props {
  marketTags: HomeMarketTag[]
  activeMarketTagId: string
  isMarketSearchActive: boolean
  marketSearchActionLabel: string
  scrollDurationMs?: number
}

interface UviewTabsChangePayload extends HomeMarketTag {
  index?: number
}

interface HomeMarketTagWrapRef {
  querySelector?: (selectors: string) => Element | null
  $el?: {
    querySelector?: (selectors: string) => Element | null
  }
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'tag-select': [tag: HomeMarketTag]
  'market-search-click': []
}>()

const marketTagActiveStyle = {
  color: '#ffffff',
  fontSize: '12px',
  fontWeight: 700,
  lineHeight: '16px',
}

const marketTagInactiveStyle = {
  color: '#9ca3af',
  fontSize: '12px',
  fontWeight: 700,
  lineHeight: '16px',
}

const marketTagItemStyle = {
  height: '44px',
  padding: '8px 6px',
}

const resolvedScrollDurationMs = computed(() => props.scrollDurationMs ?? 320)
const delayedRefreshMs = computed(() => resolvedScrollDurationMs.value + 60)

const activeMarketTagIndex = computed(() => {
  const activeIndex = props.marketTags.findIndex((tag) => tag.id === props.activeMarketTagId)
  return activeIndex >= 0 ? activeIndex : 0
})

const handleTagChange = (payload: UviewTabsChangePayload, fallbackIndex?: number) => {
  const nextIndex =
    typeof payload?.index === 'number'
      ? payload.index
      : typeof fallbackIndex === 'number'
        ? fallbackIndex
        : -1
  const nextTag = props.marketTags[nextIndex]

  if (nextTag) {
    emit('tag-select', nextTag)
  }
}

const tagWrapRef = ref<HomeMarketTagWrapRef | null>(null)
const showFadeRight = ref(false)

const RIGHT_FADE_SCROLL_SELECTOR = '.u-tabs__wrapper__scroll-view'
const RIGHT_FADE_H5_NATIVE_SCROLL_SELECTOR = '.uni-scroll-view-scrollbar-hidden'

let scrollEl: HTMLElement | null = null
let handleScroll: (() => void) | null = null
let resizeObserver: ResizeObserver | null = null
let resizeFallbackHandler: (() => void) | null = null
let frameRefreshId: number | null = null
let delayedRefreshTimer: ReturnType<typeof setTimeout> | null = null

const clearScheduledRefresh = () => {
  if (
    frameRefreshId !== null &&
    typeof window !== 'undefined' &&
    typeof window.cancelAnimationFrame === 'function'
  ) {
    window.cancelAnimationFrame(frameRefreshId)
  }

  if (delayedRefreshTimer !== null) {
    clearTimeout(delayedRefreshTimer)
  }

  frameRefreshId = null
  delayedRefreshTimer = null
}

const resolveScrollElement = (): HTMLElement | null => {
  const wrap = tagWrapRef.value
  if (!wrap) return null
  const anchorEl =
    wrap.querySelector?.(RIGHT_FADE_SCROLL_SELECTOR) ??
    wrap.$el?.querySelector?.(RIGHT_FADE_SCROLL_SELECTOR)

  if (!anchorEl) {
    return null
  }

  const nativeScrollEl = resolveNativeScrollElement(anchorEl)
  if (nativeScrollEl) {
    return nativeScrollEl
  }

  if (!('addEventListener' in anchorEl)) {
    return null
  }

  return anchorEl as HTMLElement
}

const resolveNativeScrollElement = (anchorEl: Element): HTMLElement | null => {
  const nativeScrollEl = anchorEl.querySelector?.(RIGHT_FADE_H5_NATIVE_SCROLL_SELECTOR)

  if (!nativeScrollEl || !('addEventListener' in nativeScrollEl)) {
    return null
  }

  return nativeScrollEl as HTMLElement
}

const refreshScrollState = () => {
  if (!scrollEl) {
    showFadeRight.value = false
    return
  }

  showFadeRight.value = isRightFadeVisible({
    scrollLeft: scrollEl.scrollLeft,
    clientWidth: scrollEl.clientWidth,
    scrollWidth: scrollEl.scrollWidth,
  })
}

const unbindScrollElement = () => {
  if (scrollEl && handleScroll) {
    scrollEl.removeEventListener('scroll', handleScroll)
  }

  if (resizeObserver) {
    resizeObserver.disconnect()
  }

  if (
    resizeFallbackHandler &&
    typeof window !== 'undefined' &&
    typeof window.removeEventListener === 'function'
  ) {
    window.removeEventListener('resize', resizeFallbackHandler)
  }

  scrollEl = null
  handleScroll = null
  resizeObserver = null
  resizeFallbackHandler = null
}

const bindResizeRefresh = () => {
  if (!scrollEl) return

  if (typeof ResizeObserver !== 'undefined') {
    resizeObserver = new ResizeObserver(() => scheduleScrollStateRefresh())
    resizeObserver.observe(scrollEl)
    return
  }

  if (typeof window !== 'undefined' && typeof window.addEventListener === 'function') {
    resizeFallbackHandler = () => scheduleScrollStateRefresh()
    window.addEventListener('resize', resizeFallbackHandler, { passive: true })
  }
}

const bindScrollElement = () => {
  const nextScrollEl = resolveScrollElement()

  if (nextScrollEl === scrollEl) {
    refreshScrollState()
    return
  }

  unbindScrollElement()

  if (!nextScrollEl) {
    showFadeRight.value = false
    return
  }

  scrollEl = nextScrollEl
  handleScroll = () => refreshScrollState()
  scrollEl.addEventListener('scroll', handleScroll, { passive: true })
  bindResizeRefresh()
  refreshScrollState()
}

const refreshAfterAnimationFrame = () => {
  if (typeof window === 'undefined' || typeof window.requestAnimationFrame !== 'function') {
    bindScrollElement()
    return
  }

  frameRefreshId = window.requestAnimationFrame(() => {
    frameRefreshId = null
    bindScrollElement()
  })
}

function scheduleScrollStateRefresh() {
  clearScheduledRefresh()

  nextTick(() => {
    bindScrollElement()
    refreshAfterAnimationFrame()
    delayedRefreshTimer = setTimeout(() => {
      delayedRefreshTimer = null
      bindScrollElement()
    }, delayedRefreshMs.value)
  })
}

onMounted(() => {
  scheduleScrollStateRefresh()
})

watch(
  () => [props.marketTags, props.activeMarketTagId, props.scrollDurationMs],
  () => scheduleScrollStateRefresh(),
  { deep: true }
)

onBeforeUnmount(() => {
  clearScheduledRefresh()
  unbindScrollElement()
})
</script>

<style lang="scss" scoped>
.home-market-tag-wrap {
  position: relative;
  width: calc(100% + (var(--home-page-inline-padding, 16px) * 2));
  overflow: visible;
  padding: 0;
  margin: 0 calc(var(--home-page-inline-padding, 16px) * -1);
  box-sizing: border-box;
  --home-market-action-overlay-width: 96px;
  --home-market-action-reserve-width: 52px;
}

.home-market-tag-tabs {
  width: 100%;
  padding: 6px 0;
  margin: -14px 0;
}

/* stylelint-disable selector-class-pattern -- uview-plus exposes BEM-like internal classes. */
.home-market-tag-wrap :deep(.u-tabs__wrapper) {
  overflow: visible;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__scroll-view-wrapper) {
  overflow: auto hidden;
  scrollbar-width: none;
  min-width: 0;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__scroll-view-wrapper::-webkit-scrollbar) {
  width: 0;
  height: 0;
  display: none;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__nav) {
  align-items: center;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__nav__item) {
  position: relative;
  min-width: 0;
  flex: 0 0 auto;
  box-sizing: border-box;
  overflow: visible;
  transition:
    transform 180ms ease,
    filter 180ms ease;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__nav__item:first-child) {
  padding-left: var(--home-page-inline-padding, 16px) !important;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__nav__item:nth-last-child(2)) {
  padding-right: var(--home-market-action-reserve-width, 52px) !important;
}

.home-market-tag-pill {
  position: relative;
  z-index: 1;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f2f4f7;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.home-market-tag-text {
  position: relative;
  z-index: 1;
  min-height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  max-width: 84px;
  color: #9ca3af;
  font-size: 12px;
  font-weight: 700;
  line-height: 16px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  transition: color 160ms ease;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__nav__item-active) .home-market-tag-pill {
  background: #111111;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__nav__item-active) .home-market-tag-text {
  color: #ffffff;
}

.home-market-tag-wrap :deep(.u-tabs__wrapper__nav__line) {
  bottom: 0;
  border-radius: 999px;
  display: none;
}

.home-market-action-overlay {
  position: absolute;
  top: -8px;
  right: 0;
  bottom: -8px;
  z-index: 3;
  width: var(--home-market-action-overlay-width, 96px);
  display: flex;
  align-items: center;
  justify-content: flex-end;
  padding-right: var(--home-page-inline-padding, 16px);
  box-sizing: border-box;
  overflow: visible;
  pointer-events: none;
}

.home-market-action-entry {
  position: relative;
  z-index: 2;
  width: 28px;
  height: 32px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: visible;
  pointer-events: auto;
  transition:
    transform 180ms ease,
    filter 180ms ease;
}

.home-market-tag-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  right: 0;
  width: var(--home-market-action-overlay-width, 96px);
  pointer-events: none;
  z-index: 1;
  opacity: 0;
  background: linear-gradient(
    270deg,
    var(--aether-page-background, #fafafa) 0%,
    var(--aether-page-background, #fafafa) 42%,
    rgba(250, 250, 250, 0) 100%
  );
  transition: opacity 180ms ease;
}

.home-market-tag-fade-right.is-visible {
  opacity: 1;
}

.home-market-action-entry.is-entry-active {
  transform: scale(0.94);
}

.home-market-action-entry.is-active .home-market-action-icon {
  color: #22d3ee;
}

.home-market-action-icon {
  position: relative;
  z-index: 1;
  color: #6b7280;
  flex-shrink: 0;
  pointer-events: none;
  transition: color 160ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .home-market-action-entry:hover {
    transform: translateY(-1px);
  }

  .home-market-action-entry:hover .home-market-action-icon {
    color: #475569;
  }

  .home-market-tag-wrap
    :deep(.u-tabs__wrapper__nav__item:not(.u-tabs__wrapper__nav__item-active)):hover
    .home-market-tag-pill {
    background: #eceff3;
  }

  .home-market-tag-wrap
    :deep(.u-tabs__wrapper__nav__item:not(.u-tabs__wrapper__nav__item-active)):hover
    .home-market-tag-text {
    color: #64748b;
  }
}
/* stylelint-enable selector-class-pattern */
</style>
