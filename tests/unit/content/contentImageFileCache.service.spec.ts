import { __setContentCacheRuntimeModeForTest } from '@/services/content/contentCacheRuntime.service'
import {
  clearImageLocalCacheByUserScope,
  evictImageLocalCacheEntry,
  getContentImageCacheMaxEntriesPerScope,
  resolveImageUriWithLocalCache,
  writeBackImageLocalCache,
} from '@/services/content/contentImageFileCache.service'

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
  removeSavedFile: (options: { filePath: string; complete?: () => void }) => void
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
    getSavedFileInfo: vi.fn(
      (options: { filePath: string; success: () => void; fail: () => void }) => {
        if (savedFileSet.has(options.filePath)) {
          options.success()
          return
        }
        options.fail()
      }
    ),
    downloadFile: vi.fn(
      (options: {
        url: string
        success: (result: { statusCode?: number; tempFilePath?: string }) => void
        fail: () => void
      }) => {
        options.success({
          statusCode: 200,
          tempFilePath: `/tmp/${encodeURIComponent(options.url)}.png`,
        })
      }
    ),
    saveFile: vi.fn(
      (options: {
        tempFilePath: string
        success: (result: { savedFilePath?: string }) => void
        fail: () => void
      }) => {
        const savedFilePath = options.tempFilePath.replace('/tmp/', '/saved/')
        savedFileSet.add(savedFilePath)
        options.success({ savedFilePath })
      }
    ),
    removeSavedFile: vi.fn((options: { filePath: string; complete?: () => void }) => {
      savedFileSet.delete(options.filePath)
      options.complete?.()
    }),
  }
}

describe('contentImageFileCache.service', () => {
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

  it('falls back to remote url on first access and writes back local cache', async () => {
    const remoteUrl = 'https://example.com/image-a.png'
    const first = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope: 'u-1',
    })
    expect(first.source).toBe('remote')
    expect(first.uri).toBe(remoteUrl)

    await writeBackImageLocalCache({
      remoteUrl,
      userScope: 'u-1',
    })

    const second = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope: 'u-1',
    })
    expect(second.source).toBe('local')
    expect(second.uri.startsWith('/saved/')).toBe(true)
  })

  it('removes invalid saved file mapping and falls back to remote', async () => {
    const remoteUrl = 'https://example.com/image-b.png'
    const writeback = await writeBackImageLocalCache({
      remoteUrl,
      userScope: 'u-1',
    })
    expect(writeback.localPath).toBeTruthy()

    if (writeback.localPath) {
      savedFileSet.delete(writeback.localPath)
    }

    const resolved = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope: 'u-1',
      warmupOnMiss: false,
    })
    expect(resolved.source).toBe('remote')
    expect(resolved.uri).toBe(remoteUrl)
  })

  it('clears image cache by user scope', async () => {
    const remoteUrl = 'https://example.com/image-c.png'
    const writeback = await writeBackImageLocalCache({
      remoteUrl,
      userScope: 'u-clear',
    })
    expect(writeback.localPath).toBeTruthy()
    clearImageLocalCacheByUserScope('u-clear')

    const resolved = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope: 'u-clear',
      warmupOnMiss: false,
    })
    expect(resolved.source).toBe('remote')
  })

  it('evicts a single cached image mapping', async () => {
    const remoteUrl = 'https://example.com/image-d.png'
    const writeback = await writeBackImageLocalCache({
      remoteUrl,
      userScope: 'u-evict',
    })
    expect(writeback.localPath).toBeTruthy()

    evictImageLocalCacheEntry({
      remoteUrl,
      userScope: 'u-evict',
    })

    const resolved = await resolveImageUriWithLocalCache({
      remoteUrl,
      userScope: 'u-evict',
      warmupOnMiss: false,
    })
    expect(resolved.source).toBe('remote')
  })

  it('evicts least-recently-used images when a scope exceeds the max entries', async () => {
    const maxEntries = getContentImageCacheMaxEntriesPerScope()

    for (let index = 0; index < maxEntries; index += 1) {
      await writeBackImageLocalCache({
        remoteUrl: `https://example.com/lru-${index}.png`,
        userScope: 'u-lru',
      })
    }

    const refreshed = await resolveImageUriWithLocalCache({
      remoteUrl: 'https://example.com/lru-0.png',
      userScope: 'u-lru',
      warmupOnMiss: false,
    })
    expect(refreshed.source).toBe('local')

    await writeBackImageLocalCache({
      remoteUrl: 'https://example.com/lru-new.png',
      userScope: 'u-lru',
    })

    const scopedKeys = Object.keys(storageMap).filter((key) => key.includes(':scope:u-lru:url:'))
    expect(scopedKeys).toHaveLength(maxEntries)

    const oldest = await resolveImageUriWithLocalCache({
      remoteUrl: 'https://example.com/lru-1.png',
      userScope: 'u-lru',
      warmupOnMiss: false,
    })
    expect(oldest.source).toBe('remote')

    const refreshedAfterTrim = await resolveImageUriWithLocalCache({
      remoteUrl: 'https://example.com/lru-0.png',
      userScope: 'u-lru',
      warmupOnMiss: false,
    })
    expect(refreshedAfterTrim.source).toBe('local')

    const newest = await resolveImageUriWithLocalCache({
      remoteUrl: 'https://example.com/lru-new.png',
      userScope: 'u-lru',
      warmupOnMiss: false,
    })
    expect(newest.source).toBe('local')
  })

  it('does not evict entries across different scopes', async () => {
    const maxEntries = getContentImageCacheMaxEntriesPerScope()

    for (let index = 0; index < maxEntries + 1; index += 1) {
      await writeBackImageLocalCache({
        remoteUrl: `https://example.com/scope-a-${index}.png`,
        userScope: 'u-scope-a',
      })
    }

    await writeBackImageLocalCache({
      remoteUrl: 'https://example.com/scope-b.png',
      userScope: 'u-scope-b',
    })

    const otherScope = await resolveImageUriWithLocalCache({
      remoteUrl: 'https://example.com/scope-b.png',
      userScope: 'u-scope-b',
      warmupOnMiss: false,
    })
    expect(otherScope.source).toBe('local')

    const scopeBKeys = Object.keys(storageMap).filter((key) =>
      key.includes(':scope:u-scope-b:url:')
    )
    expect(scopeBKeys.length).toBe(1)
  })

  it('is a no-op on h5 runtime', async () => {
    __setContentCacheRuntimeModeForTest('h5')
    const remoteUrl = 'https://example.com/image-h5.png'

    const resolved = await resolveImageUriWithLocalCache({
      remoteUrl,
    })
    expect(resolved.source).toBe('remote')
    expect(resolved.uri).toBe(remoteUrl)

    const writeback = await writeBackImageLocalCache({
      remoteUrl,
    })
    expect(writeback.wroteBack).toBe(false)
    expect(writeback.localPath).toBeNull()
  })
})
