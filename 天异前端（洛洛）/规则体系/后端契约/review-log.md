# Review Log

> 文档类型：后端契约审查日志
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件记录契约抽取过程中的审查门禁和结论，用于追溯抽取质量。

| Gate | Status | Finding |
| --- | --- | --- |
| Extractor Auditor | closed | No live-call pollution found; comment/template/local-method/direct-request fixtures are covered by verification. |
| Inventory Auditor | closed | 190 wrappers have status/auth/path variants; collection.sellProduct and collection.isCollect branch conditions are verified. |
| Request Shape Auditor | closed | Variable-object request fields, pass-through bodies, query/path locations, and dynamic body.* risks are recorded. |
| Response Dataflow Auditor | closed | Homepage, market, order detail, lottery, and config response consumption fields are mapped to operation-level evidence. |
| Domain Contract Auditor | closed | Path id/query fixes, wallet dual redirect, user hide_mobile separation, collection detail root, and draw export separation are verified. |
| Consistency/Handoff Auditor | closed | Missing exports/direct requests backlink to unresolved lifecycle entries; handoff wording scopes response reliance to field evidence. |

## Six-Agent Manual Review Closure

| Finding | Closure |
| --- | --- |
| Branch condition truncation | Closed by balanced condition extraction and explicit verification for collection.sellProduct / collection.isCollect. |
| Path id omissions | Closed for box.getBoxDetails and notice.getNoticeDetails; RequestParts include path/query where sourced from wrapper. |
| Request object omissions | Closed for login/register/certification/market/draw signup and pass-through wrappers; unresolved dynamic spreads remain body.* Level C. |
| Response dataflow gaps | Closed for getCalenderList, market lists, order details, lottery, getConfig and getPageConfig with Level B frontend-consumption evidence. |
| Missing export lifecycle gaps | Closed by unresolved backlinks in operation-usage-guide.md for 8 draw missing exports and the direct address request. |
| Handoff over-broad confirmed wording | Closed by limiting direct response reliance to fields present in field-usage-index.md / confidence.md. |

Current unresolved counts: P1=0, P2=0, P3=218.
