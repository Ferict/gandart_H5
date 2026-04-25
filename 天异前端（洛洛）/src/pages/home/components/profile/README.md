# src/pages/home/components/profile

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承接首页 `profile` rail 私有 section、结果区壳层与资产卡壳组件。

## 目录职责

1. 放置只服务于 `HomeRailProfilePanel.vue` 的展示 section。
2. 放置 `profile` 结果区私有 card shell、empty state 与 footer。
3. 让首页 `profile` rail 的物理落点与 `composables/profile/` 的逻辑分组保持一致。

## 当前内容

1. `HomeRailProfileIdentitySection.vue`
2. `HomeRailProfileSummarySection.vue`
3. `HomeRailProfileQuickActionsSection.vue`
4. `HomeRailProfileAssetsHeadSection.vue`
5. `HomeRailProfileCategorySection.vue`
6. `HomeRailProfileSubCategorySection.vue`
7. `HomeRailProfileSearchSection.vue`
8. `HomeRailProfileEmptyStateSection.vue`
9. `HomeRailProfileFooterSection.vue`
10. `HomeRailProfileResultsSection.vue`
11. `HomeRailProfileAssetCardShell.vue`

## 不应放入的内容

1. `home` 或 `activity` rail 组件。
2. 跨页面共享的 root 组件。
3. 页面私有运行时 composable 或 service。
