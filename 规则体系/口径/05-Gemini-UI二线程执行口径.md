# 05-Gemini UI 二线程执行口径

> 文档类型：现行口径
> 状态：active
> 更新时间：2026-04-24
> 说明：本文件用于约束 Gemini UI 转化二线程的工作方式、写入边界、git 分类、停点条件和与主线的交接方式；目标是让二线程按既定形式工作，避免返工、越界和把视觉稿直接打穿到正式契约链。

## 1. 适用范围

本口径只适用于以下工作：

1. 外来 UI 转化
2. Gemini 稿、Figma 稿、截图稿、React 稿转化
3. 设计语言对齐后的 page-local 视觉改造
4. 视觉证据包、转化 brief、设计语言矩阵落地

本口径不处理：

1. 正式后端契约改造
2. provider 切换
3. `src/contracts/**`、`src/ports/**`、`src/implementations/**`、`src/services/content/**` 主链改造
4. 当前主线之外的结构级重构
5. 未经单独立项的 shared/global 大范围改造

## 2. 二线程角色定位

Gemini UI 二线程的角色固定为：

1. 把外来 UI 素材翻译成天异自己的页面语言
2. 在既有信息架构和既有 view-model 边界内完成视觉转化
3. 只做被批准写入面的页面或局部分区，不接管正式接口链
4. 发现字段缺口时停在 adapter/runtime/view-model 边界，不向 UI 硬塞新字段

Gemini UI 二线程不是：

1. 正式后端契约设计者
2. 接口接入主线执行者
3. 全局组件库重写者
4. 共享壳或全局视觉语言的默认 owner

## 3. 开工前必须补齐的四件套

Gemini 二线程在写代码前，必须先补齐以下四件事：

1. `设计方向声明`
   - 说明本页属于什么设计方向，例如克制、资产感、活动感、工具感
   - 写清首页首屏应该先看见什么、唯一主行动是什么
2. `外来 UI 转化 brief`
   - 写清来源类型、目标对象、保留内容、丢弃内容、天异翻译策略、数据需求、写入集合、锁定集合
3. `视觉证据`
   - 至少保留 375 / 390 / 430 三档截图或并排证据
   - 写清本页与现有天异样板页的相似性依据
4. `git 分类`
   - 明确这一批属于 docs-only、page-local visual、shared/global visual、tests-only 或 mixed-forbidden 中的哪一类

没有这四件套，不进入代码实现。

## 4. 固定写入边界

Gemini 二线程默认只允许写入以下集合中的一个局部面：

1. 某个单页的 `.vue`
2. 该页 page-local helper / type / constants
3. 该页 page-local runtime / presentation / view-model 适配层
4. 该页对应的 tests
5. 该页对应的审查、计划、交付留档

Gemini 二线程默认禁止写入：

1. `src/contracts/**`
2. `src/ports/**`
3. `src/implementations/**`
4. `src/services/content/**`
5. `src/main.ts`
6. `src/pages.json`
7. `src/manifest.json`
8. `src/components/*`
9. `src/uni.scss`
10. `src/pages/home/components/shared/*`
11. `规则体系/*`
12. `规则体系/口径/*`

如果二线程判断“必须改这些文件才能继续”，默认处理方式不是继续改，而是：

1. 停止当前批次
2. 把阻塞点写进 brief / 审查 / 交付
3. 把问题交回共享壳主线或后端契约主线

## 5. 外来 UI 转化的正确流程

Gemini 二线程固定按以下顺序执行：

1. `识别来源`
   - Gemini / Figma / 截图 / React / Pencil / 文字稿
2. `翻译对象`
   - 映射到 `page-shell / panel / section / shared component / global component`
3. `保留 / 丢弃`
   - 保留信息架构、状态需求、交互语义
   - 丢弃外来导航壳、外来卡片语言、无来源英文堆叠、AI 风格装饰
4. `写入集合判定`
   - 优先 page-local
   - shared/global 需要单独立项，不能顺手突破
5. `数据边界判定`
   - 只吃当前稳定 view-model
   - 字段不足时停在 runtime / adapter，不在模板里硬写新字段
6. `实现`
   - 只做当前批准的页面或分区
7. `验证`
   - 视觉证据、宽度验证、状态验证、git 边界验证
8. `留档与提交`
   - 独立交付、独立提交、独立回填

## 6. 数据与接口口径

Gemini 二线程必须按以下数据口径工作：

1. 页面只消费稳定 view-model
2. 不直接理解 DTO
3. 不直接理解 envelope、HTTP 状态码、provider、分页协议、重试预算
4. 不直接 import `src/contracts/**`、`src/ports/**`、`src/implementations/**`
5. 发现字段缺口时，只能写成：
   - 当前已有字段
   - 当前 `Level A / Level B` 可稳定消费字段
   - 当前需要后端契约主线处理的 `Level C` 缺口

对于 page-local 假数据，默认规则固定为：

1. 假数据真值不长留在页面模板内
2. 假数据应进入统一 mock 域或 page-local runtime seam
3. 页面只从 port / runtime / service 输入侧拿稳定结果
4. 后续接真实后端时，优先替换 adapter / runtime / service 输入侧

## 7. Git 分类与提交规则

Gemini 二线程必须先给当前改动分类，再开工。固定分类如下：

1. `docs-only`
   - 只改计划、审查、交付、brief、口径补充、视觉证据记录
   - 提交前缀：`docs(...)`
2. `evidence-only`
   - 只补视觉证据、截图索引、设计语言比对记录
   - 提交前缀：`docs(...)`
3. `page-local visual`
   - 只改单页 `.vue`、该页 page-local helper/runtime/test
   - 不带 shared/global
   - 提交前缀：`feat(...)`
4. `page-local structure`
   - 只改 page-local runtime / adapter / mapper / tests
   - 视觉应保持等效
   - 提交前缀：`refactor(...)`
5. `shared/global visual`
   - 只在单独计划中处理共享壳或全局组件
   - 不得和 page-local 批混做
   - 提交前缀：`feat(...)`
6. `backend-adaptation`
   - 属于 `P11.12` 主线
   - 不属于 Gemini 二线程默认 ownership
   - 提交前缀：`refactor(...)` / `feat(...)`
7. `tests-only`
   - 只补测试、smoke、source guard、截图比对守卫
   - 提交前缀：`test(...)`

固定禁止项：

1. `docs-only` 里混源码
2. `page-local visual` 里混 shared/global
3. `visual` 批里混正式契约改动
4. `backend-adaptation` 批里顺手改视觉
5. 多个已完成分类长期堆在一个未提交工作树里

## 8. 合规不返工的执行要求

为了避免返工，Gemini 二线程必须做到：

1. 先写 brief，再写代码
2. 先定 write-set，再开改
3. 先查当前现行口径，再定样式
4. 先确认字段够不够，再画信息块
5. 只在 page-local 内解决的问题，不上升到 shared/global
6. 凡是会影响后续新版后端契约接轨的结构，优先停在 adapter/runtime/service 输入侧，不往 UI 深处固化

## 9. 需要立刻停止的情况

命中以下任一情况，Gemini 二线程必须停：

1. 需要改正式契约
2. 需要改 provider seam
3. 需要改共享壳或全局组件，但当前批没有单独授权
4. 需要新增 UI 当前未消费的新字段
5. 需要修改现有交互语义
6. 需要修改 `src/pages.json`
7. 当前批的 git 分类开始混乱
8. 当前批次已经不再是单页或单分区 ownership

## 10. 与后端契约主线的交接方式

Gemini 二线程与后端契约主线的交接规则固定为：

1. Gemini 负责视觉转化和 page-local 装配
2. `P11.12` 负责现有 UI 适配新版后端契约
3. Gemini 发现字段缺口时，不自己设计接口
4. Gemini 只提交：
   - 需要的字段
   - 当前页面为什么需要它
   - 当前页面在哪个 view-model 边界被阻塞
5. 由 `P11.12` 决定：
   - adapter 怎么变
   - runtime/service 怎么接
   - mock/http/provider 怎么切

## 11. 完成后汇报模板

Gemini 二线程每批完成后，必须至少汇报：

1. 当前批 git 分类
2. 实际写入文件
3. 实际未写入但被锁住的文件
4. 已跑验证
5. 是否有字段缺口
6. 是否达到本批已规划尽头
7. 下一步建议入口

## 12. 回链

上位入口固定回链为：

1. `规则体系/口径/04-AI-UI-refresh专项治理现行口径.md`
2. `留档/计划记录/2026-04-24-P11.11-天异设计语言提炼与外来UI转化治理计划.md`
3. `留档/计划记录/2026-04-24-P11.12-UI适配新版后端契约总规划.md`
