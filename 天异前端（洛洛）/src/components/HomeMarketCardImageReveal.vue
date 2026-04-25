<!--
Responsibility: render the market card image reveal shell, including image/fallback
layers, retry interaction, and visual phase-driven presentation.
Out of scope: result-window timing, market query execution, and card metadata assembly.
-->
<template>
  <view class="home-market-card-image-reveal" :style="revealStyle">
    <view class="home-market-card-material-base" :class="{ 'is-fallback': phase === 'fallback' }" />

    <view
      v-if="hasRenderableImageSrc"
      class="home-market-card-image-shell"
      :class="imageShellClassName"
    >
      <image
        :key="imageRenderKey"
        class="home-market-card-image"
        :src="resolvedImageSrc"
        :mode="props.imageMode"
        :lazy-load="lazyLoad"
        :data-request-stamp="activeRequestStamp"
        @load="handleLoad"
        @error="handleError"
      />
    </view>

    <view
      v-if="shouldShowPlaceholderShell"
      class="home-market-card-placeholder-shell"
      :class="{ 'has-fallback-text': shouldShowFallbackText }"
    >
      <AetherIcon
        :name="placeholderIcon"
        class="home-market-card-placeholder-icon"
        :size="placeholderIconSize"
        :stroke-width="1.2"
      />
      <text v-if="shouldShowFallbackText" class="home-market-card-fallback-text">
        {{ fallbackText }}
      </text>
      <view
        v-if="shouldShowRetryAction"
        class="home-market-card-retry-action"
        role="button"
        @tap.stop.prevent="handleManualRetryTap"
      >
        <text class="home-market-card-retry-action-text">Retry image</text>
      </view>
    </view>

    <view v-if="shouldShowLoadingOverlay" class="home-market-card-loading-overlay">
      <view class="home-market-card-loading-spinner" />
    </view>

    <view
      v-if="shouldShowRetryAction"
      class="home-market-card-retry-hit"
      role="button"
      @tap.stop.prevent="handleManualRetryTap"
    />
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AetherIcon from './AetherIcon.vue'
import type { AetherIconName } from '../models/ui/aetherIcon.model'
import {
  resolveHomeMarketCardImageCachePolicy,
  type HomeMarketCardImageCacheScopePolicy,
} from './homeMarketCardImageReveal.cachePolicy'
import { useHomeMarketCardImageRevealRuntime } from './homeMarketCardImageReveal.runtime'

interface Props {
  imageUrl: string
  phase: 'icon' | 'wait-scan' | 'reveal-scan' | 'steady' | 'fallback'
  placeholderIcon: AetherIconName
  imageMode?: 'aspectFill' | 'aspectFit'
  fallbackText?: string
  lazyLoad?: boolean
  staggerDelayMs?: number
  placeholderIconSize?: number
  enablePersistentLocalCache?: boolean
  imageCacheUserScope?: string
  cacheScopePolicy?: HomeMarketCardImageCacheScopePolicy
}

const props = withDefaults(defineProps<Props>(), {
  imageMode: 'aspectFill',
  fallbackText: '',
  lazyLoad: true,
  staggerDelayMs: 0,
  placeholderIconSize: 40,
  enablePersistentLocalCache: false,
  imageCacheUserScope: undefined,
  cacheScopePolicy: 'public',
})

const emit = defineEmits<{
  load: [event: unknown]
  error: [event: unknown]
  retrying: [event: unknown]
}>()

const resolvedImageCachePolicy = computed(() =>
  resolveHomeMarketCardImageCachePolicy({
    enablePersistentLocalCache: props.enablePersistentLocalCache,
    imageCacheUserScope: props.imageCacheUserScope,
    cacheScopePolicy: props.cacheScopePolicy,
  })
)
const canUsePersistentLocalCache = computed(
  () => resolvedImageCachePolicy.value.canUsePersistentLocalCache
)
const resolvedImageCacheUserScope = computed(
  () => resolvedImageCachePolicy.value.normalizedUserScope
)
const {
  hasImageUrl,
  activeRequestStamp,
  isRetrying,
  resolvedImageSrc,
  handleLoad,
  handleError,
  handleManualRetry,
} = useHomeMarketCardImageRevealRuntime({
  resolveImageUrl: () => props.imageUrl,
  resolveCanUsePersistentLocalCache: () => canUsePersistentLocalCache.value,
  resolveImageCacheUserScope: () => resolvedImageCacheUserScope.value,
  emitLoad: (payload) => emit('load', payload),
  emitError: (payload) => emit('error', payload),
  emitRetrying: (payload) => emit('retrying', payload),
})

const shouldShowLoadingOverlay = computed(() => {
  if (!hasImageUrl.value) {
    return false
  }

  return props.phase === 'icon' || props.phase === 'wait-scan' || isRetrying.value
})

const shouldShowPlaceholderShell = computed(() => {
  if (!hasImageUrl.value) {
    return true
  }

  if (shouldShowLoadingOverlay.value) {
    return false
  }

  return props.phase === 'icon' || props.phase === 'wait-scan' || props.phase === 'fallback'
})

const shouldShowFallbackText = computed(() => {
  return props.phase === 'fallback' && props.fallbackText.trim().length > 0
})

const shouldShowRetryAction = computed(() => {
  if (!hasImageUrl.value) {
    return false
  }

  return props.phase === 'fallback' && !isRetrying.value
})

const hasRenderableImageSrc = computed(() => resolvedImageSrc.value.trim().length > 0)

const imageShellClassName = computed(() => {
  if (props.phase === 'reveal-scan') {
    return 'is-reveal-scanning'
  }

  if (props.phase === 'steady') {
    return 'is-steady'
  }

  if (props.phase === 'fallback') {
    return 'is-hidden'
  }

  return 'is-preloading'
})

const imageRenderKey = computed(() => {
  return `${resolvedImageSrc.value}::${activeRequestStamp.value}`
})

const revealStyle = computed<CSSProperties>(() => {
  const nextStyle: CSSProperties = {}

  if (props.staggerDelayMs > 0) {
    nextStyle['--home-market-card-stagger-delay'] = `${props.staggerDelayMs}ms`
  }

  return nextStyle
})

const handleManualRetryTap = () => {
  handleManualRetry(shouldShowRetryAction.value)
}
</script>

<style scoped>
.home-market-card-image-reveal {
  position: absolute;
  inset: 0;
  overflow: hidden;
  border-radius: var(--home-market-card-image-radius, 12px);
}

.home-market-card-material-base {
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: var(--home-market-card-image-radius, 12px);
  background: var(
    --home-market-card-material-base-bg,
    radial-gradient(circle at 50% 24%, rgba(255, 255, 255, 0.9) 0%, rgba(255, 255, 255, 0) 44%),
    linear-gradient(180deg, #f8fafc 0%, #eef2f7 100%)
  );
}

.home-market-card-material-base.is-fallback {
  background: var(
    --home-market-card-material-fallback-bg,
    linear-gradient(180deg, #f1f5f9 0%, #e2e8f0 100%)
  );
}

.home-market-card-image-shell {
  position: absolute;
  inset: 0;
  z-index: 1;
  overflow: hidden;
  border-radius: var(--home-market-card-image-radius, 12px);
}

.home-market-card-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  opacity: 1;
  border-radius: var(--home-market-card-image-radius, 12px);
}

.home-market-card-image-shell.is-hidden .home-market-card-image,
.home-market-card-image-shell.is-preloading .home-market-card-image {
  opacity: 0;
}

.home-market-card-image-shell.is-steady .home-market-card-image {
  opacity: 1;
}

.home-market-card-image-shell.is-reveal-scanning .home-market-card-image {
  opacity: 0;
  animation: home-market-card-image-fade-in 220ms ease both;
  animation-delay: var(--home-market-card-stagger-delay, 0ms);
}

.home-market-card-placeholder-shell {
  position: absolute;
  inset: 0;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 0 20px;
  text-align: center;
}

.home-market-card-placeholder-shell.has-fallback-text {
  transform: translateY(-4px);
}

.home-market-card-placeholder-icon {
  position: relative;
  z-index: 1;
  color: var(--home-market-card-placeholder-icon-color, #94a3b8);
}

.home-market-card-fallback-text {
  max-width: 100px;
  font-size: 14px;
  line-height: 18px;
  font-weight: 500;
  letter-spacing: 0.04em;
  color: var(--home-market-card-fallback-text-color, rgba(100, 116, 139, 0.92));
}

.home-market-card-retry-action {
  min-height: 26px;
  padding: 0 10px;
  border-radius: 999px;
  border: 1px solid rgba(100, 116, 139, 0.24);
  background: rgba(255, 255, 255, 0.92);
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-market-card-retry-action-text {
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.02em;
  color: var(--aether-entry-accent-line-color, #22d3ee);
}

.home-market-card-loading-overlay {
  position: absolute;
  inset: 0;
  z-index: 3;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.home-market-card-loading-spinner {
  width: 22px;
  height: 22px;
  border-radius: 999px;
  border: 2px solid rgba(148, 163, 184, 0.28);
  border-top-color: rgba(59, 130, 246, 0.86);
  border-right-color: rgba(14, 165, 233, 0.62);
  animation: home-market-card-loading-spin 0.9s linear infinite;
}

.home-market-card-retry-hit {
  position: absolute;
  inset: 0;
  z-index: 4;
}

@keyframes home-market-card-image-fade-in {
  from {
    opacity: 0;
  }

  to {
    opacity: 1;
  }
}

@keyframes home-market-card-loading-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
