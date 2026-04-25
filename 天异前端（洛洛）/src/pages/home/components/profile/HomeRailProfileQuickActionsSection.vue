<!--
Responsibility: render the profile quick action card and keep the local action entry shell
isolated from the parent profile panel.
Out of scope: route ownership, badge decision logic, and downstream page entry behavior.
-->
<template>
  <view class="home-profile-quick-card">
    <HomeInteractiveTarget
      v-for="entry in entries"
      :key="entry.id"
      class="home-profile-quick-entry"
      interaction-mode="block"
      :label="entry.label"
      @activate="emit('quick-entry-click', entry.routeUrl)"
    >
      <view class="home-profile-quick-icon-shell">
        <view
          v-if="entry.indicator?.visible"
          class="home-profile-quick-indicator"
          :class="`tone-${entry.indicator?.tone ?? 'cyan'}`"
        />
        <view class="home-profile-quick-icon">
          <AetherIcon :name="resolveIconName(entry.iconKey)" :size="22" :stroke-width="1.8" />
        </view>
      </view>
      <text class="home-profile-quick-label">{{ entry.label }}</text>
    </HomeInteractiveTarget>
  </view>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'
import type {
  HomeShellDrawerEntry,
  HomeShellIconKey,
} from '../../../../models/home-shell/homeShellMenu.model'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  entries: HomeShellDrawerEntry[]
  resolveIconName: (iconKey: HomeShellIconKey) => AetherIconName
}

defineProps<Props>()

const emit = defineEmits<{
  'quick-entry-click': [routeUrl: string]
}>()
</script>

<style lang="scss" scoped>
.home-profile-quick-card {
  border-radius: var(--aether-surface-radius-lg, 20px);
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  padding: 8px;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 4px;
}

.home-profile-quick-entry {
  position: relative;
  width: 100%;
  min-height: 68px;
  padding: 8px 4px;
  border-radius: var(--aether-surface-radius-sm, 12px);
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 4px;
  background: transparent;
  transition:
    color 180ms ease,
    filter 180ms ease;
}

.home-profile-quick-entry.is-entry-active {
  filter: none;
}

.home-profile-quick-entry.is-entry-active .home-profile-quick-icon-shell {
  background: rgba(17, 17, 17, 0.08);
  color: #06b6d4;
}

.home-profile-quick-entry.is-entry-active .home-profile-quick-label {
  color: #111111;
}

.home-profile-quick-icon-shell {
  position: relative;
  width: 44px;
  height: 44px;
  border-radius: 12px;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  background: transparent;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease;
}

.home-profile-quick-indicator {
  position: absolute;
  top: 4px;
  right: 4px;
  width: 6px;
  height: 6px;
  border-radius: 999px;
}

.home-profile-quick-indicator.tone-cyan {
  background: #22d3ee;
}

.home-profile-quick-indicator.tone-green {
  background: #34d399;
}

.home-profile-quick-indicator.tone-amber {
  background: #f59e0b;
}

.home-profile-quick-indicator.tone-rose {
  background: #f43f5e;
}

.home-profile-quick-indicator.tone-red {
  background: #ef4444;
}

.home-profile-quick-icon {
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-profile-quick-label {
  display: inline-block;
  min-width: 0;
  max-width: 100%;
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
  color: #6b7280;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform: scale(0.8333);
  transform-origin: center top;
  transition: color 180ms ease;
}

@media (hover: hover) and (pointer: fine) {
  .home-profile-quick-entry:hover .home-profile-quick-icon-shell {
    background: rgba(17, 17, 17, 0.045);
    color: #06b6d4;
  }

  .home-profile-quick-entry:hover .home-profile-quick-label {
    color: #111111;
  }
}
</style>
