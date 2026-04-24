<!--
Responsibility: adapt route query data into the shared construction placeholder component.
Out of scope: real feature execution, content-domain fetching, and long-term business-page presentation.
-->

<template>
  <ConstructionPlaceholder
    :title="page.title"
    :english-title="page.englishTitle"
    :status-label="page.statusLabel"
    :description="page.description"
    :reserve-hint="page.reserveHint"
    @back="handleBack"
  />
</template>

<script setup lang="ts">
import { reactive } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import ConstructionPlaceholder from '../../components/ConstructionPlaceholder.vue'
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

onLoad((query) => {
  const routeQuery = parseUpdatingRouteQuery(query as Record<string, unknown>)
  const { moduleId, title, englishTitle, statusLabel, source } = routeQuery

  page.moduleId = moduleId || defaultPage.moduleId
  page.title = title || defaultPage.title
  page.englishTitle = englishTitle || defaultPage.englishTitle
  page.statusLabel = statusLabel || defaultPage.statusLabel

  const resolvedContent = resolveUpdatingContent(page.moduleId, source)
  page.description = resolvedContent.description
  page.reserveHint = resolvedContent.reserveHint
})

const handleBack = () => {
  if (getCurrentPages().length > 1) {
    uni.navigateBack()
    return
  }

  uni.switchTab({
    url: '/pages/home/index',
  })
}
</script>
