# src/services/profile-asset-detail

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承载藏品详情页的领域级共享 service，主要负责详情内容装配与持久缓存 wrapper，不承载页面私有 runtime。

## 目录职责

1. 放置详情页内容装配与壳数据构建。
2. 放置详情页持久缓存读写 wrapper。

## 当前高层边界

1. `src/pages/profile-asset-detail/` 负责页面壳、page-local runtime、专属展示组件和 helper。
2. `src/services/profile-asset-detail/` 负责可被页面 runtime 复用的详情内容装配与缓存桥。
3. 本目录当前不反向依赖 `src/pages/profile-asset-detail/` 下的 page-local 实现。

## 当前内容

1. `profileAssetDetailContent.service.ts`
2. `profileAssetDetailPersistentCache.service.ts`

## 不应放入的内容

1. 详情页 page-local composable。
2. 首页 rail 逻辑。
3. 次级页 route query 解析。

## 当前状态

1. 本目录继续保留为详情页的稳定领域 service 锚点。
2. 本批不做物理迁移，也不把页面私有运行时继续回流到这里。
