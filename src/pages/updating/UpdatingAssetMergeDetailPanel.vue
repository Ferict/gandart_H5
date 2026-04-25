<!--
Responsibility: render the page-local asset-merge detail panel from a stable view model.
Out of scope: formal backend transport, merge mutation, and asset delivery side effects.
-->
<template>
  <view class="asset-merge-detail">
    <view class="asset-merge-detail-title-block">
      <text class="asset-merge-detail-eyebrow">合成计划</text>
      <text class="asset-merge-detail-title">{{ event.title }}</text>
    </view>

    <view class="asset-merge-detail-block">
      <view class="asset-merge-detail-section-head">
        <text class="asset-merge-detail-section-title">合成产出</text>
        <text class="asset-merge-detail-section-meta"
          >本次产出 {{ event.yieldAssets.length }} 份</text
        >
      </view>

      <view class="asset-merge-yield-grid" :class="{ 'is-single': event.yieldAssets.length === 1 }">
        <view v-for="asset in event.yieldAssets" :key="asset.id" class="asset-merge-yield-card">
          <image class="asset-merge-yield-image" :src="asset.coverImageUrl" mode="aspectFill" />
          <view class="asset-merge-yield-shade" />
          <view class="asset-merge-yield-copy">
            <text class="asset-merge-yield-level">{{ asset.level }}</text>
            <text class="asset-merge-yield-title">{{ asset.title }}</text>
          </view>
        </view>
      </view>
    </view>

    <view class="asset-merge-stat-card">
      <view class="asset-merge-stat">
        <view class="asset-merge-stat-label-row">
          <AetherIcon name="calendar-days" :size="13" :stroke-width="2" tone="danger" />
          <text class="asset-merge-stat-label">{{ timeStateLabel }}</text>
        </view>
        <text class="asset-merge-stat-value">{{ event.countdownLabel }}</text>
      </view>
      <view class="asset-merge-stat-divider" />
      <view class="asset-merge-stat align-right">
        <view class="asset-merge-stat-label-row">
          <AetherIcon name="users" :size="13" :stroke-width="2" tone="subtle" />
          <text class="asset-merge-stat-label">热度</text>
        </view>
        <text class="asset-merge-stat-value">{{ heatValue }}</text>
      </view>
    </view>

    <view class="asset-merge-detail-block">
      <view class="asset-merge-detail-section-head">
        <text class="asset-merge-detail-section-title">合成方案</text>
        <text class="asset-merge-detail-section-meta">
          已就绪 {{ activeRecipe.readyMaterialCount }}/{{ activeRecipe.materialCount }}
        </text>
      </view>

      <view v-if="event.recipes.length > 1" class="asset-merge-recipe-tabs">
        <HomeInteractiveTarget
          v-for="recipe in event.recipes"
          :key="recipe.id"
          class="asset-merge-recipe-tab"
          interaction-mode="compact"
          :label="`选择${recipe.name}`"
          @activate="emit('select-recipe', recipe.id)"
        >
          <view
            class="asset-merge-recipe-tab-visual"
            :class="{ 'is-active': recipe.id === activeRecipe.id }"
          >
            <text class="asset-merge-recipe-tab-copy">{{ recipe.name }}</text>
          </view>
        </HomeInteractiveTarget>
      </view>

      <view class="asset-merge-material-stack">
        <view
          v-for="material in activeRecipe.materials"
          :key="material.id"
          class="asset-merge-material-card"
        >
          <image
            class="asset-merge-material-image"
            :src="material.coverImageUrl"
            mode="aspectFill"
          />
          <view class="asset-merge-material-body">
            <view class="asset-merge-material-head">
              <text class="asset-merge-material-name">{{ material.name }}</text>
              <text class="asset-merge-material-state" :class="{ 'is-lack': !material.isReady }">
                {{ material.isReady ? '已满足' : '不足' }}
              </text>
            </view>
            <view class="asset-merge-material-progress-row">
              <view class="asset-merge-material-progress-track">
                <view
                  class="asset-merge-material-progress-bar"
                  :class="{ 'is-lack': !material.isReady }"
                  :style="{ width: `${material.progressPercent}%` }"
                />
              </view>
              <text class="asset-merge-material-count">
                <text :class="{ 'is-lack': !material.isReady }">{{ material.owned }}</text>
                <text class="asset-merge-material-required">/{{ material.required }}</text>
              </text>
            </view>
          </view>
        </view>
      </view>
    </view>

    <view class="asset-merge-rule-card">
      <view class="asset-merge-rule-head">
        <AetherIcon name="terminal-square" :size="16" :stroke-width="2" tone="subtle" />
        <text class="asset-merge-rule-title">活动规则</text>
      </view>
      <view class="asset-merge-rule-list">
        <text
          v-for="(rule, index) in event.rules"
          :key="`${event.id}-rule-${index}`"
          class="asset-merge-rule-copy"
        >
          {{ index + 1 }}. {{ rule }}
        </text>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import type {
  AssetMergeEventViewModel,
  AssetMergeRecipeViewModel,
} from './runtime/asset-merge.model'

const props = defineProps<{
  event: AssetMergeEventViewModel
  activeRecipeId: string
}>()

const emit = defineEmits<{
  'select-recipe': [recipeId: string]
}>()

const emptyRecipe: AssetMergeRecipeViewModel = {
  id: 'empty',
  name: '暂无方案',
  materials: [],
  readyMaterialCount: 0,
  materialCount: 0,
  isReady: false,
}

const activeRecipe = computed(
  () =>
    props.event.recipes.find((recipe) => recipe.id === props.activeRecipeId) ??
    props.event.recipes[0] ??
    emptyRecipe
)

const timeStateLabel = computed(() => {
  if (props.event.status === 'UPCOMING') {
    return '未开始'
  }

  if (props.event.status === 'ENDED') {
    return '已结束'
  }

  return '即将结束'
})

const heatValue = computed(() => {
  if (props.event.status === 'UPCOMING') {
    return '活动未开始'
  }

  return `${props.event.participantsLabel} 人`
})
</script>

<style scoped lang="scss">
.asset-merge-detail {
  display: flex;
  flex-direction: column;
  gap: 26px;
}

.asset-merge-detail-title-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 0 2px;
}

.asset-merge-detail-eyebrow {
  color: #22c7dc;
  font-size: 11px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.asset-merge-detail-title {
  color: #111111;
  font-size: 24px;
  line-height: 32px;
  font-weight: 800;
  letter-spacing: -0.04em;
}

.asset-merge-detail-block {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-merge-detail-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 12px;
  padding: 0 2px;
}

.asset-merge-detail-section-title,
.asset-merge-rule-title {
  color: #111111;
  font-size: 14px;
  line-height: 18px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.asset-merge-detail-section-meta {
  color: #64748b;
  font-size: 11px;
  line-height: 14px;
  font-weight: 500;
}

.asset-merge-yield-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.asset-merge-yield-grid.is-single {
  grid-template-columns: minmax(0, 1fr);
}

.asset-merge-yield-card {
  position: relative;
  overflow: hidden;
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 20px;
  background: var(--aether-surface-inverse, #111111);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
}

.asset-merge-yield-card::before {
  content: '';
  display: block;
  width: 100%;
  padding-top: 100%;
}

.asset-merge-yield-grid.is-single .asset-merge-yield-card::before {
  padding-top: 56.25%;
}

.asset-merge-yield-image,
.asset-merge-yield-shade {
  position: absolute;
  inset: 0;
}

.asset-merge-yield-image {
  width: 100%;
  height: 100%;
}

.asset-merge-yield-shade {
  background: linear-gradient(180deg, transparent 26%, rgba(15, 23, 42, 0.82));
}

.asset-merge-yield-copy {
  position: absolute;
  left: 12px;
  right: 12px;
  bottom: 12px;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-merge-yield-level,
.asset-merge-yield-title {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.asset-merge-yield-level {
  color: #22d3ee;
  font-size: 11px;
  line-height: 10px;
  font-weight: 700;
  transform: scale(0.88);
  transform-origin: left center;
}

.asset-merge-yield-title {
  color: #ffffff;
  font-size: 13px;
  line-height: 17px;
  font-weight: 800;
}

.asset-merge-yield-grid.is-single .asset-merge-yield-title {
  font-size: 18px;
  line-height: 24px;
}

.asset-merge-stat-card,
.asset-merge-material-card,
.asset-merge-rule-card {
  border: 1px solid rgba(15, 23, 42, 0.06);
  border-radius: 22px;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft, 0 0 24px rgba(15, 23, 42, 0.05));
}

.asset-merge-stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
}

.asset-merge-stat {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.asset-merge-stat.align-right {
  align-items: flex-end;
  text-align: right;
}

.asset-merge-stat-label-row {
  display: inline-flex;
  align-items: center;
  gap: 6px;
}

.asset-merge-stat-label {
  color: #64748b;
  font-size: 11px;
  line-height: 12px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.asset-merge-stat-value {
  color: #111111;
  font-size: 17px;
  line-height: 20px;
  font-weight: 700;
}

.asset-merge-stat-divider {
  width: 1px;
  height: 40px;
  background: rgba(148, 163, 184, 0.16);
}

.asset-merge-recipe-tabs {
  display: flex;
  gap: 4px;
  padding: 4px;
  border-radius: 16px;
  background: var(--aether-surface-secondary, #f6f7f9);
}

.asset-merge-recipe-tab {
  flex: 1 1 0;
  min-width: 0;
  border-radius: 12px;
}

.asset-merge-recipe-tab-visual {
  min-height: 38px;
  padding: 0 10px;
  border-radius: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
}

.asset-merge-recipe-tab-visual.is-active {
  background: var(--aether-surface-primary, #ffffff);
  color: #111111;
  box-shadow: var(--aether-shadow-soft-xs, 0 0 16px rgba(15, 23, 42, 0.04));
}

.asset-merge-recipe-tab-copy {
  font-size: 12px;
  line-height: 14px;
  font-weight: 700;
}

.asset-merge-material-stack {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-merge-material-card {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 12px;
  box-sizing: border-box;
}

.asset-merge-material-image {
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  border-radius: 16px;
  background: var(--aether-surface-tertiary, #f1f5f9);
}

.asset-merge-material-body {
  min-width: 0;
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.asset-merge-material-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.asset-merge-material-name {
  min-width: 0;
  color: #111111;
  font-size: 14px;
  line-height: 18px;
  font-weight: 700;
}

.asset-merge-material-state {
  flex: 0 0 auto;
  color: #22c7dc;
  font-size: 11px;
  line-height: 12px;
  font-weight: 700;
}

.asset-merge-material-state.is-lack,
.asset-merge-material-count .is-lack {
  color: #ef4444;
}

.asset-merge-material-progress-row {
  display: flex;
  align-items: center;
  gap: 10px;
}

.asset-merge-material-progress-track {
  height: 6px;
  flex: 1;
  border-radius: 999px;
  background: var(--aether-surface-secondary, #f6f7f9);
  overflow: hidden;
}

.asset-merge-material-progress-bar {
  height: 100%;
  border-radius: 999px;
  background: var(--aether-surface-inverse, #111111);
}

.asset-merge-material-progress-bar.is-lack {
  background: #ef4444;
}

.asset-merge-material-count {
  color: #111111;
  font-size: 13px;
  line-height: 16px;
  font-weight: 700;
}

.asset-merge-material-required {
  color: #94a3b8;
}

.asset-merge-rule-card {
  padding: 18px;
  box-sizing: border-box;
}

.asset-merge-rule-head {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.asset-merge-rule-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.asset-merge-rule-copy {
  color: #64748b;
  font-size: 12px;
  line-height: 20px;
  font-weight: 500;
}
</style>
