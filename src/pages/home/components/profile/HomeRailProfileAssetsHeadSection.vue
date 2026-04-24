<!--
Responsibility: render the profile assets head section and keep the title and search trigger
markup isolated from the parent profile panel.
Out of scope: search visibility ownership, profile query state, and result window behavior.
-->
<template>
  <view class="home-profile-assets-head">
    <view class="home-profile-assets-title-group">
      <text class="home-profile-assets-title">{{ title }}</text>
      <text class="home-profile-assets-subtitle">{{ subtitle }}</text>
    </view>

    <HomeInteractiveTarget
      class="home-profile-search-entry"
      :class="{ 'is-active': isProfileSearchVisible || hasActiveProfileSearch }"
      interaction-mode="compact"
      :label="isProfileSearchVisible ? '收起资产搜索' : '打开资产搜索'"
      @activate="emit('search-click')"
    >
      <AetherIcon name="search" :size="16" :stroke-width="2" />
    </HomeInteractiveTarget>
  </view>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  title: string
  subtitle: string
  isProfileSearchVisible: boolean
  hasActiveProfileSearch: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'search-click': []
}>()
</script>

<style lang="scss" scoped>
.home-profile-assets-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 0;
}

.home-profile-assets-title-group {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-left: 4px;
}

.home-profile-assets-title {
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  color: #111111;
}

.home-profile-assets-subtitle {
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

.home-profile-search-entry {
  position: relative;
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex: 0 0 auto;
  transition:
    transform 180ms ease,
    color 160ms ease;
}

.home-profile-search-entry.is-entry-active {
  transform: scale(0.94);
}

.home-profile-search-entry.is-active {
  color: #22d3ee;
}
</style>
