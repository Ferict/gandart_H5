/**
 * Responsibility: host the home market rail base content state and read-only derivations,
 * including shell data, notice selection state, and the local read bridge.
 * Out of scope: remote refresh, list queries, result windows, reveal runtime, and page watchers.
 */
import { computed, ref } from 'vue'
import type {
  HomeAnnouncementItem,
  HomeBannerItem,
  HomeFeaturedDropContent,
  HomeMarketCard,
  HomeMarketTag,
  HomeNoticeBarConfig,
} from '../../../../models/home-rail/homeRailHome.model'
import type { RailSceneResolvedMeta } from '../../../../services/home-rail/homeRailPageReloadPolicy.service'
import { createHomeRailHomeContentShell } from '../../../../services/home-rail/homeRailHomeContent.service'
import { useHomeAnnouncementReadBridge } from './useHomeAnnouncementReadBridge'

export const useHomeRailHomeContentState = () => {
  const homeContent = ref(createHomeRailHomeContentShell())
  const lastResolvedMeta = ref<RailSceneResolvedMeta | null>(null)
  const noticeBar = computed<HomeNoticeBarConfig>(() => homeContent.value.noticeBar)
  const homeBannerItems = computed<HomeBannerItem[]>(() => homeContent.value.banners)
  const bannerDrop = computed<HomeFeaturedDropContent>(() => homeContent.value.featured)
  const marketContent = computed(() => homeContent.value.market)
  const marketTags = computed<HomeMarketTag[]>(() => marketContent.value.tags)
  const marketCollection = ref<HomeMarketCard[]>([])
  const collection = computed<HomeMarketCard[]>(() => marketCollection.value)
  const activeAnnouncementIndex = ref(0)
  const homeAnnouncementItems = computed<HomeAnnouncementItem[]>(() => noticeBar.value.items)
  const activeAnnouncement = computed(() => {
    const items = homeAnnouncementItems.value
    return items[activeAnnouncementIndex.value] ?? items[0]
  })
  const { markAnnouncementAsReadLocally } = useHomeAnnouncementReadBridge({
    homeContent,
    noticeBar,
  })

  return {
    homeContent,
    lastResolvedMeta,
    noticeBar,
    homeBannerItems,
    bannerDrop,
    marketContent,
    marketTags,
    marketCollection,
    collection,
    activeAnnouncementIndex,
    homeAnnouncementItems,
    activeAnnouncement,
    markAnnouncementAsReadLocally,
  }
}
