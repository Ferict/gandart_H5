<!--
Responsibility: render a single home market card shell for mounted-grid, removed-overlay,
and placeholder usage without leaking visual styles back into the results section.
Out of scope: result-window timing, market query execution, and card data projection.
-->
<template>
  <view v-if="placeholder" class="home-market-card-shell home-market-card-shell--placeholder">
    <view class="home-market-card-visual home-market-card-visual--placeholder" />
    <view class="home-market-card-copy" />
  </view>

  <view v-else class="home-market-card-shell">
    <view class="home-market-card-visual" :class="`tone-${item.visualTone}`">
      <view v-if="item.badge" class="home-market-card-badge" :class="`tone-${item.badge.tone}`">
        <text class="home-market-card-badge-text">{{ item.badge.label }}</text>
      </view>
      <view class="home-market-card-image-frame">
        <HomeMarketCardImageReveal
          :image-url="imageUrl"
          :placeholder-icon="placeholderIcon"
          :phase="phase"
          :fallback-text="fallbackText"
          :enable-persistent-local-cache="true"
          :lazy-load="lazyLoad"
          @load="handleImageLoad?.($event)"
          @error="handleImageError?.($event)"
          @retrying="handleImageRetrying?.($event)"
        />
      </view>
    </view>

    <view class="home-market-card-copy">
      <view class="home-market-card-meta">
        <text class="home-market-card-name">{{ item.name }}</text>
        <text class="home-market-card-id">{{ item.editionCode }} {{ item.issueCount }}</text>
        <view class="home-market-card-price-wrap">
          <view class="home-market-card-price-accent" />
          <text class="home-market-card-price">{{ item.priceUnit }} {{ item.price }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import type { MarketCardRevealPhase } from '../../composables/home/useHomeHomeVisualReveal'
import HomeMarketCardImageReveal from '../../../../components/HomeMarketCardImageReveal.vue'

interface Props {
  item: HomeMarketCard
  imageUrl: string
  placeholderIcon: AetherIconName
  phase: MarketCardRevealPhase
  fallbackText: string
  placeholder?: boolean
  lazyLoad?: boolean
  handleImageLoad?: (payload?: unknown) => void
  handleImageError?: (payload?: unknown) => void
  handleImageRetrying?: (payload?: unknown) => void
}

withDefaults(defineProps<Props>(), {
  placeholder: false,
  lazyLoad: false,
  handleImageLoad: undefined,
  handleImageError: undefined,
  handleImageRetrying: undefined,
})
</script>

<style lang="scss" scoped>
.home-market-card-shell {
  --home-market-card-radius: var(--aether-surface-radius-sm, 12px);

  position: relative;
  width: 100%;
  border-radius: var(--home-market-card-radius);
  border: 1px solid rgba(15, 23, 42, 0.06);
  box-sizing: border-box;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.home-market-card-shell--placeholder {
  pointer-events: none;
  visibility: hidden;
  background: transparent;
  box-shadow: none;
}

.home-market-card-visual {
  position: relative;
  width: 100%;
  aspect-ratio: 1 / 1;
  border-radius: 12px 12px 0 0;
  border: none;
  background: var(--aether-surface-primary, #ffffff);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-market-card-visual--placeholder {
  background: transparent;
}

.home-market-card-visual.tone-ink,
.home-market-card-visual.tone-mist,
.home-market-card-visual.tone-aqua,
.home-market-card-visual.tone-sand {
  background: var(--aether-surface-primary, #ffffff);
}

.home-market-card-image-frame {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  overflow: hidden;
  --home-market-card-image-radius: 12px;
}

.home-market-card-badge {
  position: absolute;
  right: 8px;
  top: 8px;
  z-index: 2;
  min-width: 32px;
  height: 20px;
  border-radius: 999px;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-market-card-badge.tone-new {
  background: #ef4444;
  color: #ffffff;
}

.home-market-card-badge.tone-hot {
  background: #f97316;
  color: #ffffff;
}

.home-market-card-badge.tone-featured {
  background: #22d3ee;
  color: #ffffff;
}

.home-market-card-badge-text {
  font-size: 12px;
  line-height: 12px;
  letter-spacing: 0.16em;
  font-weight: 900;
  transform: scale(0.75);
  transform-origin: center center;
}

.home-market-card-badge.tone-featured {
  min-width: 40px;
}

.home-market-card-badge.tone-featured .home-market-card-badge-text {
  letter-spacing: 0.06em;
  transform: scale(0.92);
}

.home-market-card-copy {
  padding: 12px 12px 8px;
  min-height: 72px;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
}

.home-market-card-meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  gap: 4px 12px;
  align-items: start;
  align-content: start;
  width: 100%;
  min-height: 40px;
}

.home-market-card-name {
  display: block;
  width: 100%;
  grid-column: 1 / -1;
  grid-row: 1;
  font-size: 16px;
  line-height: 20px;
  font-weight: 700;
  color: #111111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-market-card-id {
  display: block;
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
  align-self: start;
  font-size: 12px;
  line-height: 12px;
  color: #9ca3af;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.home-market-card-price-wrap {
  grid-column: 2;
  grid-row: 2;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 8px;
  align-items: flex-end;
  justify-content: flex-end;
  place-self: end end;
}

.home-market-card-price-accent {
  width: 24px;
  height: 2px;
  border-radius: 999px;
  background: #22d3ee;
  margin-top: auto;
}

.home-market-card-price {
  display: block;
  font-size: 20px;
  line-height: 20px;
  font-weight: 800;
  color: #111111;
  text-align: right;
}
</style>
