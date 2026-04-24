import { formatNoticeDisplayTime } from '@/utils/noticeTime.util'

describe('noticeTime.util', () => {
  it('格式化标准发布时间', () => {
    expect(formatNoticeDisplayTime('2026-03-25T12:24:00+08:00')).toBe('03-25 12:24')
  })

  it('保留无法识别的原始值', () => {
    expect(formatNoticeDisplayTime('待定时间')).toBe('待定时间')
  })
})
