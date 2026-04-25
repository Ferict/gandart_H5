/**
 * Responsibility: implement the content-domain port against the formal HTTP API contract and transport rules.
 * Out of scope: page orchestration, cache policy decisions, and mock data assembly.
 */
import {
  CONTENT_API_ENDPOINTS,
  type ContentActionRequestDto,
  type ContentActionResultDto,
  type ContentApiHttpMethod,
  type ContentEnvelope,
  type ContentListDto,
  type ContentMarketListRequestDto,
  type ContentListRequestDto,
  type ContentResourceDto,
  type ContentResourceRequestDto,
  type ContentSceneDto,
  type ContentSceneRequestDto,
  type ContentSortDirection,
} from '../contracts/content-api.contract'
import type {
  ContentListPortResponse,
  ContentListRequestOptions,
  ContentPort,
} from '../ports/content.port'

interface ContentHttpImplementationOptions {
  baseUrl: string
  isProduction: boolean
}

/**
 * Formal HTTP adapter for the unified content contract.
 * It only maps typed contract DTOs onto the current /api/content/* wire shape;
 * frontend refresh/runtime/cache behavior is intentionally kept out of here.
 */
const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const isLoopbackHostname = (hostname: string) => {
  const normalized = hostname.trim().toLowerCase()
  return (
    normalized === 'localhost' ||
    normalized === '127.0.0.1' ||
    normalized === '::1' ||
    normalized === '[::1]'
  )
}

const normalizeBaseUrl = (rawBaseUrl: string, isProduction: boolean) => {
  const trimmed = rawBaseUrl.trim()
  if (!trimmed) {
    throw new Error('[content-http] VITE_CONTENT_API_BASE_URL is required when provider=http.')
  }

  let parsed: URL
  try {
    parsed = new URL(trimmed)
  } catch {
    throw new Error('[content-http] VITE_CONTENT_API_BASE_URL must be an absolute http(s) URL.')
  }

  const protocol = parsed.protocol.toLowerCase()
  if (protocol !== 'http:' && protocol !== 'https:') {
    throw new Error('[content-http] VITE_CONTENT_API_BASE_URL must use http:// or https://.')
  }

  if (isProduction && protocol !== 'https:') {
    throw new Error(
      '[content-http] VITE_CONTENT_API_BASE_URL must use https:// in production when provider=http.'
    )
  }

  if (!isProduction && protocol === 'http:' && !isLoopbackHostname(parsed.hostname)) {
    throw new Error(
      '[content-http] Non-https base URL is only allowed for localhost/127.0.0.1/::1 in development.'
    )
  }

  return trimmed.replace(/\/+$/, '')
}

const buildUrl = (
  baseUrl: string,
  path: string,
  query?: Record<string, string | number | undefined>
) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const queryEntries = Object.entries(query ?? {}).filter(
    ([, value]) => value !== undefined && value !== ''
  )
  if (queryEntries.length === 0) {
    return `${baseUrl}${normalizedPath}`
  }

  const search = queryEntries
    .map(([key, value]) => `${encodeURIComponent(key)}=${encodeURIComponent(String(value))}`)
    .join('&')
  return `${baseUrl}${normalizedPath}?${search}`
}

const toContentEnvelope = <T>(raw: unknown): ContentEnvelope<T> => {
  if (isObjectRecord(raw)) {
    const candidate = raw as Partial<ContentEnvelope<T>>
    if (
      typeof candidate.code === 'number' &&
      typeof candidate.message === 'string' &&
      typeof candidate.requestId === 'string' &&
      typeof candidate.serverTime === 'string' &&
      'data' in candidate
    ) {
      return candidate as ContentEnvelope<T>
    }
  }

  throw new Error('[content-http] Invalid response envelope.')
}

interface ContentHttpResponse<T> {
  envelope: ContentEnvelope<T>
  statusCode: number
  headers: Record<string, string>
}

const normalizeResponseHeaders = (headers: unknown): Record<string, string> => {
  if (!isObjectRecord(headers)) {
    return {}
  }

  return Object.entries(headers).reduce<Record<string, string>>((result, [key, value]) => {
    if (typeof value === 'string') {
      result[key.toLowerCase()] = value
      return result
    }

    if (typeof value === 'number' || typeof value === 'boolean') {
      result[key.toLowerCase()] = String(value)
    }

    return result
  }, {})
}

const requestContent = async <T>(
  method: ContentApiHttpMethod,
  url: string,
  payload?: unknown,
  headers: Record<string, string> = {}
): Promise<ContentHttpResponse<T>> => {
  const requestData = payload as string | Record<string, unknown> | ArrayBuffer | undefined
  return new Promise((resolve, reject) => {
    uni.request({
      method,
      url,
      data: requestData,
      header: {
        'content-type': 'application/json',
        ...headers,
      },
      success: (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(
            new Error(`[content-http] ${method} ${url} failed with HTTP ${response.statusCode}.`)
          )
          return
        }

        try {
          resolve({
            envelope: toContentEnvelope<T>(response.data),
            statusCode: response.statusCode,
            headers: normalizeResponseHeaders(response.header),
          })
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        const reason = isObjectRecord(error) && typeof error.errMsg === 'string' ? error.errMsg : ''
        reject(new Error(`[content-http] ${method} ${url} failed.${reason ? ` ${reason}` : ''}`))
      },
    })
  })
}

const requestListContent = async (
  method: ContentApiHttpMethod,
  url: string,
  options: ContentListRequestOptions = {}
): Promise<ContentListPortResponse> => {
  return new Promise((resolve, reject) => {
    const requestHeaders: Record<string, string> = {
      'content-type': 'application/json',
    }
    if (options.ifNoneMatch?.trim()) {
      requestHeaders['If-None-Match'] = options.ifNoneMatch.trim()
    }

    uni.request({
      method,
      url,
      header: requestHeaders,
      success: (response) => {
        const normalizedHeaders = normalizeResponseHeaders(response.header)
        const etag = normalizedHeaders.etag
        if (response.statusCode === 304) {
          resolve({
            envelope: {
              code: 0,
              message: 'Not Modified',
              requestId: '',
              serverTime: '',
              data: null,
            },
            etag,
            notModified: true,
          })
          return
        }

        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`[content-http] GET ${url} failed with HTTP ${response.statusCode}.`))
          return
        }

        try {
          resolve({
            envelope: toContentEnvelope<ContentListDto | null>(response.data),
            etag,
            notModified: false,
          })
        } catch (error) {
          reject(error)
        }
      },
      fail: (error) => {
        const reason = isObjectRecord(error) && typeof error.errMsg === 'string' ? error.errMsg : ''
        reject(new Error(`[content-http] GET ${url} failed.${reason ? ` ${reason}` : ''}`))
      },
    })
  })
}

const resolveListSort = (
  input: ContentMarketListRequestDto
): { field: string; direction: ContentSortDirection } => {
  return {
    field: input.sort.field,
    direction: input.sort.direction === 'asc' ? 'asc' : 'desc',
  }
}

export const createContentHttpImplementation = (
  options: ContentHttpImplementationOptions
): ContentPort => {
  const baseUrl = normalizeBaseUrl(options.baseUrl, options.isProduction)
  const actionEndpointsByType = {
    'notice-read': CONTENT_API_ENDPOINTS.noticeRead,
    'service-reminder-consume': CONTENT_API_ENDPOINTS.serviceReminderConsume,
  } as const

  return {
    async getScene(input: ContentSceneRequestDto) {
      const endpoint = CONTENT_API_ENDPOINTS.scene
      const response = await requestContent<ContentSceneDto | null>(
        endpoint.method,
        buildUrl(baseUrl, endpoint.path, {
          sceneId: input.sceneId,
          platform: input.platform,
          channel: input.channel,
          locale: input.locale,
        })
      )
      return response.envelope
    },

    async getResource(input: ContentResourceRequestDto) {
      const endpoint = CONTENT_API_ENDPOINTS.resource
      const response = await requestContent<ContentResourceDto | null>(
        endpoint.method,
        buildUrl(baseUrl, endpoint.path, {
          resourceType: input.resourceType,
          resourceId: input.resourceId,
        })
      )
      return response.envelope
    },

    async getList(input: ContentListRequestDto, options: ContentListRequestOptions = {}) {
      const endpoint = CONTENT_API_ENDPOINTS.list
      // The current formal list wire contract is discriminated by resourceType.
      // Each branch only serializes fields that are already part of the backend
      // contract for that concrete list resource.
      if (input.resourceType === 'market_item') {
        const sort = resolveListSort(input)
        return requestListContent(
          endpoint.method,
          buildUrl(baseUrl, endpoint.path, {
            resourceType: input.resourceType,
            categoryId: input.categoryId,
            keyword: input.keyword,
            sortField: sort.field,
            sortDirection: sort.direction,
            page: input.page,
            pageSize: input.pageSize,
          }),
          options
        )
      }

      if (input.resourceType === 'notice') {
        return requestListContent(
          endpoint.method,
          buildUrl(baseUrl, endpoint.path, {
            resourceType: input.resourceType,
            tag: input.tag,
            keyword: input.keyword,
            startDate: input.dateRange?.startDate,
            endDate: input.dateRange?.endDate,
            page: input.page,
            pageSize: input.pageSize,
          }),
          options
        )
      }

      return requestListContent(
        endpoint.method,
        buildUrl(baseUrl, endpoint.path, {
          resourceType: input.resourceType,
          categoryId: input.categoryId,
          subCategory: input.subCategory,
          seriesId: input.seriesId,
          keyword: input.keyword,
          page: input.page,
          pageSize: input.pageSize,
        }),
        options
      )
    },

    async runAction(input: ContentActionRequestDto) {
      // Only actions that already exist in the formal contract may be sent
      // through this adapter. Page-local mutations must not bypass this layer.
      const endpoint = actionEndpointsByType[input.actionType]
      if (endpoint) {
        const response = await requestContent<ContentActionResultDto>(
          endpoint.method,
          buildUrl(baseUrl, endpoint.path),
          input
        )
        return response.envelope
      }

      throw new Error('[content-http] Unsupported actionType.')
    },
  }
}
