<!--
Responsibility: render the standalone invite page with the shared secondary-page shell
and the current content-resource structure.
Out of scope: real invite sharing, reward settlement, poster generation, and backend mutations.
-->
<template>
  <page-meta :page-style="pageMetaStyle" />
  <SecondaryPageFrame route-source="invite-page" title="邀请好友" @back="handleBack">
    <view class="invite-page">
      <view v-if="isLoading" class="invite-loading-shell" aria-hidden="true">
        <view class="invite-loading-block" />
        <view class="invite-loading-block" />
      </view>

      <view v-else class="invite-content">
        <view v-if="loadErrorMessage" class="invite-inline-alert">
          <AetherIcon name="octagon-alert" :size="16" :stroke-width="1.9" />
          <text class="invite-inline-alert-copy">{{ loadErrorMessage }}</text>
        </view>

        <SecondaryPageCard class="invite-summary-card" padding="default">
          <text class="invite-summary-copy">{{ inviteView.summary }}</text>
        </SecondaryPageCard>

        <view class="invite-section-stack">
          <section
            v-for="inviteSection in inviteView.sections"
            :key="inviteSection.id"
            class="invite-section"
          >
            <view class="invite-section-heading">
              <text class="invite-section-title">{{ inviteSection.title }}</text>
            </view>

            <SecondaryPageCard class="invite-section-card" padding="dense">
              <HomeInteractiveTarget
                v-for="(item, index) in inviteSection.items"
                :key="item.id"
                class="invite-row-target"
                interaction-mode="block"
                :label="item.title"
                @activate="handleInviteItem(item.title)"
              >
                <view
                  class="invite-row-visual"
                  :class="{ 'is-last': index === inviteSection.items.length - 1 }"
                >
                  <view class="invite-row-leading">
                    <view class="invite-row-icon-shell">
                      <AetherIcon :name="item.iconName" :size="18" :stroke-width="1.8" />
                    </view>
                    <view class="invite-row-copy">
                      <text class="invite-row-title">{{ item.title }}</text>
                      <text class="invite-row-description">{{ item.description }}</text>
                    </view>
                  </view>

                  <view class="invite-row-trailing">
                    <text v-if="item.value" class="invite-row-value">{{ item.value }}</text>
                    <AetherIcon name="chevron-right" :size="14" :stroke-width="2" />
                  </view>
                </view>
              </HomeInteractiveTarget>
            </SecondaryPageCard>
          </section>
        </view>
      </view>
    </view>
  </SecondaryPageFrame>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import AetherIcon from '../../components/AetherIcon.vue'
import HomeInteractiveTarget from '../../components/HomeInteractiveTarget.vue'
import SecondaryPageCard from '../../components/SecondaryPageCard.vue'
import SecondaryPageFrame from '../../components/SecondaryPageFrame.vue'
import { useResponsiveRailLayout } from '../../composables/useResponsiveRailLayout'
import { createInvitePageFallbackView, resolveInvitePageView } from './runtime/invitePage.service'

const { runtimeContext } = useResponsiveRailLayout()

const inviteView = ref(createInvitePageFallbackView())
const isLoading = ref(true)
const loadErrorMessage = ref('')

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

  uni.reLaunch({ url: '/pages/home/index?tab=profile&source=invite-back' })
}

const showReservedToast = (title = '邀请链路接驳中') => {
  uni.showToast({
    title,
    icon: 'none',
  })
}

const handleInviteItem = (title: string) => {
  // 后续按项目包接入邀请记录、奖励明细、海报和规则说明的真实承接能力。
  showReservedToast(`${title}接驳中`)
}

const hydrateInvitePage = async () => {
  isLoading.value = true
  loadErrorMessage.value = ''

  try {
    inviteView.value = await resolveInvitePageView()
  } catch (error) {
    loadErrorMessage.value = error instanceof Error ? error.message : '邀请好友内容加载异常'
    inviteView.value = createInvitePageFallbackView()
  } finally {
    isLoading.value = false
  }
}

onMounted(() => {
  void hydrateInvitePage()
})
</script>

<style scoped lang="scss">
.invite-page {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.invite-content {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.invite-loading-shell {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.invite-loading-block {
  height: 96px;
  border-radius: 24px;
  background: #ffffff;
  box-shadow: var(--aether-shadow-surface-sm, 0 0 12px rgba(15, 23, 42, 0.035));
}

.invite-inline-alert {
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid rgba(239, 68, 68, 0.14);
  border-radius: 16px;
  background: rgba(254, 242, 242, 0.82);
  color: #dc2626;
  padding: 14px 16px;
}

.invite-inline-alert-copy {
  font-size: 12px;
  line-height: 18px;
  font-weight: 700;
}

.invite-summary-copy {
  color: #475569;
  font-size: 14px;
  line-height: 22px;
  font-weight: 600;
}

.invite-section-stack {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.invite-section {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.invite-section-heading {
  display: flex;
  align-items: flex-start;
  padding: 0 2px 2px;
}

.invite-section-title {
  color: #111111;
  font-size: 15px;
  line-height: 20px;
  font-weight: 800;
  letter-spacing: -0.02em;
}

.invite-row-target {
  display: block;
}

.invite-row-visual {
  min-height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 2px;
  border-bottom: 1px solid rgba(148, 163, 184, 0.14);
}

.invite-row-visual.is-last {
  border-bottom: 0;
}

.invite-row-leading,
.invite-row-trailing {
  min-width: 0;
  display: flex;
  align-items: center;
}

.invite-row-leading {
  flex: 1;
  gap: 12px;
}

.invite-row-trailing {
  flex-shrink: 0;
  gap: 8px;
  color: #cbd5e1;
}

.invite-row-icon-shell {
  width: 42px;
  height: 42px;
  flex-shrink: 0;
  border-radius: 16px;
  background: #fff1f2;
  color: #be123c;
  display: flex;
  align-items: center;
  justify-content: center;
}

.invite-row-copy {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.invite-row-title {
  color: #111111;
  font-size: 15px;
  line-height: 20px;
  font-weight: 800;
}

.invite-row-description {
  color: #64748b;
  font-size: 12px;
  line-height: 18px;
  font-weight: 600;
}

.invite-row-value {
  max-width: 112px;
  color: #64748b;
  font-size: 12px;
  line-height: 18px;
  font-weight: 700;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

@media (hover: hover) and (pointer: fine) {
  .invite-row-target:hover .invite-row-icon-shell {
    background: #111111;
    color: #fb7185;
  }
}
</style>
