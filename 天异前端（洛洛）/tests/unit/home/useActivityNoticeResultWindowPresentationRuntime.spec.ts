import { computed, ref } from 'vue'
import { describe, expect, it } from 'vitest'
import { useActivityNoticeResultWindowPresentationRuntime } from '@/pages/home/composables/activity/useActivityNoticeResultWindowPresentationRuntime'
import type { ActivityNotice } from '@/models/home-rail/homeRailActivity.model'

const createNotice = (id: string, overrides: Partial<ActivityNotice> = {}) =>
  ({
    id,
    title: `notice-${id}`,
    category: 'activity',
    time: '2026-04-14',
    isUnread: false,
    imageUrl: `https://cdn.example.com/${id}.png`,
    ...overrides,
  }) as ActivityNotice

describe('useActivityNoticeResultWindowPresentationRuntime', () => {
  it('exposes signatures, endline state, entry styles, and overlay positioning', () => {
    const runtime = useActivityNoticeResultWindowPresentationRuntime({
      filteredNotices: computed(() => [createNotice('a'), createNotice('b', { isUnread: true })]),
      displayedNotices: ref([createNotice('a')]),
      mountedNotices: ref([createNotice('a'), createNotice('b')]),
      resolvedNoticeTotal: computed(() => 2),
      noticePlaceholderIdSet: ref(new Set(['placeholder-1'])),
      noticeEntryPhaseMap: ref({
        a: 'entering',
        b: 'replay-entering',
      }),
      noticeResultMotionSource: ref('manual-query-switch'),
      resolveNoticeImageUrl: (notice) => notice.imageUrl,
      staggerStepMs: 100,
    })

    expect(runtime.visibleNoticeStructureSignature.value).toBe('a|b')
    expect(runtime.visibleNoticeContentSignature.value).toContain('b::notice-b::activity')
    expect(runtime.shouldShowActivityBottomEndline.value).toBe(true)
    expect(runtime.isNoticePlaceholder('placeholder-1')).toBe(true)
    expect(runtime.resolveNoticeEntryClass('a')).toMatchObject({
      'is-entering': true,
      'is-motion-manual-query-switch': true,
    })
    expect(runtime.resolveNoticeEntryStyle('b', 1)).toEqual({
      '--home-activity-notice-entry-delay': '100ms',
    })
    expect(runtime.resolveNoticeRemovedOverlayItemStyle(2)).toEqual({
      gridRowStart: '3',
    })
  })
})
