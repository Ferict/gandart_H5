<!--
Responsibility: render the profile search reveal section and keep the search-stage
markup and local animation shell isolated from the parent profile panel.
Out of scope: keyword ownership, reveal timing decisions, and query execution behavior.
-->
<template>
  <transition
    name="home-profile-search-reveal"
    @before-enter="emit('search-before-enter', $event)"
    @enter="(element, done) => emit('search-enter', element, done)"
    @after-enter="emit('search-after-enter', $event)"
    @before-leave="emit('search-before-leave', $event)"
    @leave="(element, done) => emit('search-leave', element, done)"
    @after-leave="emit('search-after-leave', $event)"
  >
    <view v-if="isProfileSearchVisible" class="home-profile-search-stage">
      <view class="home-profile-search-stage-body">
        <view class="home-profile-search-card">
          <view class="home-profile-search-shell">
            <AetherIcon
              class="home-profile-search-icon"
              name="search"
              :size="18"
              :stroke-width="1.9"
            />
            <input
              class="home-profile-search-input"
              :value="profileKeyword"
              :focus="isProfileSearchVisible"
              placeholder="搜索资产标题 / 分区"
              confirm-type="search"
              @input="emit('profile-keyword-input', $event)"
            />
            <HomeInteractiveTarget
              v-if="hasActiveProfileSearch"
              class="home-profile-search-clear"
              interaction-mode="compact"
              label="清空资产搜索"
              @activate="emit('profile-keyword-clear')"
            >
              <AetherIcon
                class="home-profile-search-clear-icon"
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
  isProfileSearchVisible: boolean
  hasActiveProfileSearch: boolean
  profileKeyword: string
}

defineProps<Props>()

const emit = defineEmits<{
  'profile-keyword-input': [event: Event]
  'profile-keyword-clear': []
  'search-before-enter': [event: Element]
  'search-enter': [event: Element, done: () => void]
  'search-after-enter': [event: Element]
  'search-before-leave': [event: Element]
  'search-leave': [event: Element, done: () => void]
  'search-after-leave': [event: Element]
}>()
</script>

<style lang="scss" scoped>
.home-profile-search-stage {
  width: 100%;
  margin-top: 4px;
  display: block;
}

.home-profile-search-stage-body {
  min-height: 0;
  overflow: visible;
}

.home-profile-search-card {
  opacity: 1;
  transform: translateY(0);
}

.home-profile-search-shell {
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

.home-profile-search-icon {
  flex-shrink: 0;
  color: #94a3b8;
}

.home-profile-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: var(--aether-search-shell-height, 48px);
  font-size: 14px;
  line-height: 20px;
  color: #111111;
}

.home-profile-search-clear {
  width: 24px;
  min-width: 24px;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.home-profile-search-clear-icon {
  color: #94a3b8;
}

.home-profile-search-reveal-enter-active .home-profile-search-card,
.home-profile-search-reveal-leave-active .home-profile-search-card {
  transition:
    opacity 120ms ease,
    transform 120ms ease;
}

.home-profile-search-reveal-enter-active .home-profile-search-card,
.home-profile-search-reveal-leave-active .home-profile-search-card {
  transition-delay: 0ms;
}

.home-profile-search-reveal-enter-from .home-profile-search-card,
.home-profile-search-reveal-leave-to .home-profile-search-card {
  opacity: 0;
  transform: translateY(-4px);
}

.home-profile-search-reveal-enter-to .home-profile-search-card,
.home-profile-search-reveal-leave-from .home-profile-search-card {
  opacity: 1;
  transform: translateY(0);
}
</style>
