import { __setContentCacheRuntimeModeForTest } from '@/services/content/contentCacheRuntime.service'
import {
  clearCurrentContentUserScope,
  normalizeContentUserScope,
  resolveCurrentContentUserScope,
  syncCurrentContentUserScope,
} from '@/services/content/contentUserScope.service'

type StorageMap = Record<string, unknown>

const createUniStorageMock = (storageMap: StorageMap) => {
  return {
    getStorageSync: vi.fn((key: string) => storageMap[key] ?? ''),
    setStorageSync: vi.fn((key: string, value: unknown) => {
      storageMap[key] = value
    }),
    removeStorageSync: vi.fn((key: string) => {
      delete storageMap[key]
    }),
  }
}

describe('contentUserScope.service', () => {
  const storageMap: StorageMap = {}

  beforeEach(() => {
    Object.keys(storageMap).forEach((key) => delete storageMap[key])
    ;(globalThis as { uni?: unknown }).uni = createUniStorageMock(storageMap)
    __setContentCacheRuntimeModeForTest('app')
  })

  afterEach(() => {
    __setContentCacheRuntimeModeForTest(null)
    delete (globalThis as { uni?: unknown }).uni
  })

  it('returns null when address is missing or blank', () => {
    expect(normalizeContentUserScope(undefined)).toBeNull()
    expect(normalizeContentUserScope(null)).toBeNull()
    expect(normalizeContentUserScope('   ')).toBeNull()

    const syncResult = syncCurrentContentUserScope()
    expect(syncResult.currentScope).toBeNull()
    expect(syncResult.changed).toBe(false)
    expect(resolveCurrentContentUserScope()).toBeNull()
  })

  it('writes normalized scope and can read back after module restart', async () => {
    const syncResult = syncCurrentContentUserScope('  0xAbC123 ')
    expect(syncResult.currentScope).toBe('0xabc123')
    expect(resolveCurrentContentUserScope()).toBe('0xabc123')

    vi.resetModules()
    const runtimeService = await import('@/services/content/contentCacheRuntime.service')
    runtimeService.__setContentCacheRuntimeModeForTest('app')
    const userScopeService = await import('@/services/content/contentUserScope.service')

    expect(userScopeService.resolveCurrentContentUserScope()).toBe('0xabc123')
  })

  it('clears stored scope and returns previous value', () => {
    syncCurrentContentUserScope('0xabc')
    expect(resolveCurrentContentUserScope()).toBe('0xabc')

    const previousScope = clearCurrentContentUserScope()
    expect(previousScope).toBe('0xabc')
    expect(resolveCurrentContentUserScope()).toBeNull()
  })

  it('stays no-op outside app runtime', () => {
    __setContentCacheRuntimeModeForTest('h5')

    const syncResult = syncCurrentContentUserScope('0xdef')
    expect(syncResult.currentScope).toBe('0xdef')
    expect(syncResult.changed).toBe(true)
    expect(resolveCurrentContentUserScope()).toBeNull()
    expect(clearCurrentContentUserScope()).toBeNull()
  })
})
