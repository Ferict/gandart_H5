/**
 * Responsibility: provide centralized retained mock records for the updating asset-merge page.
 * Out of scope: page rendering, runtime orchestration, and provider selection.
 */
import type {
  AssetMergeEventDto,
  AssetMergeStatusDto,
  AssetMergeToneDto,
} from '../../pages/updating/runtime/asset-merge.port'

const cloneStatus = (status: AssetMergeStatusDto): AssetMergeStatusDto => status
const cloneTone = (tone: AssetMergeToneDto): AssetMergeToneDto => tone

export const assetMergeEventDb: AssetMergeEventDto[] = [
  {
    id: 'MRG-099',
    title: '「神启」宇宙机文明',
    status: 'LIVE',
    timeRange: '2026.03.27 10:00 - 04.15 18:00',
    formula: '2x 零号序列 + 1x 脉冲核心',
    totalSupply: 500,
    remainingSupply: 128,
    coverImageUrl: '/static/home/banner/ax99-banner.jpg',
    tone: 'dark',
  },
  {
    id: 'MRG-100',
    title: '「羁绊」草原小王子与狐',
    status: 'UPCOMING',
    timeRange: '2026.04.20 12:00 - 05.01 12:00',
    formula: '3x 幽灵协议碎片',
    totalSupply: 15000,
    remainingSupply: 15000,
    coverImageUrl: '/static/home/market/c03-market.jpg',
    tone: 'field',
  },
  {
    id: 'MRG-098',
    title: '「凛冬」大明风雪上朝图',
    status: 'LIVE',
    timeRange: '2026.03.20 08:00 - 04.10 20:00',
    formula: '1x 以太之种 + 充能核心',
    totalSupply: 200,
    remainingSupply: 14,
    coverImageUrl: '/static/updating/priority-draw/draw-098-snow-capital.jpg',
    tone: 'snow',
  },
  {
    id: 'MRG-097',
    title: '「狂舞」旷野风暴油画',
    status: 'ENDED',
    timeRange: '2026.02.01 00:00 - 02.28 23:59',
    formula: '1x 狂野结晶 + 基础画布',
    totalSupply: 800,
    remainingSupply: 0,
    coverImageUrl: '/static/updating/priority-draw/draw-097-wind-traveler.jpg',
    tone: 'warm',
  },
]

export const cloneAssetMergeEventDb = (): AssetMergeEventDto[] =>
  assetMergeEventDb.map((event) => ({
    ...event,
    status: cloneStatus(event.status),
    tone: cloneTone(event.tone),
  }))
