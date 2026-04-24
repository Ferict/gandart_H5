const loadSharedModule = async () => {
  // @ts-expect-error Vitest loads the runtime helper directly from scripts/.
  return import('../../../scripts/check-content-http-link.shared.mjs')
}

describe('check-content-http-link shared helpers', () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('reads the formal endpoint matrix from the single contract source', async () => {
    const { loadContentApiContract } = await loadSharedModule()

    const contract = loadContentApiContract(process.cwd())

    expect(contract.endpoints).toMatchObject({
      scene: {
        method: 'GET',
        path: '/api/content/scene',
      },
      resource: {
        method: 'GET',
        path: '/api/content/resource',
      },
      list: {
        method: 'GET',
        path: '/api/content/list',
      },
      noticeRead: {
        method: 'POST',
        path: '/api/content/action/notice-read',
      },
      serviceReminderConsume: {
        method: 'POST',
        path: '/api/content/action/service-reminder-consume',
      },
    })
  })

  it('builds the default market_item list smoke with formal sort params', async () => {
    const { createContentHttpChecks, createContentHttpSmokeConfig, loadContentApiContract } =
      await loadSharedModule()

    const contract = loadContentApiContract(process.cwd())
    const config = createContentHttpSmokeConfig(
      {
        VITE_CONTENT_PROVIDER: 'http',
        VITE_CONTENT_API_BASE_URL: 'https://api.example.com',
      },
      contract
    )

    const listCheck = createContentHttpChecks(config).find((item: { endpointKey: string }) => {
      return item.endpointKey === 'list'
    })

    expect(listCheck).toMatchObject({
      label: 'GET /api/content/list',
      query: {
        resourceType: 'market_item',
        sortField: 'listedAt',
        sortDirection: 'desc',
        page: 1,
        pageSize: 20,
      },
    })
  })

  it('marks sample-gated endpoints as skip when required env vars are missing', async () => {
    const { createContentHttpChecks, createContentHttpSmokeConfig, loadContentApiContract } =
      await loadSharedModule()

    const contract = loadContentApiContract(process.cwd())
    const config = createContentHttpSmokeConfig(
      {
        VITE_CONTENT_PROVIDER: 'http',
        VITE_CONTENT_API_BASE_URL: 'https://api.example.com',
      },
      contract
    )

    const checks = createContentHttpChecks(config)

    expect(
      checks.find((item: { endpointKey: string }) => item.endpointKey === 'resource')
    ).toMatchObject({
      requiredEnvKeys: ['VITE_CONTENT_SMOKE_RESOURCE_TYPE', 'VITE_CONTENT_SMOKE_RESOURCE_ID'],
      skipReason:
        'skipped because VITE_CONTENT_SMOKE_RESOURCE_TYPE and VITE_CONTENT_SMOKE_RESOURCE_ID are not set.',
    })
    expect(
      checks.find((item: { endpointKey: string }) => item.endpointKey === 'noticeRead')
    ).toMatchObject({
      requiredEnvKeys: ['VITE_CONTENT_SMOKE_NOTICE_ID'],
      skipReason: 'skipped because VITE_CONTENT_SMOKE_NOTICE_ID is not set.',
    })
    expect(
      checks.find((item: { endpointKey: string }) => item.endpointKey === 'serviceReminderConsume')
    ).toMatchObject({
      requiredEnvKeys: ['VITE_CONTENT_SMOKE_SERVICE_ID'],
      skipReason: 'skipped because VITE_CONTENT_SMOKE_SERVICE_ID is not set.',
    })
  })

  it('fails HTTP smoke when a content envelope returns a non-zero business code', async () => {
    const { createContentHttpSmokeConfig, loadContentApiContract, runContentHttpChecks } =
      await loadSharedModule()

    vi.stubGlobal(
      'fetch',
      vi.fn(async (url: URL) => {
        const pathname = url.pathname
        const data =
          pathname === '/api/content/list'
            ? {
                resourceType: 'market_item',
                page: 1,
                pageSize: 20,
                total: 0,
                items: [],
              }
            : {
                sceneId: 'home',
                version: 1,
                updatedAt: '2026-04-20T00:00:00.000Z',
                blocks: [],
              }

        return new Response(
          JSON.stringify({
            code: 1234,
            message: 'business failed',
            requestId: 'req_test_business_error',
            serverTime: '2026-04-20T00:00:00.000Z',
            data,
          }),
          {
            status: 200,
            headers: {
              'content-type': 'application/json',
            },
          }
        )
      })
    )

    const contract = loadContentApiContract(process.cwd())
    const config = createContentHttpSmokeConfig(
      {
        VITE_CONTENT_PROVIDER: 'http',
        VITE_CONTENT_API_BASE_URL: 'https://api.example.com',
      },
      contract
    )

    const { results } = await runContentHttpChecks(config)

    expect(results).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          status: 'fail',
          label: 'GET /api/content/scene',
          detail: expect.stringContaining('business code=1234'),
        }),
        expect.objectContaining({
          status: 'fail',
          label: 'GET /api/content/list',
          detail: expect.stringContaining('business code=1234'),
        }),
      ])
    )
  })
})
