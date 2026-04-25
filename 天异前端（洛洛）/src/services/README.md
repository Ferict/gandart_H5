# src/services

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-20
> 说明：本目录用于承载跨页面、跨业务或跨运行时层级共享的 service，当前已按职责簇分组。

## 蓝图定位

1. 本目录在 `P7.3` 长期蓝图中属于“稳定锚点”。
2. 本目录只承接领域共享运行时服务层，不承接页面私有实现层。

## 目录职责

1. 放置内容域装配、缓存、用户域、协调器与导航等共享 service。
2. 收口不适合挂在单一页面目录下的运行时逻辑。
3. 通过中等抽象目录降低一层平铺前缀检索成本。

## 当前结构

1. `content/`
   - 内容域 provider、缓存、用户域、详情解析等核心运行时。
2. `home-rail/`
   - 首页三条 rail 的内容解析、结果窗口、持久化、导航与协调器。
3. `home-shell/`
   - 首页壳层布局、菜单、DOM 与壳状态。
4. `profile-asset-detail/`
   - 详情页内容装配与持久缓存。
5. `app/`
   - 应用身份与环境标识。

说明：

1. `page-entry/` 已随独立占位入口拆线退出 `src/services/`，不再作为现行共享 service。
2. 页面 query 解析优先靠近对应页面 runtime；统一建设中文案靠近 `src/pages/updating/`。
3. 与内容接入链直接相关的新入口优先落到 `contracts / ports / implementations / adapters`，而不是回流到 `services/` 伪装成共享 service。

## 不应放入的内容

1. 单页面私有逻辑。
2. 共享组件。
3. mock 数据本体。
4. 与 `src/services/` 现有职责簇无关的新技术试验件。
