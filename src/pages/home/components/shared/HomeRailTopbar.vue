<!--
Responsibility: render the shared home rail topbar brand area and optional drawer trigger for
rail pages without owning shell navigation state.
Out of scope: drawer menu content, page scroll policy, and topbar host layout decisions.
-->

<template>
  <view class="home-topbar" :class="{ 'is-scrolled': props.isScrolled }">
    <view class="home-topbar-copy">
      <view class="home-topbar-brand-wrap">
        <image class="home-topbar-title-logo" src="/static/logo/tianyi.svg" mode="heightFix" />
        <view class="home-topbar-dot-slot"><view class="home-topbar-dot" /></view>
      </view>
    </view>

    <HomeInteractiveTarget
      v-if="props.canOpenDrawer"
      class="home-topbar-menu-entry"
      interaction-mode="compact"
      label="打开更多服务"
      @activate="emit('openDrawer')"
    >
      <AetherIcon class="home-topbar-menu-icon" name="menu" :size="28" :stroke-width="1.8" />
    </HomeInteractiveTarget>
  </view>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  canOpenDrawer?: boolean
  isScrolled?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  canOpenDrawer: false,
  isScrolled: false,
})

const emit = defineEmits<{
  openDrawer: []
}>()
</script>

<style lang="scss" scoped>
.home-topbar {
  position: relative;
  min-height: 64px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  border-radius: 0;
  border: none;
  background: transparent;
  box-shadow: none;
  transition: none;
}

.home-topbar::after {
  display: none;
}

.home-topbar.is-scrolled {
  background: transparent;
  box-shadow: none;
}

.home-topbar-copy {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: flex-start;
  gap: 0;
}

@media screen and (width < 430px) {
  .home-topbar {
    padding: 16px;
  }
}

.home-topbar-brand-wrap {
  display: inline-flex;
  align-items: flex-end;
  justify-content: flex-start;
  width: max-content;
  height: 18px;
  gap: 2px;
  box-sizing: border-box;
}

.home-topbar-title-logo {
  height: 18px;
  width: auto;
  display: block;
  flex-shrink: 0;
  filter: brightness(0) saturate(100%);
  opacity: 0.94;
  -webkit-mask-image: linear-gradient(
    to top left,
    rgba(0, 0, 0, 0.22) 0%,
    rgba(0, 0, 0, 0.46) 28%,
    rgba(0, 0, 0, 0.72) 56%,
    rgba(0, 0, 0, 0.9) 80%,
    rgba(0, 0, 0, 1) 100%
  );
  mask-image: linear-gradient(
    to top left,
    rgba(0, 0, 0, 0.22) 0%,
    rgba(0, 0, 0, 0.46) 28%,
    rgba(0, 0, 0, 0.72) 56%,
    rgba(0, 0, 0, 0.9) 80%,
    rgba(0, 0, 0, 1) 100%
  );
  -webkit-mask-repeat: no-repeat;
  mask-repeat: no-repeat;
}

.home-topbar-dot-slot {
  width: 8px;
  height: 18px;
  display: flex;
  align-items: flex-end;
  justify-content: flex-start;
  pointer-events: none;
}

.home-topbar-dot {
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22d3ee;
  margin-bottom: 1px;
}

.home-topbar-menu-entry {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  transition: transform 180ms ease;
}

.home-topbar-menu-icon {
  color: #475569;
  flex-shrink: 0;
  transition: color 180ms ease;
}

.is-entry-active {
  transform: scale(0.985);
}

@media (hover: hover) and (pointer: fine) {
  .home-topbar-menu-entry:hover {
    transform: translateY(-1px) scale(1.02);
  }

  .home-topbar-menu-entry:hover .home-topbar-menu-icon {
    color: #334155;
  }
}
</style>
