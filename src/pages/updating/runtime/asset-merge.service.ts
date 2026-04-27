/**
 * Responsibility: provide the unified page-local service seam for retained asset-merge content.
 * Out of scope: global provider bootstrap policy, page rendering, and formal backend calls.
 */
import { adaptAssetMergeArchive } from './asset-merge.adapter'
import { assetMergeMockPort } from './asset-merge.mock'
import type { AssetMergeEventViewModel } from './asset-merge.model'
import type { AssetMergePort } from './asset-merge.port'

let activeAssetMergePort: AssetMergePort = assetMergeMockPort

export const setAssetMergePort = (port: AssetMergePort) => {
  activeAssetMergePort = port
}

export const resetAssetMergePort = () => {
  activeAssetMergePort = assetMergeMockPort
}

export const resolveAssetMergeEventListSnapshot = (): AssetMergeEventViewModel[] => {
  return adaptAssetMergeArchive(activeAssetMergePort.getArchive())
}
