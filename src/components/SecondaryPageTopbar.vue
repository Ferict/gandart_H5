<!--
Responsibility: render the standard secondary-page topbar with optional back affordance and
title slot while emitting navigation intent to the parent page shell.
Out of scope: page routing decisions, drawer state, and secondary-page content layout.
-->
<template>
  <view class="secondary-page-topbar">
    <HomeInteractiveTarget
      v-if="props.showBack"
      class="secondary-page-topbar-hit"
      interaction-mode="compact"
      label="返回上一页"
      @activate="emit('back')"
    >
      <view class="secondary-page-topbar-hit-visual">
        <AetherIcon
          class="secondary-page-topbar-back-icon"
          name="chevron-right"
          :size="28"
          :stroke-width="1.8"
        />
      </view>
    </HomeInteractiveTarget>
    <view v-else class="secondary-page-topbar-spacer" aria-hidden="true" />

    <view class="secondary-page-topbar-copy">
      <text class="secondary-page-topbar-title">{{ props.title }}</text>
    </view>

    <template v-if="hasRightSlot">
      <view class="secondary-page-topbar-slot">
        <slot name="right" />
      </view>
    </template>
    <HomeInteractiveTarget
      v-else-if="shouldShowShare"
      class="secondary-page-topbar-hit"
      interaction-mode="compact"
      label="分享当前页面"
      @activate="emit('share')"
    >
      <view class="secondary-page-topbar-hit-visual">
        <AetherIcon name="share" :size="22" :stroke-width="2" />
      </view>
    </HomeInteractiveTarget>
    <HomeInteractiveTarget
      v-else-if="shouldShowMenu"
      class="secondary-page-topbar-hit"
      interaction-mode="compact"
      label="打开更多服务"
      @activate="emit('openDrawer')"
    >
      <view class="secondary-page-topbar-hit-visual">
        <AetherIcon name="menu" :size="24" :stroke-width="1.9" />
      </view>
    </HomeInteractiveTarget>
    <view v-else class="secondary-page-topbar-spacer" aria-hidden="true" />
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import AetherIcon from './AetherIcon.vue'
import HomeInteractiveTarget from './HomeInteractiveTarget.vue'

interface Props {
  title: string
  showBack?: boolean
  showShare?: boolean
  showMenu?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  showBack: true,
  showShare: false,
  showMenu: false,
})

const emit = defineEmits<{
  back: []
  share: []
  openDrawer: []
}>()

const slots = useSlots()

const hasRightSlot = computed(() => Boolean(slots.right))

// When a page wants a more complex right-side action, the slot takes over completely.
const shouldShowShare = computed(() => !hasRightSlot.value && props.showShare)
const shouldShowMenu = computed(() => !hasRightSlot.value && !props.showShare && props.showMenu)
</script>

<style scoped lang="scss">
.secondary-page-topbar {
  min-height: 56px;
  padding: 16px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: 24px minmax(0, 1fr) 24px;
  align-items: center;
  gap: 12px;
  border-bottom: none;
  background: #fafafa;
  box-shadow: 0 0 0 rgba(15, 23, 42, 0);
}

.secondary-page-topbar-hit,
.secondary-page-topbar-spacer,
.secondary-page-topbar-slot {
  width: 24px;
  min-width: 24px;
  height: 24px;
}

.secondary-page-topbar-hit {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #475569;
}

.secondary-page-topbar-hit-visual {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.secondary-page-topbar-back-icon {
  transform: rotate(180deg);
}

.secondary-page-topbar-copy {
  min-width: 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.secondary-page-topbar-title {
  max-width: 100%;
  color: #111111;
  font-size: 20px;
  line-height: 24px;
  font-weight: 600;
  letter-spacing: -0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.secondary-page-topbar-slot {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
