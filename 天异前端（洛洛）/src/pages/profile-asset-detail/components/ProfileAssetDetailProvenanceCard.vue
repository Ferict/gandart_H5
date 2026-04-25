<!--
Responsibility: render the profile asset detail provenance card, including row layout and copy
action wiring for provenance values.
Out of scope: provenance row derivation, copy side effects, and detail-page orchestration.
-->
<template>
  <SecondaryPageCard class="card-provenance" icon="fingerprint" title="链上溯源 / PROVENANCE">
    <view class="provenance-list">
      <view v-for="row in rows" :key="row.label" class="provenance-row">
        <text class="provenance-label">{{ row.label }}</text>
        <view class="provenance-key-actions">
          <text class="provenance-value">{{ row.value }}</text>
          <HomeInteractiveTarget
            class="provenance-copy-hit"
            interaction-mode="compact"
            :label="row.copyLabel"
            @activate="emit('copy', row.value)"
          >
            <view class="provenance-copy-visual">
              <AetherIcon name="copy" :size="14" :stroke-width="1.9" />
            </view>
          </HomeInteractiveTarget>
        </view>
      </view>
    </view>
  </SecondaryPageCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AetherIcon from '../../../components/AetherIcon.vue'
import SecondaryPageCard from '../../../components/SecondaryPageCard.vue'
import HomeInteractiveTarget from '../../../components/HomeInteractiveTarget.vue'

const props = defineProps<{
  owner: string
  contract: string
  chain: string
  tokenStandard: string
}>()

const emit = defineEmits<{
  (event: 'copy', value: string): void
}>()

const rows = computed(() => [
  { label: '当前持有', value: props.owner, copyLabel: '复制当前持有' },
  { label: '智能合约', value: props.contract, copyLabel: '复制智能合约' },
  { label: '链路密钥', value: props.chain, copyLabel: '复制链路密钥' },
  { label: '授权标准', value: props.tokenStandard, copyLabel: '复制授权标准' },
])
</script>

<style scoped lang="scss">
.card-provenance {
  position: relative;
  overflow: hidden;
  gap: 24px;
  font-weight: 500;
}

.card-provenance :deep(.secondary-page-card-head) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
}

.card-provenance :deep(.secondary-page-card-head-title) {
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.card-provenance::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image: repeating-linear-gradient(
    -45deg,
    rgba(15, 23, 42, 0.02) 0,
    rgba(15, 23, 42, 0.02) 1px,
    transparent 1px,
    transparent 8px
  );
  pointer-events: none;
  opacity: 0;
}

.provenance-list {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.provenance-row {
  min-height: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.provenance-row + .provenance-row {
  border-top: none;
  padding-top: 0;
}

.provenance-label {
  color: #9ca3af;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
}

.provenance-value {
  color: #111;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  text-align: right;
  white-space: nowrap;
}

.provenance-key-actions {
  display: inline-flex;
  align-items: center;
  gap: 8px;
}

.provenance-copy-hit {
  width: 20px;
  min-width: 20px;
  height: 20px;
  color: #64748b;
  border-radius: 999px;
}

.provenance-copy-visual {
  width: 20px;
  height: 20px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
