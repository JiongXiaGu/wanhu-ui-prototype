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
async function setRangeValue(locator, value) {
  await locator.evaluate((node, nextValue) => {
    const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
    descriptor?.set?.call(node, String(nextValue));
    node.dispatchEvent(new Event('input', { bubbles: true }));
    node.dispatchEvent(new Event('change', { bubbles: true }));
  }, value);
}

await open('load', '.archive-space--load');
const load = page.locator('.archive-space--load');
const loadBg = await load.evaluate((node) => getComputedStyle(node).backgroundImage);
if (loadBg.includes('wanhu-gameplay-city') || loadBg.includes('wanhu-main-menu')) throw new Error('Load must inherit parent scene artwork instead of owning a background image.');
if (!loadBg.includes('glass-noise-soft.png')) throw new Error('Load must consume shared Global Space material noise.');
if ((await page.locator('.archive-column-heading > span').count()) !== 0) throw new Error('Load must not show redundant game-group counts.');
if ((await page.locator('.archive-hide-outdated .ui-toggle').count()) !== 1) throw new Error('Load hide-outdated control must use shared ToggleSwitch.');
if ((await page.locator('.archive-hide-outdated > i').count()) !== 0) throw new Error('Legacy Archive toggle DOM must be removed.');
const groupRadius = Number.parseFloat(await page.locator('.archive-group-card').first().evaluate((node) => getComputedStyle(node).borderRadius));
const saveRadius = Number.parseFloat(await page.locator('.archive-save-card').first().evaluate((node) => getComputedStyle(node).borderRadius));
if (groupRadius < 8 || saveRadius < 8) throw new Error(`Archive cards must use the shared rounded language. group=${groupRadius} save=${saveRadius}`);
await page.screenshot({ path: `${outDir}/load-default.png` });

await page.locator('.archive-group-card').nth(1).click();
await page.waitForTimeout(100);
await page.screenshot({ path: `${outDir}/load-selected-group.png` });

await page.getByRole('button', { name: '手动存档', exact: true }).click();
if ((await page.locator('.archive-save-card[data-save-kind="manual"]').count()) === 0) throw new Error('Manual filter must expose manual saves.');
await page.screenshot({ path: `${outDir}/load-filter-manual.png` });

await open('load', '.archive-space--load');
const incompatible = page.locator('.archive-save-card.is-incompatible').first();
await incompatible.scrollIntoViewIfNeeded();
await incompatible.hover();
if (!(await incompatible.getAttribute('class'))?.includes('is-incompatible')) throw new Error('Load review requires an incompatible save.');
await page.screenshot({ path: `${outDir}/load-incompatible.png` });

const autoType = page.locator('.archive-save-card__type.is-auto').first();
const manualType = page.locator('.archive-save-card__type.is-manual').first();
if ((await autoType.count()) && (await manualType.count())) {
  const colors = await Promise.all([autoType, manualType].map((locator) => locator.evaluate((node) => getComputedStyle(node).color)));
  if (colors[0] !== colors[1]) throw new Error(`Save types are metadata and must share one neutral tone. colors=${JSON.stringify(colors)}`);
}

const renameCard = page.locator('.archive-save-card').nth(1);
await renameCard.hover();
await renameCard.getByRole('button', { name: /^重命名 / }).click();
await page.getByRole('dialog', { name: '重命名存档' }).waitFor();
await page.screenshot({ path: `${outDir}/load-rename-dialog.png` });
await page.keyboard.press('Escape');

await renameCard.hover();
await renameCard.getByRole('button', { name: /^删除 / }).click();
await page.getByRole('dialog', { name: '删除存档？' }).waitFor();
await page.screenshot({ path: `${outDir}/load-delete-dialog.png` });
await page.keyboard.press('Escape');

await page.getByRole('button', { name: '删除存档组', exact: true }).click();
await page.getByRole('dialog').filter({ has: page.getByText(/删除“.*”存档组/) }).waitFor();
await page.screenshot({ path: `${outDir}/load-group-delete-dialog.png` });
await page.keyboard.press('Escape');

// Pause Save must consume the same shell without replacing the current scene.
await open('pause-save', '.save-game-space');
const saveSpace = page.locator('.save-game-space');
const saveBg = await saveSpace.evaluate((node) => getComputedStyle(node).backgroundImage);
if (saveBg.includes('wanhu-gameplay-city') || saveBg.includes('wanhu-main-menu')) throw new Error('Save must not own scene artwork.');
if ((await saveSpace.locator('.archive-hide-outdated .ui-toggle').count()) !== 1) throw new Error('Save hide-outdated must use shared ToggleSwitch.');
await page.screenshot({ path: `${outDir}/save-global-day.png` });

// Real night world -> Pause -> Save.
await open('weather', '.gameplay-context-panel--weather');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await page.keyboard.press('Escape');
await page.waitForSelector('.pause-command-surface');
await page.getByRole('button', { name: '保存游戏', exact: true }).click();
await page.waitForSelector('.save-game-space');
if ((await page.locator('.gameplay-screen').getAttribute('data-time-of-day')) !== 'night') throw new Error('Pause Save must preserve the current night gameplay state.');
const nightSaveBg = await page.locator('.save-game-space').evaluate((node) => getComputedStyle(node).backgroundImage);
if (nightSaveBg.includes('wanhu-gameplay-city') || nightSaveBg.includes('wanhu-main-menu')) throw new Error('Night Save must inherit parent scene artwork.');
await page.screenshot({ path: `${outDir}/save-global-night.png` });

await browser.close();
