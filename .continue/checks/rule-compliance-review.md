---
name: 规则命中检查
description: 审查变更是否按仓库门禁、任务命中和第三方依赖接入规则执行。
---

Review the current diff and call out problems when any of these are true:

1. The change introduces or updates third-party tooling without stating source, compatibility, or replacement boundary.
2. The change skips current repo rule-entry files such as `AGENTS.md`, `规则体系/README.md`, applicable `规则体系/*.md`, or applicable `规则体系/口径/*.md` files when a review or execution flow clearly depends on them.
3. The change adds process tooling but does not explain allowed edit scope, no-touch areas, or validation steps.

Prefer findings that are specific, actionable, and tied to the changed files.
