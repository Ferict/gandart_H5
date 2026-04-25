/**
 * Responsibility: bootstrap the application root, choose the active content provider, and
 * initialize app-level integrations before the uni-app shell mounts.
 * Out of scope: feature routing, provider contract details, and per-page runtime behavior.
 */

import { createSSRApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import { createContentBackendHttpImplementation } from './implementations/content.backend-http'
import { createContentHttpImplementation } from './implementations/content.http'
import { contentMockImplementation } from './implementations/content.mock'
import { setContentPort } from './services/content/content.service'
import { resolveContentProviderName } from './services/content/contentProviderBootstrap.service'
import { initializeHomeRailPersistentCacheIntegration } from './services/home-rail/homeRailPersistentCacheIntegration.service'
import './uni.scss'

type RuntimeEnv = {
  PROD?: boolean
  VITE_CONTENT_PROVIDER?: string
  VITE_CONTENT_API_BASE_URL?: string
  VITE_CONTENT_BACKEND_API_BASE_URL?: string
}

const resolveRuntimeEnv = (): RuntimeEnv => {
  const runtime = (import.meta as unknown as { env?: RuntimeEnv }).env
  return runtime ?? {}
}

const setupContentProvider = () => {
  const env = resolveRuntimeEnv()
  const provider = resolveContentProviderName(env.VITE_CONTENT_PROVIDER)
  if (provider === 'http') {
    const baseUrl = env.VITE_CONTENT_API_BASE_URL?.trim()
    if (!baseUrl) {
      throw new Error(
        '[content] VITE_CONTENT_API_BASE_URL is required when VITE_CONTENT_PROVIDER=http.'
      )
    }

    setContentPort(
      createContentHttpImplementation({
        baseUrl,
        isProduction: Boolean(env.PROD),
      })
    )
    return
  }

  if (provider === 'backend-http') {
    const baseUrl =
      env.VITE_CONTENT_BACKEND_API_BASE_URL?.trim() || env.VITE_CONTENT_API_BASE_URL?.trim()
    if (!baseUrl) {
      throw new Error(
        '[content] VITE_CONTENT_BACKEND_API_BASE_URL or VITE_CONTENT_API_BASE_URL is required when VITE_CONTENT_PROVIDER=backend-http.'
      )
    }

    setContentPort(
      createContentBackendHttpImplementation({
        baseUrl,
        isProduction: Boolean(env.PROD),
      })
    )
    return
  }

  setContentPort(contentMockImplementation)
}

export function createApp() {
  setupContentProvider()
  initializeHomeRailPersistentCacheIntegration()
  const app = createSSRApp(App)
  const pinia = createPinia()

  app.use(pinia)

  return {
    app,
    pinia,
  }
}
