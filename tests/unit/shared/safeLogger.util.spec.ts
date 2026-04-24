import { buildSafeErrorPayload } from '@/utils/safeLogger.util'

describe('safeLogger.util', () => {
  it('会对敏感字段进行脱敏', () => {
    const payload = buildSafeErrorPayload(
      new Error('boom'),
      {
        token: 'abc',
        nested: {
          authorization: 'Bearer xyz',
          normal: 'ok',
        },
        apiKey: 'k-123',
      },
      { isProduction: false }
    )

    expect(payload.context).toEqual({
      token: '[REDACTED]',
      nested: {
        authorization: '[REDACTED]',
        normal: 'ok',
      },
      apiKey: '[REDACTED]',
    })
  })

  it('生产模式不输出原始错误堆栈', () => {
    const payload = buildSafeErrorPayload(new Error('hidden stack'), undefined, {
      isProduction: true,
    })

    expect((payload.error as Record<string, unknown>).stack).toBeUndefined()
  })

  it('开发模式保留错误堆栈', () => {
    const payload = buildSafeErrorPayload(new Error('show stack'), undefined, {
      isProduction: false,
    })

    expect((payload.error as Record<string, unknown>).stack).toEqual(expect.any(String))
  })

  it('循环引用上下文不会抛错', () => {
    const context: Record<string, unknown> = {
      sessionToken: 'session-001',
    }
    context.self = context

    const payload = buildSafeErrorPayload(new Error('circular context'), context, {
      isProduction: false,
    })

    expect(payload.context).toEqual({
      sessionToken: '[REDACTED]',
      self: '[Circular]',
    })
  })
})
