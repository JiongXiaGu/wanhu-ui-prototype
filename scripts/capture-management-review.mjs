import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

async function open(review, waitFor) {
  const url = new URL(baseUrl);
  url.searchParams.set('review', review);
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector(waitFor);
  await page.waitForTimeout(180);
}

await open('gameplay', '.gameplay-top-navigation');
const topShellBox = await page.locator('.gameplay-top-shell').boundingBox();
if (!topShellBox) throw new Error('Unified gameplay top shell must be visible.');
const topShellCenter = topShellBox.x + topShellBox.width / 2;
if (Math.abs(topShellCenter - 960) > 2) throw new Error(`Top shell must be centered. center=${topShellCenter.toFixed(1)}`);
if (topShellBox.x < 0 || topShellBox.x + topShellBox.width > 1920) throw new Error('Top shell must not be clipped.');
if (topShellBox.height < 88 || topShellBox.height > 110) throw new Error(`Normal gameplay top shell must contain two integrated rows. height=${topShellBox.height}`);
if ((await page.locator('.city-management-rail').count()) !== 0) throw new Error('Legacy left Management Rail must not be rendered.');
if ((await page.locator('.quick-controls').count()) !== 0) throw new Error('Legacy standalone Quick Controls must not be rendered.');
await page.screenshot({ path: `${outDir}/02a-gameplay-top-shell.png` });

// Complex management systems stay blocking, while the shared top navigation remains available.
await page.getByRole('button', { name: '财政税赋', exact: true }).click();
await page.waitForSelector('.management-space--finance');
await page.waitForTimeout(140);
if ((await page.locator('.gameplay-top-navigation').count()) !== 1) throw new Error('Top management navigation must remain visible in Management Space.');
if ((await page.locator('.management-space__tabs').count()) !== 0) throw new Error('Management Space must not repeat the top-level category navigation internally.');
for (const selector of ['.command-bar', '.command-utility', '.gameplay-operation-hints']) {
  if ((await page.locator(selector).count()) !== 0) throw new Error(`${selector} must not remain visible in Management Space.`);
}
const managementBox = await page.locator('.management-space__panel').boundingBox();
if (!managementBox) throw new Error('Management Space panel must be visible.');
if (managementBox.width < 1200 || managementBox.height < 700) throw new Error('Management Space must remain a large central workspace.');
if (managementBox.x < 0 || managementBox.y < 112 || managementBox.x + managementBox.width > 1920 || managementBox.y + managementBox.height > 1080) {
  throw new Error('Management Space must fit below the unified top shell inside the 1920x1080 canvas.');
}
await page.screenshot({ path: `${outDir}/02b-finance-top-navigation.png` });

// Switching systems happens through the shared top row, not through duplicate tabs inside the panel.
await page.getByRole('button', { name: '政令政策', exact: true }).click();
await page.waitForSelector('.management-space--policy');
await page.waitForTimeout(100);
await page.screenshot({ path: `${outDir}/02b2-policy-top-navigation.png` });
await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });
await page.waitForSelector('.gameplay-top-navigation');

// Information views now open below the same top navigation system.
await page.getByRole('button', { name: '信息视图', exact: true }).click();
await page.waitForSelector('.gameplay-top-map-panel');
await page.waitForTimeout(100);
await page.screenshot({ path: `${outDir}/02c-information-views-top.png` });
await page.getByRole('button', { name: '地价', exact: true }).click();
await page.waitForSelector('.map-view-layer--land-value');
await page.waitForTimeout(160);
if ((await page.locator('.gameplay-top-map-panel').count()) !== 0) throw new Error('Information View palette should collapse after choosing a map layer.');
await page.screenshot({ path: `${outDir}/02d-land-value-view.png` });

// Workspace and Tool keep the persistent status row but hide management navigation.
await open('workspace-building', '.workspace');
if ((await page.locator('.gameplay-top-shell').count()) !== 1) throw new Error('Workspace must retain the persistent top status shell.');
if ((await page.locator('.gameplay-top-navigation').count()) !== 0) throw new Error('Management navigation must be hidden in Building Workspace.');
if ((await page.locator('.command-bar').count()) !== 1) throw new Error('Building Workspace must retain the Main Dock.');

await open('building-position', '.tool-overlay');
if ((await page.locator('.gameplay-top-shell').count()) !== 1) throw new Error('Building Placement must retain the persistent top status shell.');
if ((await page.locator('.gameplay-top-navigation').count()) !== 0) throw new Error('Management navigation must be hidden while Building Placement is active.');
if ((await page.locator('.command-bar').count()) !== 0) throw new Error('Main Dock must be hidden while Building Placement is active.');
if ((await page.locator('.building-placement-toolbar-cluster').count()) !== 1) throw new Error('Building Placement must use its dedicated tool toolbar.');
await page.screenshot({ path: `${outDir}/02e-building-placement-top-shell.png` });

await browser.close();
