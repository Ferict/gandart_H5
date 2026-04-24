<!--
Responsibility: render the market head section template, including title copy, search trigger,
and sort popover presentation for the home rail.
Out of scope: query state execution, search visibility orchestration, and sort selection policy.
-->
<template>
  <view class="home-market-head">
    <view class="home-market-title-group">
      <text class="home-market-title">{{ title }}</text>
      <text class="home-market-subtitle">{{ subtitle }}</text>
    </view>

    <view class="home-market-actions">
      <HomeInteractiveTarget
        class="home-market-action-entry"
        :class="{ 'is-active': isMarketSearchActive }"
        interaction-mode="compact"
        :label="isMarketSearchActive ? '收起市场搜索' : marketSearchActionLabel"
        @activate="emit('market-search-click')"
      >
        <AetherIcon class="home-market-action-icon" name="search" :size="16" :stroke-width="2" />
      </HomeInteractiveTarget>

      <view :ref="handleMarketSortLayerRef" class="home-market-sort-layer">
        <HomeInteractiveTarget
          class="home-market-action-entry home-market-sort-trigger"
          :class="{ 'is-active': isMarketSortPopoverOpen }"
          interaction-mode="compact"
          :label="marketSortTriggerLabel"
          @activate="emit('market-sort-trigger-click')"
        >
          <AetherIcon
            class="home-market-action-icon"
            name="sliders-horizontal"
            :size="15"
            :stroke-width="2"
          />
        </HomeInteractiveTarget>

        <transition name="home-market-sort-popover">
          <view
            v-if="isMarketSortPopoverOpen"
            class="home-market-sort-popover"
            :class="`is-${marketSortPopoverPlacement}`"
          >
            <HomeInteractiveTarget
              v-for="option in marketSortMenuOptions"
              :key="option.key"
              class="home-market-sort-option"
              :class="{ 'is-active': isMarketSortOptionActive(option) }"
              :label="resolveMarketSortOptionAriaLabel(option)"
              @activate="emit('market-sort-option-select', option)"
            >
              <view class="home-market-sort-option-shell">
                <text class="home-market-sort-option-text">{{ option.label }}</text>
                <AetherIcon
                  v-if="!option.isDefault && isMarketSortOptionActive(option)"
                  class="home-market-sort-option-direction"
                  :class="{ 'is-desc': marketSortDirection === 'desc' }"
                  name="triangle"
                  :size="10"
                  :stroke-width="1.8"
                />
              </view>
            </HomeInteractiveTarget>
          </view>
        </transition>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { ComponentPublicInstance } from 'vue'
import AetherIcon from '../../../../components/AetherIcon.vue'
import type { HomeMarketSortDirection } from '../../../../models/home-rail/homeRailHome.model'
import type { HomeMarketSortMenuOption } from '../../composables/home/useHomeMarketSortPopoverRuntime'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  title: string
  subtitle: string
  isMarketSearchActive: boolean
  marketSearchActionLabel: string
  isMarketSortPopoverOpen: boolean
  marketSortTriggerLabel: string
  marketSortMenuOptions: HomeMarketSortMenuOption[]
  marketSortPopoverPlacement: 'down' | 'up'
  marketSortDirection: HomeMarketSortDirection
  setMarketSortLayerRef: (element: HTMLElement | null) => void
  isMarketSortOptionActive: (option: HomeMarketSortMenuOption) => boolean
  resolveMarketSortOptionAriaLabel: (option: HomeMarketSortMenuOption) => string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'market-search-click': []
  'market-sort-trigger-click': []
  'market-sort-option-select': [option: HomeMarketSortMenuOption]
}>()

const handleMarketSortLayerRef = (element: Element | ComponentPublicInstance | null) => {
  props.setMarketSortLayerRef(element instanceof HTMLElement ? element : null)
}
</script>

<style lang="scss" scoped>
.home-market-head {
  padding-left: 0;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 8px;
}

.home-market-title-group {
  min-width: 0;
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding-left: 4px;
}

.home-market-title {
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  color: #111111;
}

.home-market-subtitle {
  min-height: 12px;
  display: inline-block;
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
  text-transform: uppercase;
  color: #22d3ee;
  letter-spacing: 0.18em;
  transform: scale(0.75);
  transform-origin: left bottom;
  vertical-align: baseline;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-market-actions {
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: visible;
}

.is-entry-active {
  transform: scale(var(--aether-entry-active-scale, 0.985));
}

.home-market-sort-layer {
  position: relative;
  flex: 0 0 auto;
  z-index: 9;
}

.home-market-action-entry {
  position: relative;
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
  overflow: visible;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.home-market-action-entry.is-entry-active {
  transform: scale(0.94);
}

.home-market-action-entry.is-active .home-market-action-icon {
  color: #22d3ee;
}

.home-market-action-icon {
  position: relative;
  z-index: 1;
  color: #6b7280;
  flex-shrink: 0;
  pointer-events: none;
  transition: color 160ms ease;
}

.home-market-sort-trigger {
  width: 24px;
  height: 24px;
  padding: 0;
  gap: 0;
  border-radius: 999px;
  border: none;
  background: transparent;
  box-shadow: none;
}

.home-market-sort-option-direction.is-desc {
  transform: rotate(180deg);
}

.home-market-sort-popover {
  position: absolute;
  right: 0;
  z-index: 10;
  min-width: 148px;
  padding: 8px;
  border-radius: var(--aether-surface-radius-sm, 12px);
  background: rgba(255, 255, 255, 0.98);
  box-shadow:
    0 18px 44px rgba(15, 23, 42, 0.12),
    0 4px 12px rgba(15, 23, 42, 0.08);
  backdrop-filter: blur(10px);
}

.home-market-sort-popover.is-down {
  top: calc(100% + 8px);
  bottom: auto;
  transform-origin: top right;
}

.home-market-sort-popover.is-up {
  top: auto;
  bottom: calc(100% + 8px);
  transform-origin: bottom right;
}

.home-market-sort-option {
  min-width: 0;
  min-height: 0;
  padding: 0;
  border-radius: 0;
  display: block;
  overflow: visible;
  background: transparent;
  box-shadow: none;
}

.home-market-sort-option-shell {
  min-width: 0;
  min-height: 44px;
  padding: 0 8px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  background: #ffffff;
  box-sizing: border-box;
  transition:
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.home-market-sort-option.is-active .home-market-sort-option-shell {
  background: #f0f9ff;
}

.home-market-sort-option-text {
  min-width: 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 600;
  color: #334155;
  white-space: nowrap;
}

.home-market-sort-option-direction {
  flex: 0 0 auto;
  color: #22d3ee;
  transition: transform 160ms ease;
}

.home-market-sort-popover-enter-active,
.home-market-sort-popover-leave-active {
  transition:
    opacity 160ms ease,
    transform 160ms ease;
}

.home-market-sort-popover-enter-from,
.home-market-sort-popover-leave-to {
  opacity: 0;
}

.home-market-sort-popover.is-down.home-market-sort-popover-enter-from,
.home-market-sort-popover.is-down.home-market-sort-popover-leave-to {
  transform: translateY(-6px) scale(0.98);
}

.home-market-sort-popover.is-up.home-market-sort-popover-enter-from,
.home-market-sort-popover.is-up.home-market-sort-popover-leave-to {
  transform: translateY(6px) scale(0.98);
}

@media (hover: hover) and (pointer: fine) {
  .home-market-action-entry:hover {
    transform: translateY(-1px);
  }

  .home-market-action-entry:hover .home-market-action-icon {
    color: #475569;
  }

  .home-market-sort-option:hover .home-market-sort-option-shell {
    background: #ffffff;
    box-shadow: var(--aether-shadow-soft-xs, 0 0 16px rgba(15, 23, 42, 0.04));
  }
}
</style>
