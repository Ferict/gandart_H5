/**
 * Responsibility: provide the unified content-domain service seam and route callers to the active
 * content port implementation.
 * Out of scope: provider bootstrap policy, DTO mapping details, and persistent cache behavior.
 */
import type {
  ContentActionRequestDto,
  ContentActionResultDto,
  ContentListDto,
  ContentListRequestDto,
  ContentResourceDto,
  ContentResourceRequestDto,
  ContentSceneDto,
  ContentSceneRequestDto,
} from '../../contracts/content-api.contract'
import { contentMockImplementation } from '../../implementations/content.mock'
import type { ContentListRequestOptions, ContentPort } from '../../ports/content.port'

let activeContentPort: ContentPort = contentMockImplementation

export const setContentPort = (port: ContentPort) => {
  activeContentPort = port
}

export const resetContentPort = () => {
  activeContentPort = contentMockImplementation
}

const ensureSuccess = <T>(code: number, message: string, data: T | null, label: string): T => {
  if (code !== 0 || data == null) {
    throw new Error(`${label} failed: ${message}`)
  }

  return data
}

export const resolveContentScene = async (
  input: ContentSceneRequestDto
): Promise<ContentSceneDto> => {
  const response = await activeContentPort.getScene(input)
  return ensureSuccess(response.code, response.message, response.data, 'content scene')
}

export const resolveContentResource = async (
  input: ContentResourceRequestDto
): Promise<ContentResourceDto> => {
  const response = await activeContentPort.getResource(input)
  return ensureSuccess(response.code, response.message, response.data, 'content resource')
}

export const resolveContentList = async (input: ContentListRequestDto): Promise<ContentListDto> => {
  const response = await activeContentPort.getList(input)
  return ensureSuccess(
    response.envelope.code,
    response.envelope.message,
    response.envelope.data,
    'content list'
  )
}

export interface ResolvedContentListResult {
  list: ContentListDto | null
  etag?: string
  notModified: boolean
}

/**
 * Meta-aware list resolver used by current formal list consumers.
 * It preserves ETag / 304 semantics while still enforcing the shared envelope.
 */
export const resolveContentListWithMeta = async (
  input: ContentListRequestDto,
  options: ContentListRequestOptions = {}
): Promise<ResolvedContentListResult> => {
  const response = await activeContentPort.getList(input, options)
  if (response.notModified) {
    return {
      list: null,
      etag: response.etag,
      notModified: true,
    }
  }

  return {
    list: ensureSuccess(
      response.envelope.code,
      response.envelope.message,
      response.envelope.data,
      'content list'
    ),
    etag: response.etag,
    notModified: false,
  }
}

export const runContentAction = async (
  input: ContentActionRequestDto
): Promise<ContentActionResultDto> => {
  const response = await activeContentPort.runAction(input)
  return ensureSuccess(response.code, response.message, response.data, 'content action')
}
