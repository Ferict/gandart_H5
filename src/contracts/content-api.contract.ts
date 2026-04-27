/**
 * 内容域正式 API 契约。
 *
 * 本文件是当前内容域唯一正式 API 真值源。后端接接口时，只按本文件实现。
 * 不要去 `backend-handoff/`、`references/`、HTTP adapter 或 mock 里拼第二套接口理解。
 *
 * 后端接入最短路径：
 * 1. 先实现 `CONTENT_API_ENDPOINTS` 里的 5 个正式路径，路径和方法不允许改名或旁路扩展。
 * 2. 所有 GET 接口都从 query string 取参数，不从 body 取参数。
 * 3. 所有 POST 接口都接收 JSON body，`Content-Type` 使用 `application/json`。
 * 4. 所有接口都返回同一个响应壳 `ContentEnvelope<T>`，不要返回裸数组、裸对象或裸布尔值。
 * 5. 业务成功时 `code` 必须返回 `0`，`data` 返回本文件声明的 DTO。
 * 6. 业务失败时仍建议返回 HTTP 2xx + `ContentEnvelope<T>`，其中 `code` 必须不是 `0`。
 * 7. HTTP 非 2xx 只表示传输失败、鉴权失败或服务异常；当前前端 http adapter 不解析非 2xx body。
 * 8. 用户相关接口不在 query/body 里新增 `userId` 或 `accountId`；后端从登录态、token 或 session 获取当前用户。
 * 9. 找不到 scene/resource 时，按对应接口说明返回 `data: null`；list 成功但无数据时返回 `items: []`。
 * 10. 新增接口、字段、sceneId、resourceType、actionType 前，必须先改本文件，再改后端实现。
 *
 * 后端不要做的事：
 * - 不要把页面 `route.query` 当后端字段。
 * - 不要把前端缓存键、刷新协议、query snapshot 当后端字段。
 * - 不要把 `owner`、`contract`、`chain`、`tokenStandard`、`traits`、`provenance` 当成本期后端字段。
 * - 不要新增 `/api/content/xxx` 旁路路径来绕过本文件。
 * - 不要用 mock 数据结构反推接口；mock 只能证明前端可跑，不能替代正式 contract。
 */
export type ContentSceneId = 'home' | 'activity' | 'profile' | 'settings' | 'service_hub'
export type ContentResourceType =
  | 'notice'
  | 'home_banner'
  | 'activity'
  | 'drop'
  | 'market_action'
  | 'market_item'
  | 'category'
  | 'asset'
  | 'user_profile'
  | 'service_entry'
  | 'identity_verification'
  | 'service_action'
  | 'settings_action'
  | 'profile_asset'
export type ContentResourceDetailType = Exclude<ContentResourceType, 'category' | 'user_profile'>
export type ContentActionTargetType = never
export type ContentTargetType = ContentResourceType | ContentActionTargetType
export type ContentListResourceType = 'market_item' | 'notice' | 'profile_asset'
export type ContentResourceDetailSupport = 'detail' | 'target-only' | 'deferred'
export type ContentMarketActionId = 'search' | 'history'
export type ContentMarketKind = 'collections' | 'blindBoxes'
export type ContentHomeBannerTone = 'dawn' | 'azure' | 'ember'
export type ContentPlaceholderIconKey =
  | 'box'
  | 'cpu'
  | 'aperture'
  | 'hexagon'
  | 'triangle'
  | 'disc3'
export type ContentMarketBadgeType = 'new' | 'hot' | 'featured'
export type ContentMarketVisualTone = 'ink' | 'mist' | 'aqua' | 'sand'
export type ContentActivityEntryTone = 'dark' | 'light' | 'soft'
export type ContentProfileCategoryId = 'collections' | 'blindBoxes'
export type ContentServiceEntryId = 'orders' | 'auth' | 'wallet' | 'invite' | 'community'
export type ContentServiceEntryTone = 'cyan' | 'green' | 'amber' | 'rose' | 'slate'
export type ContentIdentityVerificationStatus = 'unverified' | 'processing' | 'verified' | 'failed'
export type ContentIdentityVerificationResultTone = 'success' | 'danger'
export type ContentIdentityVerificationMockSubmitResult = 'success' | 'failure'
export type ContentIdentityVerificationFeatureIconKey = 'box' | 'gift' | 'repeat-2'
export type ContentServiceHubIndicatorTone = 'cyan' | 'green' | 'amber' | 'rose' | 'red'
export type ContentNoticeVisualPreset =
  | 'consignment'
  | 'limit_price'
  | 'release'
  | 'airdrop'
  | 'synthesis'
  | 'platform'
  | 'swap'
export type ContentRelationType =
  | 'parent'
  | 'category'
  | 'related_notice'
  | 'related_market_item'
  | 'related_activity'
export type ContentSceneBlockType =
  | 'notice_bar'
  | 'banner_carousel'
  | 'featured_drop'
  | 'market_overview'
  | 'activity_entries'
  | 'activity_notice_feed'
  | 'profile_summary'
  | 'profile_assets'
  | 'settings_summary'
  | 'settings_sections'
  | 'service_hub_entries'

const stringifyContentApiJsonExample = (value: unknown): string => JSON.stringify(value, null, 2)

export interface ContentEnvelope<T> {
  /** 业务状态码。成功必须是 0；业务失败必须不是 0。 */
  code: number
  /** 给人看的业务状态说明。成功可返回 OK；失败必须说明人能看懂的原因。 */
  message: string
  /** 后端生成的请求追踪 ID。用于排查日志；前端只透传和记录，不参与业务判断。 */
  requestId: string
  /** 后端返回的当前时间字符串。必须是稳定可解析的时间文本，推荐 ISO 8601。 */
  serverTime: string
  /**
   * 本次接口真正的数据。
   *
   * 成功时按 `CONTENT_API_ENDPOINTS.response` 返回具体 DTO。
   * 业务失败时允许为 null，但不要省略 `data` 字段；泛型 T 表示成功数据类型。
   */
  data: T | null
}

export type ContentApiHttpMethod = 'GET' | 'POST'

export interface ContentApiEndpointDescriptor {
  /** HTTP 方法。当前只允许 GET 或 POST。 */
  method: ContentApiHttpMethod
  /** 后端需要实现的路径。前端会把 base URL 拼到这个 path 前面。 */
  path: string
  /** 本接口请求 DTO 名称，具体字段在下方对应 interface 中。 */
  request: string
  /** 本接口成功响应 DTO 名称，外层永远包 `ContentEnvelope<T>`；业务失败仍可返回 data: null。 */
  response: string
  /** 一句话说明这个接口是干什么的。 */
  summary: string
  /** 后端实现时逐项对照的请求字段说明。 */
  requestFields: readonly string[]
  /** 后端返回时逐项对照的响应字段说明。 */
  responseFields: readonly string[]
  /** 后端容易接错的边界说明。 */
  notes: readonly string[]
  /** 后端按顺序照做的实现步骤。 */
  backendSteps: readonly string[]
  /** 最小可用请求示例；GET 写完整 query，POST 写 body。 */
  requestExample: string
  /** POST 接口的合法 JSON body 示例。GET 接口没有 body 时不填。 */
  requestBodyJsonExample?: string
  /** 最小可用成功响应示例；只列关键字段，不要求照抄示例数据。 */
  successExample: string
  /** 这个接口最容易接错的地方。 */
  commonMistakes: readonly string[]
}

/**
 * 当前内容域正式 endpoint 总表。
 *
 * 后端应能只通过本表确认 5 个正式接口的路径、方法、请求 DTO、响应 DTO
 * 和联调注意事项；HTTP adapter 只能引用本表，不得维护第二套 endpoint。
 */
export const CONTENT_API_ENDPOINTS = {
  scene: {
    method: 'GET',
    path: '/api/content/scene',
    request: 'ContentSceneRequestDto',
    response: 'ContentEnvelope<ContentSceneDto | null>',
    summary: '按正式 sceneId 获取首屏聚合内容块。',
    requestFields: [
      'sceneId：必填；只能传 home、activity、profile、settings、service_hub，不能传页面路径或组件名。',
      'platform：可选；只用于环境补偿，例如 h5、app，不用于新增分端接口。',
      'channel：可选；只用于渠道补偿，例如 default、campaign，不替代 sceneId。',
      'locale：可选；只用于语言补偿，例如 zh-CN；后端不支持多语言时可以忽略但不要报错。',
    ],
    responseFields: [
      'data.sceneId：返回的正式场景 ID，必须与请求 sceneId 对齐。',
      'data.version：场景内容版本号；内容发生变化时递增或换成新的稳定数值。',
      'data.updatedAt：场景最后更新时间；推荐 ISO 8601 字符串，例如 2026-04-20T00:00:00.000Z。',
      'data.blocks：首屏聚合块数组；允许为空数组，块类型必须符合 CONTENT_API_SCENE_BLOCKS 对应 sceneId 的白名单。',
    ],
    notes: [
      '本接口只服务首页、活动、个人、设置、服务页的首屏聚合，不用于详情页。',
      '新增页面不能通过临时新增 sceneId 绕过 resource/list/action 三类接口。',
      '有效 scene 暂无内容时可以返回 code=0 且 data=null；sceneId 非法时返回 code!=0 且 data=null。',
    ],
    backendSteps: [
      '读取 query.sceneId。',
      '校验 sceneId 是否属于 home、activity、profile、settings、service_hub。',
      '按 sceneId 查询该页面首屏需要的聚合块。',
      '把结果组装成 ContentSceneDto：sceneId、version、updatedAt、blocks。',
      '用 ContentEnvelope 包起来返回；成功 code=0，业务失败 code!=0。',
    ],
    requestExample: 'GET /api/content/scene?sceneId=home&platform=h5&channel=default&locale=zh-CN',
    successExample: stringifyContentApiJsonExample({
      code: 0,
      message: 'OK',
      requestId: 'req_001',
      serverTime: '2026-04-20T00:00:00.000Z',
      data: {
        sceneId: 'home',
        version: 1,
        updatedAt: '2026-04-20T00:00:00.000Z',
        blocks: [],
      },
    }),
    commonMistakes: [
      '不要把详情页数据塞进 scene；详情页走 resource。',
      '不要新增临时 sceneId；正式 sceneId 只能从 ContentSceneId 里选。',
      '不要返回裸数组；必须返回 ContentEnvelope。',
    ],
  },
  resource: {
    method: 'GET',
    path: '/api/content/resource',
    request: 'ContentResourceRequestDto',
    response: 'ContentEnvelope<ContentResourceDto | null>',
    summary: '按 resourceType 与 resourceId 获取一个正式内容资源详情。',
    requestFields: [
      'resourceType：必填；正式资源类型以 ContentResourceType 为准，但是否需要实现详情见 CONTENT_API_RESOURCE_TYPES。',
      'resourceId：必填；后端资源主键或稳定业务 ID，必须能在同一 resourceType 下唯一定位资源。',
    ],
    responseFields: [
      'data.resourceType：资源类型，必须与请求 resourceType 对齐。',
      'data.resourceId：资源 ID，必须与请求 resourceId 对齐。',
      'data.title / subtitle / status / updatedAt / summary：资源通用展示骨架；status 使用 published、active、disabled、archived 这类稳定业务状态。',
      'data.asset：资源主图或素材引用；无素材时可为 null 或省略。',
      'data.payload：按 resourceType 区分的正式业务载荷；不能随手返回空对象，必须对齐 ContentResourcePayloadByType。',
      'data.relations：资源关联目标；没有关联时返回空数组，不要返回 null。',
    ],
    notes: [
      '本接口是详情页和动作详情的统一入口，前端可再映射成页面模型。',
      'route.query.source、页面本地 category/subCategory、缓存键不属于本接口字段。',
      '找不到资源时允许 code=0 且 data=null；资源类型当前未开放详情时返回 code!=0 且 data=null。',
    ],
    backendSteps: [
      '读取 query.resourceType。',
      '读取 query.resourceId。',
      '校验 resourceType 是否属于 ContentResourceType。',
      '检查 CONTENT_API_RESOURCE_TYPES 中该 resourceType 的 detailSupport；target-only/deferred 不要伪造 payload。',
      '按 resourceType + resourceId 查询唯一资源。',
      '把结果组装成 ContentResourceDto：resourceType、resourceId、title、status、updatedAt、payload、relations。',
      '用 ContentEnvelope 包起来返回；成功 code=0，业务失败 code!=0。',
    ],
    requestExample: 'GET /api/content/resource?resourceType=notice&resourceId=notice_001',
    successExample: stringifyContentApiJsonExample({
      code: 0,
      message: 'OK',
      requestId: 'req_002',
      serverTime: '2026-04-20T00:00:00.000Z',
      data: {
        resourceType: 'notice',
        resourceId: 'notice_001',
        title: '公告标题',
        status: 'published',
        updatedAt: '2026-04-20T00:00:00.000Z',
        summary: '公告摘要',
        payload: {
          publishedAt: '2026-04-20T00:00:00.000Z',
          isUnread: true,
          englishTitle: 'Notice Title',
          badges: ['platform'],
          blocks: [
            {
              id: 'paragraph_001',
              kind: 'paragraph',
              text: '公告正文第一段。',
            },
          ],
          visual: {
            preset: 'platform',
            asset: null,
          },
        },
        relations: [],
      },
    }),
    commonMistakes: [
      '不要按页面名设计响应，例如 notice-detail、profile-assets 不是后端 resourceType。',
      '不要把 route.query.source 返回给前端；那是前端本地上下文。',
      '不要缺 relations；没有关联时返回空数组。',
    ],
  },
  list: {
    method: 'GET',
    path: '/api/content/list',
    request: 'ContentListWireQueryDto',
    response: 'ContentEnvelope<ContentListDto>',
    summary: '按 resourceType 获取正式分页列表。',
    requestFields: [
      'resourceType：必填；当前正式列表类型为 market_item、notice、profile_asset。',
      'page / pageSize：必填；当前正式分页口径固定为 page + pageSize。',
      'market_item.marketKind / categoryId / keyword：市场列表可选筛选条件；当前后端不支持排序字段。',
      'market_item.categoryId / keyword：市场列表可选筛选条件；不筛选时可以不传。',
      'notice.tag / keyword / startDate / endDate：公告列表可选筛选条件；wire query 是扁平字段，不是 dateRange。',
      'profile_asset.categoryId / subCategory / keyword：个人资产列表可选筛选条件；用户身份来自外部鉴权上下文。',
    ],
    responseFields: [
      'data.resourceType：列表资源类型，必须与请求 resourceType 对齐。',
      'data.page / pageSize / total：分页结果；当前不使用 cursor。',
      'data.items：列表项数组，每个列表项使用 ContentListItemDtoBase。',
      'data.items[].target：打开详情或后续资源时使用的正式目标引用。',
    ],
    notes: [
      '本接口统一承载市场、公告、个人资产三类列表，不为每类列表新增独立路径。',
      'cursor 分页当前明确排除，后续如启用必须先改本 contract。',
      'ETag/304 属于 HTTP adapter 可支持的传输行为，不改变本接口响应 DTO 真值源。',
      '列表成功响应不返回 data=null；没有数据时返回 data.items=[] 且 total=0。',
    ],
    backendSteps: [
      '读取 query.resourceType。',
      '读取 query.page 和 query.pageSize，并按数字处理。',
      '如果 resourceType=market_item，读取 marketKind、categoryId、keyword；不要读取排序字段。',
      '如果 resourceType=notice，读取 tag、keyword、startDate、endDate。',
      '如果 resourceType=profile_asset，读取 categoryId、subCategory、keyword。',
      '按 resourceType 查询对应列表。',
      '把结果组装成 ContentListDto：resourceType、page、pageSize、total、items。',
      '用 ContentEnvelope 包起来返回；成功 code=0，items 没有数据时返回空数组。',
    ],
    requestExample:
      'GET /api/content/list?resourceType=market_item&marketKind=collections&page=1&pageSize=20',
    successExample: stringifyContentApiJsonExample({
      code: 0,
      message: 'OK',
      requestId: 'req_003',
      serverTime: '2026-04-20T00:00:00.000Z',
      data: {
        resourceType: 'market_item',
        page: 1,
        pageSize: 20,
        total: 0,
        items: [],
      },
    }),
    commonMistakes: [
      '不要新增 /api/content/market-list、/api/content/notice-list 这类旁路路径。',
      '不要返回 cursor；当前正式分页只有 page + pageSize。',
      '不要忘记 total；前端需要它判断列表总量。',
      'items 为空时返回空数组，不要返回 null。',
    ],
  },
  noticeRead: {
    method: 'POST',
    path: '/api/content/action/notice-read',
    request: 'NoticeReadActionRequestDto',
    response: 'ContentEnvelope<NoticeReadActionResultDto>',
    summary: '将一条公告标记为已读。',
    requestFields: [
      'actionType：必填，固定为 notice-read。',
      'noticeId：必填，需要被标记为已读的公告 ID。',
      '当前用户：不在 body 中传 userId；后端从登录态、token 或 session 中取当前用户。',
    ],
    responseFields: [
      'data.noticeId：被处理的公告 ID，必须与请求 noticeId 对齐。',
      'data.isUnread：处理后的未读状态；已读后通常应为 false。',
    ],
    notes: [
      '本接口只处理公告已读写回，不承载公告详情读取。',
      '前端页面本地点击状态不能替代该正式写回接口。',
      '后端应通过 envelope.code/message 表达失败原因，例如公告不存在或无权限。',
      '本接口是用户态写回接口；缺少外部鉴权上下文时应该业务失败，不要让前端临时传 userId。',
    ],
    backendSteps: [
      '读取 JSON body.actionType。',
      '确认 actionType 必须等于 notice-read。',
      '读取 JSON body.noticeId。',
      '从登录态、token 或 session 解析当前用户。',
      '把 noticeId 对应公告标记为已读。',
      '返回 NoticeReadActionResultDto：noticeId、isUnread。',
      '用 ContentEnvelope 包起来返回；成功 code=0，业务失败 code!=0。',
    ],
    requestExample:
      'POST /api/content/action/notice-read body={"actionType":"notice-read","noticeId":"notice_001"}',
    requestBodyJsonExample: stringifyContentApiJsonExample({
      actionType: 'notice-read',
      noticeId: 'notice_001',
    }),
    successExample: stringifyContentApiJsonExample({
      code: 0,
      message: 'OK',
      requestId: 'req_004',
      serverTime: '2026-04-20T00:00:00.000Z',
      data: {
        noticeId: 'notice_001',
        isUnread: false,
      },
    }),
    commonMistakes: [
      '不要用 GET 做写回；这个接口必须是 POST。',
      '不要省略 actionType；前端和验证脚本都会传 actionType。',
      '不要新增 userId/accountId；用户身份来自外部鉴权上下文。',
      '不要只返回 true/false；必须返回 noticeId 和 isUnread。',
    ],
  },
  serviceReminderConsume: {
    method: 'POST',
    path: '/api/content/action/service-reminder-consume',
    request: 'ServiceReminderConsumeActionRequestDto',
    response: 'ContentEnvelope<ServiceReminderConsumeActionResultDto>',
    summary: '消费一个服务入口提醒状态。',
    requestFields: [
      'actionType：必填，固定为 service-reminder-consume。',
      'serviceId：必填；当前正式值为 orders、auth、wallet、invite、community。',
      'latestMessageId：可选；用于声明前端已消费到的最新提醒消息。',
      '当前用户：不在 body 中传 userId；后端从登录态、token 或 session 中取当前用户。',
    ],
    responseFields: [
      'data.serviceId：被处理的服务入口 ID，必须与请求 serviceId 对齐。',
      'data.hasReminder：处理后是否仍有提醒。',
      'data.unreadCount：处理后的未读数量。',
      'data.latestMessageId / latestMessageAt：处理后的最新提醒游标，可按实际情况返回。',
    ],
    notes: [
      '本接口只处理服务中心提醒消费，不承担订单、钱包、认证等业务详情。',
      'serviceId 只能使用 ContentServiceEntryId 中的正式值，不能临时扩展字符串。',
      '缺少真实样本参数时，仓内验证脚本会 skip，而不是伪造真实联通成功。',
      '本接口是用户态写回接口；缺少外部鉴权上下文时应该业务失败，不要让前端临时传 userId。',
    ],
    backendSteps: [
      '读取 JSON body.actionType。',
      '确认 actionType 必须等于 service-reminder-consume。',
      '读取 JSON body.serviceId。',
      '可选读取 JSON body.latestMessageId。',
      '从登录态、token 或 session 解析当前用户。',
      '按 serviceId 消费对应服务入口提醒。',
      '返回 ServiceReminderConsumeActionResultDto：serviceId、hasReminder、unreadCount、latestMessageId、latestMessageAt。',
      '用 ContentEnvelope 包起来返回；成功 code=0，业务失败 code!=0。',
    ],
    requestExample:
      'POST /api/content/action/service-reminder-consume body={"actionType":"service-reminder-consume","serviceId":"orders","latestMessageId":"msg_001"}',
    requestBodyJsonExample: stringifyContentApiJsonExample({
      actionType: 'service-reminder-consume',
      serviceId: 'orders',
      latestMessageId: 'msg_001',
    }),
    successExample: stringifyContentApiJsonExample({
      code: 0,
      message: 'OK',
      requestId: 'req_005',
      serverTime: '2026-04-20T00:00:00.000Z',
      data: {
        serviceId: 'orders',
        hasReminder: false,
        unreadCount: 0,
        latestMessageId: 'msg_001',
        latestMessageAt: '2026-04-20T00:00:00.000Z',
      },
    }),
    commonMistakes: [
      '不要在这里返回订单详情、钱包详情或认证详情；这里只消费提醒状态。',
      '不要临时发明 serviceId；只能用 ContentServiceEntryId 的正式值。',
      '不要新增 userId/accountId；用户身份来自外部鉴权上下文。',
      '不要只返回 hasReminder；必须返回 serviceId 和 unreadCount。',
    ],
  },
} as const satisfies Record<string, ContentApiEndpointDescriptor>

/**
 * 当前单一 contract 的正式边界。
 *
 * 任何新增正式资源、场景、分页口径或接口能力，都必须先更新本块和
 * `CONTENT_API_ENDPOINTS`，再进入 adapter、mock 或页面实现。
 */
export const CONTENT_API_CURRENT_BOUNDARY = {
  listPagination: 'page + pageSize',
  cursorPagination: 'excluded',
  formalSceneIds: ['home', 'activity', 'profile', 'settings', 'service_hub'],
  formalListResourceTypes: ['market_item', 'notice', 'profile_asset'],
  formalResourceDetailTypes: [
    'notice',
    'home_banner',
    'activity',
    'drop',
    'market_action',
    'market_item',
    'asset',
    'service_entry',
    'service_action',
    'settings_action',
    'profile_asset',
  ],
} as const

/**
 * 用户身份上下文口径。
 *
 * 本文件中的用户态接口不携带 userId/accountId。后端必须从登录态、token 或 session
 * 得到当前用户；如果联调环境暂时没有鉴权上下文，应返回业务失败，而不是让前端临时加字段。
 */
export const CONTENT_API_AUTH_CONTEXT = {
  requestCarriesUserId: false,
  backendSource: 'authenticated current user from token, session, or login context',
  affectedEndpoints: ['GET /api/content/list?resourceType=profile_asset', 'POST content actions'],
  rule: '不要在 query/body 临时新增 userId、accountId、walletAddress 作为身份字段。',
} as const

/**
 * 错误和 HTTP 状态码口径。
 *
 * 现有前端 http adapter 对非 2xx 直接 reject，不解析非 2xx body。因此业务失败应优先
 * 返回 HTTP 2xx + ContentEnvelope.code != 0；HTTP 非 2xx 只表达传输、鉴权或服务异常。
 */
export const CONTENT_API_ERROR_STRATEGY = {
  businessSuccess: 'HTTP 2xx + ContentEnvelope.code = 0',
  businessFailure: 'HTTP 2xx + ContentEnvelope.code != 0',
  transportFailure: 'HTTP non-2xx; frontend adapter will not parse envelope body',
  requiredEnvelopeFields: ['code', 'message', 'requestId', 'serverTime', 'data'],
} as const

/**
 * 空数据返回口径。
 *
 * scene/resource 和 list 的空结果不一样：scene/resource 可以没有对象，list 成功时必须仍有分页壳。
 */
export const CONTENT_API_EMPTY_RESULT_STRATEGY = {
  scene: '有效 sceneId 暂无内容时返回 code=0,data=null。',
  resource: '有效 resourceType/resourceId 找不到内容时返回 code=0,data=null。',
  list: '有效列表查询无数据时返回 code=0,data={resourceType,page,pageSize,total:0,items:[]}。',
  action: '写回 action 不能只返回 true/false，必须返回对应 result DTO。',
} as const

/**
 * 当前资源类型字典。
 *
 * `detailSupport=detail` 表示后端应支持 `GET /api/content/resource` 详情查询。
 * `target-only` 表示当前只作为 target、分类或筛选引用，不要求实现详情 payload。
 * `deferred` 表示已占位但不在本批后端落地范围内，不能伪造空 payload 冒充已支持。
 */
export const CONTENT_API_RESOURCE_TYPES = {
  notice: {
    label: '公告详情',
    detailSupport: 'detail',
    payloadDto: 'ContentNoticePayloadDto',
    idExample: 'notice_001',
    backendRule: '公告详情必须返回 publishedAt、isUnread、englishTitle、badges、blocks。',
  },
  home_banner: {
    label: '首页轮播横幅',
    detailSupport: 'detail',
    payloadDto: 'ContentHomeBannerPayloadDto',
    idExample: 'banner_001',
    backendRule: '横幅详情必须返回 liveLabel 和 tone，并可通过 asset 提供主图。',
  },
  activity: {
    label: '活动入口或活动详情',
    detailSupport: 'detail',
    payloadDto: 'ContentActivityPayloadDto',
    idExample: 'activity_001',
    backendRule: '活动详情必须返回 eyebrow、description、tone，可选 badgeLabel。',
  },
  drop: {
    label: '发售或精选掉落',
    detailSupport: 'detail',
    payloadDto: 'ContentDropPayloadDto',
    idExample: 'drop_001',
    backendRule: '发售详情必须返回价格、供应量和铸造量，金额单位固定为分。',
  },
  market_action: {
    label: '市场动作入口',
    detailSupport: 'detail',
    payloadDto: 'ContentActionEntryPayloadDto',
    idExample: 'market_action_search',
    backendRule: '动作入口详情用于展示入口内容，不代表新增 action POST 接口。',
  },
  market_item: {
    label: '市场藏品条目',
    detailSupport: 'detail',
    payloadDto: 'ContentMarketItemPayloadDto',
    idExample: 'market_item_001',
    backendRule: '市场条目详情必须返回价格、上架时间、交易量、持有人数和分类。',
  },
  category: {
    label: '分类引用',
    detailSupport: 'target-only',
    payloadDto: 'Record<string, never>',
    idExample: 'collections',
    backendRule: '当前只作为筛选或关联引用，不要求 resource 详情查询。',
  },
  asset: {
    label: '素材资源',
    detailSupport: 'detail',
    payloadDto: 'ContentAssetPayloadDto',
    idExample: 'asset_001',
    backendRule: '素材详情只描述素材本身宽高；图片 URL 仍放在 ContentAssetDto。',
  },
  user_profile: {
    label: '用户档案占位',
    detailSupport: 'deferred',
    payloadDto: 'Record<string, never>',
    idExample: 'current_user',
    backendRule: '当前用户身份来自鉴权上下文，本批不要求 user_profile resource 详情。',
  },
  service_entry: {
    label: '服务中心入口',
    detailSupport: 'detail',
    payloadDto: 'ContentServiceEntryPayloadDto',
    idExample: 'orders',
    backendRule: '服务入口详情必须返回 serviceId、tone、statusLabel、badges、metrics、sections。',
  },
  identity_verification: {
    label: '实名认证详情',
    detailSupport: 'detail',
    payloadDto: 'ContentIdentityVerificationPayloadDto',
    idExample: 'auth',
    backendRule:
      '实名认证详情必须返回 verificationStatus、表单字段、processing 文案和成功/失败结果配置；真实提交 action 后续单独进入正式 contract。',
  },
  service_action: {
    label: '服务动作入口',
    detailSupport: 'detail',
    payloadDto: 'ContentActionEntryPayloadDto',
    idExample: 'service_action_orders_latest',
    backendRule: '服务动作入口详情用于展示入口内容，不代表新增 POST action。',
  },
  settings_action: {
    label: '设置页动作入口',
    detailSupport: 'detail',
    payloadDto: 'ContentActionEntryPayloadDto',
    idExample: 'settings_action_profile',
    backendRule: '设置动作入口详情用于展示入口内容，不代表新增 POST action。',
  },
  profile_asset: {
    label: '当前用户个人资产',
    detailSupport: 'detail',
    payloadDto: 'ContentProfileAssetPayloadDto',
    idExample: 'profile_asset_001',
    backendRule: '个人资产查询依赖外部鉴权上下文，不在 query/body 里新增 userId。',
  },
} as const satisfies Record<
  ContentResourceType,
  {
    label: string
    detailSupport: ContentResourceDetailSupport
    payloadDto: string
    idExample: string
    backendRule: string
  }
>

/**
 * sceneId 与 blockType 的正式对应关系。
 *
 * 后端组装 scene.blocks 时只能从对应白名单选择 blockType。不要把某个页面的块临时塞到
 * 另一个 scene 里；如果确实需要新增块类型，先改本文件。
 */
export const CONTENT_API_SCENE_BLOCKS = {
  home: ['notice_bar', 'banner_carousel', 'featured_drop', 'market_overview'],
  activity: ['activity_entries', 'activity_notice_feed'],
  profile: ['profile_summary', 'profile_assets'],
  settings: ['settings_summary', 'settings_sections'],
  service_hub: ['service_hub_entries'],
} as const satisfies Record<ContentSceneId, readonly ContentSceneBlockType[]>

/**
 * 内容展示元数据口径。
 *
 * 这些字段不是前端运行时字段，也不是 CSS 类名；它们是后端/CMS 可以返回的轻量展示提示。
 * 前端可以在字段缺失时使用默认展示，但后端返回时必须使用本文件中的枚举值。
 */
export const CONTENT_API_DISPLAY_METADATA_FIELDS = {
  backendContentDisplayMetadata: [
    'tone',
    'visualTone',
    'placeholderIconKey',
    'badgeType',
    'badgeLabel',
    'indicatorTone',
    'englishTitle',
    'badges',
    'visual.preset',
  ],
  frontendFallbackRule:
    '后端未返回可选展示元数据时，前端可以使用默认图标、默认色调或隐藏徽标；不能反推为后端字段已存在。',
  excludedBackendFields: ['owner', 'contract', 'chain', 'tokenStandard', 'traits', 'provenance'],
} as const

/**
 * 当前正式 contract 的字段归属矩阵。
 *
 * 这里用于明确哪些字段属于后端 DTO，哪些仍是前端上下文，
 * 哪些是内容展示元数据，避免字段解释继续散落到多个文档。
 */
export const CONTENT_API_FIELD_OWNERSHIP = {
  formalBackendFields: [
    'ContentEnvelope.code / message / requestId / serverTime / data',
    'ContentSceneDto.sceneId / version / updatedAt / blocks',
    'ContentResourceDto.resourceType / resourceId / title / subtitle / status / updatedAt / summary / asset / payload / relations',
    'ContentListDto.resourceType / page / pageSize / total / items',
    'ContentTargetDto.targetType / targetId / provider / target.params.category / target.params.subCategory / target.params.seriesId',
  ],
  backendContentDisplayMetadataFields:
    CONTENT_API_DISPLAY_METADATA_FIELDS.backendContentDisplayMetadata,
  frontendContextFields: [
    'route.query.*',
    'page-local params.category / params.subCategory',
    'query snapshot / request signature / cache key',
    'provider selection and runtime scope',
    'userScope / persistent cache scope',
  ],
  excludedBackendFields: CONTENT_API_DISPLAY_METADATA_FIELDS.excludedBackendFields,
} as const

export const CONTENT_API_FIELD_BOUNDARY_NOTES = {
  targetParams:
    'target.params.category / target.params.subCategory / target.params.seriesId 只为 profile_asset 跳转提供目标资源上下文，不是可自由扩展的新后端业务字段；资格证不作为一级分类。',
  targetProvider:
    'ContentTargetDto.provider 是内容来源标记，例如 home、activity；它不是运行时 provider，也不是 mock/http 切换开关。',
  routeQuery: 'route.query.* 只停留在前端路由层，永远不是正式内容域 contract 字段。',
  userContext:
    '用户身份从外部鉴权上下文解析，不通过 content API query/body 新增 userId 或 accountId。',
  querySnapshot:
    'query snapshot / cache key / request signature 只属于前端运行时，不是正式接口传输字段。',
  displayMetadata:
    'tone / visualTone / placeholderIconKey / badgeType / badgeLabel / indicatorTone / englishTitle / badges 是内容展示元数据，后端/CMS 可返回，前端可 fallback。',
  excludedBackendFields:
    'owner / contract / chain / tokenStandard / traits / provenance 当前不属于正式后端 contract。',
} as const

export interface ContentGenericTargetDto {
  /** 目标资源类型。只能使用正式 ContentResourceType，不能写页面名、路由名或组件名。 */
  targetType: Exclude<ContentTargetType, 'profile_asset'>
  /** 目标资源 ID。前端打开详情时会拿这个 ID 再走 resource 接口或匹配已有列表项。 */
  targetId: string
  /**
   * 可选内容来源标识。
   *
   * 例如 home、activity、profile。它只说明这个 target 从哪个内容块来，
   * 不是运行时 provider，不控制 mock/http，也不是鉴权字段。
   */
  provider?: string
}

export interface ContentProfileAssetTargetDto {
  /** 个人资产目标固定写 profile_asset。 */
  targetType: 'profile_asset'
  /** 个人资产资源 ID。必须能在当前用户的资产范围内唯一定位一个资产。 */
  targetId: string
  /** 可选内容来源标识。含义同 ContentGenericTargetDto.provider。 */
  provider?: string
  /** 个人资产详情需要的目标上下文，只允许这里列出的字段。 */
  params: {
    /** 一级分类，必须使用 ContentProfileCategoryId 的正式值；资格证归入 collections 下的系列/二级分类。 */
    category: ContentProfileCategoryId
    /** 二级分类，可选；旧前端对应 series_name，不传表示没有二级分类上下文。 */
    subCategory?: string
    /** 系列 ID，可选；旧前端对应 series_id，只作为 profile_asset 目标上下文。 */
    seriesId?: string
  }
}

export type ContentTargetDto = ContentGenericTargetDto | ContentProfileAssetTargetDto

/**
 * 正式内容契约中的共享资源跳转引用。
 *
 * 它只描述下一步应打开哪个资源，不能被解释为前端路由、
 * 组件名称或页面结构指令。
 */

export interface ContentFocalPointDto {
  /** 归一化焦点横坐标，取值范围 0~1。 */
  x: number
  /** 归一化焦点纵坐标，取值范围 0~1。 */
  y: number
}

export interface ContentAssetVariantsDto {
  /** 缩略图 URL，通常用于小卡片或列表。 */
  thumb?: string
  /** 卡片图 URL，通常用于市场卡或资产卡。 */
  card?: string
  /** 横幅图 URL，通常用于 banner 或大背景。 */
  banner?: string
  /** 详情图 URL，通常用于详情页主视觉。 */
  detail?: string
}

export interface ContentAssetDto {
  /** 素材 ID。后端自己的稳定素材主键。 */
  assetId: string
  /** 原始图片或素材 URL。 */
  originalUrl: string
  /** 原始素材宽度，单位 px。 */
  width: number
  /** 原始素材高度，单位 px。 */
  height: number
  /** 可选焦点坐标，用于前端裁切时保留主体。 */
  focalPoint?: ContentFocalPointDto
  /** 可选多规格图。没有生成多规格时可以不传。 */
  variants?: ContentAssetVariantsDto
}

export interface ContentNoticeVisualDto {
  /** 公告视觉预设，只能使用 ContentNoticeVisualPreset 的值。 */
  preset: ContentNoticeVisualPreset
  /** 公告视觉素材；没有素材时可以省略或返回 null。 */
  asset?: ContentAssetDto | null
}

export interface ContentNoticeSummaryDto {
  /** 公告 ID，必须能用于 resourceType=notice 的详情查询。 */
  noticeId: string
  /** 公告中文标题。 */
  title: string
  /** 公告类型文本，例如 platform、release、airdrop；用于筛选和展示。 */
  type: string
  /** 公告发布时间，推荐 ISO 8601 字符串。 */
  publishedAt: string
  /** 当前用户是否未读；用户身份来自外部鉴权上下文。 */
  isUnread: boolean
  /** 公告视觉元数据，可选；缺失时前端使用默认样式。 */
  visual?: ContentNoticeVisualDto
  /** 点击公告后打开的正式目标，通常是 notice 详情。 */
  target: ContentTargetDto
}

export interface ContentNoticeParagraphBlockDto {
  /** 公告正文块 ID，只需在当前公告内稳定唯一。 */
  id: string
  /** 固定为 paragraph，表示普通段落。 */
  kind: 'paragraph'
  /** 段落正文文本。 */
  text: string
}

export interface ContentNoticeListBlockDto {
  /** 公告列表块 ID，只需在当前公告内稳定唯一。 */
  id: string
  /** 固定为 list，表示公告正文中的条目列表。 */
  kind: 'list'
  /** 列表标题。 */
  title: string
  /** 列表条目；没有条目时返回空数组。 */
  items: string[]
}

export interface ContentNoticeMarketItemCardBlockDto {
  /** 公告内市场卡片块 ID，只需在当前公告内稳定唯一。 */
  id: string
  /** 固定为 market_item_card，表示公告正文中嵌入市场条目卡。 */
  kind: 'market_item_card'
  /** 嵌入卡片指向的市场条目目标。 */
  target: {
    /** 固定为 market_item。 */
    targetType: 'market_item'
    /** 市场条目 ID。 */
    targetId: string
  }
  /** 嵌入卡片说明文案，可选。 */
  caption?: string
}

export interface ContentNoticeActivityCardBlockDto {
  /** 公告内活动卡片块 ID，只需在当前公告内稳定唯一。 */
  id: string
  /** 固定为 activity_card，表示公告正文中嵌入活动卡。 */
  kind: 'activity_card'
  /** 嵌入卡片指向的活动目标。 */
  target: {
    /** 固定为 activity。 */
    targetType: 'activity'
    /** 活动 ID。 */
    targetId: string
  }
  /** 嵌入卡片说明文案，可选。 */
  caption?: string
}

export type ContentNoticeBlockDto =
  | ContentNoticeParagraphBlockDto
  | ContentNoticeListBlockDto
  | ContentNoticeMarketItemCardBlockDto
  | ContentNoticeActivityCardBlockDto

export interface ContentNoticePayloadDto {
  /** 公告发布时间，推荐 ISO 8601 字符串；用于详情页展示和排序。 */
  publishedAt: string
  /** 当前用户是否未读；用户身份来自外部鉴权上下文。 */
  isUnread: boolean
  /** 英文标题；如果后端没有英文内容，可返回与 title 对应的英文短标题或稳定占位。 */
  englishTitle: string
  /** 公告徽标文本数组；没有徽标时返回空数组。 */
  badges: string[]
  /** 公告正文块数组；没有正文块时返回空数组，但不要省略字段。 */
  blocks: ContentNoticeBlockDto[]
  /** 公告视觉元数据，可选；缺失时前端使用默认视觉。 */
  visual?: ContentNoticeVisualDto
}

export interface ContentDropPayloadDto {
  /** 发售区块标题。 */
  sectionTitle: string
  /** 发售区块副标题。 */
  sectionSubtitle: string
  /** 给人看的价格文本，例如 ¥199.00；展示用。 */
  priceLabel: string
  /** 货币代码或货币符号，例如 CNY。 */
  currency: string
  /** 价格，单位固定为分；例如 19900 表示 199.00 元。 */
  priceInCent: number
  /** 已铸造数量。 */
  mintedCount: number
  /** 总供应数量。 */
  supplyCount: number
  /** 可选占位图标；没有主图时前端可按该值选默认图标。 */
  placeholderIconKey?: ContentPlaceholderIconKey
}

export interface ContentHomeBannerPayloadDto {
  /** 横幅上的状态文案，例如 Live、进行中。 */
  liveLabel: string
  /** 横幅展示色调，只能使用 ContentHomeBannerTone。 */
  tone: ContentHomeBannerTone
}

export interface ContentActivityPayloadDto {
  /** 活动眉标短文案。 */
  eyebrow: string
  /** 活动描述正文。 */
  description: string
  /** 活动展示色调，只能使用 ContentActivityEntryTone。 */
  tone: ContentActivityEntryTone
  /** 可选徽标文案。 */
  badgeLabel?: string
}

export interface ContentMarketItemPayloadDto {
  /** 货币代码或货币符号，例如 CNY。 */
  currency: string
  /** 当前价格，单位固定为分。 */
  priceInCent: number
  /** 上架时间，推荐 ISO 8601 字符串。 */
  listedAt: string
  /** 24 小时交易量，单位按业务统计口径返回数字。 */
  tradeVolume24h: number
  /** 当前持有人数量。 */
  holderCount: number
  /** 版次或编号展示文本，例如 #001。 */
  editionCode: string
  /** 发行总量。 */
  issueCount: number
  /** 所属分类 ID 数组；没有分类时返回空数组。 */
  categoryIds: string[]
  /** 可选占位图标；没有主图时前端可按该值选默认图标。 */
  placeholderIconKey?: ContentPlaceholderIconKey
  /** 市场卡展示色调，只能使用 ContentMarketVisualTone。 */
  visualTone: ContentMarketVisualTone
  /** 可选徽标类型，只能使用 ContentMarketBadgeType。 */
  badgeType?: ContentMarketBadgeType
  /** 可选徽标文案；有 badgeType 时建议一并返回。 */
  badgeLabel?: string
}

export interface ContentAssetPayloadDto {
  /** 素材宽度，单位 px。 */
  width: number
  /** 素材高度，单位 px。 */
  height: number
}

export interface ContentProfileAssetPayloadDto {
  /** 一级资产分类，只能使用 ContentProfileCategoryId；资格证不得作为一级分类。 */
  categoryId: ContentProfileCategoryId
  /** 二级资产分类展示文本；旧前端个人资产口径对应 series_name。 */
  subCategory: string
  /** 系列 ID，可选；旧前端个人资产口径对应 series_id。 */
  seriesId?: string
  /** 获得时间，推荐 ISO 8601 字符串。 */
  acquiredAt: string
  /** 当前用户持有数量。 */
  holdingsCount: number
  /** 货币代码或货币符号，例如 CNY。 */
  currency: string
  /** 当前估值或展示价格，单位固定为分。 */
  priceInCent: number
  /** 版次或编号展示文本，例如 #001。 */
  editionCode: string
  /** 发行总量。 */
  issueCount: number
  /** 可选占位图标；没有主图时前端可按该值选默认图标。 */
  placeholderIconKey?: ContentPlaceholderIconKey
  /** 资产卡展示色调，只能使用 ContentMarketVisualTone。 */
  visualTone: ContentMarketVisualTone
  /** 可选徽标类型，只能使用 ContentMarketBadgeType。 */
  badgeType?: ContentMarketBadgeType
  /** 可选徽标文案；有 badgeType 时建议一并返回。 */
  badgeLabel?: string
  /** 可选链上或业务资产 ID；本期只作为展示/关联，不扩展链上详情字段。 */
  assetId?: string
  /** 可选关联市场条目 ID；用于跳转市场详情。 */
  linkedMarketItemId?: string
}

export interface ContentServiceEntryMetricDto {
  /** 指标 ID，只需在当前服务入口内稳定唯一。 */
  metricId: string
  /** 指标名称，例如 待付款、未读、余额。 */
  label: string
  /** 指标展示值；保留字符串是为了允许 12、12% 或 ¥12.00。 */
  value: string
  /** 指标补充说明，可选。 */
  caption?: string
}

export interface ContentServiceEntryItemDto {
  /** 条目 ID，只需在当前服务入口内稳定唯一。 */
  itemId: string
  /** 条目标题。 */
  title: string
  /** 条目描述。 */
  description: string
  /** 条目右侧展示值，可选。 */
  value?: string
  /** 点击条目后的正式目标，可选；没有跳转时可以省略。 */
  target?: ContentTargetDto
}

export interface ContentServiceEntrySectionDto {
  /** 分组 ID，只需在当前服务入口内稳定唯一。 */
  sectionId: string
  /** 分组中文标题。 */
  title: string
  /** 分组英文标题。 */
  englishTitle: string
  /** 分组条目；没有条目时返回空数组。 */
  items: ContentServiceEntryItemDto[]
}

export interface ContentServiceEntryPayloadDto {
  /** 服务入口 ID，只能使用 ContentServiceEntryId。 */
  serviceId: ContentServiceEntryId
  /** 服务入口英文标题。 */
  englishTitle: string
  /** 服务入口展示色调，只能使用 ContentServiceEntryTone。 */
  tone: ContentServiceEntryTone
  /** 服务入口状态文案，例如 正常、待处理。 */
  statusLabel: string
  /** 服务入口徽标文本；没有徽标时返回空数组。 */
  badges: string[]
  /** 服务入口指标；没有指标时返回空数组。 */
  metrics: ContentServiceEntryMetricDto[]
  /** 服务入口详情分组；没有分组时返回空数组。 */
  sections: ContentServiceEntrySectionDto[]
}

export interface ContentIdentityVerificationResultDto {
  /** 结果态视觉语义，只允许 success / danger。 */
  tone: ContentIdentityVerificationResultTone
  /** 结果态标题。 */
  title: string
  /** 结果态英文装饰码。 */
  code: string
  /** 结果态说明文案。 */
  description: string
  /** 结果态主按钮文案。 */
  actionLabel: string
  /** 结果态审核结论文案。 */
  auditFeedback: string
}

export interface ContentIdentityVerificationFeatureDto {
  /** 宸茶В閿佹潈鐩婂浘鏍囬敭銆?*/
  iconKey: ContentIdentityVerificationFeatureIconKey
  /** 宸茶В閿佹潈鐩婃爣棰樸€?*/
  title: string
  /** 宸茶В閿佹潈鐩婅鏄庛€?*/
  description: string
}

export interface ContentIdentityVerificationPayloadDto {
  /** 当前实名认证状态。 */
  verificationStatus: ContentIdentityVerificationStatus
  /** 当前真实姓名；未认证或未预填时允许为空字符串。 */
  legalName: string
  /** 当前证件号；未认证或未预填时允许为空字符串。 */
  idNumber: string
  /** 已掩码的证件号；展示已认证摘要时可直接使用。 */
  maskedIdNumber: string
  /** 姓名输入 placeholder。 */
  namePlaceholder: string
  /** 证件号输入 placeholder。 */
  idNumberPlaceholder: string
  /** 宸茶璇佸睍绀虹敤鐨勬牳楠屾椂闂淬€?*/
  verifiedAt: string
  /** 宸茶璇佸睍绀虹敤鐨勯摼涓婅妭鐐规爣璇嗐€?*/
  didNode: string
  /** 宸茶璇佸悗鐨勮В閿佹潈鐩婂垪琛ㄣ€?*/
  unlockedFeatures: ContentIdentityVerificationFeatureDto[]
  /** 鏁版嵁瀹夊叏澹版槑鏍囬銆?*/
  securityStatementTitle: string
  /** 鏁版嵁瀹夊叏澹版槑姝ｆ枃銆?*/
  securityStatementCopy: string
  /** 当前 mock 是否允许提交。 */
  submitEnabled: boolean
  /** 协议是否默认勾选。 */
  agreementCheckedByDefault: boolean
  /** 隐私协议展示名。 */
  privacyPolicyLabel: string
  /** 协议说明文案。 */
  consentCopy: string
  /** 处理中英文装饰码。 */
  processingCode: string
  /** 处理中标题。 */
  processingTitle: string
  /** 处理中说明文案。 */
  processingDescription: string
  /** 审核机构文案。 */
  auditOrganization: string
  /** mock 提交后返回成功还是失败。 */
  mockSubmitResult: ContentIdentityVerificationMockSubmitResult
  /** mock 成功结果配置。 */
  successResult: ContentIdentityVerificationResultDto
  /** mock 失败结果配置。 */
  failureResult: ContentIdentityVerificationResultDto
}

export interface ContentActionEntryPayloadDto {
  /** 动作入口 ID。它是内容入口 ID，不是 POST actionType。 */
  actionId: string
  /** 所属父级入口 ID，例如服务入口或设置分组 ID。 */
  parentId: string
  /** 动作入口英文标题。 */
  englishTitle: string
  /** 动作入口展示色调，只能使用 ContentServiceEntryTone。 */
  tone: ContentServiceEntryTone
  /** 动作入口状态文案。 */
  statusLabel: string
  /** 动作入口徽标文本；没有徽标时返回空数组。 */
  badges: string[]
  /** 动作入口指标；没有指标时返回空数组。 */
  metrics: ContentServiceEntryMetricDto[]
  /** 动作入口详情分组；没有分组时返回空数组。 */
  sections: ContentServiceEntrySectionDto[]
}

export type ContentResourcePayloadDto =
  | ContentNoticePayloadDto
  | ContentHomeBannerPayloadDto
  | ContentActivityPayloadDto
  | ContentDropPayloadDto
  | ContentMarketItemPayloadDto
  | ContentAssetPayloadDto
  | ContentProfileAssetPayloadDto
  | ContentServiceEntryPayloadDto
  | ContentIdentityVerificationPayloadDto
  | ContentActionEntryPayloadDto
  | Record<string, never>

export type ContentResourcePayloadByType<T extends ContentResourceType> = T extends 'notice'
  ? ContentNoticePayloadDto
  : T extends 'home_banner'
    ? ContentHomeBannerPayloadDto
    : T extends 'activity'
      ? ContentActivityPayloadDto
      : T extends 'drop'
        ? ContentDropPayloadDto
        : T extends 'market_item'
          ? ContentMarketItemPayloadDto
          : T extends 'asset'
            ? ContentAssetPayloadDto
            : T extends 'profile_asset'
              ? ContentProfileAssetPayloadDto
              : T extends 'service_entry'
                ? ContentServiceEntryPayloadDto
                : T extends 'identity_verification'
                  ? ContentIdentityVerificationPayloadDto
                  : T extends 'market_action' | 'service_action' | 'settings_action'
                    ? ContentActionEntryPayloadDto
                    : Record<string, never>

export interface ContentHomeBannerDto {
  /** 横幅 ID，必须能用于前端埋点或追踪，不要求一定能走 resource 查询。 */
  bannerId: string
  /** 横幅标题。 */
  title: string
  /** 横幅状态文案，例如 Live、进行中。 */
  liveLabel: string
  /** 横幅展示色调，只能使用 ContentHomeBannerTone。 */
  tone: ContentHomeBannerTone
  /** 横幅主素材。 */
  asset: ContentAssetDto
  /** 点击横幅后的正式目标。 */
  target: ContentTargetDto
}

export interface ContentFeaturedDropDto {
  /** 精选发售 ID，必须能用于 resourceType=drop 的详情查询。 */
  dropId: string
  /** 发售标题。 */
  title: string
  /** 区块标题。 */
  sectionTitle: string
  /** 区块副标题。 */
  sectionSubtitle: string
  /** 展示用价格文本。 */
  priceLabel: string
  /** 货币代码或货币符号。 */
  currency: string
  /** 价格，单位固定为分。 */
  priceInCent: number
  /** 已铸造数量。 */
  mintedCount: number
  /** 总供应数量。 */
  supplyCount: number
  /** 发售主素材；没有素材时可以省略或返回 null。 */
  asset?: ContentAssetDto | null
  /** 可选占位图标；没有主图时前端可按该值选默认图标。 */
  placeholderIconKey?: ContentPlaceholderIconKey
  /** 点击精选发售后的正式目标。 */
  target: ContentTargetDto
}

export interface ContentCategorySummaryDto {
  /** 分类 ID，用于 list 查询的 categoryId。 */
  categoryId: string
  /** 分类展示名称。 */
  categoryName: string
  /** Optional top-level market kinds this category belongs to; absent means shared. */
  marketKinds?: ContentMarketKind[]
}

export interface ContentMarketActionDto {
  /** 市场动作 ID，只能使用 ContentMarketActionId。 */
  actionId: ContentMarketActionId
  /** 动作按钮展示文本。 */
  label: string
  /** 点击动作后的正式目标。 */
  target: ContentTargetDto
}

export interface ContentMarketItemSummaryDto {
  /** 市场条目 ID，必须能用于 resourceType=market_item 的详情查询。 */
  itemId: string
  /** 市场条目标题。 */
  title: string
  /** 货币代码或货币符号。 */
  currency: string
  /** 当前价格，单位固定为分。 */
  priceInCent: number
  /** 上架时间，推荐 ISO 8601 字符串。 */
  listedAt: string
  /** 24 小时交易量。 */
  tradeVolume24h: number
  /** 当前持有人数量。 */
  holderCount: number
  /** 版次或编号展示文本。 */
  editionCode: string
  /** 发行总量。 */
  issueCount: number
  /** 所属分类 ID 数组；没有分类时返回空数组。 */
  categoryIds: string[]
  /** 市场条目主素材；没有素材时可以省略或返回 null。 */
  asset?: ContentAssetDto | null
  /** 可选占位图标；没有主图时前端可按该值选默认图标。 */
  placeholderIconKey?: ContentPlaceholderIconKey
  /** 市场卡展示色调，只能使用 ContentMarketVisualTone。 */
  visualTone: ContentMarketVisualTone
  /** 可选徽标类型，只能使用 ContentMarketBadgeType。 */
  badgeType?: ContentMarketBadgeType
  /** 可选徽标文案。 */
  badgeLabel?: string
  /** 点击条目后的正式目标。 */
  target: ContentTargetDto
}

export interface ContentNoticeBarBlockDto {
  /** 固定为 notice_bar，只能出现在 home scene。 */
  blockType: 'notice_bar'
  /** 公告条标题。 */
  label: string
  /** 查看更多按钮文案。 */
  detailLabel: string
  /** 公告摘要列表；没有公告时返回空数组。 */
  items: ContentNoticeSummaryDto[]
}

export interface ContentBannerCarouselBlockDto {
  /** 固定为 banner_carousel，只能出现在 home scene。 */
  blockType: 'banner_carousel'
  /** 横幅列表；没有横幅时返回空数组。 */
  items: ContentHomeBannerDto[]
}

export interface ContentFeaturedDropBlockDto {
  /** 固定为 featured_drop，只能出现在 home scene。 */
  blockType: 'featured_drop'
  /** 当前精选发售内容。 */
  item: ContentFeaturedDropDto
}

export interface ContentMarketOverviewBlockDto {
  /** 固定为 market_overview，只能出现在 home scene。 */
  blockType: 'market_overview'
  /** 市场区块标题。 */
  sectionTitle: string
  /** 市场区块副标题。 */
  sectionSubtitle: string
  /** 市场分类列表；没有分类时返回空数组。 */
  categories: ContentCategorySummaryDto[]
  /** 市场动作入口；没有动作时返回空数组。 */
  actions: ContentMarketActionDto[]
  /** 市场首屏条目；没有条目时返回空数组。 */
  items: ContentMarketItemSummaryDto[]
}

export interface ContentActivityEntryDto {
  /** 活动入口 ID，必须能用于 resourceType=activity 的详情查询。 */
  entryId: string
  /** 活动标题。 */
  title: string
  /** 活动眉标短文案。 */
  eyebrow: string
  /** 活动描述。 */
  description: string
  /** 活动展示色调。 */
  tone: ContentActivityEntryTone
  /** 可选徽标文案。 */
  badgeLabel?: string
  /** 点击活动入口后的正式目标。 */
  target: ContentTargetDto
}

export interface ContentActivityEntriesBlockDto {
  /** 固定为 activity_entries，只能出现在 activity scene。 */
  blockType: 'activity_entries'
  /** 活动入口列表；没有活动时返回空数组。 */
  items: ContentActivityEntryDto[]
}

export interface ContentActivityNoticeFeedBlockDto {
  /** 固定为 activity_notice_feed，只能出现在 activity scene。 */
  blockType: 'activity_notice_feed'
  /** 公告标签列表；没有标签时返回空数组。 */
  tags: string[]
  /** 公告摘要列表；没有公告时返回空数组。 */
  items: ContentNoticeSummaryDto[]
}

export interface ContentProfileSummaryBlockDto {
  /** 固定为 profile_summary，只能出现在 profile scene。 */
  blockType: 'profile_summary'
  /** 当前用户展示名，身份来自外部鉴权上下文。 */
  displayName: string
  /** 当前用户区块链地址展示文本；旧前端个人中心来源为 userInfo.ntf_url，不作为 content API 身份参数。 */
  address: string
  /** 当前用户摘要，可选。 */
  summary?: string
  /** 资产估值货币代码或货币符号。 */
  currency: string
  /** 总资产估值，单位固定为分。 */
  totalValueInCent: number
  /** 当前持有资产数量。 */
  holdingsCount: number
  /** 网络展示文案，可选。 */
  networkLabel?: string
  /** 状态展示文案，可选。 */
  statusLabel?: string
  /** 分享或二维码载荷，可选。 */
  qrPayload?: string
  /** 分享目标，可选。 */
  shareTarget?: ContentTargetDto
}

export interface ContentProfileAssetCategoryDto {
  /** 一级分类 ID，只能使用 ContentProfileCategoryId；资格证归入 collections 下的二级分类/系列。 */
  categoryId: ContentProfileCategoryId
  /** 一级分类展示名。 */
  categoryName: string
  /** 二级分类列表；旧前端对应系列名列表，没有二级分类时返回空数组。 */
  subCategories: string[]
}

export interface ContentProfileAssetItemDto {
  /** 个人资产列表项 ID，必须能用于 profile_asset 详情。 */
  itemId: string
  /** 个人资产标题。 */
  title: string
  /** 获得时间，推荐 ISO 8601 字符串。 */
  acquiredAt: string
  /** 二级分类展示文本；旧前端个人资产口径对应 series_name。 */
  subCategory: string
  /** 系列 ID，可选；旧前端个人资产口径对应 series_id。 */
  seriesId?: string
  /** 一级分类 ID；资格证不得作为一级分类。 */
  categoryId: ContentProfileCategoryId
  /** 当前用户持有数量。 */
  holdingsCount: number
  /** 货币代码或货币符号。 */
  currency: string
  /** 当前估值或展示价格，单位固定为分。 */
  priceInCent: number
  /** 版次或编号展示文本。 */
  editionCode: string
  /** 发行总量。 */
  issueCount: number
  /** 资产主素材；没有素材时可以省略或返回 null。 */
  asset?: ContentAssetDto | null
  /** 可选占位图标；没有主图时前端可按该值选默认图标。 */
  placeholderIconKey?: ContentPlaceholderIconKey
  /** 资产卡展示色调。 */
  visualTone: ContentMarketVisualTone
  /** 可选徽标类型。 */
  badgeType?: ContentMarketBadgeType
  /** 可选徽标文案。 */
  badgeLabel?: string
  /** 可选链上或业务资产 ID；本期不扩展链上详情字段。 */
  assetId?: string
  /** 可选关联市场条目 ID。 */
  linkedMarketItemId?: string
  /** 点击资产后的正式目标；没有详情跳转时可以省略。 */
  target?: ContentTargetDto
}

export interface ContentProfileAssetsBlockDto {
  /** 固定为 profile_assets，只能出现在 profile scene。 */
  blockType: 'profile_assets'
  /** 资产分类列表；没有分类时返回空数组。 */
  categories: ContentProfileAssetCategoryDto[]
  /** 当前用户资产列表首屏项；没有资产时返回空数组。 */
  items: ContentProfileAssetItemDto[]
}

export interface ContentSettingsSummaryBlockDto {
  /** 固定为 settings_summary，只能出现在 settings scene。 */
  blockType: 'settings_summary'
  /** 设置页主标题。 */
  title: string
  /** 设置页英文标题。 */
  englishTitle: string
  /** 设置页描述。 */
  description: string
  /** 主按钮中文文案。 */
  actionLabel: string
  /** 主按钮英文文案。 */
  actionEnglishLabel: string
  /** 主按钮点击后的正式目标。 */
  actionTarget: ContentTargetDto
}

export interface ContentSettingsItemDto {
  /** 设置项 ID，只需在当前分组内稳定唯一。 */
  itemId: string
  /** 设置项标题。 */
  title: string
  /** 设置项右侧值。 */
  value: string
  /** 点击设置项后的正式目标。 */
  target: ContentTargetDto
}

export interface ContentSettingsSectionDto {
  /** 设置分组 ID，只需在 settings scene 内稳定唯一。 */
  sectionId: string
  /** 设置分组中文标题。 */
  title: string
  /** 设置分组英文标题。 */
  englishTitle: string
  /** 设置项列表；没有设置项时返回空数组。 */
  items: ContentSettingsItemDto[]
}

export interface ContentSettingsSectionsBlockDto {
  /** 固定为 settings_sections，只能出现在 settings scene。 */
  blockType: 'settings_sections'
  /** 设置分组列表；没有分组时返回空数组。 */
  sections: ContentSettingsSectionDto[]
}

export interface ContentServiceHubEntryReminderDto {
  /** 服务入口 ID，只能使用 ContentServiceEntryId。 */
  serviceId: ContentServiceEntryId
  /** 当前用户是否仍有提醒；身份来自外部鉴权上下文。 */
  hasReminder: boolean
  /** 当前用户未读数量。 */
  unreadCount: number
  /** 提醒点展示色调，只能使用 ContentServiceHubIndicatorTone。 */
  indicatorTone: ContentServiceHubIndicatorTone
  /** 最新提醒消息 ID，可选。 */
  latestMessageId?: string
  /** 最新提醒消息时间，可选，推荐 ISO 8601 字符串。 */
  latestMessageAt?: string
}

export interface ContentServiceHubEntriesBlockDto {
  /** 固定为 service_hub_entries，只能出现在 service_hub scene。 */
  blockType: 'service_hub_entries'
  /** 服务入口提醒列表；没有提醒入口时返回空数组。 */
  items: ContentServiceHubEntryReminderDto[]
}

export type ContentSceneBlockDto =
  | ContentNoticeBarBlockDto
  | ContentBannerCarouselBlockDto
  | ContentFeaturedDropBlockDto
  | ContentMarketOverviewBlockDto
  | ContentActivityEntriesBlockDto
  | ContentActivityNoticeFeedBlockDto
  | ContentProfileSummaryBlockDto
  | ContentProfileAssetsBlockDto
  | ContentSettingsSummaryBlockDto
  | ContentSettingsSectionsBlockDto
  | ContentServiceHubEntriesBlockDto

export interface ContentSceneDto {
  /** 场景 ID，必须和请求的 sceneId 一致。 */
  sceneId: ContentSceneId
  /** 场景内容版本号。内容更新时递增或变化即可。 */
  version: number
  /** 场景最后更新时间。 */
  updatedAt: string
  /** 首屏聚合块数组。不同 blockType 对应不同块结构。 */
  blocks: ContentSceneBlockDto[]
}

export interface ContentRelationDto {
  /** 关系类型，例如父级、分类、相关公告、相关市场项。 */
  relationType: ContentRelationType
  /** 关系指向的正式资源目标。 */
  target: ContentTargetDto
}

export interface ContentResourceDtoBase<T extends ContentResourceType = ContentResourceType> {
  /** 资源类型，必须和请求 resourceType 一致。 */
  resourceType: T
  /** 资源 ID，必须和请求 resourceId 一致，并在同一 resourceType 下稳定唯一。 */
  resourceId: string
  /** 资源标题，用于详情页或列表转详情后的主标题。 */
  title: string
  /** 资源副标题，可选；没有副标题时可以省略，不要返回空占位对象。 */
  subtitle?: string
  /**
   * 资源状态。
   *
   * 推荐使用 published、active、disabled、archived 这类稳定业务状态。
   * 不要返回前端样式状态，例如 selected、hover、loading。
   */
  status: string
  /** 资源最后更新时间，推荐 ISO 8601 字符串。 */
  updatedAt: string
  /** 资源摘要，可选；用于卡片或详情页首段，不等同于正文 blocks。 */
  summary?: string
  /** 资源主素材，可选；无素材时可为 null 或省略。 */
  asset?: ContentAssetDto | null
  /** 按 resourceType 区分的业务载荷；具体结构见 ContentResourcePayloadByType 和 CONTENT_API_RESOURCE_TYPES。 */
  payload: ContentResourcePayloadByType<T>
  /** 相关资源目标。没有关联时返回空数组，不要返回 null。 */
  relations: ContentRelationDto[]
}

export type ContentResourceDto = {
  [K in ContentResourceType]: ContentResourceDtoBase<K>
}[ContentResourceType]

export interface ContentListItemDtoBase<
  T extends ContentListResourceType = ContentListResourceType,
> {
  /** 列表项资源类型，必须和列表 resourceType 对齐。 */
  resourceType: T
  /** 列表项资源 ID。前端打开详情时会用它请求 resource，必须在同一 resourceType 下稳定唯一。 */
  resourceId: string
  /** 列表项标题。 */
  title: string
  /** 列表项状态；不要返回 selected、hover、loading 这类前端状态。 */
  status: string
  /** 列表项最后更新时间，推荐 ISO 8601 字符串。 */
  updatedAt: string
  /** 列表项摘要，可选。 */
  summary?: string
  /** 列表项素材，可选；无素材时可为 null 或省略。 */
  asset?: ContentAssetDto | null
  /** 列表项点击后打开的正式资源目标。 */
  target: ContentTargetDto
  /** 列表项按 resourceType 区分的业务载荷；不能随手返回空对象。 */
  payload: ContentResourcePayloadByType<T>
}

export type ContentListItemDto = {
  [K in ContentListResourceType]: ContentListItemDtoBase<K>
}[ContentListResourceType]

export interface ContentListDtoBase<T extends ContentListResourceType = ContentListResourceType> {
  /** 当前列表类型，必须和请求 resourceType 一致。 */
  resourceType: T
  /** 当前页码。当前正式口径从 1 开始。 */
  page: number
  /** 每页数量，必须和请求 pageSize 对齐。 */
  pageSize: number
  /** 满足筛选条件的总条数；没有数据时返回 0。 */
  total: number
  /** 当前页列表项。没有数据时返回空数组，不要返回 null。 */
  items: ContentListItemDtoBase<T>[]
}

export type ContentListDto = {
  [K in ContentListResourceType]: ContentListDtoBase<K>
}[ContentListResourceType]

/**
 * 场景请求只用于首屏聚合块。
 *
 * 详情页和次级页必须继续使用 resource/list/action，
 * 不得为了走捷径临时新增 sceneId。
 */
export interface ContentSceneRequestDto {
  /** 必填。当前正式值：home、activity、profile、settings、service_hub。 */
  sceneId: ContentSceneId
  /** 可选。平台信息只用于环境补偿，不用于新增分端接口。 */
  platform?: string
  /** 可选。渠道信息只用于渠道补偿。 */
  channel?: string
  /** 可选。语言环境，例如 zh-CN。 */
  locale?: string
}

/**
 * 资源请求是获取单个详情资源的正式方式。
 *
 * 前端可以把响应转换成页面模型，但接口传输结构仍以 resource 为中心，
 * 不能反向变成页面专属结构。
 */
export interface ContentResourceRequestDto {
  /**
   * 必填。要查询的正式资源类型。
   *
   * 不是所有 ContentResourceType 当前都要求支持详情查询；
   * 后端应按 CONTENT_API_RESOURCE_TYPES.detailSupport 判断是否落地。
   */
  resourceType: ContentResourceType
  /** 必填。要查询的资源 ID，必须在同一 resourceType 下稳定唯一。 */
  resourceId: string
}

/**
 * 列表接口给后端看的正式 wire query。
 *
 * 这是 `GET /api/content/list` 的真实 query string 形态。
 * 后端只需要按这些扁平字段接，不需要理解前端 port 内部的 sort/dateRange 嵌套结构。
 */
export interface ContentMarketListWireQueryDto {
  /** 固定为 market_item，表示市场条目列表。 */
  resourceType: 'market_item'
  /** Optional market top-level kind; defaults to collections when absent. */
  marketKind?: ContentMarketKind
  /** 可选。市场分类 ID；不筛选分类时不传。 */
  categoryId?: string
  /** 可选。搜索关键词；不搜索时不传。 */
  keyword?: string
  /** 必填。页码，当前正式口径从 1 开始。 */
  page: number
  /** 必填。每页数量。 */
  pageSize: number
}

export interface ContentNoticeListWireQueryDto {
  /** 固定为 notice，表示公告列表。 */
  resourceType: 'notice'
  /** 可选。公告标签；不筛选标签时不传。 */
  tag?: string
  /** 可选。搜索关键词；不搜索时不传。 */
  keyword?: string
  /** 可选。发布时间开始日期或时间；不筛选时间时不传。 */
  startDate?: string
  /** 可选。发布时间结束日期或时间；不筛选时间时不传。 */
  endDate?: string
  /** 必填。页码，当前正式口径从 1 开始。 */
  page: number
  /** 必填。每页数量。 */
  pageSize: number
}

export interface ContentProfileAssetListWireQueryDto {
  /** 固定为 profile_asset，表示当前用户个人资产列表。 */
  resourceType: 'profile_asset'
  /** 可选。一级分类 ID；只允许 collections / blindBoxes，不筛选一级分类时不传。 */
  categoryId?: string
  /** 可选。二级分类展示名；旧前端对应 series_name，不筛选二级分类时不传。 */
  subCategory?: string
  /** 可选。系列 ID；旧前端对应 series_id，不筛选系列时不传。 */
  seriesId?: string
  /** 可选。搜索关键词；不搜索时不传。 */
  keyword?: string
  /** 必填。页码，当前正式口径从 1 开始。 */
  page: number
  /** 必填。每页数量。 */
  pageSize: number
}

export type ContentListWireQueryDto =
  | ContentMarketListWireQueryDto
  | ContentNoticeListWireQueryDto
  | ContentProfileAssetListWireQueryDto

/**
 * 前端 port 内部的列表请求形态。
 *
 * 当前正式后端 wire 契约仍是 `ContentListWireQueryDto` 的扁平 query：
 * `marketKind/startDate/endDate`。市场排序字段已从正式请求中移除，后端未支持前端排序。
 *
 * cursor 分页暂未进入正式 DTO，后续如启用必须先更新本文件。
 */
export interface ContentMarketListRequestDto {
  /** 固定为 market_item。前端内部字段，wire query 同名传给后端。 */
  resourceType: 'market_item'
  /** Optional market top-level kind; defaults to collections when absent. */
  marketKind?: ContentMarketKind
  /** 可选。市场分类 ID。前端内部字段，wire query 同名传给后端。 */
  categoryId?: string
  /** 可选。搜索关键词。前端内部字段，wire query 同名传给后端。 */
  keyword?: string
  /** 必填。页码，当前正式口径从 1 开始。 */
  page: number
  /** 必填。每页数量。 */
  pageSize: number
}

export interface ContentNoticeListRequestDto {
  /** 固定为 notice。前端内部字段，wire query 同名传给后端。 */
  resourceType: 'notice'
  /** 可选。公告标签。前端内部字段，wire query 同名传给后端。 */
  tag?: string
  /** 可选。搜索关键词。前端内部字段，wire query 同名传给后端。 */
  keyword?: string
  /** 可选。前端内部发布时间范围；http adapter 会拆成 startDate 与 endDate。 */
  dateRange?: {
    /** 开始日期；wire query 名称是 startDate。 */
    startDate: string
    /** 结束日期；wire query 名称是 endDate。 */
    endDate: string
  }
  /** 必填。页码，当前正式口径从 1 开始。 */
  page: number
  /** 必填。每页数量。 */
  pageSize: number
}

export interface ContentProfileAssetListRequestDto {
  /** 固定为 profile_asset。前端内部字段，wire query 同名传给后端。 */
  resourceType: 'profile_asset'
  /** 可选。一级分类 ID。只允许 collections / blindBoxes；资格证不作为一级分类。 */
  categoryId?: string
  /** 可选。二级分类展示名；旧前端对应 series_name。 */
  subCategory?: string
  /** 可选。系列 ID；旧前端对应 series_id。 */
  seriesId?: string
  /** 可选。搜索关键词。前端内部字段，wire query 同名传给后端。 */
  keyword?: string
  /** 必填。页码，当前正式口径从 1 开始。 */
  page: number
  /** 必填。每页数量。 */
  pageSize: number
}

export type ContentListRequestDto =
  | ContentMarketListRequestDto
  | ContentNoticeListRequestDto
  | ContentProfileAssetListRequestDto

/**
 * 当前正式 action 只保留已经有稳定后端语义的写回动作。
 *
 * 新增 action 必须先写入本文件，不能被编码成页面局部 mutation 后再补 contract。
 */
export interface NoticeReadActionRequestDto {
  /** 固定为 notice-read。 */
  actionType: 'notice-read'
  /** 必填。要标记已读的公告 ID；当前用户从外部鉴权上下文获取，不在 body 里传 userId。 */
  noticeId: string
}

export interface NoticeReadActionResultDto {
  /** 被处理的公告 ID，必须和请求 noticeId 一致。 */
  noticeId: string
  /** 处理后的未读状态；成功标记已读后通常为 false。 */
  isUnread: boolean
}

export interface ServiceReminderConsumeActionRequestDto {
  /** 固定为 service-reminder-consume。 */
  actionType: 'service-reminder-consume'
  /** 必填。服务入口 ID，只能使用 ContentServiceEntryId 的正式值。 */
  serviceId: ContentServiceEntryId
  /** 可选。前端声明已消费到的最新消息 ID；当前用户从外部鉴权上下文获取。 */
  latestMessageId?: string
}

export interface ServiceReminderConsumeActionResultDto {
  /** 被处理的服务入口 ID，必须和请求 serviceId 一致。 */
  serviceId: ContentServiceEntryId
  /** 处理后当前用户是否仍有提醒。 */
  hasReminder: boolean
  /** 处理后当前用户的未读数量。 */
  unreadCount: number
  /** 处理后的最新消息 ID，可选。 */
  latestMessageId?: string
  /** 最新消息时间，可选。 */
  latestMessageAt?: string
}

export type ContentActionRequestDto =
  | NoticeReadActionRequestDto
  | ServiceReminderConsumeActionRequestDto
export type ContentActionResultDto =
  | NoticeReadActionResultDto
  | ServiceReminderConsumeActionResultDto
