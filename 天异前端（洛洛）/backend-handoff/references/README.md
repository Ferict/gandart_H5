# Backend Handoff References

这里不再复制或重述 API 正文，也不再指向 `references/` 下的代码快照副本。后端如需核对真实调用链，直接查看当前 `src/` 中的正式源码。

建议后端按下面顺序查看：

1. [src/contracts/content-api.contract.ts](../../src/contracts/content-api.contract.ts)
2. [src/ports/content.port.ts](../../src/ports/content.port.ts)
3. [src/implementations/content.http.ts](../../src/implementations/content.http.ts)
4. [src/services/content/content.service.ts](../../src/services/content/content.service.ts)
5. [references/README.md](../../references/README.md)

这些文件的作用：

- `src/contracts/content-api.contract.ts`
  - 当前唯一正式 API 真值源
- `src/ports/content.port.ts`
  - 前端对内容域 port 的统一抽象边界
- `src/implementations/content.http.ts`
  - HTTP 层怎样把 query 参数映射到当前正式接口
- `src/services/content/content.service.ts`
  - 前端怎样通过 contract + port 组织实际内容请求
- `references/README.md`
  - 当前参考索引说明；不承载接口代码副本

除 `src/contracts/content-api.contract.ts` 外，其余文件只是帮助理解前端消费方式，不代表后端需要照抄前端实现。
