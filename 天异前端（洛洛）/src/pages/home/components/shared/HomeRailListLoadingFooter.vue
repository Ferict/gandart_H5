<!--
Responsibility: render the shared list-footer shell for loading, error, and endline
states across home-page result sections.
Out of scope: list query execution, observer triggering, and page-specific state
decisions.
-->
<template>
  <view
    class="home-list-loading-footer"
    :class="[`is-${props.mode}`, { 'is-clickable': isErrorMode }]"
    :role="a11yState.rootRole"
    :aria-live="a11yState.rootAriaLive"
  >
    <template v-if="isLoadingMode">
      <view class="home-list-loading-footer-visual" aria-hidden="true">
        <view class="home-list-loading-footer-ring" />
        <view class="home-list-loading-footer-wave">
          <view class="home-list-loading-footer-wave-bar is-bar-1" />
          <view class="home-list-loading-footer-wave-bar is-bar-2" />
          <view class="home-list-loading-footer-wave-bar is-bar-3" />
        </view>
      </view>
    </template>

    <template v-else-if="isErrorMode">
      <view class="home-list-loading-footer-pill home-list-loading-footer-pill--error">
        <view class="home-list-loading-footer-error-copy">
          <view
            class="home-list-loading-footer-error-live"
            :role="a11yState.errorLiveRole"
            :aria-live="a11yState.errorLiveAriaLive"
          >
            <text class="home-list-loading-footer-error-text">
              {{ resolvedErrorText }}
            </text>
          </view>
          <HomeInteractiveTarget
            class="home-list-loading-footer-retry-target"
            interaction-mode="compact"
            :hit-width="a11yState.retryHitWidth"
            :hit-height="a11yState.retryHitHeight"
            :label="resolvedRetryText"
            @activate="handleRetry"
          >
            <view class="home-list-loading-footer-retry">
              <text class="home-list-loading-footer-retry-text">
                {{ resolvedRetryText }}
              </text>
            </view>
          </HomeInteractiveTarget>
        </view>
      </view>
    </template>

    <template v-else>
      <view class="home-list-loading-footer-endline-shell">
        <view class="home-list-loading-footer-visual is-endline" aria-hidden="true">
          <view class="home-list-loading-footer-endline-line is-line-1" />
          <view class="home-list-loading-footer-endline-orbit">
            <view class="home-list-loading-footer-endline-core" />
          </view>
          <view class="home-list-loading-footer-endline-line is-line-2" />
        </view>
        <view class="home-list-loading-footer-endline-copy">
          <slot name="endline">
            <text class="home-list-loading-footer-endline-text is-zh">{{ props.zhText }}</text>
            <text class="home-list-loading-footer-endline-text is-en">{{ props.enText }}</text>
          </slot>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import {
  resolveHomeRailListLoadingFooterA11yState,
  type HomeRailListLoadingFooterMode,
} from './homeRailListLoadingFooter.a11y'

interface Props {
  mode?: HomeRailListLoadingFooterMode
  zhText?: string
  enText?: string
  errorText?: string
  retryText?: string
}

const props = withDefaults(defineProps<Props>(), {
  mode: 'loading',
  zhText: '',
  enText: '',
  errorText: 'Load failed',
  retryText: 'Retry',
})

const emit = defineEmits<{
  retry: []
}>()

const isLoadingMode = computed(() => props.mode === 'loading')
const isErrorMode = computed(() => props.mode === 'error')
const a11yState = computed(() => resolveHomeRailListLoadingFooterA11yState(props.mode))
const resolvedErrorText = computed(() => props.errorText.trim() || 'Load failed')
const resolvedRetryText = computed(() => props.retryText.trim() || 'Retry')

const handleRetry = () => {
  if (!isErrorMode.value) {
    return
  }
  emit('retry')
}
</script>

<style scoped lang="scss">
.home-list-loading-footer {
  width: 100%;
  min-height: 48px;
  margin-top: 20px;
  padding: 4px 0;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-list-loading-footer.is-loading {
  pointer-events: none;
}

.home-list-loading-footer.is-endline {
  pointer-events: none;
}

.home-list-loading-footer-visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
}

.home-list-loading-footer-visual.is-endline {
  gap: 6px;
}

.home-list-loading-footer-ring {
  width: 18px;
  height: 18px;
  border: 1.5px solid rgba(148, 163, 184, 0.24);
  border-top-color: rgba(59, 130, 246, 0.7);
  border-right-color: rgba(59, 130, 246, 0.42);
  border-radius: 999px;
  animation: home-list-loading-ring-spin 0.9s linear infinite;
}

.home-list-loading-footer-wave {
  display: inline-flex;
  align-items: flex-end;
  justify-content: center;
  gap: 4px;
  min-height: 16px;
}

.home-list-loading-footer-wave-bar {
  width: 3px;
  height: 8px;
  border-radius: 999px;
  background: linear-gradient(180deg, rgba(59, 130, 246, 0.72), rgba(14, 165, 233, 0.24));
  transform-origin: center bottom;
  animation: home-list-loading-wave 1s ease-in-out infinite;
}

.home-list-loading-footer-wave-bar.is-bar-2 {
  animation-delay: 120ms;
}

.home-list-loading-footer-wave-bar.is-bar-3 {
  animation-delay: 240ms;
}

.home-list-loading-footer-pill {
  min-height: 32px;
  border-radius: 999px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid rgba(203, 213, 225, 0.82);
  background: rgba(255, 255, 255, 0.96);
}

.home-list-loading-footer-pill--error {
  border-color: rgba(251, 146, 60, 0.3);
  background: rgba(255, 247, 237, 0.96);
}

.home-list-loading-footer-endline-shell {
  display: inline-flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.home-list-loading-footer-endline-orbit {
  position: relative;
  width: 18px;
  height: 18px;
  border-radius: 999px;
  border: 1.5px solid rgba(34, 211, 238, 0.26);
  animation: home-list-endline-orbit-pulse 1.8s ease-in-out infinite;
}

.home-list-loading-footer-endline-core {
  position: absolute;
  left: 50%;
  top: 50%;
  width: 5px;
  height: 5px;
  border-radius: 999px;
  background: var(--aether-entry-accent-line-color, #22d3ee);
  transform: translate(-50%, -50%);
  animation: home-list-endline-core-breathe 1.8s ease-in-out infinite;
}

.home-list-loading-footer-endline-line {
  width: 24px;
  height: 2px;
  border-radius: 999px;
  background: linear-gradient(
    90deg,
    rgba(34, 211, 238, 0.26),
    rgba(34, 211, 238, 0.86),
    rgba(34, 211, 238, 0.26)
  );
  transform-origin: center center;
  animation: home-list-endline-line-wave 1.4s ease-in-out infinite;
}

.home-list-loading-footer-endline-line.is-line-2 {
  animation-delay: 180ms;
}

.home-list-loading-footer-endline-copy {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-list-loading-footer-error-copy {
  display: inline-flex;
  align-items: center;
  gap: 10px;
}

.home-list-loading-footer-error-live {
  display: inline-flex;
  align-items: center;
}

.home-list-loading-footer-error-text {
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  color: rgba(146, 64, 14, 0.9);
}

.home-list-loading-footer-retry {
  min-height: 24px;
  padding: 0 10px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(251, 146, 60, 0.26);
}

.home-list-loading-footer-retry-target {
  width: auto;
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.home-list-loading-footer-retry-target :deep(.home-interactive-target-visual) {
  min-height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-list-loading-footer-retry-text {
  font-size: 12px;
  line-height: 12px;
  font-weight: 600;
  color: rgba(194, 65, 12, 0.92);
}

.home-list-loading-footer-endline-text {
  white-space: nowrap;
}

.home-list-loading-footer-endline-text.is-zh {
  font-size: 14px;
  line-height: 14px;
  font-weight: 400;
  color: rgba(100, 116, 139, 0.68);
}

.home-list-loading-footer-endline-text.is-en {
  margin-left: 6px;
  font-size: 12px;
  line-height: 12px;
  font-weight: 400;
  color: var(--aether-entry-accent-line-color, #22d3ee);
}

@keyframes home-list-loading-ring-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}

@keyframes home-list-loading-wave {
  0%,
  100% {
    transform: scaleY(0.7);
    opacity: 0.42;
  }

  50% {
    transform: scaleY(1.6);
    opacity: 0.94;
  }
}

@keyframes home-list-endline-orbit-pulse {
  0%,
  100% {
    transform: scale(0.92);
    opacity: 0.56;
  }

  50% {
    transform: scale(1);
    opacity: 0.94;
  }
}

@keyframes home-list-endline-core-breathe {
  0%,
  100% {
    transform: translate(-50%, -50%) scale(0.86);
    opacity: 0.62;
  }

  50% {
    transform: translate(-50%, -50%) scale(1.16);
    opacity: 1;
  }
}

@keyframes home-list-endline-line-wave {
  0%,
  100% {
    transform: scaleX(0.72);
    opacity: 0.42;
  }

  50% {
    transform: scaleX(1);
    opacity: 0.9;
  }
}
</style>
