<!--
Responsibility: render the profile summary card grid and keep the local display shell
isolated from the parent profile panel.
Out of scope: summary data derivation, click follow-up behavior, and route handling.
-->
<template>
  <view class="home-profile-summary-grid">
    <HomeInteractiveTarget
      class="home-profile-summary-card tone-light"
      label="查看资产总额汇总"
      @activate="emit('summary-focus')"
    >
      <view class="home-profile-summary-shell tone-light">
        <view class="home-profile-summary-copy">
          <view class="home-profile-summary-head">
            <text class="home-profile-summary-title">资产总额</text>
            <text class="home-profile-summary-subtitle">TOTAL VALUE</text>
          </view>

          <view class="home-profile-summary-value-row">
            <text class="home-profile-summary-unit">{{ currencySymbol }}</text>
            <text class="home-profile-summary-main">{{ totalValue }}</text>
          </view>
        </view>
      </view>
    </HomeInteractiveTarget>

    <HomeInteractiveTarget
      class="home-profile-summary-card tone-dark"
      label="查看持有藏品汇总"
      @activate="emit('summary-focus')"
    >
      <view class="home-profile-summary-shell tone-dark">
        <view class="home-profile-summary-copy">
          <view class="home-profile-summary-head">
            <text class="home-profile-summary-title is-light">持有藏品</text>
            <text class="home-profile-summary-subtitle is-light">HOLDINGS</text>
          </view>

          <view class="home-profile-summary-value-row">
            <text class="home-profile-summary-main is-light">{{ holdings }}</text>
            <text class="home-profile-summary-unit is-meta">件</text>
          </view>
        </view>
      </view>
    </HomeInteractiveTarget>
  </view>
</template>

<script setup lang="ts">
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  currencySymbol: string
  totalValue: string
  holdings: string | number
}

defineProps<Props>()

const emit = defineEmits<{
  'summary-focus': []
}>()
</script>

<style lang="scss" scoped>
.home-profile-summary-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.3fr) minmax(0, 1fr);
  gap: 12px;
}

.home-profile-summary-card {
  position: relative;
  height: 96px;
  transition:
    transform 180ms ease,
    filter 180ms ease;
  border-radius: var(--aether-surface-radius-md, 16px);
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  overflow: visible;
  background: transparent;
}

.home-profile-summary-shell {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--aether-surface-radius-md, 16px);
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
  overflow: hidden;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.home-profile-summary-shell.tone-light {
  background:
    radial-gradient(circle at 92% 8%, rgba(34, 211, 238, 0.16), transparent 30%),
    linear-gradient(180deg, rgba(34, 211, 238, 0.05) 0%, rgba(34, 211, 238, 0.015) 100%), #ffffff;
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
}

.home-profile-summary-shell.tone-dark {
  background:
    radial-gradient(circle at 102% 102%, rgba(34, 211, 238, 0.3), transparent 44%),
    linear-gradient(180deg, #111111 0%, #111827 100%);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
}

.home-profile-summary-shell.tone-dark::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: inherit;
  background:
    radial-gradient(circle at 84% 18%, rgba(125, 211, 252, 0.28), transparent 34%),
    linear-gradient(
      135deg,
      rgba(255, 255, 255, 0.12) 0%,
      rgba(255, 255, 255, 0.04) 38%,
      rgba(255, 255, 255, 0) 72%
    );
  opacity: 0.9;
  pointer-events: none;
}

.home-profile-summary-card.tone-light.is-entry-active {
  transform: scale(var(--aether-entry-active-scale, 0.985));
}

.home-profile-summary-card.tone-light.is-entry-active .home-profile-summary-copy,
.home-profile-summary-card.tone-dark.is-entry-active .home-profile-summary-copy {
  transform: translateY(1px);
}

.home-profile-summary-card.tone-dark.is-entry-active .home-profile-summary-shell {
  transform: scale(var(--aether-entry-active-scale, 0.985));
  filter: brightness(1.05) saturate(1.04);
  box-shadow: var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08));
}

.home-profile-summary-card.tone-dark.is-entry-active .home-profile-summary-shell::after {
  opacity: 1;
}

.home-profile-summary-copy {
  position: relative;
  z-index: 1;
  min-width: 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 8px;
  transform-origin: left bottom;
  transition: transform 180ms ease;
}

.home-profile-summary-head {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 2px 8px;
  flex-wrap: wrap;
}

.home-profile-summary-title {
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
  color: #111111;
  flex: 0 0 auto;
}

.home-profile-summary-title.is-light {
  color: #ffffff;
}

.home-profile-summary-subtitle {
  font-size: 9px;
  line-height: 12px;
  font-weight: 500;
  color: #94a3b8;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  font-family: var(--aether-font-system, system-ui, sans-serif);
  white-space: nowrap;
  flex: 0 0 auto;
}

.home-profile-summary-subtitle.is-light {
  color: rgba(203, 213, 225, 0.82);
}

.home-profile-summary-value-row {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.home-profile-summary-unit {
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #111111;
}

.home-profile-summary-unit.is-meta {
  color: rgba(226, 232, 240, 0.72);
}

.home-profile-summary-main {
  font-size: 24px;
  line-height: 24px;
  font-weight: 600;
  color: #111111;
}

.home-profile-summary-main.is-light {
  color: #ffffff;
}

@media (hover: hover) and (pointer: fine) {
  .home-profile-summary-card.tone-light:hover,
  .home-profile-summary-card.tone-dark:hover {
    transform: translateY(var(--aether-entry-hover-lift-y, -2px));
  }

  .home-profile-summary-card.tone-dark:hover .home-profile-summary-shell {
    box-shadow: var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08));
    filter: brightness(1.04) saturate(1.04);
  }
}
</style>
