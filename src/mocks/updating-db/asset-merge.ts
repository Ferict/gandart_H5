/**
 * Responsibility: provide centralized retained mock records for the updating asset-merge page.
 * Out of scope: page rendering, runtime orchestration, and provider selection.
 */
import type {
  AssetMergeEventDto,
  AssetMergeRecipeDto,
  AssetMergeStatusDto,
  AssetMergeToneDto,
} from '../../pages/updating/runtime/asset-merge.port'

const cloneStatus = (status: AssetMergeStatusDto): AssetMergeStatusDto => status
const cloneTone = (tone: AssetMergeToneDto): AssetMergeToneDto => tone
const cloneRecipes = (recipes: AssetMergeRecipeDto[]): AssetMergeRecipeDto[] =>
  recipes.map((recipe) => ({
    ...recipe,
    materials: recipe.materials.map((material) => ({ ...material })),
  }))

export const assetMergeEventDb: AssetMergeEventDto[] = [
  {
    id: 'MRG-099',
    title: '「神启」宇宙机文明',
    status: 'LIVE',
    timeRange: '2026.03.27 10:00 - 04.15 18:00',
    countdownLabel: '剩余 47:22:15',
    participants: 12408,
    formula: '2x 零号序列 + 1x 脉冲核心',
    totalSupply: 500,
    remainingSupply: 128,
    coverImageUrl: '/static/home/market/c23-market.png',
    tone: 'dark',
    yieldAsset: {
      id: 'AX-099',
      title: '「神启」宇宙机文明',
      level: '创世级 Genesis',
      coverImageUrl: '/static/home/market/c23-market.png',
    },
    recipes: [
      {
        id: 'recipe-099-a',
        name: '精准重构',
        materials: [
          {
            id: 'mat-099-zero',
            name: '零号序列',
            owned: 2,
            required: 2,
            coverImageUrl: '/static/home/market/c05-market.png',
          },
          {
            id: 'mat-099-pulse',
            name: '脉冲核心',
            owned: 1,
            required: 1,
            coverImageUrl: '/static/home/market/c06-market.png',
          },
        ],
      },
      {
        id: 'recipe-099-b',
        name: '模糊熔铸',
        materials: [
          {
            id: 'mat-099-crystal',
            name: '万能结晶',
            owned: 3,
            required: 5,
            coverImageUrl: '/static/home/market/c08-market.png',
          },
          {
            id: 'mat-099-canvas',
            name: '基础画布',
            owned: 1,
            required: 1,
            coverImageUrl: '/static/home/market/c13-market.png',
          },
        ],
      },
    ],
    rules: [
      '每消耗一组方案规定的素材，将获得上方展示的目标资产。',
      '不同合成方案对应相同目标产物，可根据持仓自行选择。',
      '目标资产带有唯一序列号，活动结束后不再开放合成。',
    ],
  },
  {
    id: 'MRG-100',
    title: '「羁绊」草原小王子与狐',
    status: 'UPCOMING',
    timeRange: '2026.04.20 12:00 - 05.01 12:00',
    countdownLabel: '04.20 开始',
    participants: 0,
    formula: '3x 幽灵协议碎片',
    totalSupply: 15000,
    remainingSupply: 15000,
    coverImageUrl: '/static/home/market/c20-market.png',
    tone: 'field',
    yieldAsset: {
      id: 'AX-102',
      title: '「羁绊」草原小王子与狐',
      level: '史诗级 Epic',
      coverImageUrl: '/static/home/market/c20-market.png',
    },
    recipes: [
      {
        id: 'recipe-100-a',
        name: '碎片合成',
        materials: [
          {
            id: 'mat-100-fragment',
            name: '幽灵协议碎片',
            owned: 1,
            required: 3,
            coverImageUrl: '/static/home/market/c09-market.png',
          },
        ],
      },
    ],
    rules: [
      '活动开始后开放合成入口。',
      '素材数量满足要求后可提交合成。',
      '目标资产发放以后续活动通知为准。',
    ],
  },
  {
    id: 'MRG-098',
    title: '「凛冬」大明风雪上朝图',
    status: 'LIVE',
    timeRange: '2026.03.20 08:00 - 04.10 20:00',
    countdownLabel: '剩余 12 天',
    participants: 3860,
    formula: '1x 以太之种 + 充能核心',
    totalSupply: 200,
    remainingSupply: 14,
    coverImageUrl: '/static/home/market/c25-market.png',
    tone: 'snow',
    yieldAsset: {
      id: 'AX-103',
      title: '「凛冬」大明风雪上朝图',
      level: '稀有级 Rare',
      coverImageUrl: '/static/home/market/c25-market.png',
    },
    recipes: [
      {
        id: 'recipe-098-a',
        name: '雪境铸造',
        materials: [
          {
            id: 'mat-098-seed',
            name: '以太之种',
            owned: 1,
            required: 1,
            coverImageUrl: '/static/home/market/c07-market.png',
          },
          {
            id: 'mat-098-core',
            name: '充能核心',
            owned: 0,
            required: 1,
            coverImageUrl: '/static/home/market/c14-market.png',
          },
        ],
      },
    ],
    rules: [
      '本期合成名额较少，剩余份数以页面展示为准。',
      '素材不足时无法提交合成。',
      '合成完成后资产将进入个人藏品列表。',
    ],
  },
  {
    id: 'MRG-097',
    title: '「狂舞」旷野风暴油画',
    status: 'ENDED',
    timeRange: '2026.02.01 00:00 - 02.28 23:59',
    countdownLabel: '已结束',
    participants: 5280,
    formula: '1x 狂野结晶 + 基础画布',
    totalSupply: 800,
    remainingSupply: 0,
    coverImageUrl: '/static/home/market/c26-market.png',
    tone: 'warm',
    yieldAsset: {
      id: 'AX-104',
      title: '「狂舞」旷野风暴',
      level: '典藏级 Collection',
      coverImageUrl: '/static/home/market/c26-market.png',
    },
    recipes: [
      {
        id: 'recipe-097-a',
        name: '旷野合成',
        materials: [
          {
            id: 'mat-097-crystal',
            name: '狂野结晶',
            owned: 0,
            required: 1,
            coverImageUrl: '/static/home/market/c17-market.png',
          },
          {
            id: 'mat-097-canvas',
            name: '基础画布',
            owned: 0,
            required: 1,
            coverImageUrl: '/static/home/market/c22-market.png',
          },
        ],
      },
    ],
    rules: [
      '本期活动已结束，仅保留活动信息展示。',
      '已结束活动不可继续提交合成。',
      '后续同系列活动请关注公告入口。',
    ],
  },
]

export const cloneAssetMergeEventDb = (): AssetMergeEventDto[] =>
  assetMergeEventDb.map((event) => ({
    ...event,
    status: cloneStatus(event.status),
    tone: cloneTone(event.tone),
    yieldAsset: { ...event.yieldAsset },
    recipes: cloneRecipes(event.recipes),
    rules: [...event.rules],
  }))
