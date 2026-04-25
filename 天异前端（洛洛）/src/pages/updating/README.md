# src/pages/updating

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承载统一建设中页面，以及少量由统一占位升级出的保留模块页和它们的页面私有 route query、文案适配逻辑。

## 目录职责

1. 放置 `updating` 的 uni-app 页面入口。
2. 承接未完成功能入口的统一建设中提示。
3. 放置仅服务 `updating` 的 route query 解析、文案适配和 page-local 模块化替换页。

## 当前内容

1. `index.vue`
2. `updatingRouteQuery.ts`
3. `updatingContent.ts`
4. `UpdatingPriorityDrawPage.vue`
5. `updatingPriorityDrawContent.ts`
6. `runtime/`

## 当前 page-local runtime

1. `runtime/priority-draw.port.ts`
2. `runtime/priority-draw.mock.ts`
3. `runtime/priority-draw.adapter.ts`
4. `runtime/priority-draw.model.ts`
5. `runtime/priority-draw.service.ts`
6. `runtime/usePriorityDrawRuntime.ts`

## 不应放入的内容

1. 新业务默认页面入口
2. 与 construction 占位链或已登记保留模块页无关的页面逻辑
