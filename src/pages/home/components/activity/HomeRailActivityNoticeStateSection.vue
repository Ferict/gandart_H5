<!--
Responsibility: render the activity notice first-screen loading, error, and empty states and
expose the local retry entry used by the activity rail.
Out of scope: remote list fetching, retry execution ownership, and result-window switching logic.
-->
<template>
  <view
    v-if="shouldShowNoticeFirstScreenErrorState"
    class="home-activity-notice-empty-state is-error"
  >
    <AetherIcon
      class="home-activity-notice-empty-icon"
      name="octagon-alert"
      :size="40"
      :stroke-width="1.7"
    />
    <text class="home-activity-notice-empty-title">公告加载失败</text>
    <text class="home-activity-notice-empty-desc">{{
      remoteNoticeListErrorMessage || '当前网络不稳定，请重试'
    }}</text>
    <HomeInteractiveTarget
      class="home-activity-notice-retry-entry"
      label="重试加载公告"
      @activate="emit('retry')"
    >
      <view class="home-activity-notice-retry-pill">
        <AetherIcon name="refresh-cw" :size="14" :stroke-width="1.9" />
        <text class="home-activity-notice-retry-text">重试</text>
      </view>
    </HomeInteractiveTarget>
  </view>

  <view
    v-else-if="shouldShowNoticeFirstScreenLoadingState"
    class="home-activity-notice-first-screen-loading"
  >
    <HomeRailListLoadingFooter />
  </view>

  <view v-else-if="shouldShowNoticeEmptyState" class="home-activity-notice-empty-state">
    <AetherIcon
      class="home-activity-notice-empty-icon"
      name="megaphone"
      :size="40"
      :stroke-width="1.7"
    />
    <text class="home-activity-notice-empty-title">{{ noticeEmptyStateTitle }}</text>
    <text class="home-activity-notice-empty-desc">{{ noticeEmptyStateDescription }}</text>
  </view>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import HomeRailListLoadingFooter from '../shared/HomeRailListLoadingFooter.vue'

interface Props {
  shouldShowNoticeFirstScreenErrorState: boolean
  shouldShowNoticeFirstScreenLoadingState: boolean
  shouldShowNoticeEmptyState: boolean
  remoteNoticeListErrorMessage?: string | null
  noticeEmptyStateTitle: string
  noticeEmptyStateDescription: string
}

defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<style lang="scss" scoped>
.home-activity-notice-empty-state {
  min-height: 164px;
  padding: 4px 0 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  text-align: center;
}

.home-activity-notice-first-screen-loading {
  min-height: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-activity-notice-empty-state.is-error {
  gap: 10px;
}

.home-activity-notice-empty-icon {
  color: #cbd5e1;
}

.home-activity-notice-empty-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 700;
  color: #111111;
}

.home-activity-notice-empty-desc {
  max-width: 280px;
  font-size: 12px;
  line-height: 18px;
  color: #64748b;
}

.home-activity-notice-retry-entry {
  margin-top: 2px;
}

.home-activity-notice-retry-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  min-height: 32px;
  padding: 6px 12px;
  border-radius: 999px;
  border: 1px solid rgba(14, 116, 144, 0.26);
  background: rgba(236, 254, 255, 0.78);
  color: rgba(8, 145, 178, 0.9);
}

.home-activity-notice-retry-text {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.01em;
}
</style>
