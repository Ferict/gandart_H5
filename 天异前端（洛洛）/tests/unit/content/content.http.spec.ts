import { createContentHttpImplementation } from '@/implementations/content.http'

describe('content.http base url policy', () => {
  it('生产环境仅允许 https', () => {
    expect(() =>
      createContentHttpImplementation({
        baseUrl: 'https://api.example.com',
        isProduction: true,
      })
    ).not.toThrow()

    expect(() =>
      createContentHttpImplementation({
        baseUrl: 'http://api.example.com',
        isProduction: true,
      })
    ).toThrow('must use https:// in production')
  })

  it('开发环境仅允许本地 http 联调地址', () => {
    expect(() =>
      createContentHttpImplementation({
        baseUrl: 'http://localhost:5173',
        isProduction: false,
      })
    ).not.toThrow()

    expect(() =>
      createContentHttpImplementation({
        baseUrl: 'http://127.0.0.1:8080',
        isProduction: false,
      })
    ).not.toThrow()

    expect(() =>
      createContentHttpImplementation({
        baseUrl: 'http://[::1]:8080',
        isProduction: false,
      })
    ).not.toThrow()

    expect(() =>
      createContentHttpImplementation({
        baseUrl: 'http://intranet.example.com',
        isProduction: false,
      })
    ).toThrow('Non-https base URL is only allowed')
  })

  it('拒绝非法协议和非绝对地址', () => {
    expect(() =>
      createContentHttpImplementation({
        baseUrl: '/api/content',
        isProduction: false,
      })
    ).toThrow('absolute http(s) URL')

    expect(() =>
      createContentHttpImplementation({
        baseUrl: 'ftp://api.example.com',
        isProduction: false,
      })
    ).toThrow('must use http:// or https://')
  })
})
