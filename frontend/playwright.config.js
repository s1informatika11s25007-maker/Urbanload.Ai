import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright E2E Config for UrbanLoad.AI (Targeting Live Vercel Production)
 */
const baseURL = process.env.PLAYWRIGHT_BASE_URL || 'https://urbanload-ai-frontend.vercel.app';

export default defineConfig({
  testDir: './e2e',
  timeout: 120 * 1000, // 120s timeout for complete test suite
  expect: {
    timeout: 15 * 1000,
  },
  fullyParallel: false,
  retries: 0,
  workers: 1,
  reporter: [
    ['list'],
    ['json', { outputFile: 'playwright-report/audit-results.json' }],
    ['html', { open: 'never' }]
  ],
  use: {
    baseURL,
    trace: 'on-first-retry',
    screenshot: 'on',
    video: 'on',
    viewport: { width: 1280, height: 720 },
    permissions: ['geolocation'],
    geolocation: { latitude: -6.1820, longitude: 106.8150 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  ...(baseURL.includes('localhost') ? {
    webServer: {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: true,
      timeout: 30 * 1000,
    }
  } : {}),
});
