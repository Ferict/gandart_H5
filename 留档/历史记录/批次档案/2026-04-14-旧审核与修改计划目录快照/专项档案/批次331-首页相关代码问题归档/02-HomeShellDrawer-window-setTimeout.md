# HomeShellDrawer.vue 问题摘录

问题：共享抽屉跳转仍使用浏览器对象 `window.setTimeout`。

```ts
 126: const handleEntryActivate = (routeUrl: string) => {
 127:   emitClose()
 128:   window.setTimeout(() => {
 129:     uni.navigateTo({ url: routeUrl })
 130:   }, 40)
 131: }
```

影响：

- 抽屉属于首页共享壳层组件，这条实现直接把它绑定到 H5 浏览器运行时。
- 非 H5 端后续复用时会是直接风险点。
