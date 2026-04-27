<!--
Responsibility: render the page-local priority-draw result modal from a stable view model.
Out of scope: reward claiming, provider mutation, and formal result transport behavior.
-->
<template>
  <view v-if="open && result" class="priority-draw-result-modal">
    <view class="priority-draw-result-backdrop" @tap="emit('close')" />
    <view class="priority-draw-result-card" :class="statusClass">
      <HomeInteractiveTarget
        class="priority-draw-result-close"
        interaction-mode="compact"
        label="关闭结果弹层"
        @activate="emit('close')"
      >
        <AetherIcon name="x" :size="20" :stroke-width="2.4" />
      </HomeInteractiveTarget>

      <view class="priority-draw-result-icon">
        <AetherIcon :name="iconName" :size="30" :stroke-width="1.8" />
      </view>

      <text class="priority-draw-result-title">{{ result.title }}</text>
      <text class="priority-draw-result-subtitle">{{ result.subtitle }}</text>
      <text class="priority-draw-result-copy">{{ result.description }}</text>

      <view v-if="result.prizeItems.length" class="priority-draw-result-prizes">
        <view v-for="item in result.prizeItems" :key="item.id" class="priority-draw-result-prize">
          <image
            class="priority-draw-result-prize-image"
            :src="item.coverImageUrl"
            mode="aspectFill"
          />
          <view class="priority-draw-result-prize-body">
            <text class="priority-draw-result-prize-type">{{ item.type }}</text>
            <text class="priority-draw-result-prize-name">{{ item.name }}</text>
            <text class="priority-draw-result-prize-count">数量 x{{ item.quantity }}</text>
          </view>
        </view>
      </view>

      <view v-else-if="result.supportLabel" class="priority-draw-result-support">
        <AetherIcon :name="supportIconName" :size="15" :stroke-width="2" />
        <text class="priority-draw-result-support-copy">{{ result.supportLabel }}</text>
      </view>

      <HomeInteractiveTarget
        class="priority-draw-result-action"
        label="关闭结果弹层"
        @activate="emit('close')"
      >
        <view class="priority-draw-result-action-visual">
          <text class="priority-draw-result-action-copy">{{ result.actionLabel }}</text>
          <AetherIcon name="chevron-right" :size="14" :stroke-width="2.4" />
        </view>
      </HomeInteractiveTarget>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import type { AetherIconName } from '../../models/ui/aetherIcon.model'
import type { PriorityDrawResultViewModel } from './runtime/priority-draw.model'

const props = defineProps<{
  open: boolean
  result: PriorityDrawResultViewModel | null
}>()

const emit = defineEmits<{
  close: []
}>()

const statusClass = computed(() => ({
  'is-win': props.result?.status === 'win',
  'is-lose': props.result?.status === 'lose',
  'is-error': props.result?.status === 'error',
}))

const iconName = computed<AetherIconName>(() => {
  if (props.result?.status === 'win') {
    return 'shield-check'
  }

  if (props.result?.status === 'error') {
    return 'octagon-alert'
  }

  return 'box'
})

const supportIconName = computed<AetherIconName>(() => {
  if (props.result?.status === 'error') {
    return 'shield-alert'
  }

  return 'gift'
})
</script>

<style scoped lang="scss">
.priority-draw-result-modal {
  position: fixed;
  inset: 0;
  z-index: 60;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 16px;
  box-sizing: border-box;
}

.priority-draw-result-backdrop {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.18);
}

.priority-draw-result-card {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 396px;
  box-sizing: border-box;
  padding: 30px 20px 20px;
  border: 1px solid rgba(15, 23, 42, 0.08);
  border-radius: 28px;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: 0 18px 52px rgba(15, 23, 42, 0.14);
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  animation: priority-draw-result-enter 220ms ease-out;
}

.priority-draw-result-close {
  position: absolute;
  right: 16px;
  top: 16px;
  width: 28px;
  height: 28px;
  color: #94a3b8;
}

.priority-draw-result-icon {
  width: 58px;
  height: 58px;
  border-radius: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
  background: var(--aether-surface-secondary, #f6f7f9);
  color: #94a3b8;
}

.priority-draw-result-card.is-win .priority-draw-result-icon {
  background: rgba(236, 254, 255, 0.9);
  color: #0891b2;
}

.priority-draw-result-card.is-error .priority-draw-result-icon {
  background: rgba(254, 242, 242, 0.95);
  color: #ef4444;
}

.priority-draw-result-title {
  font-size: 20px;
  line-height: 26px;
  font-weight: 900;
  letter-spacing: -0.03em;
  color: #111111;
}

.priority-draw-result-subtitle {
  margin-top: 6px;
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #22d3ee;
  transform: scale(0.88);
}

.priority-draw-result-card.is-lose .priority-draw-result-subtitle {
  color: #94a3b8;
}

.priority-draw-result-card.is-error .priority-draw-result-subtitle {
  color: #ef4444;
}

.priority-draw-result-copy {
  margin-top: 14px;
  font-size: 12px;
  line-height: 20px;
  font-weight: 500;
  color: #64748b;
  text-align: justify;
}

.priority-draw-result-prizes {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 18px;
}

.priority-draw-result-prize {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  box-sizing: border-box;
  padding: 10px;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 18px;
  background: var(--aether-surface-secondary, #f6f7f9);
  text-align: left;
}

.priority-draw-result-prize-image {
  width: 58px;
  height: 58px;
  border-radius: 14px;
  background: var(--aether-surface-tertiary, #f1f5f9);
  flex: 0 0 auto;
}

.priority-draw-result-prize-body {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.priority-draw-result-prize-type,
.priority-draw-result-prize-name,
.priority-draw-result-prize-count {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.priority-draw-result-prize-type {
  font-size: 12px;
  line-height: 10px;
  font-weight: 800;
  letter-spacing: 0.08em;
  color: #22d3ee;
  transform: scale(0.84);
  transform-origin: left center;
}

.priority-draw-result-prize-name {
  font-size: 13px;
  line-height: 17px;
  font-weight: 900;
  color: #111111;
}

.priority-draw-result-prize-count {
  font-size: 12px;
  line-height: 14px;
  font-weight: 500;
  color: #94a3b8;
}

.priority-draw-result-support {
  min-height: 42px;
  margin-top: 18px;
  padding: 0 14px;
  border: 1px dashed rgba(148, 163, 184, 0.35);
  border-radius: 16px;
  background: var(--aether-surface-secondary, #f6f7f9);
  color: #64748b;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.priority-draw-result-support-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
}

.priority-draw-result-action {
  width: 100%;
  margin-top: 22px;
  border-radius: 16px;
}

.priority-draw-result-action-visual {
  min-height: 48px;
  border-radius: 16px;
  background: var(--aether-surface-inverse, #111111);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
}

.priority-draw-result-action-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

@keyframes priority-draw-result-enter {
  from {
    opacity: 0;
    transform: translateY(18px) scale(0.98);
  }

  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}
</style>
