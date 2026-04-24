<!--
Responsibility: render the profile first-screen loading, error, and empty states and keep
the local feedback card shell isolated from the parent profile results section.
Out of scope: retry behavior, result window switching, and remote list state ownership.
-->
<template>
  <view
    v-if="shouldShowLoading"
    class="home-profile-empty-card is-loading"
    role="status"
    aria-live="polite"
  >
    <view class="home-profile-empty-loading-ring" aria-hidden="true" />
    <text class="home-profile-empty-title">正在加载资产</text>
    <text class="home-profile-empty-desc">Loading assets...</text>
  </view>

  <view v-else-if="shouldShowError" class="home-profile-empty-card is-error">
    <AetherIcon class="home-profile-empty-icon" name="box" :size="28" :stroke-width="1.2" />
    <text class="home-profile-empty-title">资产加载失败</text>
    <text class="home-profile-empty-desc">Load failed. Tap to retry.</text>
    <HomeInteractiveTarget
      class="home-profile-empty-retry-entry"
      interaction-mode="compact"
      label="重试加载资产"
      @activate="emit('retry')"
    >
      <text class="home-profile-empty-retry-text">重试</text>
    </HomeInteractiveTarget>
  </view>

  <view v-else-if="shouldShowEmpty" class="home-profile-empty-card">
    <AetherIcon class="home-profile-empty-icon" name="box" :size="28" :stroke-width="1.2" />
    <text class="home-profile-empty-title">暂无对应资产</text>
  </view>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  shouldShowLoading: boolean
  shouldShowError: boolean
  shouldShowEmpty: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()
</script>

<style lang="scss" scoped>
.home-profile-empty-card {
  margin-top: 4px;
  min-height: 136px;
  border-radius: var(--aether-surface-radius-md, 16px);
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #cbd5e1;
}

.home-profile-empty-card.is-loading {
  gap: 10px;
}

.home-profile-empty-icon {
  color: #cbd5e1;
}

.home-profile-empty-title {
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: #9ca3af;
}

.home-profile-empty-desc {
  font-size: 11px;
  line-height: 14px;
  font-weight: 500;
  color: rgba(100, 116, 139, 0.72);
}

.home-profile-empty-loading-ring {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1.5px solid rgba(148, 163, 184, 0.24);
  border-top-color: rgba(34, 211, 238, 0.8);
  animation: home-profile-empty-loading-spin 0.9s linear infinite;
}

.home-profile-empty-retry-entry {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(255, 255, 255, 0.86);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-profile-empty-retry-text {
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
  color: #0f172a;
}

@keyframes home-profile-empty-loading-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
