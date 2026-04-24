/**
 * Responsibility: mirror announcement read state into the current home content snapshot so the
 * local notice bar stays visually consistent after read actions.
 * Out of scope: remote persistence, query execution, and result-window timing behavior.
 */
import type { ComputedRef, Ref } from 'vue'
import type {
  HomeNoticeBarConfig,
  HomeRailHomeContent,
} from '../../../../models/home-rail/homeRailHome.model'

interface UseHomeAnnouncementReadBridgeOptions {
  homeContent: Ref<HomeRailHomeContent>
  noticeBar: ComputedRef<HomeNoticeBarConfig>
}

export const useHomeAnnouncementReadBridge = ({
  homeContent,
  noticeBar,
}: UseHomeAnnouncementReadBridgeOptions) => {
  const markAnnouncementAsReadLocally = (noticeId: string) => {
    const currentNoticeItems = noticeBar.value.items
    if (!currentNoticeItems.some((item) => item.noticeId === noticeId && item.isUnread)) {
      return
    }

    homeContent.value = {
      ...homeContent.value,
      noticeBar: {
        ...homeContent.value.noticeBar,
        items: currentNoticeItems.map((item) =>
          item.noticeId === noticeId
            ? {
                ...item,
                isUnread: false,
              }
            : item
        ),
      },
    }
  }

  return {
    markAnnouncementAsReadLocally,
  }
}
