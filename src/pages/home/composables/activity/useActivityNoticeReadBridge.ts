/**
 * Responsibility: mirror notice read state into the current activity content snapshot and the
 * filtered remote notice list so the local UI stays consistent after read actions.
 * Out of scope: remote persistence, query execution, and result-window timing behavior.
 */
import type { Ref } from 'vue'
import type {
  ActivityNoticeListResult,
  HomeRailActivityContent,
} from '../../../../models/home-rail/homeRailActivity.model'

interface UseActivityNoticeReadBridgeOptions {
  activityContent: Ref<HomeRailActivityContent>
  remoteFilteredNoticeList: Ref<ActivityNoticeListResult | null>
}

export const useActivityNoticeReadBridge = ({
  activityContent,
  remoteFilteredNoticeList,
}: UseActivityNoticeReadBridgeOptions) => {
  const markNoticeReadLocal = (noticeId: string) => {
    if (remoteFilteredNoticeList.value) {
      remoteFilteredNoticeList.value = {
        ...remoteFilteredNoticeList.value,
        list: remoteFilteredNoticeList.value.list.map((item) =>
          item.id === noticeId ? { ...item, isUnread: false } : item
        ),
      }
    }
    activityContent.value = {
      ...activityContent.value,
      notices: {
        ...activityContent.value.notices,
        list: activityContent.value.notices.list.map((item) =>
          item.id === noticeId ? { ...item, isUnread: false } : item
        ),
      },
    }
  }

  return {
    markNoticeReadLocal,
  }
}
