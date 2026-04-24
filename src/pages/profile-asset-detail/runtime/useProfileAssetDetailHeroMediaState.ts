/**
 * Responsibility: host profile asset detail hero media state, including image source projection,
 * ratio tracking, placeholder selection, and frame-style calculation.
 * Out of scope: detail-content fetching, route resolution, and page refresh orchestration.
 */
import { computed, ref, watch, type CSSProperties, type ComputedRef, type Ref } from 'vue'
import type { AetherIconName } from '../../../models/ui/aetherIcon.model'
import type { HomePlaceholderIconKey } from '../../../models/home-rail/homeRailHome.model'
import type { ProfileAssetDetailContent } from '../../../models/profile-asset-detail/profileAssetDetail.model'
import {
  resolveProfileAssetDetailHeroImageRatio,
  resolveProfileAssetDetailHeroImageUrl,
} from '../helpers/profileAssetDetailHeroMedia'

const HERO_MEDIA_DEFAULT_RATIO = 4 / 5
const HERO_MEDIA_FRAME_MIN_RATIO = 0.42
const HERO_MEDIA_FRAME_MAX_RATIO = 1.35

const placeholderIconRegistry: Record<HomePlaceholderIconKey, AetherIconName> = {
  box: 'box',
  cpu: 'cpu',
  aperture: 'aperture',
  hexagon: 'hexagon',
  triangle: 'triangle',
  disc3: 'disc-3',
}

interface UseProfileAssetDetailHeroMediaStateOptions {
  detailContent: Ref<ProfileAssetDetailContent>
  detailPersistentUserScope: Ref<string | null>
  fallbackHeroImageUrl: ComputedRef<string>
}

export interface UseProfileAssetDetailHeroMediaStateResult {
  heroImageRatio: Ref<number>
  heroImageUrl: ComputedRef<string>
  heroRevealPhase: ComputedRef<'steady' | 'fallback'>
  heroImageCacheUserScope: ComputedRef<string | undefined>
  heroPlaceholderIcon: ComputedRef<AetherIconName>
  heroMediaFrameStyle: ComputedRef<CSSProperties>
  handleHeroImageLoad: (event: unknown) => void
  handleHeroImageError: () => void
}

const clamp = (value: number, min: number, max: number) => Math.min(max, Math.max(min, value))

export const useProfileAssetDetailHeroMediaState = ({
  detailContent,
  detailPersistentUserScope,
  fallbackHeroImageUrl,
}: UseProfileAssetDetailHeroMediaStateOptions): UseProfileAssetDetailHeroMediaStateResult => {
  const heroImageRatio = ref(HERO_MEDIA_DEFAULT_RATIO)

  const heroImageUrl = computed(() => {
    const contentImage = resolveProfileAssetDetailHeroImageUrl(detailContent.value.imageUrl)
    if (contentImage) {
      return contentImage
    }

    return resolveProfileAssetDetailHeroImageUrl(fallbackHeroImageUrl.value)
  })

  const heroRevealPhase = computed<'steady' | 'fallback'>(() =>
    heroImageUrl.value ? 'steady' : 'fallback'
  )

  const heroImageCacheUserScope = computed(() => detailPersistentUserScope.value ?? undefined)

  const heroPlaceholderIcon = computed<AetherIconName>(
    () => placeholderIconRegistry[detailContent.value.placeholderIconKey ?? 'box']
  )

  const heroMediaFrameRatio = computed(() =>
    clamp(heroImageRatio.value, HERO_MEDIA_FRAME_MIN_RATIO, HERO_MEDIA_FRAME_MAX_RATIO)
  )

  const heroMediaFrameStyle = computed<CSSProperties>(
    () =>
      ({
        aspectRatio: `${heroMediaFrameRatio.value.toFixed(4)}`,
      }) as CSSProperties
  )

  const handleHeroImageLoad = (event: unknown) => {
    const ratio = resolveProfileAssetDetailHeroImageRatio(event)
    if (!ratio) {
      return
    }

    heroImageRatio.value = ratio
  }

  const handleHeroImageError = () => {
    heroImageRatio.value = HERO_MEDIA_DEFAULT_RATIO
  }

  watch(
    heroImageUrl,
    () => {
      heroImageRatio.value = HERO_MEDIA_DEFAULT_RATIO
    },
    { immediate: true }
  )

  return {
    heroImageRatio,
    heroImageUrl,
    heroRevealPhase,
    heroImageCacheUserScope,
    heroPlaceholderIcon,
    heroMediaFrameStyle,
    handleHeroImageLoad,
    handleHeroImageError,
  }
}
