# HomeRailActivityPanel.vue 问题摘录

问题：活动页内容链加载缺少 `try/catch`。

```ts
 195: onMounted(async () => {
 196:   activityContent.value = await resolveHomeRailActivityContent()
 197:   syncActiveTag()
 198: })
```

对照：首页主面板当前已经做了失败兜底，这里没有同等错误处理。
