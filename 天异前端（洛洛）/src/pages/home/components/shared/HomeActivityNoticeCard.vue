<!--
Responsibility: render a single activity notice card shell, including media, copy, tag,
and time metadata presentation.
Out of scope: notice query execution, result-window timing, and activity page lifecycle
orchestration.
-->
<template>
  <view class="home-activity-notice-shell">
    <view class="home-activity-notice-icon-wrap" :class="`tone-${tone}`">
      <view class="home-activity-notice-icon-frame">
        <HomeMarketCardImageReveal
          :image-url="imageUrl"
          :phase="phase"
          :placeholder-icon="placeholderIcon"
          :placeholder-icon-size="20"
          :fallback-text="''"
          :enable-persistent-local-cache="true"
          :lazy-load="lazyLoad"
          @load="handleLoad"
          @error="handleError"
          @retrying="handleRetrying"
        />
      </view>
    </view>

    <view class="home-activity-notice-copy">
      <view class="home-activity-notice-title-row">
        <view v-if="notice.isUnread" class="home-activity-notice-new-pill">
          <text class="home-activity-notice-new-text">NEW</text>
        </view>
        <text class="home-activity-notice-title">{{ notice.title }}</text>
      </view>
      <view class="home-activity-notice-meta">
        <view class="home-activity-notice-type-pill" :class="`tone-${tone}`">
          <text class="home-activity-notice-type-text">{{ typeLabel }}</text>
        </view>
        <text class="home-activity-notice-time">{{ displayTime }}</text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import HomeMarketCardImageReveal from '../../../../components/HomeMarketCardImageReveal.vue'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'

interface Props {
  notice: ActivityNotice
  tone: string
  typeLabel: string
  displayTime: string
  imageUrl: string
  phase: 'icon' | 'reveal-scan' | 'steady' | 'fallback'
  placeholderIcon: AetherIconName
  lazyLoad?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  lazyLoad: true,
})

const emit = defineEmits<{
  load: [event?: unknown]
  error: [event?: unknown]
  retrying: [event?: unknown]
}>()

const handleLoad = (event?: unknown) => {
  emit('load', event)
}

const handleError = (event?: unknown) => {
  emit('error', event)
}

const handleRetrying = (event?: unknown) => {
  emit('retrying', event)
}

void props
</script>

<style lang="scss" scoped>
.home-activity-notice-icon-wrap {
  position: relative;
  width: 52px;
  height: 52px;
  border-radius: var(--aether-surface-radius-sm, 12px);
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  overflow: hidden;
  color: #06b6d4;
}

.home-activity-notice-icon-frame {
  position: absolute;
  inset: 0;
  --home-market-card-image-radius: var(--aether-surface-radius-sm, 12px);
  --home-market-card-material-base-bg: transparent;
  --home-market-card-material-fallback-bg: transparent;
  --home-market-card-placeholder-icon-color: currentcolor;
}

.home-activity-notice-icon-wrap.tone-cyan {
  background: rgba(34, 211, 238, 0.12);
  color: #06b6d4;
}

.home-activity-notice-icon-wrap.tone-emerald {
  background: rgba(16, 185, 129, 0.12);
  color: #059669;
}

.home-activity-notice-icon-wrap.tone-violet {
  background: rgba(139, 92, 246, 0.12);
  color: #8b5cf6;
}

.home-activity-notice-icon-wrap.tone-indigo {
  background: rgba(99, 102, 241, 0.12);
  color: #4f46e5;
}

.home-activity-notice-icon-wrap.tone-amber {
  background: rgba(245, 158, 11, 0.12);
  color: #d97706;
}

.home-activity-notice-icon-wrap.tone-rose {
  background: rgba(244, 63, 94, 0.12);
  color: #e11d48;
}

.home-activity-notice-icon-wrap.tone-slate {
  background: rgba(148, 163, 184, 0.14);
  color: #64748b;
}

.home-activity-notice-copy {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-activity-notice-title-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
}

.home-activity-notice-new-pill {
  min-height: var(--aether-badge-height, 16px);
  border-radius: 999px;
  padding: 0 var(--aether-badge-inline-padding, 8px);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(239, 68, 68, 0.12);
  flex-shrink: 0;
}

.home-activity-notice-new-text {
  display: inline-block;
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.06em;
  color: #ef4444;
  font-family: var(--aether-font-system, system-ui, sans-serif);
  transform: scale(0.8333);
  transform-origin: center center;
}

.home-activity-notice-title {
  min-width: 0;
  flex: 1 1 auto;
  font-size: 13px;
  line-height: 20px;
  font-weight: 700;
  color: #111111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-activity-notice-meta {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: nowrap;
  width: 100%;
}

.home-activity-notice-type-pill {
  min-height: 20px;
  border-radius: 4px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-activity-notice-type-pill.tone-cyan {
  background: rgba(34, 211, 238, 0.08);
}

.home-activity-notice-type-pill.tone-emerald {
  background: rgba(16, 185, 129, 0.08);
}

.home-activity-notice-type-pill.tone-violet {
  background: rgba(139, 92, 246, 0.08);
}

.home-activity-notice-type-pill.tone-indigo {
  background: rgba(99, 102, 241, 0.08);
}

.home-activity-notice-type-pill.tone-amber {
  background: rgba(245, 158, 11, 0.08);
}

.home-activity-notice-type-pill.tone-rose {
  background: rgba(244, 63, 94, 0.08);
}

.home-activity-notice-type-pill.tone-slate {
  background: rgba(148, 163, 184, 0.08);
}

.home-activity-notice-type-text,
.home-activity-notice-time {
  font-size: 12px;
  line-height: 12px;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-activity-notice-type-text {
  color: #64748b;
}

.home-activity-notice-type-pill.tone-cyan .home-activity-notice-type-text {
  color: #0891b2;
}

.home-activity-notice-type-pill.tone-emerald .home-activity-notice-type-text {
  color: #059669;
}

.home-activity-notice-type-pill.tone-violet .home-activity-notice-type-text {
  color: #7c3aed;
}

.home-activity-notice-type-pill.tone-indigo .home-activity-notice-type-text {
  color: #4f46e5;
}

.home-activity-notice-type-pill.tone-amber .home-activity-notice-type-text {
  color: #b45309;
}

.home-activity-notice-type-pill.tone-rose .home-activity-notice-type-text {
  color: #e11d48;
}

.home-activity-notice-type-pill.tone-slate .home-activity-notice-type-text {
  color: #64748b;
}

.home-activity-notice-time {
  flex-shrink: 0;
  white-space: nowrap;
  color: #9ca3af;
}
</style>
