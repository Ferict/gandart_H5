<!--
Responsibility: render the profile asset detail traits grid, including per-trait labels and values.
Out of scope: trait derivation, rarity calculations, and detail-page data loading.
-->
<template>
  <SecondaryPageCard class="card-traits" icon="hexagon" title="多维属性 / TRAITS">
    <view class="trait-grid">
      <view v-for="trait in traits" :key="`${trait.typeLabel}-${trait.value}`" class="trait-item">
        <view class="trait-head">
          <text class="trait-type">{{ trait.typeLabel }}</text>
        </view>
        <text class="trait-value">{{ trait.value }}</text>
      </view>
    </view>
  </SecondaryPageCard>
</template>

<script setup lang="ts">
import SecondaryPageCard from '../../../components/SecondaryPageCard.vue'
import type { AssetDetailTrait } from '../runtime/useProfileAssetDetailPresentation'

defineProps<{
  traits: AssetDetailTrait[]
}>()
</script>

<style scoped lang="scss">
.card-traits {
  gap: 24px;
  font-weight: 500;
}

.card-traits :deep(.secondary-page-card-head) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
}

.card-traits :deep(.secondary-page-card-head-title) {
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.trait-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px 12px;
}

.trait-item {
  min-height: 0;
  border-radius: 0;
  background: transparent;
  padding: 0;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  gap: 12px;
}

.trait-head {
  display: flex;
  min-height: 16px;
  align-items: center;
  justify-content: flex-start;
  gap: 8px;
}

.trait-type {
  color: #9ca3af;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.04em;
  display: inline-block;
  min-width: 0;
  transform: scale(0.83);
  transform-origin: left center;
}

.trait-value {
  color: #111;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
