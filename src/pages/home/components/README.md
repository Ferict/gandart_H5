# src/pages/home/components

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-14
> 说明：本目录承接首页专属组件，当前按 `home / activity / profile / shared` 进行物理分组。

## 当前内容

1. 根层主壳
   - `HomeRailHomePanel.vue`
   - `HomeRailActivityPanel.vue`
   - `HomeRailProfilePanel.vue`
2. `home/`
   - `HomeRailHome*Section.vue`
   - `HomeRailHomeMarketCardShell.vue`
3. `activity/`
   - `HomeRailActivity*Section.vue`
4. `profile/`
   - `HomeRailProfile*Section.vue`
   - `HomeRailProfileAssetCardShell.vue`
5. `shared/`
   - `HomeActivityNoticeCard.vue`
   - `HomeRailListLoadingFooter.vue`
   - `HomeRailTopbar.vue`
   - `HomeShellTabbar.vue`
   - `HomeShellTrackStage.vue`

## 与 src/components 的边界

1. 仍明显属于首页私有语义的组件，继续保留在本目录。
2. 已被二级页或跨页面组件复用的交互叶子组件，回流到 `src/components/`。
3. 当前已回流的共享组件：
   - `HomeInteractiveTarget.vue`
   - `HomeMarketCardImageReveal.vue`
   - `HomeShellDrawer.vue`
   - `HomeShellNavRail.vue`

## 不应放入的内容

1. 业务 service、query runtime 或 provider。
2. 与首页无关的二级页组件。
3. 已跨出首页边界的稳定共享组件。
