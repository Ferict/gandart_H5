# src/pages/home/composables/activity

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录用于承载首页活动公告 rail 的 page-local composable、helper 与常量。

## 目录职责

1. 承载活动公告 rail 的 query、remote list、visual reveal、scene patch、presentation runtime 等局部实现。
2. 承载只服务于活动公告 rail 的 helper、重试链路与加载态逻辑。
3. 承载活动公告 rail 的基础视图状态、纯运行时状态，以及当前新增的 notice data pipeline。

## 当前内容

1. `useActivity*` 系列 composable
2. `activityNoticeLoadState.helper.ts`
3. `homeRailActivityPanel.constants.ts`
4. `useHomeRailActivityRuntimeState.ts`
5. `useHomeRailActivityViewState.ts`
6. `useHomeRailActivityNavigation.ts`
7. `useHomeRailActivityContentLifecycle.ts`
8. `useHomeRailActivityEffects.ts`
9. `useHomeRailActivityNoticeReload.ts`
10. `useHomeRailActivityPresentationState.ts`
11. `useHomeRailActivityNoticeDataPipeline.ts`
12. `useHomeRailActivityPanelRuntime.ts`
13. `useHomeRailActivityRefreshRuntime.ts`
14. `useHomeRailActivityNoticeResultRuntime.ts`
15. `useHomeRailActivityNoticeEffectsRuntime.ts`
16. `useActivityNoticeResultWindowGeometryRuntime.ts`
17. `useActivityNoticeResultWindowSwitchRuntime.ts`
18. `useActivityNoticeResultWindowInactiveResetRuntime.ts`
19. `useActivityNoticeResultWindowRenderRuntime.ts`
20. `useActivityNoticeResultWindowPresentationRuntime.ts`

## 不应放入的内容

1. 首页市场 rail 逻辑。
2. 个人页 rail 逻辑。
3. 明显跨 rail 共享的通用运行时。
