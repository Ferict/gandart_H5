# References

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-20
> 说明：本目录只保留给后端理解前端内容域消费方式的索引说明，不再承载 contract、port、http、service 的代码快照副本。

## 1. 当前现行内容

当前 `references/` 只保留本 `README.md`。

原先位于本目录的 `content-api.contract.ts`、`content.port.ts`、`content.http.ts`、`content.service.ts` 代码快照已经退出当前路径，避免形成第二套接口正文或第二套 endpoint 理解。

旧 `user-pinned-rules.md` 冻结入口也已退出当前路径；旧规则不再通过 `references/` 回链。

## 2. 阅读顺序

建议按以下顺序查阅：

1. [src/contracts/content-api.contract.ts](../src/contracts/content-api.contract.ts)
2. [src/ports/content.port.ts](../src/ports/content.port.ts)
3. [src/implementations/content.http.ts](../src/implementations/content.http.ts)
4. [src/services/content/content.service.ts](../src/services/content/content.service.ts)

## 3. 文件职责

- `src/contracts/content-api.contract.ts`
  - 当前唯一正式 API 真值源。
- `src/ports/content.port.ts`
  - 前端内容域 provider 能力边界，不是后端 API 真值源。
- `src/implementations/content.http.ts`
  - HTTP adapter 怎样引用正式 contract 并映射 query/body。
- `src/services/content/content.service.ts`
  - 前端上层怎样通过 port 消费内容域能力。

## 4. 使用边界

1. 本目录只提供阅读索引，不保存接口代码副本。
2. 本目录不是现行规则入口；规则以 `AGENTS.md`、`规则体系/` 和 `规则体系/口径/` 为准。
3. 本目录不是正式 API 真值源；正式 API 只以 [src/contracts/content-api.contract.ts](../src/contracts/content-api.contract.ts) 为准。
4. 本目录不是历史垃圾桶的缓冲区；旧规则摘录、旧技能注入材料和退役旁路输入不得继续留在这里充当现行参考源。
