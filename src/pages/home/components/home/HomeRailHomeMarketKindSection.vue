<!--
Responsibility: render the home market top-level kind switch for collections and blind boxes.
Out of scope: market query ownership, second-level tag state, and remote data fetching.
-->

<template>
  <view class="home-market-kind-section" role="tablist" aria-label="市场一级分类">
    <view class="home-market-kind-track">
      <view class="home-market-kind-indicator" :style="kindIndicatorStyle" aria-hidden="true" />
      <HomeInteractiveTarget
        v-for="option in props.marketKindOptions"
        :key="option.id"
        class="home-market-kind-option"
        :class="{ 'is-active': option.id === props.activeMarketKind }"
        interaction-mode="compact"
        :hit-width="46"
        :hit-height="44"
        hit-radius="8px"
        :label="`切换到${option.label}`"
        :selected="option.id === props.activeMarketKind"
        @activate="emit('market-kind-select', option.id)"
      >
        <text class="home-market-kind-label">{{ option.label }}</text>
      </HomeInteractiveTarget>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import type {
  HomeMarketKind,
  HomeMarketKindOption,
} from '../../../../models/home-rail/homeRailHome.model'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  marketKindOptions: HomeMarketKindOption[]
  activeMarketKind: HomeMarketKind
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'market-kind-select': [kind: HomeMarketKind]
}>()

const activeMarketKindIndex = computed(() => {
  const activeIndex = props.marketKindOptions.findIndex(
    (item) => item.id === props.activeMarketKind
  )
  return activeIndex >= 0 ? activeIndex : 0
})

const kindIndicatorStyle = computed<CSSProperties>(() => {
  const optionCount = Math.max(props.marketKindOptions.length, 1)
  return {
    width: `calc(100% / ${optionCount})`,
    transform: `translateX(${activeMarketKindIndex.value * 100}%)`,
  }
})
</script>

<style lang="scss" scoped>
.home-market-kind-section {
  position: relative;
  flex: 0 0 auto;
  align-self: center;
  min-width: 0;
  box-sizing: border-box;
  overflow: visible;
}

.home-market-kind-track {
  position: relative;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  width: 88px;
  height: 24px;
  padding: 0;
  border: 0;
  border-radius: 8px;
  background: #f1f3f5;
  box-shadow: inset 0 1px 3px rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
  overflow: visible;
}

.home-market-kind-indicator {
  position: absolute;
  top: 0;
  bottom: 0;
  left: 0;
  border-radius: 8px;
  background: #22d3ee;
  box-shadow: none;
  pointer-events: none;
  transition: transform 300ms cubic-bezier(0.4, 0, 0.2, 1);
  will-change: transform;
  z-index: 0;
}

.home-market-kind-option {
  position: relative;
  z-index: 1;
  min-width: 0;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  overflow: visible;
  transition:
    color 300ms ease,
    transform 180ms ease;
}

.home-market-kind-option.is-active {
  color: #ffffff;
}

.home-market-kind-option.is-entry-active {
  transform: scale(0.96);
}

.home-market-kind-label {
  font-size: 10px;
  line-height: 13px;
  font-weight: 900;
  letter-spacing: 0.12em;
  white-space: nowrap;
}
</style>
