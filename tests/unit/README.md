# tests/unit

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录用于承载现行单元测试，当前已按源码主簇分组。

## 当前结构

1. `content/`
   - 内容域 provider、缓存、用户域与 HTTP/mock 相关单测。
2. `home/`
   - 首页 rails、首页壳层与首页局部 composable/shared runtime 相关单测。
3. `profile-asset-detail/`
   - 详情页 helper、state、runtime 与持久缓存相关单测。
4. `shared/`
   - 不专属于首页或详情页的共享工具类单测。

## 不应放入的内容

1. E2E 测试。
2. 一次性调试脚本。
3. 与测试无关的留档记录。
