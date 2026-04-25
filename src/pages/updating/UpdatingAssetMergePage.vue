<!--
Responsibility: render the retained asset-merge module page that replaces the generic
construction placeholder for the current activity entry target.
Out of scope: real merge-domain fetching, merge execution, and formal contract wiring.
-->
<template>
  <page-meta :page-style="pageMetaStyle" />
  <SecondaryPageFrame
    route-source="updating-asset-merge"
    :title="frameTitle"
    :has-action-rail="Boolean(selectedEvent)"
    :action-rail-occupied-height="112"
    @back="handleFrameBack"
  >
    <view class="asset-merge-page-content">
      <UpdatingAssetMergeDetailPanel
        v-if="selectedEvent"
        :event="selectedEvent"
        :active-recipe-id="activeRecipeId"
        @select-recipe="handleRecipeSelect"
      />

      <view v-else-if="assetMergeEventList.length" class="asset-merge-event-list">
        <view
          v-for="event in assetMergeEventList"
          :key="event.id"
          class="asset-merge-card"
          :class="resolveCardClass(event)"
        >
          <view class="asset-merge-card-cover" :class="resolveCoverClass(event)">
            <image
              class="asset-merge-card-cover-image"
              :src="event.coverImageUrl"
              mode="aspectFill"
            />
            <view class="asset-merge-card-status" :class="resolveStatusClass(event)">
              <view class="asset-merge-card-status-dot" />
              <text class="asset-merge-card-status-copy">{{ event.statusLabel }}</text>
            </view>
          </view>

          <view class="asset-merge-card-body">
            <text class="asset-merge-card-title">{{ event.title }}</text>

            <view class="asset-merge-card-time">
              <text class="asset-merge-card-time-label">TIME</text>
              <text class="asset-merge-card-time-copy">{{ event.timeRange }}</text>
            </view>

            <view class="asset-merge-card-formula">
              <text class="asset-merge-card-formula-label">需求素材 / Formula</text>
              <view class="asset-merge-card-formula-row">
                <AetherIcon name="box" :size="14" :stroke-width="2" tone="muted" />
                <text class="asset-merge-card-formula-copy">{{ event.formula }}</text>
              </view>
            </view>

            <view class="asset-merge-card-footer">
              <view class="asset-merge-card-supply">
                <view class="asset-merge-card-supply-rail" />
                <view class="asset-merge-card-supply-copy">
                  <text class="asset-merge-card-supply-label">剩余份数 / Remaining</text>
                  <view class="asset-merge-card-supply-value">
                    <text class="asset-merge-card-supply-main">
                      {{ event.remainingSupplyLabel }}
                    </text>
                    <text class="asset-merge-card-supply-total">
                      / {{ event.totalSupplyLabel }}
                    </text>
                  </view>
                </view>
              </view>

              <HomeInteractiveTarget
                class="asset-merge-card-action"
                interaction-mode="compact"
                :label="resolveActionLabel(event)"
                :disabled="event.status === 'ENDED'"
                @activate="handleMergeTap(event)"
              >
                <view
                  class="asset-merge-card-action-visual"
                  :class="{ 'is-disabled': event.status === 'ENDED' }"
                >
                  <text class="asset-merge-card-action-copy">{{ resolveActionLabel(event) }}</text>
                  <AetherIcon
                    v-if="event.status !== 'ENDED'"
                    name="chevron-right"
                    :size="13"
                    :stroke-width="2.4"
                  />
                </view>
              </HomeInteractiveTarget>
            </view>
          </view>
        </view>
      </view>

      <view v-else class="asset-merge-empty-state">
        <AetherIcon name="workflow" :size="32" :stroke-width="1.5" tone="subtle" />
        <text class="asset-merge-empty-copy">当前暂无可参与的合成活动</text>
      </view>
    </view>

    <template v-if="selectedEvent" #action-rail>
      <HomeInteractiveTarget
        class="asset-merge-detail-action"
        :label="primaryActionLabel"
        :disabled="isPrimaryActionDisabled"
        @activate="handlePrimaryAction"
      >
        <view
          class="asset-merge-detail-action-visual"
          :class="{ 'is-disabled': isPrimaryActionDisabled }"
        >
          <AetherIcon :name="primaryActionIcon" :size="16" :stroke-width="2.3" />
          <text class="asset-merge-detail-action-copy">{{ primaryActionLabel }}</text>
        </view>
      </HomeInteractiveTarget>
    </template>
  </SecondaryPageFrame>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import SecondaryPageFrame from '../../components/SecondaryPageFrame.vue'
import { useResponsiveRailLayout } from '../../composables/useResponsiveRailLayout'
import type { AetherIconName } from '../../models/ui/aetherIcon.model'
import UpdatingAssetMergeDetailPanel from './UpdatingAssetMergeDetailPanel.vue'
import type { AssetMergeEventViewModel, AssetMergeTone } from './runtime/asset-merge.model'
import { useAssetMergeRuntime } from './runtime/useAssetMergeRuntime'

const emit = defineEmits<{
  back: []
}>()

const { runtimeContext } = useResponsiveRailLayout()
const { assetMergeEventList } = useAssetMergeRuntime()
const selectedEventId = ref<string | null>(null)
const activeRecipeId = ref('')
const isMerging = ref(false)

const selectedEvent = computed(() => {
  if (!selectedEventId.value) {
    return null
  }

  return assetMergeEventList.value.find((event) => event.id === selectedEventId.value) ?? null
})

const activeRecipe = computed(() => {
  const event = selectedEvent.value
  if (!event) {
    return null
  }

  return (
    event.recipes.find((recipe) => recipe.id === activeRecipeId.value) ?? event.recipes[0] ?? null
  )
})

const frameTitle = computed(() => (selectedEvent.value ? '合成详情' : '资产合成'))

const isPrimaryActionDisabled = computed(() => {
  const event = selectedEvent.value
  if (!event) {
    return true
  }

  return event.status !== 'LIVE' || !activeRecipe.value?.isReady || isMerging.value
})

const primaryActionLabel = computed(() => {
  const event = selectedEvent.value
  if (!event) {
    return ''
  }

  if (event.status === 'UPCOMING') {
    return '活动未开始'
  }

  if (event.status === 'ENDED') {
    return '活动已结束'
  }

  if (isMerging.value) {
    return '合成中'
  }

  if (!activeRecipe.value?.isReady) {
    return '当前方案素材不足'
  }

  return '确认合成'
})

const primaryActionIcon = computed<AetherIconName>(() => {
  if (isMerging.value) {
    return 'loader-2'
  }

  if (selectedEvent.value?.status === 'UPCOMING') {
    return 'calendar-days'
  }

  if (selectedEvent.value?.status === 'ENDED') {
    return 'octagon-alert'
  }

  if (!activeRecipe.value?.isReady) {
    return 'shield-alert'
  }

  return 'zap'
})

watch(selectedEvent, (event) => {
  activeRecipeId.value = event?.recipes[0]?.id ?? ''
  isMerging.value = false
})

const pageMetaStyle = computed(() => {
  const viewportHeight = runtimeContext.value.viewportHeight
  const height = viewportHeight > 0 ? `${viewportHeight}px` : '100vh'
  return `height:${height};min-height:${height};overflow:hidden;background:var(--aether-page-background,#fafafa);`
})

const resolveCardClass = (event: AssetMergeEventViewModel) => ({
  'is-ended': event.status === 'ENDED',
})

const resolveStatusClass = (event: AssetMergeEventViewModel) => ({
  'is-live': event.status === 'LIVE',
  'is-upcoming': event.status === 'UPCOMING',
  'is-ended': event.status === 'ENDED',
})

const resolveCoverClass = (event: AssetMergeEventViewModel) => {
  const toneMap: Record<AssetMergeTone, string> = {
    dark: 'tone-dark',
    warm: 'tone-warm',
    snow: 'tone-snow',
    field: 'tone-field',
  }

  return toneMap[event.tone]
}

const resolveActionLabel = (event: AssetMergeEventViewModel) => {
  if (event.status === 'ENDED') {
    return '已结束'
  }

  return event.status === 'UPCOMING' ? '查看方案' : '前往合成页'
}

const handleMergeTap = (event: AssetMergeEventViewModel) => {
  if (event.status === 'ENDED') {
    return
  }

  selectedEventId.value = event.id
}

const handleFrameBack = () => {
  if (selectedEventId.value) {
    selectedEventId.value = null
    return
  }

  emit('back')
}

const handleRecipeSelect = (recipeId: string) => {
  activeRecipeId.value = recipeId
}

const handlePrimaryAction = () => {
  const event = selectedEvent.value
  if (!event) {
    return
  }

  if (event.status === 'UPCOMING') {
    uni.showToast({
      title: '活动暂未开始',
      icon: 'none',
    })
    return
  }

  if (event.status === 'ENDED') {
    uni.showToast({
      title: '活动已结束',
      icon: 'none',
    })
    return
  }

  if (!activeRecipe.value?.isReady) {
    uni.showToast({
      title: '当前方案素材不足',
      icon: 'none',
    })
    return
  }

  if (isMerging.value) {
    return
  }

  isMerging.value = true
  setTimeout(() => {
    isMerging.value = false
    uni.showToast({
      title: '合成成功',
      icon: 'success',
    })
  }, 900)
}
</script>

<style scoped lang="scss">
.asset-merge-page-content {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.asset-merge-event-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.asset-merge-card {
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  padding: 12px;
  border: 1px solid #edf0f3;
  border-radius: 24px;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: 0 12px 32px rgba(15, 23, 42, 0.06);
  overflow: hidden;
}

.asset-merge-card.is-ended {
  box-shadow: 0 10px 26px rgba(15, 23, 42, 0.04);
}

.asset-merge-card-cover {
  position: relative;
  width: 100%;
  height: 0;
  padding-top: 100%;
  border-radius: 16px;
  background: var(--aether-surface-tertiary, #f1f5f9);
  overflow: hidden;
  isolation: isolate;
}

.asset-merge-card-cover::after {
  content: '';
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(0, 0, 0, 0.18) 0%, rgba(0, 0, 0, 0) 34%),
    linear-gradient(0deg, rgba(15, 23, 42, 0.18) 0%, rgba(15, 23, 42, 0) 38%);
}

.asset-merge-card-cover-image {
  position: absolute;
  inset: 0;
  z-index: 1;
  width: 100%;
  height: 100%;
}

.asset-merge-card.is-ended .asset-merge-card-cover-image {
  opacity: 0.72;
  filter: grayscale(0.85);
}

.asset-merge-card-status {
  position: absolute;
  left: 12px;
  top: 12px;
  z-index: 4;
  display: inline-flex;
  align-items: center;
  gap: 7px;
  min-height: 28px;
  padding: 0 12px;
  box-sizing: border-box;
  border-radius: 999px;
  background: rgba(17, 17, 17, 0.78);
}

.asset-merge-card-status-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #94a3b8;
}

.asset-merge-card-status.is-live .asset-merge-card-status-dot {
  background: #22d3ee;
}

.asset-merge-card-status.is-upcoming .asset-merge-card-status-dot {
  background: #fbbf24;
}

.asset-merge-card-status-copy {
  color: #ffffff;
  font-size: 10px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.asset-merge-card-status.is-ended .asset-merge-card-status-copy {
  color: #d1d5db;
}

.asset-merge-card-body {
  display: flex;
  flex-direction: column;
  padding: 16px 2px 0;
}

.asset-merge-card-title {
  color: #111111;
  font-size: 18px;
  line-height: 24px;
  font-weight: 700;
  letter-spacing: -0.02em;
}

.asset-merge-card.is-ended .asset-merge-card-title {
  color: #64748b;
}

.asset-merge-card-time {
  display: flex;
  align-items: baseline;
  gap: 7px;
  margin-top: 8px;
}

.asset-merge-card-time-label {
  flex: 0 0 auto;
  color: #22c7dc;
  font-size: 11px;
  line-height: 16px;
  font-weight: 600;
  letter-spacing: 0.12em;
}

.asset-merge-card-time-copy {
  min-width: 0;
  color: #64748b;
  font-size: 12px;
  line-height: 18px;
  font-weight: 400;
}

.asset-merge-card.is-ended .asset-merge-card-time-label,
.asset-merge-card.is-ended .asset-merge-card-time-copy {
  color: #94a3b8;
}

.asset-merge-card-formula {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 14px;
  padding: 12px;
  border-radius: 14px;
  background: var(--aether-surface-secondary, #f6f7f9);
}

.asset-merge-card-formula-label {
  color: #94a3b8;
  font-size: 10px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.12em;
}

.asset-merge-card-formula-row {
  display: flex;
  align-items: center;
  gap: 7px;
}

.asset-merge-card-formula-copy {
  min-width: 0;
  color: #111111;
  font-size: 14px;
  line-height: 20px;
  font-weight: 600;
}

.asset-merge-card.is-ended .asset-merge-card-formula-copy {
  color: #64748b;
}

.asset-merge-card-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  margin-top: 16px;
}

.asset-merge-card-supply {
  min-width: 0;
  display: flex;
  align-items: stretch;
  gap: 10px;
}

.asset-merge-card-supply-rail {
  width: 3px;
  min-width: 3px;
  border-radius: 999px;
  background: var(--aether-surface-inverse, #111111);
}

.asset-merge-card.is-ended .asset-merge-card-supply-rail {
  background: #cbd5e1;
}

.asset-merge-card-supply-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.asset-merge-card-supply-label {
  color: #94a3b8;
  font-size: 10px;
  line-height: 14px;
  font-weight: 700;
  letter-spacing: 0.1em;
}

.asset-merge-card-supply-value {
  display: flex;
  align-items: baseline;
  gap: 4px;
}

.asset-merge-card-supply-main {
  color: #111111;
  font-size: 18px;
  line-height: 22px;
  font-weight: 700;
}

.asset-merge-card-supply-total {
  color: #94a3b8;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
}

.asset-merge-card.is-ended .asset-merge-card-supply-main {
  color: #94a3b8;
}

.asset-merge-card-action {
  flex: 0 0 auto;
  min-width: 112px;
  min-height: 44px;
}

.asset-merge-card-action-visual {
  min-width: 112px;
  min-height: 44px;
  padding: 0 16px;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  border-radius: 14px;
  background: var(--aether-surface-inverse, #111111);
  color: #ffffff;
}

.asset-merge-card-action-visual.is-disabled {
  background: var(--aether-surface-tertiary, #f1f5f9);
  color: #94a3b8;
}

.asset-merge-card-action-copy {
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  letter-spacing: 0.08em;
}

.asset-merge-empty-state {
  min-height: 220px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  color: #94a3b8;
}

.asset-merge-empty-copy {
  color: #64748b;
  font-size: 12px;
  line-height: 18px;
  font-weight: 500;
}

.asset-merge-detail-action {
  display: block;
  width: 100%;
  border-radius: 18px;
}

.asset-merge-detail-action-visual {
  min-height: 52px;
  border-radius: 18px;
  background: var(--aether-surface-inverse, #111111);
  color: #ffffff;
  box-shadow: var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.1));
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.asset-merge-detail-action.is-entry-active .asset-merge-detail-action-visual {
  transform: scale(0.985);
}

.asset-merge-detail-action-visual.is-disabled {
  background: var(--aether-surface-tertiary, #f1f5f9);
  color: #94a3b8;
  box-shadow: none;
}

.asset-merge-detail-action-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

@media screen and (width < 390px) {
  .asset-merge-card-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .asset-merge-card-action,
  .asset-merge-card-action-visual {
    width: 100%;
  }
}
</style>
