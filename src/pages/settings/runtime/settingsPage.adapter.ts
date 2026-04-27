/**
 * Responsibility: normalize the content-domain settings scene into the page-local
 * settings view model consumed by the settings page.
 * Out of scope: route navigation, backend mutation, and host-bridge setting actions.
 */
import type {
  ContentSceneDto,
  ContentSettingsSectionsBlockDto,
  ContentSettingsSummaryBlockDto,
  ContentTargetDto,
} from '../../../contracts/content-api.contract'
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'

export interface SettingsPageSummaryViewModel {
  title: string
  englishTitle: string
  description: string
  actionLabel: string
  actionEnglishLabel: string
  actionIconName: AetherIconName
  actionTarget: ContentTargetDto
}

export interface SettingsPageItemViewModel {
  id: string
  title: string
  value: string
  iconName: AetherIconName
  target: ContentTargetDto
  targetSeam: boolean
}

export interface SettingsPageSectionViewModel {
  id: string
  title: string
  englishTitle: string
  items: SettingsPageItemViewModel[]
}

export interface SettingsPageViewModel {
  summary: SettingsPageSummaryViewModel
  sections: SettingsPageSectionViewModel[]
}

const SETTINGS_ACTION_TARGET: ContentTargetDto = {
  targetType: 'settings_action',
  targetId: 'feedback',
  provider: 'content',
}

const DEFAULT_SETTINGS_VIEW: SettingsPageViewModel = {
  summary: {
    title: '关于天异',
    englishTitle: 'About Aether',
    description:
      '天异的系统能力、账户状态与前端体验调整会持续在这里汇总，问题反馈也统一从这里进入。',
    actionLabel: '问题反馈',
    actionEnglishLabel: 'Feedback',
    actionIconName: 'message-circle-more',
    actionTarget: SETTINGS_ACTION_TARGET,
  },
  sections: [],
}

const SETTINGS_ITEM_ICON_MAP: Record<string, AetherIconName> = {
  'account-info': 'user-round',
  'security-center': 'shield-check',
  'wallet-manage': 'wallet',
  'notice-setting': 'bell-ring',
  'appearance-setting': 'paintbrush',
  'language-region': 'languages',
}

const isSettingsSummaryBlock = (
  block: ContentSceneDto['blocks'][number]
): block is ContentSettingsSummaryBlockDto => block.blockType === 'settings_summary'

const isSettingsSectionsBlock = (
  block: ContentSceneDto['blocks'][number]
): block is ContentSettingsSectionsBlockDto => block.blockType === 'settings_sections'

const resolveSettingsItemIconName = (itemId: string): AetherIconName =>
  SETTINGS_ITEM_ICON_MAP[itemId] ?? 'settings'

export const mapSettingsSceneToPageView = (
  scene: ContentSceneDto | null | undefined
): SettingsPageViewModel => {
  const summaryBlock = scene?.blocks.find(isSettingsSummaryBlock)
  const sectionsBlock = scene?.blocks.find(isSettingsSectionsBlock)

  return {
    summary: summaryBlock
      ? {
          title: summaryBlock.title,
          englishTitle: summaryBlock.englishTitle,
          description: summaryBlock.description,
          actionLabel: summaryBlock.actionLabel,
          actionEnglishLabel: summaryBlock.actionEnglishLabel,
          actionIconName: 'message-circle-more',
          actionTarget: { ...summaryBlock.actionTarget },
        }
      : DEFAULT_SETTINGS_VIEW.summary,
    sections:
      sectionsBlock?.sections.map((section) => ({
        id: section.sectionId,
        title: section.title,
        englishTitle: section.englishTitle,
        items: section.items.map((item) => ({
          id: item.itemId,
          title: item.title,
          value: item.value,
          iconName: resolveSettingsItemIconName(item.itemId),
          target: { ...item.target },
          targetSeam: item.target.targetType === 'settings_action',
        })),
      })) ?? DEFAULT_SETTINGS_VIEW.sections,
  }
}
