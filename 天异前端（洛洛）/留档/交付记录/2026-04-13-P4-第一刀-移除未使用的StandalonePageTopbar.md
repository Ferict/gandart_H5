# 2026-04-13 P4 第一刀 移除未使用的 StandalonePageTopbar

> 文档类型：交付记录
> 状态：active
> 更新时间：2026-04-13
> 说明：本记录用于收口 `P4` 的第一刀，移除经 `knip + 全仓搜索` 共同证明未被现行链路引用的 `StandalonePageTopbar.vue`。

## 1. 本轮动作

本轮已完成：

1. 删除 [StandalonePageTopbar.vue](/H:/工作/天异/uniapp+vue新架构/src/components/StandalonePageTopbar.vue)

## 2. 删除依据

删除依据固定为：

1. `npm run knip` 报告其为未使用文件。
2. 全仓搜索 `StandalonePageTopbar` 无现行引用命中。
3. 同目录现行链路已有 [SecondaryPageTopbar.vue](/H:/工作/天异/uniapp+vue新架构/src/components/SecondaryPageTopbar.vue)。

## 3. 本轮边界

本轮不做：

1. 不清理 `SecondaryPageTopbar.vue`
2. 不顺手整理其他组件
3. 不把 `P4` 扩成 `src/` 结构治理批次

## 4. 验证结果

本轮验证结果：

1. `npm run knip` 重跑通过
2. 本轮未再出现新的 `Unused files`
