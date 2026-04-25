/**
 * Responsibility: expose the retained asset-merge mock provider through the page-local port.
 * Out of scope: mock data ownership, formal backend contracts, and provider switching policy.
 */
import { cloneAssetMergeEventDb } from '../../../mocks/updating-db/asset-merge'
import type { AssetMergePort } from './asset-merge.port'

export const assetMergeMockPort: AssetMergePort = {
  getArchive: () => ({
    events: cloneAssetMergeEventDb(),
  }),
}
