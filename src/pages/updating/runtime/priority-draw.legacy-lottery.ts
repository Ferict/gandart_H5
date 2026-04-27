/**
 * Responsibility: bridge retained priority-draw events with the legacy lottery/info endpoint.
 * Out of scope: formal backend contract ownership, global provider selection, and draw execution.
 */
import type { PriorityDrawArchiveDto, PriorityDrawEventDto } from './priority-draw.port'

export interface LegacyLotteryInfoDto {
  id?: string | number
  remaining?: string | number
}

type RuntimeEnv = {
  VITE_LEGACY_LOTTERY_API_BASE_URL?: string
  VITE_CONTENT_BACKEND_API_BASE_URL?: string
  VITE_CONTENT_API_BASE_URL?: string
}

const isObjectRecord = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null

const toFiniteRemainingCount = (value: unknown) => {
  const normalized = typeof value === 'string' ? Number(value.trim()) : Number(value)
  return Number.isFinite(normalized) ? Math.max(0, Math.trunc(normalized)) : null
}

const resolveRuntimeEnv = (): RuntimeEnv => {
  const runtime = (import.meta as unknown as { env?: RuntimeEnv }).env
  return runtime ?? {}
}

const normalizeBaseUrl = (value: string) => value.trim().replace(/\/+$/, '')

export const resolveLegacyLotteryApiBaseUrl = () => {
  const env = resolveRuntimeEnv()
  const rawBaseUrl =
    env.VITE_LEGACY_LOTTERY_API_BASE_URL?.trim() ||
    env.VITE_CONTENT_BACKEND_API_BASE_URL?.trim() ||
    env.VITE_CONTENT_API_BASE_URL?.trim()

  return rawBaseUrl ? normalizeBaseUrl(rawBaseUrl) : ''
}

export const buildLegacyLotteryInfoUrl = (baseUrl: string) => {
  const normalizedBaseUrl = normalizeBaseUrl(baseUrl)
  return normalizedBaseUrl.endsWith('/api')
    ? `${normalizedBaseUrl}/lottery/info`
    : `${normalizedBaseUrl}/api/lottery/info`
}

export const resolveLegacyLotteryId = (event: PriorityDrawEventDto) => {
  if (event.lotteryId !== undefined && `${event.lotteryId}`.trim()) {
    return event.lotteryId
  }

  const numericId = event.id.match(/\d+/)?.[0]
  return numericId ? Number(numericId) : event.id
}

export const applyLegacyLotteryInfoToPriorityDrawEventDto = (
  event: PriorityDrawEventDto,
  lotteryInfo: LegacyLotteryInfoDto
): PriorityDrawEventDto => {
  const remainingDrawCount = toFiniteRemainingCount(lotteryInfo.remaining)
  if (remainingDrawCount === null) {
    return event
  }

  return {
    ...event,
    lotteryId: lotteryInfo.id ?? event.lotteryId,
    remainingDrawCount,
    isEligible: remainingDrawCount > 0,
  }
}

const normalizeLegacyLotteryInfoEnvelope = (raw: unknown): LegacyLotteryInfoDto | null => {
  if (!isObjectRecord(raw)) {
    return null
  }

  const payload = isObjectRecord(raw.data) ? raw.data : raw
  if (!('remaining' in payload)) {
    return null
  }

  return {
    id: typeof payload.id === 'string' || typeof payload.id === 'number' ? payload.id : undefined,
    remaining:
      typeof payload.remaining === 'string' || typeof payload.remaining === 'number'
        ? payload.remaining
        : undefined,
  }
}

const readLegacyAuthHeader = () => {
  try {
    const token = uni.getStorageSync('token')
    return typeof token === 'string' && token ? { token } : {}
  } catch {
    return {}
  }
}

const requestLegacyLotteryInfo = async (
  baseUrl: string,
  lotteryId: string | number
): Promise<LegacyLotteryInfoDto | null> =>
  new Promise((resolve, reject) => {
    uni.request({
      url: buildLegacyLotteryInfoUrl(baseUrl),
      method: 'POST',
      data: {
        id: lotteryId,
      },
      header: {
        'content-type': 'application/json',
        ...readLegacyAuthHeader(),
      },
      success: (response) => {
        if (response.statusCode < 200 || response.statusCode >= 300) {
          reject(new Error(`[priority-draw] lottery/info failed with HTTP ${response.statusCode}.`))
          return
        }

        if (
          isObjectRecord(response.data) &&
          response.data.code !== undefined &&
          response.data.code !== 1
        ) {
          reject(new Error('[priority-draw] lottery/info returned a non-success code.'))
          return
        }

        resolve(normalizeLegacyLotteryInfoEnvelope(response.data))
      },
      fail: (error) => {
        const reason = isObjectRecord(error) && typeof error.errMsg === 'string' ? error.errMsg : ''
        reject(
          new Error(`[priority-draw] lottery/info request failed.${reason ? ` ${reason}` : ''}`)
        )
      },
    })
  })

export const hydratePriorityDrawArchiveFromLegacyLottery = async (
  archive: PriorityDrawArchiveDto
): Promise<PriorityDrawArchiveDto> => {
  const baseUrl = resolveLegacyLotteryApiBaseUrl()
  if (!baseUrl) {
    return archive
  }

  const events = await Promise.all(
    archive.events.map(async (event) => {
      try {
        const lotteryInfo = await requestLegacyLotteryInfo(baseUrl, resolveLegacyLotteryId(event))
        return lotteryInfo
          ? applyLegacyLotteryInfoToPriorityDrawEventDto(event, lotteryInfo)
          : event
      } catch {
        return event
      }
    })
  )

  return {
    events,
  }
}
