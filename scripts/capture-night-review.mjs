import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

async function openWeather() {
  const url = new URL(baseUrl);
  url.searchParams.set('review', 'weather');
  await page.goto(url.toString(), { waitUntil: 'networkidle' });
  await page.waitForSelector('.gameplay-context-panel--weather');
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

await openWeather();

const screen = page.locator('.gameplay-screen');
const panel = page.locator('.gameplay-context-panel--weather');
const footer = panel.locator('.gameplay-context-panel__footer--weather-mode');

const sceneFooterBox = await footer.boundingBox();
if (!sceneFooterBox) throw new Error('Weather mode footer must be visible in scene simulation mode.');

await page.getByRole('button', { name: '跟随世界', exact: true }).click();
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-context-mode') === '跟随世界');
await page.waitForSelector('.weather-world-summary');
await page.waitForTimeout(120);

const followFooterBox = await footer.boundingBox();
if (!followFooterBox) throw new Error('Weather mode footer must stay visible in follow-world mode.');
if (Math.abs(sceneFooterBox.y - followFooterBox.y) > 1 || Math.abs(sceneFooterBox.x - followFooterBox.x) > 1) {
  throw new Error(`Weather footer must stay fixed while mode content changes. scene=${JSON.stringify(sceneFooterBox)} follow=${JSON.stringify(followFooterBox)}`);
}
await page.screenshot({ path: `${outDir}/34-weather-follow-world.png` });

await page.getByRole('button', { name: '场景模拟', exact: true }).click();
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-context-mode') === '场景模拟');
await page.waitForSelector('[aria-label="日内时间"]');

if ((await page.locator('.weather-preset-section__heading > span').count()) !== 0) {
  throw new Error('Weather preset heading must not repeat the current preset in helper text.');
}

await page.locator('.weather-wind-compass').waitFor();
await page.locator('.weather-time-track').waitFor();
await page.locator('.weather-season-track').waitFor();

const timeTrackArt = await page.locator('.weather-time-track__segments').evaluate((node) => getComputedStyle(node).backgroundImage);
if (!timeTrackArt.includes('weather-time-track.png')) {
  throw new Error(`Time-of-day control must use the art track texture. background=${timeTrackArt}`);
}
const glassTexture = await panel.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!glassTexture.includes('glass-noise-soft.png')) {
  throw new Error(`Weather glass must use the soft material texture. background=${glassTexture}`);
}

const windCompass = page.getByRole('slider', { name: '风向' });
const windBefore = Number(await windCompass.getAttribute('aria-valuenow'));
await windCompass.press('ArrowRight');
const windAfter = Number(await windCompass.getAttribute('aria-valuenow'));
if (windAfter !== (windBefore + 5) % 360) throw new Error(`Wind compass keyboard adjustment failed. before=${windBefore} after=${windAfter}`);
await windCompass.press('ArrowLeft');
await page.screenshot({ path: `${outDir}/37-weather-visual-controls.png` });

const dayTime = page.getByRole('slider', { name: '日内时间' });
await setRangeValue(dayTime, 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');

const nightBackground = await screen.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!nightBackground.includes('wanhu-gameplay-city-night.png')) {
  throw new Error(`Night scene must use the dedicated night background. background=${nightBackground}`);
}

const clock = (await page.locator('.gameplay-top-status__clock').textContent())?.trim() ?? '';
if (!clock.includes('22:00')) throw new Error(`Top HUD clock must follow the weather-panel day time. clock=${clock}`);

await page.screenshot({ path: `${outDir}/35-weather-night.png` });

await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await page.waitForTimeout(120);
await page.screenshot({ path: `${outDir}/36-gameplay-night.png` });

await page.getByRole('button', { name: '天气控制', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 14.5);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'day');

const dayBackground = await screen.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!dayBackground.includes('wanhu-gameplay-city.png') || dayBackground.includes('night')) {
  throw new Error(`Day scene must restore the original gameplay background. background=${dayBackground}`);
}

await browser.close();
