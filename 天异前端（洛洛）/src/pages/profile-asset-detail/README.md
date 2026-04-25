# src/pages/profile-asset-detail

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录用于承载藏品详情页入口、页面专属展示组件，以及页面私有 runtime/helper。

## 目录职责

1. 放置详情页页面壳 `index.vue`。
2. 放置详情页专属展示组件。
3. 放置详情页专属 runtime 与 helper，避免逻辑继续平铺在页面根目录。

## 当前内容

1. `index.vue`
2. `components/`
3. `runtime/`
4. `helpers/`

## 当前高层边界

1. 页面壳、page-local runtime、页面 helper 和专属展示组件留在本目录。
2. 详情内容装配与持久缓存 wrapper 留在 `src/services/profile-asset-detail/`。
3. 页面可以依赖 `models/profile-asset-detail/` 与 `services/profile-asset-detail/`，但不应把页面私有逻辑再沉回 service 层。

## 不应放入的内容

1. 跨页面共享组件。
2. 与详情页无关的首页运行时逻辑。
3. 正式接口 DTO 契约。

## 当前状态

1. 本目录继续作为详情页主锚点保留。
2. 本批不新增新的长期目录类型。
3. 后续高层整编优先继续清理页面私有逻辑与共享 service 的边界，不做无收益的大范围物理迁移。
