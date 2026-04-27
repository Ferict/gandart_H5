<!--
Responsibility: render the market head section template, including title copy and market kind
switch for the home rail.
Out of scope: query state execution and search visibility orchestration.
-->
<template>
  <view class="home-market-head">
    <view class="home-market-title-group">
      <text class="home-market-title">{{ marketHeadCopy.title }}</text>
      <text class="home-market-subtitle">{{ marketHeadCopy.subtitle }}</text>
    </view>

    <HomeRailHomeMarketKindSection
      :market-kind-options="marketKindOptions"
      :active-market-kind="activeMarketKind"
      @market-kind-select="emit('market-kind-select', $event)"
    />
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type {
  HomeMarketKind,
  HomeMarketKindOption,
} from '../../../../models/home-rail/homeRailHome.model'
import HomeRailHomeMarketKindSection from './HomeRailHomeMarketKindSection.vue'

interface Props {
  title: string
  subtitle: string
  marketKindOptions: HomeMarketKindOption[]
  activeMarketKind: HomeMarketKind
}

interface MarketHeadCopy {
  title: string
  subtitle: string
}

const props = defineProps<Props>()

const emit = defineEmits<{
  'market-kind-select': [kind: HomeMarketKind]
}>()

const resolveMarketHeadCopy = (
  activeMarketKind: HomeMarketKind,
  fallbackTitle: string,
  fallbackSubtitle: string
): MarketHeadCopy => {
  if (activeMarketKind === 'blindBoxes') {
    return {
      title: '盲盒市场',
      subtitle: 'BLIND BOX',
    }
  }

  return {
    title: fallbackTitle,
    subtitle: fallbackSubtitle,
  }
}

const marketHeadCopy = computed(() =>
  resolveMarketHeadCopy(props.activeMarketKind, props.title, props.subtitle)
)
</script>

<style lang="scss" scoped>
.home-market-head {
  padding-left: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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
  white-space: nowrap;
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
  white-space: nowrap;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}
</style>
