# src/services/home-shell

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录用于承载首页壳层布局、菜单、DOM 与壳状态相关 service。

## 目录职责

1. 放置首页壳层布局模式与 DOM 相关 service。
2. 放置首页壳层菜单、菜单状态与壳状态推导。
3. 收拢首页壳层占位内容解析。

## 当前内容

1. `homeShellDom.service.ts`
2. `homeShellLayoutMode.service.ts`
3. `homeShellMenu.service.ts`
4. `homeShellMenuState.service.ts`
5. `homeShellPlaceholderContent.service.ts`
6. `homeShellState.service.ts`

## 不应放入的内容

1. 首页 rail 内容解析与结果窗口逻辑。
2. 次级页 route query 解析。
3. 通用内容域缓存逻辑。
