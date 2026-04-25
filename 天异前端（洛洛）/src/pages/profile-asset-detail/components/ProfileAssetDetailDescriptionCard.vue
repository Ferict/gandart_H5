<!--
Responsibility: render the profile asset detail description card, including plain description text
and the optional inline error message block.
Out of scope: description derivation, data loading, and copy or interaction behavior.
-->
<template>
  <SecondaryPageCard class="card-description" icon="octagon-alert" title="藏品详情 / DETAIL">
    <text class="desc">{{ description }}</text>
    <text v-if="errorMessage" class="err">{{ errorMessage }}</text>
  </SecondaryPageCard>
</template>

<script setup lang="ts">
import SecondaryPageCard from '../../../components/SecondaryPageCard.vue'

defineProps<{
  description: string
  errorMessage?: string
}>()
</script>

<style scoped lang="scss">
.card-description {
  gap: 24px;
  font-weight: 500;
}

.card-description :deep(.secondary-page-card-head) {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #0f172a;
}

.card-description :deep(.secondary-page-card-head-title) {
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.desc {
  color: #475569;
  font-size: 13px;
  line-height: 22px;
  font-weight: 500;
}

.err {
  color: #ef4444;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
}
</style>
