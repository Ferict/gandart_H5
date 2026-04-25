# src/pages/profile-asset-detail/helpers

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录用于承载藏品详情页页面私有纯 helper 与小型流程装配。

## 目录职责

1. 放置详情页刷新 apply guard、page-open flow、hero-media 纯 helper。
2. 作为 runtime 的近邻依赖层，避免 helper 与页面壳继续平铺混放。

## 当前内容

1. `profileAssetDetailRefreshApplyGuard.ts`
2. `profileAssetDetailPageOpenFlow.ts`
3. `profileAssetDetailHeroMedia.ts`

## 不应放入的内容

1. 页面壳和展示组件。
2. 带持久状态的 runtime。
3. 跨页面共享的工具函数。
