<!--
Responsibility: render the cross-platform icon surface for H5 SVG icons and APP iconfont
fallbacks behind a single prop interface.
Out of scope: icon registry authoring, page-level tone decisions, and interaction handling.
-->
<template>
  <!-- #ifdef H5 -->
  <component
    :is="h5IconComponent"
    v-if="h5IconComponent"
    class="aether-icon aether-icon--svg"
    :class="toneClass"
    v-bind="h5IconProps"
  />
  <!-- #endif -->

  <!-- #ifdef APP -->
  <text
    class="aether-icon aether-icon--font aether-iconfont"
    :class="[toneClass, iconfontClass]"
    :style="iconfontStyle"
  >
    {{ iconfontGlyph }}
  </text>
  <!-- #endif -->
</template>

<script setup lang="ts">
import { computed } from 'vue'
import type { AetherIconProps, AetherIconTone } from '../models/ui/aetherIcon.model'
import {
  resolveAetherAppIconfontClass,
  resolveAetherAppIconfontGlyph,
  resolveAetherH5IconComponent,
} from '../utils/aetherIcon.registry'

// #ifdef APP
import '../static/iconfont/aether-iconfont.css'
// #endif

const props = withDefaults(defineProps<AetherIconProps>(), {
  size: 24,
  strokeWidth: 1.5,
  tone: 'current',
})

const h5IconComponent = computed(() => {
  return resolveAetherH5IconComponent(props.name)
})

const h5IconProps = computed(() => {
  return {
    size: props.size,
    strokeWidth: props.strokeWidth,
  }
})

const iconfontClass = computed(() => {
  return resolveAetherAppIconfontClass(props.name)
})

const iconfontGlyph = computed(() => {
  return resolveAetherAppIconfontGlyph(props.name)
})

const iconfontStyle = computed(() => {
  const appStrokeScale = resolveAppStrokeScale(props.strokeWidth)
  return {
    fontSize: `${props.size}px`,
    lineHeight: `${props.size}px`,
    transform: `scale(${appStrokeScale})`,
  }
})

const toneClass = computed(() => {
  return `tone-${resolveToneToken(props.tone)}`
})

const resolveToneToken = (tone: AetherIconTone): AetherIconTone => {
  return tone
}

const resolveAppStrokeScale = (strokeWidth: number): string => {
  const safeStrokeWidth = Number.isFinite(strokeWidth) ? strokeWidth : 1.5
  const normalizedScale = 1 + (safeStrokeWidth - 1.5) * 0.08
  const clampedScale = Math.min(1.08, Math.max(0.92, normalizedScale))
  return clampedScale.toFixed(3)
}
</script>

<style scoped lang="scss">
.aether-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: currentColor;
  vertical-align: middle;
  flex: 0 0 auto;
}

.aether-icon--svg {
  line-height: 0;
}

.aether-icon--svg :deep(svg) {
  display: block;
  fill: none;
  stroke: currentColor;
}

.aether-icon--font {
  width: 1em;
  height: 1em;
  text-align: center;
  transform-origin: center;
}

.tone-current {
  color: currentColor;
}

.tone-default {
  color: #111111;
}

.tone-muted {
  color: #6b7280;
}

.tone-subtle {
  color: #94a3b8;
}

.tone-accent {
  color: #22d3ee;
}

.tone-success {
  color: #10b981;
}

.tone-warning {
  color: #f59e0b;
}

.tone-danger {
  color: #ef4444;
}
</style>
