import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

const url = new URL(baseUrl);
url.searchParams.set('review', 'gameplay');
await page.goto(url.toString(), { waitUntil: 'networkidle' });
await page.waitForSelector('.global-hud');
await page.waitForSelector('.city-management-rail');
await page.waitForTimeout(180);

const hudBox = await page.locator('.global-hud').boundingBox();
if (!hudBox) throw new Error('Global HUD must be visible.');
const hudCenter = hudBox.x + hudBox.width / 2;
if (Math.abs(hudCenter - 960) > 2) {
  throw new Error(`Global HUD must be centered on the 1920 canvas. center=${hudCenter.toFixed(1)}`);
}
if (hudBox.x < 0 || hudBox.x + hudBox.width > 1920) {
  throw new Error('Global HUD must not be clipped by the canvas edge.');
}

await page.screenshot({ path: `${outDir}/02a-gameplay-management-base.png` });

await page.getByRole('button', { name: '财政税赋', exact: true }).click();
await page.waitForSelector('.right-edge-flyout--management');
await page.waitForTimeout(120);
if ((await page.locator('.city-management-rail').count()) !== 1) {
  throw new Error('Management rail must remain visible while a management flyout is open.');
}
await page.screenshot({ path: `${outDir}/02b-finance-flyout.png` });

await page.locator('.right-edge-flyout--management .icon-button').click();
await page.waitForSelector('.right-edge-flyout--management', { state: 'detached' });

await page.getByRole('button', { name: '信息视图', exact: true }).click();
await page.waitForSelector('.map-view-panel');
await page.waitForTimeout(120);
await page.screenshot({ path: `${outDir}/02c-information-views.png` });

await page.getByRole('button', { name: '地价', exact: true }).click();
await page.waitForSelector('.map-view-layer--land-value');
await page.waitForTimeout(180);
await page.screenshot({ path: `${outDir}/02d-land-value-view.png` });

await browser.close();
