/**
 * Responsibility: collect non-result-section display derivations for the home rail, including
 * banner autoplay, featured visuals, and market-head display state.
 * Out of scope: market result-stage first-screen states, footer modes, removed overlays, and
 * market card entry styling.
 */
import { computed, type ComputedRef } from 'vue'
import type {
  HomeAnnouncementItem,
  HomeBannerItem,
  HomeFeaturedDropContent,
  HomeMarketAction,
  HomeMarketCard,
  HomePlaceholderIconKey,
} from '../../../../models/home-rail/homeRailHome.model'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'

interface UseHomeRailHomePresentationStateOptions {
  isActive: ComputedRef<boolean>
  homeBannerItems: ComputedRef<HomeBannerItem[]>
  homeAnnouncementItems: ComputedRef<HomeAnnouncementItem[]>
  bannerDrop: ComputedRef<HomeFeaturedDropContent>
  resolveBannerImageUrl: (item: HomeBannerItem) => string
  marketActions: ComputedRef<HomeMarketAction[]>
}

export const useHomeRailHomePresentationState = (
  options: UseHomeRailHomePresentationStateOptions
) => {
  const placeholderIconRegistry: Record<HomePlaceholderIconKey, AetherIconName> = {
    box: 'box',
    cpu: 'cpu',
    aperture: 'aperture',
    hexagon: 'hexagon',
    triangle: 'triangle',
    disc3: 'disc-3',
  }

  const marketPlaceholderIconPool: HomePlaceholderIconKey[] = [
    'hexagon',
    'cpu',
    'aperture',
    'triangle',
    'disc3',
    'box',
  ]

  const isBannerSwiperAutoplayEnabled = computed(() => {
    return options.isActive.value && options.homeBannerItems.value.length > 1
  })

  const isHomeNoticeSwiperAutoplayEnabled = computed(() => {
    return options.isActive.value && options.homeAnnouncementItems.value.length > 1
  })

  const featuredProgressStyle = computed(() => {
    const safeSupply = options.bannerDrop.value.supply > 0 ? options.bannerDrop.value.supply : 0
    const progress =
      safeSupply > 0
        ? Math.min(100, Math.max(0, (options.bannerDrop.value.minted / safeSupply) * 100))
        : 0
    return { width: `${progress.toFixed(1)}%` }
  })

  const marketSearchAction = computed<HomeMarketAction>(() => {
    const action = options.marketActions.value.find((item) => item.id === 'search')
    return (
      action ?? {
        id: 'search',
        label: '打开市场搜索',
        target: {
          targetType: 'market_action',
          targetId: 'search',
        },
      }
    )
  })

  const featuredPlaceholderIcon = computed(() => {
    return placeholderIconRegistry[options.bannerDrop.value.placeholderIconKey ?? 'box']
  })

  const resolveMarketPlaceholderIcon = (item: HomeMarketCard, index: number): AetherIconName => {
    const iconKey =
      item.placeholderIconKey ??
      marketPlaceholderIconPool[index % marketPlaceholderIconPool.length] ??
      'box'
    return placeholderIconRegistry[iconKey]
  }

  const hasBannerRemoteImage = (item: HomeBannerItem): boolean =>
    options.resolveBannerImageUrl(item).length > 0

  return {
    isBannerSwiperAutoplayEnabled,
    isHomeNoticeSwiperAutoplayEnabled,
    marketSearchAction,
    featuredPlaceholderIcon,
    resolveMarketPlaceholderIcon,
    hasBannerRemoteImage,
    featuredProgressStyle,
  }
}
