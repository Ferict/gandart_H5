/**
 * Responsibility: provide the shared route-query serialization and decoding helpers used by page
 * entry services and secondary-page navigation.
 * Out of scope: query schema ownership, page routing policy, and URL history side effects.
 */

export type RouteQueryPrimitive = string | number | boolean
export type RouteQueryRecord = Record<string, RouteQueryPrimitive | null | undefined>

export const stringifyRouteQuery = (query: RouteQueryRecord) => {
  return Object.entries(query)
    .filter(([, value]) => value !== undefined && value !== null && value !== '')
    .map(([key, value]) => {
      return `${key}=${encodeURIComponent(String(value))}`
    })
    .join('&')
}

export const buildRouteUrl = (path: string, query?: RouteQueryRecord) => {
  if (!query) {
    return path
  }

  const queryString = stringifyRouteQuery(query)
  return queryString ? `${path}?${queryString}` : path
}

export const decodeRouteQueryValue = (value: unknown, fallback = '') => {
  if (typeof value !== 'string' || value.length === 0) {
    return fallback
  }

  try {
    return decodeURIComponent(value)
  } catch {
    return value
  }
}

export const pickRouteQuery = <T extends string>(
  query: Record<string, unknown>,
  allowedKeys: readonly T[]
) => {
  const normalized = {} as Record<T, string>

  allowedKeys.forEach((key) => {
    normalized[key] = decodeRouteQueryValue(query[key])
  })

  return normalized
}
