<!--
Responsibility: render the profile rail main shell and assemble the profile header, search, and
result sections with their page-local runtime adapters.
Out of scope: cross-page shared services, content-provider implementation details, and global shell
routing.
-->

<template>
  <view class="home-profile-panel">
    <view class="home-profile-header">
      <view class="home-profile-header-title-group">
        <text class="home-profile-header-title">个人中心</text>
        <text class="home-profile-header-subtitle">USER_SYNC</text>
      </view>

      <view class="home-profile-header-actions">
        <HomeInteractiveTarget
          class="home-profile-header-action"
          interaction-mode="compact"
          label="打开官方社群"
          @activate="handleOpenCommunity"
        >
          <view class="home-profile-header-action-visual">
            <AetherIcon name="users" :size="16" :stroke-width="2" />
          </view>
        </HomeInteractiveTarget>
        <HomeInteractiveTarget
          class="home-profile-header-action"
          interaction-mode="compact"
          label="打开系统设置"
          @activate="handleOpenSettings"
        >
          <view class="home-profile-header-action-visual">
            <AetherIcon name="settings" :size="16" :stroke-width="2" />
          </view>
        </HomeInteractiveTarget>
      </view>
    </view>

    <view class="home-profile-body">
      <HomeRailProfileIdentitySection
        :display-name="content.summary.displayName"
        :address-head="profileAddressPreview.head"
        :address-tail="profileAddressPreview.tail"
        @copy-address="handleCopyAddress"
        @show-qr="handleShowQr"
      />

      <HomeRailProfileSummarySection
        :currency-symbol="resolvedSummaryCurrencySymbol"
        :total-value="content.summary.totalValue"
        :holdings="content.summary.holdings"
        @summary-focus="handleSummaryFocus"
      />

      <HomeRailProfileQuickActionsSection
        :entries="profileQuickActions"
        :resolve-icon-name="resolveHomeShellIconName"
        @quick-entry-click="handleQuickEntryClick"
      />

      <view id="home-profile-assets-anchor" class="home-profile-assets-stack">
        <HomeRailProfileAssetsHeadSection
          title="我的藏品"
          subtitle="ASSETS"
          :is-profile-search-visible="isProfileSearchVisible"
          :has-active-profile-search="hasActiveProfileSearch"
          @search-click="handleSearchAssets"
        />

        <HomeRailProfileCategorySection
          :categories="resolvedProfileCategories"
          :active-category="activeCategory"
          :track-style="profileCategoryTrackStyle"
          :indicator-style="profileCategoryIndicatorStyle"
          @category-select="handleCategoryChange"
        />

        <HomeRailProfileSubCategorySection
          :sub-categories="visibleProfileSubCategories"
          :active-sub-category="activeSubCategory"
          :is-left-fade-visible="isProfileSubCategoryLeftFadeVisible"
          @sub-category-scroll="handleProfileSubCategoryScroll"
          @sub-category-select="handleSubCategoryChange"
        />

        <HomeRailProfileSearchSection
          :is-profile-search-visible="isProfileSearchVisible"
          :has-active-profile-search="hasActiveProfileSearch"
          :profile-keyword="profileKeyword"
          @profile-keyword-input="handleProfileKeywordInput"
          @profile-keyword-clear="handleProfileKeywordClear"
          @search-before-enter="handleProfileSearchRevealBeforeEnter"
          @search-enter="handleProfileSearchRevealEnter"
          @search-after-enter="handleProfileSearchRevealAfterEnter"
          @search-before-leave="handleProfileSearchRevealBeforeLeave"
          @search-leave="handleProfileSearchRevealLeave"
          @search-after-leave="handleProfileSearchRevealAfterLeave"
        />

        <HomeRailProfileResultsSection
          :set-profile-asset-results-stage-ref="assignProfileAssetResultsStageRef"
          :should-show-profile-first-screen-loading="shouldShowProfileFirstScreenLoading"
          :should-show-profile-first-screen-error="shouldShowProfileFirstScreenError"
          :should-show-profile-first-screen-empty="shouldShowProfileFirstScreenEmpty"
          :displayed-assets="displayedAssets"
          :mounted-assets="mountedAssets"
          :profile-asset-results-stage-style="profileAssetResultsStageStyle"
          :profile-asset-removed-overlay-items="profileAssetRemovedOverlayItems"
          :profile-asset-removed-overlay-layer-style="profileAssetRemovedOverlayLayerStyle"
          :profile-asset-top-spacer-height="profileAssetTopSpacerHeight"
          :profile-asset-bottom-spacer-height="profileAssetBottomSpacerHeight"
          :should-render-profile-bottom-footer="shouldRenderProfileBottomFooter"
          :profile-bottom-footer-mode="profileBottomFooterMode"
          :profile-image-cache-user-scope="profileImageCacheUserScope"
          :resolve-profile-asset-removed-overlay-item-style="
            resolveProfileAssetRemovedOverlayItemStyle
          "
          :resolve-profile-asset-image-url="resolveProfileAssetImageUrl"
          :resolve-profile-asset-removed-overlay-reveal-phase="
            resolveProfileAssetRemovedOverlayRevealPhase
          "
          :resolve-profile-asset-placeholder-icon="resolveProfileAssetPlaceholderIcon"
          :is-profile-asset-placeholder="isProfileAssetPlaceholder"
          :resolve-profile-asset-entry-class="resolveProfileAssetEntryClass"
          :resolve-profile-asset-entry-style="resolveProfileAssetEntryStyle"
          :resolve-profile-asset-reveal-phase="resolveProfileAssetRevealPhase"
          :handle-asset-click="handleAssetClick"
          :handle-profile-asset-visual-image-load="handleProfileAssetVisualImageLoad"
          :handle-profile-asset-visual-image-error="handleProfileAssetVisualImageError"
          :handle-profile-asset-visual-image-retrying="handleProfileAssetVisualImageRetrying"
          :handle-profile-asset-first-screen-retry="handleProfileAssetFirstScreenRetry"
          :handle-profile-asset-load-more-retry="handleProfileAssetLoadMoreRetry"
        />
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AetherIcon from '../../../components/AetherIcon.vue'
import { type ResultMountScrollMetrics } from '../../../services/home-rail/homeRailResultMountWindow.service'
import { createResolvedTemplateRefAssigner } from '../../../utils/resolveTemplateRefElement.util'
import { resolveHomeShellIconName } from '../../../utils/homeShellIconMap'
import HomeInteractiveTarget from '../../../components/HomeInteractiveTarget.vue'
import HomeRailProfileAssetsHeadSection from './profile/HomeRailProfileAssetsHeadSection.vue'
import HomeRailProfileCategorySection from './profile/HomeRailProfileCategorySection.vue'
import HomeRailProfileIdentitySection from './profile/HomeRailProfileIdentitySection.vue'
import HomeRailProfileQuickActionsSection from './profile/HomeRailProfileQuickActionsSection.vue'
import HomeRailProfileResultsSection from './profile/HomeRailProfileResultsSection.vue'
import HomeRailProfileSearchSection from './profile/HomeRailProfileSearchSection.vue'
import HomeRailProfileSummarySection from './profile/HomeRailProfileSummarySection.vue'
import HomeRailProfileSubCategorySection from './profile/HomeRailProfileSubCategorySection.vue'
import { useHomeRailProfileNavigation } from '../composables/profile/useHomeRailProfileNavigation'
import { useHomeRailProfilePanelRuntime } from '../composables/profile/useHomeRailProfilePanelRuntime'

const props = withDefaults(
  defineProps<{
    isActive?: boolean
    mountScrollMetrics?: ResultMountScrollMetrics | null
  }>(),
  {
    isActive: false,
    mountScrollMetrics: null,
  }
)
const emit = defineEmits<{
  scrollToAssetsSection: []
}>()

const profilePanelActiveProp = computed(() => Boolean(props.isActive))
const profileMountScrollMetricsProp = computed(() => props.mountScrollMetrics ?? null)

const {
  content,
  activeCategory,
  activeSubCategory,
  resolvedProfileCategories,
  visibleProfileSubCategories,
  profileKeyword,
  isProfileSearchVisible,
  isProfileSubCategoryLeftFadeVisible,
  hasActiveProfileSearch,
  profileCategoryTrackStyle,
  profileCategoryIndicatorStyle,
  displayedAssets,
  mountedAssets,
  profileAssetResultsStageRef,
  profileAssetTopSpacerHeight,
  profileAssetBottomSpacerHeight,
  profileAssetRemovedOverlayItems,
  profileAssetResultsStageStyle,
  profileAssetRemovedOverlayLayerStyle,
  shouldRenderProfileBottomFooter,
  profileBottomFooterMode,
  profileImageCacheUserScope,
  shouldShowProfileFirstScreenLoading,
  shouldShowProfileFirstScreenError,
  shouldShowProfileFirstScreenEmpty,
  resolvedSummaryCurrencySymbol,
  profileAddressPreview,
  profileQuickActions,
  profileSummaryAddress,
  handleProfileSubCategoryScroll,
  handleSearchAssets,
  handleProfileKeywordInput,
  handleProfileKeywordClear,
  handleCategoryChange,
  handleSubCategoryChange,
  handleSummaryFocus,
  handleProfileSearchRevealBeforeEnter,
  handleProfileSearchRevealEnter,
  handleProfileSearchRevealAfterEnter,
  handleProfileSearchRevealBeforeLeave,
  handleProfileSearchRevealLeave,
  handleProfileSearchRevealAfterLeave,
  resolveProfileAssetRemovedOverlayItemStyle,
  resolveProfileAssetImageUrl,
  resolveProfileAssetRemovedOverlayRevealPhase,
  resolveProfileAssetPlaceholderIcon,
  isProfileAssetPlaceholder,
  resolveProfileAssetEntryClass,
  resolveProfileAssetEntryStyle,
  resolveProfileAssetRevealPhase,
  handleProfileAssetVisualImageLoad,
  handleProfileAssetVisualImageError,
  handleProfileAssetVisualImageRetrying,
  handleProfileAssetFirstScreenRetry,
  handleProfileAssetLoadMoreRetry,
  refreshContent,
  waitForRefreshPresentation,
} = useHomeRailProfilePanelRuntime({
  isActive: profilePanelActiveProp,
  mountScrollMetrics: profileMountScrollMetricsProp,
  emitScrollToAssetsSection: () => emit('scrollToAssetsSection'),
})

const assignProfileAssetResultsStageRef = createResolvedTemplateRefAssigner(
  profileAssetResultsStageRef
)

const {
  handleOpenCommunity,
  handleOpenSettings,
  handleCopyAddress,
  handleShowQr,
  handleQuickEntryClick,
  handleAssetClick,
} = useHomeRailProfileNavigation({
  activeCategory,
  profileAddress: profileSummaryAddress,
})

defineExpose({
  refreshContent,
  waitForRefreshPresentation,
})
</script>

<style lang="scss" scoped>
.home-profile-panel {
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 0 var(--home-page-inline-padding, 16px);
  box-sizing: border-box;
  background: transparent;
}

.home-profile-body {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.home-profile-header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}

.home-profile-header-title-group {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-left: 4px;
}

.home-profile-header-title {
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  color: #111111;
}

.home-profile-header-subtitle {
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

.home-profile-header-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: visible;
}

.home-profile-header-action {
  position: relative;
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex: 0 0 auto;
  overflow: visible;
  transition:
    transform 180ms ease,
    color 160ms ease;
}

.home-profile-header-action-visual {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.home-profile-header-action.is-entry-active {
  transform: scale(0.94);
}

@media (hover: hover) and (pointer: fine) {
  .home-profile-header-action:hover {
    transform: translateY(-1px);
    color: #475569;
  }
}

.home-profile-assets-stack {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-radius: var(--aether-surface-radius-lg, 20px);
  box-sizing: border-box;
}

.home-profile-quick-card + .home-profile-assets-stack {
  margin-top: 8px;
}
</style>
