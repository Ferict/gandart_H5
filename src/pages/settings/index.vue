<!--
Responsibility: render the standalone settings page with the shared secondary-page shell,
settings scene view model, page-local action seams, and project-standard hit targets.
Out of scope: backend setting mutations, auth/session cleanup, and host bridge capabilities.
-->
<template>
  <page-meta :page-style="pageMetaStyle" />
  <SecondaryPageFrame route-source="settings-page" title="系统设置" @back="handleBack">
    <view class="settings-page">
      <view v-if="isLoading" class="settings-loading-shell" aria-hidden="true">
        <view class="settings-loading-summary" />
        <view class="settings-loading-block" />
        <view class="settings-loading-block short" />
      </view>

      <view v-else class="settings-content">
        <view v-if="loadErrorMessage" class="settings-inline-alert">
          <AetherIcon name="octagon-alert" :size="16" :stroke-width="1.9" />
          <text class="settings-inline-alert-copy">{{ loadErrorMessage }}</text>
        </view>

        <section class="settings-summary-card">
          <view class="settings-summary-glow" aria-hidden="true" />
          <view class="settings-summary-body">
            <view class="settings-summary-indicator">
              <view class="settings-summary-dot" />
              <text class="settings-summary-indicator-copy">{{
                settingsView.summary.englishTitle
              }}</text>
            </view>

            <view class="settings-summary-heading">
              <text class="settings-summary-title">{{ settingsView.summary.title }}</text>
              <text class="settings-summary-code">{{ settingsView.summary.englishTitle }}</text>
            </view>

            <text class="settings-summary-description">{{ settingsView.summary.description }}</text>

            <HomeInteractiveTarget
              class="settings-summary-action-target"
              interaction-mode="compact"
              :hit-width="148"
              :hit-height="44"
              :label="settingsView.summary.actionLabel"
              @activate="handleFeedback"
            >
              <view class="settings-summary-action-visual">
                <AetherIcon
                  :name="settingsView.summary.actionIconName"
                  :size="14"
                  :stroke-width="1.9"
                />
                <text class="settings-summary-action-copy">
                  {{ settingsView.summary.actionLabel }}
                </text>
                <text class="settings-summary-action-code">
                  {{ settingsView.summary.actionEnglishLabel }}
                </text>
              </view>
            </HomeInteractiveTarget>
          </view>
        </section>

        <view class="settings-section-stack">
          <section
            v-for="settingsSection in settingsView.sections"
            :key="settingsSection.id"
            class="settings-section"
          >
            <view class="settings-section-heading">
              <text class="settings-section-title">{{ settingsSection.title }}</text>
              <text class="settings-section-code">{{ settingsSection.englishTitle }}</text>
            </view>

            <view class="settings-section-card">
              <HomeInteractiveTarget
                v-for="(item, index) in settingsSection.items"
                :key="item.id"
                class="settings-row-target"
                interaction-mode="block"
                :label="item.title"
                @activate="handleSettingItem(item)"
              >
                <view
                  class="settings-row-visual"
                  :class="{ 'is-last': index === settingsSection.items.length - 1 }"
                >
                  <view class="settings-row-leading">
                    <view class="settings-row-icon-shell">
                      <AetherIcon :name="item.iconName" :size="18" :stroke-width="1.8" />
                    </view>
                    <text class="settings-row-title">{{ item.title }}</text>
                  </view>

                  <view class="settings-row-trailing">
                    <text v-if="item.value" class="settings-row-value">{{ item.value }}</text>
                    <AetherIcon
                      class="settings-row-chevron"
                      name="chevron-right"
                      :size="14"
                      :stroke-width="2"
                    />
                  </view>
                </view>
              </HomeInteractiveTarget>
            </view>
          </section>
        </view>

        <view class="settings-logout-stage">
          <HomeInteractiveTarget
            class="settings-logout-target"
            interaction-mode="block"
            label="退出登录"
            @activate="handleLogoutClick"
          >
            <view class="settings-logout-visual">
              <AetherIcon name="log-out" :size="16" :stroke-width="2" />
              <text class="settings-logout-copy">退出登录</text>
            </view>
          </HomeInteractiveTarget>
        </view>
      </view>
    </view>

    <view v-if="isLogoutConfirmVisible" class="settings-confirm-layer">
      <view class="settings-confirm-mask" aria-hidden="true" />
      <view class="settings-confirm-card">
        <view class="settings-confirm-icon">
          <AetherIcon name="log-out" :size="20" :stroke-width="2" />
        </view>
        <text class="settings-confirm-title">退出登录</text>
        <text class="settings-confirm-description">
          退出登录流程后续由账户服务接入，当前仅保留操作确认入口。
        </text>

        <view class="settings-confirm-actions">
          <HomeInteractiveTarget
            class="settings-confirm-action-target"
            interaction-mode="block"
            label="取消退出登录"
            @activate="handleLogoutCancel"
          >
            <view class="settings-confirm-action-visual">
              <text class="settings-confirm-action-copy">取消</text>
            </view>
          </HomeInteractiveTarget>
          <HomeInteractiveTarget
            class="settings-confirm-action-target"
            interaction-mode="block"
            label="确认退出登录"
            @activate="handleLogoutConfirm"
          >
            <view class="settings-confirm-action-visual is-danger">
              <text class="settings-confirm-action-copy">确认退出</text>
            </view>
          </HomeInteractiveTarget>
        </view>
      </view>
    </view>
  </SecondaryPageFrame>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import SecondaryPageFrame from '../../components/SecondaryPageFrame.vue'
import { useResponsiveRailLayout } from '../../composables/useResponsiveRailLayout'
import { resolveContentScene } from '../../services/content/content.service'
import {
  mapSettingsSceneToPageView,
  type SettingsPageItemViewModel,
} from './runtime/settingsPage.adapter'

defineProps<{
  source?: string
  section?: string
}>()

const { runtimeContext } = useResponsiveRailLayout()

const settingsView = ref(mapSettingsSceneToPageView(null))
const isLoading = ref(true)
const loadErrorMessage = ref('')
const isLogoutConfirmVisible = ref(false)

const pageMetaStyle = computed(() => {
  const viewportHeight = runtimeContext.value.viewportHeight
  const height = viewportHeight > 0 ? `${viewportHeight}px` : '100vh'
  return `height:${height};min-height:${height};overflow:hidden;background:var(--aether-page-background, #fafafa);`
})

const handleBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }

  uni.reLaunch({ url: '/pages/home/index?tab=profile&source=settings-back' })
}

const showReservedToast = (title = '功能接驳中') => {
  uni.showToast({
    title,
    icon: 'none',
  })
}

const handleFeedback = () => {
  // 后续接入真实问题反馈提交流程；当前设置页只负责统一入口和点击出口。
  showReservedToast('问题反馈接驳中')
}

const handleSettingItem = (item: SettingsPageItemViewModel) => {
  // 后续接入真实设置详情或宿主能力；当前设置页只负责统一入口和点击出口。
  void item
  showReservedToast()
}

const handleLogoutClick = () => {
  isLogoutConfirmVisible.value = true
}

const handleLogoutCancel = () => {
  isLogoutConfirmVisible.value = false
}

const handleLogoutConfirm = () => {
  // 后续由 auth/session service 接入真实退出登录；当前只保留确认弹层和事件出口。
  isLogoutConfirmVisible.value = false
  showReservedToast('退出登录接驳中')
}

const hydrateSettingsScene = async () => {
  isLoading.value = true
  loadErrorMessage.value = ''

  try {
    const scene = await resolveContentScene({ sceneId: 'settings' })
    settingsView.value = mapSettingsSceneToPageView(scene)
  } catch (error) {
    loadErrorMessage.value = error instanceof Error ? error.message : '设置内容加载异常'
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void hydrateSettingsScene()
})
</script>

<style scoped lang="scss">
.settings-page {
  --settings-page-background: var(--aether-page-background, #fafafa);

  width: 100%;
  display: flex;
  flex-direction: column;
}

.settings-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.settings-loading-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.settings-loading-summary,
.settings-loading-block {
  border-radius: 24px;
  background: #ffffff;
  box-shadow: var(--aether-shadow-surface-sm, 0 0 12px rgba(15, 23, 42, 0.035));
}

.settings-loading-summary {
  height: 180px;
}

.settings-loading-block {
  height: 96px;
}

.settings-loading-block.short {
  width: 72%;
}

.settings-inline-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(239, 68, 68, 0.14);
  border-radius: 16px;
  background: rgba(254, 242, 242, 0.82);
  color: #dc2626;
  padding: 14px 16px;
}

.settings-inline-alert-copy {
  font-size: 12px;
  line-height: 18px;
  font-weight: 700;
}

.settings-summary-card {
  position: relative;
  overflow: hidden;
  border-radius: 24px;
  background: #111111;
  color: #ffffff;
  box-shadow: 0 0 28px rgba(15, 23, 42, 0.08);
}

.settings-summary-glow {
  position: absolute;
  inset: -40px -80px auto auto;
  width: 180px;
  height: 180px;
  border-radius: 999px;
  background: radial-gradient(circle, rgba(34, 211, 238, 0.34), transparent 66%);
  pointer-events: none;
}

.settings-summary-body {
  position: relative;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  padding: 24px;
}

.settings-summary-indicator {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 14px;
}

.settings-summary-dot {
  width: 6px;
  height: 6px;
  border-radius: 999px;
  background: #22d3ee;
  box-shadow: 0 0 12px rgba(34, 211, 238, 0.72);
}

.settings-summary-indicator-copy,
.settings-summary-code,
.settings-summary-action-code,
.settings-section-code,
.settings-row-value {
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
  letter-spacing: 0.12em;
  text-transform: uppercase;
}

.settings-summary-indicator-copy {
  color: rgba(255, 255, 255, 0.46);
}

.settings-summary-heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
}

.settings-summary-title {
  color: #ffffff;
  font-size: 20px;
  line-height: 24px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.settings-summary-code {
  color: rgba(255, 255, 255, 0.34);
}

.settings-summary-description {
  max-width: 272px;
  margin-top: 10px;
  color: rgba(255, 255, 255, 0.7);
  font-size: 12px;
  line-height: 20px;
  font-weight: 600;
}

.settings-summary-action-visual {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  margin-top: 18px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.08);
  color: #ffffff;
  padding: 8px 14px;
  pointer-events: none;
}

.settings-summary-action-copy {
  font-size: 12px;
  line-height: 16px;
  font-weight: 800;
}

.settings-summary-action-code {
  color: rgba(255, 255, 255, 0.56);
}

.settings-section-stack {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.settings-section {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.settings-section-heading {
  display: flex;
  align-items: baseline;
  gap: 8px;
  padding: 0 4px;
}

.settings-section-title {
  color: #111111;
  font-size: 14px;
  line-height: 20px;
  font-weight: 900;
  letter-spacing: -0.02em;
}

.settings-section-code {
  color: #94a3b8;
}

.settings-section-card {
  overflow: hidden;
  border: 1px solid rgba(226, 232, 240, 0.74);
  border-radius: 24px;
  background: #ffffff;
  box-shadow: var(--aether-shadow-surface-sm, 0 0 12px rgba(15, 23, 42, 0.035));
}

.settings-row-visual {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  min-height: 64px;
  border-bottom: 1px solid rgba(241, 245, 249, 0.96);
  padding: 12px 16px;
  pointer-events: none;
}

.settings-row-visual.is-last {
  border-bottom: 0;
}

.settings-row-leading,
.settings-row-trailing {
  min-width: 0;
  display: flex;
  align-items: center;
}

.settings-row-leading {
  gap: 12px;
}

.settings-row-trailing {
  flex-shrink: 0;
  gap: 8px;
}

.settings-row-icon-shell {
  width: 40px;
  height: 40px;
  flex-shrink: 0;
  border-radius: 16px;
  background: #f4f5f7;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
}

.settings-row-title {
  min-width: 0;
  color: #111111;
  font-size: 13px;
  line-height: 20px;
  font-weight: 800;
  letter-spacing: -0.01em;
}

.settings-row-value {
  max-width: 112px;
  color: #94a3b8;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.settings-row-chevron {
  color: #cbd5e1;
}

.settings-logout-stage {
  padding-top: 12px;
}

.settings-logout-visual {
  min-height: 52px;
  border: 1px solid rgba(239, 68, 68, 0.16);
  border-radius: 20px;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  pointer-events: none;
}

.settings-logout-copy {
  font-size: 13px;
  line-height: 20px;
  font-weight: 800;
  letter-spacing: 0.08em;
}

.settings-confirm-layer {
  position: fixed;
  inset: 0;
  z-index: 80;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
}

.settings-confirm-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.38);
  backdrop-filter: blur(8px);
}

.settings-confirm-card {
  position: relative;
  z-index: 1;
  width: min(320px, 100%);
  border-radius: 28px;
  background: #ffffff;
  box-shadow: var(--aether-shadow-overlay-sheet, 0 0 28px rgba(15, 23, 42, 0.12));
  padding: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.settings-confirm-icon {
  width: 48px;
  height: 48px;
  border-radius: 999px;
  background: #fef2f2;
  color: #ef4444;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 14px;
}

.settings-confirm-title {
  color: #111111;
  font-size: 18px;
  line-height: 24px;
  font-weight: 900;
}

.settings-confirm-description {
  margin-top: 8px;
  color: #64748b;
  font-size: 12px;
  line-height: 20px;
  font-weight: 700;
}

.settings-confirm-actions {
  width: 100%;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
  margin-top: 22px;
}

.settings-confirm-action-visual {
  min-height: 44px;
  border-radius: 16px;
  background: #f8fafc;
  color: #475569;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
}

.settings-confirm-action-visual.is-danger {
  background: #fef2f2;
  color: #ef4444;
}

.settings-confirm-action-copy {
  font-size: 13px;
  line-height: 20px;
  font-weight: 800;
}

@media (hover: hover) and (pointer: fine) {
  .settings-row-target:hover .settings-row-icon-shell {
    background: #111111;
    color: #22d3ee;
  }

  .settings-logout-target:hover .settings-logout-visual {
    background: rgba(254, 242, 242, 0.82);
  }
}
</style>
