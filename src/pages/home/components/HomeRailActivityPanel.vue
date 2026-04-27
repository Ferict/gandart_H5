<!--
Responsibility: assemble the activity rail page shell, including activity header,
entry highlights, notice results, and page-local runtime wiring.
Out of scope: shared services, content provider implementation, and global shell
or routing policy.
-->
<template>
  <view class="home-activity-panel">
    <view class="home-activity-header">
      <view class="home-activity-header-title-group">
        <text class="home-activity-header-title">发现活动</text>
        <text class="home-activity-header-subtitle">EVENTS</text>
      </view>
    </view>

    <view class="home-activity-content">
      <HomeRailActivityEntryHighlightsSection
        :asset-merge-entry="assetMergeEntry"
        :priority-draw-entry="priorityDrawEntry"
        :network-invite-entry="networkInviteEntry"
        :is-activity-scene-patch-motion-reduced="isActivityScenePatchMotionReduced"
        @entry-click="handleEntryClick"
      />

      <view class="home-activity-notice-stack">
        <HomeRailActivityNoticeHeadSection
          title="系统公告"
          subtitle="UPDATES"
          :is-notice-search-visible="isNoticeSearchVisible"
          :has-active-notice-search="hasActiveNoticeSearch"
          @notice-search-toggle="handleNoticeSearchToggle"
        />

        <HomeRailActivityTagSection
          :tags="noticeTags"
          :active-tag="activeTag"
          :is-left-fade-visible="isNoticeTagLeftFadeVisible"
          :is-indicator-ready="isNoticeTagIndicatorReady"
          :indicator-style="noticeTagIndicatorStyle"
          @tag-scroll="handleNoticeTagScroll"
          @tag-select="handleTagSelect"
        />

        <HomeRailActivitySearchSection
          :is-notice-search-visible="isNoticeSearchVisible"
          :has-active-notice-search="hasActiveNoticeSearch"
          :notice-keyword="noticeKeyword"
          @notice-keyword-input="handleNoticeKeywordInput"
          @notice-keyword-clear="handleNoticeKeywordClear"
          @search-before-enter="handleNoticeSearchRevealBeforeEnter"
          @search-enter="handleNoticeSearchRevealEnter"
          @search-after-enter="handleNoticeSearchRevealAfterEnter"
          @search-before-leave="handleNoticeSearchRevealBeforeLeave"
          @search-leave="handleNoticeSearchRevealLeave"
          @search-after-leave="handleNoticeSearchRevealAfterLeave"
        />

        <HomeRailActivityNoticeResultsSection
          :set-notice-results-stage-ref="assignNoticeResultsStageRef"
          :notice-results-stage-style="noticeResultsStageStyle"
          :notice-removed-overlay-items="noticeRemovedOverlayItems"
          :displayed-notices="displayedNotices"
          :mounted-notices="mountedNotices"
          :notice-top-spacer-height="noticeTopSpacerHeight"
          :notice-bottom-spacer-height="noticeBottomSpacerHeight"
          :should-render-activity-bottom-footer="shouldRenderActivityBottomFooter"
          :activity-bottom-footer-mode="activityBottomFooterMode"
          :remote-notice-list-error-message="remoteNoticeListErrorMessage"
          :should-show-notice-first-screen-error-state="shouldShowNoticeFirstScreenErrorState"
          :should-show-notice-first-screen-loading-state="shouldShowNoticeFirstScreenLoadingState"
          :should-show-notice-empty-state="shouldShowNoticeEmptyState"
          :notice-empty-state-title="noticeEmptyStateTitle"
          :notice-empty-state-description="noticeEmptyStateDescription"
          :resolve-notice-removed-overlay-item-style="resolveNoticeRemovedOverlayItemStyle"
          :resolve-notice-tone="resolveNoticeTone"
          :resolve-notice-type-label="resolveNoticeTypeLabel"
          :resolve-notice-display-time="resolveNoticeDisplayTime"
          :resolve-notice-image-url="resolveNoticeImageUrl"
          :resolve-notice-removed-overlay-reveal-phase="resolveNoticeRemovedOverlayRevealPhase"
          :resolve-notice-reveal-phase="resolveNoticeRevealPhase"
          :resolve-notice-icon="resolveNoticeIcon"
          :is-notice-placeholder="isNoticePlaceholder"
          :resolve-notice-entry-class="resolveNoticeEntryClass"
          :resolve-notice-entry-style="resolveNoticeEntryStyle"
          :handle-notice-click="handleNoticeClick"
          :handle-notice-visual-image-load="handleNoticeVisualImageLoad"
          :handle-notice-visual-image-error="handleNoticeVisualImageError"
          :handle-notice-visual-image-retrying="handleNoticeVisualImageRetrying"
          :handle-activity-bottom-retry="handleActivityBottomRetry"
          :handle-notice-first-screen-retry="handleNoticeFirstScreenRetry"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { ResultMountScrollMetrics } from '../../../services/home-rail/homeRailResultMountWindow.service'
import { createResolvedTemplateRefAssigner } from '../../../utils/resolveTemplateRefElement.util'
import HomeRailActivityEntryHighlightsSection from './activity/HomeRailActivityEntryHighlightsSection.vue'
import HomeRailActivityNoticeHeadSection from './activity/HomeRailActivityNoticeHeadSection.vue'
import HomeRailActivityNoticeResultsSection from './activity/HomeRailActivityNoticeResultsSection.vue'
import HomeRailActivitySearchSection from './activity/HomeRailActivitySearchSection.vue'
import HomeRailActivityTagSection from './activity/HomeRailActivityTagSection.vue'
import { useHomeRailActivityPanelRuntime } from '../composables/activity/useHomeRailActivityPanelRuntime'

interface Props {
  isActive?: boolean
  mountScrollMetrics?: ResultMountScrollMetrics | null
}

const props = withDefaults(defineProps<Props>(), {
  isActive: false,
  mountScrollMetrics: null,
})

const activityPanelActiveProp = computed(() => props.isActive)
const activityMountScrollMetricsProp = computed(() => props.mountScrollMetrics)

const {
  assetMergeEntry,
  priorityDrawEntry,
  networkInviteEntry,
  isActivityScenePatchMotionReduced,
  isNoticeSearchVisible,
  hasActiveNoticeSearch,
  noticeTags,
  activeTag,
  isNoticeTagLeftFadeVisible,
  isNoticeTagIndicatorReady,
  noticeTagIndicatorStyle,
  noticeKeyword,
  noticeResultsStageRef,
  noticeResultsStageStyle,
  noticeRemovedOverlayItems,
  displayedNotices,
  mountedNotices,
  noticeTopSpacerHeight,
  noticeBottomSpacerHeight,
  shouldRenderActivityBottomFooter,
  activityBottomFooterMode,
  remoteNoticeListErrorMessage,
  shouldShowNoticeFirstScreenErrorState,
  shouldShowNoticeFirstScreenLoadingState,
  shouldShowNoticeEmptyState,
  noticeEmptyStateTitle,
  noticeEmptyStateDescription,
  resolveNoticeRemovedOverlayItemStyle,
  resolveNoticeTone,
  resolveNoticeTypeLabel,
  resolveNoticeDisplayTime,
  resolveNoticeImageUrl,
  resolveNoticeRemovedOverlayRevealPhase,
  resolveNoticeRevealPhase,
  resolveNoticeIcon,
  isNoticePlaceholder,
  resolveNoticeEntryClass,
  resolveNoticeEntryStyle,
  handleNoticeTagScroll,
  handleTagSelect,
  handleNoticeKeywordInput,
  handleNoticeKeywordClear,
  handleNoticeSearchRevealBeforeEnter,
  handleNoticeSearchRevealEnter,
  handleNoticeSearchRevealAfterEnter,
  handleNoticeSearchRevealBeforeLeave,
  handleNoticeSearchRevealLeave,
  handleNoticeSearchRevealAfterLeave,
  handleNoticeVisualImageLoad,
  handleNoticeVisualImageError,
  handleNoticeVisualImageRetrying,
  handleActivityBottomRetry,
  handleNoticeFirstScreenRetry,
  handleNoticeSearchToggle,
  handleEntryClick,
  handleNoticeClick,
  refreshContent,
  waitForRefreshPresentation,
} = useHomeRailActivityPanelRuntime({
  isActive: activityPanelActiveProp,
  mountScrollMetrics: activityMountScrollMetricsProp,
})

const assignNoticeResultsStageRef = createResolvedTemplateRefAssigner(noticeResultsStageRef)

defineExpose({
  refreshContent,
  waitForRefreshPresentation,
})
</script>
<style lang="scss" scoped>
.home-activity-panel {
  display: flex;
  flex-direction: column;
  gap: 0;
  padding: 0 var(--home-page-inline-padding, 16px);
  box-sizing: border-box;
  background: transparent;
}

.home-activity-content {
  display: flex;
  min-width: 0;
  flex-direction: column;
}

.home-activity-header + .home-activity-content {
  margin-top: 16px;
}

.home-activity-entry-stack + .home-activity-notice-stack {
  margin-top: 24px;
}

.home-activity-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}

.home-activity-header-title-group {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-left: 4px;
}

.home-activity-header-title {
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  color: #111111;
}

.home-activity-header-subtitle {
  min-height: 12px;
  display: inline-block;
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
  color: #22d3ee;
  letter-spacing: 0.18em;
  text-transform: uppercase;
  transform: scale(0.75);
  transform-origin: left bottom;
  vertical-align: baseline;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-activity-notice-entry {
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

.home-activity-notice-entry {
  --home-activity-card-radius: 20px;

  position: relative;
  overflow: visible;
}

.home-activity-notice-shell::before {
  content: '';
  position: absolute;
  left: 0;
  top: var(--home-activity-card-radius);
  bottom: var(--home-activity-card-radius);
  width: var(--aether-entry-accent-line-width, 2px);
  border-radius: 999px;
  background: var(--aether-entry-accent-line-color, #22d3ee);
  transform: translateX(-100%);
  opacity: 0;
  transition: var(--aether-entry-accent-line-transition, transform 180ms ease, opacity 180ms ease);
  pointer-events: none;
  z-index: 3;
}

@media (hover: hover) and (pointer: fine) {
  .home-activity-notice-entry:hover {
    transform: translateY(var(--aether-entry-hover-lift-y, -2px));
  }

  .home-activity-notice-entry:hover .home-activity-notice-shell::before {
    transform: translateX(0);
    opacity: 1;
  }
}

.home-activity-notice-entry.is-entry-active {
  transform: scale(var(--aether-entry-active-scale, 0.985));
}

.home-activity-notice-entry.is-entry-active .home-activity-notice-shell::before {
  transform: translateX(0);
  opacity: 1;
}

.home-activity-notice-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
}
</style>
