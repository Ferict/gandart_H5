# HomeRailProfilePanel.vue 问题摘录

问题：个人中心金刚区直接复用 drawer 的 routeUrl，来源标识会一直是 `shell-drawer`。

```ts
 241: const profileQuickActions = computed<HomeShellDrawerEntry[]>(() => {
 242:   return drawerEntries.value.filter((entry) => entry.id !== 'community' && entry.id !== 'settings')
 243: })
```

```ts
 289: const handleQuickEntryClick = (url: string) => {
 290:   safeNavigate(url)
 291: }
```

说明：

- 这里没有重新生成 `profile` 语义下的 route/source。
- 直接沿用 drawer entry 里提前做好的 `routeUrl`。
