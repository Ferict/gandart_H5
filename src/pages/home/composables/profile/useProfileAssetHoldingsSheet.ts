/**
 * Responsibility: own the page-local profile-asset holdings sheet state, including seeded
 * instance-detail projection and the two-step navigation flow from asset card to detail page.
 * Out of scope: formal backend instance contracts, shared route building, and profile list
 * fetching.
 */
import { computed, ref } from 'vue'
import type { ProfileAssetItem } from '../../../../models/home-rail/homeRailProfile.model'
import type { AetherIconName } from '../../../../models/ui/aetherIcon.model'

export type ProfileAssetHoldingStatus = 'available' | 'listing' | 'locked'
export type ProfileAssetHoldingTone = 'accent' | 'warning' | 'muted'

export interface ProfileAssetHoldingInstanceViewModel {
  id: string
  serial: string
  acquiredAtLabel: string
  status: ProfileAssetHoldingStatus
  statusLabel: string
  statusIconName: AetherIconName
  statusTone: ProfileAssetHoldingTone
}

export interface ProfileAssetHoldingsSheetViewModel {
  assetId: string
  name: string
  collectionLabel: string
  holdingsCount: number
  imageUrl: string
  instances: ProfileAssetHoldingInstanceViewModel[]
}

interface UseProfileAssetHoldingsSheetOptions {
  navigateToAssetDetail: (
    item: ProfileAssetItem,
    instance: ProfileAssetHoldingInstanceViewModel
  ) => void
}

interface HoldingStatusMeta {
  label: string
  iconName: AetherIconName
  tone: ProfileAssetHoldingTone
}

const HOLDING_STATUS_SEQUENCE: readonly ProfileAssetHoldingStatus[] = [
  'available',
  'listing',
  'locked',
  'available',
] as const

const HOLDING_STATUS_META: Record<ProfileAssetHoldingStatus, HoldingStatusMeta> = {
  available: {
    label: '可用',
    iconName: 'check-circle-2',
    tone: 'accent',
  },
  listing: {
    label: '寄售中',
    iconName: 'clock',
    tone: 'warning',
  },
  locked: {
    label: '锁定中',
    iconName: 'shield',
    tone: 'muted',
  },
}

const FALLBACK_ACQUIRED_AT = '2026-01-01T01:41:00.000Z'
const DIGITS_ONLY_PATTERN = /[^\d]/g
const CJK_TEXT_PATTERN = /[\u3400-\u9fff]/

const createStableNumericSeed = (value: string) => {
  return value.split('').reduce((total, character, index) => {
    return total + character.charCodeAt(0) * (index + 1)
  }, 0)
}

const padNumericText = (value: number, size: number) => {
  return String(value).padStart(size, '0')
}

const formatProfileHoldingsDateTime = (value: Date) => {
  const year = value.getUTCFullYear()
  const month = padNumericText(value.getUTCMonth() + 1, 2)
  const day = padNumericText(value.getUTCDate(), 2)
  const hour = padNumericText(value.getUTCHours(), 2)
  const minute = padNumericText(value.getUTCMinutes(), 2)
  const second = padNumericText(value.getUTCSeconds(), 2)
  return `${year}.${month}.${day} ${hour}:${minute}:${second}`
}

const parseProfileHoldingsSeedDate = (rawValue: string) => {
  const normalizedValue = rawValue.trim()
  if (!normalizedValue) {
    return new Date(FALLBACK_ACQUIRED_AT)
  }

  const directDate = new Date(normalizedValue)
  if (!Number.isNaN(directDate.getTime())) {
    return directDate
  }

  const normalizedDateText = normalizedValue.replace(/\./g, '-')
  const dateParts = normalizedDateText
    .split('T')[0]
    .split('-')
    .map((segment) => Number(segment.replace(DIGITS_ONLY_PATTERN, '')))

  const [year, month, day] = dateParts
  if (!year || !month || !day) {
    return new Date(FALLBACK_ACQUIRED_AT)
  }

  return new Date(Date.UTC(year, month - 1, day, 1, 41, 0))
}

const formatCollectionLabel = (rawValue: string, editionCode: string) => {
  const normalizedValue = rawValue.trim().replace(/[_-]+/g, ' ')
  if (!normalizedValue) {
    return editionCode.trim() || 'ASSET HOLDINGS'
  }

  if (CJK_TEXT_PATTERN.test(normalizedValue)) {
    return normalizedValue
  }

  return normalizedValue.toUpperCase()
}

const buildHoldingSerial = (item: ProfileAssetItem, index: number) => {
  const seed = createStableNumericSeed(`${item.id}::${item.name}::${item.editionCode}`)
  const baseSerial = (seed % 90000) + 10000
  const nextSerial = (baseSerial + index * 137) % 100000
  return `#${padNumericText(nextSerial, 5)}`
}

const buildHoldingAcquiredAtLabel = (item: ProfileAssetItem, index: number) => {
  const seed = createStableNumericSeed(`${item.id}::${item.date}`)
  const baseDate = parseProfileHoldingsSeedDate(item.date)
  const offsetMinutes = index * 1603 + (seed % 173)
  return formatProfileHoldingsDateTime(new Date(baseDate.getTime() + offsetMinutes * 60 * 1000))
}

const buildHoldingInstances = (
  item: ProfileAssetItem
): ProfileAssetHoldingsSheetViewModel['instances'] => {
  const holdingsCount = Math.max(1, Math.trunc(item.holdingsCount || 0))

  return Array.from({ length: holdingsCount }, (_, index) => {
    const status = HOLDING_STATUS_SEQUENCE[index % HOLDING_STATUS_SEQUENCE.length]
    const statusMeta = HOLDING_STATUS_META[status]
    return {
      id: `${item.id}::holding::${index}`,
      serial: buildHoldingSerial(item, index),
      acquiredAtLabel: buildHoldingAcquiredAtLabel(item, index),
      status,
      statusLabel: statusMeta.label,
      statusIconName: statusMeta.iconName,
      statusTone: statusMeta.tone,
    }
  })
}

export const buildProfileAssetHoldingsSheetViewModel = (
  item: ProfileAssetItem
): ProfileAssetHoldingsSheetViewModel => {
  return {
    assetId: item.id,
    name: item.name,
    collectionLabel: formatCollectionLabel(item.subCategory, item.editionCode),
    holdingsCount: Math.max(1, Math.trunc(item.holdingsCount || 0)),
    imageUrl: item.imageUrl,
    // TODO(contract): replace the seeded holdings-instance projection once profile assets expose
    // concrete instance serials, statuses, and acquiredAt timestamps in the formal payload.
    instances: buildHoldingInstances(item),
  }
}

export const useProfileAssetHoldingsSheet = (options: UseProfileAssetHoldingsSheetOptions) => {
  const activeProfileAssetHoldingsItem = ref<ProfileAssetItem | null>(null)
  const isProfileAssetHoldingsSheetOpen = ref(false)

  const activeProfileAssetHoldingsSheetViewModel =
    computed<ProfileAssetHoldingsSheetViewModel | null>(() => {
      if (!activeProfileAssetHoldingsItem.value) {
        return null
      }

      return buildProfileAssetHoldingsSheetViewModel(activeProfileAssetHoldingsItem.value)
    })

  const openProfileAssetHoldingsSheet = (item: ProfileAssetItem) => {
    activeProfileAssetHoldingsItem.value = item
    isProfileAssetHoldingsSheetOpen.value = true
  }

  const closeProfileAssetHoldingsSheet = () => {
    isProfileAssetHoldingsSheetOpen.value = false
    activeProfileAssetHoldingsItem.value = null
  }

  const navigateToActiveProfileAssetDetail = (instance: ProfileAssetHoldingInstanceViewModel) => {
    const activeItem = activeProfileAssetHoldingsItem.value
    if (!activeItem) {
      return
    }

    closeProfileAssetHoldingsSheet()
    options.navigateToAssetDetail(activeItem, instance)
  }

  const handleProfileAssetHoldingInstanceActivate = (instanceId: string) => {
    const activeSheetViewModel = activeProfileAssetHoldingsSheetViewModel.value
    if (!activeSheetViewModel) {
      return
    }

    const targetInstance = activeSheetViewModel.instances.find(
      (instance) => instance.id === instanceId
    )
    if (!targetInstance) {
      return
    }

    navigateToActiveProfileAssetDetail(targetInstance)
  }

  return {
    isProfileAssetHoldingsSheetOpen,
    activeProfileAssetHoldingsSheetViewModel,
    openProfileAssetHoldingsSheet,
    closeProfileAssetHoldingsSheet,
    handleProfileAssetHoldingInstanceActivate,
  }
}
