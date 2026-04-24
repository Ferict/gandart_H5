# src/pages/home

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承载首页页面壳、page-local runtime、首页专属组件与样式。它是首页实现的主锚点，但不承担跨页面通用领域 runtime。

## 1. 目录职责

1. 存放首页页面壳与页面样式入口。
2. 存放首页专属组件和 page-local composable。
3. 就近承载首页三条 rail 的页面私有装配、展示派生和页面级交互。

## 2. 当前内容

1. `index.vue`
2. `index.scss`
3. `components/`
4. `composables/`

## 3. 当前高层边界

1. 页面壳、page-local runtime、页面私有展示层留在本目录。
2. 真正跨 `home / profile / activity` 复用的领域级 runtime 留在 `src/services/home-rail/`。
3. 跨页面共享的 UI 与共享交互壳应优先落到 `src/components/` 或 `src/composables/`，不继续堆回本目录。
4. 本目录允许依赖 `src/services/home-rail/`、`src/models/home-rail/` 等稳定锚点。

## 4. 不应放入的内容

1. 明显跨页面共享的组件或共享前端 runtime。
2. 与首页无关的业务实现。
3. 正式接口契约和内容接入链实现。
4. 仅因为“方便导入”而回流的领域级共享 service。

## 5. 当前状态

1. 本目录继续作为首页主锚点保留。
2. 本批不新建 `pages/home/features` 等新目录类型。
3. 后续高层整编优先继续清理 page-local 与跨 rail runtime 的边界，不做无收益的大范围物理迁移。
