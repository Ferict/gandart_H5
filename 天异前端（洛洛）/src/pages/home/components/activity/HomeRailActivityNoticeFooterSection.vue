<!--
Responsibility: render the activity notice footer feedback shell so the results section stays
focused on list structure and first-screen state routing.
Out of scope: footer mode decisions, remote list retries, and result-window behavior.
-->
<template>
  <HomeRailListLoadingFooter
    v-if="shouldRenderFooter"
    :mode="footerMode"
    :error-text="remoteNoticeListErrorMessage || '加载失败，点击重试'"
    retry-text="重试"
    zh-text="没有更多公告了"
    en-text="No more announcements"
    @retry="$emit('retry')"
  />
</template>

<script setup lang="ts">
import type { HomeRailListLoadingFooterMode } from '../shared/homeRailListLoadingFooter.a11y'
import HomeRailListLoadingFooter from '../shared/HomeRailListLoadingFooter.vue'

interface Props {
  shouldRenderFooter: boolean
  footerMode: HomeRailListLoadingFooterMode
  remoteNoticeListErrorMessage?: string | null
}

defineProps<Props>()

defineEmits<{
  retry: []
}>()
</script>
