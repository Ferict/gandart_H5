# src/components

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承接跨页面共享的稳定 UI 组件，以及仅服务这些组件的同目录 runtime 或策略文件。

## 蓝图定位

1. 本目录在 `P7.3` 长期结构蓝图中属于稳定共享层。
2. 只有已经脱离单页、单 rail 私有语义的组件才可回流到这里。
3. 页面私有 section、结果区壳和 page-local 运行时不得继续放入本目录。

## 当前内容

1. 二级页与共享卡壳
   - `ConstructionPlaceholder.vue`
   - `SecondaryPageCard.vue`
   - `SecondaryPageFrame.vue`
   - `SecondaryPageTopbar.vue`
   - `StandalonePageScaffold.vue`
2. 共享交互与图片壳
   - `HomeInteractiveTarget.vue`
   - `homeInteractiveTarget.runtime.ts`
   - `HomeMarketCardImageReveal.vue`
   - `homeMarketCardImageReveal.runtime.ts`
   - `homeMarketCardImageReveal.cachePolicy.ts`
   - `HomeShellDrawer.vue`
   - `HomeShellNavRail.vue`
3. 基础图标
   - `AetherIcon.vue`

## 目录职责

1. 提供跨页面共享的稳定展示组件。
2. 承接已经从 `pages/*` 私有层回流的交互叶子组件。
3. 允许与共享组件强绑定的同目录 runtime、cache policy 或样式辅助文件共存。
4. 允许跨页面复用的稳定 shell 组件回流到这里。

## 不应放入的内容

1. 单页专属 section、results shell 或页面壳。
2. 业务 service、provider、contract、query runtime。
3. 只在某一条首页 rail 内使用的组件。
