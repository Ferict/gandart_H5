<!--
Responsibility: render the profile primary category rail and keep the local category
switch shell isolated from the parent profile panel.
Out of scope: category ownership, indicator runtime math, and profile query execution.
-->
<template>
  <view class="home-profile-section-tag-wrap">
    <view class="home-profile-section-tag-bar">
      <view class="home-profile-section-tag-track" :style="trackStyle">
        <view
          class="home-profile-section-tag-indicator"
          :style="indicatorStyle"
          aria-hidden="true"
        />
        <HomeInteractiveTarget
          v-for="category in categories"
          :key="category.id"
          class="home-profile-section-tag-entry"
          interaction-mode="block"
          :selected="activeCategory === category.id"
          :label="`切换到 ${category.label}`"
          @activate="emit('category-select', category.id)"
        >
          <view class="home-profile-section-tag-entry-shell">
            <text class="home-profile-section-tag-text">{{ category.label }}</text>
          </view>
        </HomeInteractiveTarget>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type {
  ProfileCategory,
  ProfileCategoryKey,
} from '../../../../models/home-rail/homeRailProfile.model'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  categories: ProfileCategory[]
  activeCategory: ProfileCategoryKey
  trackStyle: CSSProperties
  indicatorStyle: CSSProperties
}

defineProps<Props>()

const emit = defineEmits<{
  'category-select': [categoryId: ProfileCategoryKey]
}>()
</script>

<style lang="scss" scoped>
.home-profile-section-tag-wrap {
  position: relative;
  width: 100%;
  min-width: 0;
  overflow: visible;
  padding: 0;
  margin: 0;
  box-sizing: border-box;
  display: flex;
  justify-content: stretch;
}

.home-profile-section-tag-bar {
  position: relative;
  display: flex;
  width: 100%;
  min-width: 0;
  min-height: 48px;
  padding: 4px;
  border-radius: 8px;
  background: #eef2f6;
  overflow: hidden;
  box-sizing: border-box;
  box-shadow: none;
}

.home-profile-section-tag-track {
  position: relative;
  flex: 1 1 auto;
  width: 100%;
  min-height: 40px;
  display: grid;
  grid-template-columns: repeat(var(--profile-category-count, 3), minmax(0, 1fr));
  align-items: stretch;
  gap: 0;
  box-sizing: border-box;
}

.home-profile-section-tag-indicator {
  position: absolute;
  inset: 0 auto 0 0;
  border-radius: 8px;
  background: #ffffff;
  box-shadow: none;
  pointer-events: none;
  transition: transform 220ms ease;
  z-index: 0;
}

.home-profile-section-tag-entry {
  position: relative;
  z-index: 1;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  display: flex;
}

.home-profile-section-tag-entry :deep(.home-interactive-target-visual) {
  width: 100%;
  min-width: 0;
  min-height: 40px;
  display: flex;
  align-items: center;
  justify-content: stretch;
  padding: 0;
  box-sizing: border-box;
  transform-origin: center center;
  transition: transform 180ms ease;
}

.home-profile-section-tag-entry-shell {
  position: relative;
  width: 100%;
  min-width: 0;
  min-height: 40px;
  padding: 0 10px;
  border-radius: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.home-profile-section-tag-entry.is-entry-active :deep(.home-interactive-target-visual) {
  transform: scale(0.985);
}

.home-profile-section-tag-text {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  font-size: 14px;
  line-height: 16px;
  font-weight: 700;
  color: #64748b;
  text-align: center;
  white-space: nowrap;
  transition: color 180ms ease;
}

.home-profile-section-tag-entry.is-entry-active .home-profile-section-tag-text {
  color: #334155;
}

.home-profile-section-tag-entry.is-selected .home-profile-section-tag-text {
  color: #111111;
}

.home-profile-section-tag-entry.is-selected .home-profile-section-tag-entry-shell {
  background: transparent;
  box-shadow: none;
}

.home-profile-section-tag-entry.is-selected .home-profile-section-tag-entry-shell::before {
  content: '';
  position: absolute;
  left: 8px;
  top: 11px;
  height: 18px;
  width: var(--aether-entry-accent-line-width, 2px);
  border-radius: 999px;
  background: var(--aether-entry-accent-line-color, #22d3ee);
  pointer-events: none;
}

.home-profile-section-tag-entry.is-selected.is-entry-active .home-profile-section-tag-text {
  color: #111111;
  opacity: 0.78;
}

.home-profile-section-tag-entry.is-selected.is-entry-active .home-profile-section-tag-entry-shell {
  transform: translateY(1px);
  box-shadow: none;
}
</style>
