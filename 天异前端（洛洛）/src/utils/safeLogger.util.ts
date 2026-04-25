/**
 * Responsibility: sanitize runtime errors and context payloads before they are logged so sensitive
 * fields are redacted consistently.
 * Out of scope: transport delivery, logger configuration, and user-facing error messaging.
 */

type RuntimeEnv = {
  PROD?: boolean
}

interface BuildSafeErrorPayloadOptions {
  isProduction?: boolean
}

export interface SafeErrorLogPayload {
  error: unknown
  context?: unknown
}

const SENSITIVE_KEY_PATTERN =
  /(token|secret|password|cookie|authorization|key|signature|session|private)/i
const REDACTED_VALUE = '[REDACTED]'
const MAX_SANITIZE_DEPTH = 6

const isObjectRecord = (value: unknown): value is Record<string, unknown> => {
  return typeof value === 'object' && value !== null
}

const resolveIsProduction = () => {
  return Boolean((import.meta as unknown as { env?: RuntimeEnv }).env?.PROD)
}

const sanitizeError = (value: Error, isProduction: boolean, seen: WeakSet<object>) => {
  const sanitized: Record<string, unknown> = {
    name: value.name || 'Error',
    message: value.message || 'Unknown error',
  }

  if (!isProduction && value.stack) {
    sanitized.stack = value.stack
  }

  if ('cause' in value) {
    const cause = (value as { cause?: unknown }).cause
    if (cause !== undefined) {
      sanitized.cause = sanitizeValue(cause, isProduction, 1, seen)
    }
  }

  if (isObjectRecord(value)) {
    Object.entries(value).forEach(([key, entry]) => {
      if (key === 'name' || key === 'message' || key === 'stack' || key === 'cause') {
        return
      }

      sanitized[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED_VALUE
        : sanitizeValue(entry, isProduction, 1, seen)
    })
  }

  return sanitized
}

const sanitizeValue = (
  value: unknown,
  isProduction: boolean,
  depth: number,
  seen: WeakSet<object>
): unknown => {
  if (value === null || value === undefined) {
    return value
  }

  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }

  if (typeof value === 'bigint') {
    return value.toString()
  }

  if (typeof value === 'function') {
    return '[Function]'
  }

  if (value instanceof Date) {
    return value.toISOString()
  }

  if (value instanceof Error) {
    return sanitizeError(value, isProduction, seen)
  }

  if (depth >= MAX_SANITIZE_DEPTH) {
    return '[MaxDepth]'
  }

  if (Array.isArray(value)) {
    if (seen.has(value)) {
      return '[Circular]'
    }

    seen.add(value)
    const sanitizedList = value.map((entry) => sanitizeValue(entry, isProduction, depth + 1, seen))
    seen.delete(value)
    return sanitizedList
  }

  if (isObjectRecord(value)) {
    if (seen.has(value)) {
      return '[Circular]'
    }

    seen.add(value)
    const sanitizedObject: Record<string, unknown> = {}
    Object.entries(value).forEach(([key, entry]) => {
      sanitizedObject[key] = SENSITIVE_KEY_PATTERN.test(key)
        ? REDACTED_VALUE
        : sanitizeValue(entry, isProduction, depth + 1, seen)
    })
    seen.delete(value)
    return sanitizedObject
  }

  return String(value)
}

export const buildSafeErrorPayload = (
  error: unknown,
  context?: unknown,
  options: BuildSafeErrorPayloadOptions = {}
): SafeErrorLogPayload => {
  const isProduction = options.isProduction ?? resolveIsProduction()
  const seen = new WeakSet<object>()

  const payload: SafeErrorLogPayload = {
    error: sanitizeValue(error, isProduction, 0, seen),
  }

  if (context !== undefined) {
    payload.context = sanitizeValue(context, isProduction, 0, seen)
  }

  return payload
}

export const logSafeError = (scope: string, error: unknown, context?: unknown) => {
  const payload = buildSafeErrorPayload(error, context)
  if (payload.context === undefined) {
    console.error(`[${scope}]`, payload.error)
    return
  }

  console.error(`[${scope}]`, payload.error, payload.context)
}
