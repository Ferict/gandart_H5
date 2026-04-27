# gandart_H5

> 天异艺术 H5 纯净源码仓
> 适用对象：前端开发、联调、CI

## 1. 仓库定位

本仓只保留：

1. 前端运行源码与静态资源
2. 测试、工程脚本与 GitHub CI
3. 当前前端实现真实消费的接口契约代码

本仓不保留：

1. 规则体系、留档和流程文档
2. handoff、参考索引和内部交付材料
3. AI 评测、语义规则和仓内治理资产

## 2. 关键目录

- `src/`
  - 当前前端正式源码
- `tests/`
  - 单元测试与 E2E
- `scripts/`
  - 工程脚本与质量检查入口
- `.github/`
  - GitHub Actions 工作流

当前前端实现接口契约入口：

- `src/contracts/content-api.contract.ts`

## 3. 本地开发

安装依赖：

```bash
npm install
```

启动 H5：

```bash
npm run dev:h5
```

固定端口启动：

```bash
npm run dev:h5:5180
```

## 4. 常用检查

```bash
npm run type-check
npm run lint
npm run test:unit
npm run test:e2e
npm run quality:check
```

内容域联调最小验证矩阵：

```bash
npm run check:content:http
```

Windows 首次补齐本地质量工具：

```bash
npm run setup:quality:windows
```

## 5. 说明

这是一个面向发布和联调的纯净源码仓。
规则、审查、计划和其他治理资料留在主工作仓维护，不再同步到这里。
