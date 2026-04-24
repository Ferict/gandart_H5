<!--
Responsibility: render the activity rail notice results shell, including removed overlay,
mounted window spacers, list footer, and first-screen state routing.
Out of scope: activity query execution, result-window timing logic, and notice data
normalization.
-->
<template>
  <view
    :ref="assignNoticeResultsStageRef"
    class="home-activity-notice-list"
    :style="noticeResultsStageStyle"
  >
    <view v-if="noticeRemovedOverlayItems.length" class="home-activity-removed-overlay-layer">
      <view
        v-for="(overlayItem, overlayIndex) in noticeRemovedOverlayItems"
        :key="'removed::' + overlayItem.id + '::' + overlayIndex"
        class="home-activity-notice-entry is-leaving is-removed-overlay"
        :style="resolveNoticeRemovedOverlayItemStyle(overlayItem.sourceIndex)"
        aria-hidden="true"
      >
        <HomeActivityNoticeCard
          :notice="overlayItem.item"
          :tone="resolveNoticeTone(overlayItem.item)"
          :type-label="resolveNoticeTypeLabel(overlayItem.item)"
          :display-time="resolveNoticeDisplayTime(overlayItem.item)"
          :image-url="resolveNoticeImageUrl(overlayItem.item)"
          :phase="resolveNoticeRemovedOverlayRevealPhase(overlayItem.item)"
          :placeholder-icon="resolveNoticeIcon(overlayItem.item)"
          :lazy-load="false"
        />
      </view>
    </view>

    <template v-if="displayedNotices.length">
      <view
        v-if="noticeTopSpacerHeight > 0"
        class="home-activity-notice-window-spacer"
        :style="{ height: noticeTopSpacerHeight + 'px' }"
        aria-hidden="true"
      />
      <view class="home-activity-notice-list-base">
        <template v-for="(notice, index) in mountedNotices" :key="notice.id">
          <HomeInteractiveTarget
            v-if="!isNoticePlaceholder(notice.id)"
            class="home-activity-notice-entry"
            :class="resolveNoticeEntryClass(notice.id)"
            :style="resolveNoticeEntryStyle(notice.id, index)"
            :label="'查看 ' + notice.title"
            @activate="handleNoticeClick(notice)"
          >
            <HomeActivityNoticeCard
              :notice="notice"
              :tone="resolveNoticeTone(notice)"
              :type-label="resolveNoticeTypeLabel(notice)"
              :display-time="resolveNoticeDisplayTime(notice)"
              :image-url="resolveNoticeImageUrl(notice)"
              :phase="resolveNoticeRevealPhase(notice)"
              :placeholder-icon="resolveNoticeIcon(notice)"
              @load="handleNoticeVisualImageLoad(notice, $event)"
              @error="handleNoticeVisualImageError(notice, $event)"
              @retrying="handleNoticeVisualImageRetrying(notice, $event)"
            />
          </HomeInteractiveTarget>

          <view v-else class="home-activity-notice-entry is-placeholder" aria-hidden="true">
            <view class="home-activity-notice-shell home-activity-notice-shell--placeholder" />
          </view>
        </template>
      </view>
      <view
        v-if="noticeBottomSpacerHeight > 0"
        class="home-activity-notice-window-spacer"
        :style="{ height: noticeBottomSpacerHeight + 'px' }"
        aria-hidden="true"
      />
      <HomeRailActivityNoticeFooterSection
        :should-render-footer="shouldRenderActivityBottomFooter"
        :footer-mode="activityBottomFooterMode"
        :remote-notice-list-error-message="remoteNoticeListErrorMessage"
        @retry="handleActivityBottomRetry"
      />
    </template>

    <HomeRailActivityNoticeStateSection
      v-else-if="
        shouldShowNoticeFirstScreenErrorState ||
        shouldShowNoticeFirstScreenLoadingState ||
        shouldShowNoticeEmptyState
      "
      :should-show-notice-first-screen-error-state="shouldShowNoticeFirstScreenErrorState"
      :should-show-notice-first-screen-loading-state="shouldShowNoticeFirstScreenLoadingState"
      :should-show-notice-empty-state="shouldShowNoticeEmptyState"
      :remote-notice-list-error-message="remoteNoticeListErrorMessage"
      :notice-empty-state-title="noticeEmptyStateTitle"
      :notice-empty-state-description="noticeEmptyStateDescription"
      @retry="handleNoticeFirstScreenRetry"
    />
  </view>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance, CSSProperties } from 'vue'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type { ActivityNotice } from '../../../../models/home-rail/homeRailActivity.model'
import type { ResultWindowOverlayItem } from '../../../../services/home-rail/homeRailResultWindow.service'
import type { HomeRailListLoadingFooterMode } from '../shared/homeRailListLoadingFooter.a11y'
import HomeActivityNoticeCard from '../shared/HomeActivityNoticeCard.vue'
import HomeRailActivityNoticeFooterSection from './HomeRailActivityNoticeFooterSection.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import HomeRailActivityNoticeStateSection from './HomeRailActivityNoticeStateSection.vue'
import { createResolvedTemplateRefForwarder } from '../../../../utils/resolveTemplateRefElement.util'

type NoticePhase = 'icon' | 'reveal-scan' | 'steady' | 'fallback'

interface Props {
  setNoticeResultsStageRef?: (element: Element | ComponentPublicInstance | null) => void
  noticeResultsStageStyle?: CSSProperties
  noticeRemovedOverlayItems: ResultWindowOverlayItem<ActivityNotice>[]
  displayedNotices: ActivityNotice[]
  mountedNotices: ActivityNotice[]
  noticeTopSpacerHeight: number
  noticeBottomSpacerHeight: number
  shouldRenderActivityBottomFooter: boolean
  activityBottomFooterMode: HomeRailListLoadingFooterMode
  remoteNoticeListErrorMessage?: string | null
  shouldShowNoticeFirstScreenErrorState: boolean
  shouldShowNoticeFirstScreenLoadingState: boolean
  shouldShowNoticeEmptyState: boolean
  noticeEmptyStateTitle: string
  noticeEmptyStateDescription: string
  resolveNoticeRemovedOverlayItemStyle: (sourceIndex: number) => CSSProperties
  resolveNoticeTone: (notice: ActivityNotice) => string
  resolveNoticeTypeLabel: (notice: ActivityNotice) => string
  resolveNoticeDisplayTime: (notice: ActivityNotice) => string
  resolveNoticeImageUrl: (notice: ActivityNotice) => string
  resolveNoticeRemovedOverlayRevealPhase: (notice: ActivityNotice) => NoticePhase
  resolveNoticeRevealPhase: (notice: ActivityNotice) => NoticePhase
  resolveNoticeIcon: (notice: ActivityNotice) => AetherIconName
  isNoticePlaceholder: (noticeId: string) => boolean
  resolveNoticeEntryClass: (noticeId: string) => Record<string, boolean>
  resolveNoticeEntryStyle: (noticeId: string, index: number) => CSSProperties
  handleNoticeClick: (notice: ActivityNotice) => void
  handleNoticeVisualImageLoad: (notice: ActivityNotice, event?: unknown) => void
  handleNoticeVisualImageError: (notice: ActivityNotice, event?: unknown) => void
  handleNoticeVisualImageRetrying: (notice: ActivityNotice, event?: unknown) => void
  handleActivityBottomRetry: () => void
  handleNoticeFirstScreenRetry: () => void
}

const props = withDefaults(defineProps<Props>(), {
  setNoticeResultsStageRef: undefined,
  noticeResultsStageStyle: () => ({}),
  remoteNoticeListErrorMessage: '',
})

const assignNoticeResultsStageRef = createResolvedTemplateRefForwarder((element) => {
  props.setNoticeResultsStageRef?.(element)
})
</script>

<style lang="scss" scoped>
.home-activity-notice-list {
  position: relative;
}

.home-activity-notice-list-base {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-activity-notice-window-spacer {
  width: 100%;
  pointer-events: none;
}

.home-activity-removed-overlay-layer {
  position: absolute;
  inset: 0;
  z-index: 0;
  display: grid;
  grid-template-columns: minmax(0, 1fr);
  grid-auto-rows: 84px;
  row-gap: 12px;
  pointer-events: none;
}

.home-activity-notice-entry {
  --home-activity-card-radius: var(--aether-surface-radius-md, 16px);

  overflow: visible;
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

.home-activity-notice-shell {
  position: relative;
  min-height: 84px;
  border-radius: var(--home-activity-card-radius);
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  padding: 16px;
  box-sizing: border-box;
  width: 100%;
  display: flex;
  align-items: flex-start;
  gap: 20px;
  overflow: hidden;
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

.home-activity-notice-shell--placeholder {
  pointer-events: none;
  visibility: hidden;
  background: transparent;
  box-shadow: none;
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

.home-activity-notice-entry.is-entering {
  animation: home-activity-notice-enter 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--home-activity-notice-entry-delay, 0ms);
}

.home-activity-notice-entry.is-replay-prep {
  opacity: 0;
  animation: none;
}

.home-activity-notice-entry.is-replay-entering {
  animation: home-activity-notice-enter 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
  animation-delay: var(--home-activity-notice-entry-delay, 0ms);
}

.home-activity-notice-entry.is-leaving {
  animation: home-activity-notice-leave 300ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.home-activity-notice-entry.is-removed-overlay {
  pointer-events: none;
  z-index: 0;
}

.home-activity-notice-entry.is-entering,
.home-activity-notice-entry.is-replay-prep,
.home-activity-notice-entry.is-replay-entering,
.home-activity-notice-entry.is-leaving,
.home-activity-notice-entry.is-entering .home-activity-notice-shell,
.home-activity-notice-entry.is-replay-prep .home-activity-notice-shell,
.home-activity-notice-entry.is-replay-entering .home-activity-notice-shell,
.home-activity-notice-entry.is-leaving .home-activity-notice-shell,
.home-activity-notice-entry.is-entering .home-activity-notice-shell::before,
.home-activity-notice-entry.is-replay-prep .home-activity-notice-shell::before,
.home-activity-notice-entry.is-replay-entering .home-activity-notice-shell::before,
.home-activity-notice-entry.is-leaving .home-activity-notice-shell::before {
  transition: none;
}

@keyframes home-activity-notice-enter {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes home-activity-notice-leave {
  from {
    opacity: 1;
  }

  to {
    opacity: 0;
  }
}
</style>
