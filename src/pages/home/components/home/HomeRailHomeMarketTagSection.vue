<!--
Responsibility: render the market tag filter rail and keep the local scroll-shell markup
isolated from the parent market panel.
Out of scope: active tag ownership, scroll-fade runtime, and market query execution.
-->
<template>
  <view class="home-market-tag-wrap" :class="{ 'has-left-fade': isMarketTagLeftFadeVisible }">
    <view class="home-market-tag-fade-left" />
    <scroll-view
      class="home-market-tag-scroll"
      scroll-x
      :show-scrollbar="false"
      @scroll="emit('tag-scroll', $event)"
    >
      <view class="home-market-tag-track">
        <HomeInteractiveTarget
          v-for="tag in marketTags"
          :key="tag.id"
          class="home-market-tag-entry"
          :class="{ 'is-active': activeMarketTagId === tag.id }"
          :selected="activeMarketTagId === tag.id"
          :label="'切换到 ' + tag.label"
          @activate="emit('tag-select', tag)"
        >
          <view class="home-market-tag-pill">
            <text class="home-market-tag-text">{{ tag.label }}</text>
          </view>
        </HomeInteractiveTarget>
      </view>
    </scroll-view>
    <view class="home-market-tag-fade-right" />
  </view>
</template>

<script setup lang="ts">
import type { HomeMarketTag } from '../../../../models/home-rail/homeRailHome.model'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  marketTags: HomeMarketTag[]
  activeMarketTagId: string
  isMarketTagLeftFadeVisible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'tag-scroll': [event: { detail?: { scrollLeft?: number } }]
  'tag-select': [tag: HomeMarketTag]
}>()
</script>

<style lang="scss" scoped>
.home-market-tag-scroll {
  width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.home-market-tag-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 8px 4px;
  margin: -8px -4px;
  box-sizing: border-box;
}

.home-market-tag-scroll {
  position: relative;
  z-index: 1;
}

.home-market-tag-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.home-market-tag-track {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  min-width: auto;
  padding: 0;
  box-sizing: border-box;
}

.home-market-tag-entry {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  min-width: 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  transition:
    transform 180ms ease,
    filter 180ms ease;
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

.home-market-tag-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #111111;
  opacity: 0;
  transition: opacity 180ms ease;
  pointer-events: none;
  z-index: 0;
}

.home-market-tag-text {
  position: relative;
  z-index: 1;
  min-height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  max-width: calc(4 * 12px);
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 160ms ease;
}

.home-market-tag-fade-left,
.home-market-tag-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 28px;
  z-index: 2;
  pointer-events: none;
  opacity: 1;
  transition: opacity 160ms ease;
}

.home-market-tag-fade-left {
  left: 0;
  background: linear-gradient(
    90deg,
    var(--aether-panel-background, #ffffff) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
}

.home-market-tag-fade-right {
  right: 0;
  background: linear-gradient(
    270deg,
    var(--aether-panel-background, #ffffff) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.home-market-tag-wrap.has-left-fade .home-market-tag-fade-left {
  opacity: 1;
}

.home-market-tag-entry.is-active .home-market-tag-text {
  color: #ffffff;
}

.home-market-tag-entry.is-active .home-market-tag-pill {
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: none;
}

.home-market-tag-entry.is-active .home-market-tag-pill::before {
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .home-market-tag-entry:hover .home-market-tag-text {
    color: #64748b;
  }

  .home-market-tag-entry:not(.is-active):hover .home-market-tag-pill {
    background: #eceff3;
  }
}
</style>
