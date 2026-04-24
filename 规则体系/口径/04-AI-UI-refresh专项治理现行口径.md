# 04-AI UI Refresh 专项治理现行口径

> 文档类型：现行口径
> 状态：active
> 更新时间：2026-04-24
> 说明：本文定义当前仓 AI UI Refresh 专项治理的现实基线、零视觉差约束、默认对象模型、默认验证路径、多子代理并行执行口径，以及后续真实视觉转化的设计语言准备口径；它是专项治理现状真值源，不代替长期规则正文。
> 上位规则：[规则体系/04-前端实现规则.md](/H:/工作/天异/uniapp+vue新架构/规则体系/04-前端实现规则.md)、[规则体系/05-接口与联调规则.md](/H:/工作/天异/uniapp+vue新架构/规则体系/05-接口与联调规则.md)、[规则体系/06-子代理协作规则.md](/H:/工作/天异/uniapp+vue新架构/规则体系/06-子代理协作规则.md)、[规则体系/07-文档与留档规则.md](/H:/工作/天异/uniapp+vue新架构/规则体系/07-文档与留档规则.md)

## 1. 适用范围

本文只适用于当前仓的 AI UI Refresh 零视觉差治理主线，以及后续被正式计划批准后的真实视觉转化准备口径，负责回答：

1. 当前仓的现实基线是什么。
2. 当前主线按什么对象模型治理。
3. 当前主线默认如何并行分工。
4. 当前主线明确不扩展到哪里。
5. 后续真实视觉转化在开放前必须满足哪些设计语言和证据门槛。

## 2. 当前现实基线

截至 2026-04-24，当前仓的现实基线固定为：

1. 当前项目是 `uni-app + Vue 3 + Vite` 正式工程。
2. 当前 `.vue` 文件总量为 56 个，其中 `src/pages/**` 45 个、`src/components/**` 10 个、`App.vue` 1 个。
3. 当前 `src/pages.json` 只注册 3 个正式页面：
   - `pages/home/index`
   - `pages/profile-asset-detail/index`
   - `pages/updating/index`
4. 当前仓不存在顶层 `docs/` 和 `docs/ai-ui-refresh/` 目录。
5. 当前正式请求链入口固定为：
   - `src/contracts/content-api.contract.ts`
   - `src/ports/content.port.ts`
   - `src/implementations/content.http.ts`
   - `src/implementations/content.mock.ts`
   - `src/services/content/content.service.ts`
   - `src/main.ts`
6. 当前 UI 文件未发现直接依赖 `src/contracts/`、`src/ports/`、`src/implementations/` 或直接调用 `uni.request` 的现行证据。
7. 当前 `src/adapters/` 仍是空壳目录，仅包含 `README.md` 与 `.gitkeep`，尚未满足“真实 adapter 层”要求。
8. 当前 `npm run build:h5` 可执行并通过；默认可复现 H5 构建路径以 `package.json` 中的 npm 脚本为准。

## 3. 当前最高约束

当前 AI UI Refresh 专项治理的最高约束固定为：

1. 本期不改视觉效果。
2. 本期按“零视觉差结构实施”推进。
3. 任何可见差异都按回归缺陷处理，而不是按“可接受的小优化”处理。

零视觉差约束固定包括：

1. 默认态不变
2. loading 态不变
3. empty 态不变
4. error 态不变
5. footer 视觉不变
6. drawer / sheet / topbar / tabbar 视觉不变
7. `profile-asset-detail` 卡片视觉不变
8. `updating` 承载页视觉不变

## 4. 默认对象模型

当前仓默认对象模型固定为：

1. `page-shell`
2. `panel`
3. `section`
4. `shared component`
5. `global component`

默认映射固定为：

1. `page-shell`
   - `home`
   - `profile-asset-detail`
   - `updating`
2. `panel`
   - `home / activity / profile`
3. `section`
   - `src/pages/home/components/home/*`
   - `src/pages/home/components/activity/*`
   - `src/pages/home/components/profile/*`
4. `shared component`
   - `src/pages/home/components/shared/*`
5. `global component`
   - `src/components/*`

supporting 运行时对象默认不单列为 UI unit，但必须挂到所属对象：

1. `src/pages/home/composables/**`
2. `src/pages/profile-asset-detail/runtime/**`
3. `src/pages/profile-asset-detail/helpers/**`
4. `src/services/home-rail/**`
5. `src/services/home-shell/**`
6. `src/services/profile-asset-detail/**`
7. `src/services/content/**`

## 5. 默认模式映射

外来 “AI UI Refresh Pipeline” 在当前仓中的默认映射固定为：

1. `Full Project Mode`
   - 当前仓全部允许纳入零视觉差治理的 `P0/P1/P2`
2. `Selected Pages Mode`
   - 支持按 `page / panel / section / component` 精确点选

当前阶段说明：

1. 两种模式当前只作为治理协议与执行口径存在。
2. 当前不创建正式 skill，不把 skill 作为本期终局。

### 5.1 当前 UI 转化默认执行模板

当前仓继续推进 UI 转化时，默认执行模板固定为：

1. `intake`
   - 明确目标对象、来源素材、可见变化边界和本轮是否仍受零视觉差约束
2. `classify`
   - 先映射到 `page-shell / panel / section / shared component / global component`
3. `write-set`
   - 先划 page-local 写入面、shared/global 锁定面和敏感路径禁入面
4. `structure-first`
   - 先搭结构、装配和稳定 props，不先碰 transport-only 语义
5. `placeholder-seam`
   - 契约未就绪时允许用稳定 view model、page-local placeholder 或受控 mock 承接展示，但不得升格成正式 contract
6. `contract-ready`
   - 后续新版后端契约接入时，优先替换 `adapter / mapper / runtime-service` 输入侧，不再次打穿 UI
7. `validate`
   - 本轮按 docs 或代码批执行最小验证，并回链留档

当前纠偏顺序固定为：

1. 先纠正对象归属和分层错误
2. 再纠正 UI 与请求链耦合
3. 最后再做后续可复用抽象

### 5.2 当前 skill 化准备口径

当前仓对未来 skill 化的准备口径固定为：

1. 当前仍不创建正式 skill，skill 不是本期终局。
2. 后续若做 skill，只允许封装当前已落盘的规则、口径和计划，不允许新增第二套现行说明。
3. 未来 skill 默认只暴露两种模式：
   - `Full Project Mode`
   - `Selected Pages Mode`
4. 未来 skill 必须默认读取：
   - `规则体系/04-前端实现规则.md`
   - `规则体系/口径/04-AI-UI-refresh专项治理现行口径.md`
   - `留档/计划记录/2026-04-24-P11.10-AI-UI-refresh终极版总规划-视觉冻结版.md`
5. 未来 skill 只能复用当前“零视觉差结构治理 -> 契约兼容 -> 后续再开放真实视觉刷新”的顺序，不得擅自扩大为自由视觉重做工具。

## 6. 当前正式接口与消费契约口径

正式后端接口真值仍只认：

1. `src/contracts/content-api.contract.ts`

当前 AI UI Refresh 过程中如需补页面消费说明，只允许：

1. 写“消费侧契约”
2. 写“字段使用置信度”

当前不允许：

1. 用消费契约替代正式契约
2. 擅自扩正式返回字段
3. 以视觉治理为理由改变正式 API 结构

当前后端契约读取入口补充固定为：

1. [规则体系/后端契约/README.md](/H:/工作/天异/uniapp+vue新架构/规则体系/后端契约/README.md)
2. [06-项目后端契约现行使用口径.md](/H:/工作/天异/uniapp+vue新架构/规则体系/口径/06-项目后端契约现行使用口径.md)

规则：

1. AI UI Refresh 与后续 UI 转化读取后端契约时，必须优先从上述两处进入。
2. 未确认项只能标缺口，不能直接变成 UI 结构依赖。

## 7. 当前敏感路径

当前默认敏感路径固定为：

1. `src/contracts/content-api.contract.ts`
2. `src/ports/**`
3. `src/implementations/**`
4. `src/services/content/**`
5. `src/main.ts`
6. `src/pages.json`
7. `src/manifest.json`
8. `src/stores/**`
9. `src/utils/**`

执行口径：

1. 普通视觉冻结批不得顺手改上述路径。
2. 触碰上述路径时必须单独立审查、立计划、立交付。

## 8. 当前多子代理并行口径

当前主线默认按以下方式并行：

1. explorer 波次只读
   - inventory
   - 消费契约抽取
   - tests 覆盖复核
2. worker 波次只在代码批启用
   - 写入集合必须互不重叠
3. 主控独占
   - 规则
   - 口径
   - 留档
   - shared/global 壳文件
   - 页壳最终接线

共享文件默认锁定：

1. `src/pages/home/index.vue`
2. `src/pages/home/components/shared/*`
3. `src/components/*`
4. `src/App.vue`
5. `src/uni.scss`
6. `src/main.ts`
7. `规则体系/*`
8. `规则体系/口径/*`
9. `留档/*`

## 9. 当前版本索引

当前 docs 治理批版本固定为：

1. `inventoryVersion = v1`
2. `contractMapVersion = v1`
3. `designProtocolVersion = v1`
4. `conversionProtocolVersion = v1`
5. `skillDerivationVersion = v1`

## 10. 当前默认验证路径

文档治理批固定验证：

1. `git diff --check`
2. `npm run lint:docs`

代码治理批固定验证：

1. `git diff --check`
2. `npm run type-check`
3. `npm run lint:eslint`
4. `npm run lint:style`
5. `npm run lint:format`
6. `npm run test:unit`
7. `npm run build:h5`

触碰 App 壳或平台配置时，再追加：

1. `npm run build:app`

## 11. 当前明确不扩展范围

在本期专项治理中，当前明确不扩展到：

1. 不新建顶层 `docs/`
2. 不新建顶层 `.codex/`
3. 不进行真实视觉刷新
4. 不把 draft skill 或正式 skill 作为本期终局
5. 不改正式后端契约结构
6. 不以“结构更干净”为理由引入可见视觉变化

## 12. P11.11 后续真实视觉转化准备口径

`P11.11` 是 `P11.10` 视觉冻结主线之后的设计语言提炼与外来 UI 转化治理入口。它不改变 `P11.10` 的零视觉差约束，不把本期治理扩大为自由视觉刷新。

当前 P11.11 正式计划入口固定为：

1. [2026-04-24-P11.11-天异设计语言提炼与外来UI转化治理计划.md](/H:/工作/天异/uniapp+vue新架构/留档/计划记录/2026-04-24-P11.11-天异设计语言提炼与外来UI转化治理计划.md)

### 12.1 设计方向声明

后续每次页面改造前，必须先写页面级设计方向声明。

设计方向声明至少说明：

1. 页面属于克制、内容优先、资产感、活动感、工具感或其他已裁决方向。
2. 用户第一眼应该看到的 3 个元素是什么。
3. 页面唯一主行动是什么。
4. 次行动如何避免抢主行动。
5. 外来 UI 中哪些信息结构被保留，哪些视觉风格被丢弃。

没有设计方向声明，不进入代码实现。

### 12.2 设计系统三件套

天异设计语言矩阵必须按以下五类整理：

1. `components`
   - 页面骨架、导航栏、卡片、按钮、标签、热区、空态。
2. `variables`
   - 色彩、spacing、radius、shadow、safe area、宽度基准。
3. `styles`
   - 字体层级、字重、英文 micro label、图片裁切、状态表达。
4. `patterns`
   - 首屏视线顺序、主行动、次行动、列表、详情、活动、资产感表达。
5. `copy`
   - 中文主导、英文辅助、AI 味文案禁用、业务活动文案规则。

每个条目必须标注推荐写法、禁止写法、现有样本、适用对象和验收方式。

### 12.3 三柱评审

后续真实视觉转化必须同时通过以下三类评审：

1. `frictionless`
   - 任务路径清晰，首屏视线顺序符合业务优先级，页面只有一个明确主行动。
2. `quality craft`
   - 字体、颜色、圆角、阴影、间距、图片和卡片语言能追溯到天异矩阵或现有样本。
3. `trustworthy building`
   - 空态、错误态、长文案、图片失败、窄屏、安全区和接口缺口处理可信。

只看“美不美”不算完成验收。

### 12.4 视觉证据优先

视觉证据是计划和验收的一部分，不是代码完成后的补充材料。

后续视觉转化至少保留：

1. 375 / 390 / 430 三档截图。
2. `home / profile-asset-detail / 目标页面` 并排对比。
3. 页面骨架、导航栏、卡片、媒体区、CTA、标签、热区、空态截图切片。
4. 每个关键视觉判断对应的源码位置或 token 来源。

没有视觉证据包，不进入设计语言矩阵定稿。

### 12.5 外来 UI 转化 brief

Gemini、Figma、截图、React、Pencil 或文字稿进入代码前，必须先形成外来 UI 转化 brief。

brief 至少包含：

1. 来源类型。
2. 目标对象：`page-shell / panel / section / shared component / global component`。
3. 保留内容：信息架构、内容优先级、交互意图、状态需求。
4. 丢弃内容：外来字体、导航栏、渐变、阴影、卡片语法、AI 文案。
5. 天异翻译：页面骨架、卡片、图片、CTA、热区。
6. 数据需求：已有 view model 字段、缺失字段、Level C 字段。
7. 写入集合和锁定集合。
8. 验收截图要求。

没有 brief，不进入代码；brief 未完成“外来 UI -> 天异语言”翻译，不进入代码。

### 12.6 skill 轻量化原则

未来如派生 skill，必须先满足：

1. 设计语言矩阵已落盘。
2. 当前抽签页样板改造已通过验收。
3. 外来 UI brief 至少试跑一次。
4. 规则、口径、计划、交付记录回链完整。
5. 未出现双口径或平行说明。

skill 只允许作为执行封装：

1. `SKILL.md` 只写触发条件、读取顺序、执行流程和停止条件。
2. 详细设计语言矩阵放入 references。
3. 必须准备 3 到 5 个真实 eval prompts。
4. skill 不承载现行真值源。
5. skill 与现行规则冲突时，以 `规则体系/`、`规则体系/口径/`、`留档/` 为准。

### 12.7 外部设计技能吸收边界

P11.11 可借鉴公开 GitHub 设计技能的方法，但只吸收机制，不照搬目录和创作模式。

当前吸收机制固定为：

1. 先定审美方向，再写代码。
2. 先识别 components、variables、styles，再组屏。
3. 设计评审必须覆盖任务路径、工艺质量和状态可信。
4. 视觉证据必须前置。
5. 外来 UI 必须先翻译成天异语言。
6. 后续 skill 必须轻量化并从现行规则派生。
