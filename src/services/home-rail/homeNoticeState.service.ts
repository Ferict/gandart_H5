/**
 * Responsibility: adapt content notice-bar scene data into home notice presentation state and
 * expose the notice read-state action bridge.
 * Out of scope: notice scene fetching strategy, content provider selection, and page-shell state.
 */

import type {
  ContentNoticeBarBlockDto,
  ContentTargetDto,
} from '../../contracts/content-api.contract'
import type {
  HomeAnnouncementItem,
  HomeContentTargetRef,
} from '../../models/home-rail/homeRailHome.model'
import { resolveContentScene, runContentAction } from '../content/content.service'
import { formatNoticeDisplayTime } from '../../utils/noticeTime.util'

const toHomeTarget = (target: ContentTargetDto): HomeContentTargetRef => {
  if (target.targetType === 'profile_asset') {
    return {
      targetType: target.targetType,
      targetId: target.targetId,
      params: {
        category: target.params.category,
        subCategory: target.params.subCategory,
      },
      provider: target.provider,
    }
  }

  return {
    targetType: target.targetType,
    targetId: target.targetId,
    provider: target.provider,
  }
}

const resolveNoticeBarBlock = (block?: ContentNoticeBarBlockDto): HomeAnnouncementItem[] => {
  if (!block) {
    return []
  }

  return block.items.map((item) => ({
    noticeId: item.noticeId,
    title: item.title,
    type: item.type,
    time: formatNoticeDisplayTime(item.publishedAt),
    isUnread: item.isUnread,
    target: toHomeTarget(item.target),
  }))
}

const extractHomeNoticeItems = (sceneBlocks: Array<{ blockType: string }>) => {
  const noticeBarBlock = sceneBlocks.find((item) => item.blockType === 'notice_bar') as
    | ContentNoticeBarBlockDto
    | undefined
  return resolveNoticeBarBlock(noticeBarBlock)
}

export const createHomeAnnouncementItemsShell = (): HomeAnnouncementItem[] => {
  return []
}

export const resolveHomeAnnouncementItems = async (): Promise<HomeAnnouncementItem[]> => {
  const scene = await resolveContentScene({ sceneId: 'home' })
  return extractHomeNoticeItems(scene.blocks)
}

export const isContentNoticeId = (noticeId: string): boolean => {
  return noticeId.trim().length > 0
}

export const isHomeAnnouncementNoticeId = (noticeId: string): boolean => {
  return isContentNoticeId(noticeId)
}

export const consumeHomeAnnouncementUnread = async (noticeId: string): Promise<boolean> => {
  if (!isHomeAnnouncementNoticeId(noticeId)) {
    return false
  }

  const result = await runContentAction({
    actionType: 'notice-read',
    noticeId,
  })

  return (
    'noticeId' in result &&
    'isUnread' in result &&
    result.noticeId === noticeId &&
    result.isUnread === false
  )
}
