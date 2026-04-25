<!--
Responsibility: adapt route query data into either the shared construction placeholder or
small retained module pages that have graduated from placeholder-only status.
Out of scope: content-domain fetching, provider transport, and long-term business-domain routing.
-->

<template>
  <UpdatingPriorityDrawPage v-if="isPriorityDrawModule" @back="handleBack" />
  <UpdatingAssetMergePage v-else-if="isAssetMergeModule" @back="handleBack" />
  <ConstructionPlaceholder
    v-else
    :title="page.title"
    :english-title="page.englishTitle"
    :status-label="page.statusLabel"
    :description="page.description"
    :reserve-hint="page.reserveHint"
    @back="handleBack"
  />
</template>

<script setup lang="ts">
import { computed, reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ConstructionPlaceholder from '../../components/ConstructionPlaceholder.vue'
import UpdatingAssetMergePage from './UpdatingAssetMergePage.vue'
import UpdatingPriorityDrawPage from './UpdatingPriorityDrawPage.vue'
import { runUpdatingBackNavigation } from './updatingBackNavigation'
import { resolveUpdatingContent } from './updatingContent'
import { parseUpdatingRouteQuery } from './updatingRouteQuery'

const defaultPage = {
  title: '功能建设中',
  englishTitle: 'Feature Pending',
  statusLabel: 'Construction',
  moduleId: 'UPD-GENERAL',
  description: '当前功能暂未完成，已统一收口到建设中承载页。',
  reserveHint: '后续真实功能上线时会替换为正式入口，不再新增独立占位页壳。',
}

const page = reactive({ ...defaultPage })
const isPriorityDrawModule = computed(() => page.moduleId === 'UPD-ACT-PRIORITY-DRAW')
const isAssetMergeModule = computed(() => page.moduleId === 'UPD-ACT-ASSET-MERGE')

onLoad((query) => {
  const routeQuery = parseUpdatingRouteQuery(query as Record<string, unknown>)
  const { moduleId, title, englishTitle, statusLabel, source } = routeQuery

  page.moduleId = moduleId || defaultPage.moduleId
  page.title = isPriorityDrawModule.value
    ? '优先抽奖'
    : isAssetMergeModule.value
      ? '资产合成'
      : title || defaultPage.title
  page.englishTitle = isPriorityDrawModule.value
    ? 'Priority_Draw'
    : isAssetMergeModule.value
      ? 'Protocol_Merge'
      : englishTitle || defaultPage.englishTitle
  page.statusLabel = statusLabel || defaultPage.statusLabel

  const resolvedContent = resolveUpdatingContent(page.moduleId, source)
  page.description = resolvedContent.description
  page.reserveHint = resolvedContent.reserveHint
})

const handleBack = () => {
  runUpdatingBackNavigation(getCurrentPages().length, {
    navigateBack: () => {
      uni.navigateBack()
    },
    reLaunch: (options) => {
      uni.reLaunch(options)
    },
  })
}
</script>
