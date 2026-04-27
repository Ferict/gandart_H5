<!--
Responsibility: render the activity notice head section template, including title copy and search
trigger for the activity rail.
Out of scope: notice query execution and search visibility policy.
-->
<template>
  <view class="home-activity-section-head">
    <view class="home-activity-section-title-group">
      <text class="home-activity-section-title">{{ title }}</text>
      <text class="home-activity-section-subtitle">{{ subtitle }}</text>
    </view>

    <view class="home-activity-section-actions">
      <HomeInteractiveTarget
        class="home-activity-section-action-entry"
        interaction-mode="compact"
        :class="{ 'is-active': isNoticeSearchVisible || hasActiveNoticeSearch }"
        :label="isNoticeSearchVisible ? '收起公告搜索' : '打开公告搜索'"
        @activate="emit('notice-search-toggle')"
      >
        <view class="home-activity-section-action-visual">
          <AetherIcon
            class="home-activity-section-action-icon"
            name="search"
            :size="16"
            :stroke-width="2"
          />
        </view>
      </HomeInteractiveTarget>
    </view>
  </view>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  title: string
  subtitle: string
  isNoticeSearchVisible: boolean
  hasActiveNoticeSearch: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'notice-search-toggle': []
}>()
</script>

<style lang="scss" scoped>
.home-activity-section-head {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}

.home-activity-section-title-group {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-left: 4px;
}

.home-activity-section-title {
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  color: #111111;
}

.home-activity-section-subtitle {
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

.home-activity-section-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: visible;
}

.home-activity-section-action-entry {
  position: relative;
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: visible;
  transition:
    transform 180ms ease,
    color 160ms ease;
}

.home-activity-section-action-visual {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.home-activity-section-action-entry.is-entry-active {
  transform: scale(0.94);
}

.home-activity-section-action-entry.is-active .home-activity-section-action-icon {
  color: #22d3ee;
}

.home-activity-section-action-icon {
  position: relative;
  z-index: 1;
  color: #6b7280;
  flex-shrink: 0;
  pointer-events: none;
  transition: color 160ms ease;
}

.home-activity-section-action-entry.is-entry-active .home-activity-section-action-icon {
  color: #475569;
}

@media (hover: hover) and (pointer: fine) {
  .home-activity-section-action-entry:hover {
    transform: translateY(-1px);
  }

  .home-activity-section-action-entry:hover .home-activity-section-action-icon {
    color: #475569;
  }
}
</style>
