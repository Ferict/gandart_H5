import { __setContentCacheRuntimeModeForTest } from '@/services/content/contentCacheRuntime.service'
import {
  resolveImageUriWithLocalCache,
  writeBackImageLocalCache,
} from '@/services/content/contentImageFileCache.service'
import { resolveHomeMarketCardImageCachePolicy } from '@/components/homeMarketCardImageReveal.cachePolicy'

type StorageMap = Record<string, unknown>

interface UniImageMock {
  getStorageSync: (key: string) => unknown
  setStorageSync: (key: string, value: unknown) => void
  removeStorageSync: (key: string) => void
  getSavedFileInfo: (options: { filePath: string; success: () => void; fail: () => void }) => void
  downloadFile: (options: {
    url: string
    timeout?: number
    success: (result: { statusCode?: number; tempFilePath?: string }) => void
    fail: () => void
  }) => void
  saveFile: (options: {
    tempFilePath: string
    success: (result: { savedFilePath?: string }) => void
    fail: () => void
  }) => void
}

const createUniImageMock = (storageMap: StorageMap, savedFileSet: Set<string>): UniImageMock => {
  return {
    getStorageSync: vi.fn((key: string) => storageMap[key] ?? ''),
    setStorageSync: vi.fn((key: string, value: unknown) => {
      storageMap[key] = value
    }),
    removeStorageSync: vi.fn((key: string) => {
      delete storageMap[key]
    }),
    getSavedFileInfo: vi.fn((options) => {
      if (savedFileSet.has(options.filePath)) {
        options.success()
        return
      }
      options.fail()
    }),
    downloadFile: vi.fn((options) => {
      options.success({
        statusCode: 200,
        tempFilePath: `/tmp/${encodeURIComponent(options.url)}.png`,
      })
    }),
    saveFile: vi.fn((options) => {
      const savedFilePath = options.tempFilePath.replace('/tmp/', '/saved/')
      savedFileSet.add(savedFilePath)
      options.success({ savedFilePath })
    }),
  }
}

describe('profileAssetDetail image cache bridge', () => {
  const storageMap: StorageMap = {}
  const savedFileSet = new Set<string>()

  beforeEach(() => {
    Object.keys(storageMap).forEach((key) => delete storageMap[key])
    savedFileSet.clear()
    ;(globalThis as { uni?: unknown }).uni = createUniImageMock(storageMap, savedFileSet)
    __setContentCacheRuntimeModeForTest('app')
  })

  afterEach(() => {
    __setContentCacheRuntimeModeForTest(null)
    delete (globalThis as { uni?: unknown }).uni
  })

  it('falls back to remote first, then prefers local image after successful writeback', async () => {
    const remoteUrl = 'https://cdn.example.com/profile-asset/c-02-detail.png'
    const userScope = '0xdetail'

    const firstResolve = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope,
      warmupOnMiss: false,
    })
    expect(firstResolve.source).toBe('remote')
    expect(firstResolve.uri).toBe(remoteUrl)

    const writeback = await writeBackImageLocalCache({
      remoteUrl,
      userScope,
    })
    expect(writeback.wroteBack).toBe(true)
    expect(writeback.localPath).toBeTruthy()

    const secondResolve = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope,
      warmupOnMiss: false,
    })
    expect(secondResolve.source).toBe('local')
    expect(secondResolve.uri.startsWith('/saved/')).toBe(true)
  })

  it('falls back to remote when saved local file mapping becomes invalid', async () => {
    const remoteUrl = 'https://cdn.example.com/profile-asset/c-10-detail.png'
    const userScope = '0xdetail'
    const writeback = await writeBackImageLocalCache({
      remoteUrl,
      userScope,
    })
    expect(writeback.localPath).toBeTruthy()
    if (writeback.localPath) {
      savedFileSet.delete(writeback.localPath)
    }

    const resolved = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope,
      warmupOnMiss: false,
    })
    expect(resolved.source).toBe('remote')
    expect(resolved.uri).toBe(remoteUrl)
  })

  it('does not enable persistent image cache without a user scope in required-user mode', () => {
    const policy = resolveHomeMarketCardImageCachePolicy({
      enablePersistentLocalCache: true,
      imageCacheUserScope: undefined,
      cacheScopePolicy: 'required-user',
    })

    expect(policy.canUsePersistentLocalCache).toBe(false)
    expect(policy.normalizedUserScope).toBeUndefined()
  })
})
