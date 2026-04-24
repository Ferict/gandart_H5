import type {
  ContentListSnapshotRecord,
  ContentResourceSnapshotRecord,
  ContentSceneSnapshotRecord,
} from '@/models/content/contentPersistentCache.model'
import { __setContentCacheRuntimeModeForTest } from '@/services/content/contentCacheRuntime.service'
import {
  clearAllContentPersistentCache,
  clearContentPersistentCacheByUserScope,
  getContentPersistentCacheSchemaVersion,
  initializeContentPersistentCache,
  readContentListSnapshot,
  readContentResourceSnapshot,
  readContentSceneSnapshot,
  writeContentListSnapshot,
  writeContentResourceSnapshot,
  writeContentSceneSnapshot,
} from '@/services/content/contentPersistentCache.service'

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
    getStorageInfoSync: vi.fn(() => ({
      keys: Object.keys(storageMap),
      currentSize: 0,
      limitSize: 0,
    })),
  }
}

describe('contentPersistentCache.service', () => {
  const storageMap: StorageMap = {}
  let uniStorageMock: ReturnType<typeof createUniStorageMock>

  beforeEach(() => {
    Object.keys(storageMap).forEach((key) => delete storageMap[key])
    uniStorageMock = createUniStorageMock(storageMap)
    ;(globalThis as { uni?: unknown }).uni = uniStorageMock
    __setContentCacheRuntimeModeForTest('app')
  })

  afterEach(() => {
    __setContentCacheRuntimeModeForTest(null)
    delete (globalThis as { uni?: unknown }).uni
  })

  it('initializes cache meta and clears stale schema keys', () => {
    storageMap['aether:content-cache:legacy'] = { payload: 'old' }
    storageMap['aether:content-cache:meta'] = {
      schemaVersion: 'legacy',
      updatedAt: '2026-01-01T00:00:00.000Z',
    }

    const initialized = initializeContentPersistentCache()

    expect(initialized).toBe(true)
    expect(storageMap['aether:content-cache:legacy']).toBeUndefined()
    expect(storageMap['aether:content-cache:meta']).toMatchObject({
      schemaVersion: getContentPersistentCacheSchemaVersion(),
    })
  })

  it('writes and reads scene/list/resource snapshots with meta payload', () => {
    initializeContentPersistentCache()

    const wroteScene = writeContentSceneSnapshot({
      domain: 'home',
      sceneId: 'home',
      content: { sectionTitle: 'Home' },
      meta: { version: 2, updatedAt: '2026-04-03T00:00:00.000Z' },
      userScope: 'u-1',
    })
    expect(wroteScene).toBe(true)
    const scene = readContentSceneSnapshot<{ sectionTitle: string }>({
      domain: 'home',
      sceneId: 'home',
      userScope: 'u-1',
    }) as ContentSceneSnapshotRecord<{ sectionTitle: string }>
    expect(scene.content.sectionTitle).toBe('Home')
    expect(scene.meta.version).toBe(2)

    const wroteList = writeContentListSnapshot({
      domain: 'home',
      resourceType: 'market_item',
      querySignature: 'q-home',
      page: 1,
      pageSize: 32,
      result: { items: [{ id: 'm1' }], total: 1 },
      etag: 'etag-1',
      cursor: 'cursor-1',
      version: 10,
      userScope: 'u-1',
    })
    expect(wroteList).toBe(true)
    const list = readContentListSnapshot<{ items: Array<{ id: string }>; total: number }>({
      domain: 'home',
      resourceType: 'market_item',
      querySignature: 'q-home',
      page: 1,
      userScope: 'u-1',
    }) as ContentListSnapshotRecord<{ items: Array<{ id: string }>; total: number }>
    expect(list.meta.etag).toBe('etag-1')
    expect(list.meta.cursor).toBe('cursor-1')
    expect(list.result.items[0]?.id).toBe('m1')

    const wroteResource = writeContentResourceSnapshot({
      resourceType: 'notice',
      resourceId: 'n-1',
      resource: { title: 'notice-1' },
      etag: 'etag-n1',
      version: 3,
      userScope: 'u-1',
    })
    expect(wroteResource).toBe(true)
    const resource = readContentResourceSnapshot<{ title: string }>({
      resourceType: 'notice',
      resourceId: 'n-1',
      userScope: 'u-1',
    }) as ContentResourceSnapshotRecord<{ title: string }>
    expect(resource.meta.etag).toBe('etag-n1')
    expect(resource.resource.title).toBe('notice-1')
  })

  it('clears snapshots by user scope and can clear all cache', () => {
    initializeContentPersistentCache()
    writeContentSceneSnapshot({
      domain: 'home',
      sceneId: 'home',
      content: { ok: true },
      userScope: 'u-1',
    })
    writeContentSceneSnapshot({
      domain: 'home',
      sceneId: 'home',
      content: { ok: true },
      userScope: 'u-2',
    })

    clearContentPersistentCacheByUserScope('u-1')
    expect(
      readContentSceneSnapshot({
        domain: 'home',
        sceneId: 'home',
        userScope: 'u-1',
      })
    ).toBeNull()
    expect(
      readContentSceneSnapshot({
        domain: 'home',
        sceneId: 'home',
        userScope: 'u-2',
      })
    ).not.toBeNull()

    clearAllContentPersistentCache()
    expect(
      readContentSceneSnapshot({
        domain: 'home',
        sceneId: 'home',
        userScope: 'u-2',
      })
    ).toBeNull()
  })

  it('is no-op on h5 runtime', () => {
    __setContentCacheRuntimeModeForTest('h5')
    const initialized = initializeContentPersistentCache()
    expect(initialized).toBe(false)
    const wrote = writeContentSceneSnapshot({
      domain: 'home',
      sceneId: 'home',
      content: { ignored: true },
      userScope: 'u-h5',
    })
    expect(wrote).toBe(false)
    expect(storageMap['aether:content-cache:meta']).toBeUndefined()
  })
})
