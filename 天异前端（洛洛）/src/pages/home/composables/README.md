# src/pages/home/composables

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-13
> 说明：本目录用于承载首页 rail 专属的 page-local composable、helper 与局部运行时，当前已按业务轨道分组。

## 目录职责

1. 放置首页 `home / activity / profile` 三条 rail 的专属 query、refresh、result window、presentation runtime 等局部实现。
2. 收拢只服务于首页链路的局部状态机与桥接逻辑。
3. 通过子目录分组降低同类 composable 的人工检索成本。

## 当前结构

1. `activity/`
   - 活动公告 rail 专属 composable 与 helper。
2. `home/`
   - 首页市场 rail 与 track 展示专属 composable 与 helper。
3. `profile/`
   - 个人页 rail 专属 composable。
4. `shared/`
   - 仅供首页 rails 之间复用的 page-local shared composable。

## 不应放入的内容

1. 明显跨页面共享的 composable。
2. 正式接口实现。
3. 与首页无关的页面逻辑。
