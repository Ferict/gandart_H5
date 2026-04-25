# src/pages/home/components/shared

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录只保留首页三条 rail 与首页主壳共同消费、但仍然明显属于首页私有层的共享组件。

## 目录职责

1. 存放首页内共享的 footer、topbar、筛选抽屉与 `HomeShell*` 壳层。
2. 存放只服务这些首页共享组件的同目录 runtime 与 a11y helper。
3. 不再承接已跨出首页边界的交互叶子组件或图片壳。

## 当前内容

1. `HomeActivityNoticeCard.vue`
2. `HomeActivityDateFilterSheet.vue`
3. `homeActivityDateFilterSheet.runtime.ts`
4. `HomeRailListLoadingFooter.vue`
5. `homeRailListLoadingFooter.a11y.ts`
6. `HomeRailTopbar.vue`
7. `HomeShellTabbar.vue`
8. `HomeShellTrackStage.vue`

## 已回流到 src/components 的共享组件

1. `HomeInteractiveTarget.vue`
2. `homeInteractiveTarget.runtime.ts`
3. `HomeMarketCardImageReveal.vue`
4. `homeMarketCardImageReveal.runtime.ts`
5. `homeMarketCardImageReveal.cachePolicy.ts`
6. `HomeShellDrawer.vue`
7. `HomeShellNavRail.vue`

## 不应放入的内容

1. 只服务单条 rail 的 section 或 results shell。
2. 已经被二级页或跨页面组件复用的共享交互组件。
3. 非首页页面的通用组件。
