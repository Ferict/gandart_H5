# src

> 文档类型：目录入口
> 状态：active
> 更新时间：2026-04-20
> 说明：本目录承载当前现行前端源码。当前已经完成一轮目录分组治理，但仍处于旧技术分层向长期可维护结构过渡的阶段。

## 目录职责

本目录当前承载：

1. uni-app 页面壳与页面就近实现。
2. 跨页共享运行时逻辑、共享组件与共享模型。
3. 内容域接入链、mock 数据层与运行时静态资源。

本目录当前不承载：

1. 测试。
2. 正式规则正文。
3. 正式留档。
4. 垃圾桶与历史回档内容。

## 当前顶层结构

当前 `src/` 维持以下稳定锚点：

1. `pages/`
2. `services/`
3. `components/`
4. `composables/`
5. `mocks/`
6. `implementations/`
7. `contracts/`
8. `ports/`
9. `models/`
10. `stores/`
11. `utils/`
12. `adapters/`
13. `static/`

## 当前高层语义

1. 页面壳与 page-local runtime
   - `pages/`
2. 共享 UI 与共享前端运行时
   - `components / composables / models / stores / utils / static`
3. 领域级共享运行时
   - `services/*`
4. 内容接入链
   - `contracts / ports / implementations / adapters`
5. mock 与开发数据支撑
   - `mocks`

## 当前写入规则

1. 不再新增新的 `src/` 顶层技术目录。
2. 页面私有逻辑优先靠近对应 `pages/*`。
3. 只有真正跨页、跨领域的运行时能力才允许进入 root `services/`。
4. `contracts / ports / implementations / adapters` 继续只承接内容接入链相关新增，不继续横向扩散。
5. 页面私有 query、占位文案和建设中承载逻辑优先靠近对应 `pages/*`，不再放入 `services/page-entry/` 旁路线。
6. `settings / service-entry / action-entry / content-resource / profile-address / profile-assets / notice-detail` 已退出独立路由，未完成功能统一由 `pages/updating/` 承载。

## 主要参考

1. [规则体系/01-项目基线与目录规则.md](/H:/工作/天异/uniapp+vue新架构/规则体系/01-项目基线与目录规则.md)
2. [规则体系/04-前端实现规则.md](/H:/工作/天异/uniapp+vue新架构/规则体系/04-前端实现规则.md)
3. [留档/计划记录/2026-04-14-P7-仓级与src长期可维护性整编计划.md](/H:/工作/天异/uniapp+vue新架构/留档/计划记录/2026-04-14-P7-仓级与src长期可维护性整编计划.md)
4. [留档/计划记录/2026-04-14-P9-feature与runtime高层整编计划.md](/H:/工作/天异/uniapp+vue新架构/留档/计划记录/2026-04-14-P9-feature与runtime高层整编计划.md)
