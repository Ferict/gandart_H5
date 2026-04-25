# Verification Report

> 文档类型：后端契约验证报告
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件记录契约抽取和覆盖校验结果，用于证明抽取产物质量，不代表真实后端已联调通过。

Generated at: `2026-04-24T18:19:07.580Z`
Verified at: `2026-04-24T18:19:17.292Z`
Graph: `H:\工作\天异后端抽取专项\交付物\01-正式契约\contract-graph.json`

| Check | Status | Details |
| --- | --- | --- |
| API wrapper coverage | pass | 190/190 |
| live call resolution | pass | 185/185 |
| branch path documentation | pass | 0 wrappers missing variants |
| auth precheck resolution | pass | 0 unresolved |
| missing export registration | pass | 8/8 |
| confirmed field evidence | pass | 310/310 |
| response JS method pollution | pass | 0 polluted response fields |
| request location normalization | pass | 0 non-normalized locations |
| request sourceKind normalization | pass | 0 invalid sourceKind values |
| direct request registration | pass | 0 incomplete direct requests / 1 total |
| uni.request source scan | pass | 1/1 |
| commented import fixture | pass | 0 false calls |
| local method fixture | pass | 0 false calls |
| unresolved lifecycle coverage | pass | 218/218 |
| P1 open | pass | 0 |
| P2 open | pass | 0 |
| deliverable files | pass | all present |
| field usage documentation | pass | 445/445 |
| operation usage documentation | pass | 190/190 |
| missing export unresolved backlinks | pass | 0 missing |
| direct request unresolved backlinks | pass | 0 missing |
| high-risk branch/path closure | pass | 0 missing |
| high-risk request field closure | pass | 0 missing |
| high-risk response field closure | pass | 0 missing |
| frontend consumption documentation | pass | 1655/1655 |
| old deliverable dependency | pass | 0 suspicious references |
| contract file presence | pass | 22 files |
| contract index presence | pass | contracts/index.ts |
| inferred contract presence | pass | 1 files |
| transport derived-field isolation | pass | hide_mobile absent from contracts |
| wallet dual redirect contract | pass | top-level and info.redirect_url supported |
| TypeScript syntax check | pass | pass |

## Acceptance Metrics

| Metric | Value | Status |
| --- | --- | --- |
| API wrapper coverage | 190/190 | pass |
| live call resolution | 185/185 | pass |
| branch path documentation | 199 | pass |
| missing export registration | 8/8 | pass |
| confirmed field evidence | 310/310 | pass |
| direct request registration | 1 | pass |
| request sourceKind normalization | 0 invalid | pass |
| field usage documentation | 445/445 | pass |
| operation usage documentation | 190/190 | pass |
| missing export unresolved backlinks | 0 missing | pass |
| direct request unresolved backlinks | 0 missing | pass |
| high-risk branch/path closure | 0 missing | pass |
| high-risk request field closure | 0 missing | pass |
| high-risk response field closure | 0 missing | pass |
| frontend consumption documentation | 1655/1655 | pass |
| unresolved lifecycle coverage | 218/218 | pass |
| transport derived-field isolation | hide_mobile absent from contracts | pass |
| wallet dual redirect contract | present | pass |
| P1 open | 0 | pass |
| P2 open | 0 | pass |
| P3 accepted-risk/open | 218 | informational |
| TypeScript syntax check | pass | pass |
