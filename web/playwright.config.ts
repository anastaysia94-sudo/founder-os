import { defineConfig, devices } from '@playwright/test';
import { existsSync } from 'node:fs';
import { resolve } from 'node:path';

const baseURL = process.env.FDOS_E2E_BASE_URL || 'https://founder-dynasty-os-web-production.up.railway.app';
const requestedState = process.env.FDOS_E2E_STORAGE_STATE || resolve(__dirname, 'playwright/.auth/user.json');
const storageState = existsSync(requestedState) ? requestedState : undefined;

export default defineConfig({
  testDir: './e2e',
  timeout: 10 * 60 * 1000,
  expect: { timeout: 20_000 },
  fullyParallel: false,
  workers: 1,
  retries: 0,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    baseURL,
    storageState,
    trace: 'on',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
