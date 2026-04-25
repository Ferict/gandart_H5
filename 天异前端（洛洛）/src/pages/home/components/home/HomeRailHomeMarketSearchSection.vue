<!--
Responsibility: render the market search reveal section and keep the search-stage template and
local animation markup isolated from the parent market panel.
Out of scope: keyword state ownership, reveal timing decisions, and query execution behavior.
-->
<template>
  <transition
    name="home-market-search-reveal"
    @before-enter="emit('search-before-enter', $event)"
    @enter="(element, done) => emit('search-enter', element, done)"
    @after-enter="emit('search-after-enter', $event)"
    @before-leave="emit('search-before-leave', $event)"
    @leave="(element, done) => emit('search-leave', element, done)"
    @after-leave="emit('search-after-leave', $event)"
  >
    <view v-if="isMarketSearchVisible" class="home-market-search-stage">
      <view class="home-market-search-stage-body">
        <view class="home-market-search-card">
          <view class="home-market-search-shell">
            <AetherIcon
              class="home-market-search-icon"
              name="search"
              :size="18"
              :stroke-width="1.9"
            />
            <input
              class="home-market-search-input"
              :value="marketKeyword"
              :focus="isMarketSearchVisible"
              placeholder="搜索藏品标题 / 分区"
              confirm-type="search"
              @input="emit('market-keyword-input', $event)"
            />
            <HomeInteractiveTarget
              v-if="hasActiveMarketSearch"
              class="home-market-search-clear"
              interaction-mode="compact"
              label="清空市场搜索"
              @activate="emit('market-keyword-clear')"
            >
              <AetherIcon
                class="home-market-search-clear-icon"
                name="x"
                :size="16"
                :stroke-width="2"
              />
            </HomeInteractiveTarget>
          </view>
        </view>
      </view>
    </view>
  </transition>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  isMarketSearchVisible: boolean
  hasActiveMarketSearch: boolean
  marketKeyword: string
}

defineProps<Props>()

const emit = defineEmits<{
  'market-keyword-input': [event: Event]
  'market-keyword-clear': []
  'search-before-enter': [event: Element]
  'search-enter': [event: Element, done: () => void]
  'search-after-enter': [event: Element]
  'search-before-leave': [event: Element]
  'search-leave': [event: Element, done: () => void]
  'search-after-leave': [event: Element]
}>()
</script>

<style lang="scss" scoped>
.home-market-search-stage {
  display: block;
}

.home-market-search-stage-body {
  min-height: 0;
  overflow: visible;
}

.home-market-search-card {
  opacity: 1;
  transform: translateY(0);
}

.home-market-search-shell {
  min-height: var(--aether-search-shell-height, 48px);
  border-radius: var(--aether-search-shell-radius, 12px);
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft-xs, 0 0 16px rgba(15, 23, 42, 0.04));
  padding: 0 var(--aether-search-shell-inline-padding, 12px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--aether-search-shell-gap, 8px);
}

.home-market-search-icon {
  flex-shrink: 0;
  color: #94a3b8;
}

.home-market-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: var(--aether-search-shell-height, 48px);
  font-size: 14px;
  line-height: 20px;
  color: #111111;
}

.home-market-search-clear {
  width: 24px;
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.home-market-search-clear-icon {
  color: #94a3b8;
}

.home-market-search-reveal-enter-active,
.home-market-search-reveal-leave-active {
  overflow: hidden;
}

.home-market-search-reveal-enter-active .home-market-search-card,
.home-market-search-reveal-leave-active .home-market-search-card {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.home-market-search-reveal-enter-active .home-market-search-card {
  transition-delay: 0ms;
}

.home-market-search-reveal-leave-active .home-market-search-card {
  transition-delay: 0ms;
}

.home-market-search-reveal-enter-from .home-market-search-card,
.home-market-search-reveal-leave-to .home-market-search-card {
  opacity: 0;
  transform: translateY(-4px);
}

.home-market-search-reveal-enter-to .home-market-search-card,
.home-market-search-reveal-leave-from .home-market-search-card {
  opacity: 1;
  transform: translateY(0);
}
</style>
