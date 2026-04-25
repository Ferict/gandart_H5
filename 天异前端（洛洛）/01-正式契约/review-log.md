# Review Log

| Gate | Status | Finding |
| --- | --- | --- |
| Extractor Auditor | completed-with-regression-rule | Generator strips comments before import parsing, detects default request imports, and excludes JS collection methods from response fields. |
| Inventory Auditor | completed-with-regression-rule | Every wrapper has status, auth precheck value, path variant, and per-variant evidence. |
| Request Shape Auditor | completed-with-regression-rule | Request ledger records location as path/query/body/header and downgrades call-site-only evidence to Level B. |
| Response Dataflow Auditor | completed-with-regression-rule | Response evidence is scoped to the matched `.then(...)` block and runtime derived fields are separated. |
| Domain Contract Auditor | completed-with-regression-rule | Known high-risk domains have explicit overrides or unresolved risk entries. |
| Consistency/Handoff Auditor | completed-with-regression-rule | Handoff separates active confirmed usage from exported-unused contracts and inferred contracts. |

Current unresolved counts: P1=0, P2=0, P3=224.
