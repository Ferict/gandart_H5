/**
 * Responsibility: hold the page-local view model used by the retained priority-draw module page
 * while the formal backend contract and runtime adapter are still pending.
 * Out of scope: real activity fetching, navigation side effects, and action execution.
 */
import type { AetherIconName } from '../../models/ui/aetherIcon.model'

export type PriorityDrawStatus = 'LIVE' | 'UPCOMING' | 'ENDED'
export type PriorityDrawCoverTone = 'cyan' | 'amber' | 'violet' | 'slate'

export interface PriorityDrawEventViewModel {
  id: string
  title: string
  status: PriorityDrawStatus
  coverImageUrl: string
  timeRange: string
  condition: string
  quota: number
  participants: number
  isEligible: boolean
  coverTone: PriorityDrawCoverTone
  coverIcon: AetherIconName
}

export const priorityDrawEventList: PriorityDrawEventViewModel[] = [
  {
    id: 'DRW-099',
    title: '温柔旅途特别抽签',
    status: 'LIVE',
    coverImageUrl: '/static/updating/priority-draw/draw-099-gentle-journey.jpg',
    timeRange: '05.20 10:00 - 06.20 18:00',
    condition: '持有任意旅途或花园系列藏品',
    quota: 520,
    participants: 1680,
    isEligible: true,
    coverTone: 'amber',
    coverIcon: 'gift',
  },
  {
    id: 'DRW-100',
    title: '命运之轮新篇章抽签',
    status: 'UPCOMING',
    coverImageUrl: '/static/updating/priority-draw/draw-100-wheel-of-fate.jpg',
    timeRange: '06.01 12:00 - 06.08 12:00',
    condition: '持有任意神话序列藏品',
    quota: 300,
    participants: 0,
    isEligible: false,
    coverTone: 'slate',
    coverIcon: 'award',
  },
  {
    id: 'DRW-098',
    title: '风雪赴京途纪念抽签',
    status: 'ENDED',
    coverImageUrl: '/static/updating/priority-draw/draw-098-snow-capital.jpg',
    timeRange: '04.01 10:00 - 04.08 18:00',
    condition: '完成实名并持有东方系列藏品',
    quota: 880,
    participants: 6420,
    isEligible: true,
    coverTone: 'slate',
    coverIcon: 'gift',
  },
  {
    id: 'DRW-097',
    title: '风的旅人藏品抽签',
    status: 'ENDED',
    coverImageUrl: '/static/updating/priority-draw/draw-097-wind-traveler.jpg',
    timeRange: '03.20 10:00 - 03.27 18:00',
    condition: '持有任意旅人或风语系列藏品',
    quota: 620,
    participants: 3520,
    isEligible: false,
    coverTone: 'violet',
    coverIcon: 'users',
  },
]
