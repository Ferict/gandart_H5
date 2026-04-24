import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { defineConfig } from 'vitest/config'

const rootDir = fileURLToPath(new URL('.', import.meta.url))

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(rootDir, 'src'),
    },
  },
  test: {
    environment: 'node',
    globals: true,
    include: ['tests/unit/**/*.spec.ts'],
    coverage: {
      enabled: false,
      reporter: ['text', 'html'],
      reportsDirectory: 'coverage/vitest',
    },
  },
})
