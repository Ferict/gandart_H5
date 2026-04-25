<!--
Responsibility: render the home rail main shell and assemble banner, featured, and market sections
with their page-local runtime adapters.
Out of scope: cross-page shared services, content-provider implementation details, and global shell
routing.
-->

<template>
  <view class="home-panel">
    <view class="home-panel-content">
      <HomeRailHomeBannerCarouselSection
        :home-banner-items="homeBannerItems"
        :is-scene-patch-motion-reduced="isHomeScenePatchMotionReduced"
        :is-banner-swiper-autoplay-enabled="isBannerSwiperAutoplayEnabled"
        :home-banner-placeholder-url="HOME_BANNER_PLACEHOLDER_URL"
        :banner-refresh-render-key="bannerRefreshRenderKey"
        :has-banner-remote-image="hasBannerRemoteImage"
        :resolve-banner-image-reveal-key="resolveBannerImageRevealKey"
        :is-banner-image-loaded="isBannerImageLoaded"
        :resolve-banner-image-url="resolveBannerImageUrl"
        @banner-click="handleBannerClick"
        @banner-image-load="handleBannerImageLoadFromSection"
        @banner-image-error="handleBannerImageErrorFromSection"
      />

      <HomeRailHomeNoticeBarSection
        :notice-bar="noticeBar"
        :home-announcement-items="homeAnnouncementItems"
        :notice-refresh-render-key="noticeRefreshRenderKey"
        :is-home-notice-live-reordering="isHomeNoticeLiveReordering"
        :is-home-notice-swiper-autoplay-enabled="isHomeNoticeSwiperAutoplayEnabled"
        @announcement-click="handleAnnouncementClick"
        @notice-swiper-change="handleNoticeSwiperChange"
      />

      <HomeRailHomeFeaturedSection
        :featured="bannerDrop"
        :is-scene-patch-motion-reduced="isHomeScenePatchMotionReduced"
        :featured-progress-style="featuredProgressStyle"
        :featured-refresh-render-key="featuredRefreshRenderKey"
        :featured-placeholder-icon="featuredPlaceholderIcon"
        :featured-image-url="resolveFeaturedImageUrl(bannerDrop)"
        :featured-image-phase="resolveFeaturedImagePresentationPhase()"
        :is-featured-image-loaded="isFeaturedImageLoaded"
        @activate="handleCollectionQuickEntryClick"
        @featured-image-load="
          handleHomeVisualImageLoad(
            'featured',
            bannerDrop.id,
            resolveFeaturedImageUrl(bannerDrop),
            $event
          )
        "
        @featured-image-error="
          handleHomeVisualImageError(
            'featured',
            bannerDrop.id,
            resolveFeaturedImageUrl(bannerDrop),
            $event
          )
        "
        @featured-image-retrying="
          handleHomeVisualImageRetrying(
            'featured',
            bannerDrop.id,
            resolveFeaturedImageUrl(bannerDrop),
            $event
          )
        "
      />

      <view class="home-market-stack">
        <HomeRailHomeMarketHeadSection
          :title="marketContent.sectionTitle"
          :subtitle="marketContent.sectionSubtitle"
          :is-market-search-active="isMarketSearchVisible || hasActiveMarketSearch"
          :market-search-action-label="marketSearchAction.label"
          :is-market-sort-popover-open="isMarketSortPopoverOpen"
          :market-sort-trigger-label="marketSortTriggerLabel"
          :market-sort-menu-options="marketSortMenuOptions"
          :market-sort-popover-placement="marketSortPopoverPlacement"
          :market-sort-direction="marketSortDirection"
          :set-market-sort-layer-ref="assignMarketSortLayerRef"
          :is-market-sort-option-active="isMarketSortOptionActive"
          :resolve-market-sort-option-aria-label="resolveMarketSortOptionAriaLabel"
          @market-search-click="handleMarketSearchClick"
          @market-sort-trigger-click="handleMarketSortTriggerClick"
          @market-sort-option-select="handleMarketSortOptionSelect"
        />

        <HomeRailHomeMarketTagSection
          :market-tags="marketTags"
          :active-market-tag-id="activeMarketTagId"
          :is-market-tag-left-fade-visible="isMarketTagLeftFadeVisible"
          @tag-scroll="handleMarketTagScroll"
          @tag-select="handleMarketTagSelect"
        />

        <HomeRailHomeMarketSearchSection
          :is-market-search-visible="isMarketSearchVisible"
          :has-active-market-search="hasActiveMarketSearch"
          :market-keyword="marketKeyword"
          @market-keyword-input="handleMarketKeywordInput"
          @market-keyword-clear="handleMarketKeywordClear"
          @search-before-enter="handleMarketSearchRevealBeforeEnter"
          @search-enter="handleMarketSearchRevealEnter"
          @search-after-enter="handleMarketSearchRevealAfterEnter"
          @search-before-leave="handleMarketSearchRevealBeforeLeave"
          @search-leave="handleMarketSearchRevealLeave"
          @search-after-leave="handleMarketSearchRevealAfterLeave"
        />

        <HomeRailHomeMarketResultsSection
          :set-market-results-stage-ref="assignMarketResultsStageRef"
          :set-market-results-content-ref="assignMarketResultsContentRef"
          :should-show-home-market-first-screen-loading="shouldShowHomeMarketFirstScreenLoading"
          :should-show-home-market-first-screen-error="shouldShowHomeMarketFirstScreenError"
          :should-show-home-market-first-screen-empty="shouldShowHomeMarketFirstScreenEmpty"
          :market-results-stage-style="marketResultsStageStyle"
          :market-removed-overlay-items="marketRemovedOverlayItems"
          :market-removed-overlay-layer-style="marketRemovedOverlayLayerStyle"
          :market-top-spacer-height="marketTopSpacerHeight"
          :market-bottom-spacer-height="marketBottomSpacerHeight"
          :mounted-market-items="mountedMarketItems"
          :has-more-market-items="hasMoreMarketItems"
          :should-render-home-bottom-footer="shouldRenderHomeBottomFooter"
          :home-bottom-footer-mode="homeBottomFooterMode"
          :market-card-fallback-text="HOME_MARKET_CARD_FALLBACK_TEXT"
          :resolve-market-removed-overlay-item-style="resolveMarketRemovedOverlayItemStyle"
          :resolve-market-image-url="resolveMarketImageUrl"
          :resolve-market-placeholder-icon="resolveMarketPlaceholderIcon"
          :resolve-market-removed-overlay-reveal-phase="resolveMarketRemovedOverlayRevealPhase"
          :has-market-image="hasMarketImage"
          :is-market-card-placeholder="isMarketCardPlaceholder"
          :resolve-market-card-entry-class="resolveMarketCardEntryClass"
          :resolve-market-card-entry-style="resolveMarketCardEntryStyle"
          :resolve-market-card-presentation-phase="resolveMarketCardPresentationPhase"
          :is-home-visual-image-reveal-ready="isHomeVisualImageRevealReady"
          :handle-collection-click="handleCollectionClick"
          :handle-home-visual-image-load="handleHomeVisualImageLoad"
          :handle-home-visual-image-error="handleHomeVisualImageError"
          :handle-home-visual-image-retrying="handleHomeVisualImageRetrying"
          :set-market-load-more-sentinel-ref="assignMarketLoadMoreSentinelRef"
          :handle-home-market-first-screen-retry="handleHomeMarketFirstScreenRetry"
          :handle-home-market-load-more-retry="handleHomeMarketLoadMoreRetry"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useHomeRailHomeContentState } from '../composables/home/useHomeRailHomeContentState'
import {
  HOME_BANNER_PLACEHOLDER_URL,
  HOME_MARKET_CARD_FALLBACK_TEXT,
} from '../composables/home/homeRailHomePanel.constants'
import { useHomeRailHomeNavigation } from '../composables/home/useHomeRailHomeNavigation'
import { useHomeRailHomePanelRuntime } from '../composables/home/useHomeRailHomePanelRuntime'
import { useHomeRailHomeRuntimeState } from '../composables/home/useHomeRailHomeRuntimeState'
import { useHomeRailHomeTemplateAdapters } from '../composables/home/useHomeRailHomeTemplateAdapters'
import HomeRailHomeBannerCarouselSection from './home/HomeRailHomeBannerCarouselSection.vue'
import HomeRailHomeFeaturedSection from './home/HomeRailHomeFeaturedSection.vue'
import HomeRailHomeMarketHeadSection from './home/HomeRailHomeMarketHeadSection.vue'
import HomeRailHomeMarketResultsSection from './home/HomeRailHomeMarketResultsSection.vue'
import HomeRailHomeMarketSearchSection from './home/HomeRailHomeMarketSearchSection.vue'
import HomeRailHomeMarketTagSection from './home/HomeRailHomeMarketTagSection.vue'
import HomeRailHomeNoticeBarSection from './home/HomeRailHomeNoticeBarSection.vue'
import { type ResultMountScrollMetrics } from '../../../services/home-rail/homeRailResultMountWindow.service'
interface Props {
  canOpenDrawer?: boolean
  isActive?: boolean
  mountScrollMetrics?: ResultMountScrollMetrics | null
}

const props = withDefaults(defineProps<Props>(), {
  canOpenDrawer: false,
  isActive: true,
  mountScrollMetrics: null,
})

const emit = defineEmits<{
  openDrawer: []
  bannerClick: []
  announcementClick: []
  marketSearchClick: []
  marketSortClick: []
  marketTagSelect: [tag: string, index: number]
  collectionClick: [id: string]
}>()

const homePanelActiveProp = computed(() => props.isActive)
const homeMountScrollMetricsProp = computed(() => props.mountScrollMetrics)

const homeRailHomeContentState = useHomeRailHomeContentState()
const {
  noticeBar,
  homeBannerItems,
  bannerDrop,
  marketContent,
  marketTags,
  activeAnnouncementIndex,
  homeAnnouncementItems,
  activeAnnouncement,
  markAnnouncementAsReadLocally,
} = homeRailHomeContentState

const homeRailHomeRuntimeState = useHomeRailHomeRuntimeState({
  isActive: homePanelActiveProp,
})
const { noticeRefreshRenderKey, bannerRefreshRenderKey, featuredRefreshRenderKey } =
  homeRailHomeRuntimeState

const {
  isHomeNoticeLiveReordering,
  isHomeScenePatchMotionReduced,
  marketSortTriggerLabel,
  marketSortMenuOptions,
  marketSortPopoverPlacement,
  marketSortLayerRef,
  isMarketSortPopoverOpen,
  marketSortDirection,
  marketKeyword,
  isMarketSearchVisible,
  activeMarketTagId,
  hasActiveMarketSearch,
  isMarketSortOptionActive,
  resolveMarketSortOptionAriaLabel,
  handleMarketSearchClick,
  handleMarketSearchRevealBeforeEnter,
  handleMarketSearchRevealEnter,
  handleMarketSearchRevealAfterEnter,
  handleMarketSearchRevealBeforeLeave,
  handleMarketSearchRevealLeave,
  handleMarketSearchRevealAfterLeave,
  handleMarketSortTriggerClick,
  handleMarketSortOptionSelect,
  handleMarketTagSelect,
  handleMarketKeywordInput,
  handleMarketKeywordClear,
  handleHomeMarketFirstScreenRetry,
  handleHomeMarketLoadMoreRetry,
  isMarketTagLeftFadeVisible,
  handleMarketTagScroll,
  isBannerSwiperAutoplayEnabled,
  isHomeNoticeSwiperAutoplayEnabled,
  marketSearchAction,
  featuredPlaceholderIcon,
  resolveMarketPlaceholderIcon,
  hasBannerRemoteImage,
  resolveMarketRemovedOverlayItemStyle,
  resolveMarketRemovedOverlayRevealPhase,
  featuredProgressStyle,
  shouldShowHomeMarketFirstScreenLoading,
  shouldShowHomeMarketFirstScreenError,
  shouldShowHomeMarketFirstScreenEmpty,
  shouldRenderHomeBottomFooter,
  homeBottomFooterMode,
  isMarketCardPlaceholder,
  resolveMarketCardEntryClass,
  resolveMarketCardEntryStyle,
  mountedMarketItems,
  marketRemovedOverlayItems,
  marketResultsStageRef,
  marketResultsContentRef,
  marketLoadMoreSentinelRef,
  marketTopSpacerHeight,
  marketBottomSpacerHeight,
  hasMoreMarketItems,
  marketResultsStageStyle,
  marketRemovedOverlayLayerStyle,
  resolveBannerImageUrl,
  resolveFeaturedImageUrl,
  resolveMarketImageUrl,
  hasMarketImage,
  resolveBannerImageRevealKey,
  isBannerImageLoaded,
  isFeaturedImageLoaded,
  resolveFeaturedImagePresentationPhase,
  isHomeVisualImageRevealReady,
  handleHomeVisualImageLoad,
  handleHomeVisualImageError,
  handleHomeVisualImageRetrying,
  resolveMarketCardPresentationPhase,
  refreshContent,
  waitForRefreshPresentation,
} = useHomeRailHomePanelRuntime({
  contentState: homeRailHomeContentState,
  runtimeState: homeRailHomeRuntimeState,
  isHomePanelActive: homePanelActiveProp,
  mountScrollMetrics: homeMountScrollMetricsProp,
  emitMarketSearchClick: () => emit('marketSearchClick'),
  emitMarketSortClick: () => emit('marketSortClick'),
  emitMarketTagSelect: (tag, index) => emit('marketTagSelect', tag, index),
})

const {
  assignMarketSortLayerRef,
  assignMarketLoadMoreSentinelRef,
  assignMarketResultsStageRef,
  assignMarketResultsContentRef,
  handleBannerImageLoadFromSection,
  handleBannerImageErrorFromSection,
} = useHomeRailHomeTemplateAdapters({
  marketSortLayerRef,
  marketLoadMoreSentinelRef,
  marketResultsStageRef,
  marketResultsContentRef,
  resolveBannerImageUrl,
  handleHomeVisualImageLoad,
  handleHomeVisualImageError,
})

const {
  handleNoticeSwiperChange,
  handleBannerClick,
  handleAnnouncementClick,
  handleCollectionQuickEntryClick,
  handleCollectionClick,
} = useHomeRailHomeNavigation({
  activeAnnouncement,
  bannerDrop,
  isMarketSortPopoverOpen,
  emitBannerClick: () => emit('bannerClick'),
  emitAnnouncementClick: () => emit('announcementClick'),
  emitCollectionClick: (id) => emit('collectionClick', id),
  markAnnouncementAsReadLocally,
  setActiveAnnouncementIndex: (index) => {
    activeAnnouncementIndex.value = index
  },
})

defineExpose({
  refreshContent,
  waitForRefreshPresentation,
})
</script>

<style lang="scss" scoped>
.home-panel {
  display: flex;
  flex-direction: column;
  padding: 0 var(--home-page-inline-padding, 16px);
  box-sizing: border-box;
  background: transparent;
  --home-main-module-gap: 32px;
}

.home-panel-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.home-banner-carousel + .home-notice-hit {
  margin-top: 12px;
}

.home-notice-hit + .home-featured-layout {
  margin-top: var(--home-main-module-gap);
}

.home-featured-layout + .home-market-stack {
  margin-top: var(--home-main-module-gap);
}

.is-entry-active {
  transform: scale(var(--aether-entry-active-scale, 0.985));
}

.home-banner-entry,
.home-notice-hit,
.home-featured-info-card,
.home-featured-visual,
.home-market-action-entry,
.home-market-tag-entry,
.home-market-card-entry {
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

@media (hover: hover) and (pointer: fine) {
  .home-banner-entry:hover,
  .home-featured-info-card:hover,
  .home-featured-visual:hover,
  .home-market-card-entry:hover {
    transform: translateY(var(--aether-entry-hover-lift-y, -2px));
  }

  .home-notice-hit:hover,
  .home-market-action-entry:hover,
  .home-market-tag-entry:hover {
    transform: translateY(-1px);
  }

  .home-notice-hit:hover .home-notice-bar {
    filter: brightness(0.985);
  }

  .home-market-action-entry:hover .home-market-action-icon {
    color: #475569;
  }

  .home-market-sort-option:hover .home-market-sort-option-shell {
    background: #ffffff;
    box-shadow: var(--aether-shadow-soft-xs, 0 0 16px rgba(15, 23, 42, 0.04));
  }

  .home-market-tag-entry:hover .home-market-tag-text {
    color: #64748b;
  }
}

.home-banner-carousel {
  position: relative;
  width: calc(100% + (var(--home-page-inline-padding, 16px) * 2));
  margin-left: calc(var(--home-page-inline-padding, 16px) * -1);
  overflow: hidden;
}

.home-banner-ratio-shell {
  position: relative;
  width: calc(100% - (var(--home-page-inline-padding, 16px) * 2));
  margin: 0 auto;
  overflow: visible;
}

.home-banner-ratio-shell::before {
  content: '';
  display: block;
  padding-top: 48.9796%;
}

.home-banner-swiper {
  position: absolute;
  inset: 0 auto 0 calc(var(--home-page-inline-padding, 16px) * -1);
  width: calc(100% + (var(--home-page-inline-padding, 16px) * 2));
  height: 100%;
}

.home-banner-slide-shell {
  width: 100%;
  height: 100%;
  padding: 0 var(--home-page-inline-padding, 16px);
  box-sizing: border-box;
}

.home-banner-entry {
  position: relative;
  height: 100%;
  min-height: 0;
  border-radius: 0;
  overflow: visible;
  background: transparent;
  color: #ffffff;
  padding: 0;
  box-sizing: border-box;
  display: block;
  transition: transform 180ms ease;
}

.home-banner-entry-media {
  padding: 0;
  display: block;
}

.home-banner-shell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 12px;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
  --home-market-card-image-radius: 12px;
  --home-market-card-material-base-bg: transparent;
  --home-market-card-material-fallback-bg: transparent;
  --home-market-card-placeholder-icon-color: transparent;
  --home-market-card-fallback-text-color: rgba(226, 232, 240, 0.88);
}

.home-banner-shell.tone-dawn {
  background: #101726;
}

.home-banner-shell.tone-azure {
  background: #0f1f2e;
}

.home-banner-shell.tone-ember {
  background: #1f2530;
}

.home-banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  background-color: #111111;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
  pointer-events: none;
}

.home-banner-bg-remote {
  opacity: 0;
  transition: opacity 220ms ease;
}

.home-banner-bg-remote.is-loaded {
  opacity: 1;
}

.home-banner-placeholder-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.home-banner-image-reveal {
  position: absolute;
  inset: 0;
}

.home-banner-image-preload {
  position: absolute;
  width: 1px;
  height: 1px;
  opacity: 0;
  pointer-events: none;
}

.home-notice-hit {
  position: relative;
  min-height: 44px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  overflow: visible;
}

.home-notice-bar {
  width: 100%;
  min-height: 40px;
  border-radius: 12px;
  background: #f2f4f7;
  box-shadow: none;
  overflow: hidden;
  padding: 0 var(--home-page-inline-padding, 16px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 4px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.home-notice-bell-icon {
  color: #06b6d4;
  flex-shrink: 0;
}

.home-notice-copy {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.home-notice-swiper {
  flex: 1 1 auto;
  min-width: 0;
  height: 40px;
  width: 100%;
}

.home-notice-swiper.is-live-reordering {
  animation: home-notice-live-reordering 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.home-notice-swiper-item {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.home-notice-label {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 20px;
  font-weight: 800;
  color: #1f2937;
}

.home-notice-badge {
  --home-notice-badge-width: 32px;
  --home-notice-badge-height: var(--aether-badge-height, 16px);

  width: var(--home-notice-badge-width);
  min-width: var(--home-notice-badge-width);
  height: var(--home-notice-badge-height);
  padding: 0;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.home-notice-badge-copy {
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-notice-badge-text {
  display: block;
  font-size: 10px;
  line-height: 10px;
  letter-spacing: 0.04em;
  font-weight: 800;
  font-family: inherit;
}

.home-notice-title {
  min-width: 0;
  width: 100%;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

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
  background-color: #f4f5f7;
  background-image: linear-gradient(
    135deg,
    rgba(34, 211, 238, 0.045) 0%,
    rgba(34, 211, 238, 0.015) 26%,
    rgba(34, 211, 238, 0) 48%
  );
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
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

.home-notice-hit.is-entry-active .home-notice-bar {
  transform: translateY(1px);
  filter: brightness(0.985);
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

.home-featured-cover {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  z-index: 1;
  opacity: 0;
  transition: opacity 220ms ease;
}

.home-featured-cover.is-loaded {
  opacity: 1;
}

.home-featured-placeholder-icon {
  color: #cbd5e1;
}

.home-featured-id {
  position: absolute;
  right: 8px;
  bottom: 8px;
  color: #cbd5e1;
}

.home-market-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.home-market-tag-scroll {
  width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.home-market-tag-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 8px 4px;
  margin: -8px -4px;
  box-sizing: border-box;
}

.home-market-tag-scroll {
  position: relative;
  z-index: 1;
}

.home-market-tag-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.home-market-tag-track {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  width: max-content;
  min-width: auto;
  padding: 0;
  box-sizing: border-box;
}

.home-market-tag-entry {
  position: relative;
  z-index: 1;
  flex: 0 0 auto;
  min-width: 0;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  overflow: visible;
  transition:
    transform 180ms ease,
    filter 180ms ease;
}

.home-market-tag-pill {
  position: relative;
  z-index: 1;
  min-height: 28px;
  padding: 0 12px;
  border-radius: 999px;
  background: #f2f4f7;
  box-shadow: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease;
}

.home-market-tag-pill::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: #111111;
  opacity: 0;
  transition: opacity 180ms ease;
  pointer-events: none;
  z-index: 0;
}

.home-market-tag-text {
  position: relative;
  z-index: 1;
  min-height: 16px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: auto;
  max-width: calc(4 * 12px);
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: #9ca3af;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 160ms ease;
}

.home-market-tag-fade-left,
.home-market-tag-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 28px;
  z-index: 2;
  pointer-events: none;
  opacity: 1;
  transition: opacity 160ms ease;
}

.home-market-tag-fade-left {
  left: 0;
  background: linear-gradient(
    90deg,
    var(--aether-panel-background, #ffffff) 0%,
    rgba(255, 255, 255, 0) 100%
  );
  opacity: 0;
}

.home-market-tag-fade-right {
  right: 0;
  background: linear-gradient(
    270deg,
    var(--aether-panel-background, #ffffff) 0%,
    rgba(255, 255, 255, 0) 100%
  );
}

.home-market-tag-wrap.has-left-fade .home-market-tag-fade-left {
  opacity: 1;
}

.home-market-search-stage {
  display: block;
}

.home-market-search-stage-body {
  min-height: 0;
  overflow: visible;
}

.home-market-search-card {
  opacity: 1;
  transform: translateY(0);
}

.home-market-search-shell {
  min-height: var(--aether-search-shell-height, 48px);
  border-radius: var(--aether-search-shell-radius, 12px);
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft-xs, 0 0 16px rgba(15, 23, 42, 0.04));
  padding: 0 var(--aether-search-shell-inline-padding, 12px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--aether-search-shell-gap, 8px);
}

.home-market-search-icon {
  flex-shrink: 0;
  color: #94a3b8;
}

.home-market-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: var(--aether-search-shell-height, 48px);
  font-size: 14px;
  line-height: 20px;
  color: #111111;
}

.home-market-search-clear {
  width: 24px;
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.home-market-search-clear-icon {
  color: #94a3b8;
}

.home-market-tag-entry.is-active .home-market-tag-text {
  color: #ffffff;
}

.home-market-tag-entry.is-active .home-market-tag-pill {
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: none;
}

.home-market-tag-entry.is-active .home-market-tag-pill::before {
  opacity: 1;
}

@media (hover: hover) and (pointer: fine) {
  .home-market-tag-entry:not(.is-active):hover .home-market-tag-text {
    color: #64748b;
  }

  .home-market-tag-entry:not(.is-active):hover .home-market-tag-pill {
    background: #eceff3;
  }
}

.home-market-search-reveal-enter-active,
.home-market-search-reveal-leave-active {
  overflow: hidden;
}

.home-market-search-reveal-enter-active .home-market-search-card,
.home-market-search-reveal-leave-active .home-market-search-card {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.home-market-search-reveal-enter-active .home-market-search-card {
  transition-delay: 0ms;
}

.home-market-search-reveal-leave-active .home-market-search-card {
  transition-delay: 0ms;
}

.home-market-search-reveal-enter-from .home-market-search-card,
.home-market-search-reveal-leave-to .home-market-search-card {
  opacity: 0;
  transform: translateY(-4px);
}

.home-market-search-reveal-enter-to .home-market-search-card,
.home-market-search-reveal-leave-from .home-market-search-card {
  opacity: 1;
  transform: translateY(0);
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

@keyframes home-notice-live-reordering {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.home-safe-mini-text {
  display: inline-block;
  min-width: 0;
  font-size: 12px;
  line-height: 12px;
  transform-origin: center center;
  vertical-align: top;
}

.home-safe-mini-text-10 {
  transform: scale(0.8333);
}

.home-safe-mini-text-9 {
  transform: scale(0.75);
}

.home-safe-mini-text-8 {
  transform: scale(0.6667);
}

.home-featured-id,
.home-market-subtitle,
.home-market-card-id {
  font-family: var(--aether-font-system, system-ui, sans-serif);
}
</style>
