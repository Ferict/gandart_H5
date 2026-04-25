# src/implementations/content.mock

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录用于承载内容域 mock provider 的具体分支实现。

## 目录职责

1. 放置 mock provider 的 `scene / resource / list / action` 分支实现。
2. 将 `src/mocks/content-db/` 中的静态数据组装成统一 port 返回值。

## 当前内容

1. `scene.ts`
2. `resource.ts`
3. `list.ts`
4. `action.ts`
5. `shared.ts`

## 不应放入的内容

1. 正式 http 实现
2. 页面运行时逻辑
3. 共享 UI 组件
