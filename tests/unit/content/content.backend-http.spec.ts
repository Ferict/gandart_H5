import { createContentBackendHttpImplementation } from '@/implementations/content.backend-http'

interface MockUniRequestResponse {
  statusCode: number
  data: unknown
  header?: Record<string, string>
}

interface MockUniRequestOptions {
  method: string
  url: string
  data?: unknown
  header?: Record<string, string>
  success?: (response: MockUniRequestResponse) => void
  fail?: (error: unknown) => void
}

describe('content.backend-http provider', () => {
  const requestCalls: MockUniRequestOptions[] = []

  beforeEach(() => {
    requestCalls.length = 0
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('生产环境仅允许 https 后端基地址', () => {
    expect(() =>
      createContentBackendHttpImplementation({
        baseUrl: 'https://legacy.example.com',
        isProduction: true,
      })
    ).not.toThrow()

    expect(() =>
      createContentBackendHttpImplementation({
        baseUrl: 'http://legacy.example.com',
        isProduction: true,
      })
    ).toThrow('must use https:// in production')
  })

  it('把 market_item 分页请求转到旧后端市场列表接口并归一成现行 ContentListDto', async () => {
    vi.stubGlobal('uni', {
      request(options: MockUniRequestOptions) {
        requestCalls.push(options)
        options.success?.({
          statusCode: 200,
          data: {
            code: 0,
            msg: 'ok',
            data: [
              {
                id: 101,
                product: {
                  id: 501,
                  name: '龙纹藏品',
                  listimg: 'https://img.example.com/dragon.png',
                },
                price: '129.00',
                total_num: '3000',
                flux: '12',
              },
            ],
          },
          header: {},
        })
      },
    })

    const implementation = createContentBackendHttpImplementation({
      baseUrl: 'https://legacy.example.com',
      isProduction: true,
    })

    const response = await implementation.getList({
      resourceType: 'market_item',
      categoryId: 'series_a',
      keyword: '龙',
      sort: {
        field: 'listedAt',
        direction: 'desc',
      },
      page: 2,
      pageSize: 5,
    })

    expect(requestCalls).toHaveLength(1)
    expect(requestCalls[0]).toMatchObject({
      method: 'POST',
      url: 'https://legacy.example.com/market/market/getMarketList',
      data: {
        page: 2,
        list_rows: 5,
        series_id: 'series_a',
        keywords: '龙',
      },
    })
    expect(response.envelope.code).toBe(0)
    expect(response.envelope.message).toBe('ok')
    expect(response.envelope.data).toMatchObject({
      resourceType: 'market_item',
      page: 2,
      pageSize: 5,
      total: 6,
      items: [
        {
          resourceType: 'market_item',
          resourceId: '101',
          title: '龙纹藏品',
          status: 'active',
          asset: {
            originalUrl: 'https://img.example.com/dragon.png',
          },
          payload: {
            currency: 'CNY',
            priceInCent: 12900,
            issueCount: 3000,
            holderCount: 12,
            categoryIds: ['series_a'],
          },
        },
      ],
    })
  })

  it('旧后端业务错误不会被归一成成功列表', async () => {
    vi.stubGlobal('uni', {
      request(options: MockUniRequestOptions) {
        options.success?.({
          statusCode: 200,
          data: {
            code: 702,
            msg: '未登录',
            data: null,
          },
          header: {},
        })
      },
    })

    const implementation = createContentBackendHttpImplementation({
      baseUrl: 'https://legacy.example.com',
      isProduction: true,
    })

    const response = await implementation.getList({
      resourceType: 'profile_asset',
      page: 1,
      pageSize: 10,
    })

    expect(response.envelope).toMatchObject({
      code: 702,
      message: '未登录',
      data: null,
    })
  })

  it('把首页 scene 组装到现行首屏内容块，不让页面直接理解旧接口', async () => {
    vi.stubGlobal('uni', {
      request(options: MockUniRequestOptions) {
        requestCalls.push(options)
        const url = options.url
        const responseData = url.includes('/banner/show/getBanner')
          ? {
              data: {
                data: [
                  {
                    id: 'banner_1',
                    title: '首屏横幅',
                    image: 'https://img.example.com/banner.png',
                  },
                ],
              },
            }
          : url.includes('/box/blind_box/list')
            ? {
                data: [
                  {
                    id: 'drop_1',
                    name: '首发藏品',
                    price: '88.00',
                    total_num: '2000',
                    listimg: 'https://img.example.com/drop.png',
                  },
                ],
              }
            : url.includes('/index/afficheList')
              ? {
                  data: {
                    data: [
                      {
                        id: 'notice_1',
                        title: '系统公告',
                        type_name: '平台',
                        create_time: '2026-04-24T10:00:00+08:00',
                      },
                    ],
                  },
                }
              : {
                  data: [
                    {
                      id: 'market_1',
                      product: {
                        name: '市场藏品',
                        listimg: 'https://img.example.com/market.png',
                      },
                      price: '19.00',
                      total_num: '500',
                    },
                  ],
                }

        options.success?.({
          statusCode: 200,
          data: {
            code: 0,
            msg: 'ok',
            ...responseData,
          },
          header: {},
        })
      },
    })

    const implementation = createContentBackendHttpImplementation({
      baseUrl: 'https://legacy.example.com',
      isProduction: true,
    })

    const response = await implementation.getScene({ sceneId: 'home' })

    expect(requestCalls.map((item) => item.url)).toEqual([
      'https://legacy.example.com/index/afficheList',
      'https://legacy.example.com/banner/show/getBanner',
      'https://legacy.example.com/box/blind_box/list',
      'https://legacy.example.com/market/market/getMarketList',
    ])
    expect(response.code).toBe(0)
    expect(response.data?.blocks.map((block) => block.blockType)).toEqual([
      'notice_bar',
      'banner_carousel',
      'featured_drop',
      'market_overview',
    ])
    expect(response.data?.blocks[1]).toMatchObject({
      blockType: 'banner_carousel',
      items: [
        {
          bannerId: 'banner_1',
          title: '首屏横幅',
          asset: {
            originalUrl: 'https://img.example.com/banner.png',
          },
        },
      ],
    })
  })

  it('把 activity 与 profile scene 接入旧后端主入口并输出现行块结构', async () => {
    vi.stubGlobal('uni', {
      request(options: MockUniRequestOptions) {
        requestCalls.push(options)
        const url = options.url
        const responseData = url.includes('/activity/index')
          ? {
              data: [
                {
                  id: 'activity_1',
                  title: '优先购抽签',
                  desc: '资格确认中',
                  status_label: '进行中',
                },
              ],
            }
          : url.includes('/user/getUserInfo')
            ? {
                data: {
                  id: 'user_1',
                  nickname: '测试用户',
                  mobile: '13800000000',
                  user_hash: '0xabc',
                  total_money: '234.00',
                  collection_num: '7',
                  invitation_code: 'INVITE-001',
                },
              }
            : url.includes('/user_collection/user_collection/antMycollection')
              ? {
                  data: [
                    {
                      id: 'asset_1',
                      product: {
                        name: '个人藏品',
                        listimg: 'https://img.example.com/asset.png',
                      },
                      price: '66.00',
                      total_num: '1000',
                      num: '2',
                    },
                  ],
                }
              : {
                  data: {
                    data: [
                      {
                        id: 'notice_1',
                        title: '活动公告',
                        type_name: '活动',
                        create_time: '2026-04-24T10:00:00+08:00',
                      },
                    ],
                  },
                }

        options.success?.({
          statusCode: 200,
          data: {
            code: 0,
            msg: 'ok',
            ...responseData,
          },
          header: {},
        })
      },
    })

    const implementation = createContentBackendHttpImplementation({
      baseUrl: 'https://legacy.example.com',
      isProduction: true,
    })

    const activity = await implementation.getScene({ sceneId: 'activity' })
    const profile = await implementation.getScene({ sceneId: 'profile' })

    expect(activity.data?.blocks.map((block) => block.blockType)).toEqual([
      'activity_entries',
      'activity_notice_feed',
    ])
    expect(profile.data?.blocks.map((block) => block.blockType)).toEqual([
      'profile_summary',
      'profile_assets',
    ])
    expect(profile.data?.blocks[0]).toMatchObject({
      blockType: 'profile_summary',
      displayName: '测试用户',
      address: '0xabc',
      totalValueInCent: 23400,
      holdingsCount: 7,
      qrPayload: 'INVITE-001',
    })
  })

  it('把 profile_asset 和 notice 详情资源接入旧后端详情接口', async () => {
    vi.stubGlobal('uni', {
      request(options: MockUniRequestOptions) {
        requestCalls.push(options)
        const url = options.url
        const responseData = url.includes('/user_collection/user_collection/detail/ids/asset_1')
          ? {
              data: {
                id: 'asset_1',
                product: {
                  id: 'product_1',
                  name: '详情藏品',
                  listimg: 'https://img.example.com/detail.png',
                  total_num: '1000',
                },
                price: '66.00',
                num: '3',
                rz_code: 'NO.001',
              },
            }
          : {
              data: {
                id: 'notice_1',
                title: '详情公告',
                type_name: '平台',
                content: '公告正文',
                create_time: '2026-04-24T10:00:00+08:00',
              },
            }

        options.success?.({
          statusCode: 200,
          data: {
            code: 0,
            msg: 'ok',
            ...responseData,
          },
          header: {},
        })
      },
    })

    const implementation = createContentBackendHttpImplementation({
      baseUrl: 'https://legacy.example.com',
      isProduction: true,
    })

    const asset = await implementation.getResource({
      resourceType: 'profile_asset',
      resourceId: 'asset_1',
    })
    const notice = await implementation.getResource({
      resourceType: 'notice',
      resourceId: 'notice_1',
    })

    expect(requestCalls.map((item) => item.url)).toEqual([
      'https://legacy.example.com/user_collection/user_collection/detail/ids/asset_1',
      'https://legacy.example.com/index/afficheDetail/ids/notice_1',
    ])
    expect(asset.data).toMatchObject({
      resourceType: 'profile_asset',
      resourceId: 'asset_1',
      title: '详情藏品',
      payload: {
        holdingsCount: 3,
        priceInCent: 6600,
        issueCount: 1000,
      },
    })
    expect(notice.data).toMatchObject({
      resourceType: 'notice',
      resourceId: 'notice_1',
      title: '详情公告',
      payload: {
        blocks: [
          {
            kind: 'paragraph',
            text: '公告正文',
          },
        ],
      },
    })
  })
})
