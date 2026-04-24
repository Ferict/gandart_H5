# client-surface-runtime

> 前端源码联调仓
> 适用对象：前端开发、后端联调、接口评审

## 1. 仓库定位

本仓库当前用于承载：

1. 前端真实源码与测试
2. 内容域单一正式 API 真值源
3. 给后端的 handoff、联调和验证入口
4. 最小参考索引；真实源码参考代码位于 `src/` 与 `tests/`

当前应用唯一工作仓口径固定为：

1. [H:\工作\天异\uniapp+vue新架构](/H:/工作/天异/uniapp+vue新架构/README.md)

如果同时存在外层仓、codex worktree 或其他壳层目录，对本应用的源码、规则、测试与留档操作仍只以本目录为准。

当前 GitHub `main` 应理解为“后端可直接联调的前端源码仓”，不是只放契约文档的 handoff 仓。

## 2. 阅读顺序

如果你是后端或联调同学，建议按下面顺序阅读：

1. [src/contracts/content-api.contract.ts](./src/contracts/content-api.contract.ts)
2. [backend-handoff/后端联调环境与启动说明.md](./backend-handoff/后端联调环境与启动说明.md)
3. [backend-handoff/后端移交内容清单.md](./backend-handoff/后端移交内容清单.md)
4. [backend-handoff/references/README.md](./backend-handoff/references/README.md)
5. [references/README.md](./references/README.md)
6. 需要核对真实调用链时，再看 `src/` 与 `tests/`

## 3. 当前正式接口

当前正式接口固定为：

- `GET /api/content/scene`
- `GET /api/content/resource`
- `GET /api/content/list`
- `POST /api/content/action/notice-read`
- `POST /api/content/action/service-reminder-consume`

当前正式列表分页口径仍是：

- `page + pageSize`

不是：

- `cursor`

## 4. 目录说明

- `src/`
  - 当前前端正式源码
- `tests/`
  - 单元测试与 E2E
- `scripts/`
  - 质量工具与脚本入口
- `backend-handoff/`
  - 后端阅读入口、联调环境与验证说明
- `src/contracts/content-api.contract.ts`
  - 当前唯一正式 API 真值源
- `references/`
  - 当前只保留参考索引，不再保存接口代码快照副本；真实参考实现位于 `src/` 与 `tests/`
- `promptfoo/`、`semgrep/`、`vale-styles/`、`.continue/`
  - 当前 CI 和本地质量门禁依赖的规则、评测和检查配置；随源码仓交付，但不承载业务源码

## 5. 本地开发命令

安装依赖：

```bash
npm install
```

启动 H5：

```bash
npm run dev:h5
```

固定端口：

```bash
npm run dev:h5:5180
```

常用检查：

```bash
npm run type-check
npm run test:unit
npm run test:e2e
npm run quality:check
```

内容域联调最小验证矩阵：

```bash
npm run check:content:http
```

说明：

1. 默认直接验证 `scene + list`
2. `resource / action` 需要在 `.env.local` 中补样本参数后才会继续验证
3. 详细口径见 [src/contracts/content-api.contract.ts](./src/contracts/content-api.contract.ts) 与 [backend-handoff/后端联调环境与启动说明.md](./backend-handoff/后端联调环境与启动说明.md)

如果是 Windows 首次配置质量工具：

```bash
npm run setup:quality:windows
```

## 6. 当前交付边界

当前 GitHub 联调源码仓默认保留：

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

当前不属于可运行 GitHub 联调源码仓交付范围的内容包括：

- `.tools/`
- `留档/历史记录/`
- 已送桶的旧历史入口（原 `审核与修改计划/`、`对话台账/`、`项目索引/`）
- `提交清单/` 内部内容，`README.md` 除外
- `新藏品/`
- 已送桶的旧历史总账入口（原 `项目台账.md`）
- 已送桶的旧回档目录（原 `备份/`）
- `垃圾桶/` 内部内容，`README.md` 除外
- 历史回档材料与冻结快照

正式保留/排除清单以：

- [源码交付白名单.md](./源码交付白名单.md)

为准。
