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
const dayTime = page.getByRole('slider', { name: '日内时间' });

// Web prototype only: moving the scene-preview time into the night range hard-switches the background asset.
await setRangeValue(dayTime, 22);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'night');

const nightBackground = await screen.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!nightBackground.includes('wanhu-gameplay-city-night.png')) {
  throw new Error(`Night scene must use the dedicated night background. background=${nightBackground}`);
}

const clock = (await page.locator('.gameplay-top-status__clock').textContent())?.trim() ?? '';
if (!clock.includes('22:00')) throw new Error(`Top HUD clock must follow the weather-panel day time. clock=${clock}`);

await page.screenshot({ path: `${outDir}/35-weather-night.png` });

// Review the normal Gameplay HUD against the same night scene, without the Weather panel covering the left side.
await page.getByRole('button', { name: '关闭面板', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather', { state: 'detached' });
await page.waitForTimeout(120);
await page.screenshot({ path: `${outDir}/36-gameplay-night.png` });

// Switching back to daytime must restore the original gameplay background with no transition layer/state machine.
await page.getByRole('button', { name: '天气控制', exact: true }).click();
await page.waitForSelector('.gameplay-context-panel--weather');
await setRangeValue(page.getByRole('slider', { name: '日内时间' }), 14.5);
await page.waitForFunction(() => document.querySelector('.gameplay-screen')?.getAttribute('data-time-of-day') === 'day');

const dayBackground = await screen.evaluate((node) => getComputedStyle(node).backgroundImage);
if (!dayBackground.includes('wanhu-gameplay-city.png') || dayBackground.includes('night')) {
  throw new Error(`Day scene must restore the original gameplay background. background=${dayBackground}`);
}

await browser.close();
