<!--
Responsibility: render the home rail banner carousel section template and local styling, and
forward banner image and activation events back to the home panel runtime.
Out of scope: banner data loading, cross-section choreography, and scene-level state orchestration.
-->
<template>
  <view class="home-banner-carousel">
    <view class="home-banner-ratio-shell">
      <swiper
        class="home-banner-swiper"
        circular
        :autoplay="isBannerSwiperAutoplayEnabled"
        :interval="5600"
        :duration="620"
      >
        <swiper-item v-for="item in homeBannerItems" :key="item.id">
          <view class="home-banner-slide-shell">
            <HomeInteractiveTarget
              class="home-banner-entry home-banner-entry-media"
              :class="{ 'is-scene-patch-light': isScenePatchMotionReduced }"
              :label="'查看 ' + item.title"
              @activate="emit('banner-click', item)"
            >
              <view class="home-banner-shell" :class="'tone-' + item.tone">
                <image
                  class="home-banner-placeholder-image"
                  :src="homeBannerPlaceholderUrl"
                  mode="aspectFill"
                  lazy-load
                />
                <image
                  v-if="hasBannerRemoteImage(item)"
                  :key="bannerRefreshRenderKey + '::' + resolveBannerImageRevealKey(item)"
                  class="home-banner-bg home-banner-bg-remote"
                  :class="{ 'is-loaded': isBannerImageLoaded(item) }"
                  :src="resolveBannerImageUrl(item)"
                  mode="aspectFill"
                  lazy-load
                  @load="emit('banner-image-load', item, $event)"
                  @error="emit('banner-image-error', item, $event)"
                />
              </view>
            </HomeInteractiveTarget>
          </view>
        </swiper-item>
      </swiper>
    </view>
  </view>
</template>

<script setup lang="ts">
import type { HomeBannerItem } from '../../../../models/home-rail/homeRailHome.model'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  homeBannerItems: HomeBannerItem[]
  isScenePatchMotionReduced: boolean
  isBannerSwiperAutoplayEnabled: boolean
  homeBannerPlaceholderUrl: string
  bannerRefreshRenderKey: number
  hasBannerRemoteImage: (item: HomeBannerItem) => boolean
  resolveBannerImageRevealKey: (item: HomeBannerItem) => string
  isBannerImageLoaded: (item: HomeBannerItem) => boolean
  resolveBannerImageUrl: (item: HomeBannerItem) => string
}

defineProps<Props>()

const emit = defineEmits<{
  'banner-click': [item: HomeBannerItem]
  'banner-image-load': [item: HomeBannerItem, event: unknown]
  'banner-image-error': [item: HomeBannerItem, event: unknown]
}>()
</script>

<style lang="scss" scoped>
.home-banner-carousel {
  position: relative;
  width: calc(100% + (var(--home-page-inline-padding, 16px) * 2));
  margin-left: calc(var(--home-page-inline-padding, 16px) * -1);
  overflow: visible;
}

.home-banner-ratio-shell {
  position: relative;
  width: calc(100% - (var(--home-page-inline-padding, 16px) * 2));
  margin: 0 auto;
  overflow: visible;
}

.home-banner-ratio-shell::before {
  content: '';
  display: block;
  padding-top: 48.9796%;
}

.home-banner-ratio-shell::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 0;
  border-radius: 12px;
  box-shadow: 0 0 24px rgba(15, 23, 42, 0.08);
  pointer-events: none;
}

.home-banner-swiper {
  position: absolute;
  inset: 0 auto 0 calc(var(--home-page-inline-padding, 16px) * -1);
  z-index: 1;
  width: calc(100% + (var(--home-page-inline-padding, 16px) * 2));
  height: 100%;
}

.home-banner-slide-shell {
  width: 100%;
  height: 100%;
  padding: 0 var(--home-page-inline-padding, 16px);
  box-sizing: border-box;
}

.home-banner-entry {
  position: relative;
  height: 100%;
  min-height: 0;
  border-radius: 12px;
  overflow: visible;
  background: transparent;
  color: #ffffff;
  padding: 0;
  box-sizing: border-box;
  display: block;
  transition: transform 180ms ease;
}

.home-banner-entry-media {
  padding: 0;
  display: block;
}

.home-banner-shell {
  position: relative;
  width: 100%;
  height: 100%;
  min-height: 0;
  border-radius: 12px;
  border: 1px solid #edf0f3;
  overflow: hidden;
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
  --home-market-card-image-radius: 12px;
  --home-market-card-material-base-bg: transparent;
  --home-market-card-material-fallback-bg: transparent;
  --home-market-card-placeholder-icon-color: transparent;
  --home-market-card-fallback-text-color: rgba(226, 232, 240, 0.88);
}

.home-banner-shell.tone-dawn {
  background: #101726;
}

.home-banner-shell.tone-azure {
  background: #0f1f2e;
}

.home-banner-shell.tone-ember {
  background: #1f2530;
}

.home-banner-bg {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  background-color: #111111;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: 50% 50%;
  pointer-events: none;
}

.home-banner-bg-remote {
  opacity: 0;
  transition: opacity 220ms ease;
}

.home-banner-bg-remote.is-loaded {
  opacity: 1;
}

.home-banner-placeholder-image {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  display: block;
  pointer-events: none;
}

.home-banner-entry.is-scene-patch-light,
.home-banner-entry.is-scene-patch-light .home-banner-shell {
  transition: none;
}

@media (hover: hover) and (pointer: fine) {
  .home-banner-entry:hover {
    transform: translateY(var(--aether-entry-hover-lift-y, -2px));
  }
}
</style>
