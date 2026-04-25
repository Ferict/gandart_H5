<!--
Responsibility: render the shared secondary-page card surface with optional heading, icon,
and head-right slot while keeping card framing consistent across secondary pages.
Out of scope: page-specific business data, section-level layout orchestration, and navigation logic.
-->
<template>
  <view
    class="secondary-page-card"
    :class="[`surface-${props.surface}`, `padding-${props.padding}`]"
  >
    <view v-if="hasHead" class="secondary-page-card-head">
      <view class="secondary-page-card-head-main">
        <AetherIcon
          v-if="props.icon"
          class="secondary-page-card-head-icon"
          :name="props.icon"
          :size="14"
          :stroke-width="2"
        />
        <text v-if="props.title" class="secondary-page-card-head-title">{{ props.title }}</text>
      </view>
      <view v-if="hasHeadRightSlot" class="secondary-page-card-head-right">
        <slot name="head-right" />
      </view>
    </view>
    <slot />
  </view>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import AetherIcon from './AetherIcon.vue'
import type { AetherIconName } from '../models/ui/aetherIcon.model'

interface Props {
  title?: string
  icon?: AetherIconName
  surface?: 'default' | 'muted'
  padding?: 'default' | 'dense'
}

const props = withDefaults(defineProps<Props>(), {
  title: '',
  icon: undefined,
  surface: 'default',
  padding: 'default',
})

const slots = useSlots()

const hasHeadRightSlot = computed(() => Boolean(slots['head-right']))
const hasHead = computed(() => Boolean(props.title || props.icon || hasHeadRightSlot.value))
</script>

<style scoped lang="scss">
.secondary-page-card {
  border-radius: 20px;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-surface-sm, 0 0 12px rgba(15, 23, 42, 0.05));
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.secondary-page-card.surface-muted {
  background: var(--aether-surface-secondary, #f6f7f9);
}

.secondary-page-card.padding-default {
  padding: 24px;
}

.secondary-page-card.padding-dense {
  padding: 20px;
}

.secondary-page-card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #0f172a;
}

.secondary-page-card-head-main {
  min-width: 0;
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.secondary-page-card-head-icon {
  color: currentColor;
}

.secondary-page-card-head-title {
  min-width: 0;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.secondary-page-card-head-right {
  display: inline-flex;
  align-items: center;
  justify-content: flex-end;
  flex: 0 0 auto;
}
</style>
