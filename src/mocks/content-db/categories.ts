/**
 * Responsibility: provide the mock category catalog used by the content mock provider for
 * category-scoped list and scene responses.
 * Out of scope: asset records, scene assembly, and category selection UI behavior.
 */
export interface ContentCategoryRecord {
  categoryId: string
  categoryName: string
  status: 'online'
  updatedAt: string
}

export const contentCategoryDb: ContentCategoryRecord[] = [
  {
    categoryId: 'all',
    categoryName: '全部',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: '3d-component',
    categoryName: '组件',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: 'digital-art',
    categoryName: '数字艺术馆',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: 'equity-certificate',
    categoryName: '权益证',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: 'virtual-wear',
    categoryName: '虚拟穿戴',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: 'music-scene',
    categoryName: '音乐现场',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: 'generated-video',
    categoryName: '生成影像',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: 'onchain-ticket',
    categoryName: '链上票',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: 'curation-archive',
    categoryName: '策展档案',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
  {
    categoryId: 'co-brand-badge',
    categoryName: '联名徽章',
    status: 'online',
    updatedAt: '2026-03-25T12:24:00+08:00',
  },
]
