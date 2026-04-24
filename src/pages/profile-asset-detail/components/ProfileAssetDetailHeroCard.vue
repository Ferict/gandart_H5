<!--
Responsibility: render the profile asset detail hero card shell, including hero metadata,
media frame, and primary visual entry interaction.
Out of scope: detail refresh orchestration, hero media request runtime, and page-level
presentation assembly.
-->
<template>
  <HomeInteractiveTarget class="hero-entry" label="查看藏品主视觉" @activate="emit('tap')">
    <view class="hero-card">
      <view class="hero-card-head">
        <view class="hero-top-left">
          <view class="hero-dot" />
          <text class="hero-top-label">ARTIFACT</text>
        </view>
        <view class="hero-top-right">
          <text class="hero-top-code">{{ heroTopCodeText }}</text>
        </view>
      </view>
      <view class="hero-media-frame" :style="heroMediaFrameStyle">
        <view class="hero-media-image-shell">
          <HomeMarketCardImageReveal
            :image-url="heroImageUrl"
            :phase="heroRevealPhase"
            :placeholder-icon="heroPlaceholderIcon"
            image-mode="aspectFit"
            fallback-text="资产图像待同步"
            :placeholder-icon-size="48"
            :lazy-load="false"
            :enable-persistent-local-cache="true"
            :image-cache-user-scope="heroImageCacheUserScope"
            cache-scope-policy="required-user"
            @load="emit('load', $event)"
            @error="emit('error')"
          />
        </view>
        <view class="hero-media-corners" aria-hidden="true">
          <view class="hero-focus-corner tl" />
          <view class="hero-focus-corner tr" />
          <view class="hero-focus-corner bl" />
          <view class="hero-focus-corner br" />
        </view>
      </view>
      <view class="hero-card-tail">
        <text class="hero-id-scramble">ID:{{ detailId }}</text>
        <view class="hero-bottom-right" aria-hidden="true">
          <view
            v-for="(barWidth, barIndex) in heroBarcodeBars"
            :key="`barcode-${barIndex}`"
            class="hero-bottom-bar"
            :style="{ width: `${barWidth}px` }"
          />
        </view>
      </view>
    </view>
  </HomeInteractiveTarget>
</template>

<script setup lang="ts">
import type { CSSProperties } from 'vue'
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'
import HomeInteractiveTarget from '../../../components/HomeInteractiveTarget.vue'
import HomeMarketCardImageReveal from '../../../components/HomeMarketCardImageReveal.vue'

defineProps<{
  detailId: string
  heroTopCodeText: string
  heroBarcodeBars: number[]
  heroMediaFrameStyle: CSSProperties
  heroImageUrl: string
  heroRevealPhase: 'steady' | 'fallback'
  heroPlaceholderIcon: AetherIconName
  heroImageCacheUserScope?: string
}>()

const emit = defineEmits<{
  (event: 'tap'): void
  (event: 'load', payload: unknown): void
  (event: 'error'): void
}>()
</script>

<style scoped lang="scss">
.hero-entry {
  display: block;
  border-radius: 20px;
}

.hero-card {
  position: relative;
  isolation: isolate;
  --hero-scan-height: 100%;
  --hero-scan-travel: 220%;

  border-radius: 20px;
  background: #fff;
  box-shadow: var(--aether-shadow-surface-sm, 0 0 12px rgba(15, 23, 42, 0.05));
  overflow: hidden;
  padding: 24px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.hero-card::before {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  opacity: 0;
  pointer-events: none;
}

.hero-card::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  top: calc(-1 * var(--hero-scan-height));
  height: var(--hero-scan-height);
  z-index: 1;
  border-radius: inherit;
  background: linear-gradient(
    180deg,
    rgba(34, 211, 238, 0) 0%,
    rgba(34, 211, 238, 0.05) 16%,
    rgba(34, 211, 238, 0.1) 34%,
    rgba(34, 211, 238, 0.16) 50%,
    rgba(34, 211, 238, 0.1) 66%,
    rgba(34, 211, 238, 0.05) 84%,
    rgba(34, 211, 238, 0) 100%
  );
  opacity: 0.72;
  pointer-events: none;
  animation: hero-stage-scan-flow 6000ms linear infinite;
}

.hero-card > * {
  position: relative;
  z-index: 2;
}

.hero-card-head,
.hero-card-tail {
  min-height: 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.hero-card-tail {
  padding-bottom: 2px;
}

.hero-media-frame {
  position: relative;
  width: 68%;
  margin: 32px auto;
}

.hero-media-image-shell {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  border-radius: 16px;
  background: transparent;
  overflow: hidden;
  --home-market-card-image-radius: 16px;
  --home-market-card-material-base-bg: transparent;
  --home-market-card-material-fallback-bg: transparent;
}

.hero-media-image-shell :deep(.home-market-card-image-reveal),
.hero-media-image-shell :deep(.home-market-card-image-shell),
.hero-media-image-shell :deep(.home-market-card-image) {
  border-radius: 16px;
}

.hero-media-image-shell :deep(.home-market-card-material-base),
.hero-media-image-shell :deep(.home-market-card-material-base.is-fallback) {
  background: transparent;
}

.hero-top-left {
  display: flex;
  align-items: center;
  gap: 8px;
}

.hero-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22d3ee;
}

.hero-top-label {
  color: #94a3b8;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.hero-top-right {
  display: inline-flex;
  align-items: center;
}

.hero-top-code {
  min-height: 16px;
  border-radius: 8px;
  border: 1.5px solid #e2e8f0;
  color: #cbd5e1;
  padding: 0 8px;
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.08em;
  transform: scale(0.83);
  transform-origin: center;
}

.hero-id-scramble {
  color: #111;
  font-size: 12px;
  line-height: 14px;
  font-weight: 600;
  letter-spacing: 0.2em;
  text-transform: uppercase;
}

.hero-bottom-right {
  display: flex;
  align-items: flex-end;
  gap: 2px;
  opacity: 0.2;
}

.hero-bottom-bar {
  height: 16px;
  background: #111;
}

.hero-media-corners {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.hero-focus-corner {
  position: absolute;
  width: 16px;
  height: 16px;
  border-style: solid;
  border-width: 0;
  border-color: rgba(34, 211, 238, 0.95);
}

.hero-focus-corner.tl {
  top: -16px;
  left: -16px;
  border-top-width: 1px;
  border-left-width: 1px;
}

.hero-focus-corner.tr {
  top: -16px;
  right: -16px;
  border-top-width: 1px;
  border-right-width: 1px;
}

.hero-focus-corner.bl {
  left: -16px;
  bottom: -16px;
  border-bottom-width: 1px;
  border-left-width: 1px;
}

.hero-focus-corner.br {
  right: -16px;
  bottom: -16px;
  border-bottom-width: 1px;
  border-right-width: 1px;
}

.hero-media-image-shell :deep(.home-market-card-image) {
  mix-blend-mode: normal;
  opacity: 1;
}

@keyframes hero-stage-scan-flow {
  from {
    transform: translateY(0);
  }

  to {
    transform: translateY(var(--hero-scan-travel));
  }
}
</style>
