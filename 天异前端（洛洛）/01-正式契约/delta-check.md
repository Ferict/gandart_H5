# Delta Maintenance

| Source change | Required action |
| --- | --- |
| New API wrapper | Add confirmed contract or mark exported-unused. |
| Path/method/auth change | Update endpoint variant and evidence. |
| New live call | Resolve to wrapper or add MissingExport. |
| New response field consumption | Update ResponseField and confidence. |
| Deleted call | Update usage status; keep historical evidence in ledger. |
| New unresolved item | Assign severity, frontendImpact, closeCondition. |
