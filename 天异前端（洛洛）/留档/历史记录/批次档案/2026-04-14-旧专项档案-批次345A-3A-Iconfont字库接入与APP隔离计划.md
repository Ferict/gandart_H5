# 批次345A-3A Iconfont字库接入与 APP 隔离计划

## 本批目标

- 解决当前 `AetherIcon` 在非 H5 端缺少真实字库而导致的空白/方块字风险
- 将现有“所有非 H5 目标都走 Iconfont 分支”的宽口径，收紧为仅 `APP-PLUS` 走 Iconfont
- 为后续 `345A-4` 首页主面板与正式页高频图标迁移提供可交付前提

## 当前阻塞问题

1. 壳层已开始依赖 `AetherIcon`，但 `src/static/iconfont/aether-iconfont.css` 只有 class scaffold，没有 `@font-face` 和真实字体文件。
2. `AetherIcon.vue` 与 `aetherIcon.registry.ts` 现在用的是 `#ifndef H5`，这会把所有非 H5 目标都送进 Iconfont 分支，不符合既定的 `H5 / APP-PLUS` 编译时硬隔离方案。
3. 当前代码虽然 `type-check`、`build:h5` 通过，但只代表 H5 成立，不代表 App 打包壳成立。

## 计划范围

- `src/components/AetherIcon.vue`
- `src/utils/aetherIcon.registry.ts`
- `src/static/iconfont/`
- 必要时新增真实字库文件与对应说明
- `审核与修改计划/专项档案/`

## 计划拆分

### 345A-3A-1：真实 Iconfont 字库接入

- 在 `src/static/iconfont/` 接入真实 App 端可用的 Iconfont 字库文件
- `aether-iconfont.css` 补 `@font-face`
- 仅先覆盖 `P0` 壳层已在使用的图标集合：
  - `menu`
  - `x`
  - `chevron-right`
  - `house`
  - `activity`
  - `user-round`
  - `history`
  - `shield-check`
  - `wallet`
  - `user-plus`
  - `users`
  - `settings`
  - `sparkles`
- 要求：glyph 编码与 `aetherIcon.registry.ts` 保持一致，不允许口头映射

### 345A-3A-2：编译时隔离收紧

- `AetherIcon.vue`
  - 当前 `#ifndef H5` 改为 `#ifdef APP-PLUS`
- `aetherIcon.registry.ts`
  - 当前 `#ifndef H5` 改为 `#ifdef APP-PLUS`
- Web 侧（手机 Web / 电脑 Web）固定走 H5 lucide 分支
- App 壳侧固定走 Iconfont 分支
- 不在运行时做平台判断

### 345A-3A-3：批次复查与交付前提冻结

- 复查 `P0` 壳层图标在当前代码里都已对应真实 glyph
- 复查 `AetherIcon` 不再把其它非 H5 目标误送到 Iconfont 分支
- 复查后冻结结论：
  - 通过后，才允许进入 `345A-4`
  - 未通过前，`345A-4` 不得启动

## 需要避免出现的错误

- 继续只保留 glyph 和 class，占位不接真实字库
- 用 `#ifndef H5` 继续偷懒扩大 Iconfont 分支覆盖范围
- 在没有真实字库的情况下继续迁更多页面图标
- 新增字库时顺手改动页面视觉和业务逻辑
- 让 glyph 映射表与字体文件版本脱节

## 复查方式

- 复查 `aether-iconfont.css` 是否已补 `@font-face`
- 复查 `src/static/iconfont/` 是否已有真实字库文件
- 复查 `AetherIcon.vue` 与 `aetherIcon.registry.ts` 是否都已改成 `#ifdef APP-PLUS`
- 运行 `npm run type-check`
- 运行 `npm run build:h5`
- 结果写入台账，并明确注明：H5 已验证、App 端待基座验证

## 与后续批次关系

- `345A-4` 暂停，等待 `345A-3A` 完成
- `345A-5` 保留为 App 基座验证与是否继续扩替的判定批次
