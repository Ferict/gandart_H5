import { describe, expect, it } from 'vitest'
import {
  ORDER_CATEGORY_OPTIONS,
  ORDER_STATUS_OPTIONS,
  filterOrderRecords,
  orderRecordSeeds,
} from '../../../src/pages/order/runtime/orderPage.runtime'

describe('order page runtime', () => {
  it('keeps the three primary order categories', () => {
    expect(ORDER_CATEGORY_OPTIONS.map((item) => item.id)).toEqual([
      'collections',
      'blindBoxes',
      'starlight',
    ])
    expect(ORDER_CATEGORY_OPTIONS.map((item) => item.label)).toEqual(['藏品', '盲盒', '星光'])
  })

  it('keeps the design status tab order', () => {
    expect(ORDER_STATUS_OPTIONS.map((item) => item.id)).toEqual([
      'all',
      'pendingPayment',
      'processing',
      'completed',
      'expired',
    ])
    expect(ORDER_STATUS_OPTIONS.map((item) => item.label)).toEqual([
      '全部',
      '待支付',
      '处理中',
      '已完成',
      '已失效',
    ])
  })

  it('filters local orders by primary category and design status tabs', () => {
    expect(
      filterOrderRecords(orderRecordSeeds, {
        category: 'collections',
        status: 'all',
        keyword: '',
      })
    ).toHaveLength(2)

    expect(
      filterOrderRecords(orderRecordSeeds, {
        category: 'blindBoxes',
        status: 'all',
        keyword: '',
      }).map((item) => item.id)
    ).toEqual(['order-82b-1092c', 'order-05f-9981e'])

    expect(
      filterOrderRecords(orderRecordSeeds, {
        category: 'blindBoxes',
        status: 'pendingPayment',
        keyword: '',
      }).map((item) => item.id)
    ).toEqual(['order-82b-1092c'])

    expect(
      filterOrderRecords(orderRecordSeeds, {
        category: 'starlight',
        status: 'processing',
        keyword: '',
      }).map((item) => item.id)
    ).toEqual(['order-starlight-reserved-001'])

    expect(
      filterOrderRecords(orderRecordSeeds, {
        category: 'collections',
        status: 'completed',
        keyword: '',
      }).map((item) => item.id)
    ).toEqual(['order-99x-2026a', 'order-11a-4432f'])

    expect(
      filterOrderRecords(orderRecordSeeds, {
        category: 'blindBoxes',
        status: 'expired',
        keyword: '',
      }).map((item) => item.id)
    ).toEqual(['order-05f-9981e'])
  })

  it('keeps starlight as a local reserved category without backend dependency', () => {
    const result = filterOrderRecords(orderRecordSeeds, {
      category: 'starlight',
      status: 'all',
      keyword: '',
    })

    expect(result.map((item) => item.category)).toEqual(['starlight'])
    expect(result[0]?.assetName).toContain('星光')
  })

  it('supports local keyword filtering by order number and title', () => {
    expect(
      filterOrderRecords(orderRecordSeeds, {
        category: 'blindBoxes',
        status: 'all',
        keyword: 'ORD-82B',
      }).map((item) => item.id)
    ).toEqual(['order-82b-1092c'])

    expect(
      filterOrderRecords(orderRecordSeeds, {
        category: 'collections',
        status: 'all',
        keyword: '档案碎片',
      }).map((item) => item.id)
    ).toEqual(['order-11a-4432f'])
  })

  it('keeps all cover images local and never uses remote design assets', () => {
    expect(orderRecordSeeds.every((item) => item.coverImageUrl.startsWith('/static/'))).toBe(true)
    expect(orderRecordSeeds.some((item) => item.coverImageUrl.includes('unsplash'))).toBe(false)
  })

  it('uses the local yuan display unit instead of the reference ETH unit', () => {
    const priceList = orderRecordSeeds.map((item) => item.price)

    expect(orderRecordSeeds.some((item) => item.currency === 'ETH')).toBe(false)
    expect(priceList).not.toEqual(expect.arrayContaining(['2.450', '0.850', '0.120', '1.200']))
    expect(
      orderRecordSeeds
        .filter((item) => item.price !== '待确认')
        .every((item) => item.currency === '￥')
    ).toBe(true)
  })
})
