<!--
Responsibility: render the home rail main shell and assemble banner, featured, and market sections
with their page-local runtime adapters.
Out of scope: cross-page shared services, content-provider implementation details, and global shell
routing.
-->

<template>
  <view class="home-panel">
    <view class="home-panel-content">
      <HomeRailTopbar :can-open-drawer="props.canOpenDrawer" @open-drawer="emit('openDrawer')" />

      <HomeRailHomeRefreshSlot :state="props.refreshSlotState" />

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
        <view id="market-sticky-sentinel" class="home-market-sticky-sentinel" aria-hidden="true" />
        <view class="home-market-sticky-header" :class="{ 'is-stuck': isMarketStickyHeaderStuck }">
          <HomeRailHomeMarketHeadSection
            :title="marketContent.sectionTitle"
            :subtitle="marketContent.sectionSubtitle"
            :market-kind-options="marketKindOptions"
            :active-market-kind="activeMarketKind"
            @market-kind-select="handleMarketKindSelect"
          />

          <HomeRailHomeMarketTagSection
            :market-tags="marketTags"
            :active-market-tag-id="activeMarketTagId"
            :is-market-search-active="isMarketSearchVisible || hasActiveMarketSearch"
            :market-search-action-label="marketSearchAction.label"
            @tag-select="handleMarketTagSelect"
            @market-search-click="handleMarketSearchClick"
          />
        </view>

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
import { computed, getCurrentInstance, onBeforeUnmount, onMounted, ref } from 'vue'
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
import HomeRailHomeRefreshSlot from './home/HomeRailHomeRefreshSlot.vue'
import HomeRailTopbar from './shared/HomeRailTopbar.vue'
import { type ResultMountScrollMetrics } from '../../../services/home-rail/homeRailResultMountWindow.service'
import type { HomeTrackRefreshSlotState } from '../composables/home/useHomeTrackRefreshController'
interface Props {
  canOpenDrawer?: boolean
  isActive?: boolean
  mountScrollMetrics?: ResultMountScrollMetrics | null
  refreshSlotState?: HomeTrackRefreshSlotState | null
}

const props = withDefaults(defineProps<Props>(), {
  canOpenDrawer: false,
  isActive: true,
  mountScrollMetrics: null,
  refreshSlotState: null,
})

const emit = defineEmits<{
  openDrawer: []
  bannerClick: []
  announcementClick: []
  marketSearchClick: []
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
  activeMarketKind,
  marketKindOptions,
  marketTags,
  marketKeyword,
  isMarketSearchVisible,
  activeMarketTagId,
  hasActiveMarketSearch,
  handleMarketSearchClick,
  handleMarketSearchRevealBeforeEnter,
  handleMarketSearchRevealEnter,
  handleMarketSearchRevealAfterEnter,
  handleMarketSearchRevealBeforeLeave,
  handleMarketSearchRevealLeave,
  handleMarketSearchRevealAfterLeave,
  handleMarketKindSelect,
  handleMarketTagSelect,
  handleMarketKeywordInput,
  handleMarketKeywordClear,
  handleHomeMarketFirstScreenRetry,
  handleHomeMarketLoadMoreRetry,
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
  emitMarketTagSelect: (tag, index) => emit('marketTagSelect', tag, index),
})

const {
  assignMarketLoadMoreSentinelRef,
  assignMarketResultsStageRef,
  assignMarketResultsContentRef,
  handleBannerImageLoadFromSection,
  handleBannerImageErrorFromSection,
} = useHomeRailHomeTemplateAdapters({
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

const isMarketStickyHeaderStuck = ref(false)
const homePanelComponentInstance = getCurrentInstance()
let marketStickyObserver: ReturnType<typeof uni.createIntersectionObserver> | null = null

onMounted(() => {
  marketStickyObserver = uni.createIntersectionObserver(homePanelComponentInstance?.proxy as never)
  marketStickyObserver
    .relativeToViewport({ top: -12 })
    .observe('#market-sticky-sentinel', (res) => {
      isMarketStickyHeaderStuck.value = !(res.intersectionRatio > 0)
    })
})

onBeforeUnmount(() => {
  marketStickyObserver?.disconnect()
  marketStickyObserver = null
})
</script>

<style lang="scss" scoped>
.home-panel {
  display: flex;
  flex-direction: column;
  width: 100%;
  min-width: 0;
  padding: 0 var(--home-page-inline-padding, 16px);
  background: transparent;
  box-sizing: border-box;
  overflow: visible;
  --home-main-module-gap: 32px;
}

.home-panel-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
  overflow: visible;
}

.home-panel-content > :deep(.home-topbar) {
  margin: 0 calc(var(--home-page-inline-padding, 16px) * -1);
}

.home-banner-carousel + .home-notice-hit {
  margin-top: 12px;
}

.home-notice-hit + .home-featured-layout,
.home-featured-layout + .home-market-stack {
  margin-top: var(--home-main-module-gap);
}

.home-market-stack {
  display: flex;
  min-width: 0;
  flex-direction: column;
  gap: 16px;
  overflow: visible;
}

.home-market-sticky-sentinel {
  height: 1px;
  width: 100%;
  margin: 0;
  padding: 0;
  pointer-events: none;
}

.home-market-sticky-header {
  position: sticky;
  top: 0;
  z-index: 8;
  width: calc(100% + (var(--home-page-inline-padding, 16px) * 2));
  margin: -12px calc(var(--home-page-inline-padding, 16px) * -1);
  padding: calc(var(--app-safe-area-top, 0px) + 12px) var(--home-page-inline-padding, 16px) 12px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  background: var(--aether-page-background, #fafafa);
  box-sizing: border-box;
  overflow: visible;

  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    height: 1px;
    background: var(--aether-border-subtle, #dce6ef);
    opacity: 0;
    pointer-events: none;
    transition: opacity 180ms ease;
  }

  &.is-stuck::after {
    opacity: 1;
  }
}
</style>
