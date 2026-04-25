<!--
Responsibility: render the profile identity card and keep the display name, address preview,
and quick copy or QR triggers isolated from the parent profile panel.
Out of scope: identity data derivation, clipboard side effects, and route navigation behavior.
-->
<template>
  <view class="home-profile-identity-card">
    <view class="home-profile-identity-layout">
      <view class="home-profile-identity-main">
        <view class="home-profile-avatar-wrap">
          <view class="home-profile-avatar-core">
            <AetherIcon name="user" :size="20" :stroke-width="1.9" />
          </view>
          <view class="home-profile-avatar-dot" />
        </view>

        <view class="home-profile-identity-copy">
          <text class="home-profile-identity-name">{{ displayName }}</text>

          <view class="home-profile-address-row">
            <view class="home-profile-address-chip">
              <view class="home-profile-address-text">
                <text class="home-profile-address-prefix">{{ addressHead }}</text>
                <text v-if="addressTail" class="home-profile-address-suffix">{{
                  addressTail
                }}</text>
              </view>
              <view class="home-profile-address-divider" aria-hidden="true" />

              <HomeInteractiveTarget
                class="home-profile-inline-action home-profile-address-copy-action"
                interaction-mode="compact"
                label="复制钱包地址"
                @activate="emit('copy-address')"
              >
                <view class="home-profile-inline-action-visual home-profile-address-copy-visual">
                  <AetherIcon name="copy" :size="14" :stroke-width="1.8" />
                </view>
              </HomeInteractiveTarget>
            </view>
          </view>
        </view>
      </view>

      <view class="home-profile-qr-stage">
        <view class="home-profile-qr-decor" aria-hidden="true" />

        <HomeInteractiveTarget
          class="home-profile-qr-entry"
          interaction-mode="compact"
          label="查看地址二维码"
          @activate="emit('show-qr')"
        >
          <view class="home-profile-qr-entry-visual">
            <AetherIcon name="qr-code" :size="20" :stroke-width="1.8" />
          </view>
        </HomeInteractiveTarget>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'

interface Props {
  displayName: string
  addressHead: string
  addressTail: string
}

defineProps<Props>()

const emit = defineEmits<{
  'copy-address': []
  'show-qr': []
}>()
</script>

<style lang="scss" scoped>
.home-profile-identity-card {
  position: relative;
  border-radius: var(--aether-surface-radius-lg, 20px);
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  padding: 0 0 0 20px;
  box-sizing: border-box;
  overflow: hidden;
}

.home-profile-identity-layout {
  min-width: 0;
  min-height: 96px;
  display: grid;
  grid-template-columns: minmax(0, 1fr) 96px;
  align-items: center;
  gap: 24px;
  position: relative;
  z-index: 1;
}

.home-profile-identity-main {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px 0;
}

.home-profile-avatar-wrap {
  position: relative;
  flex-shrink: 0;
}

.home-profile-avatar-core {
  width: 56px;
  height: 56px;
  border-radius: 999px;
  background: #111111;
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-profile-avatar-dot {
  position: absolute;
  right: 2px;
  bottom: 2px;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  background: #22d3ee;
  box-shadow: 0 0 0 3px #ffffff;
}

.home-profile-identity-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.home-profile-identity-name {
  font-size: 18px;
  line-height: 22px;
  font-weight: 800;
  color: #111111;
}

.home-profile-address-row {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 12px;
}

.home-profile-address-chip {
  min-width: 0;
  width: 100%;
  max-width: 100%;
  flex: 1 1 auto;
  min-height: 24px;
  padding: 0 8px;
  border-radius: 4px;
  background: #f8fafc;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
  overflow: hidden;
}

.home-profile-address-text {
  min-width: 0;
  max-width: 100%;
  flex: 1 1 auto;
  display: inline-flex;
  align-items: baseline;
  gap: 0;
  overflow: hidden;
  white-space: nowrap;
}

.home-profile-address-prefix,
.home-profile-address-suffix {
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  color: #475569;
}

.home-profile-address-prefix {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.home-profile-address-suffix {
  flex: 0 0 auto;
  white-space: nowrap;
}

.home-profile-address-divider {
  width: 1px;
  height: 12px;
  background: rgba(148, 163, 184, 0.24);
  flex: 0 0 auto;
}

.home-profile-inline-action {
  position: relative;
  width: 24px;
  min-width: 24px;
  height: 24px;
  border-radius: 999px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #6b7280;
  flex: 0 0 auto;
  transition:
    transform 180ms ease,
    color 160ms ease;
}

.home-profile-inline-action.is-entry-active {
  transform: scale(0.94);
}

.home-profile-inline-action-visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.home-profile-address-copy-visual {
  color: #94a3b8;
}

.home-profile-qr-stage {
  position: relative;
  width: 96px;
  min-height: 96px;
  height: auto;
  display: flex;
  align-items: center;
  justify-content: center;
  place-self: stretch end;
  flex-shrink: 0;
  border-radius: 0 var(--aether-surface-radius-lg, 20px) var(--aether-surface-radius-lg, 20px) 0;
}

.home-profile-qr-decor {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;
  opacity: 0.76;
  pointer-events: none;
}

.home-profile-qr-decor::before {
  content: '';
  position: absolute;
  inset: 0;
  background: repeating-linear-gradient(
    135deg,
    transparent,
    transparent 8px,
    rgba(17, 17, 17, 0.072) 8px,
    rgba(17, 17, 17, 0.072) 10px
  );
}

.home-profile-qr-entry {
  position: relative;
  z-index: 1;
  width: 48px;
  height: 48px;
  border-radius: 16px;
  color: #111111;
  background: rgba(255, 255, 255, 0.92);
  box-shadow: var(--aether-shadow-soft-xs, 0 0 16px rgba(15, 23, 42, 0.04));
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 180ms ease,
    box-shadow 180ms ease;
}

.home-profile-qr-entry.is-entry-active {
  transform: scale(0.96);
}

.home-profile-qr-entry-visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

@media (hover: hover) and (pointer: fine) {
  .home-profile-inline-action:hover {
    transform: translateY(-1px);
    color: #475569;
  }

  .home-profile-qr-entry:hover {
    transform: translateY(-1px);
    box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
  }
}
</style>
