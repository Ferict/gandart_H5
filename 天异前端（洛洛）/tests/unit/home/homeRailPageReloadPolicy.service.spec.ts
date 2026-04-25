import {
  buildRailContentSignature,
  createRailSceneResolvedMeta,
  shouldReloadRailPageContent,
} from '@/services/home-rail/homeRailPageReloadPolicy.service'

describe('homeRailPageReloadPolicy.service', () => {
  it('相同语义内容的对象顺序变化不会改变签名', () => {
    const left = buildRailContentSignature({
      name: 'market',
      filters: ['latest', 'featured'],
      meta: {
        page: 1,
        size: 20,
      },
    })

    const right = buildRailContentSignature({
      meta: {
        size: 20,
        page: 1,
      },
      filters: ['latest', 'featured'],
      name: 'market',
    })

    expect(left).toBe(right)
  })

  it('只在元数据实际变化时触发 reload-on-update', () => {
    const previousMeta = createRailSceneResolvedMeta({
      version: 1,
      updatedAt: '2026-03-30T09:00:00+08:00',
      signature: 'abc12345',
    })

    const sameMeta = createRailSceneResolvedMeta({
      version: 1,
      updatedAt: '2026-03-30T09:00:00+08:00',
      signature: 'abc12345',
    })

    const changedMeta = createRailSceneResolvedMeta({
      version: 1,
      updatedAt: '2026-03-30T10:00:00+08:00',
      signature: 'abc12345',
    })

    expect(shouldReloadRailPageContent('reload-on-update', previousMeta, sameMeta)).toBe(false)
    expect(shouldReloadRailPageContent('reload-on-update', previousMeta, changedMeta)).toBe(true)
  })

  it('always-reload 总是触发刷新', () => {
    const previousMeta = createRailSceneResolvedMeta({
      version: 1,
      updatedAt: '2026-03-30T09:00:00+08:00',
      signature: 'abc12345',
    })

    const nextMeta = createRailSceneResolvedMeta({
      version: 1,
      updatedAt: '2026-03-30T09:00:00+08:00',
      signature: 'abc12345',
    })

    expect(shouldReloadRailPageContent('always-reload', previousMeta, nextMeta)).toBe(true)
  })
})
