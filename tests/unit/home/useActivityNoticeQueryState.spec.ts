import { ref } from 'vue'
import {
  ALL_ACTIVITY_NOTICE_TAG,
  useActivityNoticeQueryState,
} from '@/pages/home/composables/activity/useActivityNoticeQueryState'
import type { HomeRailActivityContent } from '@/models/home-rail/homeRailActivity.model'

const createActivityContent = (): HomeRailActivityContent => ({
  entries: [],
  notices: {
    tags: [ALL_ACTIVITY_NOTICE_TAG, 'System'],
    list: [
      {
        id: 'n1',
        title: 'System maintenance notice',
        category: 'System',
        publishedAt: '2026-04-01T00:00:00.000Z',
        time: '1h',
        isUnread: true,
        target: {
          targetType: 'notice',
          targetId: 'n1',
        },
      },
    ],
  },
})

describe('useActivityNoticeQueryState', () => {
  afterEach(() => {
    vi.useRealTimers()
  })

  it('clearNoticeSearchState collapses search without changing all-tag snapshot semantics', () => {
    const queryState = useActivityNoticeQueryState({
      content: ref(createActivityContent()),
    })

    queryState.noticeKeyword.value = 'maintenance'
    queryState.isNoticeSearchVisible.value = true

    queryState.clearNoticeSearchState({ collapse: true })

    expect(queryState.noticeKeyword.value).toBe('')
    expect(queryState.isNoticeSearchApplied.value).toBe(false)
    expect(queryState.isNoticeSearchVisible.value).toBe(false)
    expect(queryState.resolveActivityNoticeQuerySnapshot().tag).toBeUndefined()
  })

  it('clearNoticeSearchState keeps search panel open when collapse=false', () => {
    const queryState = useActivityNoticeQueryState({
      content: ref(createActivityContent()),
    })

    queryState.noticeKeyword.value = 'system'
    queryState.isNoticeSearchVisible.value = true

    queryState.clearNoticeSearchState({ collapse: false })

    expect(queryState.noticeKeyword.value).toBe('')
    expect(queryState.isNoticeSearchApplied.value).toBe(false)
    expect(queryState.isNoticeSearchVisible.value).toBe(true)
    expect(queryState.resolveActivityNoticeQuerySnapshot().keyword).toBeUndefined()
  })

  it('resolves all-tag query snapshot without tag filter', () => {
    const queryState = useActivityNoticeQueryState({
      content: ref(createActivityContent()),
    })

    queryState.handleTagSelect(ALL_ACTIVITY_NOTICE_TAG)

    expect(queryState.resolveActivityNoticeQuerySnapshot().tag).toBeUndefined()
  })

  it('applies notice tag switches immediately so the active UI and query stay aligned', () => {
    const queryState = useActivityNoticeQueryState({
      content: ref(createActivityContent()),
    })

    const nextTag = queryState.noticeTags.value[1] ?? ALL_ACTIVITY_NOTICE_TAG
    queryState.handleTagSelect(nextTag)
    expect(queryState.resolveActivityNoticeQuerySnapshot().tag).toBe(nextTag)

    queryState.handleTagSelect(ALL_ACTIVITY_NOTICE_TAG)
    expect(queryState.resolveActivityNoticeQuerySnapshot().tag).toBeUndefined()
  })

  it('reads notice input value from event.detail.value', async () => {
    vi.useFakeTimers()
    const queryState = useActivityNoticeQueryState({
      content: ref(createActivityContent()),
    })

    queryState.handleNoticeKeywordInput({
      detail: {
        value: 'activity',
      },
    } as unknown as Event)

    await vi.advanceTimersByTimeAsync(300)

    expect(queryState.noticeKeyword.value).toBe('activity')
    expect(queryState.isNoticeSearchApplied.value).toBe(true)
    expect(queryState.resolveActivityNoticeQuerySnapshot().keyword).toBe('activity')
  })

  it('debounces notice keyword input and keeps the latest value after older timers are cleared', async () => {
    vi.useFakeTimers()
    const queryState = useActivityNoticeQueryState({
      content: ref(createActivityContent()),
    })

    queryState.handleNoticeKeywordInput({
      detail: {
        value: '  first',
      },
    } as unknown as Event)
    await vi.advanceTimersByTimeAsync(110)

    queryState.handleNoticeKeywordInput({
      target: {
        value: '  second',
      },
    } as unknown as Event)

    await vi.advanceTimersByTimeAsync(299)
    expect(queryState.resolveActivityNoticeQuerySnapshot().keyword).toBeUndefined()
    expect(queryState.noticeKeyword.value).toBe('  second')

    await vi.advanceTimersByTimeAsync(1)
    expect(queryState.resolveActivityNoticeQuerySnapshot().keyword).toBe('second')
    expect(queryState.noticeKeyword.value).toBe('  second')
    expect(queryState.isNoticeSearchApplied.value).toBe(true)
  })

  it('clears pending notice search debounce immediately when the search panel is closed', async () => {
    vi.useFakeTimers()
    const queryState = useActivityNoticeQueryState({
      content: ref(createActivityContent()),
    })

    queryState.isNoticeSearchVisible.value = true
    queryState.handleNoticeKeywordInput({
      detail: {
        value: 'filter',
      },
    } as unknown as Event)
    await vi.advanceTimersByTimeAsync(100)

    queryState.clearNoticeSearchState({ collapse: true })
    expect(queryState.noticeKeyword.value).toBe('')
    expect(queryState.isNoticeSearchApplied.value).toBe(false)
    expect(queryState.isNoticeSearchVisible.value).toBe(false)

    await vi.advanceTimersByTimeAsync(300)
    expect(queryState.resolveActivityNoticeQuerySnapshot().keyword).toBeUndefined()
  })

  it('keeps the last selected notice tag in the query snapshot', () => {
    const queryState = useActivityNoticeQueryState({
      content: ref(createActivityContent()),
    })

    const nextTag = queryState.noticeTags.value[1] ?? ALL_ACTIVITY_NOTICE_TAG
    queryState.handleTagSelect(nextTag)
    queryState.handleTagSelect(ALL_ACTIVITY_NOTICE_TAG)

    expect(queryState.resolveActivityNoticeQuerySnapshot().tag).toBeUndefined()
  })

  it('prepends all tag when content tags omit the sentinel', () => {
    const content = createActivityContent()
    content.notices.tags = ['System']
    const queryState = useActivityNoticeQueryState({
      content: ref(content),
    })

    expect(queryState.noticeTags.value[0]).toBe(ALL_ACTIVITY_NOTICE_TAG)
    expect(queryState.noticeTags.value[1]).toBe('System')
  })
})
