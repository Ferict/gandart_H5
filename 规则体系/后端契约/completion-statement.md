# 正式 API 契约完成声明

完成日期：2026-04-24T18:19:17.292Z
源码基线：285 files
wrapper coverage：190/190
live call resolution：185/185
branch path documentation：199
confirmed field evidence：310/310
direct request registration：1
field usage documentation：445/445
operation usage documentation：190/190
frontend consumption documentation：1655/1655
missing export registration：8/8
P1 open：0
P2 open：0
P3 accepted-risk：218
TypeScript check：pass
可直接接入范围：`status: confirmed` 且有 evidence 的 method/path/auth/request/envelope 契约；response 字段只有在 `field-usage-index.md` / `confidence.md` 中有对应字段证据时才可直接依赖。
需 adapter 范围：`FrontendUnknown` 响应、runtime derived 字段、旧前端消费链里的派生结构。
需后端确认范围：`unresolved.md`、`contracts/inferred`、missing export、direct request 和 Level C response。
不可依赖内容：作废 `01-统一契约`、template-only 名称、注释、字符串、路由文本、前端本地别名。
后续 delta 维护方式：按 `delta-check.md` 执行，每次源码变化生成 `delta-report-YYYYMMDD.md` 并重新运行抽取和覆盖校验。
