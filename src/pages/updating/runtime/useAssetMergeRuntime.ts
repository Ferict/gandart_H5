/**
 * Responsibility: expose the retained asset-merge page-local runtime state through a stable view-model seam.
 * Out of scope: visual rendering, navigation dispatch, and transport/provider bootstrap policy.
 */
import { ref } from 'vue'
import { resolveAssetMergeEventListSnapshot } from './asset-merge.service'

export const useAssetMergeRuntime = () => {
  const assetMergeEventList = ref(resolveAssetMergeEventListSnapshot())

  return {
    assetMergeEventList,
  }
}
