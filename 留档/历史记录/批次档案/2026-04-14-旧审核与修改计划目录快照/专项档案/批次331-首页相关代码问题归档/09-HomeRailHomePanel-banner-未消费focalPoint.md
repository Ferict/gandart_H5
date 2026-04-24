# HomeRailHomePanel.vue 摘录

问题：banner 页面层当前未消费 `focalPoint`，仍是统一的 `aspectFill + cover`。

```vue
  20:                 <image
  21:                   v-if="item.imageUrl"
  22:                   class="home-banner-bg"
  23:                   :src="item.imageUrl"
  24:                   mode="aspectFill"
  25:                 />
```

```scss
 564: .home-banner-bg {
 565:   position: absolute;
 566:   inset: 0;
 567:   width: 100%;
 568:   height: 100%;
 569:   display: block;
 570:   object-fit: cover;
 571:   pointer-events: none;
```

说明：

- 内容链虽然已经把 `focalPoint` 给到页面模型。
- 但页面层没有根据 `focalPoint` 设置对应的裁切焦点。
