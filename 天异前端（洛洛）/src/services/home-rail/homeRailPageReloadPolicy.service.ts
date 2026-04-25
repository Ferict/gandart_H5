/**
 * Responsibility: define the shared rail page reload policy and expose signature helpers used to
 * decide whether a page scene should reload or reuse the current content.
 * Out of scope: actual page fetching, scene persistence, and result-window presentation timing.
 */
export type PageReloadMode = 'always-reload' | 'reload-on-update'

export interface RailSceneResolvedMeta {
  version?: number
  updatedAt?: string
  signature: string
}

export interface RailSceneResolvedContent<T> {
  content: T
  meta: RailSceneResolvedMeta
}

// 一级页默认按“仅更新加载”运行，显式 setter 只用于统一覆写，不允许页面各自改默认口径。
let railPageReloadMode: PageReloadMode = 'reload-on-update'

const normalizeUpdatedAt = (value?: string | null): string | undefined => {
  const normalizedValue = value?.trim()
  return normalizedValue ? normalizedValue : undefined
}

const stableSerialize = (value: unknown): string => {
  if (value === null) {
    return 'null'
  }

  if (typeof value === 'string') {
    return JSON.stringify(value)
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value)
  }

  if (Array.isArray(value)) {
    return `[${value.map((entry) => stableSerialize(entry)).join(',')}]`
  }

  if (value && typeof value === 'object') {
    const entries = Object.entries(value as Record<string, unknown>)
      .filter(([, entryValue]) => entryValue !== undefined)
      .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
      .map(([key, entryValue]) => `${JSON.stringify(key)}:${stableSerialize(entryValue)}`)

    return `{${entries.join(',')}}`
  }

  return JSON.stringify(value)
}

const hashRailContentSignature = (rawSignature: string): string => {
  let hash = 2166136261
  for (let index = 0; index < rawSignature.length; index += 1) {
    hash ^= rawSignature.charCodeAt(index)
    hash = Math.imul(hash, 16777619)
  }

  return (hash >>> 0).toString(16).padStart(8, '0')
}

export const buildRailContentSignature = (content: unknown): string => {
  return hashRailContentSignature(stableSerialize(content))
}

export const createRailSceneResolvedMeta = (
  input: RailSceneResolvedMeta
): RailSceneResolvedMeta => ({
  version: typeof input.version === 'number' ? input.version : undefined,
  updatedAt: normalizeUpdatedAt(input.updatedAt),
  signature: input.signature,
})

export const getRailPageReloadMode = (): PageReloadMode => railPageReloadMode

export const setRailPageReloadMode = (mode: PageReloadMode) => {
  railPageReloadMode = mode
}

export const shouldReloadRailPageContent = (
  mode: PageReloadMode,
  previousMeta: RailSceneResolvedMeta | null | undefined,
  nextMeta: RailSceneResolvedMeta
): boolean => {
  if (mode === 'always-reload' || previousMeta == null) {
    return true
  }

  if (previousMeta.version !== nextMeta.version) {
    return true
  }

  if (previousMeta.updatedAt !== nextMeta.updatedAt) {
    return true
  }

  return previousMeta.signature !== nextMeta.signature
}
