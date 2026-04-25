# 2026-04-13 Git 根混淆修复：外层 worktree 子模块路径收口

> 文档类型：交付记录
> 状态：active
> 更新时间：2026-04-13 20:45:00
> 说明：本记录用于留存 “Git 根混淆与外层 worktree 子模块路径失配” 的修复结果、修复方式与验证结果。

## 1. 修复状态

1. 本问题已修复。
2. 修复目标不是改动应用仓本体，而是修正外层会话壳仓对子模块路径的损坏索引状态。

## 2. 修复前问题

1. 外层壳仓历史索引仍保留旧 gitlink：
   - `uniapp+vue 新架构`
2. 当前 `.gitmodules` 与实际目录已切到：
   - `uniapp+vue新架构`
3. 直接导致：
   - `git submodule status` 报 `fatal: no submodule mapping found in .gitmodules for path 'uniapp+vue 新架构'`

## 3. 修复方式

本次采用的是“修外层索引，不动应用仓内容”的方式，具体做法如下：

1. 先确认实际应用仓当前 HEAD：
   - `5768286a28efbfd9eae11973f11c1f799a8e6077`
2. 在外层壳仓先暂存 `.gitmodules` 当前配置。
3. 直接使用 `git update-index` 修外层壳仓索引：
   - 移除旧 gitlink 路径：
     - `uniapp+vue 新架构`
   - 以当前应用仓 HEAD 重新登记新 gitlink 路径：
     - `uniapp+vue新架构`

## 4. 修复后结果

1. 外层壳仓索引中不再同时存在旧路径和新路径两套 gitlink。
2. `git submodule status` 已恢复可执行，不再报 fatal。
3. 当前子模块状态能正常返回：
   - `-5768286a28efbfd9eae11973f11c1f799a8e6077 uniapp+vue新架构`

## 5. 验证

1. 外层壳仓执行：
   - `git submodule status`
     结果已正常返回。
2. 实际应用仓执行：
   - `git rev-parse --show-toplevel`
     结果仍为：
   - [H:\工作\天异\uniapp+vue新架构](/H:/工作/天异/uniapp+vue新架构/README.md)

## 6. 当前口径

1. 本应用唯一有效 `git` 根继续固定为：
   - [H:\工作\天异\uniapp+vue新架构](/H:/工作/天异/uniapp+vue新架构/README.md)
2. 外层壳仓虽已修复子模块路径失配，但仍只视为当前会话壳层，不作为本应用真实提交边界。
