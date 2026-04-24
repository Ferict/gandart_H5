/**
 * Responsibility: resolve cross-rail navigation targets and route URLs for home,
 * activity, profile, and drawer entry interactions.
 * Out of scope: UI click handling, page-local animation, and content fetch runtime.
 */
import type { ContentTargetRef } from '../../models/content/contentTarget.model'
import type { ActivityEntry, ActivityNotice } from '../../models/home-rail/homeRailActivity.model'
import type {
  HomeContentTargetRef,
  HomeContentTargetType,
} from '../../models/home-rail/homeRailHome.model'
import type { HomeShellDrawerEntryId } from '../../models/home-shell/homeShellMenu.model'
import type { PageKey } from '../../models/home-shell/homeShell.model'
import type { ProfileCategoryKey } from '../../models/home-rail/homeRailProfile.model'
import { buildRouteUrl } from '../../utils/routeQuery.util'

const SAFE_NAV_REPEAT_GUARD_MS = 320
let lastSafeNavigateUrl = ''
let lastSafeNavigateAt = 0

const normalizeNavigableUrl = (url: string) => {
  if (!url) {
    return ''
  }

  return url.startsWith('/') ? url : `/${url}`
}

const resolveCurrentPagePath = () => {
  const currentPages = getCurrentPages()
  const currentPage = currentPages[currentPages.length - 1]
  if (!currentPage?.route) {
    return ''
  }

  return normalizeNavigableUrl(currentPage.route)
}

export const navigateByUrlSafely = (url: string) => {
  const normalizedUrl = normalizeNavigableUrl(url)
  if (!normalizedUrl) {
    return false
  }

  const now = Date.now()
  if (
    lastSafeNavigateUrl === normalizedUrl &&
    now - lastSafeNavigateAt < SAFE_NAV_REPEAT_GUARD_MS
  ) {
    return false
  }

  const targetPath = normalizedUrl.split('?')[0] ?? normalizedUrl
  if (resolveCurrentPagePath() === targetPath) {
    return false
  }

  lastSafeNavigateUrl = normalizedUrl
  lastSafeNavigateAt = now
  uni.navigateTo({ url: normalizedUrl })
  return true
}

export const buildHomeNoticeDetailUrl = (noticeId: string) => {
  return buildRouteUrl('/pages/updating/index', {
    moduleId: `UPD-NOTICE-${noticeId.toUpperCase()}`,
    title: `${noticeId} 公告详情`,
    englishTitle: 'Notice Pipeline',
    statusLabel: 'Construction',
    source: 'home-notice-bar',
    targetParams: JSON.stringify({ noticeId }),
  })
}

interface UpdatingTargetUrlInput {
  target: HomeContentTargetRef
  title?: string
  source: string
}

interface UpdatingQueryMeta {
  moduleId: string
  title: string
  englishTitle: string
  statusLabel: string
  source: string
}

const buildTargetExtraQuery = (
  target:
    | HomeContentTargetRef
    | {
        provider?: string
        params?: Record<string, string>
      }
) => {
  const withExtras = target as { provider?: string; params?: Record<string, string> }
  return {
    provider: withExtras.provider,
    targetParams:
      withExtras.params && Object.keys(withExtras.params).length > 0
        ? JSON.stringify(withExtras.params)
        : undefined,
  }
}

const resolveUpdatingMetaByTarget = (input: UpdatingTargetUrlInput): UpdatingQueryMeta => {
  const { target, title, source } = input
  const resolvedTitle = title?.trim()

  const targetMetaMap: Partial<
    Record<
      HomeContentTargetType,
      (targetId: string, titleValue: string | undefined, sourceValue: string) => UpdatingQueryMeta
    >
  > = {
    notice: (targetId, titleValue, sourceValue) => ({
      moduleId: `UPD-NOTICE-${targetId.toUpperCase()}`,
      title: titleValue || `${targetId} 公告链路`,
      englishTitle: 'Notice Pipeline',
      statusLabel: 'Construction',
      source: sourceValue,
    }),
    home_banner: (targetId, titleValue, sourceValue) => ({
      moduleId: `UPD-HOME-BANNER-${targetId.toUpperCase()}`,
      title: titleValue || `${targetId} 主视觉链路`,
      englishTitle: 'Banner Pipeline',
      statusLabel: 'Construction',
      source: sourceValue,
    }),
    drop: (targetId, titleValue, sourceValue) => ({
      moduleId: 'UPD-HOME-COLLECTION',
      title: titleValue || `${targetId} 藏品链路`,
      englishTitle: 'Collection Pipeline',
      statusLabel: 'Construction',
      source: sourceValue,
    }),
    market_item: (targetId, titleValue, sourceValue) => ({
      moduleId: `UPD-HOME-COL-${targetId.toUpperCase()}`,
      title: titleValue || `${targetId} 交易链路`,
      englishTitle: 'Collection Pipeline',
      statusLabel: 'Construction',
      source: sourceValue,
    }),
    market_action: (targetId, titleValue, sourceValue) => ({
      moduleId: targetId === 'search' ? 'UPD-HOME-MARKET-SEARCH' : 'UPD-HOME-MARKET-DOCS',
      title: titleValue || (targetId === 'search' ? '藏品市场搜索' : '藏品市场文档'),
      englishTitle: targetId === 'search' ? 'Market Search' : 'Market Docs',
      statusLabel: 'Construction',
      source: sourceValue,
    }),
    activity: (targetId, titleValue, sourceValue) => ({
      moduleId: `UPD-ACT-${targetId.toUpperCase()}`,
      title: titleValue || `${targetId} 活动链路`,
      englishTitle: 'Activity Pipeline',
      statusLabel: 'Construction',
      source: sourceValue,
    }),
  }

  const resolver = targetMetaMap[target.targetType as HomeContentTargetType]
  if (resolver) {
    return resolver(target.targetId, resolvedTitle, source)
  }

  return {
    moduleId: `UPD-${target.targetType.toUpperCase()}-${target.targetId.toUpperCase()}`,
    title: resolvedTitle || `${target.targetType} 链路`,
    englishTitle: 'Content Pipeline',
    statusLabel: 'Construction',
    source,
  }
}

export const buildUpdatingUrlByTarget = (input: UpdatingTargetUrlInput) => {
  const meta = resolveUpdatingMetaByTarget(input)
  return buildRouteUrl('/pages/updating/index', {
    ...meta,
    ...buildTargetExtraQuery(input.target),
  })
}

export const buildActionEntryUrl = (
  target:
    | HomeContentTargetRef
    | {
        targetType: 'market_action' | 'service_action' | 'settings_action'
        targetId: string
        provider?: string
        params?: Record<string, string>
      },
  source: string
) => {
  return buildUpdatingUrlByTarget({
    target,
    source,
  })
}

export const buildContentResourceUrl = (
  target:
    | ContentTargetRef
    | {
        targetType: 'notice' | 'home_banner' | 'activity' | 'drop' | 'market_item'
        targetId: string
        provider?: string
        params?: Record<string, string>
      },
  source: string
) => {
  return buildUpdatingUrlByTarget({
    target,
    source,
  })
}

export const buildHomeBannerUpdatingUrl = () => {
  return buildRouteUrl('/pages/updating/index', {
    moduleId: 'UPD-HOME-BANNER',
    title: '合成黎明主视觉链路',
    englishTitle: 'Banner Pipeline',
    statusLabel: 'Construction',
    source: 'home-banner',
  })
}

export const buildHomeCollectionUpdatingUrl = () => {
  return buildRouteUrl('/pages/updating/index', {
    moduleId: 'UPD-HOME-COLLECTION',
    title: '首发藏品交易链路',
    englishTitle: 'Collection Pipeline',
    statusLabel: 'Construction',
    source: 'home-collection',
  })
}

export const buildActivityUpdatingUrl = (entry: ActivityEntry) => {
  return buildRouteUrl('/pages/updating/index', {
    moduleId: `UPD-ACT-${entry.id.toUpperCase()}`,
    title: entry.title,
    englishTitle: 'Activity Pipeline',
    statusLabel: 'Construction',
    source: 'activity-entry',
  })
}

export const buildActivityNoticeDetailUrl = (noticeId: ActivityNotice['id']) => {
  return buildRouteUrl('/pages/updating/index', {
    moduleId: `UPD-ACT-NOTICE-${noticeId.toUpperCase()}`,
    title: `${noticeId} 活动公告`,
    englishTitle: 'Notice Pipeline',
    statusLabel: 'Construction',
    source: 'activity-notice-list',
    targetParams: JSON.stringify({ noticeId }),
  })
}

export const buildProfileSettingsUrl = () => {
  return buildSettingsUrl('profile-panel', 'account-security')
}

export const buildProfileUpdatingUrl = () => {
  return buildRouteUrl('/pages/updating/index', {
    moduleId: 'UPD-PROFILE-SYNC',
    title: '账户同步与资产校验',
    englishTitle: 'Profile Sync Pipeline',
    statusLabel: 'Construction',
    source: 'profile-panel',
  })
}

export const buildProfileAddressQrUrl = () => {
  return buildRouteUrl('/pages/updating/index', {
    moduleId: 'UPD-PROFILE-ADDRESS',
    title: 'Profile Address',
    englishTitle: 'Profile Pipeline',
    statusLabel: 'Construction',
    source: 'profile-address-qr',
  })
}

export const buildProfileAssetSearchUrl = (input?: {
  source?: string
  category?: ProfileCategoryKey | 'all'
  subCategory?: string
  keyword?: string
}) => {
  const normalizedSubCategory = input?.subCategory?.trim()
  const targetParams = {
    category: input?.category ?? 'all',
    subCategory:
      !normalizedSubCategory || normalizedSubCategory === '全部'
        ? undefined
        : normalizedSubCategory,
    keyword: input?.keyword ?? '',
  }

  return buildRouteUrl('/pages/updating/index', {
    moduleId: 'UPD-PROFILE-ASSETS',
    title: 'Profile Assets',
    englishTitle: 'Profile Pipeline',
    statusLabel: 'Construction',
    source: input?.source ?? 'profile-asset-search',
    targetParams: JSON.stringify(targetParams),
  })
}

export const buildProfileAssetDetailUrl = (
  itemId: string,
  category: ProfileCategoryKey,
  _title?: string,
  subCategory?: string
) => {
  return buildRouteUrl('/pages/profile-asset-detail/index', {
    source: 'profile-asset-card',
    itemId,
    category,
    subCategory: subCategory?.trim() || undefined,
  })
}

export const buildSettingsUrl = (source: string, section = 'account-security') => {
  return buildRouteUrl('/pages/updating/index', {
    moduleId: 'UPD-SETTINGS',
    title: 'System Settings',
    englishTitle: 'Configuration',
    statusLabel: 'Construction',
    source,
    targetParams: JSON.stringify({ section }),
  })
}

export const buildHomeShellPageUrl = (page: PageKey, source: string) => {
  return buildRouteUrl('/pages/home/index', {
    tab: page,
    source,
  })
}

export const buildHomeServiceEntryUrl = (entryId: HomeShellDrawerEntryId, source: string) => {
  if (entryId === 'settings') {
    return buildSettingsUrl(source, 'account-security')
  }

  return buildRouteUrl('/pages/updating/index', {
    moduleId: `UPD-SERVICE-${entryId.toUpperCase()}`,
    title: `${entryId} 服务入口`,
    englishTitle: 'Service Pipeline',
    statusLabel: 'Construction',
    source,
    targetParams: JSON.stringify({ serviceId: entryId }),
  })
}
