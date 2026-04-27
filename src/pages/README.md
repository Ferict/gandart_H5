# src/pages

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-20
> 说明：本目录用于承载 uni-app 页面入口及页面就近实现。

## 蓝图定位

1. 本目录在 `P7.3` 长期蓝图中属于“稳定锚点”。
2. 本目录承担页面入口与页面私有实现层，不承担跨页共享层职责。

## 目录职责

1. 放置各页面路由入口。
2. 在过渡阶段承载页面私有组件、composable、helper 与装配逻辑。
3. 仅保留真实页面入口和统一未完成功能承载页；不再为同类占位功能新增独立页面壳。

## 当前内容

1. `home/`
2. `profile-asset-detail/`
3. `order/`
4. `settings/`
5. `updating/`

说明：

1. `order/` 是个人中心“我的订单”聚合页入口。
2. `updating/` 是当前唯一统一建设中承载页。
3. `settings/` 是个人中心设置入口对应的独立二级页。
4. `service-entry / action-entry / content-resource / profile-address / profile-assets / notice-detail` 已退出注册路由，不再作为现行页面入口。

## 不应放入的内容

1. 真正跨页面共享的组件
2. 正式接口契约
3. 与具体页面无关的共享工具
4. 新的 root 级业务 service 或试验性旁路线
5. 只包一层“建设中”的独立占位页壳
