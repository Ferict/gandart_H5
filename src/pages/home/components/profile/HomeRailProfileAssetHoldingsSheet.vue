<!--
Responsibility: render the bottom-sheet holdings detail layer opened from the profile asset grid,
including local motion, highlight states, and second-step detail actions.
Out of scope: formal instance transport contracts, profile list fetching, and shared route logic.
-->
<template>
  <transition name="profile-asset-holdings-modal" appear>
    <view v-if="open && assetViewModel" class="profile-asset-holdings-modal">
      <view class="profile-asset-holdings-mask" @tap="emit('close')" />

      <view class="profile-asset-holdings-sheet" @tap.stop>
        <view class="profile-asset-holdings-grip-stage">
          <view class="profile-asset-holdings-grip" />
        </view>

        <view class="profile-asset-holdings-head">
          <HomeInteractiveTarget
            class="profile-asset-holdings-close"
            interaction-mode="compact"
            :hit-width="44"
            :hit-height="44"
            label="关闭持有明细弹层"
            @activate="emit('close')"
          >
            <view class="profile-asset-holdings-close-visual">
              <AetherIcon name="x" :size="18" :stroke-width="2.3" />
            </view>
          </HomeInteractiveTarget>

          <view class="profile-asset-holdings-head-main">
            <view class="profile-asset-holdings-thumb">
              <HomeMarketCardImageReveal
                :image-url="assetViewModel.imageUrl"
                :phase="thumbnailRevealPhase"
                placeholder-icon="box"
                :placeholder-icon-size="24"
              />
            </view>

            <view class="profile-asset-holdings-copy">
              <text class="profile-asset-holdings-collection">
                {{ assetViewModel.collectionLabel }}
              </text>
              <text class="profile-asset-holdings-title">{{ assetViewModel.name }}</text>

              <view class="profile-asset-holdings-hint">
                <AetherIcon name="package" :size="13" :stroke-width="2" />
                <text class="profile-asset-holdings-hint-copy">
                  当前持有 {{ assetViewModel.holdingsCount }} 份
                </text>
              </view>
            </view>
          </view>
        </view>

        <scroll-view class="profile-asset-holdings-scroll" scroll-y :show-scrollbar="false">
          <view class="profile-asset-holdings-list">
            <HomeInteractiveTarget
              v-for="(instance, index) in assetViewModel.instances"
              :key="instance.id"
              class="profile-asset-holding-entry"
              :class="{ 'is-hovered': hoveredHoldingId === instance.id }"
              :style="resolveHoldingEntryStyle(index)"
              label="前往当前持有份额详情"
              @mouseenter="handleHoldingPointerEnter(instance.id)"
              @mouseleave="handleHoldingPointerLeave(instance.id)"
              @touchstart="handleHoldingTouchStart(instance.id)"
              @activate="emit('instanceDetail', instance.id)"
            >
              <view class="profile-asset-holding-card">
                <view class="profile-asset-holding-main">
                  <view class="profile-asset-holding-topline">
                    <ProfileAssetHoldingsScrambleText
                      class="profile-asset-holding-serial"
                      :text="instance.serial"
                      :trigger-signal="serialScrambleSignal"
                    />

                    <view
                      class="profile-asset-holding-status"
                      :class="`tone-${instance.statusTone}`"
                    >
                      <AetherIcon :name="instance.statusIconName" :size="10" :stroke-width="2.2" />
                      <text class="profile-asset-holding-status-copy">
                        {{ instance.statusLabel }}
                      </text>
                    </view>
                  </view>

                  <view class="profile-asset-holding-meta">
                    <AetherIcon name="shield-check" :size="12" :stroke-width="2" />
                    <text class="profile-asset-holding-meta-copy">
                      {{ instance.acquiredAtLabel }}
                    </text>
                  </view>
                </view>

                <view class="profile-asset-holding-arrow">
                  <AetherIcon name="arrow-right" :size="14" :stroke-width="2" />
                </view>
              </view>
            </HomeInteractiveTarget>
          </view>

          <view class="profile-asset-holdings-scroll-reserve" aria-hidden="true" />
        </scroll-view>
      </view>
    </view>
  </transition>
</template>

<script setup lang="ts">
import { computed, ref, watch, type CSSProperties } from 'vue'
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import HomeMarketCardImageReveal from '../../../../components/HomeMarketCardImageReveal.vue'
import type { ProfileAssetHoldingsSheetViewModel } from '../../composables/profile/useProfileAssetHoldingsSheet'
import ProfileAssetHoldingsScrambleText from './ProfileAssetHoldingsScrambleText.vue'

const props = defineProps<{
  open: boolean
  assetViewModel: ProfileAssetHoldingsSheetViewModel | null
}>()

const emit = defineEmits<{
  close: []
  instanceDetail: [instanceId: string]
}>()

const hoveredHoldingId = ref<string | null>(null)
const serialScrambleSignal = ref(0)

const thumbnailRevealPhase = computed(() => {
  if (!props.assetViewModel?.imageUrl.trim()) {
    return 'fallback'
  }

  return 'reveal-scan'
})

const resolveHoldingEntryStyle = (index: number): CSSProperties => {
  return {
    '--profile-asset-holding-delay': `${index * 45}ms`,
  } as CSSProperties
}

const bumpSerialScrambleSignal = () => {
  serialScrambleSignal.value += 1
}

const handleHoldingPointerEnter = (instanceId: string) => {
  hoveredHoldingId.value = instanceId
  bumpSerialScrambleSignal()
}

const handleHoldingPointerLeave = (instanceId: string) => {
  if (hoveredHoldingId.value !== instanceId) {
    return
  }

  hoveredHoldingId.value = null
}

const handleHoldingTouchStart = (instanceId: string) => {
  hoveredHoldingId.value = instanceId
  bumpSerialScrambleSignal()
}

watch(
  () => `${props.open}::${props.assetViewModel?.assetId ?? ''}`,
  () => {
    hoveredHoldingId.value = null

    if (!props.open || !props.assetViewModel) {
      return
    }

    bumpSerialScrambleSignal()
  },
  { immediate: true }
)
</script>

<style scoped lang="scss">
.profile-asset-holdings-modal {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: flex-end;
  justify-content: center;
}

.profile-asset-holdings-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.18);
  -webkit-backdrop-filter: blur(8px);
  backdrop-filter: blur(8px);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .profile-asset-holdings-mask {
    background: rgba(15, 23, 42, 0.22);
  }
}

.profile-asset-holdings-sheet {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: min(
    calc(520px + var(--home-safe-bottom, 0px)),
    calc(82vh + var(--home-safe-bottom, 0px))
  );
  max-height: calc(82vh + var(--home-safe-bottom, 0px));
  border-radius: 32px 32px 0 0;
  border: 1px solid rgba(255, 255, 255, 0.88);
  border-bottom: none;
  background: linear-gradient(180deg, #ffffff 0%, #fafafa 100%);
  box-shadow: 0 -24px 72px rgba(15, 23, 42, 0.14);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.profile-asset-holdings-grip-stage {
  position: relative;
  padding: 12px 0 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(255, 255, 255, 0.92);
}

.profile-asset-holdings-grip {
  width: 40px;
  height: 4px;
  border-radius: 999px;
  background: rgba(148, 163, 184, 0.38);
}

.profile-asset-holdings-head {
  position: relative;
  padding: 8px 20px 16px;
  border-bottom: 1px solid rgba(15, 23, 42, 0.06);
  display: flex;
  flex-direction: column;
  background: rgba(255, 255, 255, 0.92);
}

.profile-asset-holdings-close {
  position: absolute;
  right: 20px;
  top: 10px;
  width: 28px;
  height: 28px;
  color: #9ca3af;
}

.profile-asset-holdings-close-visual {
  width: 28px;
  height: 28px;
  border-radius: 999px;
  background: #f8fafc;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 180ms ease,
    color 180ms ease,
    background-color 180ms ease;
}

.profile-asset-holdings-close.is-entry-active .profile-asset-holdings-close-visual {
  transform: scale(0.94);
}

.profile-asset-holdings-head-main {
  min-width: 0;
  padding-right: 44px;
  display: flex;
  align-items: center;
  gap: 14px;
}

.profile-asset-holdings-thumb {
  position: relative;
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  border-radius: 18px;
  overflow: hidden;
  background: #f8fafc;
  box-shadow: 0 8px 24px rgba(15, 23, 42, 0.08);
  --home-market-card-image-radius: 18px;
}

.profile-asset-holdings-copy {
  min-width: 0;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 6px;
}

.profile-asset-holdings-collection {
  width: max-content;
  max-width: 100%;
  color: #94a3b8;
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.18em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  text-transform: uppercase;
  transform: scale(0.78);
  transform-origin: left center;
}

.profile-asset-holdings-title {
  color: #111111;
  font-size: 18px;
  line-height: 22px;
  font-weight: 900;
  letter-spacing: -0.03em;
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
  overflow: hidden;
}

.profile-asset-holdings-hint,
.profile-asset-holding-topline,
.profile-asset-holding-meta,
.profile-asset-holding-status,
.profile-asset-holding-card {
  display: flex;
  align-items: center;
}

.profile-asset-holdings-hint {
  gap: 6px;
  color: #0891b2;
}

.profile-asset-holdings-hint-copy {
  color: #475569;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
}

.profile-asset-holdings-scroll {
  flex: 1 1 auto;
  min-height: 0;
  background: transparent;
}

.profile-asset-holdings-list {
  padding: 16px 16px 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.profile-asset-holding-entry {
  border-radius: 22px;
  opacity: 0;
  animation: profile-asset-holding-card-enter 420ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
  animation-delay: var(--profile-asset-holding-delay, 0ms);
}

.profile-asset-holding-card {
  width: 100%;
  min-height: 88px;
  padding: 16px;
  border-radius: 22px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  background: rgba(255, 255, 255, 0.94);
  box-shadow: 0 4px 18px rgba(15, 23, 42, 0.03);
  justify-content: space-between;
  gap: 12px;
  box-sizing: border-box;
  transition:
    border-color 200ms ease,
    box-shadow 200ms ease,
    transform 200ms ease,
    background-color 200ms ease;
}

.profile-asset-holding-entry.is-entry-active .profile-asset-holding-card {
  transform: scale(0.985);
}

.profile-asset-holding-entry.is-hovered .profile-asset-holding-card {
  border-color: rgba(34, 211, 238, 0.42);
  background: rgba(255, 255, 255, 0.98);
  box-shadow: 0 12px 28px rgba(34, 211, 238, 0.08);
}

.profile-asset-holding-main {
  min-width: 0;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  gap: 10px;
}

.profile-asset-holding-topline {
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
}

.profile-asset-holding-serial {
  min-width: 0;
  color: #111111;
  font-family: var(--aether-font-system, system-ui, sans-serif);
  font-size: 18px;
  line-height: 20px;
  font-weight: 900;
  letter-spacing: -0.04em;
  transition: color 180ms ease;
}

.profile-asset-holding-entry.is-hovered .profile-asset-holding-serial {
  color: #0891b2;
}

.profile-asset-holding-status {
  flex: 0 0 auto;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 8px;
  border: 1px solid transparent;
  gap: 4px;
}

.profile-asset-holding-status.tone-accent {
  border-color: #cffafe;
  background: #ecfeff;
  color: #0891b2;
}

.profile-asset-holding-status.tone-warning {
  border-color: #fde68a;
  background: #fffbeb;
  color: #d97706;
}

.profile-asset-holding-status.tone-muted {
  border-color: #e5e7eb;
  background: #f8fafc;
  color: #64748b;
}

.profile-asset-holding-status-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
  white-space: nowrap;
  transform: scale(0.75);
  transform-origin: left center;
}

.profile-asset-holding-meta {
  gap: 6px;
  color: #cbd5e1;
}

.profile-asset-holding-meta-copy {
  color: #94a3b8;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
}

.profile-asset-holding-arrow {
  width: 32px;
  height: 32px;
  flex: 0 0 auto;
  border-radius: 999px;
  background: #f8fafc;
  color: #94a3b8;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 180ms ease,
    background-color 180ms ease,
    color 180ms ease;
}

.profile-asset-holding-entry.is-hovered .profile-asset-holding-arrow {
  background: #111111;
  color: #22d3ee;
  transform: translateX(1px);
}

.profile-asset-holdings-scroll-reserve {
  height: calc(24px + var(--home-safe-bottom, 0px));
}

.profile-asset-holdings-modal-enter-active,
.profile-asset-holdings-modal-leave-active {
  transition: opacity 220ms ease;
}

.profile-asset-holdings-modal-enter-active .profile-asset-holdings-mask,
.profile-asset-holdings-modal-leave-active .profile-asset-holdings-mask {
  transition: opacity 220ms ease;
}

.profile-asset-holdings-modal-enter-active .profile-asset-holdings-sheet,
.profile-asset-holdings-modal-leave-active .profile-asset-holdings-sheet {
  transition:
    transform 280ms cubic-bezier(0.16, 1, 0.3, 1),
    opacity 220ms ease;
}

.profile-asset-holdings-modal-enter-from,
.profile-asset-holdings-modal-leave-to {
  opacity: 0;
}

.profile-asset-holdings-modal-enter-from .profile-asset-holdings-mask,
.profile-asset-holdings-modal-leave-to .profile-asset-holdings-mask {
  opacity: 0;
}

.profile-asset-holdings-modal-enter-from .profile-asset-holdings-sheet,
.profile-asset-holdings-modal-leave-to .profile-asset-holdings-sheet {
  opacity: 0.92;
  transform: translateY(28px);
}

@media (hover: hover) and (pointer: fine) {
  .profile-asset-holdings-close:hover .profile-asset-holdings-close-visual {
    color: #111111;
    background: #f1f5f9;
  }

  .profile-asset-holding-entry:hover .profile-asset-holding-card {
    border-color: rgba(34, 211, 238, 0.42);
    background: rgba(255, 255, 255, 0.98);
    box-shadow: 0 12px 28px rgba(34, 211, 238, 0.08);
  }

  .profile-asset-holding-entry:hover .profile-asset-holding-serial {
    color: #0891b2;
  }

  .profile-asset-holding-entry:hover .profile-asset-holding-arrow {
    background: #111111;
    color: #22d3ee;
    transform: translateX(1px);
  }
}

@media screen and (width < 380px) {
  .profile-asset-holdings-sheet {
    min-height: min(
      calc(480px + var(--home-safe-bottom, 0px)),
      calc(84vh + var(--home-safe-bottom, 0px))
    );
    max-height: calc(84vh + var(--home-safe-bottom, 0px));
  }

  .profile-asset-holdings-head {
    padding-left: 16px;
    padding-right: 16px;
  }

  .profile-asset-holdings-close {
    right: 16px;
  }

  .profile-asset-holding-card {
    min-height: 84px;
    padding: 14px;
  }

  .profile-asset-holding-topline {
    gap: 8px;
  }

  .profile-asset-holding-serial {
    font-size: 16px;
    line-height: 18px;
  }
}

@keyframes profile-asset-holding-card-enter {
  from {
    opacity: 0;
    transform: translateY(18px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
