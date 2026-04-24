# src/pages/home/components/activity

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承接首页 `activity` rail 私有 section、结果区壳层与首屏状态组件。

## 目录职责

1. 放置只服务于 `HomeRailActivityPanel.vue` 的展示 section。
2. 放置 `activity` 结果区私有 results shell、首屏状态与 footer 组件。
3. 让首页 `activity` rail 的物理落点与 `composables/activity/` 的逻辑分组保持一致。

## 当前内容

1. `HomeRailActivityEntryHighlightsSection.vue`
2. `HomeRailActivityNoticeHeadSection.vue`
3. `HomeRailActivityTagSection.vue`
4. `HomeRailActivitySearchSection.vue`
5. `HomeRailActivityNoticeResultsSection.vue`
6. `HomeRailActivityNoticeStateSection.vue`
7. `HomeRailActivityNoticeFooterSection.vue`

## 不应放入的内容

1. `home` 或 `profile` rail 组件。
2. 跨页面共享的 root 组件。
3. 页面私有运行时 composable 或 service。
