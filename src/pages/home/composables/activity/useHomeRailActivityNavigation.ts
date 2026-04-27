/**
 * Responsibility: host the activity rail navigation shell and local unread
 * consumption bridge used by the panel runtime.
 * Out of scope: remote list refresh, scene patching, presentation derivation, and page watchers.
 */
import {
  buildContentResourceUrl,
  navigateByUrlSafely,
} from '../../../../services/home-rail/homeRailNavigation.service'
import type {
  ActivityEntry,
  ActivityNotice,
} from '../../../../models/home-rail/homeRailActivity.model'
import { logSafeError } from '../../../../utils/safeLogger.util'

interface UseHomeRailActivityNavigationOptions {
  markNoticeReadLocal: (noticeId: string) => void
  consumeActivityNoticeUnread: (noticeId: string) => Promise<unknown>
}

export const useHomeRailActivityNavigation = (options: UseHomeRailActivityNavigationOptions) => {
  const handleEntryClick = (entry: ActivityEntry) => {
    navigateByUrlSafely(buildContentResourceUrl(entry.target, 'activity-entry'))
  }

  const handleNoticeClick = (notice: ActivityNotice) => {
    if (notice.isUnread) {
      options.markNoticeReadLocal(notice.id)
      void options.consumeActivityNoticeUnread(notice.id).catch((error) => {
        logSafeError('homeRail.activity', error, {
          message: 'failed to mark notice as read',
        })
      })
    }

    navigateByUrlSafely(buildContentResourceUrl(notice.target, 'activity-notice-card'))
  }

  return {
    handleEntryClick,
    handleNoticeClick,
  }
}
