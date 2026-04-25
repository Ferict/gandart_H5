<!--
Responsibility: render the home rail market results shell, including first-screen state
routing, result stage refs, removed overlay, mounted window output, and footer wiring.
Out of scope: market query execution, result-window timing logic, and card image runtime.
-->
<template>
  <HomeRailHomeMarketStateSection
    :should-show-loading="shouldShowHomeMarketFirstScreenLoading"
    :should-show-error="shouldShowHomeMarketFirstScreenError"
    :should-show-empty="shouldShowHomeMarketFirstScreenEmpty"
    @retry="handleHomeMarketFirstScreenRetry"
  />

  <view
    v-if="
      !shouldShowHomeMarketFirstScreenLoading &&
      !shouldShowHomeMarketFirstScreenError &&
      !shouldShowHomeMarketFirstScreenEmpty
    "
    :ref="assignMarketResultsStageRef"
    class="home-market-results-stage"
    :style="marketResultsStageStyle"
  >
    <view
      v-if="marketRemovedOverlayItems.length"
      class="home-market-removed-overlay-layer"
      :style="marketRemovedOverlayLayerStyle"
    >
      <view
        v-for="(overlayItem, overlayIndex) in marketRemovedOverlayItems"
        :key="`removed::${overlayItem.id}::${overlayIndex}`"
        class="home-market-card-entry is-leaving is-removed-overlay"
        :style="resolveMarketRemovedOverlayItemStyle(overlayItem.sourceIndex)"
        aria-hidden="true"
      >
        <HomeRailHomeMarketCardShell
          :item="overlayItem.item"
          :image-url="resolveMarketImageUrl(overlayItem.item)"
          :placeholder-icon="
            resolveMarketPlaceholderIcon(overlayItem.item, overlayItem.sourceIndex)
          "
          :phase="resolveMarketRemovedOverlayRevealPhase(overlayItem.item)"
          :fallback-text="hasMarketImage(overlayItem.item) ? marketCardFallbackText : ''"
          :lazy-load="false"
        />
      </view>
    </view>

    <view :ref="assignMarketResultsContentRef" class="home-market-results-content">
      <view
        v-if="marketTopSpacerHeight > 0"
        class="home-market-results-spacer"
        :style="{ height: `${marketTopSpacerHeight}px` }"
        aria-hidden="true"
      />
      <view class="home-market-grid">
        <template v-for="(item, index) in mountedMarketItems" :key="item.id">
          <HomeInteractiveTarget
            v-if="!isMarketCardPlaceholder(item.id)"
            class="home-market-card-entry"
            :class="resolveMarketCardEntryClass(item.id)"
            :style="resolveMarketCardEntryStyle(item.id, index)"
            :label="`查看 ${item.name}`"
            @activate="handleCollectionClick(item)"
          >
            <HomeRailHomeMarketCardShell
              :item="item"
              :image-url="resolveMarketImageUrl(item)"
              :placeholder-icon="resolveMarketPlaceholderIcon(item, index)"
              :phase="resolveMarketCardPresentationPhase(item)"
              :fallback-text="hasMarketImage(item) ? marketCardFallbackText : ''"
              :lazy-load="
                !isHomeVisualImageRevealReady('market', item.id, resolveMarketImageUrl(item))
              "
              :handle-image-load="
                (event) =>
                  handleHomeVisualImageLoad('market', item.id, resolveMarketImageUrl(item), event)
              "
              :handle-image-error="
                (event) =>
                  handleHomeVisualImageError('market', item.id, resolveMarketImageUrl(item), event)
              "
              :handle-image-retrying="
                (event) =>
                  handleHomeVisualImageRetrying(
                    'market',
                    item.id,
                    resolveMarketImageUrl(item),
                    event
                  )
              "
            />
          </HomeInteractiveTarget>

          <view v-else class="home-market-card-entry is-placeholder" aria-hidden="true">
            <HomeRailHomeMarketCardShell
              :item="item"
              :image-url="''"
              :placeholder-icon="resolveMarketPlaceholderIcon(item, index)"
              phase="steady"
              fallback-text=""
              placeholder
            />
          </view>
        </template>
      </view>

      <view
        v-if="marketBottomSpacerHeight > 0"
        class="home-market-results-spacer"
        :style="{ height: `${marketBottomSpacerHeight}px` }"
        aria-hidden="true"
      />

      <HomeRailHomeMarketFooterSection
        :has-more-market-items="hasMoreMarketItems"
        :should-render-home-bottom-footer="shouldRenderHomeBottomFooter"
        :footer-mode="homeBottomFooterMode"
        :set-market-load-more-sentinel-ref="assignMarketLoadMoreSentinelRef"
        @retry="handleHomeMarketLoadMoreRetry"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { type ComponentPublicInstance, type CSSProperties } from 'vue'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type { HomeMarketCard } from '../../../../models/home-rail/homeRailHome.model'
import type { ResultWindowOverlayItem } from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeRailListLoadingFooterMode } from '../shared/homeRailListLoadingFooter.a11y'
import type { MarketCardRevealPhase } from '../../composables/home/useHomeHomeVisualReveal'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import HomeRailHomeMarketCardShell from './HomeRailHomeMarketCardShell.vue'
import HomeRailHomeMarketFooterSection from './HomeRailHomeMarketFooterSection.vue'
import HomeRailHomeMarketStateSection from './HomeRailHomeMarketStateSection.vue'
import { createResolvedTemplateRefForwarder } from '../../../../utils/resolveTemplateRefElement.util'

interface Props {
  setMarketResultsStageRef?: (element: Element | ComponentPublicInstance | null) => void
  setMarketResultsContentRef?: (element: Element | ComponentPublicInstance | null) => void
  shouldShowHomeMarketFirstScreenLoading: boolean
  shouldShowHomeMarketFirstScreenError: boolean
  shouldShowHomeMarketFirstScreenEmpty: boolean
  marketResultsStageStyle?: CSSProperties
  marketRemovedOverlayItems: ResultWindowOverlayItem<HomeMarketCard>[]
  marketRemovedOverlayLayerStyle?: CSSProperties
  marketTopSpacerHeight: number
  marketBottomSpacerHeight: number
  mountedMarketItems: HomeMarketCard[]
  hasMoreMarketItems: boolean
  shouldRenderHomeBottomFooter: boolean
  homeBottomFooterMode: HomeRailListLoadingFooterMode
  marketCardFallbackText: string
  resolveMarketRemovedOverlayItemStyle: (sourceIndex: number) => CSSProperties
  resolveMarketImageUrl: (item: HomeMarketCard) => string
  resolveMarketPlaceholderIcon: (item: HomeMarketCard, index: number) => AetherIconName
  resolveMarketRemovedOverlayRevealPhase: (item: HomeMarketCard) => MarketCardRevealPhase
  hasMarketImage: (item: HomeMarketCard) => boolean
  isMarketCardPlaceholder: (itemId: string) => boolean
  resolveMarketCardEntryClass: (itemId: string) => Record<string, boolean>
  resolveMarketCardEntryStyle: (itemId: string, index: number) => CSSProperties
  resolveMarketCardPresentationPhase: (item: HomeMarketCard) => MarketCardRevealPhase
  isHomeVisualImageRevealReady: (scope: 'market', resourceId: string, imageUrl: string) => boolean
  handleCollectionClick: (item: HomeMarketCard) => void
  handleHomeVisualImageLoad: (
    scope: 'market',
    resourceId: string,
    imageUrl: string,
    payload?: unknown
  ) => void
  handleHomeVisualImageError: (
    scope: 'market',
    resourceId: string,
    imageUrl: string,
    payload?: unknown
  ) => void
  handleHomeVisualImageRetrying: (
    scope: 'market',
    resourceId: string,
    imageUrl: string,
    payload?: unknown
  ) => void
  setMarketLoadMoreSentinelRef?: (element: HTMLElement | null) => void
  handleHomeMarketFirstScreenRetry: () => void
  handleHomeMarketLoadMoreRetry: () => void
}

const props = withDefaults(defineProps<Props>(), {
  setMarketResultsStageRef: undefined,
  setMarketResultsContentRef: undefined,
  marketResultsStageStyle: () => ({}),
  marketRemovedOverlayLayerStyle: () => ({}),
  setMarketLoadMoreSentinelRef: undefined,
})

const assignMarketResultsStageRef = createResolvedTemplateRefForwarder((element) => {
  props.setMarketResultsStageRef?.(element)
})

const assignMarketResultsContentRef = createResolvedTemplateRefForwarder((element) => {
  props.setMarketResultsContentRef?.(element)
})

const assignMarketLoadMoreSentinelRef = (element: HTMLElement | null) => {
  props.setMarketLoadMoreSentinelRef?.(element)
}
</script>

<style lang="scss" scoped>
.home-market-results-stage {
  position: relative;
  min-width: 0;
  overflow: visible;
  overflow-anchor: none;
}

.home-market-results-content {
  position: relative;
  z-index: 1;
  min-width: 0;
}

.home-market-results-spacer {
  width: 100%;
  pointer-events: none;
}

.home-market-removed-overlay-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  grid-auto-rows: var(--home-market-removed-overlay-row-height, 236px);
  pointer-events: none;
}

.home-market-card-entry.is-removed-overlay {
  pointer-events: none;
  z-index: 0;
}

.home-market-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.home-market-card-entry {
  position: relative;
  min-width: 0;
  min-height: 44px;
  border-radius: var(--aether-surface-radius-sm, 12px);
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

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
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

.home-market-card-entry.is-entering .home-market-card-shell {
  animation: home-market-card-enter 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--home-market-card-entry-delay, 0ms);
}

.home-market-card-entry.is-replay-prep .home-market-card-shell {
  opacity: 0;
  animation: none;
}

.home-market-card-entry.is-replay-entering .home-market-card-shell {
  animation: home-market-card-enter 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--home-market-card-entry-delay, 0ms);
}

.home-market-card-entry.is-leaving .home-market-card-shell {
  animation: home-market-card-leave 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.home-market-card-entry.is-entering,
.home-market-card-entry.is-replay-prep,
.home-market-card-entry.is-replay-entering,
.home-market-card-entry.is-leaving,
.home-market-card-entry.is-entering .home-market-card-shell,
.home-market-card-entry.is-replay-prep .home-market-card-shell,
.home-market-card-entry.is-replay-entering .home-market-card-shell,
.home-market-card-entry.is-leaving .home-market-card-shell,
.home-market-card-entry.is-entering .home-market-card-shell::before,
.home-market-card-entry.is-replay-prep .home-market-card-shell::before,
.home-market-card-entry.is-replay-entering .home-market-card-shell::before,
.home-market-card-entry.is-leaving .home-market-card-shell::before,
.home-market-card-entry.is-entering .home-market-card-visual,
.home-market-card-entry.is-replay-prep .home-market-card-visual,
.home-market-card-entry.is-replay-entering .home-market-card-visual,
.home-market-card-entry.is-leaving .home-market-card-visual {
  transition: none;
}

.home-market-card-shell::before {
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

.home-market-card-entry.is-entry-active {
  transform: scale(var(--aether-entry-active-scale, 0.985));
}

.home-market-card-entry.is-entry-active .home-market-card-shell::before {
  transform: translateX(0);
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .home-market-card-entry:hover {
    transform: translateY(var(--aether-entry-hover-lift-y, -2px));
  }

  .home-market-card-entry:hover .home-market-card-shell::before {
    transform: translateX(0);
    opacity: 1;
  }
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
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
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
  transition: transform 180ms ease;
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

@keyframes home-market-card-enter {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes home-market-card-leave {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>
