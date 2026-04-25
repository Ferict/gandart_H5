<!--
Responsibility: compose the shared secondary-page scaffold, topbar shell, drawer bridge,
and framed content slot for non-home pages.
Out of scope: page-specific data loading, route-query parsing, and business interaction logic.
-->
<template>
  <StandalonePageScaffold :route-source="props.routeSource">
    <template #default="{ canOpenDrawer, openDrawer }">
      <view class="secondary-page-frame" :style="frameStyle">
        <view class="secondary-page-frame-topbar-shell">
          <SecondaryPageTopbar
            :title="props.title"
            :show-back="props.showBack"
            :show-share="props.showShare"
            :show-menu="props.showMenu && canOpenDrawer"
            @back="emit('back')"
            @share="emit('share')"
            @open-drawer="handleOpenDrawer(openDrawer)"
          >
            <template v-if="$slots['topbar-right']" #right>
              <slot name="topbar-right" />
            </template>
          </SecondaryPageTopbar>
        </view>

        <view class="secondary-page-frame-panel">
          <view
            v-if="props.refresherEnabled"
            class="secondary-page-frame-refresh-rail"
            aria-hidden="true"
          >
            <view
              class="secondary-page-frame-refresh-indicator"
              :class="{ 'is-refreshing': props.isRefreshing }"
              :style="refreshIndicatorStyle"
            >
              <view class="secondary-page-frame-refresh-indicator-surface">
                <AetherIcon name="refresh-cw" :size="18" :stroke-width="2" />
              </view>
            </view>
          </view>

          <scroll-view
            class="secondary-page-frame-scroll"
            scroll-y
            :show-scrollbar="false"
            :refresher-enabled="props.refresherEnabled"
            refresher-default-style="none"
            refresher-background="transparent"
            :refresher-threshold="props.refresherThreshold"
            :refresher-triggered="props.refresherTriggered"
            @refresherpulling="emit('refresherpulling', $event)"
            @refresherrefresh="emit('refresherrefresh')"
            @refresherrestore="emit('refresherrestore')"
            @refresherabort="emit('refresherabort')"
          >
            <view class="secondary-page-frame-content">
              <slot />
            </view>
          </scroll-view>
        </view>

        <view v-if="props.hasActionRail" class="secondary-page-frame-action-rail">
          <slot name="action-rail" />
        </view>
      </view>
    </template>
  </StandalonePageScaffold>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AetherIcon from './AetherIcon.vue'
import SecondaryPageTopbar from './SecondaryPageTopbar.vue'
import StandalonePageScaffold from './StandalonePageScaffold.vue'
import { useResponsiveRailLayout } from '../composables/useResponsiveRailLayout'

const SECONDARY_PAGE_TOPBAR_HEIGHT_PX = 56
const SECONDARY_PAGE_CONTENT_INSET_PX = 16
const SECONDARY_PAGE_EDGE_GAP_PX = 32
const SECONDARY_PAGE_REFRESH_TRIGGER_OFFSET_PX = 96
const SECONDARY_PAGE_ACTION_RAIL_OCCUPIED_HEIGHT_PX = 112

interface RefresherPullingEvent {
  detail?: { dy?: number }
}

interface Props {
  routeSource: string
  title: string
  showBack?: boolean
  showShare?: boolean
  showMenu?: boolean
  refresherEnabled?: boolean
  refresherTriggered?: boolean
  refresherThreshold?: number
  refresherPullDistance?: number
  isRefreshing?: boolean
  hasActionRail?: boolean
  actionRailOccupiedHeight?: number
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  showShare: false,
  showMenu: false,
  refresherEnabled: false,
  refresherTriggered: false,
  refresherThreshold: SECONDARY_PAGE_REFRESH_TRIGGER_OFFSET_PX,
  refresherPullDistance: 0,
  isRefreshing: false,
  hasActionRail: false,
  actionRailOccupiedHeight: SECONDARY_PAGE_ACTION_RAIL_OCCUPIED_HEIGHT_PX,
})

const emit = defineEmits<{
  back: []
  share: []
  openDrawer: []
  refresherpulling: [event: RefresherPullingEvent]
  refresherrefresh: []
  refresherrestore: []
  refresherabort: []
}>()

const { runtimeContext } = useResponsiveRailLayout()

const frameStyle = computed<CSSProperties>(() => {
  const safeTop = Math.max(runtimeContext.value.safeAreaTop, 0)
  const safeBottom = Math.max(runtimeContext.value.safeAreaBottom, 0)
  const refreshRailTopOffset = safeTop + SECONDARY_PAGE_TOPBAR_HEIGHT_PX
  const contentTopOffset = refreshRailTopOffset + SECONDARY_PAGE_CONTENT_INSET_PX
  const actionRailOccupiedHeight = Math.max(props.actionRailOccupiedHeight, 0)
  const contentBottomOffset = props.hasActionRail
    ? actionRailOccupiedHeight + safeBottom
    : safeBottom + SECONDARY_PAGE_EDGE_GAP_PX

  return {
    '--safe-top': `${safeTop}px`,
    '--safe-bottom': `${safeBottom}px`,
    '--topbar-height': `${SECONDARY_PAGE_TOPBAR_HEIGHT_PX}px`,
    '--page-content-inset': `${SECONDARY_PAGE_CONTENT_INSET_PX}px`,
    '--page-edge-gap': `${SECONDARY_PAGE_EDGE_GAP_PX}px`,
    '--action-rail-occupied-height': `${actionRailOccupiedHeight}px`,
    '--refresh-rail-top-offset': `${refreshRailTopOffset}px`,
    '--page-content-top-offset': `${contentTopOffset}px`,
    '--page-content-bottom-offset': `${contentBottomOffset}px`,
  } as CSSProperties
})

const refreshPullProgress = computed(() => {
  if (props.isRefreshing) {
    return 1
  }
  const threshold =
    props.refresherThreshold > 0
      ? props.refresherThreshold
      : SECONDARY_PAGE_REFRESH_TRIGGER_OFFSET_PX
  const pullDistance = Math.max(props.refresherPullDistance, 0)
  return Math.min(1, pullDistance / threshold)
})

const refreshIndicatorStyle = computed<CSSProperties>(() => {
  const progress = refreshPullProgress.value
  return {
    transform: `translate(-50%, ${8 + Math.round(progress * 24)}px)`,
    opacity: `${Number((progress * 0.96).toFixed(2))}`,
  } as CSSProperties
})

const handleOpenDrawer = (openDrawer?: () => void) => {
  openDrawer?.()
  emit('openDrawer')
}
</script>

<style scoped lang="scss">
.secondary-page-frame {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  height: 100dvh;
  background: var(--aether-page-background, #fafafa);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.secondary-page-frame-topbar-shell {
  position: absolute;
  inset: 0 0 auto;
  z-index: 20;
  padding-top: var(--safe-top, 0);
  background: transparent;
}

.secondary-page-frame-panel {
  position: relative;
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
}

.secondary-page-frame-refresh-rail {
  position: absolute;
  top: var(--refresh-rail-top-offset, 56px);
  left: 0;
  right: 0;
  z-index: 12;
  pointer-events: none;
}

.secondary-page-frame-refresh-indicator {
  position: absolute;
  left: 50%;
  top: 0;
}

.secondary-page-frame-refresh-indicator-surface {
  width: 36px;
  height: 36px;
  border-radius: 999px;
  background: var(--aether-panel-background, #ffffff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: #0f172a;
  box-shadow: var(--aether-shadow-overlay-float, 0 0 20px rgba(15, 23, 42, 0.09));
}

.secondary-page-frame-refresh-indicator.is-refreshing
  .secondary-page-frame-refresh-indicator-surface
  :deep(svg) {
  animation: secondary-page-refresh-spin 900ms linear infinite;
}

.secondary-page-frame-scroll {
  width: 100%;
  height: 100%;
}

.secondary-page-frame-content {
  width: 100%;
  box-sizing: border-box;
  padding: var(--page-content-top-offset, 72px) var(--page-content-inset, 16px)
    var(--page-content-bottom-offset, 112px);
  display: flex;
  flex-direction: column;
  gap: 32px;
}

.secondary-page-frame-action-rail {
  position: fixed;
  left: 50%;
  bottom: calc(
    max(var(--safe-bottom, 0px), var(--window-bottom, 0px)) + var(--page-edge-gap, 32px)
  );
  z-index: 20;
  transform: translateX(-50%);
  width: 272px;
  max-width: calc(100% - 24px);
  min-height: 0;
  padding: 0;
  box-sizing: border-box;
  border: none;
  background: transparent;
  box-shadow: none;
  overflow: visible;
}

@keyframes secondary-page-refresh-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
