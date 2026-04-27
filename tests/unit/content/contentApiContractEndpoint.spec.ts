import {
  CONTENT_API_ENDPOINTS,
  type ContentEnvelope,
  type NoticeReadActionResultDto,
} from '@/contracts/content-api.contract'
import { createContentHttpImplementation } from '@/implementations/content.http'

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

const createEnvelope = (data: unknown) => ({
  code: 0,
  message: 'ok',
  requestId: 'req_test_001',
  serverTime: '2026-04-15T00:00:00+08:00',
  data,
})

const buildResponseData = (options: MockUniRequestOptions) => {
  const requestPayload =
    typeof options.data === 'object' && options.data !== null
      ? (options.data as { actionType?: string })
      : undefined

  if (requestPayload?.actionType === 'notice-read') {
    return {
      noticeId: 'notice_001',
      isUnread: false,
    }
  }

  if (requestPayload?.actionType === 'service-reminder-consume') {
    return {
      serviceId: 'orders',
      hasReminder: false,
      unreadCount: 0,
    }
  }

  return null
}

const parseJsonObject = (value: string) => JSON.parse(value) as Record<string, unknown>

describe('content contract endpoint consistency', () => {
  const requestCalls: Array<{ method: string; url: string }> = []

  beforeEach(() => {
    requestCalls.length = 0

    vi.stubGlobal('uni', {
      request(options: MockUniRequestOptions) {
        requestCalls.push({
          method: options.method,
          url: options.url,
        })
        options.success?.({
          statusCode: 200,
          data: createEnvelope(buildResponseData(options)),
          header: {},
        })
      },
    })
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('keeps adapter method/path usage aligned with contract endpoint exports', async () => {
    const implementation = createContentHttpImplementation({
      baseUrl: 'https://api.example.com',
      isProduction: true,
    })

    await implementation.getScene({ sceneId: 'home' })
    await implementation.getResource({
      resourceType: 'notice',
      resourceId: 'notice_001',
    })
    await implementation.getList({
      resourceType: 'market_item',
      page: 1,
      pageSize: 20,
    })
    await implementation.runAction({
      actionType: 'notice-read',
      noticeId: 'notice_001',
    })
    await implementation.runAction({
      actionType: 'service-reminder-consume',
      serviceId: 'orders',
    })

    expect(requestCalls).toEqual([
      {
        method: CONTENT_API_ENDPOINTS.scene.method,
        url: `https://api.example.com${CONTENT_API_ENDPOINTS.scene.path}?sceneId=home`,
      },
      {
        method: CONTENT_API_ENDPOINTS.resource.method,
        url: `https://api.example.com${CONTENT_API_ENDPOINTS.resource.path}?resourceType=notice&resourceId=notice_001`,
      },
      {
        method: CONTENT_API_ENDPOINTS.list.method,
        url: `https://api.example.com${CONTENT_API_ENDPOINTS.list.path}?resourceType=market_item&page=1&pageSize=20`,
      },
      {
        method: CONTENT_API_ENDPOINTS.noticeRead.method,
        url: `https://api.example.com${CONTENT_API_ENDPOINTS.noticeRead.path}`,
      },
      {
        method: CONTENT_API_ENDPOINTS.serviceReminderConsume.method,
        url: `https://api.example.com${CONTENT_API_ENDPOINTS.serviceReminderConsume.path}`,
      },
    ])
  })

  it('keeps backend handoff JSON examples parseable and aligned with wire DTO names', () => {
    expect(CONTENT_API_ENDPOINTS.list.request).toBe('ContentListWireQueryDto')
    expect(CONTENT_API_ENDPOINTS.list.response).toBe('ContentEnvelope<ContentListDto>')

    for (const endpoint of Object.values(CONTENT_API_ENDPOINTS)) {
      const successExample = parseJsonObject(endpoint.successExample)

      expect(successExample).toHaveProperty('code')
      expect(successExample).toHaveProperty('message')
      expect(successExample).toHaveProperty('requestId')
      expect(successExample).toHaveProperty('serverTime')
      expect(successExample).toHaveProperty('data')

      if ('requestBodyJsonExample' in endpoint && endpoint.requestBodyJsonExample) {
        const requestBodyExample = parseJsonObject(endpoint.requestBodyJsonExample)
        expect(requestBodyExample).toHaveProperty('actionType')
      }
    }

    expect(
      parseJsonObject(CONTENT_API_ENDPOINTS.noticeRead.requestBodyJsonExample ?? '').actionType
    ).toBe('notice-read')
    expect(
      parseJsonObject(CONTENT_API_ENDPOINTS.serviceReminderConsume.requestBodyJsonExample ?? '')
        .actionType
    ).toBe('service-reminder-consume')
  })

  it('allows business failure envelopes to keep data explicitly null', () => {
    const failureEnvelope: ContentEnvelope<NoticeReadActionResultDto> = {
      code: 1001,
      message: 'notice not found',
      requestId: 'req_test_failure',
      serverTime: '2026-04-20T00:00:00.000Z',
      data: null,
    }

    expect(failureEnvelope.data).toBeNull()
  })

  it('serializes formal marketKind query param when present', async () => {
    const implementation = createContentHttpImplementation({
      baseUrl: 'https://api.example.com',
      isProduction: true,
    })

    await implementation.getList({
      resourceType: 'market_item',
      marketKind: 'blindBoxes',
      page: 1,
      pageSize: 20,
    })

    expect(requestCalls.at(-1)).toEqual({
      method: CONTENT_API_ENDPOINTS.list.method,
      url: `https://api.example.com${CONTENT_API_ENDPOINTS.list.path}?resourceType=market_item&marketKind=blindBoxes&page=1&pageSize=20`,
    })
  })
})
