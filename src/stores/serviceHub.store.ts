/**
 * Responsibility: hold service-hub level reminder state that must survive across multiple home-shell views.
 * Out of scope: page-local interaction state, API transport, and one-off component presentation flags.
 */
import { defineStore } from 'pinia'
import type {
  HomeShellServiceEntryId,
  HomeShellServiceReminderState,
} from '../models/home-shell/homeShellMenu.model'

interface ServiceHubState {
  reminders: Partial<Record<HomeShellServiceEntryId, HomeShellServiceReminderState>>
  hydrated: boolean
}

const cloneReminderState = (
  item: HomeShellServiceReminderState
): HomeShellServiceReminderState => ({
  ...item,
})

export const useServiceHubStore = defineStore('service-hub', {
  state: (): ServiceHubState => ({
    reminders: {},
    hydrated: false,
  }),
  actions: {
    replaceReminders(items: HomeShellServiceReminderState[]) {
      const nextMap: Partial<Record<HomeShellServiceEntryId, HomeShellServiceReminderState>> = {}
      items.forEach((item) => {
        nextMap[item.serviceId] = cloneReminderState(item)
      })
      this.reminders = nextMap
      this.hydrated = true
    },
    consumeReminder(serviceId: HomeShellServiceEntryId) {
      const current = this.reminders[serviceId]
      if (!current) {
        return
      }

      this.reminders = {
        ...this.reminders,
        [serviceId]: {
          ...current,
          hasReminder: false,
          unreadCount: 0,
        },
      }
    },
  },
})
