<!--
Responsibility: render a single profile asset card shell for mounted-grid, removed-overlay,
and placeholder usage without leaking visual styles back into the results section.
Out of scope: result-window timing, profile query execution, and card data projection.
-->
<template>
  <view v-if="placeholder" class="home-profile-asset-shell home-profile-asset-shell--placeholder">
    <view class="home-profile-market-card-visual home-profile-market-card-visual--placeholder" />
    <view class="home-profile-market-card-copy" />
  </view>

  <view v-else class="home-profile-asset-shell">
    <view class="home-profile-market-card-visual" :class="`tone-${item.visualTone}`">
      <view
        v-if="item.badge"
        class="home-profile-market-card-badge"
        :class="`tone-${item.badge.tone}`"
      >
        <text class="home-profile-market-card-badge-text">{{ item.badge.label }}</text>
      </view>
      <view class="home-profile-asset-image-frame">
        <HomeMarketCardImageReveal
          :image-url="imageUrl"
          :phase="phase"
          :placeholder-icon="placeholderIcon"
          :fallback-text="''"
          :placeholder-icon-size="40"
          :enable-persistent-local-cache="true"
          :image-cache-user-scope="resolvedProfileImageCacheUserScope"
          cache-scope-policy="required-user"
          @load="handleImageLoad?.($event)"
          @error="handleImageError?.($event)"
          @retrying="handleImageRetrying?.($event)"
        />
      </view>
    </view>

    <view class="home-profile-market-card-copy">
      <view class="home-profile-market-card-meta">
        <text class="home-profile-market-card-name">{{ item.name }}</text>
        <text class="home-profile-market-card-id">持有 {{ item.holdingsCount }} 份</text>
        <view class="home-profile-market-card-price-wrap">
          <view class="home-profile-market-card-price-accent" />
          <text class="home-profile-market-card-price">{{ item.priceUnit }} {{ item.price }}</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetRevealPhase } from '../../composables/profile/useProfileAssetVisualReveal'
import HomeMarketCardImageReveal from '../../../../components/HomeMarketCardImageReveal.vue'

interface Props {
  item: ProfileAssetItem
  imageUrl: string
  phase: ProfileAssetRevealPhase
  placeholderIcon: AetherIconName
  placeholder?: boolean
  profileImageCacheUserScope?: string | null
  handleImageLoad?: (payload?: unknown) => void
  handleImageError?: (payload?: unknown) => void
  handleImageRetrying?: (payload?: unknown) => void
}

const props = withDefaults(defineProps<Props>(), {
  placeholder: false,
  profileImageCacheUserScope: null,
  handleImageLoad: undefined,
  handleImageError: undefined,
  handleImageRetrying: undefined,
})

const resolvedProfileImageCacheUserScope = computed(
  () => props.profileImageCacheUserScope ?? undefined
)
</script>

<style lang="scss" scoped>
.home-profile-asset-shell {
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

.home-profile-asset-shell--placeholder {
  pointer-events: none;
  visibility: hidden;
  background: transparent;
  box-shadow: none;
}

.home-profile-market-card-visual {
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

.home-profile-market-card-visual--placeholder {
  background: transparent;
}

.home-profile-market-card-visual.tone-ink,
.home-profile-market-card-visual.tone-mist,
.home-profile-market-card-visual.tone-aqua,
.home-profile-market-card-visual.tone-sand {
  background: var(--aether-surface-primary, #ffffff);
}

.home-profile-asset-image-frame {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  overflow: hidden;
  --home-market-card-image-radius: 12px;
}

.home-profile-market-card-badge {
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

.home-profile-market-card-badge.tone-new {
  background: #ef4444;
  color: #ffffff;
}

.home-profile-market-card-badge.tone-hot {
  background: #f97316;
  color: #ffffff;
}

.home-profile-market-card-badge.tone-featured {
  background: #22d3ee;
  color: #ffffff;
}

.home-profile-market-card-badge-text {
  font-size: 12px;
  line-height: 12px;
  letter-spacing: 0.16em;
  font-weight: 900;
  transform: scale(0.75);
  transform-origin: center center;
}

.home-profile-market-card-badge.tone-featured {
  min-width: 40px;
}

.home-profile-market-card-badge.tone-featured .home-profile-market-card-badge-text {
  letter-spacing: 0.06em;
  transform: scale(0.92);
}

.home-profile-market-card-copy {
  padding: 12px 12px 8px;
  min-height: 72px;
  box-sizing: border-box;
  display: flex;
  align-items: stretch;
}

.home-profile-market-card-meta {
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  grid-template-rows: auto auto;
  gap: 4px 12px;
  align-items: start;
  align-content: start;
  width: 100%;
  min-height: 40px;
}

.home-profile-market-card-name {
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

.home-profile-market-card-id {
  display: block;
  grid-column: 1;
  grid-row: 2;
  min-width: 0;
  align-self: start;
  font-size: 12px;
  line-height: 12px;
  color: #9ca3af;
  letter-spacing: 0.04em;
}

.home-profile-market-card-price-wrap {
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

.home-profile-market-card-price-accent {
  width: 24px;
  height: 2px;
  border-radius: 999px;
  background: #22d3ee;
  margin-top: auto;
}

.home-profile-market-card-price {
  display: block;
  font-size: 20px;
  line-height: 20px;
  font-weight: 800;
  color: #111111;
  text-align: right;
}
</style>
