import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

async function openGameplay() {
  const url = new URL(baseUrl);
  url.searchParams.set('review', 'gameplay');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.gameplay-top-status');
  await page.waitForTimeout(220);
}

await openGameplay();

const shortcuts = page.locator('.gameplay-top-resource-shortcut');
if ((await shortcuts.count()) !== 4) throw new Error('Top HUD must expose exactly four metric shortcuts.');
if ((await page.locator('.gameplay-top-resource-shortcut small').count()) !== 0) throw new Error('Top metric shortcuts must not show persistent text labels.');
if ((await page.locator('.gameplay-top-resource-shortcut svg').count()) !== 4) throw new Error('Every top metric shortcut must expose one icon.');
if ((await page.locator('.gameplay-top-resource-shortcut b').count()) !== 4) throw new Error('Every top metric shortcut must expose one numeric value.');
if ((await page.locator('.gameplay-top-resource-shortcut.is-active').count()) !== 0) throw new Error('Top metric shortcuts must not own navigation active state.');

for (const expected of [
  ['人口', '8,426'],
  ['金钱', '24,680'],
  ['贸易值', '12,430'],
  ['军事值', '68'],
]) {
  const button = page.getByRole('button', { name: new RegExp(`${expected[0]}.*${expected[1]}`) });
  if ((await button.count()) !== 1) throw new Error(`Missing top metric shortcut: ${expected.join(' ')}`);
}

const primaryManagement = page.locator('.gameplay-top-navigation__management > button');
if ((await primaryManagement.count()) !== 5) throw new Error('Primary management tray must remain a compact five-entry row.');
for (const label of ['城市', '经济', '库存', '政策', '军事']) {
  if ((await page.getByRole('button', { name: label, exact: true }).count()) !== 1) throw new Error(`Primary management entry missing: ${label}`);
}

await page.screenshot({ path: `${outDir}/54-top-metric-shortcuts.png` });

async function openViaShortcut(label, value, selector, primaryLabel) {
  const shortcut = page.getByRole('button', { name: new RegExp(`${label}.*${value}`) });
  await shortcut.click();
  await page.waitForSelector(selector);
  if ((await page.locator('.gameplay-top-resource-shortcut.is-active').count()) !== 0) {
    throw new Error('Top metric shortcut gained active navigation state; only the primary tray may show selection.');
  }
  const primary = page.getByRole('button', { name: primaryLabel, exact: true });
  if (!(await primary.getAttribute('class'))?.includes('is-active')) {
    throw new Error(`Primary management tray should own the active state for ${primaryLabel}.`);
  }
}

await openViaShortcut('人口', '8,426', '.management-space--city', '城市');
await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });

await openViaShortcut('金钱', '24,680', '.management-space--finance', '经济');
await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });

await openViaShortcut('贸易值', '12,430', '.management-space--inventory', '库存');
const inventory = page.locator('.management-space--inventory');
if ((await inventory.locator('.inventory-management__tabs > button').count()) !== 3) {
  throw new Error('Inventory must expose Overview, City Warehouses and Nearby Villages tabs.');
}
if ((await inventory.locator('.inventory-resource-row:not(.inventory-resource-row--head)').count()) < 6) {
  throw new Error('Inventory overview must expose the city + village resource summary rows.');
}
await page.screenshot({ path: `${outDir}/54-inventory-overview.png` });

await inventory.getByRole('button', { name: '城市仓库', exact: true }).click();
if ((await inventory.locator('.inventory-location-list__body > button').count()) !== 4) {
  throw new Error('City warehouse view must expose four warehouse locations.');
}
if ((await inventory.locator('.inventory-content-list > div').count()) < 3) {
  throw new Error('Selected city warehouse must expose its actual stored resource breakdown.');
}
await page.screenshot({ path: `${outDir}/54-inventory-warehouses.png` });

await inventory.getByRole('button', { name: '周边村庄', exact: true }).click();
if ((await inventory.locator('.inventory-village-list > button').count()) !== 6) {
  throw new Error('Nearby village view must expose six specialty-resource villages.');
}
if ((await inventory.locator('.inventory-village-focus').count()) !== 1) {
  throw new Error('Selected village must expose exactly one specialty resource focus.');
}
await page.screenshot({ path: `${outDir}/54-inventory-villages.png` });

await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });
await openViaShortcut('军事值', '68', '.management-space--military', '军事');
await page.keyboard.press('Escape');
await page.waitForSelector('.management-space', { state: 'detached' });

await browser.close();
