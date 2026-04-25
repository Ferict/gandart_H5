/**
 * Responsibility: adapt content notice-bar scene data into home notice presentation state and
 * expose the notice read-state action bridge.
 * Out of scope: notice scene fetching strategy, content provider selection, and page-shell state.
 */
import type { ContentNoticeBarBlockDto } from '../../contracts/content-api.contract'
import type { HomeAnnouncementItem } from '../../models/home-rail/homeRailHome.model'
import { adaptHomeRailHomeNoticeBarBlockDto } from '../../adapters/content/homeRailHomeContent.adapter'
import { resolveContentScene, runContentAction } from '../content/content.service'

const extractHomeNoticeItems = (sceneBlocks: Array<{ blockType: string }>) => {
  const noticeBarBlock = sceneBlocks.find((item) => item.blockType === 'notice_bar') as
    | ContentNoticeBarBlockDto
    | undefined
  return adaptHomeRailHomeNoticeBarBlockDto(noticeBarBlock).items
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
