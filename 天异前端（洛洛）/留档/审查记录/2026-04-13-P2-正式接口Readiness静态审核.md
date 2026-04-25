# 2026-04-13 P2 正式接口 Readiness 静态审核

> 文档类型：审查记录  
> 状态：active  
> 更新时间：2026-04-13  
> 说明：本记录用于对当前 5 个正式接口做静态 readiness 审核，明确区分契约存在、前端已接线、联调入口已建立、验证链是否存在，以及真实联通是否已被证实。

## 1. 审核口径

本轮只做静态审核，不伪造真实后端联通结论。

本轮按 5 个维度逐条审核：

1. 正式契约
2. 前端 adapter
3. 后端/前端联调入口
4. 仓内验证链
5. 真实联通证据

状态定义固定为：

1. `是`
   - 当前仓内有明确证据
2. `部分`
   - 当前仓内只有间接或不完整证据
3. `否`
   - 当前仓内没有证据

## 2. 当前统一证据源

本轮统一采用以下证据源：

1. [接口契约/内容域接口总表.md](/H:/工作/天异/uniapp+vue新架构/接口契约/内容域接口总表.md)
2. [内容域后端统一移交说明.md](/H:/工作/天异/uniapp+vue新架构/内容域后端统一移交说明.md)
3. [content.http.ts](/H:/工作/天异/uniapp+vue新架构/src/implementations/content.http.ts)
4. [content-api.contract.ts](/H:/工作/天异/uniapp+vue新架构/src/contracts/content-api.contract.ts)
5. [content.port.ts](/H:/工作/天异/uniapp+vue新架构/src/ports/content.port.ts)
6. [content.http.spec.ts](/H:/工作/天异/uniapp+vue新架构/tests/unit/content.http.spec.ts)
7. [内容域联调说明.md](/H:/工作/天异/uniapp+vue新架构/接口契约/内容域联调说明.md)
8. [check-content-http-link.mjs](/H:/工作/天异/uniapp+vue新架构/scripts/check-content-http-link.mjs)

## 3. 分接口审核表

| 接口                                                | 正式契约 | 前端 adapter | 联调入口 | 验证链 | 真实联通证据 | 当前结论                                                            |
| --------------------------------------------------- | -------- | ------------ | -------- | ------ | ------------ | ------------------------------------------------------------------- |
| `GET /api/content/scene`                            | 是       | 是           | 是       | 是     | 否           | 静态可联调准备已具备，仓内已有最小 smoke 入口，但未证实真实后端联通 |
| `GET /api/content/resource`                         | 是       | 是           | 是       | 部分   | 否           | 契约与 adapter 已具备，缺专门的仓内最小验证链，真实联通未证实       |
| `GET /api/content/list`                             | 是       | 是           | 是       | 部分   | 否           | 契约与 adapter 已具备，缺专门的仓内最小验证链，真实联通未证实       |
| `POST /api/content/action/notice-read`              | 是       | 是           | 是       | 部分   | 否           | 契约与 adapter 已具备，缺专门的仓内最小验证链，真实联通未证实       |
| `POST /api/content/action/service-reminder-consume` | 是       | 是           | 是       | 部分   | 否           | 契约与 adapter 已具备，缺专门的仓内最小验证链，真实联通未证实       |

## 4. 逐项说明

### 4.1 `GET /api/content/scene`

当前证据：

1. 正式契约和后端说明都已明确列出该接口。
2. `content.http.ts` 已实际编码 `/api/content/scene`。
3. `check-content-http-link.mjs` 当前会对 `sceneId=home` 发起最小请求。

当前缺口：

1. 没有真实后端 URL，因此仍不能宣称已联通。

### 4.2 `GET /api/content/resource`

当前证据：

1. 正式契约和后端说明都已明确列出该接口。
2. `content.http.ts` 已实际编码 `/api/content/resource`。

当前缺口：

1. 当前验证链没有单独对 `resource` 做最小 smoke。
2. 没有真实后端 URL，因此仍不能宣称已联通。

### 4.3 `GET /api/content/list`

当前证据：

1. 正式契约和后端说明都已明确列出该接口。
2. `content.http.ts` 已实际编码 `/api/content/list`，并承接市场、公告、个人资产三类列表。

当前缺口：

1. 当前验证链没有单独对 `list` 做最小 smoke。
2. 没有真实后端 URL，因此仍不能宣称已联通。

### 4.4 `POST /api/content/action/notice-read`

当前证据：

1. 正式契约和后端说明都已明确列出该接口。
2. `content.http.ts` 已实际编码 `/api/content/action/notice-read`。
3. `content-api.contract.ts` 中已有对应 `actionType`。

当前缺口：

1. 当前验证链没有单独对动作接口做最小 smoke。
2. 没有真实后端 URL，因此仍不能宣称已联通。

### 4.5 `POST /api/content/action/service-reminder-consume`

当前证据：

1. 正式契约和后端说明都已明确列出该接口。
2. `content.http.ts` 已实际编码 `/api/content/action/service-reminder-consume`。
3. `content-api.contract.ts` 中已有对应 `actionType`。

当前缺口：

1. 当前验证链没有单独对动作接口做最小 smoke。
2. 没有真实后端 URL，因此仍不能宣称已联通。

## 5. 总结结论

当前 5 个正式接口的 readiness 结论是：

1. **正式契约：5/5 已具备**
2. **前端 adapter：5/5 已具备**
3. **统一联调入口：5/5 已具备**
4. **仓内验证链：1/5 完整，4/5 只有静态接线证据**
5. **真实联通证据：0/5**

因此当前最准确的表述是：

1. 当前仓已经从“只有契约和 mock”升级到“统一契约 + adapter + 联调入口 + 部分验证链”
2. 但还不能宣称 5 个正式接口都已被真实后端验证为可直接接入

## 6. 下一步建议

`P2` 后续建议固定为：

1. 如果拿到真实后端 URL，先补 `resource / list / action` 的最小 smoke
2. 再做一次带真实后端的 readiness 复核
3. 复核通过后，再允许把相关接口状态升级为“已真实联通”
