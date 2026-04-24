# src/pages/profile-asset-detail/runtime

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录用于承载藏品详情页页面私有 runtime/composable。

## 目录职责

1. 放置详情页 route、persistent、refresh、presentation、hero-media 等页面私有 runtime。
2. 为 `index.vue` 提供页面装配层依赖，不把页面私有时序继续平铺在根目录。

## 当前内容

1. `useProfileAssetDetailRouteState.ts`
2. `profileAssetDetailRouteQuery.ts`
3. `useProfileAssetDetailPersistentState.ts`
4. `useProfileAssetDetailRefreshController.ts`
5. `useProfileAssetDetailPresentation.ts`
6. `useProfileAssetDetailHeroMediaState.ts`

## 不应放入的内容

1. 纯展示组件。
2. 可跨页面复用的共享基础设施。
3. 持久化 service 和正式接口契约。
