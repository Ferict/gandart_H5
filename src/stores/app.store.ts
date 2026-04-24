/**
 * Responsibility: provide the minimal application-level Pinia store for bootstrapped state shared
 * across the app shell.
 * Out of scope: page-private state, content-domain persistence, and feature-specific runtime data.
 */

import { defineStore } from 'pinia'

/**
 * 文件职责：
 * 1. 作为应用级基础 Pinia store 的最小正式入口实现。
 * 2. 仅承载应用级基础状态，不承载页面私有状态。
 * 3. 后续真实全局状态必须继续沿 `stores/` 边界扩展，不回流到页面中。
 */
export const useAppStore = defineStore('app', {
  state: () => ({
    bootstrapped: false,
  }),
  actions: {
    markBootstrapped() {
      this.bootstrapped = true
    },
  },
})
