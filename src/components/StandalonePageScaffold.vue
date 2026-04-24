<!--
Responsibility: provide the standalone secondary-page shell that reuses the home navigation rail
and drawer frame around non-home pages.
Out of scope: standalone page business content, route query parsing, and drawer menu state logic.
-->
<template>
  <view
    class="standalone-page-scaffold"
    :class="{ 'is-drawer-open': isDrawerOpen, 'is-wide-rail-mode': isWideRailVisible }"
    :style="scaffoldStyle"
  >
    <view class="standalone-page-scaffold-stage">
      <view
        class="standalone-page-scaffold-frame"
        :class="{ 'is-wide-rail-mode': isWideRailVisible }"
      >
        <HomeShellNavRail
          v-if="isWideRailVisible"
          class="standalone-page-scaffold-rail"
          :runtime-context="runtimeContext"
          :can-expand-drawer="true"
          :active-entry-id="props.activeNavEntryId"
          @open-drawer="handleDrawerOpen"
        />

        <view class="standalone-page-scaffold-main">
          <slot
            :can-open-drawer="true"
            :open-drawer="handleDrawerOpen"
            :is-wide-rail-mode="isWideRailMode"
            :is-wide-rail-visible="isWideRailVisible"
          />
        </view>
      </view>

      <HomeShellDrawer
        :open="isDrawerOpen"
        :runtime-context="runtimeContext"
        @close="handleDrawerClose"
      />
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, onUnmounted, ref, watch, type CSSProperties } from 'vue'
import type { HomeShellDrawerEntryId } from '../models/home-shell/homeShellMenu.model'
import { useResponsiveRailLayout } from '../composables/useResponsiveRailLayout'
import {
  clearHomeShellDocumentScrollLock,
  syncHomeShellDocumentScrollLock,
} from '../services/home-shell/homeShellDom.service'
import HomeShellDrawer from './HomeShellDrawer.vue'
import HomeShellNavRail from './HomeShellNavRail.vue'

interface Props {
  activeNavEntryId?: HomeShellDrawerEntryId
  routeSource: string
}

const WIDE_RAIL_ENTER_WIDTH = 768

const props = defineProps<Props>()

const { runtimeContext } = useResponsiveRailLayout()
const isDrawerOpen = ref(false)
const isWideRailMode = computed(() => runtimeContext.value.viewportWidth >= WIDE_RAIL_ENTER_WIDTH)
const isWideRailVisible = computed(() => isWideRailMode.value)

const scaffoldStyle = computed<CSSProperties>(() => {
  return {
    '--standalone-page-max-width': '430px',
    '--standalone-page-rail-gap': '12px',
  } as CSSProperties
})

watch(
  isDrawerOpen,
  (isLocked) => {
    syncHomeShellDocumentScrollLock(isLocked)
  },
  { immediate: true }
)

onUnmounted(() => {
  clearHomeShellDocumentScrollLock()
})

const handleDrawerOpen = () => {
  isDrawerOpen.value = true
}

const handleDrawerClose = () => {
  isDrawerOpen.value = false
}
</script>

<style lang="scss" scoped>
.standalone-page-scaffold {
  width: 100%;
  min-height: 100dvh;
  background: #fafafa;
}

.standalone-page-scaffold.is-drawer-open {
  height: 100dvh;
  overflow: hidden;
}

.standalone-page-scaffold-stage {
  position: relative;
  width: 100%;
  min-height: 100dvh;
  background: #fafafa;
  display: flex;
  justify-content: center;
}

.standalone-page-scaffold-frame {
  width: 100%;
  min-height: 100dvh;
}

.standalone-page-scaffold-frame.is-wide-rail-mode {
  width: min(
    calc(var(--standalone-page-max-width, 430px) + 76px + var(--standalone-page-rail-gap, 12px)),
    100%
  );
  min-height: 100dvh;
  display: grid;
  grid-template-columns: 76px minmax(0, var(--standalone-page-max-width, 430px));
  column-gap: var(--standalone-page-rail-gap, 12px);
  justify-content: center;
  align-items: start;
  padding: 16px 0 24px;
  box-sizing: border-box;
}

.standalone-page-scaffold-rail {
  align-self: stretch;
}

.standalone-page-scaffold-main {
  width: 100%;
  min-width: 0;
  min-height: 100dvh;
  background: #fafafa;
}

.standalone-page-scaffold-frame.is-wide-rail-mode .standalone-page-scaffold-main {
  min-height: calc(100dvh - 40px);
}
</style>
