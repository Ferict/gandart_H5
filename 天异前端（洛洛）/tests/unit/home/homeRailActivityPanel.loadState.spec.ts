import { describe, expect, it } from 'vitest'
import { resolveActivityNoticeListLoadState } from '@/pages/home/composables/activity/activityNoticeLoadState.helper'

describe('HomeRailActivityPanel load-state helper', () => {
  it('resolves first-screen-loading before initial content is resolved', () => {
    const state = resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: false,
      hasRenderableNotices: false,
      hasFirstScreenLoading: false,
      hasFirstScreenError: false,
      hasPaginationLoading: false,
      hasPaginationError: false,
      hasPendingSwitch: false,
      isExhausted: false,
    })
    expect(state).toBe('first-screen-loading')
  })

  it('resolves first-screen-loading for empty list + loading', () => {
    const state = resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: true,
      hasRenderableNotices: false,
      hasFirstScreenLoading: true,
      hasFirstScreenError: false,
      hasPaginationLoading: false,
      hasPaginationError: false,
      hasPendingSwitch: false,
      isExhausted: false,
    })
    expect(state).toBe('first-screen-loading')
  })

  it('resolves first-screen-error for empty list + error', () => {
    const state = resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: true,
      hasRenderableNotices: false,
      hasFirstScreenLoading: false,
      hasFirstScreenError: true,
      hasPaginationLoading: false,
      hasPaginationError: false,
      hasPendingSwitch: false,
      isExhausted: false,
    })
    expect(state).toBe('first-screen-error')
  })

  it('resolves first-screen-empty for empty list without loading/error', () => {
    const state = resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: true,
      hasRenderableNotices: false,
      hasFirstScreenLoading: false,
      hasFirstScreenError: false,
      hasPaginationLoading: false,
      hasPaginationError: false,
      hasPendingSwitch: false,
      isExhausted: false,
    })
    expect(state).toBe('first-screen-empty')
  })

  it('resolves pagination-loading for non-empty list + pagination loading', () => {
    const state = resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: true,
      hasRenderableNotices: true,
      hasFirstScreenLoading: false,
      hasFirstScreenError: false,
      hasPaginationLoading: true,
      hasPaginationError: false,
      hasPendingSwitch: false,
      isExhausted: false,
    })
    expect(state).toBe('pagination-loading')
  })

  it('resolves pagination-error for non-empty list + pagination error', () => {
    const state = resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: true,
      hasRenderableNotices: true,
      hasFirstScreenLoading: false,
      hasFirstScreenError: false,
      hasPaginationLoading: false,
      hasPaginationError: true,
      hasPendingSwitch: false,
      isExhausted: false,
    })
    expect(state).toBe('pagination-error')
  })

  it('resolves exhausted for non-empty list + exhausted', () => {
    const state = resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: true,
      hasRenderableNotices: true,
      hasFirstScreenLoading: false,
      hasFirstScreenError: false,
      hasPaginationLoading: false,
      hasPaginationError: false,
      hasPendingSwitch: false,
      isExhausted: true,
    })
    expect(state).toBe('exhausted')
  })

  it('keeps empty list + pending switch in first-screen-loading', () => {
    const state = resolveActivityNoticeListLoadState({
      hasResolvedInitialContent: true,
      hasRenderableNotices: false,
      hasFirstScreenLoading: false,
      hasFirstScreenError: false,
      hasPaginationLoading: false,
      hasPaginationError: false,
      hasPendingSwitch: true,
      isExhausted: false,
    })
    expect(state).toBe('first-screen-loading')
  })
})
