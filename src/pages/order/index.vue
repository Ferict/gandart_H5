<!--
Responsibility: assemble the personal-center order archive page with page-local filtering,
native interaction targets, and reference-design visual effects.
Out of scope: backend order fetching, payment execution, receipt fetching, and formal
contract wiring.
-->
<template>
  <page-meta :page-style="pageMetaStyle" />
  <SecondaryPageFrame route-source="order-center" title="我的订单" @back="handleBack">
    <template #topbar-right>
      <HomeInteractiveTarget
        class="order-topbar-search-action"
        interaction-mode="compact"
        :selected="isSearchVisible"
        :hit-width="44"
        :hit-height="44"
        label="搜索订单"
        @activate="handleSearchToggle"
      >
        <view class="order-topbar-search-visual">
          <AetherIcon name="search" :size="18" :stroke-width="1.5" />
        </view>
      </HomeInteractiveTarget>
    </template>

    <view class="order-archive-page">
      <transition name="order-search-reveal">
        <view v-if="isSearchVisible || keyword" class="order-search-stage">
          <view class="order-search-shell">
            <AetherIcon name="search" :size="16" :stroke-width="1.7" />
            <input
              v-model="keyword"
              class="order-search-input"
              type="text"
              confirm-type="search"
              placeholder="搜索订单号或资产名称"
              placeholder-class="order-search-placeholder"
            />
          </view>
        </view>
      </transition>

      <view class="order-primary-category-wrap">
        <view class="order-primary-category-fade-left" aria-hidden="true" />
        <scroll-view class="order-primary-category-scroll" scroll-x :show-scrollbar="false">
          <view class="order-primary-category-track" role="group" aria-label="订单一级分类">
            <HomeInteractiveTarget
              v-for="category in ORDER_CATEGORY_OPTIONS"
              :key="category.id"
              class="order-primary-category-entry"
              :class="{ 'is-active': activeCategory === category.id }"
              interaction-mode="compact"
              :selected="activeCategory === category.id"
              :hit-width="48"
              :hit-height="44"
              :label="`筛选${category.label}订单`"
              @activate="handleCategorySelect(category.id)"
            >
              <view class="order-primary-category-pill">
                <text class="order-primary-category-text">{{ category.label }}</text>
              </view>
            </HomeInteractiveTarget>
          </view>
        </scroll-view>
        <view class="order-primary-category-fade-right" aria-hidden="true" />
      </view>

      <view class="order-archive-tabs">
        <scroll-view class="order-archive-tabs-scroll" scroll-x :show-scrollbar="false">
          <view class="order-archive-tabs-track" role="group" aria-label="订单状态筛选">
            <HomeInteractiveTarget
              v-for="status in ORDER_STATUS_OPTIONS"
              :key="status.id"
              class="order-archive-tab-target"
              :class="{ 'is-active': activeStatus === status.id }"
              interaction-mode="compact"
              :selected="activeStatus === status.id"
              :hit-width="48"
              :hit-height="44"
              :label="`筛选${status.label}订单`"
              @activate="handleStatusSelect(status.id)"
            >
              <view class="order-archive-tab-visual">
                <text class="order-archive-tab-copy">{{ status.label }}</text>
              </view>
            </HomeInteractiveTarget>
          </view>
        </scroll-view>
        <view class="order-archive-tabs-fade" aria-hidden="true" />
      </view>

      <view v-if="filteredOrders.length" class="order-archive-list">
        <view
          v-for="(order, index) in filteredOrders"
          :key="order.id"
          class="order-archive-card order-card-enter"
          :class="[
            `tone-${order.statusTone}`,
            {
              'is-expired': order.status === 'expired',
              'is-pointer-hovered': hoveredOrderId === order.id,
            },
          ]"
          :style="resolveOrderCardStyle(index)"
          @mouseenter="handleOrderCardPointerEnter(order)"
          @mouseleave="handleOrderCardPointerLeave(order)"
          @touchstart="handleOrderCardTouch"
          @touchend="handleOrderCardTouch"
          @touchcancel="handleOrderCardTouch"
        >
          <view class="order-card-head">
            <view class="order-card-head-main">
              <HomeInteractiveTarget
                class="order-archive-card-target"
                interaction-mode="compact"
                :hit-width="168"
                :hit-height="44"
                :label="`查看订单号 ${order.orderNo}`"
                @activate="handleOrderCodeActivate(order)"
                @mouseenter="handleOrderCodeActivate(order)"
                @mouseleave="handleOrderCodeRest(order)"
              >
                <view class="order-code-visual">
                  <AetherIcon name="receipt" :size="12" :stroke-width="1.7" />
                  <text class="order-code-display">{{ resolveOrderCodeDisplay(order) }}</text>
                </view>
              </HomeInteractiveTarget>

              <view class="order-card-timestamp" aria-hidden="true">
                <text class="order-card-timestamp-copy">{{ order.timestamp }}</text>
              </view>
            </view>

            <view class="order-archive-status" :class="`tone-${order.statusTone}`">
              <AetherIcon :name="order.statusIconName" :size="10" :stroke-width="2" />
              <text class="order-status-copy">{{ order.statusLabel }}</text>
            </view>
          </view>

          <view class="order-card-body">
            <view class="order-card-cover">
              <image
                class="order-card-cover-image"
                :class="{ 'is-muted': order.status === 'expired' }"
                :src="order.coverImageUrl"
                :alt="order.assetName"
                mode="aspectFill"
              />
            </view>
            <view class="order-card-info">
              <text class="order-asset-collection">{{ order.collectionLabel }}</text>
              <text class="order-asset-title">{{ order.assetName }}</text>
            </view>
          </view>

          <view class="order-card-footer">
            <view class="order-card-amount">
              <view class="order-amount-mark" aria-hidden="true" />
              <view class="order-amount-value">
                <text class="order-amount-main">{{ order.price }}</text>
                <text class="order-amount-unit">{{ order.currency }}</text>
              </view>
            </view>

            <HomeInteractiveTarget
              class="order-card-action"
              :class="{ 'is-primary': order.status === 'pendingPayment' }"
              interaction-mode="compact"
              :hit-width="112"
              :hit-height="44"
              :label="order.actionLabel"
              @activate="handleOrderAction(order)"
            >
              <view class="order-action-visual">
                <text class="order-action-copy">{{ order.actionLabel }}</text>
                <AetherIcon name="arrow-right" :size="12" :stroke-width="1.8" />
              </view>
            </HomeInteractiveTarget>
          </view>
        </view>
      </view>

      <view v-else class="order-empty-state">
        <AetherIcon name="box" :size="36" :stroke-width="1" />
        <text class="order-empty-code">NO RECORDS FOUND</text>
        <text class="order-empty-copy">暂无该状态下的流水记录</text>
      </view>

      <view v-if="filteredOrders.length" class="order-archive-ending" aria-hidden="true">
        <view class="order-ending-line" />
        <text class="order-ending-copy">END OF ARCHIVE</text>
        <view class="order-ending-line" />
      </view>
    </view>
  </SecondaryPageFrame>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, type CSSProperties } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import SecondaryPageFrame from '../../components/SecondaryPageFrame.vue'
import { useResponsiveRailLayout } from '../../composables/useResponsiveRailLayout'
import {
  ORDER_CATEGORY_OPTIONS,
  ORDER_STATUS_OPTIONS,
  filterOrderRecords,
  orderRecordSeeds,
  type OrderCategoryId,
  type OrderRecord,
  type OrderStatusFilterId,
} from './runtime/orderPage.runtime'

const ORDER_CODE_REVEAL_CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!@#$%^&*'
const TOUCH_HOVER_SUPPRESSION_MS = 900

const { runtimeContext } = useResponsiveRailLayout()

defineProps<{
  source?: string
}>()

const activeCategory = ref<OrderCategoryId>('collections')
const activeStatus = ref<OrderStatusFilterId>('all')
const keyword = ref('')
const isSearchVisible = ref(false)
const hoveredOrderId = ref<string | null>(null)
const lastTouchInteractionAt = ref(0)
const orderCodeDisplayMap = ref<Record<string, string>>({})
const revealTimers = new Map<string, ReturnType<typeof setInterval>>()

const filteredOrders = computed(() =>
  filterOrderRecords(orderRecordSeeds, {
    category: activeCategory.value,
    status: activeStatus.value,
    keyword: keyword.value,
  })
)

const pageMetaStyle = computed(() => {
  const viewportHeight = runtimeContext.value.viewportHeight
  const height = viewportHeight > 0 ? `${viewportHeight}px` : '100vh'
  return `height:${height};min-height:${height};overflow:hidden;background:var(--aether-page-background, #fafafa);`
})

const resolveOrderCardStyle = (index: number): CSSProperties => {
  return {
    animationDelay: `${index * 50}ms`,
  }
}

const stopOrderCodeReveal = (orderId: string) => {
  const timer = revealTimers.get(orderId)

  if (!timer) {
    return
  }

  clearInterval(timer)
  revealTimers.delete(orderId)
}

const resolveScrambledOrderCode = (text: string, iteration: number) => {
  return text
    .split('')
    .map((character, index) => {
      if (index < iteration || character === '-') {
        return character
      }

      const randomIndex = Math.floor(Math.random() * ORDER_CODE_REVEAL_CHARS.length)
      return ORDER_CODE_REVEAL_CHARS[randomIndex]
    })
    .join('')
}

const setOrderCodeDisplay = (orderId: string, value: string) => {
  orderCodeDisplayMap.value = {
    ...orderCodeDisplayMap.value,
    [orderId]: value,
  }
}

const runOrderCodeReveal = (order: OrderRecord) => {
  stopOrderCodeReveal(order.id)

  let iteration = 0
  setOrderCodeDisplay(order.id, resolveScrambledOrderCode(order.orderNo, iteration))

  const timer = setInterval(() => {
    const nextDisplay = resolveScrambledOrderCode(order.orderNo, iteration)
    setOrderCodeDisplay(order.id, nextDisplay)

    if (iteration >= order.orderNo.length) {
      stopOrderCodeReveal(order.id)
      setOrderCodeDisplay(order.id, order.orderNo)
      return
    }

    iteration += 1 / 3
  }, 30)

  revealTimers.set(order.id, timer)
}

const resolveOrderCodeDisplay = (order: OrderRecord) => {
  return orderCodeDisplayMap.value[order.id] ?? order.orderNo
}

const hasRecentTouchInteraction = () => {
  return Date.now() - lastTouchInteractionAt.value < TOUCH_HOVER_SUPPRESSION_MS
}

const clearOrderCardPointerHover = () => {
  hoveredOrderId.value = null
}

const markOrderCardTouchInteraction = () => {
  lastTouchInteractionAt.value = Date.now()
  clearOrderCardPointerHover()
}

const handleOrderCardPointerEnter = (order: OrderRecord) => {
  if (hasRecentTouchInteraction()) {
    clearOrderCardPointerHover()
    return
  }

  hoveredOrderId.value = order.id
}

const handleOrderCardPointerLeave = (order: OrderRecord) => {
  if (hoveredOrderId.value !== order.id) {
    return
  }

  clearOrderCardPointerHover()
}

const handleOrderCardTouch = () => {
  markOrderCardTouchInteraction()
}

const handleBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }

  uni.reLaunch({ url: '/pages/home/index' })
}

const handleSearchToggle = () => {
  isSearchVisible.value = !isSearchVisible.value

  if (!isSearchVisible.value) {
    keyword.value = ''
  }
}

const handleCategorySelect = (category: OrderCategoryId) => {
  activeCategory.value = category
  activeStatus.value = 'all'
}

const handleStatusSelect = (status: OrderStatusFilterId) => {
  activeStatus.value = status
}

const handleOrderCodeActivate = (order: OrderRecord) => {
  runOrderCodeReveal(order)
}

const handleOrderCodeRest = (order: OrderRecord) => {
  stopOrderCodeReveal(order.id)
  setOrderCodeDisplay(order.id, order.orderNo)
}

const handleOrderAction = (order: OrderRecord) => {
  void order

  uni.showToast({
    title: '功能接驳中',
    icon: 'none',
  })
}

onBeforeUnmount(() => {
  revealTimers.forEach((timer) => clearInterval(timer))
  revealTimers.clear()
})
</script>

<style lang="scss" scoped>
.order-archive-page {
  --order-page-background: var(--aether-page-background, #fafafa);

  width: 100%;
  display: flex;
  flex-direction: column;
  color: #111111;
}

.order-topbar-search-action {
  color: #9ca3af;
}

.order-topbar-search-action.is-selected,
.order-topbar-search-action.is-entry-active {
  color: #111111;
}

.order-topbar-search-visual {
  width: 24px;
  height: 24px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  transition:
    color 180ms ease,
    transform 180ms ease;
}

.order-topbar-search-action.is-entry-active .order-topbar-search-visual {
  transform: scale(0.96);
}

.order-search-stage {
  margin-bottom: 12px;
}

.order-search-shell {
  min-height: 40px;
  padding: 0 12px;
  border-radius: 16px;
  background: #ffffff;
  color: #6b7280;
  border: 1px solid #f3f4f6;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.02);
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
}

.order-search-input {
  flex: 1 1 auto;
  min-width: 0;
  height: 40px;
  color: #111111;
  font-size: 13px;
  line-height: 20px;
  font-weight: 600;
}

.order-search-placeholder {
  color: #9ca3af;
  font-size: 13px;
  font-weight: 500;
}

.order-search-reveal-enter-active,
.order-search-reveal-leave-active {
  transition:
    opacity 180ms ease,
    transform 180ms ease;
}

.order-search-reveal-enter-from,
.order-search-reveal-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}

.order-primary-category-wrap {
  position: relative;
  width: 100%;
  overflow: hidden;
  padding: 8px 4px;
  margin: -8px -4px 8px;
  box-sizing: border-box;
}

.order-primary-category-scroll {
  position: relative;
  z-index: 1;
  width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.order-primary-category-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.order-primary-category-track {
  position: relative;
  width: max-content;
  display: flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
}

.order-primary-category-entry {
  position: relative;
  z-index: 1;
  background: transparent;
  color: #9ca3af;
  overflow: visible;
  transition: transform 180ms ease;
}

.order-primary-category-entry.is-entry-active {
  transform: scale(0.97);
}

.order-primary-category-entry.is-active {
  color: #111111;
}

.order-primary-category-pill {
  position: relative;
  min-height: 32px;
  padding: 0 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
}

.order-primary-category-pill::after {
  content: '';
  position: absolute;
  left: 50%;
  bottom: 0;
  width: 16px;
  height: 2px;
  border-radius: 999px;
  background: #22d3ee;
  opacity: 0;
  transform: translateX(-50%) scaleX(0.5);
  transition:
    transform 180ms ease,
    opacity 180ms ease;
}

.order-primary-category-entry.is-active .order-primary-category-pill::after {
  opacity: 1;
  transform: translateX(-50%) scaleX(1);
}

.order-primary-category-text {
  display: inline-block;
  max-width: 100%;
  color: currentColor;
  font-size: 14px;
  line-height: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: color 160ms ease;
}

.order-primary-category-entry.is-entry-active .order-primary-category-text {
  color: #64748b;
}

.order-primary-category-entry.is-entry-active.is-active .order-primary-category-text {
  color: #111111;
  opacity: 0.78;
}

.order-primary-category-fade-left,
.order-primary-category-fade-right {
  position: absolute;
  top: 0;
  bottom: 0;
  width: 28px;
  z-index: 2;
  pointer-events: none;
}

.order-primary-category-fade-left {
  left: 0;
  opacity: 0;
  background: linear-gradient(90deg, var(--order-page-background) 0%, transparent 100%);
}

.order-primary-category-fade-right {
  right: 0;
  background: linear-gradient(270deg, var(--order-page-background) 0%, transparent 100%);
}

.order-archive-tabs {
  position: relative;
  z-index: 10;
  width: 100%;
  margin-bottom: 4px;
}

.order-archive-tabs-scroll {
  width: 100%;
  -ms-overflow-style: none;
  scrollbar-width: none;
}

.order-archive-tabs-scroll::-webkit-scrollbar {
  width: 0;
  height: 0;
  display: none;
}

.order-archive-tabs-track {
  width: max-content;
  min-width: 100%;
  padding-bottom: 8px;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  box-sizing: border-box;
}

.order-archive-tab-target {
  color: #6b7280;
}

.order-archive-tab-target.is-active {
  color: #ffffff;
}

.order-archive-tab-visual {
  min-height: 32px;
  padding: 0 16px;
  border-radius: 999px;
  border: 1px solid #e5e7eb;
  background: #ffffff;
  color: currentColor;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition:
    border-color 180ms ease,
    background-color 180ms ease,
    box-shadow 180ms ease,
    color 180ms ease,
    transform 180ms ease;
}

.order-archive-tab-copy {
  display: block;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  white-space: nowrap;
  transform: scale(0.9167);
  transform-origin: center;
}

.order-archive-tab-target.is-active .order-archive-tab-visual {
  border-color: #111111;
  background: #111111;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.order-archive-tab-target.is-entry-active .order-archive-tab-visual {
  transform: scale(0.97);
}

.order-archive-tabs-fade {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 8px;
  width: 32px;
  pointer-events: none;
  background: linear-gradient(270deg, var(--order-page-background) 0%, transparent 100%);
}

.order-archive-list {
  padding-top: 8px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.order-archive-card {
  position: relative;
  padding: 24px;
  border-radius: 24px;
  border: 1px solid #f3f4f6;
  background: #ffffff;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.02);
  box-sizing: border-box;
  overflow: hidden;
  transition:
    border-color 220ms ease,
    box-shadow 220ms ease,
    transform 220ms ease;
}

.order-card-enter {
  opacity: 0;
  animation: order-card-fade-in-up 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
}

.order-card-head,
.order-code-visual,
.order-archive-status,
.order-card-body,
.order-card-footer,
.order-amount-value,
.order-action-visual {
  display: flex;
  align-items: center;
}

.order-card-head {
  justify-content: space-between;
  align-items: flex-start;
  gap: 12px;
  padding-bottom: 12px;
  margin-bottom: 16px;
  border-bottom: 1px solid #f9fafb;
}

.order-card-head-main {
  min-width: 0;
  display: flex;
  flex: 1 1 auto;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
}

.order-archive-card-target {
  color: #d1d5db;
}

.order-code-visual {
  min-width: 0;
  gap: 8px;
}

.order-code-display {
  max-width: 132px;
  color: #9ca3af;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transform: scale(0.8333);
  transform-origin: left center;
  transition: color 180ms ease;
}

.order-archive-status {
  flex: 0 0 auto;
  min-height: 20px;
  padding: 0 8px;
  border-radius: 4px;
  border: 1px solid #e5e7eb;
  box-sizing: border-box;
  gap: 4px;
}

.order-archive-status.tone-cyan {
  border-color: #cffafe;
  background: #ecfeff;
  color: #0891b2;
}

.order-archive-status.tone-amber {
  border-color: #fde68a;
  background: #fffbeb;
  color: #d97706;
}

.order-archive-status.tone-muted {
  border-color: #e5e7eb;
  background: #f9fafb;
  color: #6b7280;
}

.order-status-copy {
  font-size: 12px;
  line-height: 12px;
  font-weight: 700;
  white-space: nowrap;
  transform: scale(0.75);
  transform-origin: left center;
}

.order-card-body {
  gap: 16px;
  margin-bottom: 16px;
}

.order-card-cover {
  position: relative;
  width: 64px;
  height: 64px;
  flex: 0 0 auto;
  border-radius: 12px;
  overflow: hidden;
  background: #f9fafb;
  border: 1px solid rgba(243, 244, 246, 0.5);
  box-sizing: border-box;
}

.order-card-cover-image {
  width: 100%;
  height: 100%;
  transition: transform 700ms ease;
}

.order-card-cover-image.is-muted {
  filter: grayscale(1);
  opacity: 0.6;
}

.order-card-info {
  min-width: 0;
  flex: 1 1 auto;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 4px;
}

.order-asset-collection,
.order-empty-code,
.order-ending-copy {
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0;
  white-space: nowrap;
}

.order-asset-collection {
  width: max-content;
  color: #9ca3af;
  line-height: 12px;
  text-transform: uppercase;
  transform: scale(0.75);
  transform-origin: left center;
}

.order-asset-title {
  color: #111111;
  font-size: 13px;
  line-height: 16px;
  font-weight: 800;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.order-card-footer {
  justify-content: space-between;
  align-items: flex-end;
  gap: 12px;
  padding-top: 16px;
  border-top: 1px dashed #f3f4f6;
}

.order-card-amount {
  min-width: 0;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 8px;
}

.order-amount-mark {
  width: 28px;
  height: 1px;
  border-radius: 999px;
  background: #d1d5db;
  opacity: 0.8;
}

.order-amount-value {
  align-items: baseline;
  gap: 4px;
}

.order-amount-main {
  color: #111111;
  font-size: 16px;
  line-height: 16px;
  font-weight: 800;
}

.order-archive-card.is-expired .order-amount-main {
  color: #9ca3af;
  text-decoration: line-through;
}

.order-amount-unit {
  display: inline-block;
  color: #9ca3af;
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  transform: scale(0.9167);
  transform-origin: left center;
}

.order-card-action {
  color: #6b7280;
}

.order-card-action.is-primary {
  color: #ffffff;
}

.order-action-visual {
  min-width: 88px;
  height: 32px;
  padding: 0 12px;
  border-radius: 8px;
  background: #f9fafb;
  color: currentColor;
  justify-content: center;
  gap: 4px;
  box-sizing: border-box;
  transition:
    background-color 180ms ease,
    color 180ms ease,
    box-shadow 180ms ease,
    transform 180ms ease;
}

.order-card-action.is-primary .order-action-visual {
  background: #111111;
  color: #ffffff;
  box-shadow: 0 8px 16px rgba(17, 17, 17, 0.14);
}

.order-card-action.is-primary .order-action-visual :deep(.aether-icon) {
  color: #22d3ee;
}

.order-card-action.is-entry-active .order-action-visual {
  transform: scale(0.97);
}

@media (hover: hover) and (pointer: fine) {
  .order-archive-card.is-pointer-hovered {
    border-color: #a5f3fc;
    box-shadow: 0 12px 40px rgba(34, 211, 238, 0.06);
  }

  .order-archive-card.is-pointer-hovered .order-archive-card-target {
    color: #22d3ee;
  }

  .order-archive-card.is-pointer-hovered .order-code-display {
    color: #111111;
  }

  .order-archive-card.is-pointer-hovered .order-card-cover-image {
    transform: scale(1.05);
  }

  .order-archive-card.is-pointer-hovered .order-card-action:not(.is-primary) .order-action-visual {
    background: #111111;
    color: #ffffff;
  }

  .order-archive-card.is-pointer-hovered
    .order-card-action:not(.is-primary)
    .order-action-visual
    :deep(.aether-icon) {
    color: #22d3ee;
  }
}

.order-action-copy {
  font-size: 12px;
  line-height: 16px;
  font-weight: 700;
  white-space: nowrap;
  transform: scale(0.8333);
  transform-origin: center;
}

.order-card-timestamp {
  margin-left: 16px;
  pointer-events: none;
}

.order-card-timestamp-copy {
  color: #d1d5db;
  display: block;
  width: max-content;
  font-size: 12px;
  line-height: 12px;
  font-weight: 600;
  transform: scale(0.6667);
  transform-origin: left top;
}

.order-empty-state {
  min-height: 240px;
  padding: 64px 16px 48px;
  color: #9ca3af;
  opacity: 0.4;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  box-sizing: border-box;
}

.order-empty-code {
  margin-top: 4px;
  color: #6b7280;
  line-height: 12px;
  text-transform: uppercase;
  transform: scale(0.9167);
  transform-origin: center;
}

.order-empty-copy {
  color: #9ca3af;
  font-size: 12px;
  line-height: 16px;
  font-weight: 500;
  transform: scale(0.8333);
  transform-origin: center;
}

.order-archive-ending {
  margin-top: 32px;
  padding-bottom: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  opacity: 0.3;
}

.order-ending-line {
  width: 32px;
  height: 1px;
  background: #9ca3af;
}

.order-ending-copy {
  color: #6b7280;
  line-height: 12px;
  text-transform: uppercase;
  transform: scale(0.75);
  transform-origin: center;
}

@media screen and (width < 388px) {
  .order-card-footer {
    gap: 8px;
  }

  .order-action-visual {
    min-width: 80px;
    padding: 0 8px;
  }
}

@keyframes order-card-fade-in-up {
  from {
    opacity: 0;
    transform: translateY(20px);
  }

  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
