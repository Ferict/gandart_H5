/**
 * Responsibility: hydrate and project home-shell drawer reminder state from the content scene
 * and service-hub store into drawer entries consumed by the shell layer.
 * Out of scope: drawer UI rendering, shell tab switching, and service action execution policy.
 */
import { computed } from 'vue'
import type {
  ContentSceneDto,
  ContentServiceHubEntriesBlockDto,
  ContentServiceHubEntryReminderDto,
} from '../../contracts/content-api.contract'
import type {
  HomeShellDrawerEntry,
  HomeShellIndicatorTone,
  HomeShellServiceEntryId,
  HomeShellServiceReminderState,
} from '../../models/home-shell/homeShellMenu.model'
import { useServiceHubStore } from '../../stores/serviceHub.store'
import { logSafeError } from '../../utils/safeLogger.util'
import { resolveContentScene, runContentAction } from '../content/content.service'
import { resolveHomeShellDrawerEntries, type HomeShellEntrySource } from './homeShellMenu.service'

let hydratePromise: Promise<HomeShellServiceReminderState[]> | null = null

const mapIndicatorTone = (
  tone: ContentServiceHubEntryReminderDto['indicatorTone']
): HomeShellIndicatorTone => {
  return tone
}

const mapReminderItem = (
  item: ContentServiceHubEntryReminderDto
): HomeShellServiceReminderState => ({
  serviceId: item.serviceId,
  hasReminder: item.hasReminder,
  unreadCount: item.unreadCount,
  indicatorTone: mapIndicatorTone(item.indicatorTone),
  latestMessageId: item.latestMessageId,
  latestMessageAt: item.latestMessageAt,
})

const extractReminderStates = (scene: ContentSceneDto | null): HomeShellServiceReminderState[] => {
  if (!scene) {
    return []
  }

  const reminderBlock = scene.blocks.find((item) => item.blockType === 'service_hub_entries') as
    | ContentServiceHubEntriesBlockDto
    | undefined
  if (!reminderBlock) {
    return []
  }

  return reminderBlock.items.map(mapReminderItem)
}

const resolveStoredReminderStates = (
  serviceHubStore: ReturnType<typeof useServiceHubStore>
): HomeShellServiceReminderState[] => {
  return Object.values(serviceHubStore.reminders).filter(
    (item): item is HomeShellServiceReminderState => Boolean(item)
  )
}

const mergeDrawerEntriesWithReminder = (
  entries: HomeShellDrawerEntry[],
  reminders: Partial<Record<HomeShellServiceEntryId, HomeShellServiceReminderState>>
): HomeShellDrawerEntry[] => {
  return entries.map((entry) => {
    if (entry.id === 'settings') {
      return {
        ...entry,
        badge: entry.badge ? { ...entry.badge } : undefined,
      }
    }

    const reminder = reminders[entry.id]
    return {
      ...entry,
      badge: entry.badge ? { ...entry.badge } : undefined,
      indicator: reminder?.hasReminder
        ? {
            visible: true,
            tone: reminder.indicatorTone,
          }
        : undefined,
    }
  })
}

export const createHomeShellMenuReminderShell = (): HomeShellServiceReminderState[] => {
  return resolveHomeShellDrawerEntries('shell-drawer')
    .filter(
      (entry): entry is HomeShellDrawerEntry & { id: HomeShellServiceEntryId } =>
        entry.id !== 'settings'
    )
    .map((entry) => ({
      serviceId: entry.id,
      hasReminder: false,
      unreadCount: 0,
      indicatorTone: 'cyan',
    }))
}

export const ensureHomeShellMenuReminderHydrated = async (): Promise<
  HomeShellServiceReminderState[]
> => {
  const serviceHubStore = useServiceHubStore()
  if (serviceHubStore.hydrated) {
    return resolveStoredReminderStates(serviceHubStore)
  }

  if (!hydratePromise) {
    hydratePromise = resolveContentScene({ sceneId: 'service_hub' })
      .then((scene) => {
        const reminderStates = extractReminderStates(scene)
        serviceHubStore.replaceReminders(reminderStates)
        return reminderStates
      })
      .catch((error) => {
        logSafeError('homeShellMenuState', error, {
          message: 'failed to hydrate service reminders',
        })
        const fallbackReminderStates = serviceHubStore.hydrated
          ? resolveStoredReminderStates(serviceHubStore)
          : createHomeShellMenuReminderShell()
        return fallbackReminderStates
      })
      .finally(() => {
        hydratePromise = null
      })
  }

  return hydratePromise
}

export const useResolvedHomeShellDrawerEntries = (
  source: HomeShellEntrySource = 'shell-drawer'
) => {
  const serviceHubStore = useServiceHubStore()

  return computed(() => {
    return mergeDrawerEntriesWithReminder(
      resolveHomeShellDrawerEntries(source),
      serviceHubStore.reminders
    )
  })
}

export const consumeHomeShellServiceReminder = async (serviceId: HomeShellServiceEntryId) => {
  const serviceHubStore = useServiceHubStore()
  if (!serviceHubStore.hydrated) {
    await ensureHomeShellMenuReminderHydrated()
  }

  const latestMessageId = serviceHubStore.reminders[serviceId]?.latestMessageId
  const result = await runContentAction({
    actionType: 'service-reminder-consume',
    serviceId,
    latestMessageId,
  })

  if ('serviceId' in result && result.serviceId === serviceId && result.hasReminder === false) {
    serviceHubStore.consumeReminder(serviceId)
    return true
  }

  return false
}
