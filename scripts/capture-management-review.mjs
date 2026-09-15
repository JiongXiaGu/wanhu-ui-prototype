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

await open('gameplay', '.city-management-rail');
const hudBox = await page.locator('.global-hud').boundingBox();
if (!hudBox) throw new Error('Global HUD must be visible.');
const hudCenter = hudBox.x + hudBox.width / 2;
if (Math.abs(hudCenter - 960) > 2) throw new Error(`Global HUD must be centered. center=${hudCenter.toFixed(1)}`);
if (hudBox.x < 0 || hudBox.x + hudBox.width > 1920) throw new Error('Global HUD must not be clipped.');
await page.screenshot({ path: `${outDir}/02a-gameplay-management-base.png` });

// Complex management systems must enter a blocking central Management Space.
await page.getByRole('button', { name: '财政税赋', exact: true }).click();
await page.waitForSelector('.management-space--finance');
await page.waitForTimeout(140);
for (const selector of ['.city-management-rail', '.command-bar', '.command-utility', '.gameplay-operation-hints', '.quick-controls', '.right-edge-flyout--management']) {
  if ((await page.locator(selector).count()) !== 0) throw new Error(`${selector} must not remain visible in Management Space.`);
}
const managementBox = await page.locator('.management-space__panel').boundingBox();
if (!managementBox) throw new Error('Management Space panel must be visible.');
if (managementBox.width < 1200 || managementBox.height < 700) throw new Error('Management Space must be a large central workspace.');
if (managementBox.x < 0 || managementBox.y < 80 || managementBox.x + managementBox.width > 1920 || managementBox.y + managementBox.height > 1080) {
  throw new Error('Management Space must fit inside the 1920x1080 canvas without colliding with the top HUD.');
}
await page.screenshot({ path: `${outDir}/02b-finance-management-space.png` });

// Tabs switch inside one shared Management Space instead of opening different flyouts.
await page.getByRole('button', { name: '政策', exact: true }).click();
await page.waitForSelector('.management-space--policy');
await page.waitForTimeout(100);
await page.screenshot({ path: `${outDir}/02b2-policy-management-space.png` });
await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });
await page.waitForSelector('.city-management-rail');

// Information views remain lightweight and world-facing.
await page.getByRole('button', { name: '信息视图', exact: true }).click();
await page.waitForSelector('.map-view-panel');
await page.waitForTimeout(100);
await page.screenshot({ path: `${outDir}/02c-information-views.png` });
await page.getByRole('button', { name: '地价', exact: true }).click();
await page.waitForSelector('.map-view-layer--land-value');
await page.waitForTimeout(160);
await page.screenshot({ path: `${outDir}/02d-land-value-view.png` });

// Workspace and Tool own the left/bottom interaction zones; Management Rail must disappear.
await open('workspace-building', '.workspace');
if ((await page.locator('.city-management-rail').count()) !== 0) throw new Error('Management Rail must be hidden in Building Workspace.');
if ((await page.locator('.command-bar').count()) !== 1) throw new Error('Building Workspace must retain the Main Dock.');

await open('building-position', '.tool-overlay');
if ((await page.locator('.city-management-rail').count()) !== 0) throw new Error('Management Rail must be hidden while Building Placement is active.');
if ((await page.locator('.command-bar').count()) !== 0) throw new Error('Main Dock must be hidden while Building Placement is active.');
if ((await page.locator('.building-placement-toolbar-cluster').count()) !== 1) throw new Error('Building Placement must use its dedicated tool toolbar.');
await page.screenshot({ path: `${outDir}/02e-building-placement-space-ownership.png` });

await browser.close();
