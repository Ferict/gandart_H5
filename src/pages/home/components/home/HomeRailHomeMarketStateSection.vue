<!--
Responsibility: render the market first-screen loading, error, and empty states and keep the
local feedback card shell isolated from the parent market results section.
Out of scope: retry behavior, remote list state ownership, and footer pagination feedback.
-->
<template>
  <view
    v-if="shouldShowLoading"
    class="home-market-empty-card is-loading"
    role="status"
    aria-live="polite"
  >
    <view class="home-market-empty-loading-ring" aria-hidden="true" />
    <text class="home-market-empty-title">正在加载藏品</text>
    <text class="home-market-empty-desc">Loading collectibles...</text>
  </view>

  <view v-else-if="shouldShowError" class="home-market-empty-card is-error">
    <AetherIcon class="home-market-empty-icon" name="box" :size="28" :stroke-width="1.2" />
    <text class="home-market-empty-title">藏品加载失败</text>
    <text class="home-market-empty-desc">Load failed. Tap to retry.</text>
    <HomeInteractiveTarget
      class="home-market-empty-retry-entry"
      interaction-mode="compact"
      label="重试加载藏品"
      @activate="emit('retry')"
    >
      <text class="home-market-empty-retry-text">重试</text>
    </HomeInteractiveTarget>
  </view>

  <view v-else-if="shouldShowEmpty" class="home-market-empty-card">
    <AetherIcon class="home-market-empty-icon" name="box" :size="28" :stroke-width="1.2" />
    <text class="home-market-empty-title">暂无对应藏品</text>
    <text class="home-market-empty-desc">No collectibles found.</text>
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
.home-market-empty-card {
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

.home-market-empty-card.is-loading {
  gap: 10px;
}

.home-market-empty-icon {
  color: #cbd5e1;
}

.home-market-empty-title {
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: #64748b;
}

.home-market-empty-desc {
  font-size: 11px;
  line-height: 14px;
  font-weight: 500;
  color: rgba(100, 116, 139, 0.72);
}

.home-market-empty-loading-ring {
  width: 20px;
  height: 20px;
  border-radius: 999px;
  border: 1.5px solid rgba(148, 163, 184, 0.24);
  border-top-color: rgba(34, 211, 238, 0.8);
  animation: home-market-empty-loading-spin 0.9s linear infinite;
}

.home-market-empty-retry-entry {
  min-height: 30px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(148, 163, 184, 0.26);
  background: rgba(255, 255, 255, 0.86);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-market-empty-retry-text {
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
  color: #0f172a;
}

@keyframes home-market-empty-loading-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
