/**
 * Responsibility: resolve copy for the unified construction placeholder page.
 * Out of scope: notice-detail content, backend content fetching, and route parsing.
 */

export interface UpdatingContentPreset {
  description: string
  reserveHint: string
  badges: string[]
}

const defaultUpdatingPreset: UpdatingContentPreset = {
  description: '该入口已预留，后续会接入真实流程、参数校验与结果反馈链路。',
  reserveHint: '当前阶段只提供统一建设中提示，不接入真实业务执行。',
  badges: ['Activity', 'Entry Reserved', 'Pipeline Pending'],
}

const updatingPresetMap: Record<string, UpdatingContentPreset> = {
  'UPD-HOME-BANNER': {
    description: '主视觉入口正在接入正式活动状态流和实时反馈链路。',
    reserveHint: '当前仅开放统一建设中提示，待后端状态流联调后启用。',
    badges: ['Banner', 'Entry Reserved', 'Pipeline Pending'],
  },
  'UPD-HOME-COLLECTION': {
    description: '首发藏品链路正在补齐价格校验与铸造节流逻辑。',
    reserveHint: '请以公告回执为准，勿重复提交同一交易动作。',
    badges: ['Collection', 'Entry Reserved', 'Pipeline Pending'],
  },
  'UPD-PROFILE-SYNC': {
    description: '账户同步链路已预留，后续会接入资产明细校验与异常回执。',
    reserveHint: '当前展示为统一建设中提示，暂不触发真实账户同步。',
    badges: ['Profile', 'Entry Reserved', 'Pipeline Pending'],
  },
  'UPD-PROFILE-ADDRESS': {
    description: '地址二维码入口已收口为统一建设中提示，暂不打开独立二维码页。',
    reserveHint: '正式上线前如需展示地址，请使用个人页已展示的钱包地址文本。',
    badges: ['Profile', 'Address', 'Pipeline Pending'],
  },
  'UPD-PROFILE-ASSETS': {
    description: '个人资产搜索页已退出独立占位壳，当前仅保留详情页真实入口。',
    reserveHint: '资产列表筛选与搜索需要后续单独接入真实数据链路。',
    badges: ['Profile', 'Assets', 'Pipeline Pending'],
  },
  'UPD-SETTINGS': {
    description: '设置页入口已收口为统一建设中提示，暂不保留单独设置页壳。',
    reserveHint: '账号安全、通知偏好等设置项后续需要按真实能力逐项接入。',
    badges: ['Settings', 'Entry Reserved', 'Pipeline Pending'],
  },
}

const resolvePrefixPreset = (moduleId: string): UpdatingContentPreset | undefined => {
  if (moduleId.startsWith('UPD-NOTICE-') || moduleId.startsWith('UPD-ACT-NOTICE-')) {
    return {
      description: '公告详情独立占位页已退出，当前点击公告统一进入建设中提示。',
      reserveHint: '正式公告列表和已读回执仍走内容域接口；这里不再保留 notice 占位内容链。',
      badges: ['Notice', 'Unified Pending', 'No Placeholder Chain'],
    }
  }

  if (moduleId.startsWith('UPD-SERVICE-')) {
    return {
      description: '该服务入口暂未接入真实业务流程，已统一进入建设中提示。',
      reserveHint: '后续会按服务类型分别接入真实页面或真实 action，不再新增单独占位页壳。',
      badges: ['Service', 'Entry Reserved', 'Pipeline Pending'],
    }
  }

  if (moduleId.startsWith('UPD-ACT-')) {
    return {
      description: '活动入口暂未接入完整活动详情或报名流程，当前统一展示建设中提示。',
      reserveHint: '活动列表和公告回执仍保留现有数据链路；详情行为后续单独补齐。',
      badges: ['Activity', 'Entry Reserved', 'Pipeline Pending'],
    }
  }

  if (moduleId.startsWith('UPD-HOME-COL-')) {
    return {
      description: '藏品交易相关入口暂未接入真实交易流程，当前统一展示建设中提示。',
      reserveHint: '当前不会触发购买、铸造、搜索或提交动作。',
      badges: ['Market', 'Entry Reserved', 'Pipeline Pending'],
    }
  }

  return undefined
}

const cloneUpdatingPreset = (preset: UpdatingContentPreset): UpdatingContentPreset => {
  return {
    ...preset,
    badges: [...preset.badges],
  }
}

export const resolveUpdatingContent = (moduleId: string, source: string): UpdatingContentPreset => {
  const preset = cloneUpdatingPreset(
    updatingPresetMap[moduleId] ?? resolvePrefixPreset(moduleId) ?? defaultUpdatingPreset
  )
  const normalizedSource = source.trim().toUpperCase()

  return {
    description: preset.description,
    reserveHint: preset.reserveHint,
    badges: normalizedSource ? [normalizedSource, ...preset.badges.slice(1)] : [...preset.badges],
  }
}
