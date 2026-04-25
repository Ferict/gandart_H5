# src/pages/updating/runtime

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-24
> 说明：本目录承接 `updating` 页面域的 page-local runtime、adapter 与 provider 边界，不承接页面模板或正式后端 contract。

## 目录职责

1. 承接 `updating` 页面域的 page-local 运行时桥接。
2. 吸收 `updating` 页面域的 mock/provider 输入，并转换为页面稳定 view-model。
3. 为后续接入真实后端时保留 page-local 替换位。

## 当前内容

1. `priority-draw.port.ts`
2. `priority-draw.mock.ts`
3. `priority-draw.adapter.ts`
4. `priority-draw.model.ts`
5. `priority-draw.service.ts`
6. `usePriorityDrawRuntime.ts`

## 不应放入的内容

1. 页面模板或样式。
2. 全局 provider 选择逻辑。
3. 正式后端 contract 真值源。
