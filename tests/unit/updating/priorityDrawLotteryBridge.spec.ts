import { describe, expect, it } from 'vitest'

import { adaptPriorityDrawEvent } from '@/pages/updating/runtime/priority-draw.adapter'
import { applyLegacyLotteryInfoToPriorityDrawEventDto } from '@/pages/updating/runtime/priority-draw.legacy-lottery'
import type { PriorityDrawEventDto } from '@/pages/updating/runtime/priority-draw.port'

const createEvent = (overrides: Partial<PriorityDrawEventDto> = {}): PriorityDrawEventDto => ({
  id: 'DRW-099',
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
  quota: 520,
  participants: 1680,
  isEligible: false,
  coverTone: 'amber',
  coverIcon: 'gift',
  prizePools: [],
  rules: [],
  result: {
    status: 'lose',
    title: '未获得资格',
    subtitle: '资格不足',
    description: '当前账号未满足活动资格。',
    actionLabel: '我知道了',
    prizeItems: [],
  },
  ...overrides,
})

describe('priority draw lottery bridge', () => {
  it('maps lottery/info remaining count into eligible priority-draw event state', () => {
    const hydrated = applyLegacyLotteryInfoToPriorityDrawEventDto(createEvent(), {
      id: 99,
      remaining: '3',
    })

    expect(hydrated.remainingDrawCount).toBe(3)
    expect(hydrated.isEligible).toBe(true)

    const viewModel = adaptPriorityDrawEvent(hydrated)
    expect(viewModel.remainingDrawCount).toBe(3)
    expect(viewModel.isEligible).toBe(true)
  })

  it('maps zero remaining count into failed eligibility state', () => {
    const hydrated = applyLegacyLotteryInfoToPriorityDrawEventDto(
      createEvent({ isEligible: true }),
      {
        id: 99,
        remaining: 0,
      }
    )

    expect(hydrated.remainingDrawCount).toBe(0)
    expect(hydrated.isEligible).toBe(false)
  })
})
