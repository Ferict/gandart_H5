<!--
Responsibility: render the profile rail asset results shell, including removed overlay,
mounted window spacers, first-screen empty state routing, and footer wiring.
Out of scope: profile query execution, result-window timing logic, and asset card data
assembly.
-->
<template>
  <HomeRailProfileEmptyStateSection
    v-if="
      shouldShowProfileFirstScreenLoading ||
      shouldShowProfileFirstScreenError ||
      shouldShowProfileFirstScreenEmpty
    "
    :should-show-loading="shouldShowProfileFirstScreenLoading"
    :should-show-error="shouldShowProfileFirstScreenError"
    :should-show-empty="shouldShowProfileFirstScreenEmpty"
    @retry="handleProfileAssetFirstScreenRetry"
  />

  <view
    v-else-if="displayedAssets.length"
    :ref="assignProfileAssetResultsStageRef"
    class="home-profile-asset-grid"
    :style="profileAssetResultsStageStyle"
  >
    <view
      v-if="profileAssetRemovedOverlayItems.length"
      class="home-profile-removed-overlay-layer"
      :style="profileAssetRemovedOverlayLayerStyle"
    >
      <view
        v-for="(overlayItem, overlayIndex) in profileAssetRemovedOverlayItems"
        :key="`removed::${overlayItem.id}::${overlayIndex}`"
        class="home-profile-asset-entry is-leaving is-removed-overlay"
        :style="resolveProfileAssetRemovedOverlayItemStyle(overlayItem.sourceIndex)"
        aria-hidden="true"
      >
        <HomeRailProfileAssetCardShell
          :item="overlayItem.item"
          :image-url="resolveProfileAssetImageUrl(overlayItem.item)"
          :phase="resolveProfileAssetRemovedOverlayRevealPhase(overlayItem.item)"
          :placeholder-icon="resolveProfileAssetPlaceholderIcon(overlayItem.item)"
          :profile-image-cache-user-scope="profileImageCacheUserScope"
        />
      </view>
    </view>

    <view
      v-if="profileAssetTopSpacerHeight > 0"
      class="home-profile-asset-window-spacer"
      :style="{ height: `${profileAssetTopSpacerHeight}px` }"
      aria-hidden="true"
    />
    <view class="home-profile-asset-grid-base">
      <template v-for="(item, index) in mountedAssets" :key="item.id">
        <HomeInteractiveTarget
          v-if="!isProfileAssetPlaceholder(item.id)"
          class="home-profile-asset-entry"
          :class="resolveProfileAssetEntryClass(item.id)"
          :style="resolveProfileAssetEntryStyle(item.id, index)"
          :label="`查看 ${item.name}`"
          @activate="handleAssetClick(item)"
        >
          <HomeRailProfileAssetCardShell
            :item="item"
            :image-url="resolveProfileAssetImageUrl(item)"
            :phase="resolveProfileAssetRevealPhase(item)"
            :placeholder-icon="resolveProfileAssetPlaceholderIcon(item)"
            :profile-image-cache-user-scope="profileImageCacheUserScope"
            :handle-image-load="(event) => handleProfileAssetVisualImageLoad(item, event)"
            :handle-image-error="(event) => handleProfileAssetVisualImageError(item, event)"
            :handle-image-retrying="(event) => handleProfileAssetVisualImageRetrying(item, event)"
          />
        </HomeInteractiveTarget>

        <view v-else class="home-profile-asset-entry is-placeholder" aria-hidden="true">
          <HomeRailProfileAssetCardShell
            :item="item"
            :image-url="''"
            phase="steady"
            :placeholder-icon="resolveProfileAssetPlaceholderIcon(item)"
            placeholder
          />
        </view>
      </template>
    </view>
    <view
      v-if="profileAssetBottomSpacerHeight > 0"
      class="home-profile-asset-window-spacer"
      :style="{ height: `${profileAssetBottomSpacerHeight}px` }"
      aria-hidden="true"
    />
    <HomeRailProfileFooterSection
      :should-render-footer="shouldRenderProfileBottomFooter"
      :footer-mode="profileBottomFooterMode"
      @retry="handleProfileAssetLoadMoreRetry"
    />
  </view>
</template>

<script setup lang="ts">
import { type ComponentPublicInstance, type CSSProperties } from 'vue'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { ProfileAssetRevealPhase } from '../../composables/profile/useProfileAssetVisualReveal'
import type { ResultWindowOverlayItem } from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeRailListLoadingFooterMode } from '../shared/homeRailListLoadingFooter.a11y'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import HomeRailProfileAssetCardShell from './HomeRailProfileAssetCardShell.vue'
import HomeRailProfileEmptyStateSection from './HomeRailProfileEmptyStateSection.vue'
import HomeRailProfileFooterSection from './HomeRailProfileFooterSection.vue'
import { createResolvedTemplateRefForwarder } from '../../../../utils/resolveTemplateRefElement.util'

interface Props {
  setProfileAssetResultsStageRef?: (element: Element | ComponentPublicInstance | null) => void
  shouldShowProfileFirstScreenLoading: boolean
  shouldShowProfileFirstScreenError: boolean
  shouldShowProfileFirstScreenEmpty: boolean
  displayedAssets: ProfileAssetItem[]
  mountedAssets: ProfileAssetItem[]
  profileAssetResultsStageStyle?: CSSProperties
  profileAssetRemovedOverlayItems: ResultWindowOverlayItem<ProfileAssetItem>[]
  profileAssetRemovedOverlayLayerStyle?: CSSProperties
  profileAssetTopSpacerHeight: number
  profileAssetBottomSpacerHeight: number
  shouldRenderProfileBottomFooter: boolean
  profileBottomFooterMode: HomeRailListLoadingFooterMode
  profileImageCacheUserScope?: string | null
  resolveProfileAssetRemovedOverlayItemStyle: (sourceIndex: number) => CSSProperties
  resolveProfileAssetImageUrl: (item: ProfileAssetItem) => string
  resolveProfileAssetRemovedOverlayRevealPhase: (item: ProfileAssetItem) => ProfileAssetRevealPhase
  resolveProfileAssetPlaceholderIcon: (item: ProfileAssetItem) => AetherIconName
  isProfileAssetPlaceholder: (itemId: string) => boolean
  resolveProfileAssetEntryClass: (itemId: string) => Record<string, boolean>
  resolveProfileAssetEntryStyle: (itemId: string, index: number) => CSSProperties
  resolveProfileAssetRevealPhase: (item: ProfileAssetItem) => ProfileAssetRevealPhase
  handleAssetClick: (item: ProfileAssetItem) => void
  handleProfileAssetVisualImageLoad: (item: ProfileAssetItem, event?: unknown) => void
  handleProfileAssetVisualImageError: (item: ProfileAssetItem, event?: unknown) => void
  handleProfileAssetVisualImageRetrying: (item: ProfileAssetItem, event?: unknown) => void
  handleProfileAssetFirstScreenRetry: () => void
  handleProfileAssetLoadMoreRetry: () => void
}

const props = withDefaults(defineProps<Props>(), {
  setProfileAssetResultsStageRef: undefined,
  profileAssetResultsStageStyle: () => ({}),
  profileAssetRemovedOverlayLayerStyle: () => ({}),
  profileImageCacheUserScope: null,
})

const assignProfileAssetResultsStageRef = createResolvedTemplateRefForwarder((element) => {
  props.setProfileAssetResultsStageRef?.(element)
})
</script>

<style lang="scss" scoped>
.home-profile-asset-grid {
  margin-top: 0;
  position: relative;
}

.home-profile-asset-window-spacer {
  width: 100%;
  pointer-events: none;
}

.home-profile-asset-grid-base {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 12px;
}

.home-profile-removed-overlay-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 20px 12px;
  grid-auto-rows: var(--home-profile-removed-overlay-row-height, 236px);
  pointer-events: none;
}

.home-profile-asset-entry {
  display: block;
  border-radius: var(--aether-surface-radius-sm, 12px);
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

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
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

.home-profile-asset-entry.is-entering .home-profile-asset-shell {
  animation: home-profile-asset-enter 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--home-profile-asset-entry-delay, 0ms);
}

.home-profile-asset-entry.is-replay-prep .home-profile-asset-shell {
  opacity: 0;
  animation: none;
}

.home-profile-asset-entry.is-replay-entering .home-profile-asset-shell {
  animation: home-profile-asset-enter 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--home-profile-asset-entry-delay, 0ms);
}

.home-profile-asset-entry.is-leaving .home-profile-asset-shell {
  animation: home-profile-asset-leave 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.home-profile-asset-entry.is-removed-overlay {
  pointer-events: none;
  z-index: 0;
}

.home-profile-asset-entry.is-entering,
.home-profile-asset-entry.is-replay-prep,
.home-profile-asset-entry.is-replay-entering,
.home-profile-asset-entry.is-leaving,
.home-profile-asset-entry.is-entering .home-profile-asset-shell,
.home-profile-asset-entry.is-replay-prep .home-profile-asset-shell,
.home-profile-asset-entry.is-replay-entering .home-profile-asset-shell,
.home-profile-asset-entry.is-leaving .home-profile-asset-shell,
.home-profile-asset-entry.is-entering .home-profile-asset-shell::before,
.home-profile-asset-entry.is-replay-prep .home-profile-asset-shell::before,
.home-profile-asset-entry.is-replay-entering .home-profile-asset-shell::before,
.home-profile-asset-entry.is-leaving .home-profile-asset-shell::before,
.home-profile-asset-entry.is-entering .home-profile-market-card-visual,
.home-profile-asset-entry.is-replay-prep .home-profile-market-card-visual,
.home-profile-asset-entry.is-replay-entering .home-profile-market-card-visual,
.home-profile-asset-entry.is-leaving .home-profile-market-card-visual {
  transition: none;
}

.home-profile-asset-shell::before {
  content: '';
  position: absolute;
  left: 0;
  top: var(--home-market-card-radius);
  bottom: var(--home-market-card-radius);
  width: var(--aether-entry-accent-line-width, 2px);
  background: var(--aether-entry-accent-line-color, #22d3ee);
  transform: translateX(-100%);
  opacity: 0;
  transition: var(--aether-entry-accent-line-transition, transform 180ms ease, opacity 180ms ease);
  z-index: 3;
  pointer-events: none;
  border-radius: 999px;
}

.home-profile-asset-entry.is-entry-active {
  transform: scale(var(--aether-entry-active-scale, 0.985));
}

.home-profile-asset-entry.is-entry-active .home-profile-asset-shell::before {
  transform: translateX(0);
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .home-profile-asset-entry:hover .home-profile-asset-shell::before {
    transform: translateX(0);
    opacity: 1;
  }
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
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.home-profile-asset-image-frame {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  overflow: hidden;
  --home-market-card-image-radius: 12px;
}

.home-profile-market-card-visual.tone-ink,
.home-profile-market-card-visual.tone-mist,
.home-profile-market-card-visual.tone-aqua,
.home-profile-market-card-visual.tone-sand {
  background: var(--aether-surface-primary, #ffffff);
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
  transition: transform 180ms ease;
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

@keyframes home-profile-asset-enter {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes home-profile-asset-leave {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>
