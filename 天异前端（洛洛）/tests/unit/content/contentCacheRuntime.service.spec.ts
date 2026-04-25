import {
  __setContentCacheRuntimeModeForTest,
  isAppContentPersistentCacheEnabled,
  resolveContentCacheRuntimeMode,
} from '@/services/content/contentCacheRuntime.service'

describe('contentCacheRuntime.service', () => {
  afterEach(() => {
    __setContentCacheRuntimeModeForTest(null)
  })

  it('respects explicit test override', () => {
    __setContentCacheRuntimeModeForTest('app')
    expect(resolveContentCacheRuntimeMode()).toBe('app')
    expect(isAppContentPersistentCacheEnabled()).toBe(true)

    __setContentCacheRuntimeModeForTest('h5')
    expect(resolveContentCacheRuntimeMode()).toBe('h5')
    expect(isAppContentPersistentCacheEnabled()).toBe(false)
  })
})
