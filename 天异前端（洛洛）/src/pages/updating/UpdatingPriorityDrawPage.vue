<!--
Responsibility: render the retained priority-draw module page that replaces the generic
construction placeholder for the current activity entry target.
Out of scope: real activity-domain fetching, draw action execution, and formal contract wiring.
-->
<template>
  <page-meta :page-style="pageMetaStyle" />
  <SecondaryPageFrame route-source="updating-priority-draw" title="优先抽签" @back="emit('back')">
    <template #topbar-right>
      <HomeInteractiveTarget
        class="priority-draw-topbar-history"
        interaction-mode="compact"
        label="查看抽签记录"
        @activate="handleHistoryTap"
      >
        <view class="priority-draw-topbar-history-visual">
          <AetherIcon name="history" :size="20" :stroke-width="2" />
        </view>
      </HomeInteractiveTarget>
    </template>

    <view class="priority-draw-page-content">
      <view v-if="priorityDrawEventList.length" class="priority-draw-event-list">
        <HomeInteractiveTarget
          v-for="event in priorityDrawEventList"
          :key="event.id"
          class="priority-draw-card-entry"
          :label="resolveEventActionLabel(event)"
          @activate="handleEventTap(event)"
        >
          <view class="priority-draw-card-shell" :class="resolveCardClass(event)">
            <view
              class="priority-draw-card-cover"
              :class="[
                resolveCoverClass(event),
                { 'has-cover-image': Boolean(event.coverImageUrl) },
              ]"
            >
              <image
                v-if="event.coverImageUrl"
                class="priority-draw-card-cover-image"
                :src="event.coverImageUrl"
                mode="aspectFill"
              />
              <view class="priority-draw-card-cover-glow" />
              <view class="priority-draw-card-cover-grid" />

              <view class="priority-draw-card-status-badge" :class="resolveStatusClass(event)">
                <view class="priority-draw-card-status-dot" />
                <text class="priority-draw-card-status-copy">
                  {{ resolveStatusVisualLabel(event) }}
                </text>
              </view>
            </view>

            <view class="priority-draw-card-body">
              <view class="priority-draw-card-heading">
                <text class="priority-draw-card-title">{{ event.title }}</text>
              </view>

              <view class="priority-draw-card-meta">
                <view class="priority-draw-card-time">
                  <text class="priority-draw-card-time-label">TIME</text>
                  <text class="priority-draw-card-time-copy">{{ event.timeRange }}</text>
                </view>
                <text class="priority-draw-card-joined-copy">
                  {{ event.participants }} 人报名
                </text>
              </view>

              <view class="priority-draw-card-footer">
                <view class="priority-draw-card-info">
                  <text class="priority-draw-card-info-label">发放数量</text>
                  <view class="priority-draw-card-info-row">
                    <AetherIcon name="award" :size="12" :stroke-width="2" tone="accent" />
                    <text class="priority-draw-card-info-copy">{{ event.quota }} 份</text>
                  </view>
                </view>

                <view class="priority-draw-card-action-pill">
                  <text class="priority-draw-card-action-copy">
                    {{ resolveActionVisualLabel(event) }}
                  </text>
                  <AetherIcon name="chevron-right" :size="12" :stroke-width="2.4" />
                </view>
              </view>
            </view>
          </view>
        </HomeInteractiveTarget>
      </view>

      <view v-else class="priority-draw-empty-state">
        <AetherIcon name="sliders-horizontal" :size="32" :stroke-width="1.5" tone="subtle" />
        <text class="priority-draw-empty-copy">当前暂无可参与的抽签活动</text>
      </view>

      <view v-if="priorityDrawEventList.length" class="priority-draw-archive-footer">
        <view class="priority-draw-archive-line" />
        <text class="priority-draw-archive-copy">没有更多活动了</text>
        <view class="priority-draw-archive-line" />
      </view>
    </view>
  </SecondaryPageFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import SecondaryPageFrame from '../../components/SecondaryPageFrame.vue'
import { useResponsiveRailLayout } from '../../composables/useResponsiveRailLayout'
import {
  priorityDrawEventList,
  type PriorityDrawCoverTone,
  type PriorityDrawEventViewModel,
} from './updatingPriorityDrawContent'

const emit = defineEmits<{
  back: []
}>()

const { runtimeContext } = useResponsiveRailLayout()

const pageMetaStyle = computed(() => {
  const viewportHeight = runtimeContext.value.viewportHeight
  const height = viewportHeight > 0 ? `${viewportHeight}px` : '100vh'
  return `height:${height};min-height:${height};overflow:hidden;background:#ffffff;`
})

const handleHistoryTap = () => {
  uni.showToast({
    title: '抽签记录暂未开放',
    icon: 'none',
  })
}

const handleEventTap = (event: PriorityDrawEventViewModel) => {
  if (event.status === 'UPCOMING') {
    uni.showToast({
      title: '活动暂未开始',
      icon: 'none',
    })
    return
  }

  uni.showToast({
    title: event.status === 'ENDED' ? '结果详情暂未开放' : '当前暂不支持参与',
    icon: 'none',
  })
}

const resolveCardClass = (event: PriorityDrawEventViewModel) => {
  return {
    'is-ended': event.status === 'ENDED',
  }
}

const resolveStatusClass = (event: PriorityDrawEventViewModel) => {
  return {
    'is-live': event.status === 'LIVE',
    'is-upcoming': event.status === 'UPCOMING',
    'is-ended': event.status === 'ENDED',
  }
}

const resolveStatusVisualLabel = (event: PriorityDrawEventViewModel) => {
  if (event.status === 'LIVE') {
    return '报名中'
  }

  if (event.status === 'UPCOMING') {
    return '未开始'
  }

  return '已结束'
}

const resolveCoverClass = (event: PriorityDrawEventViewModel) => {
  const toneMap: Record<PriorityDrawCoverTone, string> = {
    cyan: 'tone-cyan',
    amber: 'tone-amber',
    violet: 'tone-violet',
    slate: 'tone-slate',
  }

  return toneMap[event.coverTone]
}

const resolveActionVisualLabel = (event: PriorityDrawEventViewModel) => {
  if (event.status === 'UPCOMING') {
    return '预约提醒'
  }

  return event.status === 'ENDED' ? '查看结果' : '立即参与'
}

const resolveEventActionLabel = (event: PriorityDrawEventViewModel) => {
  return `${resolveActionVisualLabel(event)} ${event.title}`
}
</script>

<style lang="scss" scoped>
.priority-draw-topbar-history {
  width: 24px;
  min-width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #475569;
}

.priority-draw-topbar-history-visual {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

:deep(.secondary-page-frame) {
  background: #ffffff;
}

.priority-draw-page-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.priority-draw-event-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.priority-draw-card-entry {
  display: block;
}

.priority-draw-card-shell {
  border-radius: var(--aether-surface-radius-lg, 20px);
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  overflow: hidden;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.priority-draw-card-entry.is-entry-active .priority-draw-card-shell {
  transform: scale(0.988);
  box-shadow: var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08));
}

.priority-draw-card-shell.is-ended {
  opacity: 0.92;
}

.priority-draw-card-cover {
  position: relative;
  box-sizing: border-box;
  overflow: hidden;
  width: 100%;
  border-radius: 18px;
}

.priority-draw-card-cover::before {
  content: '';
  display: block;
  width: 100%;
  padding-top: 56.25%;
}

.priority-draw-card-cover.tone-cyan {
  background:
    radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.22), transparent 22%),
    linear-gradient(135deg, #0f172a 0%, #0f3b52 42%, #164e63 100%);
}

.priority-draw-card-cover.tone-amber {
  background:
    radial-gradient(circle at 84% 18%, rgba(255, 255, 255, 0.22), transparent 22%),
    linear-gradient(135deg, #111827 0%, #78350f 48%, #92400e 100%);
}

.priority-draw-card-cover.tone-violet {
  background:
    radial-gradient(circle at 84% 18%, rgba(255, 255, 255, 0.2), transparent 22%),
    linear-gradient(135deg, #111827 0%, #312e81 50%, #4338ca 100%);
}

.priority-draw-card-cover.tone-slate {
  background:
    radial-gradient(circle at 84% 18%, rgba(255, 255, 255, 0.14), transparent 22%),
    linear-gradient(135deg, #111827 0%, #334155 52%, #475569 100%);
}

.priority-draw-card-cover.has-cover-image {
  background: #f8fafc;
}

.priority-draw-card-cover-image {
  position: absolute;
  inset: 0;
  display: block;
  width: 100%;
  height: 100%;
}

.priority-draw-card-cover-grid,
.priority-draw-card-cover-glow {
  position: absolute;
  inset: 0;
  pointer-events: none;
}

.priority-draw-card-cover-grid {
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.06) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.06) 1px, transparent 1px);
  background-size: 24px 24px;
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.4), transparent 100%);
}

.priority-draw-card-cover-glow {
  background:
    radial-gradient(circle at 18% 82%, rgba(34, 211, 238, 0.22), transparent 28%),
    radial-gradient(circle at 82% 18%, rgba(255, 255, 255, 0.18), transparent 24%);
}

.priority-draw-card-cover.has-cover-image .priority-draw-card-cover-grid {
  background-image: none;
}

.priority-draw-card-cover.has-cover-image .priority-draw-card-cover-glow {
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.18), transparent 42%),
    linear-gradient(0deg, rgba(15, 23, 42, 0.14), transparent 42%);
}

.priority-draw-card-status-badge {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 24px;
  padding: 0 9px;
  border-radius: 999px;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}

.priority-draw-card-status-badge {
  position: absolute;
  left: 14px;
  top: 14px;
  background: rgba(17, 17, 17, 0.58);
}

.priority-draw-card-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22d3ee;
}

.priority-draw-card-status-badge.is-upcoming .priority-draw-card-status-dot {
  background: #fbbf24;
}

.priority-draw-card-status-badge.is-ended .priority-draw-card-status-dot {
  background: #94a3b8;
}

.priority-draw-card-status-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffffff;
  transform: scale(0.84);
  transform-origin: left center;
}

.priority-draw-card-status-badge.is-ended .priority-draw-card-status-copy {
  color: rgba(226, 232, 240, 0.82);
}

.priority-draw-card-body {
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 16px;
  box-sizing: border-box;
}

.priority-draw-card-heading {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.priority-draw-card-title {
  font-size: 16px;
  line-height: 22px;
  font-weight: 900;
  letter-spacing: -0.02em;
  color: #111111;
}

.priority-draw-card-shell.is-ended .priority-draw-card-title {
  color: #64748b;
}

.priority-draw-card-meta {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.priority-draw-card-time {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.priority-draw-card-time-label {
  flex: 0 0 auto;
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
  color: #22d3ee;
  letter-spacing: 0.04em;
}

.priority-draw-card-shell.is-ended .priority-draw-card-time-label {
  color: #94a3b8;
}

.priority-draw-card-time-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
  color: #64748b;
}

.priority-draw-card-shell.is-ended .priority-draw-card-time-copy {
  color: #94a3b8;
}

.priority-draw-card-joined-copy {
  flex: 0 0 auto;
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
  color: #94a3b8;
  transform: scale(0.9);
  transform-origin: right center;
}

.priority-draw-card-footer {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
  padding-top: 14px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.priority-draw-card-info {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.priority-draw-card-info-label {
  font-size: 12px;
  line-height: 10px;
  font-weight: 700;
  color: #94a3b8;
  letter-spacing: 0.08em;
  transform: scale(0.84);
  transform-origin: left center;
}

.priority-draw-card-info-row {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.priority-draw-card-info-copy {
  min-width: 0;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
  color: #111111;
}

.priority-draw-card-shell.is-ended .priority-draw-card-info-copy {
  color: #64748b;
}

.priority-draw-card-action-pill {
  flex: 0 0 auto;
  min-height: 40px;
  padding: 0 14px;
  box-sizing: border-box;
  border-radius: 14px;
  background: #111111;
  color: #ffffff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.priority-draw-card-action-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.06em;
  color: #ffffff;
  transform: scale(0.9);
  transform-origin: left center;
}

.priority-draw-empty-state {
  min-height: calc(100dvh - 220px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0.48;
}

.priority-draw-empty-copy {
  font-size: 12px;
  line-height: 14px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #64748b;
  transform: scale(0.92);
}

.priority-draw-archive-footer {
  margin-top: 28px;
  padding-bottom: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0.36;
}

.priority-draw-archive-line {
  width: 32px;
  height: 1px;
  background: #94a3b8;
}

.priority-draw-archive-copy {
  font-size: 12px;
  line-height: 10px;
  font-weight: 700;
  letter-spacing: 0.08em;
  color: #64748b;
  transform: scale(0.84);
}
</style>
