# src/pages/home/composables/profile

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录用于承载首页个人页 rail 的 page-local composable、helper 与常量。

## 目录职责

1. 承载个人页 rail 的 query、remote list、reload、result window、scene patch 与 presentation runtime。
2. 承载个人页 rail 的搜索揭示、视觉 reveal、导航、快捷操作与详情跳转链路。
3. 承载个人页 rail 的基础视图状态、纯运行时状态，以及当前新增的 query/remote-list pipeline。

## 当前内容

1. `useProfile*` 系列 composable
2. `homeRailProfilePanel.constants.ts`
3. `useHomeRailProfileRuntimeState.ts`
4. `useHomeRailProfileViewState.ts`
5. `useHomeRailProfileNavigation.ts`
6. `useHomeRailProfileContentLifecycle.ts`
7. `useHomeRailProfilePresentationState.ts`
8. `useHomeRailProfileEffects.ts`
9. `useHomeRailProfileLoadMore.ts`
10. `useHomeRailProfileTopPresentation.ts`
11. `useHomeRailProfileAssetDataPipeline.ts`
12. `useHomeRailProfilePanelRuntime.ts`
13. `useHomeRailProfileRefreshRuntime.ts`
14. `useHomeRailProfileAssetResultRuntime.ts`
15. `useHomeRailProfileAssetEffectsRuntime.ts`
16. `useProfileAssetResultWindowGeometryRuntime.ts`
17. `useProfileAssetResultWindowSwitchGateway.ts`
18. `useProfileAssetResultWindowEnterRuntime.ts`
19. `buildProfileAssetEnterRevealPhaseMap.ts`
20. `useProfileAssetResultWindowEnterPhaseAssembly.ts`
21. `useProfileAssetResultWindowInactiveResetRuntime.ts`
22. `useProfileAssetResultWindowProjectionRuntime.ts`
23. `useProfileAssetResultWindowOverlayRuntime.ts`
24. `useProfileAssetResultWindowPresentationRuntime.ts`

## 不应放入的内容

1. 详情页专属 composable。
2. 跨页面共享 composable。
3. 正式接口实现。
