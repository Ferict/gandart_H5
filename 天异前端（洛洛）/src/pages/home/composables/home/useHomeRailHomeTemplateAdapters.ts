/**
 * Responsibility: host template-layer ref adapters and banner image event forwarding used by the
 * home panel shell.
 * Out of scope: market queries, result runtime, scene patching, reveal state machines, and page lifecycle orchestration.
 */
import type { Ref } from 'vue'
import type { HomeBannerItem } from '../../../../models/home-rail/homeRailHome.model'
import { createResolvedTemplateRefAssigner } from '../../../../utils/resolveTemplateRefElement.util'

interface UseHomeRailHomeTemplateAdaptersOptions {
  marketSortLayerRef: Ref<HTMLElement | null>
  marketLoadMoreSentinelRef: Ref<HTMLElement | null>
  marketResultsStageRef: Ref<HTMLElement | null>
  marketResultsContentRef: Ref<HTMLElement | null>
  resolveBannerImageUrl: (item: HomeBannerItem) => string
  handleHomeVisualImageLoad: (
    category: 'banner' | 'featured',
    id: string,
    imageUrl: string,
    event: unknown
  ) => void
  handleHomeVisualImageError: (
    category: 'banner' | 'featured',
    id: string,
    imageUrl: string,
    event: unknown
  ) => void
}

export const useHomeRailHomeTemplateAdapters = (
  options: UseHomeRailHomeTemplateAdaptersOptions
) => {
  const assignMarketSortLayerRef = (element: HTMLElement | null) => {
    options.marketSortLayerRef.value = element
  }

  const assignMarketLoadMoreSentinelRef = (element: HTMLElement | null) => {
    options.marketLoadMoreSentinelRef.value = element
  }

  const assignMarketResultsStageRef = createResolvedTemplateRefAssigner(
    options.marketResultsStageRef
  )
  const assignMarketResultsContentRef = createResolvedTemplateRefAssigner(
    options.marketResultsContentRef
  )

  const handleBannerImageLoadFromSection = (item: HomeBannerItem, event: unknown) => {
    options.handleHomeVisualImageLoad('banner', item.id, options.resolveBannerImageUrl(item), event)
  }

  const handleBannerImageErrorFromSection = (item: HomeBannerItem, event: unknown) => {
    options.handleHomeVisualImageError(
      'banner',
      item.id,
      options.resolveBannerImageUrl(item),
      event
    )
  }

  return {
    assignMarketSortLayerRef,
    assignMarketLoadMoreSentinelRef,
    assignMarketResultsStageRef,
    assignMarketResultsContentRef,
    handleBannerImageLoadFromSection,
    handleBannerImageErrorFromSection,
  }
}
