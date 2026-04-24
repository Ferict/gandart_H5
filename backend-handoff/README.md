# Backend Handoff

这个目录只服务于后端 handoff、联调环境和验证入口。

当前项目级后端契约入口已经收口为：

1. [规则体系/后端契约/README.md](../规则体系/后端契约/README.md)

当前前端已实现内容域契约入口为：

1. [src/contracts/content-api.contract.ts](../src/contracts/content-api.contract.ts)

`backend-handoff/` 不再承载正式 API 正文；这里只回答三件事：

1. 后端应该按什么顺序读
2. 前端源码仓怎样启动与验证
3. 本轮 handoff 应该带哪些文件、排除哪些噪音

## 后端最小阅读顺序

1. [规则体系/后端契约/README.md](../规则体系/后端契约/README.md)
2. [规则体系/口径/06-项目后端契约现行使用口径.md](../规则体系/口径/06-项目后端契约现行使用口径.md)
3. [src/contracts/content-api.contract.ts](../src/contracts/content-api.contract.ts)
4. [后端联调环境与启动说明.md](./后端联调环境与启动说明.md)
5. [后端移交内容清单.md](./后端移交内容清单.md)
6. [P11.12-后端接口接入分级清单.md](./P11.12-后端接口接入分级清单.md)
7. [references/README.md](./references/README.md)
8. 需要核对真实调用链时，再看 `src/ports/content.port.ts`、`src/implementations/content.http.ts`、`src/services/content/content.service.ts` 与相关测试

## 本目录当前内容

- [后端联调环境与启动说明.md](./后端联调环境与启动说明.md)
  - 环境准备、启动命令、最小验证链与当前交付边界
- [后端移交内容清单.md](./后端移交内容清单.md)
  - 当前应该交给后端的文件、目的和排除项
- [P11.12-后端接口接入分级清单.md](./P11.12-后端接口接入分级清单.md)
  - 当前页面与二线新增页面接新版后端契约时，按“原接口接入 / 建议改造 / 需改造 / 新增”维护接口分级
- [references/README.md](./references/README.md)
  - 当前源码参考入口与查看顺序

## 当前正式接口

- `GET /api/content/scene`
- `GET /api/content/resource`
- `GET /api/content/list`
- `POST /api/content/action/notice-read`
- `POST /api/content/action/service-reminder-consume`

## 当前正式边界

- 后端当前先读 [规则体系/后端契约/README.md](../规则体系/后端契约/README.md)；若要核对当前前端已实现链路，再读 [src/contracts/content-api.contract.ts](../src/contracts/content-api.contract.ts)。
- 当前正式列表契约仍是 `page + pageSize`。
- `GET /api/content/list` 的后端 wire query 是扁平字段：`sortField / sortDirection / startDate / endDate`；前端内部 `sort.field / dateRange` 会由 http adapter 映射，不是后端要接的 query 结构。
- `cursor` 仍后置，不属于当前正式交付。
- 用户态接口不新增 `userId / accountId` 参数；后端从登录态、token 或 session 解析当前用户。
- 业务失败优先返回 HTTP 2xx + `ContentEnvelope.code != 0`；HTTP 非 2xx 只表达传输、鉴权或服务异常，当前前端 adapter 不解析非 2xx body。
- `params.category / params.subCategory` 只允许作为 `profile_asset` target 的目标上下文，不是可自由扩展的新后端字段。
- `tone / visualTone / placeholderIconKey / badgeType / badgeLabel / indicatorTone / englishTitle / badges` 是内容展示元数据，后端/CMS 可返回，前端可 fallback。
- `owner / contract / chain / tokenStandard / traits / provenance` 仍不是当前正式后端字段。
- 当前仓内最小联调验证入口是 `npm run check:content:http`；该脚本直接读取 `src/contracts/content-api.contract.ts` 的正式 endpoint 总表。
- `src/contracts/content-api.contract.ts` 内的 endpoint `successExample` 和 POST `requestBodyJsonExample` 均应是可解析 JSON。
- `references/` 不再保存 `contract / port / http / service` 代码快照副本，避免形成第二套接口正文。
- 默认验证：
  - `GET /api/content/scene`
  - `GET /api/content/list`，默认按 `market_item + sortField=listedAt + sortDirection=desc`
- 其余 3 条接口按样本参数补齐后继续验证；缺参时应视为“验证入口已具备，但真实联通结论环境阻塞”。

## 当前 GitHub 联调源码仓边界

当前建议保留：

- `src/`
- `tests/`
- `scripts/`
- `.github/`
- 根目录必要配置
- `AGENTS.md`
- `规则体系/`
- active `留档/`
- `backend-handoff/`
- `references/`
- `promptfoo/`
- `semgrep/`
- `vale-styles/`
- `.continue/`
- `提交清单/README.md`
- `垃圾桶/README.md`

说明：

1. `promptfoo/`、`semgrep/`、`vale-styles/`、`.continue/` 不是业务源码，也不是后端必须阅读的接口材料。
2. 这些目录当前被 `package.json`、CI workflow 和质量脚本直接依赖，因此随 GitHub 联调源码仓保留，保证交付仓可以复现质量门禁。
3. `AGENTS.md`、`规则体系/`、active `留档/`、`提交清单/README.md`、`垃圾桶/README.md` 当前被文档门禁直接检查；它们随可运行源码仓保留，但不是后端理解内容接口的必读材料。

当前明确排除：

- 已送桶的旧历史入口（原 `审核与修改计划/`、`对话台账/`、`项目索引/`）
- `留档/历史记录/`
- `提交清单/` 内部内容，`README.md` 除外
- 已送桶的旧历史总账入口（原 `项目台账.md`）
- 已送桶的旧回档目录（原 `备份/`）
- `垃圾桶/` 内部内容，`README.md` 除外
- 历史回档材料与冻结快照
- 构建产物与本地依赖目录
- `.tools/` 等本地生成工具产物
