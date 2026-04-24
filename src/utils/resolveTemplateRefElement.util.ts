/**
 * Responsibility: normalize template refs from raw DOM nodes or Vue component instances into a
 * native HTMLElement for layout and measurement runtime logic.
 * Out of scope: observer wiring, element caching policy, and result-window business logic.
 */
import type { ComponentPublicInstance, Ref } from 'vue'

export type TemplateRefElementTarget = Element | ComponentPublicInstance | null

export const resolveTemplateRefElement = (target: unknown): HTMLElement | null => {
  if (!target) {
    return null
  }

  if (target instanceof HTMLElement) {
    return target
  }

  if (typeof target !== 'object' || target === null) {
    return null
  }

  const maybeElement = target as {
    $el?: unknown
    $?: { vnode?: { el?: unknown } }
    vnode?: { el?: unknown }
  }
  const candidates = [maybeElement.$el, maybeElement.$?.vnode?.el, maybeElement.vnode?.el]
  for (const candidate of candidates) {
    if (candidate instanceof HTMLElement) {
      return candidate
    }
  }

  return null
}

export const createResolvedTemplateRefAssigner = (targetRef: Ref<HTMLElement | null>) => {
  return (target: TemplateRefElementTarget) => {
    targetRef.value = resolveTemplateRefElement(target)
  }
}

export const createResolvedTemplateRefForwarder = (
  assignResolvedElement: (element: HTMLElement | null) => void
) => {
  return (target: TemplateRefElementTarget) => {
    assignResolvedElement(resolveTemplateRefElement(target))
  }
}
