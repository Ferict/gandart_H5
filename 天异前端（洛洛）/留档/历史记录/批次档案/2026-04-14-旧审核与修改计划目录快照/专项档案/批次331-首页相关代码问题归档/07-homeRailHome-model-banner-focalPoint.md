# homeRailHome.model.ts 摘录

问题关联：banner 模型已经定义 `focalPoint`。

```ts
  25: export interface HomeFocalPoint {
  26:   x: number
  27:   y: number
  28: }
  29:
  30: export interface HomeAnnouncementItem {
  31:   noticeId: string
  32:   title: string
  33:   type: string
  34:   time: string
  35:   isUnread: boolean
  36: }
  37:
  38: export interface HomeBannerItem {
  39:   id: string
  40:   title: string
  41:   liveLabel: string
  42:   tone: HomeBannerTone
  43:   imageUrl: string
  44:   focalPoint?: HomeFocalPoint
  45:   target: HomeContentTargetRef
  46: }
```
