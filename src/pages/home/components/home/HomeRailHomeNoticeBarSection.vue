<!--
Responsibility: render the home notice bar and keep the local autoplay and hit-target markup
isolated from the parent home panel.
Out of scope: announcement ordering, refresh timing, and notice result switching behavior.
-->
<template>
  <HomeInteractiveTarget
    class="home-notice-hit"
    :label="noticeBar.detailLabel"
    @activate="emit('announcement-click')"
  >
    <view class="home-notice-bar">
      <AetherIcon class="home-notice-bell-icon" name="bell" :size="16" :stroke-width="2.4" />

      <view class="home-notice-copy">
        <text class="home-notice-label">{{ noticeBar.label }}</text>
        <swiper
          :key="noticeRefreshRenderKey"
          :class="['home-notice-swiper', { 'is-live-reordering': isHomeNoticeLiveReordering }]"
          vertical
          circular
          :autoplay="isHomeNoticeSwiperAutoplayEnabled"
          :interval="5200"
          :duration="560"
          @change="emit('notice-swiper-change', $event)"
        >
          <swiper-item v-for="item in homeAnnouncementItems" :key="item.noticeId">
            <view class="home-notice-swiper-item">
              <view v-if="item.isUnread" class="home-notice-badge">
                <view class="home-notice-badge-copy">
                  <text class="home-notice-badge-text">NEW</text>
                </view>
              </view>
              <text class="home-notice-title">{{ item.title }}</text>
            </view>
          </swiper-item>
        </swiper>
      </view>
    </view>
  </HomeInteractiveTarget>
</template>

<script setup lang="ts">
import type {
  HomeAnnouncementItem,
  HomeNoticeBarConfig,
} from '../../../../models/home-rail/homeRailHome.model'
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  noticeBar: HomeNoticeBarConfig
  homeAnnouncementItems: HomeAnnouncementItem[]
  noticeRefreshRenderKey: number
  isHomeNoticeLiveReordering: boolean
  isHomeNoticeSwiperAutoplayEnabled: boolean
}

defineProps<Props>()

const emit = defineEmits<{
  'announcement-click': []
  'notice-swiper-change': [event: { detail?: { current?: number } }]
}>()
</script>

<style lang="scss" scoped>
.home-notice-hit {
  position: relative;
  min-height: 44px;
  display: flex;
  align-items: center;
  border-radius: 12px;
  overflow: visible;
  transition: var(
    --aether-entry-motion-transition,
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease
  );
}

.home-notice-bar {
  width: 100%;
  min-height: 40px;
  border-radius: 12px;
  border: 1px solid #edf0f3;
  background: #f2f4f7;
  box-shadow: none;
  overflow: hidden;
  padding: 0 var(--home-page-inline-padding, 16px);
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 4px;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease,
    filter 180ms ease;
}

.home-notice-bell-icon {
  color: #06b6d4;
  flex-shrink: 0;
}

.home-notice-copy {
  flex: 1 1 auto;
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 4px;
}

.home-notice-swiper {
  flex: 1 1 auto;
  min-width: 0;
  height: 40px;
  width: 100%;
}

.home-notice-swiper.is-live-reordering {
  animation: home-notice-live-reordering 220ms cubic-bezier(0.22, 1, 0.36, 1) both;
}

.home-notice-swiper-item {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  gap: 4px;
}

.home-notice-label {
  flex-shrink: 0;
  font-size: 13px;
  line-height: 20px;
  font-weight: 800;
  color: #1f2937;
}

.home-notice-badge {
  --home-notice-badge-width: 32px;
  --home-notice-badge-height: var(--aether-badge-height, 16px);

  width: var(--home-notice-badge-width);
  min-width: var(--home-notice-badge-width);
  height: var(--home-notice-badge-height);
  padding: 0;
  border-radius: 999px;
  background: rgba(239, 68, 68, 0.12);
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.home-notice-badge-copy {
  min-width: 0;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-notice-badge-text {
  display: block;
  font-size: 10px;
  line-height: 10px;
  letter-spacing: 0.04em;
  font-weight: 800;
  font-family: inherit;
}

.home-notice-title {
  min-width: 0;
  width: 100%;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  color: #6b7280;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.home-notice-hit.is-entry-active .home-notice-bar {
  transform: translateY(1px);
  filter: brightness(0.985);
}

@keyframes home-notice-live-reordering {
  from {
    opacity: 0;
    transform: translateY(6px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@media (hover: hover) and (pointer: fine) {
  .home-notice-hit:hover {
    transform: translateY(-1px);
  }

  .home-notice-hit:hover .home-notice-bar {
    filter: brightness(0.985);
  }
}
</style>
