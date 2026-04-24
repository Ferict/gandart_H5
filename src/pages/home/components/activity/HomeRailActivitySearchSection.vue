<!--
Responsibility: render the activity notice search reveal section and keep the search-stage
markup and local animation shell isolated from the parent panel.
Out of scope: keyword state ownership, reveal timing decisions, and query execution behavior.
-->
<template>
  <transition
    name="home-activity-search-reveal"
    @before-enter="emit('search-before-enter', $event)"
    @enter="(element, done) => emit('search-enter', element, done)"
    @after-enter="emit('search-after-enter', $event)"
    @before-leave="emit('search-before-leave', $event)"
    @leave="(element, done) => emit('search-leave', element, done)"
    @after-leave="emit('search-after-leave', $event)"
  >
    <view v-if="isNoticeSearchVisible" class="home-activity-notice-search-stage">
      <view class="home-activity-notice-search-stage-body">
        <view class="home-activity-notice-search-card">
          <view class="home-activity-notice-search-shell">
            <AetherIcon
              class="home-activity-notice-search-icon"
              name="search"
              :size="18"
              :stroke-width="1.9"
            />
            <input
              class="home-activity-notice-search-input"
              :value="noticeKeyword"
              :focus="isNoticeSearchVisible"
              placeholder="搜索公告标题 / 分类"
              confirm-type="search"
              @input="emit('notice-keyword-input', $event)"
            />
            <HomeInteractiveTarget
              v-if="hasActiveNoticeSearch"
              class="home-activity-notice-search-clear"
              label="清空公告搜索"
              @activate="emit('notice-keyword-clear')"
            >
              <AetherIcon
                class="home-activity-notice-search-clear-icon"
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
  isNoticeSearchVisible: boolean
  hasActiveNoticeSearch: boolean
  noticeKeyword: string
}

defineProps<Props>()

const emit = defineEmits<{
  'notice-keyword-input': [event: Event]
  'notice-keyword-clear': []
  'search-before-enter': [event: Element]
  'search-enter': [event: Element, done: () => void]
  'search-after-enter': [event: Element]
  'search-before-leave': [event: Element]
  'search-leave': [event: Element, done: () => void]
  'search-after-leave': [event: Element]
}>()
</script>

<style lang="scss" scoped>
.home-activity-notice-search-stage {
  display: block;
}

.home-activity-notice-search-stage-body {
  min-height: 0;
  overflow: visible;
}

.home-activity-notice-search-card {
  opacity: 1;
  transform: translateY(0);
}

.home-activity-notice-search-shell {
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

.home-activity-notice-search-icon {
  flex-shrink: 0;
  color: #94a3b8;
}

.home-activity-notice-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: var(--aether-search-shell-height, 48px);
  font-size: 14px;
  line-height: 20px;
  color: #111111;
}

.home-activity-notice-search-clear {
  width: 44px;
  min-width: 44px;
  height: 44px;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.home-activity-notice-search-clear-icon {
  color: #94a3b8;
}

.home-activity-search-reveal-enter-active,
.home-activity-search-reveal-leave-active {
  overflow: hidden;
}

.home-activity-search-reveal-enter-active .home-activity-notice-search-card,
.home-activity-search-reveal-leave-active .home-activity-notice-search-card {
  transition:
    opacity 140ms ease,
    transform 140ms ease;
}

.home-activity-search-reveal-enter-active .home-activity-notice-search-card {
  transition-delay: 0ms;
}

.home-activity-search-reveal-leave-active .home-activity-notice-search-card {
  transition-delay: 0ms;
}

.home-activity-search-reveal-enter-from .home-activity-notice-search-card,
.home-activity-search-reveal-leave-to .home-activity-notice-search-card {
  opacity: 0;
  transform: translateY(-4px);
}

.home-activity-search-reveal-enter-to .home-activity-notice-search-card,
.home-activity-search-reveal-leave-from .home-activity-notice-search-card {
  opacity: 1;
  transform: translateY(0);
}
</style>
