/**
 * Responsibility: own the DOM-side helpers that lock or release document scrolling for the home
 * shell overlay surfaces.
 * Out of scope: shell menu state, drawer animation timing, and page-level interaction policy.
 */

const applyDocumentOverflow = (overflow: string): void => {
  if (typeof document === 'undefined') {
    return
  }

  document.documentElement.style.overflow = overflow
  document.body.style.overflow = overflow
}

export const syncHomeShellDocumentScrollLock = (isLocked: boolean): void => {
  applyDocumentOverflow(isLocked ? 'hidden' : '')
}

export const clearHomeShellDocumentScrollLock = (): void => {
  applyDocumentOverflow('')
}
