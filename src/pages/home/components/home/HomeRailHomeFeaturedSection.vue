<!--
Responsibility: render the featured drop composition in the home rail and keep the section's
visual structure and local styling isolated from parent templates.
Out of scope: featured data assembly, progress calculation ownership, and parent runtime effects.
-->
<template>
  <view class="home-featured-layout">
    <view class="home-featured-copy">
      <view class="home-featured-title-slot">
        <text class="home-featured-title">{{ featured.sectionTitle }}</text>
        <text class="home-featured-subtitle">{{ featured.sectionSubtitle }}</text>
      </view>

      <HomeInteractiveTarget
        class="home-featured-info-card"
        :class="{ 'is-scene-patch-light': isScenePatchMotionReduced }"
        :label="'查看 ' + featured.title"
        @activate="emit('activate')"
      >
        <view class="home-featured-info-shell">
          <view class="home-featured-info-safe">
            <view class="home-featured-price-row">
              <text class="home-featured-price-label">{{ featured.title }}</text>
              <view class="home-featured-price-value">
                <text class="home-featured-price-main">
                  {{ featured.priceUnit }} {{ featured.price }}
                </text>
              </view>
            </view>

            <view class="home-featured-progress-stack">
              <view class="home-featured-progress-meta">
                <text class="home-featured-progress-num">{{ featured.minted }}</text>
                <text class="home-featured-progress-num">{{ featured.supply }}</text>
              </view>
              <view class="home-featured-progress-track-wrap">
                <view class="home-featured-progress-track">
                  <view class="home-featured-progress-fill" :style="featuredProgressStyle" />
                </view>
              </view>
            </view>
          </view>
        </view>
      </HomeInteractiveTarget>
    </view>

    <HomeInteractiveTarget
      class="home-featured-visual"
      :class="{ 'is-scene-patch-light': isScenePatchMotionReduced }"
      :label="'查看 ' + featured.title"
      @activate="emit('activate')"
    >
      <view class="home-featured-visual-shell">
        <HomeMarketCardImageReveal
          :key="featuredRefreshRenderKey + '::' + featured.id"
          class="home-featured-image-reveal"
          :image-url="featuredImageUrl"
          :placeholder-icon="featuredPlaceholderIcon"
          :phase="featuredImagePhase"
          :placeholder-icon-size="24"
          :enable-persistent-local-cache="true"
          :lazy-load="!isFeaturedImageLoaded"
          @load="emit('featured-image-load', $event)"
          @error="emit('featured-image-error', $event)"
          @retrying="emit('featured-image-retrying', $event)"
        />
        <text class="home-featured-id">
          <text class="home-safe-mini-text home-safe-mini-text-8">{{ featured.id }}</text>
        </text>
      </view>
    </HomeInteractiveTarget>
  </view>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type { HomeFeaturedDropContent } from '../../../../models/home-rail/homeRailHome.model'
import HomeMarketCardImageReveal from '../../../../components/HomeMarketCardImageReveal.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  featured: HomeFeaturedDropContent
  isScenePatchMotionReduced: boolean
  featuredProgressStyle: CSSProperties
  featuredRefreshRenderKey: number
  featuredPlaceholderIcon: AetherIconName
  featuredImageUrl: string
  featuredImagePhase: 'icon' | 'wait-scan' | 'reveal-scan' | 'steady' | 'fallback'
  isFeaturedImageLoaded: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  activate: []
  'featured-image-load': [event: unknown]
  'featured-image-error': [event: unknown]
  'featured-image-retrying': [event: unknown]
}>()
</script>

<style lang="scss" scoped>
.home-featured-layout {
  position: relative;
  min-height: 148px;
}

.home-featured-copy {
  position: relative;
  z-index: 1;
  min-height: 148px;
  height: 148px;
  box-sizing: border-box;
  display: grid;
  grid-template-rows: 28px 8px 104px 8px;
  align-items: stretch;
  justify-content: stretch;
}

.home-featured-title-slot {
  min-height: 28px;
  height: 28px;
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
  gap: 8px;
  padding-left: 4px;
}

.home-featured-title {
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  color: #111111;
}

.home-featured-subtitle {
  min-height: 12px;
  display: inline-block;
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
  color: #22d3ee;
  text-transform: uppercase;
  letter-spacing: 0.18em;
  transform: scale(0.75);
  transform-origin: left bottom;
  vertical-align: baseline;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-featured-info-card,
.home-featured-visual {
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

.home-featured-info-card {
  position: relative;
  grid-row: 3 / span 1;
  display: block;
  min-height: 104px;
  height: 104px;
  width: calc(100% - 132px);
  border-radius: 0;
  background: transparent;
  box-shadow: none;
  overflow: visible;
  box-sizing: border-box;
  transition: transform 180ms ease;
}

.home-featured-info-shell {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--aether-surface-radius-sm, 12px);
  border: 1px solid #edf0f3;
  background-color: #f4f5f7;
  background-image: linear-gradient(
    135deg,
    rgba(34, 211, 238, 0.045) 0%,
    rgba(34, 211, 238, 0.015) 26%,
    rgba(34, 211, 238, 0) 48%
  );
  box-shadow: none;
  overflow: hidden;
  box-sizing: border-box;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.home-featured-info-shell::before {
  content: '';
  position: absolute;
  left: 16px;
  top: 0;
  width: 40px;
  height: 2px;
  border-radius: 0 0 999px 999px;
  background: rgba(34, 211, 238, 0.78);
  pointer-events: none;
}

.home-featured-info-safe {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  padding: 20px 32px 20px 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 0;
  transition: transform 180ms ease;
}

.home-featured-price-row {
  min-height: 24px;
  height: 24px;
  display: flex;
  align-items: baseline;
  justify-content: flex-start;
  gap: 8px;
  min-width: 0;
}

.home-featured-price-label {
  flex: 1 1 auto;
  min-width: 0;
  font-size: 14px;
  line-height: 20px;
  font-weight: 700;
  color: #7c8da3;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-featured-price-value {
  flex: 0 0 auto;
  display: flex;
  align-items: baseline;
  justify-content: flex-end;
  margin-left: auto;
}

.home-featured-price-main {
  display: block;
  font-size: 20px;
  line-height: 20px;
  font-weight: 900;
  color: #111111;
}

.home-featured-progress-stack {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 4px;
  box-sizing: border-box;
}

.home-featured-progress-meta {
  min-height: 12px;
  height: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.home-featured-progress-num {
  font-size: 12px;
  line-height: 12px;
  color: #6b7280;
  transform-origin: center center;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-featured-progress-track-wrap {
  min-height: 4px;
  height: 4px;
  display: flex;
  align-items: center;
}

.home-featured-progress-track {
  width: 100%;
  height: 4px;
  border-radius: 999px;
  overflow: hidden;
  background: #d1d5db;
}

.home-featured-progress-fill {
  height: 100%;
  border-radius: 999px;
  background: linear-gradient(90deg, #22d3ee 0%, #38bdf8 100%);
}

.home-featured-info-card.is-entry-active .home-featured-info-safe {
  transform: translateY(1px);
}

.home-featured-info-card.is-entry-active .home-featured-info-shell {
  filter: brightness(0.992);
}

.home-featured-visual {
  position: absolute;
  right: 0;
  top: 0;
  z-index: 2;
  height: 148px;
  width: 148px;
  border-radius: 0;
  overflow: visible;
  background: transparent;
  box-shadow: none;
  display: block;
}

.home-featured-visual-shell {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: var(--aether-surface-radius-sm, 12px);
  border: 1px solid #edf0f3;
  overflow: hidden;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  --home-market-card-image-radius: var(--aether-surface-radius-sm, 12px);
  --home-market-card-material-base-bg: transparent;
  --home-market-card-material-fallback-bg: transparent;
  --home-market-card-placeholder-icon-color: #cbd5e1;
}

.home-featured-id {
  position: absolute;
  right: 8px;
  bottom: 8px;
  color: #cbd5e1;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-safe-mini-text {
  display: inline-block;
  min-width: 0;
  font-size: 12px;
  line-height: 12px;
  transform-origin: center center;
  vertical-align: top;
}

.home-safe-mini-text-8 {
  transform: scale(0.6667);
}

.home-featured-info-card.is-scene-patch-light,
.home-featured-info-card.is-scene-patch-light .home-featured-info-shell,
.home-featured-info-card.is-scene-patch-light .home-featured-info-shell::before,
.home-featured-info-card.is-scene-patch-light .home-featured-info-safe,
.home-featured-visual.is-scene-patch-light,
.home-featured-visual.is-scene-patch-light .home-featured-visual-shell {
  transition: none;
}

@media (hover: hover) and (pointer: fine) {
  .home-featured-info-card:hover,
  .home-featured-visual:hover {
    transform: translateY(var(--aether-entry-hover-lift-y, -2px));
  }
}
</style>
