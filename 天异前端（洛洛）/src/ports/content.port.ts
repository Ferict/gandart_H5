/**
 * Responsibility: declare the abstract content-domain port consumed by runtime services and satisfied by concrete providers.
 * Out of scope: DTO shape definitions, page-local composition, and concrete transport logic.
 */
import type {
  ContentActionRequestDto,
  ContentActionResultDto,
  ContentEnvelope,
  ContentListDto,
  ContentListRequestDto,
  ContentResourceDto,
  ContentResourceRequestDto,
  ContentSceneDto,
  ContentSceneRequestDto,
} from '../contracts/content-api.contract'

export interface ContentListRequestOptions {
  ifNoneMatch?: string
}

export interface ContentListPortResponse {
  envelope: ContentEnvelope<ContentListDto | null>
  etag?: string
  notModified?: boolean
}

/**
 * Transport-only boundary for the unified content domain.
 * Runtime refresh rules, caching, hydrate policy and page orchestration stay
 * above this port and must not leak into the wire contract layer.
 */
export interface ContentPort {
  getScene: (input: ContentSceneRequestDto) => Promise<ContentEnvelope<ContentSceneDto | null>>
  getResource: (
    input: ContentResourceRequestDto
  ) => Promise<ContentEnvelope<ContentResourceDto | null>>
  getList: (
    input: ContentListRequestDto,
    options?: ContentListRequestOptions
  ) => Promise<ContentListPortResponse>
  runAction: (input: ContentActionRequestDto) => Promise<ContentEnvelope<ContentActionResultDto>>
}
