/**
 * Responsibility: provide centralized retained mock records for the updating priority-draw page.
 * Out of scope: page rendering, runtime orchestration, and provider selection.
 */
import type {
  PriorityDrawCoverToneDto,
  PriorityDrawEventDto,
  PriorityDrawPrizePoolDto,
  PriorityDrawResultDto,
  PriorityDrawStatusDto,
} from '../../pages/updating/runtime/priority-draw.port'

const cloneStatus = (status: PriorityDrawStatusDto): PriorityDrawStatusDto => status
const cloneCoverTone = (tone: PriorityDrawCoverToneDto): PriorityDrawCoverToneDto => tone
const clonePrizePools = (pools: PriorityDrawPrizePoolDto[]): PriorityDrawPrizePoolDto[] =>
  pools.map((pool) => ({
    ...pool,
    items: pool.items.map((item) => ({ ...item })),
  }))
const cloneResult = (result: PriorityDrawResultDto): PriorityDrawResultDto => ({
  ...result,
  prizeItems: result.prizeItems.map((item) => ({ ...item })),
})

export const priorityDrawEventDb: PriorityDrawEventDto[] = [
  {
    id: 'DRW-099',
    lotteryId: 99,
    title: '温柔旅途特别抽奖',
    status: 'LIVE',
    coverImageUrl: '/static/updating/priority-draw/draw-099-gentle-journey.jpg',
    timeRange: '05.20 10:00 - 06.20 18:00',
    timeline: {
      startTime: '2026.05.20 10:00',
      endTime: '2026.06.20 18:00',
      countdownLabel: '剩余 56 天',
    },
    condition: '持有任意旅途或花园系列藏品',
    remainingDrawCount: 3,
    quota: 520,
    participants: 1680,
    isEligible: true,
    coverTone: 'amber',
    coverIcon: 'gift',
    prizePools: [
      {
        id: 'pool-099-main',
        tierName: '限定藏品',
        quotaLabel: '520 份',
        items: [
          {
            id: 'item-099-rose',
            name: '温柔旅途纪念藏品',
            type: '限定藏品',
            quantity: 1,
            coverImageUrl: '/static/updating/priority-draw/draw-099-gentle-journey.jpg',
          },
          {
            id: 'item-099-window',
            name: '花窗旅程收藏票',
            type: '纪念凭证',
            quantity: 1,
            coverImageUrl: '/static/updating/priority-draw/draw-097-wind-traveler.jpg',
          },
        ],
      },
      {
        id: 'pool-099-bonus',
        tierName: '参与纪念',
        quotaLabel: '报名可得',
        items: [
          {
            id: 'item-099-ticket',
            name: '旅途纪念签',
            type: '纪念凭证',
            quantity: 1,
            coverImageUrl: '/static/updating/priority-draw/draw-099-gentle-journey.jpg',
          },
        ],
      },
    ],
    rules: [
      '活动期间满足持有条件的用户可报名一次。',
      '报名结束后统一公布抽奖结果，结果以页面展示为准。',
      '中签资格不可转让，实际发放时间以后续公告为准。',
    ],
    result: {
      status: 'win',
      title: '获得抽奖资格',
      subtitle: '资格已记录',
      description: '你的报名已通过校验，后续结果会在活动结束后统一公布。',
      actionLabel: '我知道了',
      prizeItems: [
        {
          id: 'result-099-ticket',
          name: '旅途纪念签',
          type: '参与凭证',
          quantity: 1,
          coverImageUrl: '/static/updating/priority-draw/draw-099-gentle-journey.jpg',
        },
      ],
    },
  },
  {
    id: 'DRW-100',
    lotteryId: 100,
    title: '命运之轮新篇章抽奖',
    status: 'UPCOMING',
    coverImageUrl: '/static/updating/priority-draw/draw-100-wheel-of-fate.jpg',
    timeRange: '06.01 12:00 - 06.08 12:00',
    timeline: {
      startTime: '2026.06.01 12:00',
      endTime: '2026.06.08 12:00',
      countdownLabel: '06.01 开始',
    },
    condition: '持有任意神话序列藏品',
    remainingDrawCount: 0,
    quota: 300,
    participants: 0,
    isEligible: false,
    coverTone: 'slate',
    coverIcon: 'award',
    prizePools: [
      {
        id: 'pool-100-main',
        tierName: '新篇章名额',
        quotaLabel: '300 份',
        items: [
          {
            id: 'item-100-wheel',
            name: '命运之轮篇章资格',
            type: '活动资格',
            quantity: 1,
            coverImageUrl: '/static/updating/priority-draw/draw-100-wheel-of-fate.jpg',
          },
        ],
      },
    ],
    rules: [
      '活动开始后开放报名入口。',
      '请在报名时间内完成资格校验，逾期不再补录。',
      '具体发放安排以后续活动公告为准。',
    ],
    result: {
      status: 'error',
      title: '暂未开放',
      subtitle: '请稍后再试',
      description: '当前活动尚未开始，报名入口会在开始时间后开放。',
      actionLabel: '返回详情',
      prizeItems: [],
      supportLabel: '活动未开始',
    },
  },
  {
    id: 'DRW-098',
    lotteryId: 98,
    title: '风雪起京都纪念抽奖',
    status: 'ENDED',
    coverImageUrl: '/static/updating/priority-draw/draw-098-snow-capital.jpg',
    timeRange: '04.01 10:00 - 04.08 18:00',
    timeline: {
      startTime: '2026.04.01 10:00',
      endTime: '2026.04.08 18:00',
      countdownLabel: '已结束',
    },
    condition: '完成实名并持有东方系列藏品',
    remainingDrawCount: 0,
    quota: 880,
    participants: 6420,
    isEligible: true,
    coverTone: 'slate',
    coverIcon: 'gift',
    prizePools: [
      {
        id: 'pool-098-main',
        tierName: '纪念藏品',
        quotaLabel: '880 份',
        items: [
          {
            id: 'item-098-snow',
            name: '风雪起京都纪念藏品',
            type: '纪念藏品',
            quantity: 1,
            coverImageUrl: '/static/updating/priority-draw/draw-098-snow-capital.jpg',
          },
        ],
      },
    ],
    rules: [
      '本期活动已结束，仅保留结果查看。',
      '中签用户需在公告时间内完成领取确认。',
      '未中签用户可继续关注后续同系列活动。',
    ],
    result: {
      status: 'lose',
      title: '本期未中签',
      subtitle: '感谢参与',
      description: '本期名额已全部确认，当前账号未获得发放资格。',
      actionLabel: '查看其他活动',
      prizeItems: [],
      supportLabel: '纪念凭证已保留',
    },
  },
  {
    id: 'DRW-097',
    lotteryId: 97,
    title: '风的旅人藏品抽奖',
    status: 'ENDED',
    coverImageUrl: '/static/updating/priority-draw/draw-097-wind-traveler.jpg',
    timeRange: '03.20 10:00 - 03.27 18:00',
    timeline: {
      startTime: '2026.03.20 10:00',
      endTime: '2026.03.27 18:00',
      countdownLabel: '已结束',
    },
    condition: '持有任意旅人或风语系列藏品',
    remainingDrawCount: 0,
    quota: 620,
    participants: 3520,
    isEligible: false,
    coverTone: 'violet',
    coverIcon: 'users',
    prizePools: [
      {
        id: 'pool-097-main',
        tierName: '旅人藏品',
        quotaLabel: '620 份',
        items: [
          {
            id: 'item-097-wind',
            name: '风的旅人藏品',
            type: '限定藏品',
            quantity: 1,
            coverImageUrl: '/static/updating/priority-draw/draw-097-wind-traveler.jpg',
          },
        ],
      },
    ],
    rules: [
      '本期活动已结束，仅保留结果查看。',
      '资格校验以活动结束前的账户状态为准。',
      '活动解释以官方公告和页面结果为准。',
    ],
    result: {
      status: 'error',
      title: '未满足条件',
      subtitle: '无法参与',
      description: '当前账号未满足本期活动要求，不能查看个人抽奖结果。',
      actionLabel: '返回活动',
      prizeItems: [],
      supportLabel: '资格不足',
    },
  },
]

export const clonePriorityDrawEventDb = (): PriorityDrawEventDto[] =>
  priorityDrawEventDb.map((event) => ({
    ...event,
    status: cloneStatus(event.status),
    coverTone: cloneCoverTone(event.coverTone),
    timeline: { ...event.timeline },
    prizePools: clonePrizePools(event.prizePools),
    rules: [...event.rules],
    result: cloneResult(event.result),
  }))
