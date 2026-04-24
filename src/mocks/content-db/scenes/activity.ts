/**
 * Responsibility: define the mock activity-scene source data, including featured activity
 * entries and notice-list source records consumed by the content mock provider.
 * Out of scope: scene response wrapping, notice result-window behavior, and activity page UI state.
 */
import type {
  ContentActivityEntryTone,
  ContentTargetDto,
} from '../../../contracts/content-api.contract'

export interface ActivitySceneEntryRecord {
  entryId: string
  title: string
  eyebrow: string
  description: string
  tone: ContentActivityEntryTone
  badgeLabel?: string
  target: ContentTargetDto
}

export interface ActivitySceneDb {
  sceneId: 'activity'
  version: number
  updatedAt: string
  entries: ActivitySceneEntryRecord[]
  notices: {
    tags: string[]
    noticeIds: string[]
  }
}

export const activitySceneDb: ActivitySceneDb = {
  sceneId: 'activity',
  version: 2,
  updatedAt: '2026-03-27T09:38:00+08:00',
  entries: [
    {
      entryId: 'asset-merge',
      title: '资产合成',
      eyebrow: 'MERGE',
      description: '核心素材融合通道已开放。',
      tone: 'dark',
      badgeLabel: 'NEW',
      target: {
        targetType: 'activity',
        targetId: 'asset-merge',
        provider: 'content',
      },
    },
    {
      entryId: 'priority-draw',
      title: '抽奖活动',
      eyebrow: 'DRAW',
      description: '优先参与资格正在同步。',
      tone: 'light',
      badgeLabel: 'NEW',
      target: {
        targetType: 'activity',
        targetId: 'priority-draw',
        provider: 'content',
      },
    },
    {
      entryId: 'network-invite',
      title: '邀请好友共建节点',
      eyebrow: 'INVITE',
      description: '邀请好友加入并解锁协作奖励。',
      tone: 'soft',
      target: {
        targetType: 'activity',
        targetId: 'network-invite',
        provider: 'content',
      },
    },
  ],
  notices: {
    tags: ['全部', '寄售', '限价', '发售', '空投', '合成', '平台', '置换'],
    noticeIds: [
      'N-12',
      'N-03',
      'N-15',
      'N-07',
      'N-01',
      'N-16',
      'N-09',
      'N-05',
      'N-13',
      'N-02',
      'N-17',
      'N-10',
      'N-04',
      'N-14',
      'N-11',
      'N-06',
      'N-08',
    ],
  },
}
