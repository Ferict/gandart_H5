# src/mocks/updating-db

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-24
> 说明：本目录承接 `updating` 页面域的结构化 mock 数据，不承接页面模板、运行时逻辑或 provider 选择。

## 目录职责

1. 集中存放 `updating` 页面域的结构化假数据。
2. 只暴露可被 mock implementation 或 page-local runtime adapter 消费的数据记录。
3. 作为未来接入真实后端前的统一 mock 数据落点。

## 当前内容

1. `priority-draw.ts`

## 不应放入的内容

1. 页面模板或样式。
2. page-local composable、service、adapter。
3. 正式后端 contract。
