import {
  contentMockImplementation,
  createContentResourceSnapshot,
  createContentSceneSnapshot,
} from '@/implementations/content.mock'
import type {
  ContentListDtoBase,
  ContentListItemDtoBase,
  ContentListRequestDto,
} from '@/contracts/content-api.contract'

const resolveListOrThrow = async <T extends ContentListRequestDto>(
  input: T,
  options?: { ifNoneMatch?: string }
) => {
  const response = await contentMockImplementation.getList(input, options)
  expect(response.envelope.code).toBe(0)
  return response
}

describe('content.mock equivalence baseline', () => {
  it('createContentSceneSnapshot keeps home/activity/profile scenes with blocks', () => {
    ;(['home', 'activity', 'profile'] as const).forEach((sceneId) => {
      const snapshot = createContentSceneSnapshot(sceneId)
      expect(snapshot).not.toBeNull()
      expect(snapshot?.sceneId).toBe(sceneId)
      expect(Array.isArray(snapshot?.blocks)).toBe(true)
      expect(snapshot?.blocks.length ?? 0).toBeGreaterThan(0)
    })
  })

  it('createContentResourceSnapshot keeps notice/profile_asset key payload fields', async () => {
    const noticeListResponse = await resolveListOrThrow({
      resourceType: 'notice',
      page: 1,
      pageSize: 1,
    })
    const noticeItem = (noticeListResponse.envelope.data as ContentListDtoBase<'notice'>).items[0]
    expect(noticeItem).toBeDefined()

    const noticeSnapshot = createContentResourceSnapshot('notice', noticeItem.resourceId)
    expect(noticeSnapshot).not.toBeNull()
    expect(noticeSnapshot?.resourceType).toBe('notice')
    expect(noticeSnapshot?.resourceId).toBe(noticeItem.resourceId)
    expect(noticeSnapshot?.title).toBeTruthy()
    const noticePayload = noticeSnapshot?.payload as {
      publishedAt?: string
      isUnread?: boolean
      blocks?: unknown[]
    }
    expect(typeof noticePayload.publishedAt).toBe('string')
    expect(typeof noticePayload.isUnread).toBe('boolean')
    expect(Array.isArray(noticePayload.blocks)).toBe(true)

    const profileListResponse = await resolveListOrThrow({
      resourceType: 'profile_asset',
      page: 1,
      pageSize: 1,
    })
    const profileItem = (profileListResponse.envelope.data as ContentListDtoBase<'profile_asset'>)
      .items[0]
    expect(profileItem).toBeDefined()

    const profileSnapshot = createContentResourceSnapshot('profile_asset', profileItem.resourceId)
    expect(profileSnapshot).not.toBeNull()
    expect(profileSnapshot?.resourceType).toBe('profile_asset')
    expect(profileSnapshot?.resourceId).toBe(profileItem.resourceId)
    expect(profileSnapshot?.title).toBeTruthy()
    const profilePayload = profileSnapshot?.payload as {
      categoryId?: string
      subCategory?: string
      holdingsCount?: number
    }
    expect(typeof profilePayload.categoryId).toBe('string')
    expect(typeof profilePayload.subCategory).toBe('string')
    expect(typeof profilePayload.holdingsCount).toBe('number')
  })

  it('createContentResourceSnapshot keeps identity_verification payload fields', () => {
    const snapshot = createContentResourceSnapshot('identity_verification' as never, 'auth')

    expect(snapshot).not.toBeNull()
    expect(snapshot?.resourceType).toBe('identity_verification')
    expect(snapshot?.resourceId).toBe('auth')
    expect(snapshot?.title).toBe('实名认证')

    const payload = snapshot?.payload as {
      verificationStatus?: string
      legalName?: string
      idNumber?: string
      verifiedAt?: string
      didNode?: string
      unlockedFeatures?: Array<{ iconKey?: string; title?: string }>
      submitEnabled?: boolean
      processingCode?: string
      mockSubmitResult?: string
      successResult?: { title?: string; code?: string; description?: string }
      failureResult?: { title?: string; code?: string; description?: string }
    }

    expect(typeof payload.verificationStatus).toBe('string')
    expect(typeof payload.legalName).toBe('string')
    expect(typeof payload.idNumber).toBe('string')
    expect(typeof payload.verifiedAt).toBe('string')
    expect(typeof payload.didNode).toBe('string')
    expect(Array.isArray(payload.unlockedFeatures)).toBe(true)
    expect(typeof payload.unlockedFeatures?.[0]?.iconKey).toBe('string')
    expect(typeof payload.unlockedFeatures?.[0]?.title).toBe('string')
    expect(typeof payload.submitEnabled).toBe('boolean')
    expect(typeof payload.processingCode).toBe('string')
    expect(typeof payload.mockSubmitResult).toBe('string')
    expect(typeof payload.successResult?.title).toBe('string')
    expect(typeof payload.successResult?.code).toBe('string')
    expect(typeof payload.failureResult?.title).toBe('string')
    expect(typeof payload.failureResult?.code).toBe('string')
  })

  it('market_item list keeps pagination + etag + notModified semantics', async () => {
    const request: ContentListRequestDto = {
      resourceType: 'market_item',
      categoryId: 'all',
      keyword: '',
      page: 1,
      pageSize: 5,
    }

    const firstResponse = await resolveListOrThrow(request)
    expect(firstResponse.notModified).toBe(false)
    expect(typeof firstResponse.etag).toBe('string')
    expect(firstResponse.etag).toBeTruthy()
    const firstData = firstResponse.envelope.data as ContentListDtoBase<'market_item'>
    expect(firstData.resourceType).toBe('market_item')
    expect(firstData.page).toBe(1)
    expect(firstData.pageSize).toBe(5)
    expect(firstData.items.length).toBeLessThanOrEqual(5)

    const secondResponse = await resolveListOrThrow(request, {
      ifNoneMatch: firstResponse.etag,
    })
    expect(secondResponse.notModified).toBe(true)
    expect(secondResponse.etag).toBe(firstResponse.etag)
    expect(secondResponse.envelope.data).toBeNull()
  })

  it('filters market mock list by marketKind and defaults missing kind to collections', async () => {
    const baseRequest = {
      resourceType: 'market_item' as const,
      categoryId: 'all',
      keyword: '',
      page: 1,
      pageSize: 100,
    }

    const defaultResponse = await resolveListOrThrow(baseRequest)
    const collectionsResponse = await resolveListOrThrow({
      ...baseRequest,
      marketKind: 'collections',
    })
    const blindBoxResponse = await resolveListOrThrow({
      ...baseRequest,
      marketKind: 'blindBoxes',
    })

    const defaultList = defaultResponse.envelope.data as ContentListDtoBase<'market_item'>
    const collectionsList = collectionsResponse.envelope.data as ContentListDtoBase<'market_item'>
    const blindBoxList = blindBoxResponse.envelope.data as ContentListDtoBase<'market_item'>

    expect(defaultList.total).toBe(collectionsList.total)
    expect(defaultList.items.map((item) => item.resourceId)).toEqual(
      collectionsList.items.map((item) => item.resourceId)
    )
    expect(blindBoxList.total).toBeGreaterThan(0)
    expect(blindBoxList.total).not.toBe(collectionsList.total)
  })

  it("notice list keeps publishedAt desc order and tag='全部' as no-filter", async () => {
    const allByDefaultResponse = await resolveListOrThrow({
      resourceType: 'notice',
      page: 1,
      pageSize: 100,
    })
    const allByTagResponse = await resolveListOrThrow({
      resourceType: 'notice',
      tag: '全部',
      page: 1,
      pageSize: 100,
    })

    const allByDefault = allByDefaultResponse.envelope.data as ContentListDtoBase<'notice'>
    const allByTag = allByTagResponse.envelope.data as ContentListDtoBase<'notice'>

    expect(allByTag.total).toBe(allByDefault.total)
    expect(allByTag.items.map((item) => item.resourceId)).toEqual(
      allByDefault.items.map((item) => item.resourceId)
    )

    const timestamps = allByTag.items.map((item) => Date.parse(item.payload.publishedAt))
    for (let index = 1; index < timestamps.length; index += 1) {
      expect(timestamps[index - 1]).toBeGreaterThanOrEqual(timestamps[index])
    }
  })

  it('profile_asset list supports category + subCategory + keyword combined filtering', async () => {
    const baseResponse = await resolveListOrThrow({
      resourceType: 'profile_asset',
      page: 1,
      pageSize: 100,
    })
    const baseList = baseResponse.envelope.data as ContentListDtoBase<'profile_asset'>
    expect(baseList.items.length).toBeGreaterThan(0)

    const seedItem = baseList.items[0] as ContentListItemDtoBase<'profile_asset'>
    const categoryId = seedItem.payload.categoryId
    const subCategory = seedItem.payload.subCategory
    const keyword = seedItem.title

    const filteredResponse = await resolveListOrThrow({
      resourceType: 'profile_asset',
      categoryId,
      subCategory,
      keyword,
      page: 1,
      pageSize: 100,
    })
    const filtered = filteredResponse.envelope.data as ContentListDtoBase<'profile_asset'>

    expect(filtered.total).toBeGreaterThan(0)
    expect(filtered.items.some((item) => item.resourceId === seedItem.resourceId)).toBe(true)
    filtered.items.forEach((item) => {
      expect(item.payload.categoryId).toBe(categoryId)
      expect(item.payload.subCategory).toBe(subCategory)
      expect(
        item.title.includes(keyword) ||
          item.resourceId.toLowerCase().includes(keyword.toLowerCase())
      ).toBe(true)
    })
  })
})
