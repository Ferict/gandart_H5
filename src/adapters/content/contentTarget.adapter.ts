/**
 * Responsibility: normalize contract target DTOs into frontend-stable target refs consumed by
 * navigation services, runtime state, and UI-facing models.
 * Out of scope: route URL assembly, provider bootstrap policy, and page-local click handling.
 */
import type { ContentTargetDto } from '../../contracts/content-api.contract'
import type { ContentTargetRef } from '../../models/content/contentTarget.model'

export const adaptContentTarget = (target: ContentTargetDto): ContentTargetRef => {
  if (target.targetType === 'profile_asset') {
    return {
      targetType: 'profile_asset',
      targetId: target.targetId,
      provider: target.provider,
      params: {
        category: target.params.category,
        ...(target.params.subCategory ? { subCategory: target.params.subCategory } : {}),
      },
    }
  }

  return {
    targetType: target.targetType,
    targetId: target.targetId,
    provider: target.provider,
  }
}

export const cloneContentTargetRef = (target?: ContentTargetRef): ContentTargetRef | undefined => {
  if (!target) {
    return undefined
  }

  if (target.targetType === 'profile_asset') {
    return {
      targetType: 'profile_asset',
      targetId: target.targetId,
      provider: target.provider,
      params: {
        category: target.params.category,
        ...(target.params.subCategory ? { subCategory: target.params.subCategory } : {}),
      },
    }
  }

  return {
    targetType: target.targetType,
    targetId: target.targetId,
    provider: target.provider,
  }
}
