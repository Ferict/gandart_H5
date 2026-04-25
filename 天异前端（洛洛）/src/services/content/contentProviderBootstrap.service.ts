/**
 * Responsibility: validate the runtime-selected content provider before app bootstrap.
 * Out of scope: provider construction, HTTP configuration, and page data behavior.
 */

export type ContentProvider = 'mock' | 'http' | 'backend-http'

const allowedContentProviders: ContentProvider[] = ['mock', 'http', 'backend-http']

export const resolveContentProviderName = (rawProvider: string | undefined): ContentProvider => {
  const provider = rawProvider?.trim().toLowerCase()
  if (!provider) {
    return 'mock'
  }

  if (allowedContentProviders.includes(provider as ContentProvider)) {
    return provider as ContentProvider
  }

  throw new Error(
    `[content] Unsupported VITE_CONTENT_PROVIDER "${rawProvider}". Expected one of: ${allowedContentProviders.join(
      ', '
    )}.`
  )
}
