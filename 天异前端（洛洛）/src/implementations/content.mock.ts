/**
 * Responsibility: implement the content-domain port against the structured local mock database.
 * Out of scope: runtime cache orchestration, page-local fallback logic, and HTTP transport behavior.
 */
import type { ContentListDto } from '../contracts/content-api.contract'
import type {
  ContentListPortResponse,
  ContentListRequestOptions,
  ContentPort,
} from '../ports/content.port'
import { runAction } from './content.mock/action'
import { buildListData } from './content.mock/list'
import { buildResourceData, createContentResourceSnapshot } from './content.mock/resource'
import { buildSceneData, createContentSceneSnapshot } from './content.mock/scene'
import { createEnvelope, createErrorEnvelope, createMockListEtag } from './content.mock/shared'

export { createContentSceneSnapshot, createContentResourceSnapshot }

export const contentMockImplementation: ContentPort = {
  async getScene(input) {
    return createEnvelope(buildSceneData(input), 'req_scene')
  },
  async getResource(input) {
    return createEnvelope(buildResourceData(input), 'req_resource')
  },
  async getList(input, options: ContentListRequestOptions = {}): Promise<ContentListPortResponse> {
    const list = buildListData(input)
    if (!list) {
      return {
        envelope: createErrorEnvelope(
          `unsupported list resourceType: ${input.resourceType}`,
          'req_list',
          {
            resourceType: input.resourceType,
            page: input.page,
            pageSize: input.pageSize,
            total: 0,
            items: [],
          }
        ),
      }
    }

    const etag = createMockListEtag(list)
    if (options.ifNoneMatch?.trim() && options.ifNoneMatch.trim() === etag) {
      return {
        envelope: createEnvelope<ContentListDto | null>(null, 'req_list'),
        etag,
        notModified: true,
      }
    }

    return {
      envelope: createEnvelope(list, 'req_list'),
      etag,
      notModified: false,
    }
  },
  async runAction(input) {
    return createEnvelope(runAction(input), 'req_action')
  },
}
