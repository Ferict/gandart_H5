<!--
Responsibility: render the activity date-filter bottom sheet template and bridge sheet-level
interactions to the dedicated runtime.
Out of scope: notice-result fetching, activity query execution, and scene-level data assembly.
-->
<template>
  <view
    class="home-activity-filter-mask"
    :class="{ 'is-open': props.open }"
    @tap="handleClose"
    @touchmove.stop.prevent
  />

  <view
    class="home-activity-filter-bottom-sheet"
    :class="{ 'is-open': props.open }"
    :style="sheetStyle"
    @tap.stop
    @touchmove.stop.prevent
  >
    <view class="home-activity-filter-panel">
      <view class="home-activity-filter-top-line" />

      <view class="home-activity-filter-month-head">
        <HomeInteractiveTarget
          class="home-activity-filter-month-nav"
          interaction-mode="compact"
          label="查看上个月"
          @activate="handlePreviousMonth"
        >
          <AetherIcon
            class="home-activity-filter-month-nav-icon is-previous"
            name="chevron-right"
            :size="18"
            :stroke-width="2"
          />
        </HomeInteractiveTarget>

        <text class="home-activity-filter-month-label">{{ monthLabel }}</text>

        <HomeInteractiveTarget
          class="home-activity-filter-month-nav"
          interaction-mode="compact"
          label="查看下个月"
          @activate="handleNextMonth"
        >
          <AetherIcon
            class="home-activity-filter-month-nav-icon"
            name="chevron-right"
            :size="18"
            :stroke-width="2"
          />
        </HomeInteractiveTarget>
      </view>

      <view class="home-activity-filter-week-row">
        <view
          v-for="weekLabel in weekLabels"
          :key="weekLabel"
          class="home-activity-filter-week-cell"
        >
          <text class="home-activity-filter-week-text">{{ weekLabel }}</text>
        </view>
      </view>

      <view class="home-activity-filter-day-grid">
        <view
          v-for="cell in calendarCells"
          :key="cell.id"
          class="home-activity-filter-day-cell"
          :class="{
            'is-placeholder': cell.isPlaceholder,
            'is-range-start': cell.isRangeStart,
            'is-range-end': cell.isRangeEnd,
            'is-in-range': cell.isInRange,
            'is-single-day': cell.isSingleDay,
          }"
        >
          <template v-if="cell.isPlaceholder">
            <view class="home-activity-filter-day-placeholder" />
          </template>

          <template v-else>
            <view class="home-activity-filter-day-range-fill" />

            <HomeInteractiveTarget
              class="home-activity-filter-day-entry"
              interaction-mode="block"
              :selected="cell.isRangeStart || cell.isRangeEnd || cell.isSingleDay || cell.isInRange"
              :label="`选择 ${cell.dateKey}`"
              @activate="handleDateSelect(cell.dateKey)"
            >
              <view
                class="home-activity-filter-day-button"
                :class="{
                  'is-selected': cell.isRangeStart || cell.isRangeEnd,
                  'is-in-range': cell.isInRange,
                  'is-single-day': cell.isSingleDay,
                  'is-today': cell.isToday,
                }"
              >
                <text class="home-activity-filter-day-text">{{ cell.dayNumber }}</text>
              </view>
            </HomeInteractiveTarget>
          </template>
        </view>
      </view>

      <view class="home-activity-filter-actions">
        <HomeInteractiveTarget
          class="home-activity-filter-action is-secondary"
          interaction-mode="block"
          label="重置公告时间筛选"
          @activate="handleReset"
        >
          <view class="home-activity-filter-action-content">
            <AetherIcon
              class="home-activity-filter-action-icon is-secondary"
              name="repeat-2"
              :size="14"
              :stroke-width="2.2"
            />
            <text class="home-activity-filter-action-text">重置</text>
          </view>
        </HomeInteractiveTarget>

        <HomeInteractiveTarget
          class="home-activity-filter-action is-primary"
          interaction-mode="block"
          label="确认日期筛选"
          @activate="handleApply"
        >
          <view class="home-activity-filter-action-shimmer" aria-hidden="true" />
          <view class="home-activity-filter-action-content is-primary">
            <AetherIcon
              class="home-activity-filter-action-icon is-primary"
              name="zap"
              :size="14"
              :stroke-width="2.2"
            />
            <text class="home-activity-filter-action-text is-light">确认筛选</text>
          </view>
        </HomeInteractiveTarget>
      </view>
    </view>
  </view>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue'
import AetherIcon from '../../../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../../../components/HomeInteractiveTarget.vue'
import type { ActivityDateFilterRange } from '../../../../models/home-rail/homeRailActivity.model'
import {
  resolveHomeShellInsets,
  type ViewportRuntimeContext,
} from '../../../../services/home-shell/homeShellLayoutMode.service'
import { useHomeActivityDateFilterSheetRuntime } from './homeActivityDateFilterSheet.runtime'

interface Props {
  open: boolean
  runtimeContext: ViewportRuntimeContext
  submittedRange: ActivityDateFilterRange
}

const props = defineProps<Props>()
const emit = defineEmits<{
  close: []
  reset: []
  apply: [range: ActivityDateFilterRange]
}>()

const sheetStyle = computed<CSSProperties>(() => {
  const insets = resolveHomeShellInsets(props.runtimeContext)
  return {
    '--home-activity-filter-safe-bottom': `${insets.bottomInset}px`,
    '--home-activity-filter-floating-offset': `calc(${insets.bottomInset}px + 32px)`,
  } as CSSProperties
})

const {
  weekLabels,
  monthLabel,
  calendarCells,
  handleClose,
  handleReset,
  handleApply,
  handlePreviousMonth,
  handleNextMonth,
  handleDateSelect,
} = useHomeActivityDateFilterSheetRuntime({
  resolveIsOpen: () => props.open,
  resolveSubmittedRange: () => props.submittedRange,
  emitClose: () => emit('close'),
  emitReset: () => emit('reset'),
  emitApply: (range) => emit('apply', range),
})
</script>

<style lang="scss" scoped>
.home-activity-filter-mask {
  position: fixed;
  inset: 0;
  z-index: 42;
  opacity: 0;
  pointer-events: none;
  background: rgba(0, 0, 0, 0);
  transition:
    opacity 220ms ease,
    background-color 220ms ease;
}

.home-activity-filter-mask.is-open {
  opacity: 1;
  pointer-events: auto;
  background: rgba(0, 0, 0, 0.08);
  -webkit-backdrop-filter: blur(2px);
  backdrop-filter: blur(2px);
}

@supports not ((backdrop-filter: blur(1px)) or (-webkit-backdrop-filter: blur(1px))) {
  .home-activity-filter-mask.is-open {
    background: rgba(0, 0, 0, 0.12);
  }
}

.home-activity-filter-bottom-sheet {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 52;
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 16px var(--home-activity-filter-floating-offset, 32px);
  box-sizing: border-box;
  pointer-events: none;
}

.home-activity-filter-bottom-sheet.is-open {
  pointer-events: auto;
}

.home-activity-filter-panel {
  --home-activity-filter-day-button-size: 32px;

  position: relative;
  width: 100%;
  max-width: 343px;
  border-radius: var(--aether-surface-radius-xl, 24px);
  border: 1px solid #f3f4f6;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-overlay-sheet, 0 0 32px rgba(15, 23, 42, 0.08));
  padding: 16px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 0;
  transform: translateY(calc(100% + var(--home-activity-filter-floating-offset, 32px)));
  transition: transform 240ms cubic-bezier(0.22, 1, 0.36, 1);
}

.home-activity-filter-bottom-sheet.is-open .home-activity-filter-panel {
  transform: translateY(0);
}

.home-activity-filter-top-line {
  position: absolute;
  top: 0;
  left: 50%;
  width: 24px;
  height: 2px;
  border-radius: 0 0 999px 999px;
  background: #22d3ee;
  transform: translateX(-50%);
}

.home-activity-filter-month-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  margin-bottom: 20px;
  padding: 0 4px;
}

.home-activity-filter-month-nav {
  width: 32px;
  height: 32px;
  color: #d1d5db;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 auto;
}

.home-activity-filter-month-label {
  font-size: 13px;
  line-height: 16px;
  font-weight: 900;
  color: #111111;
  letter-spacing: 0.08em;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-activity-filter-month-nav-icon {
  --home-activity-filter-month-nav-rotation: 0deg;

  transform: rotate(var(--home-activity-filter-month-nav-rotation));
  transition:
    color 180ms ease,
    transform 180ms ease;
}

.home-activity-filter-month-nav-icon.is-previous {
  --home-activity-filter-month-nav-rotation: 180deg;
}

.home-activity-filter-week-row {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  gap: 4px;
  margin-bottom: 8px;
}

.home-activity-filter-week-cell {
  min-height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-activity-filter-week-text {
  display: inline-block;
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
  color: #d1d5db;
  letter-spacing: 0.12em;
  transform: scale(0.75);
  transform-origin: center;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-activity-filter-day-grid {
  display: grid;
  grid-template-columns: repeat(7, minmax(0, 1fr));
  row-gap: 4px;
}

.home-activity-filter-day-cell {
  position: relative;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-activity-filter-day-placeholder {
  width: 100%;
  min-height: 44px;
}

.home-activity-filter-day-range-fill {
  position: absolute;
  inset: 4px 0;
  background: rgba(236, 254, 255, 0.86);
  opacity: 0;
  transition: opacity 180ms ease;
}

.home-activity-filter-day-cell.is-in-range .home-activity-filter-day-range-fill,
.home-activity-filter-day-cell.is-range-start .home-activity-filter-day-range-fill,
.home-activity-filter-day-cell.is-range-end .home-activity-filter-day-range-fill {
  opacity: 1;
}

.home-activity-filter-day-cell.is-range-start:not(.is-single-day)
  .home-activity-filter-day-range-fill {
  left: 50%;
  border-radius: 0 12px 12px 0;
}

.home-activity-filter-day-cell.is-range-end:not(.is-single-day)
  .home-activity-filter-day-range-fill {
  right: 50%;
  border-radius: 12px 0 0 12px;
}

.home-activity-filter-day-cell.is-single-day .home-activity-filter-day-range-fill {
  opacity: 0;
}

.home-activity-filter-day-entry {
  position: relative;
  z-index: 1;
  width: 100%;
  min-height: 44px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.home-activity-filter-day-button {
  width: var(--home-activity-filter-day-button-size);
  height: var(--home-activity-filter-day-button-size);
  border-radius: var(--aether-surface-radius-xs, 8px);
  border: 1px solid transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #9ca3af;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease,
    border-color 180ms ease;
}

.home-activity-filter-day-button.is-selected,
.home-activity-filter-day-button.is-single-day {
  background: var(--aether-surface-inverse, #111111);
  color: #ffffff;
  box-shadow: var(--aether-shadow-soft-xs, 0 0 16px rgba(15, 23, 42, 0.04));
}

.home-activity-filter-day-button.is-in-range {
  color: #06b6d4;
}

.home-activity-filter-day-button.is-today:not(.is-selected):not(.is-single-day) {
  border-color: rgba(6, 182, 212, 0.18);
}

.home-activity-filter-day-text {
  display: inline-block;
  font-size: 13px;
  line-height: 13px;
  font-weight: 800;
  font-family: var(--aether-font-system, system-ui, sans-serif);
  transition:
    transform 180ms ease,
    color 180ms ease;
}

.home-activity-filter-month-nav.is-pressed .home-activity-filter-month-nav-icon {
  color: #111111;
  transform: translateY(-1px) rotate(var(--home-activity-filter-month-nav-rotation));
}

.home-activity-filter-day-entry.is-pressed
  .home-activity-filter-day-button:not(.is-selected):not(.is-single-day) {
  color: #111111;
}

.home-activity-filter-day-entry.is-pressed
  .home-activity-filter-day-button:not(.is-selected):not(.is-single-day)
  .home-activity-filter-day-text {
  transform: translateY(-4px);
}

.home-activity-filter-actions {
  display: flex;
  gap: 8px;
  margin-top: 24px;
}

.home-activity-filter-action {
  position: relative;
  overflow: hidden;
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.home-activity-filter-action.is-secondary {
  flex: 1 1 0;
  background: var(--aether-surface-primary, #ffffff);
  box-shadow: var(--aether-shadow-soft-xs, 0 0 16px rgba(15, 23, 42, 0.04));
}

.home-activity-filter-action.is-primary {
  flex: 1.8 1 0;
  border-color: transparent;
  background: var(--aether-surface-inverse, #111111);
  box-shadow: var(--aether-shadow-overlay-float, 0 0 24px rgba(15, 23, 42, 0.08));
}

.home-activity-filter-action-content {
  position: relative;
  z-index: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: transform 180ms ease;
}

.home-activity-filter-action-content.is-primary {
  gap: 8px;
}

.home-activity-filter-action-icon.is-secondary {
  color: #9ca3af;
}

.home-activity-filter-action-icon.is-primary {
  color: #22d3ee;
}

.home-activity-filter-action-text {
  display: inline-block;
  font-size: 14px;
  line-height: 14px;
  font-weight: 800;
  color: #6b7280;
  letter-spacing: 0.04em;
  font-family: var(--aether-font-system, system-ui, sans-serif);
}

.home-activity-filter-action-text.is-light {
  color: #ffffff;
}

.home-activity-filter-action-shimmer {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    90deg,
    transparent 0%,
    rgba(255, 255, 255, 0.08) 50%,
    transparent 100%
  );
  transform: translateX(-120%);
  pointer-events: none;
}

@keyframes home-activity-filter-shimmer {
  100% {
    transform: translateX(120%);
  }
}

@media (hover: hover) and (pointer: fine) {
  .home-activity-filter-month-nav:hover .home-activity-filter-month-nav-icon {
    color: #111111;
    transform: translateY(-1px) rotate(var(--home-activity-filter-month-nav-rotation));
  }

  .home-activity-filter-day-entry:hover
    .home-activity-filter-day-button:not(.is-selected):not(.is-single-day) {
    color: #111111;
  }

  .home-activity-filter-day-entry:hover
    .home-activity-filter-day-button:not(.is-selected):not(.is-single-day)
    .home-activity-filter-day-text {
    transform: translateY(-4px);
  }

  .home-activity-filter-action:hover {
    transform: translateY(-1px);
  }

  .home-activity-filter-action:hover .home-activity-filter-action-content {
    transform: translateY(-1px);
  }

  .home-activity-filter-action.is-primary:hover .home-activity-filter-action-shimmer {
    animation: home-activity-filter-shimmer 1.8s linear infinite;
  }
}
</style>
