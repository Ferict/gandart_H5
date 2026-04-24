# src/services/content

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录用于承载内容域核心运行时，包括 provider 装配、缓存、用户域与详情解析。

## 目录职责

1. 放置内容域 provider 接线与 port 设置。
2. 放置内容持久缓存、图片文件缓存与缓存运行时模式。
3. 放置内容用户域与资源详情解析。

## 当前内容

1. `content.service.ts`
2. `contentCacheRuntime.service.ts`
3. `contentImageFileCache.service.ts`
4. `contentPersistentCache.service.ts`
5. `contentResourceDetail.service.ts`
6. `contentUserScope.service.ts`

## 不应放入的内容

1. 首页 rail 协调逻辑。
2. 详情页 page-local composable。
3. 次级页 route query 构建逻辑。
