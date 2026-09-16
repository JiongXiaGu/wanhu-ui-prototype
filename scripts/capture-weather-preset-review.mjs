import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';

const baseUrl = process.env.REVIEW_BASE_URL || 'http://127.0.0.1:4173';
const outDir = 'review-screenshots';
await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });

const url = new URL(baseUrl);
url.searchParams.set('review', 'weather');
await page.goto(url.toString(), { waitUntil: 'networkidle' });

const panel = page.locator('.gameplay-context-panel--weather');
await panel.waitFor();
await page.waitForTimeout(160);

if ((await panel.getAttribute('data-weather-preset')) !== 'cloudy') {
  throw new Error('Weather review should start from the cloudy preset.');
}

await page.getByRole('button', { name: '大雨天气预设', exact: true }).click();
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-weather-preset') === 'heavy-rain');

const expected = new Map([
  ['云量', '94'],
  ['降水强度', '78'],
  ['积雪量', '0'],
  ['雾量', '22'],
  ['风向', '165'],
  ['风力', '2'],
  ['阵风', '0.65'],
]);

for (const [name, value] of expected) {
  const actual = await page.getByRole('slider', { name, exact: true }).inputValue();
  if (Number(actual) !== Number(value)) {
    throw new Error(`Preset did not update ${name}. expected=${value} actual=${actual}`);
  }
}

const heavyRainCard = page.getByRole('button', { name: '大雨天气预设', exact: true });
if ((await heavyRainCard.getAttribute('aria-pressed')) !== 'true') {
  throw new Error('Heavy-rain preset card should communicate the active preset without redundant helper text.');
}
if ((await page.locator('.weather-preset-section__heading > span').count()) !== 0) {
  throw new Error('Weather preset heading must not repeat the selected preset in helper text.');
}

await page.screenshot({ path: `${outDir}/10-weather-preset-heavy-rain.png` });

await page.getByRole('slider', { name: '云量', exact: true }).evaluate((node) => {
  const descriptor = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value');
  descriptor?.set?.call(node, '90');
  node.dispatchEvent(new Event('input', { bubbles: true }));
  node.dispatchEvent(new Event('change', { bubbles: true }));
});
await page.waitForFunction(() => document.querySelector('.gameplay-context-panel--weather')?.getAttribute('data-weather-preset-modified') === 'true');
if ((await panel.getAttribute('data-weather-preset')) !== 'heavy-rain') {
  throw new Error('Manual adjustment should preserve the originating preset id.');
}

await browser.close();
