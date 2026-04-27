<!--
Responsibility: render the home main track stage and keep the rail stage layout, width-driven
styles, and page shell assembly isolated from rail content runtime.
Out of scope: rail-local runtime, remote data chains, and result window timing behavior.
-->

<template>
  <view class="home-main-stage" :style="runtimeStyle">
    <view class="home-main-stage-inner" :class="trackLayoutState.stageModeClass">
      <view class="home-content-stage">
        <view class="home-page-grid" :class="trackLayoutState.pageGridClass">
          <view class="home-page-track">
            <view class="home-track-top-inset" />

            <view class="home-track-panel-stage">
              <view v-if="!isHomePage" class="home-track-refresh-rail">
                <view
                  class="home-track-refresh-indicator"
                  :class="resolveTrackRefreshIndicatorClass(activePageKey)"
                  :style="resolveTrackRefreshIndicatorStyle(activePageKey)"
                >
                  <view class="home-track-refresh-indicator-surface">
                    <view class="home-track-refresh-icon-stack">
                      <AetherIcon
                        class="home-track-refresh-icon home-track-refresh-icon-base"
                        name="refresh-cw"
                        :size="18"
                        :stroke-width="2"
                      />
                    </view>
                  </view>
                </view>
              </view>
              <HomeTrackPullRefreshScroller
                v-if="shouldMountHomePage"
                v-show="isHomePage"
                ref="homeScrollViewRef"
                class="home-track-scroll home-track-panel-scroll"
                :is-active="isHomePage"
                :refresher-threshold-px="HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX"
                @scroll="handleTrackScroll('home', $event)"
                @refresh="handleHomeTrackPullRefresh"
                @refresher-pulling="handleTrackRefresherPulling('home', $event)"
                @refresher-restore="handleTrackRefresherRestore('home')"
              >
                <view class="home-track-scroll-content home-track-scroll-content--home">
                  <HomeRailHomePanel
                    ref="homePanelRef"
                    :can-open-drawer="trackLayoutState.canUseDrawer"
                    :is-active="isHomePage"
                    :mount-scroll-metrics="resolveTrackMountScrollMetrics('home')"
                    :refresh-slot-state="resolveTrackRefreshSlotState('home')"
                    @open-drawer="handleOpenDrawer"
                  />
                  <view class="home-track-scroll-bottom-spacer" aria-hidden="true" />
                </view>
              </HomeTrackPullRefreshScroller>

              <scroll-view
                v-if="shouldMountActivityPage"
                v-show="isActivityPage"
                ref="activityScrollViewRef"
                class="home-track-scroll home-track-panel-scroll"
                scroll-y
                :show-scrollbar="false"
                :refresher-enabled="true"
                refresher-default-style="none"
                refresher-background="transparent"
                :refresher-threshold="HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX"
                :refresher-triggered="resolveTrackRefresherTriggered('activity')"
                @scroll="handleTrackScroll('activity', $event)"
                @refresherpulling="handleTrackRefresherPulling('activity', $event)"
                @refresherrefresh="handleTrackRefresherRefresh('activity')"
                @refresherrestore="handleTrackRefresherRestore('activity')"
                @refresherabort="handleTrackRefresherAbort('activity')"
              >
                <view class="home-track-scroll-content home-track-scroll-content--standard">
                  <HomeRailActivityPanel
                    ref="activityPanelRef"
                    :is-active="isActivityPage"
                    :mount-scroll-metrics="resolveTrackMountScrollMetrics('activity')"
                  />
                  <view class="home-track-scroll-bottom-spacer" aria-hidden="true" />
                </view>
              </scroll-view>

              <scroll-view
                v-if="shouldMountProfilePage"
                v-show="isProfilePage"
                ref="profileScrollViewRef"
                class="home-track-scroll home-track-panel-scroll"
                scroll-y
                scroll-with-animation
                :scroll-into-view="profileScrollIntoViewTarget"
                :show-scrollbar="false"
                :refresher-enabled="true"
                refresher-default-style="none"
                refresher-background="transparent"
                :refresher-threshold="HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX"
                :refresher-triggered="resolveTrackRefresherTriggered('profile')"
                @scroll="handleTrackScroll('profile', $event)"
                @refresherpulling="handleTrackRefresherPulling('profile', $event)"
                @refresherrefresh="handleTrackRefresherRefresh('profile')"
                @refresherrestore="handleTrackRefresherRestore('profile')"
                @refresherabort="handleTrackRefresherAbort('profile')"
              >
                <view class="home-track-scroll-content home-track-scroll-content--standard">
                  <HomeRailProfilePanel
                    ref="profilePanelRef"
                    :is-active="isProfilePage"
                    :mount-scroll-metrics="resolveTrackMountScrollMetrics('profile')"
                    @scroll-to-assets-section="handleProfileScrollToAssetsSection"
                  />
                  <view class="home-track-scroll-bottom-spacer" aria-hidden="true" />
                </view>
              </scroll-view>

              <HomeRailProfileAssetHoldingsSheet
                :open="isProfileAssetHoldingsSheetOpen"
                :asset-view-model="activeProfileAssetHoldingsSheetViewModel"
                @close="handleCloseProfileAssetHoldingsSheet"
                @instance-detail="handleProfileAssetHoldingInstanceDetail"
              />
            </view>
          </view>
        </view>
      </view>

      <HomeShellNavRail
        v-if="isNavRailVisible"
        :runtime-context="props.runtimeContext"
        :can-expand-drawer="trackLayoutState.canUseDrawer"
        @open-drawer="handleOpenDrawer"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, nextTick } from 'vue'
import AetherIcon from '../../../../components/AetherIcon.vue'
import {
  HOME_ACTIVITY_PAGE_KEY,
  HOME_SHELL_PAGE_KEYS,
  HOME_PROFILE_PAGE_KEY,
  HOME_PRIMARY_PAGE_KEY,
  type LayoutMode,
} from '../../../../models/home-shell/homeShell.model'
import { type ViewportRuntimeContext } from '../../../../services/home-shell/homeShellLayoutMode.service'
import { setRailPageReloadMode } from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import type { HomeShellDerivedState } from '../../../../services/home-shell/homeShellState.service'
import { logSafeError } from '../../../../utils/safeLogger.util'
import HomeRailActivityPanel from '../HomeRailActivityPanel.vue'
import HomeRailHomePanel from '../HomeRailHomePanel.vue'
import HomeRailProfilePanel from '../HomeRailProfilePanel.vue'
import HomeRailProfileAssetHoldingsSheet from '../profile/HomeRailProfileAssetHoldingsSheet.vue'
import HomeShellNavRail from '../../../../components/HomeShellNavRail.vue'
import HomeTrackPullRefreshScroller from './HomeTrackPullRefreshScroller.vue'
import {
  type HomeTrackRefreshHandle,
  useHomeTrackRefreshController,
} from '../../composables/home/useHomeTrackRefreshController'
import { HOME_TRACK_PULL_REFRESH_TRIGGER_OFFSET_PX } from '../../composables/home/homeTrackRefresh.constants'
import { useHomeTrackMountMetrics } from '../../composables/home/useHomeTrackMountMetrics'
import { useHomeTrackPageMountState } from '../../composables/home/useHomeTrackPageMountState'
import { useHomeTrackProfileScrollBridge } from '../../composables/home/useHomeTrackProfileScrollBridge'
import { useHomeTrackStageLifecycle } from '../../composables/home/useHomeTrackStageLifecycle'
import { useHomeTrackStageRefs } from '../../composables/home/useHomeTrackStageRefs'
import { useHomeTrackStageViewState } from '../../composables/home/useHomeTrackStageViewState'
import type { ProfileAssetHoldingsSheetViewModel } from '../../composables/profile/useProfileAssetHoldingsSheet'
interface Props {
  layoutMode: LayoutMode
  runtimeContext: ViewportRuntimeContext
  homeShellDerivedState: HomeShellDerivedState
}

const props = defineProps<Props>()
const emit = defineEmits<{
  openDrawer: []
}>()

setRailPageReloadMode('reload-on-update')

const {
  trackLayoutState,
  isNavRailVisible,
  activePageKey,
  isHomePage,
  isActivityPage,
  isProfilePage,
  runtimeStyle,
} = useHomeTrackStageViewState({
  resolveLayoutMode: () => props.layoutMode,
  resolveRuntimeContext: () => props.runtimeContext,
  resolveHomeShellDerivedState: () => props.homeShellDerivedState,
})
const {
  homePanelRef,
  activityPanelRef,
  profilePanelRef,
  homeScrollViewRef,
  activityScrollViewRef,
  profileScrollViewRef,
  resolveTrackRefreshHandle,
  resolveTrackScrollViewRef,
} = useHomeTrackStageRefs()

const handleOpenDrawer = () => {
  emit('openDrawer')
}

const {
  resolveTrackWindowingSuspended,
  resolveTrackRefresherTriggered,
  resolveTrackRefreshIndicatorClass,
  resolveTrackRefreshIndicatorStyle,
  resolveTrackRefreshSlotState,
  resetTrackRefresherVisualState,
  handleTrackRefresherPulling,
  refreshTrackPage,
  handleTrackRefresherRefresh,
  handleTrackRefresherRestore,
  handleTrackRefresherAbort,
} = useHomeTrackRefreshController({
  activePageKey,
  nextTickFn: nextTick,
  resolveTrackRefreshHandle,
  logSafeError,
})

const {
  resolveTrackMountScrollMetrics,
  handleTrackScroll,
  syncTrackViewportSnapshot,
  syncTrackViewportSnapshotForAllPages,
  clearHomeTrackScrolled,
  reconcileHomeTrackScrolled,
} = useHomeTrackMountMetrics({
  pageKeys: HOME_SHELL_PAGE_KEYS,
  homePageKey: HOME_PRIMARY_PAGE_KEY,
  resolveTrackScrollViewRef,
  resolveTrackWindowingSuspended,
})

const { shouldMountHomePage, shouldMountActivityPage, shouldMountProfilePage } =
  useHomeTrackPageMountState({
    activePageKey,
    pageKeys: HOME_SHELL_PAGE_KEYS,
    homePageKey: HOME_PRIMARY_PAGE_KEY,
    activityPageKey: HOME_ACTIVITY_PAGE_KEY,
    profilePageKey: HOME_PROFILE_PAGE_KEY,
    resetTrackRefresherVisualState,
    clearHomeTrackScrolled,
    syncTrackViewportSnapshot,
    reconcileHomeTrackScrolled,
    nextTickFn: nextTick,
  })

const {
  profileScrollIntoViewTarget,
  handleProfileScrollToAssetsSection,
  disposeProfileScrollBridge,
} = useHomeTrackProfileScrollBridge()

interface HomeTrackProfilePanelOverlayHandle extends HomeTrackRefreshHandle {
  resolveProfileAssetHoldingsSheetOpen?: () => boolean
  resolveActiveProfileAssetHoldingsSheetViewModel?: () => ProfileAssetHoldingsSheetViewModel | null
  closeProfileAssetHoldingsSheet?: () => void
  handleProfileAssetHoldingInstanceActivate?: (instanceId: string) => void
}

const resolveProfilePanelOverlayHandle = (): HomeTrackProfilePanelOverlayHandle | null => {
  return profilePanelRef.value as HomeTrackProfilePanelOverlayHandle | null
}

const isProfileAssetHoldingsSheetOpen = computed(() => {
  return Boolean(resolveProfilePanelOverlayHandle()?.resolveProfileAssetHoldingsSheetOpen?.())
})

const activeProfileAssetHoldingsSheetViewModel =
  computed<ProfileAssetHoldingsSheetViewModel | null>(() => {
    return (
      resolveProfilePanelOverlayHandle()?.resolveActiveProfileAssetHoldingsSheetViewModel?.() ??
      null
    )
  })

const handleCloseProfileAssetHoldingsSheet = () => {
  resolveProfilePanelOverlayHandle()?.closeProfileAssetHoldingsSheet?.()
}

const handleProfileAssetHoldingInstanceDetail = (instanceId: string) => {
  resolveProfilePanelOverlayHandle()?.handleProfileAssetHoldingInstanceActivate?.(instanceId)
}

const completeHomeTrackPullRefresh = async (success: boolean) => {
  const homeScroller = homeScrollViewRef.value as {
    completeRefresh?: (success?: boolean) => Promise<void> | void
  } | null

  try {
    await homeScroller?.completeRefresh?.(success)
  } catch (error) {
    logSafeError('homeTrack', error, {
      message: 'failed to complete home pull refresh scroller',
    })
  }
}

const handleHomeTrackPullRefresh = async () => {
  let didRefreshSucceed = false

  try {
    didRefreshSucceed = await refreshTrackPage(HOME_PRIMARY_PAGE_KEY)
  } finally {
    await completeHomeTrackPullRefresh(didRefreshSucceed)
  }
}
useHomeTrackStageLifecycle({
  nextTickFn: nextTick,
  syncTrackViewportSnapshotForAllPages,
  disposeProfileScrollBridge,
})
</script>

<style lang="scss" scoped>
.home-main-stage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  height: var(--home-stage-shell-height, var(--home-stage-height, 100vh));
  height: var(--home-stage-shell-height, var(--home-stage-height, 100dvh));
  min-height: var(--home-stage-shell-height, var(--home-stage-height, 100vh));
  min-height: var(--home-stage-shell-height, var(--home-stage-height, 100dvh));
  background: var(--aether-page-background, #fafafa);
  overflow: hidden;
  box-sizing: border-box;
}

.home-main-stage-inner {
  display: grid;
  width: 100%;
  height: var(--home-stage-shell-height, var(--home-stage-height, 100vh));
  height: var(--home-stage-shell-height, var(--home-stage-height, 100dvh));
  min-height: var(--home-stage-shell-height, var(--home-stage-height, 100vh));
  min-height: var(--home-stage-shell-height, var(--home-stage-height, 100dvh));
  transform-origin: top center;
}

.home-main-stage-inner.mode-single {
  grid-template-columns: minmax(0, var(--home-page-max-width, 430px));
  justify-content: center;
}

.home-main-stage-inner.mode-single-nav {
  grid-template-columns: minmax(375px, var(--home-page-max-width, 430px)) var(
      --home-nav-rail-width,
      76px
    );
  column-gap: var(--home-nav-gap, 16px);
  justify-content: center;
}

.home-content-stage {
  position: relative;
  min-width: 0;
  height: var(--home-stage-shell-height, var(--home-stage-height, 100vh));
  height: var(--home-stage-shell-height, var(--home-stage-height, 100dvh));
  min-height: 0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
  background: var(--aether-page-background, #fafafa);
}

.home-page-grid {
  display: grid;
  flex: 1 1 auto;
  height: 100%;
  min-height: 0;
}

.home-page-grid.is-single {
  grid-template-columns: minmax(0, 1fr);
}

.home-page-track {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  height: 100%;
  min-height: 0;
  overflow: hidden;
  background: var(--aether-page-background, #fafafa);
  box-sizing: border-box;
}

.home-track-top-inset {
  flex: 0 0 auto;
  height: var(--home-safe-top, 0);
}

.home-track-scroll {
  --home-page-inline-padding: 20px;

  position: relative;
  height: 100%;
  min-height: 0;
  width: 100%;
  box-sizing: border-box;
  display: block;
  background: var(--aether-page-background, #fafafa);
  overscroll-behavior-y: none;
}

.home-track-refresh-rail {
  position: absolute;
  inset: 0;
  z-index: 15;
  pointer-events: none;
  overflow: visible;
}

.home-track-refresh-indicator {
  position: absolute;
  left: 50%;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  opacity: 0;
  pointer-events: none;
  transform: translate(-50%, 0);
  transition:
    opacity 180ms ease,
    transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform, opacity;
}

.home-track-refresh-indicator-surface {
  position: relative;
  display: flex;
  width: 44px;
  height: 44px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  background-image: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.56) 0%,
    rgba(255, 255, 255, 0.32) 100%
  );
  -webkit-backdrop-filter: blur(8px) saturate(1.2);
  backdrop-filter: blur(8px) saturate(1.2);
  box-shadow:
    var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08)),
    inset 0 1px 0 rgba(255, 255, 255, 0.4);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .home-track-refresh-indicator-surface {
    background-color: rgba(255, 255, 255, 0.4);
    background-image: none;
  }
}

.home-track-refresh-icon-stack {
  position: relative;
  display: flex;
  width: 18px;
  height: 18px;
  align-items: center;
  justify-content: center;
  z-index: 1;
}

.home-track-refresh-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-track-refresh-icon-base {
  color: #111111;
}

.home-track-refresh-indicator.is-refreshing .home-track-refresh-icon-stack {
  animation: home-track-refresh-spin 720ms linear infinite;
}

.home-track-refresh-indicator.is-pull-active {
  transition: none;
}

.home-track-scroll-content {
  box-sizing: border-box;
  min-height: 100%;
  transition: transform 220ms cubic-bezier(0.22, 1, 0.36, 1);
  will-change: transform;
}

.home-track-scroll-content--home {
  padding-top: 0;
}

.home-track-scroll-content--standard {
  padding-top: 16px;
}

.home-track-scroll-bottom-spacer {
  width: 100%;
  min-height: calc(var(--home-tabbar-reserve, 112px) + var(--home-safe-bottom, 0px));
  pointer-events: none;
}

.home-track-scroll-content.is-pull-active {
  transition: none;
}

.home-track-panel-stage {
  --home-track-home-topbar-height: 64px;

  position: relative;
  flex: 1 1 auto;
  min-height: 0;
}

.home-track-panel-scroll {
  width: 100%;
}

@media screen and (width < 430px) {
  .home-track-scroll {
    --home-page-inline-padding: 16px;
  }
}

@keyframes home-track-refresh-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
