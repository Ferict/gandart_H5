---
name: 安全边界检查
description: 审查本地缓存、第三方依赖、安全边界与不可信输入相关风险。
---

Review the current diff and report issues when any of these are true:

1. A page or component directly reads or writes local storage instead of going through a service or store boundary.
2. A third-party package is coupled directly to page code instead of an adapter, service, port, or shared component.
3. Untrusted input is rendered directly without a clear sanitization or boundary step.
4. Tooling or config changes introduce new network, file, or credential exposure without documenting the boundary.
