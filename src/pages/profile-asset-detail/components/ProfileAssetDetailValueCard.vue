<!--
Responsibility: render the profile asset detail value card shell, including creator,
title, pricing, ownership, and trait summary presentation.
Out of scope: detail refresh orchestration, persistent cache flow, and hero media runtime.
-->
<template>
  <SecondaryPageCard class="value-card">
    <view class="value-card-header">
      <view class="value-card-eyebrow">
        <view class="value-card-collection-badge">
          <text class="value-card-collection-badge-text">{{ partitionDisplayText }}</text>
        </view>
        <view v-if="holdingSerialText" class="value-card-serial-badge">
          <text class="value-card-serial-badge-text">{{ holdingSerialText }}</text>
        </view>
        <text class="value-card-creator">by {{ creatorText }}</text>
      </view>
      <text class="value-card-title">{{ titleText }}</text>
    </view>
    <view class="value-card-divider" />
    <view class="value-card-label">
      <AetherIcon name="activity" :size="12" :stroke-width="2" />
      <text class="value-card-label-text-fixed">{{ metricLabelText }}</text>
    </view>
    <view class="value-card-price-row">
      <view class="value-card-price-main">
        <text class="value-card-price-value">{{ displayPrice }}</text>
        <text class="value-card-price-unit">{{ displayPriceUnitVisual }}</text>
      </view>
      <text class="value-card-price-fiat-fixed">{{ totalValueCompactLabelText }}</text>
      <text class="value-card-price-fiat">流通总价值</text>
    </view>
    <view class="value-card-summary-surface value-card-summary-grid">
      <view class="summary-grid">
        <view class="summary-item">
          <text class="summary-label">持有 / HOLDING</text>
          <text class="summary-value">{{ holdingsCount }} 件</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">入库 / ACQUIRED</text>
          <text class="summary-value">{{ acquiredAt }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">流通量 / CIRCULATION</text>
          <text class="summary-value">{{ circulationCount }}</text>
        </view>
        <view class="summary-item">
          <text class="summary-label">总量 / SUPPLY</text>
          <text class="summary-value">{{ issueCount }}</text>
        </view>
      </view>
    </view>
  </SecondaryPageCard>
</template>

<script setup lang="ts">
import AetherIcon from '../../../components/AetherIcon.vue'
import SecondaryPageCard from '../../../components/SecondaryPageCard.vue'

defineProps<{
  partitionDisplayText: string
  creatorText: string
  titleText: string
  metricLabelText: string
  holdingSerialText?: string
  displayPrice: string
  displayPriceUnitVisual: string
  totalValueCompactLabelText: string
  holdingsCount: number
  acquiredAt: string
  circulationCount: number
  issueCount: number
}>()
</script>

<style scoped lang="scss">
.value-card {
  border-radius: 24px;
  border: none;
  box-shadow: var(--aether-shadow-surface-sm, 0 0 12px rgba(15, 23, 42, 0.05));
  padding: 24px;
  gap: 0;
}

.value-card-header {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 24px;
}

.value-card-eyebrow {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.value-card-collection-badge {
  height: 20px;
  width: auto;
  max-width: 100%;
  border-radius: 4px;
  background: #111;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  align-self: flex-start;
}

.value-card-collection-badge-text {
  color: #fff;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.04em;
  white-space: nowrap;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.83);
  transform-origin: center center;
}

.value-card-serial-badge {
  min-height: 20px;
  padding: 0 8px;
  border-radius: 999px;
  border: 1px solid rgba(34, 211, 238, 0.24);
  background: rgba(236, 254, 255, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.value-card-serial-badge-text {
  color: #0891b2;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.03em;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transform: scale(0.83);
  transform-origin: center center;
}

.value-card-creator {
  color: #94a3b8;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  display: inline-block;
  transform: scale(0.83);
  transform-origin: left center;
}

.value-card-title {
  color: #111;
  font-size: 28px;
  line-height: 36px;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: normal;
  overflow-wrap: anywhere;
}

.value-card-divider {
  height: 0.5px;
  background: repeating-linear-gradient(90deg, #e5e7eb 0 8px, transparent 8px 12px);
  margin-bottom: 24px;
}

.value-card-label {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #94a3b8;
  margin-bottom: 12px;
}

.value-card-label :deep(svg) {
  color: #22d3ee;
}

.value-card-label-text-fixed {
  color: #9ca3af;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-block;
  transform: scale(0.83);
  transform-origin: left center;
}

.value-card-price-row {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 16px;
}

.value-card-price-main {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.value-card-price-value {
  color: #111;
  font-size: 28px;
  line-height: 32px;
  font-weight: 500;
  letter-spacing: -0.04em;
}

.value-card-price-unit {
  color: #111;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.value-card-price-fiat {
  display: none;
}

.value-card-price-fiat-fixed {
  color: #9ca3af;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.02em;
  text-align: right;
}

.summary-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 8px;
}

.value-card-summary-grid {
  margin-top: 24px;
}

.value-card-summary-surface {
  border-radius: 16px;
  background: #f9fbfd;
  padding: 16px;
  box-sizing: border-box;
}

.summary-item {
  min-height: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 8px;
}

.summary-label {
  color: #9ca3af;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.06em;
  display: inline-block;
  transform: scale(0.83);
  transform-origin: left center;
}

.summary-value {
  color: #111;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
}
</style>
