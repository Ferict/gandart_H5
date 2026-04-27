# src/pages/home/composables/home

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录承载首页 home rail 与 HomeShellTrackStage 相关的 page-local composable、helper 与常量。

## 目录职责

1. 承载首页 market rail 的 query、remote list、result window、scene patch 与 presentation runtime。
2. 承载首页 market rail 的页面导航、刷新链路、watcher 编排与局部展示派生。
3. 承载 HomeShellTrackStage 的 refresh、mount metrics、page mount、profile scroll bridge，以及当前新增的 refs 与生命周期壳。
4. 承载首页 home rail 的基础内容状态、运行时状态、page-local 常量与辅助工具。

## 当前内容

1. `useHomeRailHomeContentState.ts`
2. `useHomeRailHomeRuntimeState.ts`
3. `useHomeRailHomeNavigation.ts`
4. `useHomeRailHomeContentLifecycle.ts`
5. `useHomeRailHomePresentationState.ts`
6. `useHomeRailHomeEffects.ts`
7. `useHomeRailHomeMarketReload.ts`
8. `useHomeMarketQueryState.ts`
9. `useHomeMarketRemoteListState.ts`
10. `useHomeMarketResultWindow.ts`
11. `useHomeHomeVisualReveal.ts`
12. `useHomePagePresentationRuntime.ts`
13. `useHomeScenePatchController.ts`
14. `useHomeTrackRefreshController.ts`
15. `useHomeTrackMountMetrics.ts`
16. `useHomeTrackPageMountState.ts`
17. `useHomeTrackProfileScrollBridge.ts`
18. `useHomeTrackStageRefs.ts`
19. `useHomeTrackStageLifecycle.ts`
20. `useHomeTrackStageViewState.ts`
21. `homeRailHomePanel.constants.ts`
22. `homeTrackRefresh.constants.ts`
23. `homeMarketPrefetch.util.ts`
24. `useHomeRailHomeTemplateAdapters.ts`
25. `useHomeRailHomeMarketDataPipeline.ts`
26. `useHomeRailHomePanelRuntime.ts`
27. `useHomeRailHomeVisualPresentationRuntime.ts`
28. `useHomeRailHomeSceneLifecycleRuntime.ts`
29. `useHomeRailHomeMarketResultRuntime.ts`
30. `useHomeRailHomeMarketEffectsRuntime.ts`
31. `useHomeMarketResultWindowGeometryRuntime.ts`
32. `useHomeMarketResultWindowSwitchGateway.ts`
33. `useHomeMarketResultWindowEnterRuntime.ts`
34. `useHomeMarketResultWindowEnterPhaseAssembly.ts`
35. `useHomeMarketResultWindowInactiveResetRuntime.ts`
36. `useHomeMarketResultWindowLoadMoreRuntime.ts`
37. `useHomeMarketResultWindowOverlayRuntime.ts`
38. `homeMarketResultWindowProjection.ts`
39. `useHomeMarketResultWindowPresentationRuntime.ts`
40. `useHomeMarketSearchRuntime.ts`
41. `useHomeMarketTagSelectionRuntime.ts`
42. `useHomeSurfaceVisualRevealRuntime.ts`
43. `useHomeMarketCardVisualRevealRuntime.ts`

## 不应放入的内容

1. activity rail 的 page-local 逻辑。
2. profile rail 的 page-local 逻辑。
3. 跨页面共享 composable。
4. 不属于首页壳或 home rail 的运行时 service。
