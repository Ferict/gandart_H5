/**
 * Responsibility: resolve the minimal invite page view model from the active content resource seam.
 * Out of scope: page shell rendering, route navigation policy, and real share/reward execution.
 */
import type {
  ContentResourceDto,
  ContentServiceEntryPayloadDto,
} from '../../../contracts/content-api.contract'
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'
import { resolveContentResource } from '../../../services/content/content.service'

export interface InvitePageItemViewModel {
  id: string
  title: string
  description: string
  value?: string
  iconName: AetherIconName
}

export interface InvitePageSectionViewModel {
  id: string
  title: string
  items: InvitePageItemViewModel[]
}

export interface InvitePageViewModel {
  title: string
  summary: string
  sections: InvitePageSectionViewModel[]
}

const DEFAULT_INVITE_PAGE_VIEW: InvitePageViewModel = {
  title: '邀请好友',
  summary:
    '邀请好友页面统一承接邀请战绩、奖励说明和分发素材，后续直接接入分享海报、返利流水与活动配置。',
  sections: [
    {
      id: 'invite-overview',
      title: '邀请战绩',
      items: [
        {
          id: 'invite-history',
          title: '邀请记录',
          description: '统一查看邀请来源、时间和奖励状态。',
          value: '--',
          iconName: 'history',
        },
        {
          id: 'invite-reward',
          title: '奖励明细',
          description: '承接奖励累计、待发放和到账记录。',
          value: '--',
          iconName: 'gift',
        },
      ],
    },
    {
      id: 'invite-assets',
      title: '分发素材',
      items: [
        {
          id: 'invite-poster',
          title: '邀请海报',
          description: '后续接入分享海报、二维码和文案模板。',
          iconName: 'share',
        },
        {
          id: 'invite-rules',
          title: '规则说明',
          description: '集中承接邀请规则、限制条件和奖励说明。',
          iconName: 'shield-check',
        },
      ],
    },
  ],
}

const cloneDefaultInvitePageView = (): InvitePageViewModel => ({
  ...DEFAULT_INVITE_PAGE_VIEW,
  sections: DEFAULT_INVITE_PAGE_VIEW.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({ ...item })),
  })),
})

const resolveInviteItemIconName = (itemId: string): AetherIconName => {
  switch (itemId) {
    case 'invite-history':
      return 'history'
    case 'invite-reward':
      return 'gift'
    case 'invite-poster':
      return 'share'
    case 'invite-rules':
      return 'shield-check'
    default:
      return 'sparkles'
  }
}

const mapInviteResourceToPageView = (
  resource: ContentResourceDto | null | undefined
): InvitePageViewModel => {
  if (!resource || resource.resourceType !== 'service_entry' || resource.resourceId !== 'invite') {
    return cloneDefaultInvitePageView()
  }

  const payload = resource.payload as ContentServiceEntryPayloadDto

  return {
    title: resource.title || DEFAULT_INVITE_PAGE_VIEW.title,
    summary: resource.summary || DEFAULT_INVITE_PAGE_VIEW.summary,
    sections:
      payload.sections.length > 0
        ? payload.sections.map((section) => ({
            id: section.sectionId,
            title: section.title,
            items: section.items.map((item) => ({
              id: item.itemId,
              title: item.title,
              description: item.description,
              value: item.value,
              iconName: resolveInviteItemIconName(item.itemId),
            })),
          }))
        : DEFAULT_INVITE_PAGE_VIEW.sections.map((section) => ({
            ...section,
            items: section.items.map((item) => ({ ...item })),
          })),
  }
}

export const resolveInvitePageView = async (): Promise<InvitePageViewModel> => {
  const resource = await resolveContentResource({
    resourceType: 'service_entry',
    resourceId: 'invite',
  })

  return mapInviteResourceToPageView(resource)
}

export const createInvitePageFallbackView = (): InvitePageViewModel => {
  return cloneDefaultInvitePageView()
}
