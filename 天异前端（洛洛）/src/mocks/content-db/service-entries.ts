/**
 * Responsibility: define the canonical in-repo mock service-entry database and export
 * helpers used by mock service-hub and action-entry scenes.
 * Out of scope: scene routing policy, UI presentation mapping, and provider transport.
 */
import type {
  ContentRelationType,
  ContentServiceEntryId,
  ContentServiceEntryPayloadDto,
  ContentTargetDto,
} from '../../contracts/content-api.contract'

export interface ContentServiceEntryRecord {
  serviceId: ContentServiceEntryId
  title: string
  status: string
  updatedAt: string
  summary: string
  payload: ContentServiceEntryPayloadDto
  relations?: Array<{
    relationType: ContentRelationType
    target: ContentTargetDto
  }>
}

const createServiceTarget = (targetId: string): ContentTargetDto => ({
  targetType: 'service_action',
  targetId,
})

const cloneTarget = (target?: ContentTargetDto) => (target ? { ...target } : undefined)

const clonePayload = (payload: ContentServiceEntryPayloadDto): ContentServiceEntryPayloadDto => ({
  ...payload,
  badges: [...payload.badges],
  metrics: payload.metrics.map((item) => ({ ...item })),
  sections: payload.sections.map((section) => ({
    ...section,
    items: section.items.map((item) => ({
      ...item,
      target: cloneTarget(item.target),
    })),
  })),
})

const createRecord = (record: ContentServiceEntryRecord): ContentServiceEntryRecord => ({
  ...record,
  payload: clonePayload(record.payload),
  relations: record.relations?.map((item) => ({
    relationType: item.relationType,
    target: { ...item.target },
  })),
})

export const contentServiceEntryDb: ContentServiceEntryRecord[] = [
  createRecord({
    serviceId: 'orders',
    title: '我的订单',
    status: 'LIVE',
    updatedAt: '2026-03-25T17:40:00+08:00',
    summary: '订单中心统一承接挂单、铸造、履约与归档状态，后续直接对接订单流水与筛选接口。',
    payload: {
      serviceId: 'orders',
      englishTitle: 'Order Center',
      tone: 'cyan',
      statusLabel: 'SYNCING_ORDERS',
      badges: ['Orders', 'Records'],
      metrics: [
        { metricId: 'pending', label: '待支付', value: '01', caption: 'Pending' },
        { metricId: 'minting', label: '铸造中', value: '02', caption: 'Minting' },
        { metricId: 'completed', label: '已完成', value: '12', caption: 'Completed' },
      ],
      sections: [
        {
          sectionId: 'order-status',
          title: '订单状态',
          englishTitle: 'Status',
          items: [
            {
              itemId: 'pending-orders',
              title: '待支付订单',
              description: '统一查看待支付挂单和倒计时。',
              value: '1 笔',
              target: createServiceTarget('orders-pending'),
            },
            {
              itemId: 'minting-orders',
              title: '铸造中订单',
              description: '跟踪链上确认与履约状态。',
              value: '2 笔',
              target: createServiceTarget('orders-minting'),
            },
            {
              itemId: 'history-orders',
              title: '历史成交记录',
              description: '后续并入时间筛选、导出与归档。',
              value: '12 笔',
              target: createServiceTarget('orders-history'),
            },
          ],
        },
        {
          sectionId: 'order-actions',
          title: '辅助能力',
          englishTitle: 'Actions',
          items: [
            {
              itemId: 'search-orders',
              title: '订单搜索',
              description: '后续接入关键词、编号和状态搜索。',
              target: createServiceTarget('orders-search'),
            },
            {
              itemId: 'invoice-orders',
              title: '票据与回执',
              description: '承接回执查询、发票说明和下载链路。',
              target: createServiceTarget('orders-receipts'),
            },
          ],
        },
      ],
    },
  }),
  createRecord({
    serviceId: 'auth',
    title: '实名认证',
    status: 'LIVE',
    updatedAt: '2026-03-25T17:40:00+08:00',
    summary:
      '实名认证页统一承接账户实名状态、资料校验和审核留痕，后续直接接入后端认证状态与提交流程。',
    payload: {
      serviceId: 'auth',
      englishTitle: 'Identity Verify',
      tone: 'green',
      statusLabel: 'VERIFY_READY',
      badges: ['Identity', 'Verify'],
      metrics: [
        { metricId: 'status', label: '认证状态', value: '已认证', caption: 'Verified' },
        { metricId: 'documents', label: '绑定证件', value: '1 份', caption: 'Documents' },
        { metricId: 'logs', label: '审核留痕', value: '3 条', caption: 'Logs' },
      ],
      sections: [
        {
          sectionId: 'identity-core',
          title: '身份状态',
          englishTitle: 'Identity',
          items: [
            {
              itemId: 'identity-profile',
              title: '实名信息',
              description: '统一查看实名状态、更新时间和生效范围。',
              value: '标准认证',
              target: createServiceTarget('auth-profile'),
            },
            {
              itemId: 'identity-recheck',
              title: '重新校验',
              description: '后续承接异常资料复核与更新流程。',
              target: createServiceTarget('auth-recheck'),
            },
          ],
        },
        {
          sectionId: 'identity-security',
          title: '安全联动',
          englishTitle: 'Security',
          items: [
            {
              itemId: 'risk-logs',
              title: '审核记录',
              description: '对接风控留痕、申诉与审核时间线。',
              value: '3 条',
              target: createServiceTarget('auth-logs'),
            },
            {
              itemId: 'verify-guide',
              title: '认证说明',
              description: '集中承接认证规则、材料要求和隐私说明。',
              target: createServiceTarget('auth-guide'),
            },
          ],
        },
      ],
    },
  }),
  createRecord({
    serviceId: 'wallet',
    title: '钱包管理',
    status: 'LIVE',
    updatedAt: '2026-03-25T17:40:00+08:00',
    summary:
      '钱包管理页承接地址列表、网络授权、签名记录和切换逻辑，后续直接接入真实钱包状态和授权结果。',
    payload: {
      serviceId: 'wallet',
      englishTitle: 'Wallet',
      tone: 'amber',
      statusLabel: 'WALLET_SYNC',
      badges: ['Wallet', 'Address'],
      metrics: [
        { metricId: 'connected', label: '已连接', value: '01', caption: 'Connected' },
        { metricId: 'addresses', label: '地址数量', value: '03', caption: 'Addresses' },
        { metricId: 'signatures', label: '最近签名', value: '07', caption: 'Signatures' },
      ],
      sections: [
        {
          sectionId: 'wallet-address',
          title: '地址与网络',
          englishTitle: 'Address',
          items: [
            {
              itemId: 'wallet-address-list',
              title: '地址列表',
              description: '统一查看主地址、别名与网络归属。',
              value: '3 个地址',
              target: createServiceTarget('wallet-address-list'),
            },
            {
              itemId: 'wallet-network',
              title: '网络切换',
              description: '承接链路、节点与网络授权状态。',
              target: createServiceTarget('wallet-network'),
            },
          ],
        },
        {
          sectionId: 'wallet-security',
          title: '授权与安全',
          englishTitle: 'Security',
          items: [
            {
              itemId: 'wallet-grants',
              title: '授权记录',
              description: '后续接入签名授权、授权说明和撤销流程。',
              value: '2 项',
              target: createServiceTarget('wallet-grants'),
            },
            {
              itemId: 'wallet-signatures',
              title: '签名日志',
              description: '承接最近签名记录和风险提醒。',
              value: '7 条',
              target: createServiceTarget('wallet-signatures'),
            },
          ],
        },
      ],
    },
  }),
  createRecord({
    serviceId: 'invite',
    title: '邀请好友',
    status: 'LIVE',
    updatedAt: '2026-03-25T17:40:00+08:00',
    summary:
      '邀请好友页统一承接邀请战绩、奖励说明和分发素材，后续直接接入分享海报、返利流水与活动配置。',
    payload: {
      serviceId: 'invite',
      englishTitle: 'Invite Hub',
      tone: 'rose',
      statusLabel: 'GROWTH_PIPELINE',
      badges: ['Invite', 'Reward'],
      metrics: [
        { metricId: 'friends', label: '已邀请', value: '12', caption: 'Friends' },
        { metricId: 'reward', label: '累计奖励', value: '2680', caption: 'Credits' },
        { metricId: 'pending', label: '待领取', value: '03', caption: 'Pending' },
      ],
      sections: [
        {
          sectionId: 'invite-overview',
          title: '邀请战绩',
          englishTitle: 'Overview',
          items: [
            {
              itemId: 'invite-history',
              title: '邀请记录',
              description: '统一查看邀请来源、时间和奖励状态。',
              value: '12 人',
              target: createServiceTarget('invite-history'),
            },
            {
              itemId: 'invite-reward',
              title: '奖励明细',
              description: '承接奖励累计、待发放和到账记录。',
              value: '2680 积分',
              target: createServiceTarget('invite-reward'),
            },
          ],
        },
        {
          sectionId: 'invite-assets',
          title: '分发素材',
          englishTitle: 'Assets',
          items: [
            {
              itemId: 'invite-poster',
              title: '邀请海报',
              description: '后续接入分享海报、二维码和文案模板。',
              target: createServiceTarget('invite-poster'),
            },
            {
              itemId: 'invite-rules',
              title: '规则说明',
              description: '集中承接邀请规则、限制条件和奖励说明。',
              target: createServiceTarget('invite-rules'),
            },
          ],
        },
      ],
    },
  }),
  createRecord({
    serviceId: 'community',
    title: '官方社群',
    status: 'LIVE',
    updatedAt: '2026-03-25T17:40:00+08:00',
    summary: '官方社群页统一承接频道说明、加入规则和公告同步，后续再接入外链策略与社群状态下发。',
    payload: {
      serviceId: 'community',
      englishTitle: 'Community',
      tone: 'slate',
      statusLabel: 'COMMUNITY_READY',
      badges: ['Community', 'External'],
      metrics: [
        { metricId: 'channels', label: '频道数量', value: '03', caption: 'Channels' },
        { metricId: 'admins', label: '在线管理员', value: '06', caption: 'Admins' },
        { metricId: 'announces', label: '今日公告', value: '02', caption: 'Notices' },
      ],
      sections: [
        {
          sectionId: 'community-guide',
          title: '加入说明',
          englishTitle: 'Guide',
          items: [
            {
              itemId: 'community-rules',
              title: '社群规则',
              description: '统一查看加入前提、行为规范和频道说明。',
              target: createServiceTarget('community-rules'),
            },
            {
              itemId: 'community-join',
              title: '加入入口',
              description: '后续接入真实外链策略与平台判断。',
              target: createServiceTarget('community-join'),
            },
          ],
        },
        {
          sectionId: 'community-sync',
          title: '动态同步',
          englishTitle: 'Sync',
          items: [
            {
              itemId: 'community-notices',
              title: '社群公告',
              description: '承接社群公告同步、摘要和跳转链路。',
              value: '2 条',
              target: createServiceTarget('community-notices'),
            },
            {
              itemId: 'community-feedback',
              title: '值班反馈',
              description: '后续接入问题反馈与管理员响应说明。',
              target: createServiceTarget('community-feedback'),
            },
          ],
        },
      ],
    },
  }),
]

export const cloneContentServiceEntry = (serviceId: ContentServiceEntryId) => {
  const matched = contentServiceEntryDb.find((item) => item.serviceId === serviceId)
  return matched ? createRecord(matched) : null
}
