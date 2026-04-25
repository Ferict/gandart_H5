/**
 * Responsibility: host home market rail navigation, target URL building, and announcement read
 * consumption so panel click wiring stays outside the parent component.
 * Out of scope: content refresh, scene hydration, result windows, and visual runtime behavior.
 */
import type { ComputedRef, Ref } from 'vue'
import {
  buildActionEntryUrl,
  buildContentResourceUrl,
  buildUpdatingUrlByTarget,
  navigateByUrlSafely,
} from '../../../../services/home-rail/homeRailNavigation.service'
import { consumeHomeAnnouncementUnread } from '../../../../services/home-rail/homeNoticeState.service'
import { logSafeError } from '../../../../utils/safeLogger.util'
import type {
  HomeAnnouncementItem,
  HomeBannerItem,
  HomeContentTargetRef,
  HomeFeaturedDropContent,
  HomeMarketCard,
} from '../../../../models/home-rail/homeRailHome.model'

interface UseHomeRailHomeNavigationOptions {
  activeAnnouncement: ComputedRef<HomeAnnouncementItem | undefined>
  bannerDrop: ComputedRef<HomeFeaturedDropContent>
  isMarketSortPopoverOpen: Ref<boolean>
  emitBannerClick: () => void
  emitAnnouncementClick: () => void
  emitCollectionClick: (id: string) => void
  markAnnouncementAsReadLocally: (noticeId: string) => void
  setActiveAnnouncementIndex: (index: number) => void
}

export function useHomeRailHomeNavigation(options: UseHomeRailHomeNavigationOptions) {
  const buildTargetUrl = (target: HomeContentTargetRef, title: string, source: string) => {
    if (target.targetType === 'notice') {
      return buildContentResourceUrl(target, source)
    }

    if (
      target.targetType === 'home_banner' ||
      target.targetType === 'drop' ||
      target.targetType === 'market_item'
    ) {
      return buildContentResourceUrl(target, source)
    }

    if (target.targetType === 'market_action') {
      return buildActionEntryUrl(target, source)
    }

    return buildUpdatingUrlByTarget({
      target,
      title,
      source,
    })
  }

  const handleNoticeSwiperChange = (event: { detail?: { current?: number } }) => {
    options.setActiveAnnouncementIndex(event.detail?.current ?? 0)
  }

  const handleBannerClick = (banner: HomeBannerItem) => {
    options.emitBannerClick()
    navigateByUrlSafely(buildTargetUrl(banner.target, `${banner.title} 发布链路`, 'home-banner'))
  }

  const handleAnnouncementClick = () => {
    const currentAnnouncement = options.activeAnnouncement.value
    if (!currentAnnouncement) {
      return
    }

    const didNavigate = navigateByUrlSafely(
      buildTargetUrl(
        currentAnnouncement.target,
        `${currentAnnouncement.title} 公告链路`,
        'home-notice-bar'
      )
    )
    if (!didNavigate) {
      return
    }

    options.emitAnnouncementClick()

    if (!currentAnnouncement.isUnread) {
      return
    }

    void consumeHomeAnnouncementUnread(currentAnnouncement.noticeId)
      .then((didConsume: boolean) => {
        if (!didConsume) {
          return
        }

        options.markAnnouncementAsReadLocally(currentAnnouncement.noticeId)
      })
      .catch((error: unknown) => {
        logSafeError('homeRail.home', error, {
          message: 'failed to consume home announcement unread state',
        })
      })
  }

  const handleCollectionQuickEntryClick = () => {
    navigateByUrlSafely(
      buildTargetUrl(
        options.bannerDrop.value.target,
        `${options.bannerDrop.value.title} 交易链路`,
        'home-featured-card'
      )
    )
  }

  const handleCollectionClick = (item: HomeMarketCard) => {
    options.isMarketSortPopoverOpen.value = false
    options.emitCollectionClick(item.id)
    navigateByUrlSafely(buildTargetUrl(item.target, `${item.name} 交易链路`, 'home-collection'))
  }

  return {
    buildTargetUrl,
    handleNoticeSwiperChange,
    handleBannerClick,
    handleAnnouncementClick,
    handleCollectionQuickEntryClick,
    handleCollectionClick,
  }
}
