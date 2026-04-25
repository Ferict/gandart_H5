<!--
Responsibility: assemble the profile asset detail page shell, including secondary-page
frame wiring, hero/detail sections, and page-local refresh/persistence runtime.
Out of scope: shared provider transport, persistent cache storage internals, and
global app shell routing.
-->
<template>
  <page-meta :page-style="pageMetaStyle" />
  <SecondaryPageFrame
    :route-source="routeSource"
    title="藏品详情"
    :show-share="true"
    :refresher-enabled="true"
    :refresher-triggered="refresherTriggered"
    :refresher-threshold="PROFILE_ASSET_REFRESH_TRIGGER_OFFSET_PX"
    :refresher-pull-distance="refresherPullDistance"
    :is-refreshing="isRefreshing"
    :has-action-rail="true"
    :action-rail-occupied-height="PROFILE_ASSET_ACTION_RAIL_OCCUPIED_HEIGHT_PX"
    @back="handleBack"
    @share="handleShare"
    @refresherpulling="handleRefresherPulling"
    @refresherrefresh="handleRefresherRefresh"
    @refresherrestore="handleRefresherRestore"
    @refresherabort="handleRefresherAbort"
  >
    <ProfileAssetDetailHeroCard
      class="motion"
      :detail-id="detailContent.id"
      :hero-top-code-text="heroTopCodeText"
      :hero-barcode-bars="heroBarcodeBars"
      :hero-media-frame-style="heroMediaFrameStyle"
      :hero-image-url="heroImageUrl"
      :hero-reveal-phase="heroRevealPhase"
      :hero-placeholder-icon="heroPlaceholderIcon"
      :hero-image-cache-user-scope="heroImageCacheUserScope"
      @tap="handleHeroTap"
      @load="handleHeroImageLoad"
      @error="handleHeroImageError"
    />

    <ProfileAssetDetailValueCard
      class="motion"
      style="--delay: 40ms"
      :partition-display-text="valueCardPartitionDisplayText"
      :creator-text="valueCardCreatorText"
      :title-text="valueCardTitleText"
      :metric-label-text="valueCardMetricLabelText"
      :display-price="displayPrice"
      :display-price-unit-visual="displayPriceUnitVisual"
      :total-value-compact-label-text="valueCardTotalValueCompactLabelText"
      :holdings-count="detailContent.holdingsCount"
      :acquired-at="detailContent.acquiredAt"
      :edition-code="detailContent.editionCode"
      :issue-count="detailContent.issueCount"
    />

    <ProfileAssetDetailProvenanceCard
      class="motion"
      style="--delay: 80ms"
      :owner="activeUiPreset.owner"
      :contract="activeUiPreset.contract"
      :chain="activeUiPreset.chain"
      :token-standard="activeUiPreset.tokenStandard"
      @copy="handleCopyProvenanceValue"
    />

    <ProfileAssetDetailTraitsCard class="motion" style="--delay: 120ms" :traits="resolvedTraits" />

    <ProfileAssetDetailDescriptionCard
      class="motion"
      style="--delay: 160ms"
      :description="assetDescriptionText"
      :error-message="refreshErrorMessage || undefined"
    />

    <template #action-rail>
      <HomeInteractiveTarget
        class="action-primary action-primary-tab"
        :label="activeUiPreset.primaryActionText"
        @activate="handlePrimaryAction"
      >
        <view class="action-primary-shell">
          <view class="action-primary-content">
            <AetherIcon class="action-primary-icon" name="zap" :size="20" :stroke-width="2" />
            <text class="action-primary-text">{{ activeUiPreset.primaryActionText }}</text>
          </view>
        </view>
      </HomeInteractiveTarget>
    </template>
  </SecondaryPageFrame>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { onLoad, onUnload } from '@dcloudio/uni-app'
import AetherIcon from '../../components/AetherIcon.vue'
import SecondaryPageFrame from '../../components/SecondaryPageFrame.vue'
import { useResponsiveRailLayout } from '../../composables/useResponsiveRailLayout'
import { logSafeError } from '../../utils/safeLogger.util'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import ProfileAssetDetailDescriptionCard from './components/ProfileAssetDetailDescriptionCard.vue'
import ProfileAssetDetailHeroCard from './components/ProfileAssetDetailHeroCard.vue'
import ProfileAssetDetailProvenanceCard from './components/ProfileAssetDetailProvenanceCard.vue'
import ProfileAssetDetailTraitsCard from './components/ProfileAssetDetailTraitsCard.vue'
import ProfileAssetDetailValueCard from './components/ProfileAssetDetailValueCard.vue'
import { runProfileAssetDetailPageOpenFlow } from './helpers/profileAssetDetailPageOpenFlow'
import { useProfileAssetDetailHeroMediaState } from './runtime/useProfileAssetDetailHeroMediaState'
import { useProfileAssetDetailPersistentState } from './runtime/useProfileAssetDetailPersistentState'
import { useProfileAssetDetailPresentation } from './runtime/useProfileAssetDetailPresentation'
import {
  PROFILE_ASSET_REFRESH_TRIGGER_OFFSET_PX,
  useProfileAssetDetailRefreshController,
} from './runtime/useProfileAssetDetailRefreshController'
import { useProfileAssetDetailRouteState } from './runtime/useProfileAssetDetailRouteState'

defineProps<{
  source?: string
  itemId?: string
  category?: string
  subCategory?: string
}>()

const PROFILE_ASSET_ACTION_RAIL_OCCUPIED_HEIGHT_PX = 112

const { runtimeContext } = useResponsiveRailLayout()
const { routeSource, resolveCurrentDetailRoute, currentDetailRouteSignature, updateRouteQuery } =
  useProfileAssetDetailRouteState()

const {
  detailContent,
  detailPersistentUserScope,
  resolveDetailPersistentUserScope,
  applyResolvedDetailContent,
  preparePersistentStateForPageOpen,
} = useProfileAssetDetailPersistentState({
  resolveCurrentDetailRoute,
})

const {
  isRefreshing,
  refresherTriggered,
  refresherPullDistance,
  refreshErrorMessage,
  prepareRefreshStateForPageOpen,
  refreshContent,
  waitForRefreshPresentation,
  handleRefresherPulling,
  handleRefresherRefresh,
  handleRefresherRestore,
  handleRefresherAbort,
  activateDetailPage,
  invalidateDetailPageRequests,
} = useProfileAssetDetailRefreshController({
  currentDetailRouteSignature,
  resolveCurrentDetailRoute,
  resolveCurrentUserScope: resolveDetailPersistentUserScope,
  applyResolvedDetailContent,
})

const {
  activeUiPreset,
  heroTopCodeText,
  heroBarcodeBars,
  displayPrice,
  valueCardCreatorText,
  valueCardPartitionDisplayText,
  valueCardTitleText,
  displayPriceUnitVisual,
  valueCardMetricLabelText,
  assetDescriptionText,
  valueCardTotalValueCompactLabelText,
  resolvedTraits,
} = useProfileAssetDetailPresentation({
  detailContent,
})

const {
  heroImageUrl,
  heroRevealPhase,
  heroImageCacheUserScope,
  heroPlaceholderIcon,
  heroMediaFrameStyle,
  handleHeroImageLoad,
  handleHeroImageError,
} = useProfileAssetDetailHeroMediaState({
  detailContent,
  detailPersistentUserScope,
  fallbackHeroImageUrl: computed(() => activeUiPreset.value.heroImageUrl),
})

const pageMetaStyle = computed(() => {
  const viewportHeight = runtimeContext.value.viewportHeight
  const height = viewportHeight > 0 ? `${viewportHeight}px` : '100vh'
  return `height:${height};min-height:${height};overflow:hidden;background:var(--aether-page-background,#fafafa);`
})

const prepareDetailPageForPageOpen = () => {
  prepareRefreshStateForPageOpen()
  preparePersistentStateForPageOpen()
}

const handleBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }

  uni.reLaunch({ url: '/pages/home/index' })
}

const handleShare = () => {
  /* UI 占位：后续由主控接真实分享行为 */
}

const handleHeroTap = () => {
  /* UI 占位：后续由主控接 Hero 预览行为 */
}

const handlePrimaryAction = () => {
  /* UI 占位：后续由主控接真实交易主操作 */
}

const handleCopyProvenanceValue = (rawValue: string) => {
  const copyValue = rawValue.trim()
  if (!copyValue) {
    return
  }

  uni.setClipboardData({
    data: copyValue,
    success: () => {
      uni.showToast({ title: '已复制', icon: 'none' })
    },
    fail: (error) => {
      logSafeError('profileAssetDetail.copyProvenanceValue', error, {
        message: 'failed to copy provenance value',
      })
      uni.showToast({ title: '复制失败', icon: 'none' })
    },
  })
}

defineExpose({
  refreshContent,
  waitForRefreshPresentation,
})

// TODO(contract): owner/contract/chain/tokenStandard/traits 当前由 UI preset 补位，
// 待后端扩展 profile_asset payload 后由主控接线替换为真实契约字段。
onLoad((query) => {
  activateDetailPage()
  updateRouteQuery(query as Record<string, unknown>)
  void runProfileAssetDetailPageOpenFlow({
    prepareDetailPageForPageOpen,
    refreshDetailContent: refreshContent,
  })
})

onUnload(() => {
  invalidateDetailPageRequests()
})
</script>

<style lang="scss" scoped>
.motion {
  opacity: 1;
  transform: none;
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .action-rail {
    background: transparent;
  }
}

.action-primary {
  min-height: 0;
  border-radius: 16px;
  transform: scale(1);
  transition: transform 180ms ease;
}

.action-primary.is-entry-active {
  transform: scale(0.985);
}

.action-primary-tab {
  width: 100%;
}

.action-primary-shell {
  width: 100%;
  min-height: 0;
  padding: 16px;
  box-sizing: border-box;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background-image: linear-gradient(180deg, rgba(17, 17, 17, 0.6) 0%, rgba(17, 17, 17, 0.6) 100%);
  background-color: rgba(17, 17, 17, 0.6);
  -webkit-backdrop-filter: blur(8px) saturate(1.15);
  backdrop-filter: blur(8px) saturate(1.15);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--aether-shadow-overlay-float, 0 0 20px rgba(15, 23, 42, 0.09));
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .action-primary-shell {
    background-image: none;
    background-color: rgba(17, 17, 17, 0.6);
  }
}

.action-primary-content {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.action-primary-icon {
  color: #22d3ee;
  line-height: 0;
  flex: 0 0 auto;
}

.action-primary-text {
  font-size: 14px;
  line-height: 20px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}
</style>
