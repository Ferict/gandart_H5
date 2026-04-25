# 后端契约

> 文档类型：规则体系入口  
> 状态：active  
> 更新时间：2026-04-25
> 说明：本目录是当前项目“所使用、所对接”的正式后端契约总入口，承接从 `01-正式契约/` 迁入的完整契约资料；后续 `P11.12`、Gemini UI 二线程和任何新版后端接轨工作，都必须从这里读取，不再直接把根目录旧快照当成现行入口。

## 1. 目录定位

`规则体系/后端契约/` 的职责固定为：

1. 作为本项目当前正式对接后端契约的规则体系入口。
2. 承接从旧前端源码抽取得到的完整 transport contract、接口清单、差异线索和未确认项。
3. 为 `P11.12` 的新版后端契约适配提供唯一的项目级阅读入口。
4. 为 Gemini UI 二线程提供“可读但不可擅自扩写”的后端契约参照层。

本目录不是：

1. 页面直接消费的 view-model 目录。
2. 运行时 provider 配置目录。
3. 直接替代 `src/contracts/content-api.contract.ts` 的前端实现层文件夹。

## 2. 与现有正式实现链的关系

当前项目固定存在两层“契约真值”：

1. 项目级后端对接契约入口：`规则体系/后端契约/`
   - 表示“项目准备对接、整理并持续确认的正式后端契约层”
   - 用于对外沟通、后续适配、差异矩阵和字段确认
2. 当前前端实现层内容域契约：`src/contracts/content-api.contract.ts`
   - 表示“当前仓已接入内容域的前端实现真值源”
   - 用于现行 `content.port / content.mock / content.http / content.service` 运行链

当前关系口径固定为：

1. `规则体系/后端契约/` 是项目级“目标后端契约入口”。
2. `src/contracts/content-api.contract.ts` 是当前前端已落地内容域实现契约。
3. `P11.12` 负责把第 2 层逐步适配、收口到第 1 层。
4. Gemini UI 二线程只允许读取第 1 层做字段理解和缺口标注，不得擅自改写第 1 层，也不得把第 1 层未确认项直接打穿到 UI。

## 3. 当前目录结构

当前迁入资料包含：

1. `contracts/`
   - 旧源码证据可支撑的正式 transport contract 定义
2. `contracts/inferred/`
   - 推断层；只用于线索和待确认，不可视为已确认后端承诺
3. `_generated/`
   - 生成或抽取的中间产物
4. `api-inventory.md`
   - 接口总清单、状态、证据入口
5. `全量接口契约文档.md`
   - 面向后端维护同事的全量接口文档，集中列出全部接口、请求地址、请求字段、返回结构摘录、字段说明和风险
6. `后端维护接口契约交接文档.md`
   - 面向后端维护同事的最小阅读入口和中文摘要
7. `operation-usage-guide.md`
   - 面向前端接入的接口用途、旧前端消费位置、请求字段、已消费响应字段与风险说明
8. `field-usage-index.md`
   - 字段级用途索引，说明旧前端哪里读取字段、接入时能否稳定依赖
9. `frontend-consumption-index.md`
   - 旧前端页面、组件、模板和脚本的实际字段消费证据
10. `dataflow-ledger.md`
   - 运行时与数据流映射线索
11. `usage-index.md`
   - 消费侧证据索引
12. `unresolved.md`

- 未确认、待补证、接受风险项总表

13. `handoff-guide.md`

- 迁移前抽取产物的交接说明

14. `completion-statement.md`

- 抽取批次的完成声明

15. `p11.12.1-freeze.md`
    - `P11.12.1` 内部适配基线冻结记录
16. `p11.12.2-delta-matrix.md`
    - `P11.12.2` 当前前端内容域契约与项目级后端契约的差异矩阵
17. `p11.12.3-bridge-architecture.md`
    - `P11.12.3` 全量前端现用接口与后端契约接驳架构口径

补充说明：

1. 本目录正文树已于 2026-04-25 完成物理迁入，不再只是入口 README。
2. `contract-graph.json`、`_generated/contract-graph.json`、`verification-report.md`、`_generated/coverage-check.md` 中如果仍出现旧抽取路径，只表示历史抽取来源，不表示当前现行入口仍是旧目录。
3. 本目录承载“后端契约资料”，不承载真实 API 接口落地文件；真实 API 接口仍按 [05-接口与联调规则.md](/H:/工作/天异/uniapp+vue新架构/规则体系/05-接口与联调规则.md) 落到当前前端实现契约、port、implementation、service、handoff 和验证链。

## 4. 当前可直接使用的正式层

当前可作为“项目已收进规则体系、可直接拿来做适配”的正式层固定为：

1. `contracts/*.contract.ts`
2. `contracts/index.ts`
3. `api-inventory.md` 中 `status = confirmed` 的接口条目

这些内容可以用于：

1. 做新旧契约差异矩阵。
2. 做 adapter / runtime / service 的输入侧改造。
3. 做字段确认清单和接口接线优先级排序。

## 4.1 P11.12.1 当前冻结状态

`P11.12.1` 已将本目录冻结为后续适配的内部基线：

1. 冻结记录：[p11.12.1-freeze.md](/H:/工作/天异/uniapp+vue新架构/规则体系/后端契约/p11.12.1-freeze.md)
2. 冻结日期：2026-04-25
3. 冻结性质：`P11.12` 内部适配基线，不等同于后端最终签收。
4. 当前可用于差异矩阵的稳定 transport 层：`api-inventory.md` 中 `status = confirmed` 的 122 个接口。
5. 当前必须继续标识为待确认的层：68 个 `exported-unused` 接口、218 条 `unresolved` P3 accepted-risk、`contracts/inferred/*`。
6. 当前不直接替代 [src/contracts/content-api.contract.ts](/H:/工作/天异/uniapp+vue新架构/src/contracts/content-api.contract.ts)；二者在 `P11.12` 完成前并存。

## 4.2 P11.12.2 当前差异矩阵

`P11.12.2` 已建立当前差异矩阵：

1. 差异矩阵：[p11.12.2-delta-matrix.md](/H:/工作/天异/uniapp+vue新架构/规则体系/后端契约/p11.12.2-delta-matrix.md)
2. 矩阵性质：迁移设计输入，不是代码改造结果。
3. 核心结论：当前前端内容域是 5 个抽象聚合接口；项目级后端契约是 190 个旧 H5 具体业务 wrapper，不能一一直接替换。
4. 迁移方向：保留当前 content port/view-model，对后端具体 wrapper 做 implementation/adapter 组合映射。

## 4.3 P11.12.3 当前接驳架构

`P11.12.3` 已把后续接口结构改造收敛为全量接驳架构：

1. 接驳架构：[p11.12.3-bridge-architecture.md](/H:/工作/天异/uniapp+vue新架构/规则体系/后端契约/p11.12.3-bridge-architecture.md)
2. 架构性质：实现和迁移口径，不是新的后端 contract 正文。
3. 核心结论：不能让页面直连 190 个后端 wrapper；必须通过 backend implementation、DTO adapter、runtime/service 和 view-model 接到 UI。
4. 后续入口：先做全仓现用接口盘点，再做 provider/mock 过渡和分线迁移。

## 4.3.1 P11.12 口径与真实 API 的关系

`P11.12` 后续固定区分三份口径和真实 API 接口：

1. 后端口径：[06-项目后端契约现行使用口径.md](/H:/工作/天异/uniapp+vue新架构/规则体系/口径/06-项目后端契约现行使用口径.md)
   - 只回答“后端契约怎么读、后端证据怎么理解”。
2. 前端改造后口径：[08-P11.12前端改造口径.md](/H:/工作/天异/uniapp+vue新架构/规则体系/口径/08-P11.12前端改造口径.md)
   - 只回答“当前前端 UI 和 view-model 改造后要吃什么”。
3. 需要后端补充口径：[09-P11.12需后端补充口径.md](/H:/工作/天异/uniapp+vue新架构/规则体系/口径/09-P11.12需后端补充口径.md)
   - 只回答“需要后端补充、确认或会议拍板什么”。
4. 真实 API 接口
   - 不写在上述口径里，仍按 [05-接口与联调规则.md](/H:/工作/天异/uniapp+vue新架构/规则体系/05-接口与联调规则.md) 落到 `src/contracts`、`src/ports`、`src/implementations`、`src/services/content`、`backend-handoff` 和验证链。

阅读规则：

1. 判断后端契约和后端证据时，读后端口径。
2. 判断前端改造后要吃什么时，读前端改造后口径。
3. 判断缺什么、要问后端什么、要开什么会时，读需要后端补充口径。
4. 判断真实 API 是否落地时，查当前前端实现契约、port、implementation、service、handoff 和验证链，不查口径文件。

## 4.4 P11.12.3A0 最新版契约迁入状态

`P11.12.3A0` 已把外部专项的最新版正式契约迁入本目录：

1. 来源：`H:\工作\天异后端抽取专项\交付物\01-正式契约`
2. 完成声明时间：2026-04-24T18:19:17.292Z
3. 本轮新增关键接驳文档：
   - `operation-usage-guide.md`
   - `field-usage-index.md`
   - `frontend-consumption-index.md`
4. 最新完成声明固定结论：
   - wrapper coverage：190/190
   - live call resolution：185/185
   - confirmed field evidence：310/310
   - field usage documentation：445/445
   - operation usage documentation：190/190
   - frontend consumption documentation：1655/1655
   - P3 accepted-risk：218
5. 本轮未迁入 `_agent-reviews/`，该目录属于外部专项审查过程证据，不作为本项目当前契约正文。

执行口径：

1. `operation-usage-guide.md` 用来回答“接口支持什么、旧前端哪里用、接入风险是什么”。
2. `field-usage-index.md` 用来回答“字段具体在哪里被消费、能否稳定依赖”。
3. `frontend-consumption-index.md` 用来回答“旧前端页面和组件实际吃了哪些字段”。
4. 后续 `P11.12.3A` 全仓现用接口盘点必须以本轮最新版为输入，不再沿用迁入前旧统计。

## 5. 必须明显标识为未确认的层

以下内容一律视为“未确认层”，必须在后续适配中继续复核，不得当成已确认后端承诺：

1. `api-inventory.md` 中 `status = exported-unused` 的条目
   - 含义：wrapper 已导出，但未证明当前前端稳定使用
2. `unresolved.md` 全部条目
   - 含义：仍有风险、缺证据、缺响应样例、缺 wrapper 归属或缺真实消费证明
3. `contracts/inferred/*`
   - 含义：推断契约，仅作待确认线索
4. `usage-index.md` 中的 direct request / wrapper 外调用线索
   - 含义：说明旧仓存在调用痕迹，但不自动升级为 confirmed transport contract

后续确认规则固定为：

1. 有真实后端文档或真实后端响应样例。
2. 或有当前项目稳定消费证据。
3. 或由后端明确签收。

在满足上述任一条件前，必须继续把它们标成“待确认”。

## 6. 默认阅读顺序

后续任何人接新版后端契约时，默认阅读顺序固定为：

1. 本文件 `规则体系/后端契约/README.md`
2. `后端维护接口契约交接文档.md`
3. `全量接口契约文档.md`
4. `api-inventory.md`
5. `operation-usage-guide.md`
6. `field-usage-index.md`
7. `frontend-consumption-index.md`
8. `unresolved.md`
9. `contracts/index.ts`
10. 对应 `contracts/*.contract.ts`
11. 如需补线索，再看 `usage-index.md`、`dataflow-ledger.md`

禁止一上来直接把 `contracts/inferred/*` 当正式接口真值。

## 7. 与二线和 P11.12 的关系

Gemini UI 二线程固定执行口径：

1. 必须从本目录读取后端契约，而不是从零散旧目录自行拼。
2. 只允许把 confirmed 项当成稳定字段依据。
3. 遇到 `exported-unused`、`unresolved`、`inferred` 时，只能标缺口，不能直接写进 UI 结构。
4. 字段不足时停在 `adapter / runtime / service` 边界，交给 `P11.12` 主线。

`P11.12` 固定执行口径：

1. 以本目录为新版后端契约签收与冻结入口。
2. 以本目录为差异矩阵和 adapter 迁移基线。
3. 在适配推进过程中，继续回写哪些条目已确认、哪些仍待确认。

## 8. 旧目录状态

根目录 `01-正式契约/` 自本轮起只保留“历史快照”属性：

1. 用于追溯最初抽取与迁移来源。
2. 不再作为项目现行后端契约入口。
3. 后续如需引用，必须优先回链到本目录。

## 9. 禁止事项

1. 不得再把根目录 `01-正式契约/` 当作当前对接入口使用。
2. 不得把 `unresolved.md` 或 `contracts/inferred/*` 的内容直接写成已确认后端事实。
3. 不得让 Gemini 二线程绕过本目录，自行拼接新接口结构。
4. 不得让消费契约文替代本目录中的项目级后端契约入口。
