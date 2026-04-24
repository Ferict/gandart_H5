# src/services/home-rail

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承载首页三条 rail 的领域级共享 runtime。它服务 `home / profile / activity` 三条内容链，但不回流页面私有模板、页面私有 effects 或 page-local composable。

## 1. 目录职责

1. 存放三条 rail 共享的内容解析与场景内容 service。
2. 存放结果窗口、mounted-window、reload policy、静默更新协调等跨 rail runtime。
3. 存放三条 rail 共用的持久化集成、导航桥和已读状态桥。

## 2. 当前内容

1. `homeRailActivityContent.service.ts`
2. `homeRailHomeContent.service.ts`
3. `homeRailNavigation.service.ts`
4. `homeRailPageReloadPolicy.service.ts`
5. `homeRailPersistentCacheIntegration.service.ts`
6. `homeRailProfileContent.service.ts`
7. `homeRailResultMountWindow.service.ts`
8. `homeRailResultWindow.service.ts`
9. `homeRailUpdateCoordinator.service.ts`
10. `homeNoticeState.service.ts`

## 3. 当前高层边界

1. `src/pages/home/` 负责页面壳、page-local runtime、就近组件和页面样式。
2. `src/services/home-rail/` 负责真正跨 `home / profile / activity` 复用的领域级共享 runtime。
3. `src/models/home-rail/` 负责三条 rail 的共享模型定义。
4. 页面可以依赖本目录；本目录不应反向依赖 `src/pages/home/` 下的 page-local 实现。

## 4. 不应放入的内容

1. 页面模板适配、模板 ref、UI 展示派生。
2. 只服务单一 panel 的 page-local composable 或 page-local runtime。
3. 详情页专属缓存、详情页 page-open 装配和详情页展示逻辑。
4. 与首页 rail 无关的新业务 service。

## 5. 当前状态

1. 本目录继续保留为稳定的领域级共享 runtime 锚点。
2. 本批不做物理迁移，也不再把页面私有逻辑继续塞进本目录。
3. 后续如果继续推进高层整编，优先治理的是“页面私有逻辑不要回流到这里”，而不是先拆掉本目录本身。
