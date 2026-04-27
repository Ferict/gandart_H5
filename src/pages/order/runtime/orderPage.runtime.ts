/**
 * Responsibility: provide page-local order archive tab options, mock records, and filtering
 * helpers for the personal-center order page.
 * Out of scope: backend order transport, payment execution, receipt fetching, and global
 * contract fields.
 */
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'

export type OrderCategoryId = 'collections' | 'blindBoxes' | 'starlight'
export type OrderStatusFilterId = 'all' | 'pendingPayment' | 'processing' | 'completed' | 'expired'
export type OrderRecordStatus = Exclude<OrderStatusFilterId, 'all'>
export type OrderStatusTone = 'cyan' | 'amber' | 'muted'

export interface OrderCategoryOption {
  id: OrderCategoryId
  label: string
}

export interface OrderStatusOption {
  id: OrderStatusFilterId
  label: string
}

export interface OrderRecord {
  id: string
  category: OrderCategoryId
  orderNo: string
  timestamp: string
  status: OrderRecordStatus
  statusLabel: string
  statusTone: OrderStatusTone
  statusIconName: AetherIconName
  assetName: string
  collectionLabel: string
  coverImageUrl: string
  price: string
  currency: string
  actionLabel: string
}

export interface OrderFilterInput {
  category: OrderCategoryId
  status: OrderStatusFilterId
  keyword: string
}

export const ORDER_CATEGORY_OPTIONS: OrderCategoryOption[] = [
  { id: 'collections', label: '藏品' },
  { id: 'blindBoxes', label: '盲盒' },
  { id: 'starlight', label: '星光' },
]

export const ORDER_STATUS_OPTIONS: OrderStatusOption[] = [
  { id: 'all', label: '全部' },
  { id: 'pendingPayment', label: '待支付' },
  { id: 'processing', label: '处理中' },
  { id: 'completed', label: '已完成' },
  { id: 'expired', label: '已失效' },
]

// Real order-state mapping belongs to the future adapter/view-model wiring; these are UI-only seeds.
export const orderRecordSeeds: OrderRecord[] = [
  {
    id: 'order-99x-2026a',
    category: 'collections',
    orderNo: 'ORD-99X-2026A',
    timestamp: '2026.03.27 14:05:22',
    status: 'completed',
    statusLabel: '已完成',
    statusTone: 'cyan',
    statusIconName: 'check-circle-2',
    assetName: '「神启」创世机甲 - 零号机',
    collectionLabel: 'Genesis',
    coverImageUrl: '/static/home/market/c02-market.png',
    price: '2450.00',
    currency: '￥',
    actionLabel: '查看凭单',
  },
  {
    id: 'order-82b-1092c',
    category: 'blindBoxes',
    orderNo: 'ORD-82B-1092C',
    timestamp: '2026.03.26 09:12:05',
    status: 'pendingPayment',
    statusLabel: '待支付',
    statusTone: 'amber',
    statusIconName: 'clock',
    assetName: '「羁绊」草原小王子与狐',
    collectionLabel: 'Epic',
    coverImageUrl: '/static/home/market/c10-market.png',
    price: '850.00',
    currency: '￥',
    actionLabel: '继续支付',
  },
  {
    id: 'order-11a-4432f',
    category: 'collections',
    orderNo: 'ORD-11A-4432F',
    timestamp: '2026.03.20 18:30:00',
    status: 'completed',
    statusLabel: '已完成',
    statusTone: 'cyan',
    statusIconName: 'check-circle-2',
    assetName: 'AETHER 档案碎片 (Bundle)',
    collectionLabel: 'Material',
    coverImageUrl: '/static/home/market/c20-market.png',
    price: '120.00',
    currency: '￥',
    actionLabel: '查看凭单',
  },
  {
    id: 'order-05f-9981e',
    category: 'blindBoxes',
    orderNo: 'ORD-05F-9981E',
    timestamp: '2026.03.15 22:10:45',
    status: 'expired',
    statusLabel: '已失效',
    statusTone: 'muted',
    statusIconName: 'circle-x',
    assetName: '「凛冬」大明风雪上朝图',
    collectionLabel: 'Rare',
    coverImageUrl: '/static/home/market/c23-market.png',
    price: '1200.00',
    currency: '￥',
    actionLabel: '查看凭单',
  },
  {
    id: 'order-starlight-reserved-001',
    category: 'starlight',
    orderNo: 'STAR-26C-0312S',
    timestamp: '2026.03.12 11:08:16',
    status: 'processing',
    statusLabel: '处理中',
    statusTone: 'amber',
    statusIconName: 'clock',
    assetName: '星光权益档案 - 预约凭证',
    collectionLabel: 'Starlight',
    coverImageUrl: '/static/home/market/c25-market.png',
    price: '待确认',
    currency: '',
    actionLabel: '查看进度',
  },
]

const normalizeKeyword = (keyword: string) => keyword.trim().toLowerCase()

const matchesKeyword = (record: OrderRecord, keyword: string) => {
  if (!keyword) {
    return true
  }

  return [
    record.orderNo,
    record.assetName,
    record.collectionLabel,
    record.statusLabel,
    record.timestamp,
  ].some((value) => value.toLowerCase().includes(keyword))
}

export const filterOrderRecords = (records: OrderRecord[], filter: OrderFilterInput) => {
  const keyword = normalizeKeyword(filter.keyword)

  return records.filter((record) => {
    if (record.category !== filter.category) {
      return false
    }

    if (filter.status !== 'all' && record.status !== filter.status) {
      return false
    }

    return matchesKeyword(record, keyword)
  })
}
