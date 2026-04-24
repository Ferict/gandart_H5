/**
 * Responsibility: provide the page-open refresh flow for the profile asset detail page, enforcing
 * the prepare-then-refresh sequence.
 * Out of scope: route parsing, refresh guard logic, and persistent-state ownership.
 */
export interface ProfileAssetDetailPageOpenRefreshInput {
  reason: 'page-open'
}

export interface RunProfileAssetDetailPageOpenFlowInput {
  prepareDetailPageForPageOpen: () => Promise<void> | void
  refreshDetailContent: (input: ProfileAssetDetailPageOpenRefreshInput) => Promise<void> | void
}

export const runProfileAssetDetailPageOpenFlow = async ({
  prepareDetailPageForPageOpen,
  refreshDetailContent,
}: RunProfileAssetDetailPageOpenFlowInput) => {
  await prepareDetailPageForPageOpen()
  await refreshDetailContent({ reason: 'page-open' })
}
