<!--
Responsibility: render the activity notice tag rail and keep the local scroll-shell markup
isolated from the parent notice results section.
Out of scope: tag selection state ownership, indicator runtime, and result query behavior.
-->
<template>
  <view
    class="home-activity-tag-wrap"
    :class="{
      'has-left-fade': isLeftFadeVisible,
      'has-indicator-ready': isIndicatorReady,
    }"
  >
    <view class="home-activity-tag-fade-left" />
    <scroll-view
      class="home-activity-tag-scroll"
      scroll-x
      :show-scrollbar="false"
      @scroll="emit('tag-scroll', $event)"
    >
      <view class="home-activity-tag-track">
        <view
          class="home-activity-tag-indicator"
          :class="{ 'is-ready': isIndicatorReady }"
          :style="indicatorStyle"
          aria-hidden="true"
        />
        <HomeInteractiveTarget
          v-for="tag in tags"
          :key="tag"
          class="home-activity-tag-entry"
          interaction-mode="compact"
          :selected="activeTag === tag"
          :class="{ 'is-active': activeTag === tag }"
          :label="'筛选 ' + tag"
          @activate="emit('tag-select', tag)"
        >
          <view class="home-activity-tag-pill">
            <text class="home-activity-tag-text">{{ tag }}</text>
          </view>
        </HomeInteractiveTarget>
      </view>
    </scroll-view>
    <view class="home-activity-tag-fade-right" />
  </view>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  tags: string[]
  activeTag: string
  isLeftFadeVisible: boolean
  isIndicatorReady: boolean
  indicatorStyle: CSSProperties
}

defineProps<Props>()

const emit = defineEmits<{
  'tag-scroll': [event: { detail?: { scrollLeft?: number } }]
  'tag-select': [tag: string]
}>()
</script>

<style lang="scss" scoped>
.home-activity-tag-wrap {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 8px 4px;
  margin: -8px -4px;
  box-sizing: border-box;
}

.home-activity-tag-scroll {
  width: 100%;
  position: relative;
  z-index: 1;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.home-activity-tag-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.home-activity-tag-track {
  position: relative;
  display: flex;
  align-items: center;
  gap: 8px;
  width: max-content;
  padding-right: 0;
  box-sizing: border-box;
}

.home-activity-tag-indicator {
  position: absolute;
  left: 0;
  bottom: 0;
  height: 2px;
  border-radius: 999px;
  background: #22d3ee;
  pointer-events: none;
  z-index: 0;
  opacity: 0;
  will-change: transform, width;
}

.home-activity-tag-indicator.is-ready {
  opacity: 1;
}

.home-activity-tag-entry {
  position: relative;
  z-index: 1;
  min-width: 0;
  max-width: 72px;
  flex: 0 0 auto;
  background: transparent;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
}

.home-activity-tag-pill {
  position: relative;
  z-index: 1;
  min-height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-activity-tag-pill::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 16px;
  height: 2px;
  border-radius: 999px;
  background: #22d3ee;
  transform: translateX(-50%) scaleX(0.5);
  opacity: 0;
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.home-activity-tag-entry.is-active {
  background: transparent;
}

.home-activity-tag-entry.is-active .home-activity-tag-pill::after {
  opacity: 1;
  transform: translateX(-50%) scaleX(1);
}

.home-activity-tag-wrap.has-indicator-ready .home-activity-tag-pill::after {
  opacity: 0;
}

.home-activity-tag-entry.is-entry-active {
  transform: scale(0.97);
}

.home-activity-tag-text {
  display: inline-block;
  min-width: 0;
  max-width: 100%;
  font-size: 14px;
  line-height: 16px;
  font-weight: 700;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-activity-tag-entry.is-entry-active .home-activity-tag-text {
  color: #64748b;
}

.home-activity-tag-entry.is-active .home-activity-tag-text {
  color: #111111;
}

.home-activity-tag-entry.is-entry-active.is-active .home-activity-tag-text {
  color: #111111;
  opacity: 0.78;
}

.home-activity-tag-fade-left,
.home-activity-tag-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 28px;
  z-index: 2;
  pointer-events: none;
  opacity: 1;
  transition: opacity 160ms ease;
}

.home-activity-tag-fade-left {
  left: 0;
  background: linear-gradient(
    90deg,
    var(--aether-panel-background, #ffffff) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
}

.home-activity-tag-fade-right {
  right: 0;
  background: linear-gradient(
    270deg,
    var(--aether-panel-background, #ffffff) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.home-activity-tag-wrap.has-left-fade .home-activity-tag-fade-left {
  opacity: 1;
}
</style>
