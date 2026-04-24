# src/adapters/content

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-24
> 说明：本目录承载 content domain 的前端适配纯函数；它负责把正式 contract DTO 转成 runtime/service 可稳定消费的内部模型。

## 1. 目录职责

1. 承接 scene、list、resource、target 等 DTO 的归一化。
2. 把 DTO 里的 transport / contract 语义挡在 adapter 层以下。
3. 为 `src/services/content/*`、`src/services/home-rail/*`、`src/services/profile-asset-detail/*` 提供稳定输入。

## 2. 不放什么

1. 页面私有 composable 或 runtime。
2. 组件模板和样式。
3. provider 选择、分页调度、缓存持久化等运行时编排。
