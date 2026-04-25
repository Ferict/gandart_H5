# homeRailHomeContent.service.ts 摘录

问题关联：banner 内容链已经把 `asset.focalPoint` 映射进首页稳定模型。

```ts
 114: const mapBanners = (block?: ContentBannerCarouselBlockDto): HomeBannerItem[] => {
 115:   if (!block) {
 116:     return []
 117:   }
 118:
 119:   return block.items.map((item) => ({
 120:     id: item.bannerId,
 121:     title: item.title,
 122:     liveLabel: item.liveLabel,
 123:     tone: item.tone,
 124:     imageUrl: resolveAssetUrl(item.asset, 'banner'),
 125:     focalPoint: item.asset?.focalPoint ? { ...item.asset.focalPoint } : undefined,
 126:     target: toHomeTarget(item.target),
 127:   }))
 128: }
```
