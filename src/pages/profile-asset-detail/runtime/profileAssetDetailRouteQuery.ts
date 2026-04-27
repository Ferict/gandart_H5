/**
 * Responsibility: parse profile-asset-detail route query locally for the detail page runtime.
 * Out of scope: navigation URL construction, refresh orchestration, and page presentation.
 */

import { pickRouteQuery } from '../../../utils/routeQuery.util'

export const profileAssetDetailRouteQueryKeys = [
  'source',
  'itemId',
  'assetId',
  'category',
  'subCategory',
  'holdingInstanceId',
  'holdingSerial',
  'holdingAcquiredAt',
] as const

export type ProfileAssetDetailRouteQueryKey = (typeof profileAssetDetailRouteQueryKeys)[number]

export type ProfileAssetDetailRouteQuery = Record<ProfileAssetDetailRouteQueryKey, string>

const clean = (value: string) => value.trim()

const pickByPattern = (value: string, pattern: RegExp, maxLength: number) => {
  const normalized = clean(value).slice(0, maxLength)
  return pattern.test(normalized) ? normalized : ''
}

const pickText = (value: string, maxLength: number) => {
  return clean(value).slice(0, maxLength)
}

const idPattern = /^[A-Za-z0-9:_./-]{1,64}$/
const sourcePattern = /^[A-Za-z0-9:_./-]{1,40}$/
const holdingSerialPattern = /^[#A-Za-z0-9:_./-]{1,24}$/
const holdingAcquiredAtPattern = /^[0-9.\-: T]{1,32}$/

export const parseProfileAssetDetailRouteQuery = (
  query: Record<string, unknown>
): ProfileAssetDetailRouteQuery => {
  const picked = pickRouteQuery(query, profileAssetDetailRouteQueryKeys)

  return {
    source: pickByPattern(picked.source, sourcePattern, 40),
    itemId: pickByPattern(picked.itemId, idPattern, 64),
    assetId: pickByPattern(picked.assetId, idPattern, 64),
    category: pickByPattern(picked.category, sourcePattern, 40),
    subCategory: pickText(picked.subCategory, 40),
    holdingInstanceId: pickByPattern(picked.holdingInstanceId, idPattern, 64),
    holdingSerial: pickByPattern(picked.holdingSerial, holdingSerialPattern, 24),
    holdingAcquiredAt: pickByPattern(picked.holdingAcquiredAt, holdingAcquiredAtPattern, 32),
  }
}
