# src/adapters

> 文档类型：目录说明
> 状态：active
> 更新时间：2026-04-24
> 说明：本目录现为内容域前端适配层真值入口；职责是把正式 contract DTO 归一化为 runtime/service 可稳定消费的内部模型，而不是继续保留空壳蓝图。

## 1. 当前定位

1. 本目录已从“长期蓝图预留层”切换为现行适配层。
2. `src/adapters/content/*` 负责承接 content domain 的 DTO 吸收、目标对象归一化和 UI-facing model 组装。
3. adapter 输出面向 `services/*`、runtime 和 page assembly，不直接面向组件模板。

## 2. 目录职责

1. 把 `src/contracts/content-api.contract.ts` 中的 DTO 转成前端稳定模型。
2. 把 transport / contract 语义挡在 adapter 之下，不让其继续下沉到 UI-facing model。
3. 为 `src/services/content/*`、`src/services/home-rail/*`、`src/services/profile-asset-detail/*` 提供纯函数归一化入口。

## 3. 当前不放什么

1. 页面私有 composable、runtime 或动画状态。
2. 共享 UI 组件、样式或视觉壳。
3. provider 选择、缓存持久化、分页调度等运行时编排逻辑。
4. 正式 contract 文本或 transport 实现。
