/**
 * Responsibility: define the mock settings-scene source sections, summary copy, and action
 * targets consumed by the content mock provider.
 * Out of scope: settings page rendering, action execution, and scene response transport.
 */
import type { ContentTargetDto } from '../../../contracts/content-api.contract'

interface SettingsSceneSummaryRecord {
  title: string
  englishTitle: string
  description: string
  actionLabel: string
  actionEnglishLabel: string
  actionTarget: ContentTargetDto
}

interface SettingsSceneItemRecord {
  itemId: string
  title: string
  value: string
  target: ContentTargetDto
}

interface SettingsSceneSectionRecord {
  sectionId: string
  title: string
  englishTitle: string
  items: SettingsSceneItemRecord[]
}

interface SettingsSceneRecord {
  version: number
  updatedAt: string
  summary: SettingsSceneSummaryRecord
  sections: SettingsSceneSectionRecord[]
}

export const settingsSceneDb: SettingsSceneRecord = {
  version: 1,
  updatedAt: '2026-03-25T17:25:00+08:00',
  summary: {
    title: '关于天异',
    englishTitle: 'About Aether',
    description:
      '天异的系统能力、账户状态与前端体验调整会持续在这里汇总，问题反馈也统一从这里进入。',
    actionLabel: '问题反馈',
    actionEnglishLabel: 'Feedback',
    actionTarget: {
      targetType: 'settings_action',
      targetId: 'feedback',
      provider: 'content',
    },
  },
  sections: [
    {
      sectionId: 'account-security',
      title: '账户与安全',
      englishTitle: 'Account',
      items: [
        {
          itemId: 'account-info',
          title: '账户信息',
          value: '已同步',
          target: {
            targetType: 'settings_action',
            targetId: 'account-info',
            provider: 'content',
          },
        },
        {
          itemId: 'security-center',
          title: '安全中心',
          value: '标准防护',
          target: {
            targetType: 'settings_action',
            targetId: 'security-center',
            provider: 'content',
          },
        },
        {
          itemId: 'wallet-manage',
          title: '钱包管理',
          value: '1 个已连接',
          target: {
            targetType: 'settings_action',
            targetId: 'wallet-manage',
            provider: 'content',
          },
        },
      ],
    },
    {
      sectionId: 'display-notify',
      title: '通知与显示',
      englishTitle: 'Display',
      items: [
        {
          itemId: 'notice-setting',
          title: '通知提醒',
          value: '已开启',
          target: {
            targetType: 'settings_action',
            targetId: 'notice-setting',
            provider: 'content',
          },
        },
        {
          itemId: 'appearance-setting',
          title: '界面风格',
          value: '当前方案',
          target: {
            targetType: 'settings_action',
            targetId: 'appearance-setting',
            provider: 'content',
          },
        },
        {
          itemId: 'language-region',
          title: '语言与地区',
          value: '简中 / 香港',
          target: {
            targetType: 'settings_action',
            targetId: 'language-region',
            provider: 'content',
          },
        },
      ],
    },
  ],
}
