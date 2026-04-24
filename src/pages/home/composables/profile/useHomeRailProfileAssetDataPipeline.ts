/**
 * Responsibility: assemble the profile asset query and remote-list pipeline used by the parent
 * profile panel runtime, including local snapshot bridge wiring.
 * Out of scope: result windows, reload coordination, scene patching, reveal runtime, and template logic.
 */
import type { ComputedRef, Ref } from 'vue'
import type {
  HomeRailProfileContent,
  ProfileAssetItem,
  ProfileCategoryKey,
} from '../../../../models/home-rail/homeRailProfile.model'
import type {
  HomeRailProfileAssetListResult,
  ResolveHomeRailProfileAssetListInput,
} from '../../../../services/home-rail/homeRailProfileContent.service'
import { useProfileAssetQueryState } from './useProfileAssetQueryState'
import { useProfileAssetRemoteListState } from './useProfileAssetRemoteListState'

interface UseHomeRailProfileAssetDataPipelineOptions {
  resolvedProfileCategories: ComputedRef<HomeRailProfileContent['categories']>
  currentCategoryAssets: ComputedRef<ProfileAssetItem[]>
  emitScrollToAssetsSection: () => void
  activeCategoryRef: Ref<ProfileCategoryKey>
  activeSubCategoryRef: Ref<string>
  remotePageSize: number
  resolveCurrentPersistUserScope: () => string | null
  syncResolvedProfileAssetListSnapshot: (
    query: ResolveHomeRailProfileAssetListInput,
    result: HomeRailProfileAssetListResult,
    etag?: string
  ) => void
  hydratePersistedProfileAssetListSnapshot?: (
    query: ResolveHomeRailProfileAssetListInput
  ) => Promise<HomeRailProfileAssetListResult | null>
  persistResolvedProfileAssetListSnapshot?: (
    query: ResolveHomeRailProfileAssetListInput,
    result: HomeRailProfileAssetListResult,
    requestUserScope?: string | null
  ) => Promise<void> | void
}

export const useHomeRailProfileAssetDataPipeline = (
  options: UseHomeRailProfileAssetDataPipelineOptions
) => {
  const profileAssetQueryState = useProfileAssetQueryState({
    resolvedProfileCategories: options.resolvedProfileCategories,
    currentCategoryAssets: options.currentCategoryAssets,
    emitScrollToAssetsSection: options.emitScrollToAssetsSection,
    activeCategoryRef: options.activeCategoryRef,
    activeSubCategoryRef: options.activeSubCategoryRef,
  })

  const profileAssetRemoteListState = useProfileAssetRemoteListState({
    remotePageSize: options.remotePageSize,
    resolveProfileAssetQuerySnapshot: profileAssetQueryState.resolveProfileAssetQuerySnapshot,
    resolveProfileAssetQuerySignature: () =>
      profileAssetQueryState.profileAssetQuerySignature.value,
    resolveCurrentPersistUserScope: options.resolveCurrentPersistUserScope,
    syncResolvedProfileAssetListSnapshot: options.syncResolvedProfileAssetListSnapshot,
    hydratePersistedProfileAssetListSnapshot: options.hydratePersistedProfileAssetListSnapshot,
    persistResolvedProfileAssetListSnapshot: options.persistResolvedProfileAssetListSnapshot,
  })

  return {
    profileAssetQueryState,
    profileAssetRemoteListState,
  }
}
