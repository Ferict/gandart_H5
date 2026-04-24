<!--
Responsibility: render the reusable construction placeholder surface for unfinished but retained entrypoints.
Out of scope: route parsing, feature execution, and real content-domain fetching.
-->

<template>
  <view class="construction-placeholder">
    <view class="construction-placeholder-shell">
      <view class="construction-placeholder-header">
        <HomeInteractiveTarget
          class="construction-placeholder-back-hit"
          interaction-mode="compact"
          label="返回上一页"
          @activate="emitBack"
        >
          <AetherIcon name="arrow-left" :size="20" :stroke-width="2" />
        </HomeInteractiveTarget>
        <view class="construction-placeholder-header-copy">
          <text class="construction-placeholder-header-title">{{ title }}</text>
          <text class="construction-placeholder-header-subtitle">{{ englishTitle }}</text>
        </view>
        <view class="construction-placeholder-header-spacer" />
      </view>

      <view class="construction-placeholder-main-panel">
        <view class="construction-placeholder-icon-wrap">
          <view class="construction-placeholder-icon-shell">
            <AetherIcon
              class="construction-placeholder-icon-main"
              name="terminal-square"
              :size="36"
              :stroke-width="1.3"
            />
            <view class="construction-placeholder-loader-dot">
              <AetherIcon
                class="construction-placeholder-loader-icon"
                name="loader-2"
                :size="14"
                :stroke-width="2.2"
              />
            </view>
          </view>
        </view>

        <view class="construction-placeholder-copy-block">
          <text class="construction-placeholder-panel-title">{{ panelTitle }}</text>
          <text class="construction-placeholder-status-line">{{ resolvedStatusLabel }}</text>
          <text class="construction-placeholder-desc">{{ description }}</text>
          <text class="construction-placeholder-reserve">{{ reserveHint }}</text>
        </view>

        <view class="construction-placeholder-footer">
          <view
            class="construction-placeholder-return-hit"
            hover-class="is-hit-active"
            @tap="emitBack"
          >
            <AetherIcon name="arrow-left" :size="16" :stroke-width="2.2" />
            <text class="construction-placeholder-return-copy">{{ backLabel }}</text>
          </view>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AetherIcon from './AetherIcon.vue'
import HomeInteractiveTarget from './HomeInteractiveTarget.vue'

interface ConstructionPlaceholderProps {
  title: string
  englishTitle: string
  statusLabel: string
  description: string
  reserveHint: string
  panelTitle?: string
  backLabel?: string
}

const props = withDefaults(defineProps<ConstructionPlaceholderProps>(), {
  panelTitle: '系统模块构建中',
  backLabel: '返回上一级',
})

const emit = defineEmits<{
  (event: 'back'): void
}>()

const resolvedStatusLabel = computed(() => {
  const normalized = props.statusLabel.trim()
  if (!normalized) {
    return 'STATUS: SYNCING_DATA'
  }

  return normalized.toUpperCase().startsWith('STATUS:')
    ? normalized.toUpperCase()
    : `STATUS: ${normalized.toUpperCase()}`
})

const emitBack = () => {
  emit('back')
}
</script>

<style lang="scss" scoped>
.construction-placeholder {
  width: 100%;
  min-height: 100dvh;
  background: #fafafa;
}

.construction-placeholder-shell {
  min-height: 100dvh;
  padding: calc(var(--status-bar-height, 0px) + 8px) 16px
    calc(32px + env(safe-area-inset-bottom, 0px));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
}

.construction-placeholder-header {
  min-height: 48px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.construction-placeholder-back-hit {
  width: 24px;
  height: 24px;
  border-radius: 999px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #111111;
}

.construction-placeholder-header-spacer {
  width: 24px;
  height: 24px;
  flex-shrink: 0;
}

.construction-placeholder-header-copy {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  align-items: baseline;
  justify-content: center;
  gap: 8px;
}

.construction-placeholder-header-title {
  font-size: 32rpx;
  line-height: 40rpx;
  font-weight: 800;
  color: #111111;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.construction-placeholder-header-subtitle {
  font-size: 12px;
  line-height: 12px;
  font-weight: 500;
  color: #22d3ee;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  transform: scale(0.75);
  transform-origin: left bottom;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.construction-placeholder-main-panel {
  flex: 1 1 auto;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-bottom: 48px;
  box-sizing: border-box;
}

.construction-placeholder-icon-wrap {
  width: 100%;
  display: flex;
  justify-content: center;
  margin-bottom: 24px;
}

.construction-placeholder-icon-shell {
  position: relative;
  width: 96px;
  height: 96px;
  border-radius: var(--aether-surface-radius-lg, 20px);
  border: 1px solid #f1f5f9;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: var(--aether-shadow-surface-md, 0 0 24px rgba(15, 23, 42, 0.05));
}

.construction-placeholder-icon-main {
  color: #cbd5e1;
}

.construction-placeholder-loader-dot {
  position: absolute;
  right: 8px;
  bottom: 8px;
  width: 20px;
  height: 20px;
  border-radius: 999px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
}

.construction-placeholder-loader-icon {
  color: #22d3ee;
  animation: construction-placeholder-spin 960ms linear infinite;
}

.construction-placeholder-copy-block {
  width: 100%;
  max-width: 320px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
}

.construction-placeholder-panel-title {
  font-size: 36rpx;
  line-height: 44rpx;
  font-weight: 900;
  color: #111111;
}

.construction-placeholder-status-line {
  font-size: 12px;
  line-height: 12px;
  color: #22d3ee;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  font-family: var(--aether-font-system, system-ui, sans-serif);
  transform: scale(0.83);
  transform-origin: center center;
}

.construction-placeholder-desc,
.construction-placeholder-reserve {
  width: 100%;
  font-size: 12px;
  line-height: 20px;
  color: #94a3b8;
  text-align: center;
}

.construction-placeholder-reserve {
  margin-top: -4px;
}

.construction-placeholder-footer {
  margin-top: 28px;
  width: 100%;
  display: flex;
  justify-content: center;
}

.construction-placeholder-return-hit {
  min-width: 128px;
  min-height: 44px;
  border-radius: 999px;
  padding: 0 20px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #ffffff;
  background: #111111;
  box-shadow: var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08));
}

.construction-placeholder-return-copy {
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
  color: #ffffff;
}

.is-hit-active {
  transform: scale(0.98);
}

@keyframes construction-placeholder-spin {
  from {
    transform: rotate(0deg);
  }

  to {
    transform: rotate(360deg);
  }
}
</style>
