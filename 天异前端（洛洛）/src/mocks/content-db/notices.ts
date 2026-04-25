/**
 * Responsibility: define the canonical in-repo mock notice database and helper shape
 * used by mock content scenes and notice resources.
 * Out of scope: scene scheduling, result-window presentation, and provider transport.
 */
import type {
  ContentNoticeBlockDto,
  ContentRelationDto,
} from '../../contracts/content-api.contract'

export interface ContentNoticeRecord {
  noticeId: string
  title: string
  englishTitle: string
  type: string
  publishedAt: string
  status: 'LIVE'
  updatedAt: string
  summary: string
  badges: string[]
  blocks: ContentNoticeBlockDto[]
  relations?: ContentRelationDto[]
}

const cloneNoticeBlocks = (blocks: ContentNoticeBlockDto[]): ContentNoticeBlockDto[] => {
  return blocks.map((block) => {
    if (block.kind === 'paragraph') {
      return { ...block }
    }

    if (block.kind === 'list') {
      return {
        ...block,
        items: [...block.items],
      }
    }

    if (block.kind === 'market_item_card') {
      return {
        ...block,
        target: { ...block.target },
      }
    }

    return {
      ...block,
      target: { ...block.target },
    }
  })
}

const cloneNoticeRelations = (
  relations?: ContentRelationDto[]
): ContentRelationDto[] | undefined => {
  return relations?.map((item) => ({
    relationType: item.relationType,
    target: { ...item.target },
  }))
}

const createParagraphBlock = (id: string, text: string): ContentNoticeBlockDto => ({
  id,
  kind: 'paragraph',
  text,
})

const createListBlock = (id: string, title: string, items: string[]): ContentNoticeBlockDto => ({
  id,
  kind: 'list',
  title,
  items: [...items],
})

const createMarketItemCardBlock = (
  id: string,
  targetId: string,
  caption?: string
): ContentNoticeBlockDto => ({
  id,
  kind: 'market_item_card',
  target: {
    targetType: 'market_item',
    targetId,
  },
  caption,
})

const createActivityCardBlock = (
  id: string,
  targetId: string,
  caption?: string
): ContentNoticeBlockDto => ({
  id,
  kind: 'activity_card',
  target: {
    targetType: 'activity',
    targetId,
  },
  caption,
})

const createRelation = (
  relationType: ContentRelationDto['relationType'],
  targetType: Exclude<ContentRelationDto['target']['targetType'], 'profile_asset'>,
  targetId: string
): ContentRelationDto => ({
  relationType,
  target: {
    targetType,
    targetId,
  },
})

const createNoticeRecord = (
  input: Omit<ContentNoticeRecord, 'blocks' | 'relations'> & {
    blocks: ContentNoticeBlockDto[]
    relations?: ContentRelationDto[]
  }
): ContentNoticeRecord => ({
  ...input,
  badges: [...input.badges],
  blocks: cloneNoticeBlocks(input.blocks),
  relations: cloneNoticeRelations(input.relations),
})

export const contentNoticeDb: ContentNoticeRecord[] = [
  createNoticeRecord({
    noticeId: 'HOME-N-001',
    title: '第 10 批次核心资产「合成黎明」铸造通道正式开启',
    englishTitle: 'Notice Detail',
    type: '系统公告',
    publishedAt: '2026-03-14T19:20:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-14T19:20:00+08:00',
    summary: '首页公告条共用的铸造开启通知，当前作为首页与公告详情页的统一内容源。',
    badges: ['Mint', 'System Update', 'Aether Core'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '铸造入口已经开放，建议在网络稳定的环境下完成钱包确认。若出现状态延迟，请以后续系统回执为准。'
      ),
      createListBlock('L-1', '操作步骤', [
        '确认钱包连接状态与可用余额。',
        '进入铸造页面后核对资产批次与价格。',
        '提交后等待链上回执，不要重复提交。',
      ]),
      createParagraphBlock(
        'P-2',
        '如遇异常，请通过设置页中的问题反馈入口提交日志编号，平台会在后续批次统一处理。'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'HOME-N-002',
    title: '平台手续费模型已更新，市场挂单将按新规则结算',
    englishTitle: 'Notice Detail',
    type: '系统公告',
    publishedAt: '2026-03-26T08:05:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-26T08:05:00+08:00',
    summary: '市场手续费与结算模型调整公告，继续作为首页与详情页的同一内容源。',
    badges: ['Market', 'Settlement', 'Rule Update'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '平台手续费模型已经完成本轮更新，后续市场挂单与成交回执将按新结算规则统一处理。'
      ),
      createListBlock('L-1', '本轮调整内容', [
        '挂单手续费与撤单手续费已拆分。',
        '成交回执会补充结算明细。',
        '部分旧挂单会在下一批完成迁移。',
      ]),
    ],
  }),
  createNoticeRecord({
    noticeId: 'HOME-N-003',
    title: '本周维护窗口已发布，请及时确认资产与订单状态',
    englishTitle: 'Notice Detail',
    type: '系统公告',
    publishedAt: '2026-03-11T21:45:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-11T21:45:00+08:00',
    summary: '维护窗口公告继续供首页滚动通知和公告详情页共用，后续将直接对接后台可编辑内容。',
    badges: ['Maintenance', 'System Window', 'Status Check'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '维护窗口期间，部分资产状态与订单状态可能延迟刷新，请以系统最终回执为准。'
      ),
      createListBlock('L-1', '维护期建议', [
        '避免在窗口内重复提交交易动作。',
        '优先核对待支付与待确认订单。',
        '如状态异常，请记录订单编号后再提交反馈。',
      ]),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-01',
    title: '「虚空展厅」全球通行证发售说明',
    englishTitle: 'Notice Detail',
    type: '发售',
    publishedAt: '2026-03-08T10:15:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-08T10:15:00+08:00',
    summary: '虚空展厅通行证将按批次开放发售，发售入口与资格校验将继续沿用统一公告资源。',
    badges: ['Release', 'Pass', 'Aether Core'],
    blocks: [
      createParagraphBlock('P-1', '本次活动入口已开放预检，正式领取窗口会在下一条公告中同步开启。'),
      createListBlock('L-1', '领取前检查', [
        '确认账户已完成实名配置。',
        '确认钱包地址绑定成功。',
        '确认活动期间内网络稳定。',
      ]),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-02',
    title: '第 10 批次核心资产「合成黎明」铸造指引',
    englishTitle: 'Notice Detail',
    type: '合成',
    publishedAt: '2026-03-24T22:10:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-24T22:10:00+08:00',
    summary:
      '核心资产铸造前请先完成账户与网络校验，避免重复提交。后续将作为合成详情页可引用公告的统一资源。',
    badges: ['Mint', 'Guide', 'Aether Core'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '本批铸造采用统一排队链路，提交后请等待链上确认，不要在短时间内重复发起。'
      ),
      createListBlock('L-1', '提交前检查', [
        '确认钱包网络已切换到正确链。',
        '确认账户余额足以支付手续费。',
        '确认资产批次与铸造价格一致。',
      ]),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-03',
    title: 'AETHER 平台维护窗口与节点升级说明',
    englishTitle: 'Notice Detail',
    type: '平台',
    publishedAt: '2026-03-13T09:40:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-13T09:40:00+08:00',
    summary: '平台节点将在维护窗口内完成升级，期间部分入口将临时只读。',
    badges: ['Platform', 'Maintenance', 'Upgrade'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '维护期间社区互动入口将临时只读，历史内容不会丢失，恢复时间以后续公告为准。'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-04',
    title: '限价委托风控阈值更新说明',
    englishTitle: 'Notice Detail',
    type: '限价',
    publishedAt: '2026-03-27T14:05:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-27T14:05:00+08:00',
    summary: '限价委托风控阈值已升级，异常价差与高频改单会触发二次校验。',
    badges: ['Limit Price', 'Risk Control', 'Market'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '本轮风控策略会针对异常价差与高频改单行为触发额外校验，请确保账户通知渠道可用。'
      ),
      createListBlock('L-1', '建议处理方式', [
        '委托前核对当前深度与成交区间。',
        '避免在短时间内连续大幅改单。',
        '触发校验时按站内提示完成二次确认。',
      ]),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-05',
    title: 'Creator Guild 第四期空投资格快照公告',
    englishTitle: 'Notice Detail',
    type: '空投',
    publishedAt: '2026-03-16T18:20:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-16T18:20:00+08:00',
    summary: '第四期空投资格快照已完成，符合条件的钱包地址会按批次发放。',
    badges: ['Airdrop', 'Snapshot', 'Creator'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '本轮空投资格以快照区块高度为准，未达标账户会在下一轮快照重新评估。'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-06',
    title: '寄售手续费与结算时点调整公告',
    englishTitle: 'Notice Detail',
    type: '寄售',
    publishedAt: '2026-03-06T07:55:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-06T07:55:00+08:00',
    summary: '寄售手续费已拆分为挂单费与成交费，结算时点同步更新。',
    badges: ['Consignment', 'Settlement', 'Rule Update'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '寄售链路现已启用新费率结构，挂单确认后会展示预计成交费与最终结算明细。'
      ),
      createListBlock('L-1', '本轮调整内容', [
        '挂单费与成交费拆分展示。',
        '撤单返还策略按新规则执行。',
        '历史订单会在后续批次补齐新字段。',
      ]),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-07',
    title: '资产置换通道第一阶段开放说明',
    englishTitle: 'Notice Detail',
    type: '置换',
    publishedAt: '2026-03-21T16:45:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-21T16:45:00+08:00',
    summary: '资产置换通道已开放首批白名单，后续会逐步扩充可置换资产范围。',
    badges: ['Swap', 'Whitelist', 'Asset'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '置换提交后会进入链上校验队列，请勿重复提交同一资产组合，避免占用置换额度。'
      ),
      createListBlock('L-1', '参与前检查', [
        '确认资产状态为可流通。',
        '确认目标资产在本批白名单内。',
        '确认钱包签名环境稳定可用。',
      ]),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-08',
    title: 'Collection Spotlight / Wind Route Batch',
    englishTitle: 'Notice Detail',
    type: '发售',
    publishedAt: '2026-03-12T11:30:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-12T11:30:00+08:00',
    summary: 'Collection image priority verification card: release channel sample.',
    badges: ['Release', 'Collection', 'Image First'],
    blocks: [
      createParagraphBlock(
        'P-1',
        'This notice is seeded with collection artwork to validate image-first rendering against preset icon fallback.'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-09',
    title: 'Collection Spotlight / Merge Draft',
    englishTitle: 'Notice Detail',
    type: '合成',
    publishedAt: '2026-03-25T13:10:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-25T13:10:00+08:00',
    summary: 'Collection image priority verification card: synthesis channel sample.',
    badges: ['Synthesis', 'Collection', 'Image First'],
    blocks: [
      createParagraphBlock(
        'P-1',
        'Rendered with uploaded-like collection image by default override in mock layer.'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-10',
    title: 'Collection Spotlight / Limit Grid',
    englishTitle: 'Notice Detail',
    type: '限价',
    publishedAt: '2026-03-09T20:40:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-09T20:40:00+08:00',
    summary: 'Collection image priority verification card: limit-price channel sample.',
    badges: ['Limit Price', 'Collection', 'Image First'],
    blocks: [
      createParagraphBlock(
        'P-1',
        'When image asset exists, card icon area should render image and skip preset icon.'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-11',
    title: 'Collection Spotlight / Emerald Drop',
    englishTitle: 'Notice Detail',
    type: '空投',
    publishedAt: '2026-03-18T12:00:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-18T12:00:00+08:00',
    summary: 'Collection image priority verification card: airdrop channel sample.',
    badges: ['Airdrop', 'Collection', 'Image First'],
    blocks: [
      createParagraphBlock(
        'P-1',
        'Fallback icon must only appear when notice visual has no image asset.'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-12',
    title: 'Collection Spotlight / Consign Deck',
    englishTitle: 'Notice Detail',
    type: '寄售',
    publishedAt: '2026-03-05T09:25:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-05T09:25:00+08:00',
    summary: 'Collection image priority verification card: consignment channel sample.',
    badges: ['Consignment', 'Collection', 'Image First'],
    blocks: [
      createParagraphBlock(
        'P-1',
        'Seeded image should be used as default in activity notice feed rendering.'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-13',
    title: 'Collection Spotlight / Swap Pulse',
    englishTitle: 'Notice Detail',
    type: '置换',
    publishedAt: '2026-03-22T17:35:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-22T17:35:00+08:00',
    summary: 'Collection image priority verification card: swap channel sample.',
    badges: ['Swap', 'Collection', 'Image First'],
    blocks: [
      createParagraphBlock(
        'P-1',
        'Keep this card image-driven for regression checks after style updates.'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-14',
    title: 'Platform Fallback Icon Verification',
    englishTitle: 'Notice Detail',
    type: '平台',
    publishedAt: '2026-03-10T15:50:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-10T15:50:00+08:00',
    summary: 'No image override is bound to this notice by default, used to verify icon fallback.',
    badges: ['Platform', 'Fallback', 'Verification'],
    blocks: [
      createParagraphBlock(
        'P-1',
        'This record intentionally keeps icon fallback path active for visual priority testing.'
      ),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-15',
    title: '资产合成第二阶段开放节奏说明',
    englishTitle: 'Notice Detail',
    type: '合成',
    publishedAt: '2026-03-26T21:15:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-26T21:15:00+08:00',
    summary: '第二阶段资产合成将在晚间窗口分批开放，资格同步与资源校验仍按统一活动链路执行。',
    badges: ['Synthesis', 'Activity', 'Direct Link'],
    blocks: [
      createParagraphBlock('P-1', '第二阶段开放会先放出小批量名额，待链路稳定后再逐步扩大。'),
      createListBlock('L-1', '本轮关注点', [
        '优先确认合成素材状态是否可用。',
        '等待批次资格同步后再进入合成页。',
        '若回执延迟，请勿重复发起。',
      ]),
    ],
    relations: [
      createRelation('related_activity', 'activity', 'asset-merge'),
      createRelation('related_market_item', 'market_item', 'C-18'),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-16',
    title: '抽奖活动补录资格与名单同步说明',
    englishTitle: 'Notice Detail',
    type: '平台',
    publishedAt: '2026-03-07T08:45:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-07T08:45:00+08:00',
    summary: '抽奖活动补录资格将在今日分三轮同步，名单页与活动详情页后续可直接引用同一公告资源。',
    badges: ['Platform', 'Draw', 'Sync'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '补录名单会按批次刷新，若当前未命中资格，请等待下一轮同步后再检查。'
      ),
      createListBlock('L-1', '同步节奏', [
        '上午同步第一轮资格。',
        '下午补录异常回执账户。',
        '晚间统一写回最终名单状态。',
      ]),
    ],
    relations: [createRelation('related_activity', 'activity', 'priority-draw')],
  }),
  createNoticeRecord({
    noticeId: 'N-17',
    title: '夜场置换窗口调整与资产回流提醒',
    englishTitle: 'Notice Detail',
    type: '置换',
    publishedAt: '2026-03-19T23:05:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-19T23:05:00+08:00',
    summary: '夜场置换窗口将缩短为 90 分钟，回流资产会在次日统一回写，后续可与相关资产详情互链。',
    badges: ['Swap', 'Night Shift', 'Asset'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '夜场窗口关闭后，回流资产会进入统一清算队列，回写完成前请勿再次发起置换。'
      ),
      createListBlock('L-1', '注意事项', [
        '确认置换目标仍在当前白名单内。',
        '确认回流资产不会影响次日操作。',
        '如遇回写延迟，请保存交易编号。',
      ]),
    ],
    relations: [
      createRelation('related_market_item', 'market_item', 'C-06'),
      createRelation('related_activity', 'activity', 'network-invite'),
    ],
  }),
  createNoticeRecord({
    noticeId: 'N-REL-001',
    title: '公告关联资源卡片预留样例',
    englishTitle: 'Notice Detail',
    type: '平台',
    publishedAt: '2026-03-23T07:20:00+08:00',
    status: 'LIVE',
    updatedAt: '2026-03-23T07:20:00+08:00',
    summary:
      '该公告不进入当前场景列表，仅用于验证公告正文 typed block 与资源级 relations 的可解析性。',
    badges: ['Platform', 'Relation', 'Schema'],
    blocks: [
      createParagraphBlock(
        'P-1',
        '这个样例公告用于后续详情页互链接入前的 contract 验证，不承担当前页面渲染任务。'
      ),
      createMarketItemCardBlock('C-1', 'C-18', '示例：正文内引用藏品卡片'),
      createActivityCardBlock('A-1', 'asset-merge', '示例：正文内引用活动卡片'),
      createParagraphBlock(
        'P-2',
        '当详情页后续接入资源卡片渲染时，可以直接消费这两种 typed block，而不需要再回改公告接口。'
      ),
    ],
    relations: [
      createRelation('related_market_item', 'market_item', 'C-18'),
      createRelation('related_activity', 'activity', 'asset-merge'),
      createRelation('related_notice', 'notice', 'N-15'),
    ],
  }),
]

export const contentNoticeUnreadSeed: Record<string, boolean> = {
  'HOME-N-001': true,
  'HOME-N-002': false,
  'HOME-N-003': false,
}
