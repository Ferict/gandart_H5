<!--
Responsibility: render the profile results footer and keep the pagination feedback markup
isolated from the parent profile results section.
Out of scope: load-more behavior, result window progression, and retry execution logic.
-->
<template>
  <HomeRailListLoadingFooter
    v-if="shouldRenderFooter"
    :mode="footerMode"
    error-text="加载失败"
    retry-text="重试"
    zh-text="没有更多资产了"
    en-text="No more items in your collection"
    @retry="emit('retry')"
  />
</template>

<script setup lang="ts">
import type { HomeRailListLoadingFooterMode } from '../shared/homeRailListLoadingFooter.a11y'
import HomeRailListLoadingFooter from '../shared/HomeRailListLoadingFooter.vue'

interface Props {
  shouldRenderFooter: boolean
  footerMode: HomeRailListLoadingFooterMode
}

defineProps<Props>()

const emit = defineEmits<{
  retry: []
}>()
</script>
