<!--
Responsibility: render the profile sub-category filter rail and keep the local scroll-shell
markup isolated from the parent profile panel.
Out of scope: sub-category ownership, fade runtime, and profile query execution.
-->
<template>
  <view
    v-if="subCategories.length"
    class="home-profile-market-tag-wrap"
    :class="{ 'has-left-fade': isLeftFadeVisible }"
  >
    <view class="home-profile-market-tag-fade-left" />
    <scroll-view
      class="home-profile-market-tag-scroll"
      scroll-x
      :show-scrollbar="false"
      @scroll="emit('sub-category-scroll', $event)"
    >
      <view class="home-profile-market-tag-track">
        <HomeInteractiveTarget
          v-for="subCategory in subCategories"
          :key="subCategory"
          class="home-profile-market-tag-entry"
          interaction-mode="block"
          :selected="activeSubCategory === subCategory"
          :label="`筛选 ${subCategory}`"
          :class="{ 'is-active': activeSubCategory === subCategory }"
          @activate="emit('sub-category-select', subCategory)"
        >
          <view class="home-profile-market-tag-pill">
            <text class="home-profile-market-tag-text">{{ subCategory }}</text>
          </view>
        </HomeInteractiveTarget>
      </view>
    </scroll-view>
    <view class="home-profile-market-tag-fade-right" />
  </view>
</template>

<script setup lang="ts">
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  subCategories: string[]
  activeSubCategory: string
  isLeftFadeVisible: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'sub-category-scroll': [event: { detail?: { scrollLeft?: number } }]
  'sub-category-select': [subCategory: string]
}>()
</script>

<style lang="scss" scoped>
.home-profile-market-tag-wrap {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: hidden;
  padding: 8px 4px;
  margin: -8px -4px;
  box-sizing: border-box;
}

.home-profile-market-tag-scroll {
  width: 100%;
  position: relative;
  z-index: 1;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.home-profile-market-tag-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.home-profile-market-tag-track {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  min-width: auto;
  padding: 0;
  box-sizing: border-box;
}

.home-profile-market-tag-entry {
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

.home-profile-market-tag-entry :deep(.home-interactive-target-visual) {
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 8px 0;
  box-sizing: border-box;
}

.home-profile-market-tag-pill {
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

.home-profile-market-tag-pill::before {
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

.home-profile-market-tag-text {
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

.home-profile-market-tag-entry.is-active .home-profile-market-tag-text {
  color: #ffffff;
}

.home-profile-market-tag-entry.is-active .home-profile-market-tag-pill {
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: none;
}

.home-profile-market-tag-entry.is-active .home-profile-market-tag-pill::before {
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .home-profile-market-tag-entry:not(.is-active):hover .home-profile-market-tag-text {
    color: #64748b;
  }

  .home-profile-market-tag-entry:not(.is-active):hover .home-profile-market-tag-pill {
    background: #eceff3;
  }
}

.home-profile-market-tag-fade-left,
.home-profile-market-tag-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 28px;
  z-index: 2;
  pointer-events: none;
  opacity: 1;
  transition: opacity 160ms ease;
}

.home-profile-market-tag-fade-left {
  left: 0;
  opacity: 0;
  background: linear-gradient(
    90deg,
    var(--aether-panel-background, #ffffff) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.home-profile-market-tag-fade-right {
  right: 0;
  background: linear-gradient(
    270deg,
    var(--aether-panel-background, #ffffff) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.home-profile-market-tag-wrap.has-left-fade .home-profile-market-tag-fade-left {
  opacity: 1;
}
</style>
