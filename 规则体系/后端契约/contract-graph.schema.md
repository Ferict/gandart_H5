# Contract Graph Schema

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
