import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';

const baseURL = process.env.FDOS_E2E_BASE_URL || 'https://founder-dynasty-os-web-production.up.railway.app';
const statePath = process.env.FDOS_E2E_STORAGE_STATE || resolve('playwright/.auth/user.json');

await mkdir(dirname(statePath), { recursive: true });

const browser = await chromium.launch({ headless: false });
const context = await browser.newContext();
const page = await context.newPage();

console.log('\nFounder Dynasty OS acceptance authentication');
console.log('A browser window is open at the production site.');
console.log('Sign in directly in that browser. Credentials are never written to this repository.');
console.log('The script will save local browser auth state after the production UI shows Sign out.\n');

await page.goto(baseURL, { waitUntil: 'domcontentloaded' });

try {
  await page.getByRole('button', { name: 'Sign out' }).waitFor({ state: 'visible', timeout: 10 * 60 * 1000 });
  await context.storageState({ path: statePath });
  console.log(`Saved authenticated browser state to ${statePath}`);
} catch (error) {
  console.error('Timed out before a genuine signed-in production session was observed.');
  process.exitCode = 1;
} finally {
  await browser.close();
}
