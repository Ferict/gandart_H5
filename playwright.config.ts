import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  fullyParallel: false,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { outputFolder: 'playwright-report' }]] : 'list',
  use: {
    baseURL: 'http://127.0.0.1:5180',
    trace: 'on-first-retry',
    headless: true,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev:h5:5180',
    url: 'http://127.0.0.1:5180',
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
})
