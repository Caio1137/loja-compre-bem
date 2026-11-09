import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  workers: 1,
  timeout: 60000,
  expect: { timeout: 15000 },
  reporter: 'list',
  use: {
    baseURL: 'http://localhost:8081',
    browserName: 'chromium',
    channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome',
    viewport: { width: 430, height: 932 },
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },
  webServer: [
    { command: 'npm run api', url: 'http://localhost:8080/api/v1/produtos', reuseExistingServer: !process.env.CI, timeout: 120000 },
    { command: 'npm run web -- --port 8081', url: 'http://localhost:8081', reuseExistingServer: !process.env.CI, timeout: 120000 },
  ],
});
