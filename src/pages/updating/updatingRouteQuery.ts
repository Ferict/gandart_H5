/**
 * Responsibility: parse the route query accepted by the unified construction placeholder page.
 * Out of scope: URL construction, navigation side effects, and real feature routing.
 */

import { pickRouteQuery } from '../../utils/routeQuery.util'

export const updatingRouteQueryKeys = [
  'moduleId',
  'title',
  'englishTitle',
  'statusLabel',
  'provider',
  'targetParams',
  'source',
] as const

export type UpdatingRouteQueryKey = (typeof updatingRouteQueryKeys)[number]

export type UpdatingRouteQuery = Record<UpdatingRouteQueryKey, string>

const clean = (value: string) => value.trim()

const pickByPattern = (value: string, pattern: RegExp, maxLength: number) => {
  const normalized = clean(value).slice(0, maxLength)
  return pattern.test(normalized) ? normalized : ''
}

const pickText = (value: string, maxLength: number) => {
  return clean(value).slice(0, maxLength)
}

const normalizeEnumText = (value: string, fallback: string, maxLength: number) => {
  const normalized = clean(value).slice(0, maxLength)
  return normalized || fallback
}

const idPattern = /^[A-Za-z0-9:_./-]{1,64}$/
const sourcePattern = /^[A-Za-z0-9:_./-]{1,40}$/
const providerPattern = /^[A-Za-z0-9:_./-]{1,80}$/

export const parseUpdatingRouteQuery = (query: Record<string, unknown>): UpdatingRouteQuery => {
  const picked = pickRouteQuery(query, updatingRouteQueryKeys)

  return {
    moduleId: pickByPattern(picked.moduleId, idPattern, 64),
    title: pickText(picked.title, 40),
    englishTitle: pickText(picked.englishTitle, 48),
    statusLabel: normalizeEnumText(picked.statusLabel, 'Construction', 20),
    provider: pickByPattern(picked.provider, providerPattern, 80),
    targetParams: pickText(picked.targetParams, 2048),
    source: pickByPattern(picked.source, sourcePattern, 40),
  }
}
