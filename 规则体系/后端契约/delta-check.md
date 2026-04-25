# Delta Maintenance

> 文档类型：后端契约维护说明
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件记录后端契约抽取产物发生变化时的维护动作，不替代现行规则正文。

| Source change | Required action |
| --- | --- |
| New API wrapper | Add confirmed contract or mark exported-unused. |
| Path/method/auth change | Update endpoint variant and evidence. |
| New live call | Resolve to wrapper or add MissingExport. |
| New response field consumption | Update ResponseField and confidence. |
| Deleted call | Update usage status; keep historical evidence in ledger. |
| New unresolved item | Assign severity, frontendImpact, closeCondition. |
