# Contract Graph Schema

The graph is the single source of truth for generated contracts and evidence documents.

| Node | Required fields |
| --- | --- |
| ApiWrapper | id, domain, exportName, sourceFile, line, method, path, auth, status, evidence |
| EndpointVariant | id, wrapperId, condition, method, path, evidence |
| LiveCall | id, callee, resolvedWrapperId, sourceFile, line, importSource, status |
| DirectRequest | id, sourceFile, line, localName, method, path, urlExpression, status, evidence |
| RequestField | operationId, fieldPath, sourceKind, confidence, evidence |
| ResponseField | operationId, fieldPath, consumerPath, confidence, evidence |
| RuntimeDerivedField | fieldPath, sourceField, deriveRule, consumer, evidence |
| MissingExport | callee, sourceFile, line, importSource, frontendImpact, evidence |
| UnresolvedIssue | id, status, severity, affectedOperations, affectedFields, frontendImpact, closeCondition, evidence |
| ReviewFinding | id, gate, severity, status, owner, fixTarget, evidence |

Allowed issue states: `open / investigating / blocked-by-source / accepted-risk / closed`.

Allowed wrapper states: `confirmed / exported-unused / deprecated-dead / missing-evidence / inferred / unresolved`.
