# 交接指南

> 文档类型：后端契约交接说明
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件说明后端契约抽取产物的阅读方式和接入边界，不替代 backend-handoff 联调说明。

## 可直接接入

- `contracts/*.contract.ts` 是由旧前端源码证据支撑的 transport 类型定义；response 字段只有在 `field-usage-index.md` / `confidence.md` 有字段证据时才可直接依赖。
- `api-inventory.md` 中 `status: confirmed` 的接口存在真实脚本调用，可作为新前端接入的主基线；无响应字段证据的 confirmed 接口只能确认 method/path/request/envelope。
- `status: exported-unused` 表示 wrapper 已导出但未找到真实调用证据，可参考但不能证明旧前端实际使用。
- `contracts/index.ts` 是后续沉入 `src/contracts` 的统一导入口。
- `auth` 表示旧前端 request wrapper 的本地前置校验：`true` 表示无 token 时请求前拒绝，`false` 表示无本地前置校验；`utils/request.js` 在存在 token 时仍会发送 token header。

## 需要 adapter

- `dataflow-ledger.md` 中的 runtime derived 字段属于 service/view-model 层，不属于 transport contract。
- 响应为 `FrontendUnknown` 的接口表示可调用，但旧前端没有稳定字段消费证据，需要 adapter 或真实响应样本进一步收窄。
- `usage-index.md` 中的 direct request 只表示旧前端存在 wrapper 外请求；除非补充归属证据，否则不能并入后端 API contract。

## 需要后端或源码确认

- `unresolved.md` 中 `blocked-by-source`、`open` 或 missing export 相关条目需要后端或补充源码确认。
- `contracts/inferred` 下的契约只能作为缺失导出或推断线索，不能当作 confirmed API path。
- wrapper 外的 `uni.request` 或 request import 需要确认是外部静态资源、历史遗留，还是应补 wrapper 的后端接口。

## 不得继承

- 作废目录 `交付物/01-统一契约` 的结论。
- template 事件名、注释、路由字符串、前端本地别名不能作为 API 事实证据。

## 字段用途与接口支持说明

建议读取顺序：先看 `operation-usage-guide.md` 判定接口可用性，再看 `contracts/*.contract.ts` 接类型，再看 `field-usage-index.md` / `confidence.md` 判定字段可依赖性，最后看 `unresolved.md` 决定是否需要后端确认。
- `operation-usage-guide.md` 是面向新前端接入的接口支持矩阵：每条接口列出 method、path/branch、auth、活跃消费点、请求字段、响应消费字段和未决风险。
- `field-usage-index.md` 是字段用途索引：每个 request/response 字段列出旧前端观察到的用途、消费位置、后端支持要求、置信度和证据。
- `frontend-consumption-index.md` 是旧前端页面/组件字段消费索引：用于识别 UI 和 adapter 需要哪些字段；只有能反查到 API dataflow 的字段才可提升到 transport 契约。
- 这些文档仍然遵守 transport-only 边界：用途来自旧前端消费证据，不等于后端官方业务注释；缺少后端 DTO/Swagger 时不能把推断字段写成 confirmed。
