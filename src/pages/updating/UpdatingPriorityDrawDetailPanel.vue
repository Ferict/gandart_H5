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
            <view class="priority-draw-detail-stat-label-row" :class="timeMetricLabelToneClass">
              <AetherIcon name="clock" :size="12" :stroke-width="2" />
              <text class="priority-draw-detail-stat-label">{{ timeMetricLabel }}</text>
            </view>
            <text class="priority-draw-detail-stat-value">{{ timeStateValue }}</text>
          </view>
          <view class="priority-draw-detail-stat-divider" />
          <view class="priority-draw-detail-stat">
            <view class="priority-draw-detail-stat-label-row">
              <AetherIcon name="award" :size="12" :stroke-width="2" tone="subtle" />
              <text class="priority-draw-detail-stat-label">发放数量 / TOTAL</text>
            </view>
            <text class="priority-draw-detail-stat-value">{{ prizeTotalLabel }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="priority-draw-detail-block">
      <view class="priority-draw-detail-section-head">
        <AetherIcon name="gift" :size="16" :stroke-width="2" tone="accent" />
        <text class="priority-draw-detail-section-title">活动奖品池</text>
      </view>

      <view class="priority-draw-prize-grid">
        <view v-for="pool in event.prizePools" :key="pool.id" class="priority-draw-prize-card">
          <view class="priority-draw-prize-poster">
            <image
              class="priority-draw-prize-item-image"
              :src="resolvePrizePoolPosterImage(pool)"
              mode="aspectFill"
            />
          </view>
          <text class="priority-draw-prize-name">{{ resolvePrizePoolPosterName(pool) }}</text>
          <view class="priority-draw-prize-limit-tag">
            <text class="priority-draw-prize-limit-label">限量</text>
            <text class="priority-draw-prize-limit-separator">|</text>
            <text class="priority-draw-prize-limit-value">
              {{ formatPrizePoolQuotaValue(pool.quotaLabel) }}
            </text>
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
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import type {
  PriorityDrawEventViewModel,
  PriorityDrawPrizePoolViewModel,
} from './runtime/priority-draw.model'

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

const prizeTotalLabel = computed(() => `${props.event.quota.toLocaleString('zh-CN')} 份`)
const timeMetricLabel = computed(() => {
  if (props.event.status === 'LIVE') {
    return '距结束 / CLOSING'
  }

  return 'TIME'
})
const timeMetricLabelToneClass = computed(() => ({
  'is-closing': props.event.status === 'LIVE',
}))
const currentTimestamp = ref(Date.now())
let countdownTimer: ReturnType<typeof setInterval> | undefined

const parseTimelineTime = (value: string) => {
  const normalizedValue = value.trim()
  if (!normalizedValue) {
    return null
  }

  const numericValue = Number(normalizedValue)
  if (Number.isFinite(numericValue)) {
    return normalizedValue.length === 10 ? numericValue * 1000 : numericValue
  }

  const parsed = new Date(normalizedValue.replace(/\./g, '/').replace(/-/g, '/')).getTime()
  return Number.isFinite(parsed) ? parsed : null
}

const formatCountdownToEndTime = (value: string) => {
  const endTime = parseTimelineTime(value)
  if (endTime === null) {
    return null
  }

  const remainingSeconds = Math.max(0, Math.floor((endTime - currentTimestamp.value) / 1000))
  const hours = Math.floor(remainingSeconds / 3600)
  const minutes = Math.floor((remainingSeconds % 3600) / 60)
  const seconds = remainingSeconds % 60

  return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`
}

const timeStateValue = computed(() => {
  const countdownLabel = props.event.timeline.countdownLabel.trim()

  if (props.event.status === 'ENDED') {
    return '已结束'
  }

  if (props.event.status === 'UPCOMING') {
    return '即将开始'
  }

  const countdown = formatCountdownToEndTime(props.event.timeline.endTime)
  return countdown ?? countdownLabel
})

const resolvePrizePoolPosterItem = (pool: PriorityDrawPrizePoolViewModel) => pool.items[0] ?? null

const resolvePrizePoolPosterImage = (pool: PriorityDrawPrizePoolViewModel) => {
  return resolvePrizePoolPosterItem(pool)?.coverImageUrl ?? props.event.coverImageUrl
}

const resolvePrizePoolPosterName = (pool: PriorityDrawPrizePoolViewModel) => {
  return resolvePrizePoolPosterItem(pool)?.name ?? '活动奖品'
}

const formatPrizePoolQuotaValue = (quotaLabel: string) => {
  const quotaText = quotaLabel.trim()
  const quotaMatch = quotaText.match(/\d[\d,.，]*/)

  if (quotaMatch === null) {
    return props.event.quota.toLocaleString('zh-CN')
  }

  const normalizedQuota = quotaMatch[0].replace(/[,，]/g, '')
  const quotaNumber = Number(normalizedQuota)
  const quotaValue = Number.isFinite(quotaNumber)
    ? quotaNumber.toLocaleString('zh-CN')
    : quotaMatch[0]

  return quotaValue
}

onMounted(() => {
  countdownTimer = setInterval(() => {
    currentTimestamp.value = Date.now()
  }, 1000)
})

onBeforeUnmount(() => {
  if (countdownTimer !== undefined) {
    clearInterval(countdownTimer)
  }
})
</script>

<style scoped lang="scss">
.priority-draw-detail {
  display: flex;
  flex-direction: column;
  gap: 32px;
  --priority-draw-detail-card-radius: 24px;
  --priority-draw-detail-section-radius: 20px;
  --priority-draw-detail-media-radius: 16px;
  --priority-draw-detail-tag-radius: 4px;
}

.priority-draw-detail-summary-card,
.priority-draw-prize-card,
.priority-draw-eligibility-card,
.priority-draw-timeline-card,
.priority-draw-rule-card {
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: var(--priority-draw-detail-card-radius);
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-surface-sm, 0 0 12px rgba(15, 23, 42, 0.05));
}

.priority-draw-prize-card,
.priority-draw-eligibility-card,
.priority-draw-timeline-card,
.priority-draw-rule-card {
  border-radius: var(--priority-draw-detail-section-radius);
}

.priority-draw-detail-summary-card {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 24px;
  box-sizing: border-box;
}

.priority-draw-detail-summary-cover {
  position: relative;
  overflow: hidden;
  border-radius: var(--priority-draw-detail-media-radius);
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
  gap: 24px;
  padding: 24px 0 0;
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
  font-weight: 500;
  letter-spacing: 0.08em;
  transform: scale(0.86);
  transform-origin: left center;
}

.priority-draw-detail-title {
  font-size: 28px;
  line-height: 36px;
  font-weight: 600;
  letter-spacing: -0.02em;
  color: #111111;
}

.priority-draw-detail-stat-row {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 1px minmax(0, 1fr);
  align-items: stretch;
  column-gap: 24px;
  padding-top: 24px;
  border-top: 1px solid rgba(148, 163, 184, 0.12);
}

.priority-draw-detail-stat {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 7px;
}

.priority-draw-detail-stat-divider {
  width: 1px;
  min-height: 38px;
  align-self: stretch;
  background: rgba(148, 163, 184, 0.14);
}

.priority-draw-detail-stat-label-row {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  color: #94a3b8;
}

.priority-draw-detail-stat-label-row.is-closing {
  color: #ef4444;
}

.priority-draw-detail-stat-label,
.priority-draw-detail-section-title,
.priority-draw-timeline-label {
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
}

.priority-draw-detail-stat-label,
.priority-draw-timeline-label {
  color: #94a3b8;
  letter-spacing: 0.08em;
  transform: scale(0.88);
  transform-origin: left center;
}

.priority-draw-detail-stat-label-row.is-closing .priority-draw-detail-stat-label {
  color: #ef4444;
}

.priority-draw-detail-stat-value {
  font-size: 16px;
  line-height: 22px;
  font-weight: 500;
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

.priority-draw-prize-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.priority-draw-prize-card {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  overflow: hidden;
  box-sizing: border-box;
}

.priority-draw-prize-poster {
  position: relative;
  overflow: hidden;
  border-radius: var(--priority-draw-detail-media-radius);
  background: var(--aether-surface-tertiary, #f1f5f9);
}

.priority-draw-prize-poster::before {
  content: '';
  display: block;
  width: 100%;
  padding-top: 100%;
}

.priority-draw-prize-item-image {
  position: absolute;
  inset: 0;
}

.priority-draw-prize-item-image {
  width: 100%;
  height: 100%;
}

.priority-draw-prize-name {
  min-width: 0;
  overflow: hidden;
  color: #111111;
  font-size: 13px;
  font-weight: 600;
  line-height: 20px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-draw-prize-limit-tag {
  align-self: flex-start;
  display: inline-flex;
  max-width: 100%;
  min-height: 24px;
  overflow: hidden;
  border-radius: var(--priority-draw-detail-tag-radius);
  background: var(--aether-surface-inverse, #111111);
}

.priority-draw-prize-limit-label,
.priority-draw-prize-limit-separator,
.priority-draw-prize-limit-value {
  display: inline-flex;
  align-items: center;
  min-width: 0;
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
}

.priority-draw-prize-limit-label {
  padding: 0 7px;
  background: #111111;
  color: #ffffff;
}

.priority-draw-prize-limit-separator {
  padding: 0 1px;
  background: #242424;
  color: rgba(255, 255, 255, 0.42);
}

.priority-draw-prize-limit-value {
  padding: 0 8px 0 6px;
  overflow: hidden;
  background: #242424;
  color: #ffffff;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-draw-eligibility-card,
.priority-draw-timeline-card,
.priority-draw-rule-card {
  padding: 24px;
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
  border-radius: var(--priority-draw-detail-media-radius);
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
  line-height: 20px;
  font-weight: 600;
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
  line-height: 20px;
  font-weight: 600;
  color: #111111;
}

.priority-draw-rule-card {
  display: flex;
  flex-direction: column;
  gap: 12px;
}
</style>
