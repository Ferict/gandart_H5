# Contract Graph Schema

> 文档类型：后端契约图谱结构说明
> 状态：active
> 更新时间：2026-04-25
> 说明：本文件说明契约图谱生成结构和字段含义，用于理解抽取产物，不作为页面消费入口。

The graph is the single source of truth for generated contracts and evidence documents.

| Node | Required fields |
| --- | --- |
| ApiWrapper | id, domain, exportName, sourceFile, line, method, path, auth, status, evidence |
| EndpointVariant | id, wrapperId, condition, method, path, evidence |
| LiveCall | id, callee, resolvedWrapperId, sourceFile, line, importSource, status |
| DirectRequest | id, sourceFile, line, localName, method, path, urlExpression, status, evidence |
| RequestField | operationId, fieldPath, sourceKind, evidenceKind, confidence, evidence |
| ResponseField | operationId, fieldPath, consumerPath, confidence, evidence |
| RuntimeDerivedField | fieldPath, sourceField, deriveRule, consumer, evidence |
| FrontendFieldUsage | root, fieldPath, consumerKind, sourceFile, line, evidence |
| MissingExport | callee, sourceFile, line, importSource, frontendImpact, evidence |
| UnresolvedIssue | id, status, severity, affectedOperations, affectedFields, frontendImpact, closeCondition, evidence |
| ReviewFinding | id, gate, severity, status, owner, fixTarget, evidence |

Allowed issue states: `open / investigating / blocked-by-source / accepted-risk / closed`.

Allowed wrapper states: `confirmed / exported-unused / deprecated-dead / missing-evidence / inferred / unresolved`.

Allowed request sourceKind values: `literal / state / route / storage / computed / unknown`. `evidenceKind` records extractor mechanism such as `wrapper-param`, `call-arg`, `pass-through`, or `manual`.
