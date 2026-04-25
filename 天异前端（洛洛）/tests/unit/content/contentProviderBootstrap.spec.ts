import { resolveContentProviderName } from '@/services/content/contentProviderBootstrap.service'

describe('content provider bootstrap', () => {
  it('accepts only the declared content providers', () => {
    expect(resolveContentProviderName(undefined)).toBe('mock')
    expect(resolveContentProviderName(' mock ')).toBe('mock')
    expect(resolveContentProviderName('http')).toBe('http')
    expect(resolveContentProviderName('backend-http')).toBe('backend-http')

    expect(() => resolveContentProviderName('legacy')).toThrow('Unsupported VITE_CONTENT_PROVIDER')
  })
})
