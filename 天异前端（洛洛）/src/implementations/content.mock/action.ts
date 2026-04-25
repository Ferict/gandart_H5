/**
 * Responsibility: execute mock content actions that mutate unread or reminder state and return
 * action results matching the content API contract.
 * Out of scope: scene/list/resource assembly, request transport, and provider selection.
 */
import type {
  ContentActionRequestDto,
  ContentActionResultDto,
} from '../../contracts/content-api.contract'
import { consumeNoticeUnreadState, consumeServiceHubReminderState } from './shared'

export const runAction = (input: ContentActionRequestDto): ContentActionResultDto => {
  if (input.actionType === 'notice-read') {
    return consumeNoticeUnreadState(input.noticeId)
  }

  if (input.actionType === 'service-reminder-consume') {
    return consumeServiceHubReminderState(input.serviceId)
  }

  throw new Error(
    `[content-mock] unsupported actionType: ${(input as { actionType: string }).actionType}`
  )
}
