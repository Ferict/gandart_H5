# 2026-04-22 home-list-loading-footer 卡加载扩展审查

> 文档类型：审查记录
> 状态：active
> 更新时间：2026-04-22
> 说明：本记录针对首页下滑后 `.home-list-loading-footer.is-loading` 卡住问题做扩展审查，覆盖 footer 展示、分页请求、结果窗口、滚动触发、视口度量和测试覆盖；后续已补充现行口径，分页 loading 可见必须等同于当前有效分页加载链路存在。
> 审查目标：彻底根查“底部加载动画一直转、藏品不继续出现”的整条链路。
> 审查方式：主线程复核 + 子代理 Dewey 独立审查；本轮只审查和记录，不修改业务代码。
> 后续状态：已修复
> 修复或处置索引：[规则体系/口径/02-内容域运行时与加载现行口径.md](/H:/工作/天异/uniapp+vue新架构/规则体系/口径/02-内容域运行时与加载现行口径.md)；[2026-04-22-分页loading与自动重试状态机修复计划.md](/H:/工作/天异/uniapp+vue新架构/留档/计划记录/2026-04-22-分页loading与自动重试状态机修复计划.md)；[2026-04-22-分页loading与自动重试状态机修复交付.md](/H:/工作/天异/uniapp+vue新架构/留档/交付记录/2026-04-22-分页loading与自动重试状态机修复交付.md)

## 1. 自动化边界

1. 本次自动化等同于 Codex exec 模式下的扩展审查任务：先规划审查范围，再连续查到已规划的尽头。
2. 本次允许读取源码、规则、测试和运行只读验证命令。
3. 本次不允许做业务修复、不允许移动源码、不允许删除文件、不允许转入垃圾桶。
4. 停止条件：确认根因链路、确认非根因、确认测试覆盖缺口、落盘审查记录。
5. 若发现需要修改代码，必须先转为下一批修复计划，不在本轮审查中顺手改。

## 2. 审查范围

1. 共享 footer：`HomeRailListLoadingFooter.vue` 和 `homeRailListLoadingFooter.a11y.ts`。
2. 首页藏品结果窗口：`useHomeMarketResultWindow*` 系列。
3. 首页藏品远端分页状态：`useHomeMarketRemoteListState.ts`。
4. 首页滚动和视口度量：`useHomeTrackMountMetrics.ts`、`useHomeRailHomeEffects.ts`、`useHomeMarketResultWindowGeometryRuntime.ts`。
5. 复用同一 footer 的公告和个人藏品展示层：`useHomeRailActivityPresentationState.ts`、`useHomeRailProfilePresentationState.ts`。
6. 相关单测覆盖：`tests/unit/home/*` 中的 footer、分页、滚动和 load-state 测试。

## 3. 审查结论

`.home-list-loading-footer.is-loading` 不是根因，它只是 UI 渲染结果。真正问题在上游状态链：分页没有推进时没有明确终止语义，滚动 observer 是一次性 rAF 检查且早退后不自我重试，展示层又把“不是错误、不是结束”的状态默认显示为 loading。

本问题不是单点 CSS 或单个组件问题，不能只改 footer 动画。现行口径已固定为：分页 loading 动画的出现条件等同于分页加载行为的触发条件；用户看到分页 loading 时，系统语义固定为当前列表正在尝试获得更多内容。

## 4. 已确认根因

### 4.1 footer 默认把未知状态显示成 loading

[useHomeMarketResultWindowPresentationRuntime.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketResultWindowPresentationRuntime.ts:93) 中 `shouldRenderHomeBottomFooter` 只看 `displayedCollection.length > 0`。

[useHomeMarketResultWindowPresentationRuntime.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketResultWindowPresentationRuntime.ts:95) 中 `homeBottomFooterMode` 只有三种结果：错误、结束线、默认 loading。它没有判断当前是否真的在请求分页，也没有“等待触发 / 空闲 / 无进展”状态。

结果是：只要页面已有藏品、仍认为还有更多、没有错误、没有结束线，就会进入 `.home-list-loading-footer.is-loading`。

### 4.2 分页返回无新增时没有终止语义

[useHomeMarketRemoteListState.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketRemoteListState.ts:214) 的 `notModified` 分支直接返回 `false`。

[useHomeMarketRemoteListState.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketRemoteListState.ts:221) 的去重后无新增分支只更新 `page / total / etag`，随后返回 `false`。

[useHomeMarketResultWindowLoadMoreRuntime.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketResultWindowLoadMoreRuntime.ts:84) 收到 `didAppend === false` 后直接退出。这个退出不会把结果窗口切到 exhausted，也不会设置 pagination error，也不会明确安排下一次观察。

结果是：如果后端、假后端或 mock 返回空页、重复页、304，且 `total` 仍大于当前数量，前端会长期处在“看起来还有更多，但没有新增内容”的状态。

### 4.3 load-more observer 早退后不自我重试

[useHomeMarketResultWindowGeometryRuntime.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketResultWindowGeometryRuntime.ts:263) 的 `scheduleMarketLoadMoreObserver` 实际是一次 `requestAnimationFrame` 检查，不是持续 observer。

它在以下情况会直接早退：面板不活跃、没有更多、正在过渡、正在 load more、列表正在 loading、视口度量未就绪。

[useHomeMarketResultWindowGeometryRuntime.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketResultWindowGeometryRuntime.ts:281) 中 `scrollMetrics?.isReady` 未就绪时直接返回，函数本身没有重试。

结果是：如果这一次检查发生在视口还没准备好、DOM 尺寸还没稳定、或分页状态刚好在 loading，后续必须依赖 watcher 或滚动事件再次触发；一旦没有再次触发，就会停在 footer loading。

### 4.4 进入动画队列可能出现无 mountedQueueIds 的卡住风险

[useHomeMarketResultWindowLoadMoreRuntime.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketResultWindowLoadMoreRuntime.ts:112) 先计算 `mountedQueueIds`，随后 [useHomeMarketResultWindowLoadMoreRuntime.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketResultWindowLoadMoreRuntime.ts:118) 把 `marketTransitionPhase` 设置为 `entering`。

但只有 [useHomeMarketResultWindowLoadMoreRuntime.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/home/useHomeMarketResultWindowLoadMoreRuntime.ts:155) 的 `mountedQueueIds.size > 0` 分支会安排进入动画结束后的 `idle` 回收。

如果追加出来的新项没有进入 mounted window，理论上存在 `marketTransitionPhase` 留在 `entering` 的风险。该状态会阻止后续 load more 触发。

## 5. 扩展影响

1. 公告和个人藏品也复用了同一个 `HomeRailListLoadingFooter`。
2. [useHomeRailActivityPresentationState.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/activity/useHomeRailActivityPresentationState.ts:86) 同样是错误、结束线、默认 loading。
3. [useHomeRailProfilePresentationState.ts](/H:/工作/天异/uniapp+vue新架构/src/pages/home/composables/profile/useHomeRailProfilePresentationState.ts:75) 同样是错误、结束线、默认 loading。
4. 所以 footer 状态设计问题不是首页独有；首页藏品只是更容易触发，因为它同时有远端分页、可视窗口和滚动触发。

## 6. 非根因

1. `.home-list-loading-footer.is-loading` 样式本身不是根因，它只是收到 `mode="loading"` 后渲染动画。
2. 不是单纯 CSS 卡住，也不是动画卡死。
3. 不是只查“组件有没有挂上”就能解决的问题；组件挂上只能说明 UI 在展示 loading，不能说明请求仍在跑。
4. 当前 `homeMarketPrefetch.util.ts` 已经不是简单只看 `displayedCollection` 的旧口径，它会参考更大的逻辑尾部数量；这不是本次首要根因。

## 7. 测试覆盖缺口

1. `homeRailListLoadingFooter.spec.ts` 只验证 a11y helper，没有验证 footer mode 从业务状态到组件 class 的链路。
2. `useHomeMarketResultWindowPresentationRuntime.spec.ts` 没有覆盖“loading 可见时必须存在当前有效分页加载链路”的场景。
3. `useHomeMarketResultWindowLoadMoreRuntime.spec.ts` 没有覆盖 `loadMoreMarketListPage()` 返回 `false` 后应如何终止或重试。
4. `useHomeMarketRemoteListState.spec.ts` 没有覆盖 load more 的 `notModified / 空页 / 重复页` 终止行为。
5. `useHomeTrackMountMetrics.spec.ts` 已覆盖滚动事件保留 viewport 高度，但没有覆盖 `isReady=false` 后 observer 如何重新触发。
6. 缺少跨链路测试：分页无新增时 footer 必须进入无新增自动重试链路，并在停止条件命中后退出 loading。

## 8. 本轮验证

已执行：

```powershell
npm run test:unit -- tests/unit/home/useHomeMarketResultWindowPresentationRuntime.spec.ts tests/unit/home/useHomeMarketResultWindowLoadMoreRuntime.spec.ts tests/unit/home/useHomeMarketRemoteListState.spec.ts tests/unit/home/homeRailActivityPanel.loadState.spec.ts tests/unit/home/useHomeTrackMountMetrics.spec.ts
```

结果：5 个测试文件通过，17 个测试通过。

该结果只能说明现有覆盖未失败，不能证明卡加载问题已解决。现有测试没有覆盖本次确认的卡住链路。

## 9. 子代理审查同步

子代理：Dewey。

子代理结论与主线程一致：

1. 高风险：`loadMoreRemoteMarketListPage()` 对空页、重复页、304 没有明确终止语义。
2. 高风险：load-more observer 是一次性 rAF 检查，早退后没有自我重试。
3. 中风险：footer mode 只有 `loading / error / endline`，默认 loading 会放大上游卡住问题。
4. 非根因：`.home-list-loading-footer.is-loading` 本身不是原因。

## 10. 下一批修复计划

后续执行状态：已按本节转为正式修复计划并完成交付，详见 [2026-04-22-分页loading与自动重试状态机修复交付.md](/H:/工作/天异/uniapp+vue新架构/留档/交付记录/2026-04-22-分页loading与自动重试状态机修复交付.md)。

建议下一批按以下顺序修：

1. 修 `useHomeMarketRemoteListState.ts`：把空页、重复页、304 这类“无新增”结果从模糊的 `false` 改成明确结果，并接入现行口径中的无新增自动重试链路。
2. 修 `useHomeMarketResultWindowLoadMoreRuntime.ts`：当分页无新增时不能静默退出后继续让 footer loading；必须进入无新增自动重试、endline 或 error。
3. 修 `useHomeMarketResultWindowGeometryRuntime.ts`：视口未就绪或早退时要有重试入口，不能一次 rAF 失败后完全静默。
4. 修 footer mode 绑定：`.home-list-loading-footer.is-loading` 可见时，必须能追踪到当前有效分页加载链路，且链路状态属于现行口径定义的 loading 状态。
5. 同步复查公告和个人藏品的 footer 默认 loading 口径，避免修完首页后另外两个入口仍出现同类问题。
6. 补单测覆盖：分页空页、重复页、304、observer 未就绪重试、loading 可见即存在当前有效分页加载链路。

## 11. 本轮没有做什么

1. 未修改业务源码。
2. 未修改测试源码。
3. 未移动任何目录。
4. 未执行任何删除操作。
5. 未把任何内容转入垃圾桶。
