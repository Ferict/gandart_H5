/**
 * Responsibility: define the mock service-hub reminder seed consumed by service reminder actions
 * and home-shell drawer reminder projection.
 * Out of scope: drawer entry rendering, reminder mutation orchestration, and content scene assembly.
 */
import type {
  ContentServiceEntryId,
  ContentServiceHubEntryReminderDto,
} from '../../contracts/content-api.contract'

export type ContentServiceHubReminderRecord = ContentServiceHubEntryReminderDto

const createRecord = (
  record: ContentServiceHubReminderRecord
): ContentServiceHubReminderRecord => ({
  ...record,
})

export const contentServiceHubReminderSeed: Record<
  ContentServiceEntryId,
  ContentServiceHubReminderRecord
> = {
  orders: createRecord({
    serviceId: 'orders',
    hasReminder: true,
    unreadCount: 1,
    indicatorTone: 'cyan',
    latestMessageId: 'orders-msg-20260325-01',
    latestMessageAt: '2026-03-25T23:20:00+08:00',
  }),
  auth: createRecord({
    serviceId: 'auth',
    hasReminder: false,
    unreadCount: 0,
    indicatorTone: 'green',
  }),
  wallet: createRecord({
    serviceId: 'wallet',
    hasReminder: true,
    unreadCount: 2,
    indicatorTone: 'amber',
    latestMessageId: 'wallet-msg-20260325-02',
    latestMessageAt: '2026-03-25T22:48:00+08:00',
  }),
  invite: createRecord({
    serviceId: 'invite',
    hasReminder: true,
    unreadCount: 1,
    indicatorTone: 'rose',
    latestMessageId: 'invite-msg-20260325-01',
    latestMessageAt: '2026-03-25T21:16:00+08:00',
  }),
  community: createRecord({
    serviceId: 'community',
    hasReminder: false,
    unreadCount: 0,
    indicatorTone: 'red',
  }),
}

export const cloneContentServiceHubReminder = (serviceId: ContentServiceEntryId) => {
  const matched = contentServiceHubReminderSeed[serviceId]
  return matched ? createRecord(matched) : null
}
