/**
 * Responsibility: provide route-signature helpers and apply-guard checks for profile asset detail
 * refresh results.
 * Out of scope: refresh execution, page state mutation, and persistent cache writes.
 */
export interface ProfileAssetDetailRouteSignatureInput {
  category: string
  itemId: string
}

export interface ProfileAssetDetailRefreshApplyGuardInput {
  currentRouteSignature: string
  currentUserScope: string | null | undefined
  isPageActive: boolean
  latestRequestVersion: number
  requestRouteSignature: string
  requestUserScope: string | null | undefined
  requestVersion: number
}

export const createProfileAssetDetailRouteSignature = ({
  itemId,
  category,
}: ProfileAssetDetailRouteSignatureInput): string => {
  return `${itemId.trim()}::${category.trim()}`
}

export const shouldApplyProfileAssetDetailRefreshResult = ({
  requestVersion,
  latestRequestVersion,
  requestRouteSignature,
  currentRouteSignature,
  requestUserScope,
  currentUserScope,
  isPageActive,
}: ProfileAssetDetailRefreshApplyGuardInput): boolean => {
  return (
    isPageActive &&
    requestVersion === latestRequestVersion &&
    requestRouteSignature === currentRouteSignature &&
    (requestUserScope ?? null) === (currentUserScope ?? null)
  )
}
