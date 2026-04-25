<!--
Responsibility: render the activity rail entry highlight group template and keep the top-card
composition isolated from parent panel markup.
Out of scope: activity entry data assembly, navigation dispatch, and scene-level runtime effects.
-->
<template>
  <view class="home-activity-entry-stack">
    <view class="home-activity-entry-grid">
      <HomeInteractiveTarget
        v-if="assetMergeEntry"
        class="home-activity-entry home-activity-entry-lead is-synthesis-entry"
        :class="{ 'is-scene-patch-light': isActivityScenePatchMotionReduced }"
        :label="'查看 ' + assetMergeEntry.title"
        @activate="emit('entry-click', assetMergeEntry)"
      >
        <view class="home-activity-entry-lead-shell">
          <view class="home-activity-entry-layer home-activity-entry-layer-dark is-synthesis-card">
            <view class="home-activity-entry-eyebrow">{{ assetMergeEntry.eyebrow }}</view>
            <view class="home-activity-entry-copy">
              <text class="home-activity-entry-title home-activity-entry-title-light">{{
                assetMergeEntry.title
              }}</text>
              <text class="home-activity-entry-desc home-activity-entry-desc-light">{{
                assetMergeEntry.description
              }}</text>
            </view>
          </view>
        </view>
      </HomeInteractiveTarget>

      <HomeInteractiveTarget
        v-if="priorityDrawEntry"
        class="home-activity-entry home-activity-entry-side"
        :class="{ 'is-scene-patch-light': isActivityScenePatchMotionReduced }"
        :label="'查看 ' + priorityDrawEntry.title"
        @activate="emit('entry-click', priorityDrawEntry)"
      >
        <view class="home-activity-entry-side-shell">
          <view class="home-activity-entry-layer home-activity-entry-layer-light">
            <view class="home-activity-entry-eyebrow is-soft">{{ priorityDrawEntry.eyebrow }}</view>
            <view class="home-activity-entry-copy is-side">
              <view class="home-activity-entry-side-icon is-muted">
                <AetherIcon name="gift" :size="16" :stroke-width="1.8" />
              </view>
              <text class="home-activity-entry-title">{{ priorityDrawEntry.title }}</text>
            </view>
          </view>
        </view>
      </HomeInteractiveTarget>
    </view>

    <HomeInteractiveTarget
      v-if="networkInviteEntry"
      class="home-activity-entry home-activity-entry-inline"
      :class="{ 'is-scene-patch-light': isActivityScenePatchMotionReduced }"
      :label="'查看 ' + networkInviteEntry.title"
      @activate="emit('entry-click', networkInviteEntry)"
    >
      <view class="home-activity-entry-inline-shell">
        <view class="home-activity-entry-copy is-inline">
          <text class="home-activity-entry-title">{{ networkInviteEntry.title }}</text>
          <text class="home-activity-entry-desc">{{ networkInviteEntry.description }}</text>
        </view>
        <view class="home-activity-entry-inline-icon">
          <AetherIcon name="user-plus" :size="20" :stroke-width="1.8" />
        </view>
      </view>
    </HomeInteractiveTarget>
  </view>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import type { ActivityEntry } from '../../../../models/home-rail/homeRailActivity.model'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  assetMergeEntry?: ActivityEntry | null
  priorityDrawEntry?: ActivityEntry | null
  networkInviteEntry?: ActivityEntry | null
  isActivityScenePatchMotionReduced: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'entry-click': [entry: ActivityEntry]
}>()
</script>

<style lang="scss" scoped>
.home-activity-entry-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.home-activity-entry-grid {
  display: grid;
  grid-template-columns: minmax(0, 1.6fr) minmax(0, 1fr);
  gap: 12px;
}

.home-activity-entry {
  display: block;
}

.home-activity-entry-lead,
.home-activity-entry-side,
.home-activity-entry-inline {
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

.home-activity-entry-lead,
.home-activity-entry-side,
.home-activity-entry-inline {
  --home-activity-card-radius: 20px;

  position: relative;
  overflow: visible;
}

.home-activity-entry-lead.is-scene-patch-light,
.home-activity-entry-side.is-scene-patch-light,
.home-activity-entry-inline.is-scene-patch-light,
.home-activity-entry-lead.is-scene-patch-light .home-activity-entry-lead-shell,
.home-activity-entry-inline.is-scene-patch-light .home-activity-entry-inline-shell,
.home-activity-entry-side.is-scene-patch-light .home-activity-entry-side-shell,
.home-activity-entry-lead.is-scene-patch-light .home-activity-entry-lead-shell::before,
.home-activity-entry-side.is-scene-patch-light .home-activity-entry-side-shell::before,
.home-activity-entry-inline.is-scene-patch-light .home-activity-entry-inline-shell::before {
  transition: none;
}

.home-activity-entry-side {
  overflow: visible;
}

.home-activity-entry-side-shell {
  position: relative;
  width: 100%;
  border-radius: var(--home-activity-card-radius, 20px);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  overflow: hidden;
}

.home-activity-entry-side-shell > .home-activity-entry-layer {
  border-radius: inherit;
}

.home-activity-entry-lead-shell,
.home-activity-entry-inline-shell {
  position: relative;
  width: 100%;
  border-radius: var(--home-activity-card-radius, 20px);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  overflow: hidden;
}

.home-activity-entry-lead-shell {
  min-height: 140px;
}

.home-activity-entry-lead-shell::before,
.home-activity-entry-side-shell::before,
.home-activity-entry-inline-shell::before {
  content: '';
  position: absolute;
  left: 0;
  top: var(--home-activity-card-radius);
  bottom: var(--home-activity-card-radius);
  width: var(--aether-entry-accent-line-width, 2px);
  background: var(--aether-entry-accent-line-color, #22d3ee);
  transform: translateX(-100%);
  opacity: 0;
  transition: var(--aether-entry-accent-line-transition, transform 180ms ease, opacity 180ms ease);
  z-index: 3;
  pointer-events: none;
  border-radius: 999px;
}

@media (hover: hover) and (pointer: fine) {
  .home-activity-entry-lead:hover,
  .home-activity-entry-side:hover,
  .home-activity-entry-inline:hover {
    transform: translateY(var(--aether-entry-hover-lift-y, -2px));
  }

  .home-activity-entry-lead:hover .home-activity-entry-lead-shell::before,
  .home-activity-entry-side:hover .home-activity-entry-side-shell::before,
  .home-activity-entry-inline:hover .home-activity-entry-inline-shell::before {
    transform: translateX(0);
    opacity: 1;
  }

  .home-activity-entry-lead.is-synthesis-entry:hover .home-activity-entry-lead-shell {
    box-shadow: var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08));
  }

  .home-activity-entry-lead.is-synthesis-entry:hover
    .home-activity-entry-layer-dark.is-synthesis-card::after {
    opacity: 1;
  }
}

.home-activity-entry-lead.is-entry-active,
.home-activity-entry-side.is-entry-active,
.home-activity-entry-inline.is-entry-active {
  transform: scale(var(--aether-entry-active-scale, 0.985));
}

.home-activity-entry-lead.is-entry-active .home-activity-entry-lead-shell::before,
.home-activity-entry-side.is-entry-active .home-activity-entry-side-shell::before,
.home-activity-entry-inline.is-entry-active .home-activity-entry-inline-shell::before {
  transform: translateX(0);
  opacity: 1;
}

.home-activity-entry-lead.is-synthesis-entry.is-entry-active .home-activity-entry-lead-shell {
  box-shadow: var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08));
}

.home-activity-entry-lead.is-synthesis-entry.is-entry-active
  .home-activity-entry-layer-dark.is-synthesis-card::after {
  opacity: 1;
}

.home-activity-entry-layer {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  gap: 16px;
  min-height: 100%;
  padding: 16px;
  border-radius: inherit;
  box-sizing: border-box;
  overflow: hidden;
}

.home-activity-entry-layer-dark {
  background: linear-gradient(180deg, #111111 0%, #111827 100%);
  color: #ffffff;
}

.home-activity-entry-layer-dark.is-synthesis-card {
  min-height: 140px;
  background:
    radial-gradient(circle at 86% 18%, rgba(34, 211, 238, 0.34), transparent 30%),
    linear-gradient(180deg, #111111 0%, #111827 100%);
}

.home-activity-entry-layer-dark.is-synthesis-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 14% 84%, rgba(125, 211, 252, 0.14), transparent 30%),
    linear-gradient(135deg, rgba(255, 255, 255, 0.16), transparent 42%);
  opacity: 0.72;
  pointer-events: none;
  transition: opacity 180ms ease;
}

.home-activity-entry-layer-dark.is-synthesis-card > * {
  position: relative;
  z-index: 1;
}

.home-activity-entry-layer-light {
  min-height: 140px;
  background: #ffffff;
}

.home-activity-entry-inline-shell {
  min-height: 88px;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  background: #ffffff;
}

.home-activity-entry-eyebrow {
  font-size: 11px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
  color: rgba(203, 213, 225, 0.82);
  text-transform: uppercase;
}

.home-activity-entry-copy {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.home-activity-entry-copy.is-inline {
  min-width: 0;
  flex: 1 1 auto;
}

.home-activity-entry-copy.is-side {
  min-height: 100%;
  justify-content: space-between;
}

.home-activity-entry-title {
  font-size: 16px;
  line-height: 20px;
  font-weight: 800;
  color: #111111;
}

.home-activity-entry-title-light {
  color: #ffffff;
}

.home-activity-entry-desc {
  font-size: 12px;
  line-height: 16px;
  color: #64748b;
}

.home-activity-entry-desc-light {
  color: rgba(226, 232, 240, 0.76);
}

.home-activity-entry-side-icon {
  width: 32px;
  height: 32px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(17, 17, 17, 0.04);
}

.home-activity-entry-eyebrow.is-soft {
  color: #94a3b8;
}

.home-activity-entry-copy.is-side .home-activity-entry-title {
  color: #111111;
}

.home-activity-entry-side-icon.is-muted {
  color: #94a3b8;
}

.home-activity-entry-inline {
  width: 100%;
}

.home-activity-entry-inline-shell::before {
  content: '';
  position: absolute;
  inset: 0;
  border-radius: inherit;
  background: radial-gradient(circle at 84% 22%, rgba(34, 211, 238, 0.1), transparent 28%);
  pointer-events: none;
}

.home-activity-entry-inline-icon {
  position: relative;
  z-index: 1;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #111111;
  background: rgba(17, 17, 17, 0.04);
  flex: 0 0 auto;
}
</style>
