# src/pages/home/components/home

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承接首页 `home` rail 私有 section 与结果区卡壳组件。

## 目录职责

1. 放置只服务于 `HomeRailHomePanel.vue` 的展示 section。
2. 放置首页 `market` 结果区私有 card shell 与状态 section。
3. 让首页 `home` rail 的物理落点与 `composables/home/` 的逻辑分组保持一致。

## 当前内容

1. `HomeRailHomeBannerCarouselSection.vue`
2. `HomeRailHomeFeaturedSection.vue`
3. `HomeRailHomeNoticeBarSection.vue`
4. `HomeRailHomeMarketHeadSection.vue`
5. `HomeRailHomeMarketTagSection.vue`
6. `HomeRailHomeMarketSearchSection.vue`
7. `HomeRailHomeMarketStateSection.vue`
8. `HomeRailHomeMarketFooterSection.vue`
9. `HomeRailHomeMarketResultsSection.vue`
10. `HomeRailHomeMarketCardShell.vue`

## 不应放入的内容

1. `activity` 或 `profile` rail 组件。
2. 跨页面共享的 root 组件。
3. 页面私有运行时 composable 或 service。
