import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4173';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL,
    trace: 'off',
  },
  webServer: {
    command: 'pnpm exec vite preview --host 127.0.0.1 --port 4173 --strictPort',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'phone-320',
      use: { viewport: { width: 320, height: 720 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'phone-360',
      use: { ...devices['Pixel 5'], viewport: { width: 360, height: 800 } },
    },
    {
      name: 'phone-390',
      use: { viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'phone-412',
      use: { viewport: { width: 412, height: 915 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'phone-landscape',
      use: { viewport: { width: 844, height: 390 }, isMobile: true, hasTouch: true },
    },
    {
      name: 'android-desktop-site',
      use: {
        viewport: { width: 980, height: 1800 },
        isMobile: true,
        hasTouch: true,
        userAgent:
          'Mozilla/5.0 (Linux; Android 13; Pixel 7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Mobile Safari/537.36',
      },
    },
  ],
});
