# src/pages/home/composables/shared

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录用于承载仅供首页 rails 之间复用的 page-local shared composable 与 helper。

## 目录职责

1. 放置首页 rails 共用的 refresh presentation runtime / waiter。
2. 放置首页 rails 共用的 query apply scheduler 等局部共享工具。

## 当前内容

1. `queryApplyScheduler.ts`。
2. `useRefreshPresentationRuntime.ts`。
3. `useRefreshPresentationWaiter.ts`。
4. `useHomeShellDrawerRuntime.ts`。
5. `useHomeShellNavRailRuntime.ts`。
6. `useHomeShellTabbarRuntime.ts`。
7. `useHomeRailPaginationLoadingChain.ts`。

## 不应放入的内容

1. 真正跨页面共享的全局 composable。
2. 与首页 rails 无关的局部运行时。
