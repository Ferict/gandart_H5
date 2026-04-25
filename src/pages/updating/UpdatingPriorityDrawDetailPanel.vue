<!--
Responsibility: render the page-local priority-draw detail panel from a stable view model.
Out of scope: formal backend transport, provider wiring, and draw-result mutation.
-->
<template>
  <view class="priority-draw-detail">
    <view class="priority-draw-detail-summary-card">
      <view class="priority-draw-detail-summary-cover">
        <image
          class="priority-draw-detail-summary-cover-image"
          :src="event.coverImageUrl"
          mode="aspectFill"
        />
        <view class="priority-draw-detail-summary-cover-shade" />
        <view class="priority-draw-detail-status" :class="statusClass">
          <view class="priority-draw-detail-status-dot" />
          <text class="priority-draw-detail-status-copy">{{ statusLabel }}</text>
        </view>
      </view>

      <view class="priority-draw-detail-summary-body">
        <text class="priority-draw-detail-title">{{ event.title }}</text>

        <view class="priority-draw-detail-stat-row">
          <view class="priority-draw-detail-stat">
            <view class="priority-draw-detail-stat-label-row">
              <text class="priority-draw-detail-stat-label">TIME</text>
            </view>
            <text class="priority-draw-detail-stat-value">{{ timeStateValue }}</text>
          </view>
          <view class="priority-draw-detail-stat-divider" />
          <view class="priority-draw-detail-stat align-right">
            <view class="priority-draw-detail-stat-label-row">
              <text class="priority-draw-detail-stat-label">热度</text>
            </view>
            <text class="priority-draw-detail-stat-value">{{ heatValue }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="priority-draw-detail-block">
      <view class="priority-draw-detail-section-head">
        <AetherIcon name="gift" :size="16" :stroke-width="2" tone="accent" />
        <text class="priority-draw-detail-section-title">活动奖品池</text>
      </view>

      <view class="priority-draw-prize-stack">
        <view v-for="pool in event.prizePools" :key="pool.id" class="priority-draw-prize-card">
          <view class="priority-draw-prize-card-head">
            <text class="priority-draw-prize-tier">{{ pool.tierName }}</text>
            <text class="priority-draw-prize-quota">限量 {{ pool.quotaLabel }}</text>
          </view>

          <view class="priority-draw-prize-items" :class="{ 'is-single': pool.items.length === 1 }">
            <template v-for="(item, itemIndex) in pool.items" :key="item.id">
              <view class="priority-draw-prize-item">
                <image
                  class="priority-draw-prize-item-image"
                  :src="item.coverImageUrl"
                  mode="aspectFill"
                />
                <view class="priority-draw-prize-item-shade" />
                <view class="priority-draw-prize-item-copy">
                  <text class="priority-draw-prize-item-type">{{ item.type }}</text>
                  <text class="priority-draw-prize-item-name">{{ item.name }}</text>
                </view>
                <text class="priority-draw-prize-item-count">x{{ item.quantity }}</text>
              </view>
              <view v-if="itemIndex < pool.items.length - 1" class="priority-draw-prize-plus">
                <text class="priority-draw-prize-plus-copy">+</text>
              </view>
            </template>
          </view>
        </view>
      </view>
    </view>

    <view class="priority-draw-detail-block">
      <view class="priority-draw-detail-section-head">
        <AetherIcon
          :name="event.isEligible ? 'shield-check' : 'shield-alert'"
          :size="16"
          :stroke-width="2"
          :tone="event.isEligible ? 'accent' : 'warning'"
        />
        <text class="priority-draw-detail-section-title">参与条件</text>
      </view>
      <view class="priority-draw-eligibility-card" :class="{ 'is-eligible': event.isEligible }">
        <view class="priority-draw-eligibility-icon">
          <AetherIcon
            :name="event.isEligible ? 'shield-check' : 'shield-alert'"
            :size="20"
            :stroke-width="2"
          />
        </view>
        <view class="priority-draw-eligibility-body">
          <view class="priority-draw-eligibility-title-row">
            <text class="priority-draw-eligibility-title">
              {{ event.isEligible ? '校验通过' : '校验失败' }}
            </text>
            <AetherIcon
              v-if="event.isEligible"
              name="shield-check"
              :size="13"
              :stroke-width="2.2"
              tone="accent"
            />
          </view>
          <text class="priority-draw-eligibility-copy">{{ eligibilityCopy }}</text>
        </view>
      </view>
    </view>

    <view class="priority-draw-detail-block">
      <view class="priority-draw-detail-section-head">
        <AetherIcon name="calendar-days" :size="16" :stroke-width="2" tone="muted" />
        <text class="priority-draw-detail-section-title">活动时间</text>
      </view>
      <view class="priority-draw-timeline-card">
        <view class="priority-draw-timeline-row">
          <view class="priority-draw-timeline-rail">
            <view class="priority-draw-timeline-dot is-active" />
            <view class="priority-draw-timeline-line" />
          </view>
          <view class="priority-draw-timeline-body">
            <text class="priority-draw-timeline-label">START</text>
            <text class="priority-draw-timeline-copy">{{ event.timeline.startTime }}</text>
          </view>
        </view>
        <view class="priority-draw-timeline-row">
          <view class="priority-draw-timeline-rail">
            <view class="priority-draw-timeline-dot" />
          </view>
          <view class="priority-draw-timeline-body">
            <text class="priority-draw-timeline-label">END</text>
            <text class="priority-draw-timeline-copy">{{ event.timeline.endTime }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="priority-draw-detail-block">
      <view class="priority-draw-detail-section-head">
        <AetherIcon name="terminal-square" :size="16" :stroke-width="2" tone="subtle" />
        <text class="priority-draw-detail-section-title">活动说明</text>
      </view>
      <view class="priority-draw-rule-card">
        <text
          v-for="(rule, index) in event.rules"
          :key="`${event.id}-rule-${index}`"
          class="priority-draw-rule-copy"
        >
          {{ index + 1 }}. {{ rule }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import type { PriorityDrawEventViewModel } from './runtime/priority-draw.model'

const props = defineProps<{
  event: PriorityDrawEventViewModel
}>()

const statusLabel = computed(() => {
  if (props.event.status === 'LIVE') {
    return '报名中'
  }

  if (props.event.status === 'UPCOMING') {
    return '未开始'
  }

  return '已结束'
})

const statusClass = computed(() => ({
  'is-live': props.event.status === 'LIVE',
  'is-upcoming': props.event.status === 'UPCOMING',
  'is-ended': props.event.status === 'ENDED',
}))

const event = computed(() => props.event)
const eligibilityCopy = computed(() =>
  props.event.isEligible ? `您可以抽奖 ${props.event.remainingDrawCount} 次` : '您未满足活动资格'
)
const participantsText = computed(() => props.event.participants.toLocaleString('zh-CN'))
const heatValue = computed(() => {
  if (props.event.status === 'UPCOMING') {
    return '活动未开始'
  }

  if (props.event.status === 'ENDED') {
    return `${participantsText.value} 人参与`
  }

  return `${participantsText.value} 人`
})

const MS_PER_DAY = 24 * 60 * 60 * 1000

const parseTimelineTime = (value: string) => {
  const parsed = new Date(value.trim().replace(/\./g, '/')).getTime()
  return Number.isFinite(parsed) ? parsed : null
}

const resolveDistanceDays = (value: string) => {
  const targetTime = parseTimelineTime(value)
  if (targetTime === null) {
    return null
  }

  return Math.max(0, Math.ceil((targetTime - Date.now()) / MS_PER_DAY))
}

const timeStateValue = computed(() => {
  const countdownLabel = props.event.timeline.countdownLabel.trim()

  if (props.event.status === 'ENDED') {
    return '已结束'
  }

  if (props.event.status === 'UPCOMING') {
    if (countdownLabel.startsWith('即将开始')) {
      return countdownLabel
    }

    const days = resolveDistanceDays(props.event.timeline.startTime)
    return days === null ? countdownLabel : `即将开始 ${days} 天`
  }

  if (countdownLabel.startsWith('剩余')) {
    return countdownLabel
  }

  const days = resolveDistanceDays(props.event.timeline.endTime)
  return days === null ? countdownLabel : `剩余 ${days} 天`
})
</script>

<style scoped lang="scss">
.priority-draw-detail {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.priority-draw-detail-summary-card,
.priority-draw-prize-card,
.priority-draw-eligibility-card,
.priority-draw-timeline-card,
.priority-draw-rule-card {
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 28px;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
}

.priority-draw-detail-summary-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 12px;
  box-sizing: border-box;
}

.priority-draw-detail-summary-cover {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: var(--aether-surface-tertiary, #f1f5f9);
}

.priority-draw-detail-summary-cover::before {
  content: '';
  display: block;
  width: 100%;
  padding-top: 56.25%;
}

.priority-draw-detail-summary-cover-image,
.priority-draw-detail-summary-cover-shade {
  position: absolute;
  inset: 0;
}

.priority-draw-detail-summary-cover-image {
  width: 100%;
  height: 100%;
}

.priority-draw-detail-summary-cover-shade {
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(15, 23, 42, 0.24), transparent 42%),
    linear-gradient(0deg, rgba(15, 23, 42, 0.16), transparent 46%);
}

.priority-draw-detail-summary-body {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 18px 8px 6px;
  box-sizing: border-box;
}

.priority-draw-detail-status {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 2;
  display: inline-flex;
  align-items: center;
  gap: 6px;
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  background: var(--aether-surface-inverse, #111111);
  color: #ffffff;
}

.priority-draw-detail-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22d3ee;
}

.priority-draw-detail-status.is-upcoming .priority-draw-detail-status-dot {
  background: #f59e0b;
}

.priority-draw-detail-status.is-ended .priority-draw-detail-status-dot {
  background: #94a3b8;
}

.priority-draw-detail-status-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
  transform: scale(0.86);
  transform-origin: left center;
}

.priority-draw-detail-title {
  font-size: 24px;
  line-height: 32px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #111111;
}

.priority-draw-detail-stat-row {
  display: flex;
  gap: 16px;
  padding-top: 18px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.priority-draw-detail-stat {
  min-width: 0;
  display: flex;
  flex-direction: column;
  flex: 1;
  gap: 7px;
}

.priority-draw-detail-stat.align-right {
  align-items: flex-end;
  text-align: right;
}

.priority-draw-detail-stat-divider {
  width: 1px;
  min-height: 38px;
  background: rgba(148, 163, 184, 0.14);
}

.priority-draw-detail-stat-label-row {
  display: inline-flex;
  align-items: center;
  gap: 5px;
}

.priority-draw-detail-stat-label,
.priority-draw-detail-section-title,
.priority-draw-prize-tier,
.priority-draw-timeline-label {
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
}

.priority-draw-detail-stat-label,
.priority-draw-timeline-label {
  color: #94a3b8;
  letter-spacing: 0.08em;
  transform: scale(0.88);
  transform-origin: left center;
}

.priority-draw-detail-stat-value {
  font-size: 16px;
  line-height: 20px;
  font-weight: 900;
  color: #111111;
}

.priority-draw-detail-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.priority-draw-detail-section-head {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 0 2px;
}

.priority-draw-detail-section-title {
  color: #111111;
  letter-spacing: 0.02em;
}

.priority-draw-prize-stack {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.priority-draw-prize-card {
  padding: 16px;
  overflow: hidden;
  box-sizing: border-box;
}

.priority-draw-prize-card-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 12px;
  margin-bottom: 14px;
}

.priority-draw-prize-tier {
  min-height: 22px;
  padding: 0 8px;
  border-radius: 8px;
  background: var(--aether-surface-secondary, #f6f7f9);
  color: #111111;
  display: inline-flex;
  align-items: center;
}

.priority-draw-prize-quota {
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
  color: #64748b;
}

.priority-draw-prize-items {
  display: flex;
  align-items: stretch;
  gap: 8px;
}

.priority-draw-prize-items.is-single .priority-draw-prize-item {
  flex-basis: 100%;
}

.priority-draw-prize-item {
  position: relative;
  overflow: hidden;
  flex: 1 1 0;
  border-radius: 14px;
  background: var(--aether-surface-tertiary, #f1f5f9);
}

.priority-draw-prize-item::before {
  content: '';
  display: block;
  width: 100%;
  padding-top: 50%;
}

.priority-draw-prize-items:not(.is-single) .priority-draw-prize-item::before {
  padding-top: 100%;
}

.priority-draw-prize-plus {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  margin: 0 -14px;
  z-index: 2;
}

.priority-draw-prize-plus-copy {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 22px;
  height: 22px;
  border: 1px solid rgba(148, 163, 184, 0.18);
  border-radius: 8px;
  background: var(--aether-surface-primary, #ffffff);
  color: #64748b;
  font-size: 16px;
  line-height: 20px;
  font-weight: 700;
}

.priority-draw-prize-item-image,
.priority-draw-prize-item-shade {
  position: absolute;
  inset: 0;
}

.priority-draw-prize-item-image {
  width: 100%;
  height: 100%;
}

.priority-draw-prize-item-shade {
  background: linear-gradient(180deg, transparent 28%, rgba(15, 23, 42, 0.74));
}

.priority-draw-prize-item-copy {
  position: absolute;
  left: 10px;
  right: 10px;
  bottom: 10px;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.priority-draw-prize-item-type,
.priority-draw-prize-item-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-draw-prize-item-type {
  font-size: 12px;
  line-height: 10px;
  font-weight: 700;
  color: rgba(226, 232, 240, 0.8);
  transform: scale(0.84);
  transform-origin: left center;
}

.priority-draw-prize-item-name {
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
  color: #ffffff;
}

.priority-draw-prize-item-count {
  position: absolute;
  right: 9px;
  top: 9px;
  min-height: 20px;
  padding: 0 7px;
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.58);
  color: #ffffff;
  font-size: 12px;
  line-height: 20px;
  font-weight: 700;
}

.priority-draw-eligibility-card,
.priority-draw-timeline-card,
.priority-draw-rule-card {
  padding: 18px;
  box-sizing: border-box;
}

.priority-draw-eligibility-card {
  position: relative;
  overflow: hidden;
  display: flex;
  flex-direction: row;
  align-items: flex-start;
  gap: 14px;
}

.priority-draw-eligibility-card.is-eligible {
  background: linear-gradient(90deg, rgba(236, 254, 255, 0.72), #ffffff 58%), #ffffff;
}

.priority-draw-eligibility-icon {
  width: 42px;
  height: 42px;
  flex: 0 0 auto;
  border-radius: 16px;
  background: var(--aether-surface-secondary, #f6f7f9);
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.priority-draw-eligibility-card.is-eligible .priority-draw-eligibility-icon {
  background: rgba(236, 254, 255, 0.94);
  color: #0891b2;
}

.priority-draw-eligibility-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding-top: 2px;
}

.priority-draw-eligibility-title-row {
  display: inline-flex;
  align-items: center;
  gap: 7px;
}

.priority-draw-eligibility-title {
  font-size: 14px;
  line-height: 18px;
  font-weight: 900;
  color: #111111;
}

.priority-draw-eligibility-copy,
.priority-draw-rule-copy {
  font-size: 12px;
  line-height: 20px;
  font-weight: 500;
  color: #64748b;
}

.priority-draw-timeline-card {
  display: flex;
  flex-direction: column;
  gap: 0;
}

.priority-draw-timeline-row {
  display: flex;
  gap: 14px;
}

.priority-draw-timeline-rail {
  width: 12px;
  flex: 0 0 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.priority-draw-timeline-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  background: var(--aether-surface-tertiary, #f1f5f9);
}

.priority-draw-timeline-dot.is-active {
  background: #22d3ee;
}

.priority-draw-timeline-line {
  width: 1px;
  height: 50px;
  margin-top: -1px;
  background: repeating-linear-gradient(
    to bottom,
    rgba(34, 211, 238, 0.8) 0,
    rgba(34, 211, 238, 0.8) 4px,
    transparent 4px,
    transparent 8px
  );
}

.priority-draw-timeline-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
  padding-bottom: 22px;
  transform: translateY(-2px);
}

.priority-draw-timeline-row:last-child .priority-draw-timeline-body {
  padding-bottom: 0;
}

.priority-draw-timeline-copy {
  font-size: 13px;
  line-height: 16px;
  font-weight: 800;
  color: #111111;
}

.priority-draw-rule-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
