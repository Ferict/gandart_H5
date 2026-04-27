import { ref } from 'vue'
import { useHomeRailActivityViewState } from '@/pages/home/composables/activity/useHomeRailActivityViewState'
import type { ActivityNoticeListResult } from '@/models/home-rail/homeRailActivity.model'

const createNotice = (id: string) => ({
  id,
  title: `notice-${id}`,
  category: '平台',
  publishedAt: '2026-04-01T00:00:00.000Z',
  time: '04-01 08:00',
  isUnread: true,
  target: {
    targetType: 'notice' as const,
    targetId: id,
  },
})

const createRemoteList = (length: number): ActivityNoticeListResult => ({
  resourceType: 'notice',
  page: 1,
  pageSize: 60,
  total: length,
  list: Array.from({ length }, (_, index) => createNotice(`N-${index + 1}`)),
})

describe('useHomeRailActivityViewState', () => {
  it('reveals notices in 12-item steps while preserving the full loaded total', () => {
    const state = useHomeRailActivityViewState({
      allNoticeTag: '全部',
      activeTag: ref('全部'),
      noticeKeyword: ref(''),
      normalizedAppliedNoticeKeyword: ref(''),
      hasResolvedInitialActivityContent: ref(true),
      hasResolvedRemoteNoticeList: ref(true),
      remoteFilteredNoticeList: ref(createRemoteList(30)),
      sceneFilteredNotices: ref([]),
    })

    expect(state.noticeVisibleCount.value).toBe(12)
    expect(state.visibleNotices.value).toHaveLength(12)
    expect(state.hasMoreVisibleNotices.value).toBe(true)
    expect(state.resolvedNoticeTotal.value).toBe(30)

    state.noticeVisibleCount.value = 24
    expect(state.visibleNotices.value).toHaveLength(24)
    expect(state.hasMoreVisibleNotices.value).toBe(true)

    state.noticeVisibleCount.value = 99
    expect(state.visibleNotices.value).toHaveLength(30)
    expect(state.hasMoreVisibleNotices.value).toBe(false)
    expect(state.isNoticeRevealExhausted.value).toBe(true)
  })
})
