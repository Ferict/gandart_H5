# HomeRailProfilePanel.vue 加载问题摘录

问题：个人中心内容链加载缺少 `try/catch`。

```ts
 318: onMounted(async () => {
 319:   void ensureHomeShellMenuReminderHydrated()
 320:   content.value = await resolveHomeRailProfileContent()
 321:   syncProfileFilters()
 322: })
```

影响：

- 内容服务失败时会直接抛未处理 rejection。
- 和首页主面板当前的错误处理口径不一致。
