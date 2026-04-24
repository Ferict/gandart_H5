# 交接指南

## 可直接接入

- `contracts/*.contract.ts` 是由旧前端源码证据支撑的 transport 类型定义。
- `api-inventory.md` 中 `status: confirmed` 的接口存在真实脚本调用，可作为新前端接入的主基线。
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
